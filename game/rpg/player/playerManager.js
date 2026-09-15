/**
 * RPG Player Manager & Persistence
 * Mengelola state pemain, level, EXP, HP, MP, inventaris, status Fox Power, dan persistensi.
 */

import fs from 'fs';
import path from 'path';
import { CLASSES, NATIONS, FOX_POWER } from '../data/constants.js';

const DB_DIR = path.join(process.cwd(), 'OguriCap', 'database');
const DB_FILE = path.join(DB_DIR, 'rpg_players.json');

export class Player {
	constructor(data = {}) {
		this.id = data.id || `p_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
		this.name = (data.name || 'Petualang').trim();
		this.classType = data.classType || 'knight'; // knight | archer | mage
		this.nation = data.nation || 'VALORIA';
		this.race = data.race || 'Human';

		const cls = CLASSES[this.classType.toUpperCase()] || CLASSES.KNIGHT;
		this.level = data.level || 1;
		this.exp = data.exp || 0;
		this.maxExp = this.calcMaxExp(this.level);
		this.gold = data.gold !== undefined ? data.gold : 150;

		// Stats
		this.baseHp = cls.baseHp + (this.level - 1) * 35;
		this.baseMp = cls.baseMp + (this.level - 1) * 20;
		this.baseAtk = cls.baseAtk + (this.level - 1) * 6;
		this.baseDef = cls.baseDef + (this.level - 1) * 4;
		this.baseSpd = cls.baseSpd;

		this.maxHp = this.baseHp;
		this.maxMp = this.baseMp;
		this.hp = data.hp !== undefined ? data.hp : this.maxHp;
		this.mp = data.mp !== undefined ? data.mp : this.maxMp;
		this.atk = this.baseAtk;
		this.def = this.baseDef;
		this.spd = this.baseSpd;

		// Position & Movement
		this.mapId = data.mapId || (this.nation === 'VALORIA' ? 'valoria_city' : 'fangheim_fortress');
		this.x = data.x !== undefined ? data.x : 700;
		this.y = data.y !== undefined ? data.y : 600;
		this.vx = 0;
		this.vy = 0;
		this.facing = data.facing || 'down';

		// Fox Power (Ekor 4 -> 7 -> 11)
		this.isOwner = !!data.isOwner;
		this.foxTier = this.isOwner ? 11 : (data.foxTier || 0);
		this.foxActive = this.isOwner ? true : !!data.foxActive;
		this.foxSoul = data.foxSoul !== undefined ? data.foxSoul : (this.isOwner ? 500 : 20);
		this.maxFoxSoul = 500;

		// Inventory & Quests
		this.inventory = data.inventory || [
			{ id: 'item_hp_potion', name: 'Potion HP Menengah', count: 3 },
			{ id: 'item_mp_potion', name: 'Elixir MP Murni', count: 2 }
		];
		this.activeQuests = data.activeQuests || [];
		this.completedQuests = data.completedQuests || [];

		// Cooldowns
		this.cooldowns = new Map();
		this.invulnerableUntil = 0;
		this.lastCombatAction = 0;
		this.lastRegen = Date.now();

		this.recalculateStats();
	}

	calcMaxExp(lvl) {
		return Math.floor(100 * Math.pow(1.35, lvl - 1));
	}

	setOwner(isOwner) {
		this.isOwner = isOwner;
		if (isOwner) {
			this.foxTier = 11;
			this.foxActive = true;
			this.foxSoul = this.maxFoxSoul;
			this.recalculateStats();
		}
	}

	recalculateStats() {
		const cls = CLASSES[this.classType.toUpperCase()] || CLASSES.KNIGHT;
		let hpBonus = 1.0;
		let mpBonus = 1.0;
		let atkBonus = 1.0;
		let defBonus = 1.0;
		let spdBonus = 1.0;

		// Nation bonus
		if (this.nation === 'VALORIA') {
			mpBonus *= 1.25;
		} else if (this.nation === 'FANGHEIM') {
			hpBonus *= 1.25;
			atkBonus *= 1.20;
		}

		// Fox Power passive
		if (this.foxActive && this.foxTier > 0) {
			if (this.foxTier >= 11) {
				const p = FOX_POWER.TAIL_11.passive;
				spdBonus *= p.spdMult;
				atkBonus *= p.atkMult;
				defBonus *= p.defMult;
			} else if (this.foxTier >= 7) {
				const p = FOX_POWER.TAIL_7.passive;
				spdBonus *= p.spdMult;
				atkBonus *= p.atkMult;
				defBonus *= p.defMult;
			} else if (this.foxTier >= 4) {
				const p = FOX_POWER.TAIL_4.passive;
				spdBonus *= p.spdMult;
				atkBonus *= p.atkMult;
			}
		}

		this.maxHp = Math.round((cls.baseHp + (this.level - 1) * 35) * hpBonus);
		this.maxMp = Math.round((cls.baseMp + (this.level - 1) * 20) * mpBonus);
		this.atk = Math.round((cls.baseAtk + (this.level - 1) * 6) * atkBonus);
		this.def = Math.round((cls.baseDef + (this.level - 1) * 4) * defBonus);
		this.spd = parseFloat(((cls.baseSpd + (this.level - 1) * 0.1) * spdBonus).toFixed(2));
	}

	gainExp(amount) {
		this.exp += amount;
		let leveledUp = false;
		while (this.exp >= this.maxExp) {
			this.exp -= this.maxExp;
			this.level++;
			this.maxExp = this.calcMaxExp(this.level);
			leveledUp = true;
		}
		if (leveledUp) {
			this.recalculateStats();
			this.hp = this.maxHp;
			this.mp = this.maxMp;
		}
		return leveledUp;
	}

	takeDamage(amount, sourceName = 'Musuh') {
		const now = Date.now();
		if (now < this.invulnerableUntil) return 0;

		const actualDamage = Math.max(1, amount);
		this.hp = Math.max(0, this.hp - actualDamage);
		this.lastCombatAction = now;

		if (this.hp <= 0) {
			this.die();
		}
		return actualDamage;
	}

	die() {
		// Respawn in safe capital
		this.mapId = this.nation === 'VALORIA' ? 'valoria_city' : 'fangheim_fortress';
		this.x = 700;
		this.y = 600;
		this.hp = Math.floor(this.maxHp * 0.5);
		this.mp = Math.floor(this.maxMp * 0.5);
	}

	tick(now) {
		// Natural Regen every 1.5 seconds
		if (now - this.lastRegen >= 1500) {
			this.lastRegen = now;
			let hpRegen = 4 + Math.floor(this.level * 1.5);
			let mpRegen = 6 + Math.floor(this.level * 2.0);

			if (this.foxActive && this.foxTier > 0) {
				if (this.foxTier >= 11) hpRegen += FOX_POWER.TAIL_11.passive.hpRegen;
				else if (this.foxTier >= 7) hpRegen += FOX_POWER.TAIL_7.passive.hpRegen;
				else if (this.foxTier >= 4) hpRegen += FOX_POWER.TAIL_4.passive.hpRegen;
			}

			if (this.hp > 0 && this.hp < this.maxHp) {
				this.hp = Math.min(this.maxHp, this.hp + hpRegen);
			}
			if (this.mp < this.maxMp) {
				this.mp = Math.min(this.maxMp, this.mp + mpRegen);
			}
		}
	}

	toJSON() {
		return {
			id: this.id,
			name: this.name,
			classType: this.classType,
			nation: this.nation,
			race: this.race,
			level: this.level,
			exp: this.exp,
			maxExp: this.maxExp,
			gold: this.gold,
			hp: this.hp,
			maxHp: this.maxHp,
			mp: this.mp,
			maxMp: this.maxMp,
			atk: this.atk,
			def: this.def,
			spd: this.spd,
			mapId: this.mapId,
			x: Math.round(this.x),
			y: Math.round(this.y),
			facing: this.facing,
			isOwner: this.isOwner,
			foxTier: this.foxTier,
			foxActive: this.foxActive,
			foxSoul: this.foxSoul,
			maxFoxSoul: this.maxFoxSoul,
			inventory: this.inventory,
			activeQuests: this.activeQuests
		};
	}
}

export class PlayerManager {
	constructor() {
		this.activePlayers = new Map(); // id -> Player instance
		this.loadPersistentData();
	}

	loadPersistentData() {
		try {
			if (!fs.existsSync(DB_DIR)) {
				fs.mkdirSync(DB_DIR, { recursive: true });
			}
			if (fs.existsSync(DB_FILE)) {
				const raw = fs.readFileSync(DB_FILE, 'utf-8');
				this.savedData = JSON.parse(raw);
			} else {
				this.savedData = {};
			}
		} catch (e) {
			this.savedData = {};
		}
	}

	savePersistentData() {
		try {
			if (!fs.existsSync(DB_DIR)) {
				fs.mkdirSync(DB_DIR, { recursive: true });
			}
			for (const p of this.activePlayers.values()) {
				this.savedData[p.name.toLowerCase()] = p.toJSON();
			}
			fs.writeFileSync(DB_FILE, JSON.stringify(this.savedData, null, 2), 'utf-8');
		} catch (e) {
			// ignore save errors
		}
	}

	getOrCreatePlayer(name, isOwner = false, preferredClass = null) {
		const cleanName = (name || 'Petualang').trim();
		const key = cleanName.toLowerCase();

		let player = this.activePlayers.get(key);
		if (!player) {
			const saved = this.savedData[key];
			if (saved) {
				player = new Player(saved);
			} else {
				// Random balanced class from 3 archetypes: knight, archer, mage
				const classes = ['knight', 'archer', 'mage'];
				const pickedClass = preferredClass || classes[Math.floor(Math.random() * classes.length)];
				// Random nation: 50% Valoria, 50% Fangheim
				const nation = Math.random() < 0.5 ? 'VALORIA' : 'FANGHEIM';
				const race = nation === 'VALORIA' ? (Math.random() < 0.8 ? 'Human' : 'Beastkin') : (Math.random() < 0.8 ? 'Beastkin' : 'Human');

				player = new Player({
					name: cleanName,
					classType: pickedClass,
					nation,
					race,
					isOwner
				});
			}

			if (isOwner) {
				player.setOwner(true);
			}

			this.activePlayers.set(player.id, player);
			this.activePlayers.set(key, player);
		}

		if (isOwner && player.foxTier < 11) {
			player.setOwner(true);
		}

		return player;
	}

	removePlayer(playerId) {
		const player = this.activePlayers.get(playerId);
		if (player) {
			this.savedData[player.name.toLowerCase()] = player.toJSON();
			this.activePlayers.delete(playerId);
			this.activePlayers.delete(player.name.toLowerCase());
			this.savePersistentData();
		}
	}
}
