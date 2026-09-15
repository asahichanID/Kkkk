/**
 * RPG Combat Engine
 * Server-authoritative combat, damage calculation, projectile tracking, and destruction trigger.
 */

import { SKILLS } from '../skills/skills.js';

export class CombatEngine {
	constructor(worldManager) {
		this.world = worldManager;
		this.activeProjectiles = [];
		this.projectileIdCounter = 1;
		this.combatEvents = []; // List of recent combat events to broadcast
	}

	executeSkill(player, skillId, targetPos, allPlayers) {
		const now = Date.now();
		const skill = SKILLS[skillId];
		if (!skill) return { success: false, reason: 'Skill tidak ditemukan' };

		// Cooldown check
		const lastUse = player.cooldowns.get(skillId) || 0;
		if (now - lastUse < skill.cd) {
			return { success: false, reason: 'Skill sedang cooldown' };
		}

		// MP Cost check
		if (player.mp < skill.mpCost) {
			return { success: false, reason: 'MP tidak mencukupi' };
		}

		// Fox tier requirement check
		if (skillId === 'fox_tail_4' && player.foxTier < 4) {
			return { success: false, reason: 'Membutuhkan Ekor 4' };
		}
		if (skillId === 'fox_tail_7' && player.foxTier < 7) {
			return { success: false, reason: 'Membutuhkan Ekor 7' };
		}
		if (skillId === 'fox_tail_11' && player.foxTier < 11) {
			return { success: false, reason: 'Membutuhkan Ekor 11' };
		}

		// Deduct MP & set cooldown
		player.mp -= skill.mpCost;
		player.cooldowns.set(skillId, now);

		const result = skill.execute(player, targetPos);

		// Handle Dodge/Dash
		if (result.dash) {
			player.x += result.dash.vx * 3;
			player.y += result.dash.vy * 3;
			player.invulnerableUntil = now + result.dash.invulnerableMs;
			this.combatEvents.push({
				type: 'dash',
				playerId: player.id,
				mapId: player.mapId,
				x: player.x,
				y: player.y
			});
			return { success: true };
		}

		// Handle AOE
		if (result.aoe) {
			this.processAoe(player, result.aoe, allPlayers);
		}

		// Handle AOE Steps (e.g. Mega Beam)
		if (result.aoeSteps) {
			for (const step of result.aoeSteps) {
				this.processAoe(player, step, allPlayers);
			}
		}

		// Handle Mega Beam Visual
		if (result.megaBeam) {
			this.combatEvents.push({
				type: 'megaBeam',
				playerId: player.id,
				mapId: player.mapId,
				beam: result.megaBeam,
				shake: result.shakeIntensity || 20
			});
		}

		// Handle Single Projectile
		if (result.projectile) {
			this.spawnProjectile(player, result.projectile);
		}

		// Handle Multiple Projectiles (e.g. Arrow Storm, Fox Orb Barrage)
		if (result.projectiles) {
			for (const p of result.projectiles) {
				this.spawnProjectile(player, p);
			}
		}

		return { success: true, skillId };
	}

	spawnProjectile(player, pData) {
		this.activeProjectiles.push({
			id: this.projectileIdCounter++,
			ownerId: player.id,
			mapId: player.mapId,
			x: pData.x,
			y: pData.y,
			startX: pData.x,
			startY: pData.y,
			vx: pData.vx,
			vy: pData.vy,
			radius: pData.radius || 12,
			maxDistance: pData.maxDistance || 400,
			damageMult: pData.damageMult || 1.0,
			type: pData.type || 'physical',
			destructionPower: pData.destructionPower || 50,
			particle: pData.particle || 'bullet'
		});
	}

