/**
 * RPG World Manager
 * Mengelola peta, portal, objek destruksi, dan monster di tiap wilayah.
 */

import { MAPS } from '../data/maps.js';
import { DESTRUCTIBLE_TYPES } from '../data/constants.js';
import { MONSTER_TEMPLATES } from '../data/npcs.js';

export class WorldManager {
	constructor() {
		this.maps = {};
		this.destructibles = new Map(); // key: mapId_objId -> object state
		this.monsters = new Map(); // key: id -> monster state
		this.monsterIdCounter = 1;
		this.init();
	}

	init() {
		// Inisialisasi tiap map & destructible objects
		for (const [mapId, mapData] of Object.entries(MAPS)) {
			this.maps[mapId] = {
				...mapData,
				players: new Set(),
				monsters: new Set()
			};

			// Setup destructible structures
			if (mapData.destructibles) {
				for (const d of mapData.destructibles) {
					const def = DESTRUCTIBLE_TYPES[d.type] || { maxHp: 300, respawnMs: 30000, name: 'Struktur' };
					const key = `${mapId}_${d.id}`;
					this.destructibles.set(key, {
						id: d.id,
						mapId,
						type: d.type,
						name: def.name,
						x: d.x,
						y: d.y,
						w: d.w,
						h: d.h,
						hp: def.maxHp,
						maxHp: def.maxHp,
						state: 'normal', // 'normal' | 'cracked' | 'destroyed'
						respawnMs: def.respawnMs,
						destroyedAt: null
					});
				}
			}

			// Spawn initial monsters if not safe zone
			if (!mapData.safeZone) {
				this.spawnInitialMonsters(mapId);
			}
		}
	}

	spawnInitialMonsters(mapId) {
		const map = this.maps[mapId];
		if (!map) return;

		let types = [];
		let count = 8;
		if (mapId === 'whispering_forest') {
			types = ['slime', 'goblin', 'shadow_wolf'];
			count = 14;
		} else if (mapId === 'crumbling_ruins') {
			types = ['shadow_wolf', 'ruins_golem'];
			count = 12;
		} else if (mapId === 'abyssal_rift') {
			types = ['ruins_golem', 'abyss_lord'];
			count = 10;
		}

		for (let i = 0; i < count; i++) {
			const typeKey = types[i % types.length];
			const tpl = MONSTER_TEMPLATES[typeKey] || MONSTER_TEMPLATES.slime;
			const id = `mob_${mapId}_${this.monsterIdCounter++}`;
			const x = 200 + Math.random() * (map.width - 400);
			const y = 200 + Math.random() * (map.height - 400);

			const monster = {
				id,
				mapId,
				type: typeKey,
				name: tpl.name,
				x,
				y,
				startX: x,
				startY: y,
				hp: tpl.maxHp,
				maxHp: tpl.maxHp,
				atk: tpl.atk,
				def: tpl.def,
				spd: tpl.spd,
				exp: tpl.exp,
				gold: tpl.gold,
				soul: tpl.soul,
				color: tpl.color,
				avatar: tpl.avatar,
				radius: tpl.radius,
				isBoss: !!tpl.isBoss,
				state: 'idle',
				targetPlayerId: null,
				lastAttack: 0,
				attackCd: 1200,
				isDead: false,
				respawnTime: 0
			};

			this.monsters.set(id, monster);
			map.monsters.add(id);
		}
	}

	// Update loop for monster AI & structure repairs
	tick(now, players) {
		// 1. Auto-rebuild destroyed structures
		for (const [key, dest] of this.destructibles.entries()) {
			if (dest.state === 'destroyed' && dest.destroyedAt) {
				if (now - dest.destroyedAt >= dest.respawnMs) {
					dest.state = 'normal';
					dest.hp = dest.maxHp;
					dest.destroyedAt = null;
				}
			}
		}

		// 2. Monster AI & Respawn
		for (const [id, mob] of this.monsters.entries()) {
			if (mob.isDead) {
				if (now >= mob.respawnTime) {
					mob.isDead = false;
					mob.hp = mob.maxHp;
					mob.x = mob.startX + (Math.random() * 80 - 40);
					mob.y = mob.startY + (Math.random() * 80 - 40);
					mob.state = 'idle';
					mob.targetPlayerId = null;
				}
				continue;
			}

			// Cari pemain terdekat dalam radius aggro (320px)
			let nearestPlayer = null;
			let nearestDist = 320;

			for (const p of players.values()) {
				if (p.mapId !== mob.mapId || p.hp <= 0) continue;
				const dist = Math.hypot(p.x - mob.x, p.y - mob.y);
				if (dist < nearestDist) {
					nearestDist = dist;
					nearestPlayer = p;
				}
			}

			if (nearestPlayer) {
				mob.state = 'chase';
				mob.targetPlayerId = nearestPlayer.id;
				const angle = Math.atan2(nearestPlayer.y - mob.y, nearestPlayer.x - mob.x);

				if (nearestDist > 38) {
					mob.x += Math.cos(angle) * mob.spd;
					mob.y += Math.sin(angle) * mob.spd;
				} else {
					// Monster attack
					if (now - mob.lastAttack >= mob.attackCd) {
						mob.lastAttack = now;
						const rawDmg = Math.max(8, mob.atk - Math.floor(nearestPlayer.def * 0.45));
						nearestPlayer.takeDamage(rawDmg, mob.name);
					}
				}
			} else {
				// Random wander near startX, startY
				if (Math.random() < 0.03) {
					const distFromHome = Math.hypot(mob.x - mob.startX, mob.y - mob.startY);
					if (distFromHome > 150) {
						const homeAngle = Math.atan2(mob.startY - mob.y, mob.startX - mob.x);
						mob.x += Math.cos(homeAngle) * mob.spd * 0.7;
						mob.y += Math.sin(homeAngle) * mob.spd * 0.7;
					} else {
						const randAngle = Math.random() * Math.PI * 2;
						mob.x += Math.cos(randAngle) * (mob.spd * 0.6);
						mob.y += Math.sin(randAngle) * (mob.spd * 0.6);
					}
				}
			}
		}
	}

	damageDestructible(mapId, objId, damage) {
		const key = `${mapId}_${objId}`;
		const obj = this.destructibles.get(key);
		if (!obj || obj.state === 'destroyed') return null;

		obj.hp -= damage;
		if (obj.hp <= 0) {
			obj.hp = 0;
			obj.state = 'destroyed';
			obj.destroyedAt = Date.now();
			return { state: 'destroyed', obj };
		} else if (obj.hp < obj.maxHp * 0.5) {
			obj.state = 'cracked';
			return { state: 'cracked', obj };
		}
		return { state: 'damaged', obj };
	}

	getMap(mapId) {
		return this.maps[mapId] || this.maps.valoria_city;
	}

	getDestructibles(mapId) {
		const list = [];
		for (const obj of this.destructibles.values()) {
			if (obj.mapId === mapId) list.push(obj);
		}
		return list;
	}

	getMonsters(mapId) {
		const list = [];
		for (const mob of this.monsters.values()) {
			if (mob.mapId === mapId && !mob.isDead) list.push(mob);
		}
		return list;
	}
}