	processAoe(player, aoe, allPlayers) {
		const mapId = player.mapId;
		const baseDmg = player.atk * aoe.damageMult;

		// 1. Damage Monsters in radius
		const monsters = this.world.getMonsters(mapId);
		for (const mob of monsters) {
			const dist = Math.hypot(mob.x - aoe.x, mob.y - aoe.y);
			if (dist <= aoe.radius + mob.radius) {
				const dmg = Math.max(1, Math.round(baseDmg - mob.def * 0.35));
				mob.hp -= dmg;
				this.combatEvents.push({
					type: 'damageText',
					mapId,
					x: mob.x,
					y: mob.y - 20,
					text: `-${dmg}`,
					color: aoe.type === 'magic' ? '#c084fc' : '#f87171'
				});

				if (mob.hp <= 0) {
					this.handleMonsterDeath(player, mob);
				}
			}
		}

		// 2. Damage Destructible structures
		const destructibles = this.world.getDestructibles(mapId);
		for (const d of destructibles) {
			if (d.state === 'destroyed') continue;
			// Center of bounding box
			const cx = d.x + d.w / 2;
			const cy = d.y + d.h / 2;
			const dist = Math.hypot(cx - aoe.x, cy - aoe.y);
			if (dist <= aoe.radius + Math.max(d.w, d.h) / 2) {
				const structDmg = Math.round((aoe.destructionPower || baseDmg) * 1.5);
				const res = this.world.damageDestructible(mapId, d.id, structDmg);
				if (res) {
					this.combatEvents.push({
						type: 'destruction',
						mapId,
						objId: d.id,
						x: cx,
						y: cy,
						state: res.state,
						particle: 'rubble_explosion'
					});
				}
			}
		}

		// 3. Emit AOE effect event
		this.combatEvents.push({
			type: 'aoeEffect',
			mapId,
			x: aoe.x,
			y: aoe.y,
			radius: aoe.radius,
			particle: aoe.particle
		});
	}

	handleMonsterDeath(player, mob) {
		mob.isDead = true;
		mob.respawnTime = Date.now() + (mob.isBoss ? 45000 : 15000);

		// Reward player
		const leveledUp = player.gainExp(mob.exp);
		player.gold += mob.gold;
		player.foxSoul = Math.min(player.maxFoxSoul, player.foxSoul + mob.soul);

		// Check Fox Tier Ascension
		if (!player.isOwner) {
			if (player.foxTier < 4 && player.level >= 4 && player.foxSoul >= 60) {
				player.foxTier = 4;
				player.foxActive = true;
				player.recalculateStats();
			} else if (player.foxTier < 7 && player.level >= 8 && player.foxSoul >= 150) {
				player.foxTier = 7;
				player.foxActive = true;
				player.recalculateStats();
			} else if (player.foxTier < 11 && player.level >= 15 && player.foxSoul >= 400) {
				player.foxTier = 11;
				player.foxActive = true;
				player.recalculateStats();
			}
		}

		this.combatEvents.push({
			type: 'monsterDeath',
			mapId: mob.mapId,
			mobId: mob.id,
			x: mob.x,
			y: mob.y,
			reward: { exp: mob.exp, gold: mob.gold, soul: mob.soul, leveledUp }
		});
	}

	tick(players) {
		const nextProjectiles = [];

		for (const p of this.activeProjectiles) {
			p.x += p.vx;
			p.y += p.vy;

			const traveled = Math.hypot(p.x - p.startX, p.y - p.startY);
			if (traveled > p.maxDistance) continue; // Expired

			const player = players.get(p.ownerId);
			if (!player) continue;

			let hit = false;
			const monsters = this.world.getMonsters(p.mapId);

			// Check hit on monsters
			for (const mob of monsters) {
				const dist = Math.hypot(mob.x - p.x, mob.y - p.y);
				if (dist <= p.radius + mob.radius) {
					hit = true;
					const dmg = Math.max(1, Math.round(player.atk * p.damageMult - mob.def * 0.3));
					mob.hp -= dmg;

					this.combatEvents.push({
						type: 'damageText',
						mapId: p.mapId,
						x: mob.x,
						y: mob.y - 20,
						text: `-${dmg}`,
						color: p.type === 'magic' ? '#c084fc' : '#fbbf24'
					});

					if (mob.hp <= 0) {
						this.handleMonsterDeath(player, mob);
					}
					break;
				}
			}

			// Check hit on destructibles
			if (!hit) {
				const destructibles = this.world.getDestructibles(p.mapId);
				for (const d of destructibles) {
					if (d.state === 'destroyed') continue;
					if (p.x >= d.x && p.x <= d.x + d.w && p.y >= d.y && p.y <= d.y + d.h) {
						hit = true;
						const structDmg = Math.round(p.destructionPower * 1.2);
						const res = this.world.damageDestructible(p.mapId, d.id, structDmg);
						if (res) {
							this.combatEvents.push({
								type: 'destruction',
								mapId: p.mapId,
								objId: d.id,
								x: d.x + d.w / 2,
								y: d.y + d.h / 2,
								state: res.state,
								particle: 'rubble_explosion'
							});
						}
						break;
					}
				}
			}

			if (!hit) {
				nextProjectiles.push(p);
			}
		}

		this.activeProjectiles = nextProjectiles;
	}

	flushEvents() {
		const events = this.combatEvents;
		this.combatEvents = [];
		return events;
	}
}
