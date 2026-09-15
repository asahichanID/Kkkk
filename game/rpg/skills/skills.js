/**
 * RPG Skills Definition
 * Skill Pedang, Busur, Sihir, Dodge, dan Spesial Fox Power (Ekor 4, 7, 11).
 */

export const SKILLS = {
	// ================= BASIC ATTACK =================
	basic_attack: {
		id: 'basic_attack',
		name: 'Serangan Dasar',
		cd: 400,
		mpCost: 0,
		range: 75,
		execute(player, targetPos) {
			const angle = Math.atan2(targetPos.y - player.y, targetPos.x - player.x);
			let projectile = null;
			let aoe = null;

			if (player.classType === 'knight') {
				// Melee cone slash
				aoe = {
					x: player.x + Math.cos(angle) * 45,
					y: player.y + Math.sin(angle) * 45,
					radius: 55,
					damageMult: 1.0,
					type: 'physical',
					particle: 'slash'
				};
			} else if (player.classType === 'archer') {
				// Ranged piercing arrow projectile
				projectile = {
					x: player.x,
					y: player.y,
					vx: Math.cos(angle) * 11,
					vy: Math.sin(angle) * 11,
					radius: 12,
					maxDistance: 450,
					damageMult: 1.0,
					type: 'physical',
					particle: 'arrow'
				};
			} else {
				// Mage magic orb projectile
				projectile = {
					x: player.x,
					y: player.y,
					vx: Math.cos(angle) * 9,
					vy: Math.sin(angle) * 9,
					radius: 16,
					maxDistance: 420,
					damageMult: 1.15,
					type: 'magic',
					particle: 'sparkle'
				};
			}

			return { aoe, projectile };
		}
	},

	// ================= SWORD SKILL (KNIGHT) =================
	sword_special: {
		id: 'sword_special',
		name: 'Penebas Badai (Sonic Blade Whirlwind)',
		cd: 4500,
		mpCost: 25,
		range: 90,
		execute(player) {
			return {
				aoe: {
					x: player.x,
					y: player.y,
					radius: 110,
					damageMult: 2.4,
					type: 'physical',
					destructionPower: 120,
					particle: 'blade_vortex'
				}
			};
		}
	},

	// ================= BOW SKILL (ARCHER) =================
	bow_special: {
		id: 'bow_special',
		name: 'Hujan Panah Badai (Arrow Storm)',
		cd: 5000,
		mpCost: 30,
		range: 350,
		execute(player, targetPos) {
			const angle = Math.atan2(targetPos.y - player.y, targetPos.x - player.x);
			const projectiles = [];
			// Spread of 5 arrows
			for (let i = -2; i <= 2; i++) {
				const sprAngle = angle + (i * 0.14);
				projectiles.push({
					x: player.x,
					y: player.y,
					vx: Math.cos(sprAngle) * 12,
					vy: Math.sin(sprAngle) * 12,
					radius: 14,
					maxDistance: 480,
					damageMult: 1.8,
					type: 'physical',
					particle: 'arrow_storm'
				});
			}
			return { projectiles };
		}
	},

	// ================= MAGIC SKILL (MAGE) =================
	magic_special: {
		id: 'magic_special',
		name: 'Ledakan Meteor Mana (Arcane Burst)',
		cd: 6000,
		mpCost: 45,
		range: 380,
		execute(player, targetPos) {
			return {
				aoe: {
					x: targetPos.x,
					y: targetPos.y,
					radius: 135,
					damageMult: 3.2,
					type: 'magic',
					destructionPower: 220,
					particle: 'meteor_crater'
				}
			};
		}
	},

	// ================= DODGE / DEFENSE =================
	dodge: {
		id: 'dodge',
		name: 'Tangkisan Kilat (Dodge Roll / Guard)',
		cd: 2200,
		mpCost: 10,
		execute(player, targetPos) {
			const angle = Math.atan2(targetPos.y - player.y, targetPos.x - player.x);
			return {
				dash: {
					vx: Math.cos(angle) * 16,
					vy: Math.sin(angle) * 16,
					durationMs: 250,
					invulnerableMs: 350
				}
			};
		}
	},

	// ================= FOX POWERS (EKOR 4, 7, 11) =================
	fox_tail_4: {
		id: 'fox_tail_4',
		name: 'Cakar Api Ekor 4',
		cd: 6000,
		mpCost: 35,
		execute(player, targetPos) {
			const angle = Math.atan2(targetPos.y - player.y, targetPos.x - player.x);
			return {
				aoe: {
					x: player.x + Math.cos(angle) * 70,
					y: player.y + Math.sin(angle) * 70,
					radius: 100,
					damageMult: 2.8,
					type: 'magic',
					destructionPower: 150,
					particle: 'red_claw_flame'
				}
			};
		}
	},

	fox_tail_7: {
		id: 'fox_tail_7',
		name: 'Hujan Roh Biru Ekor 7',
		cd: 10000,
		mpCost: 65,
		execute(player) {
			const orbs = [];
			for (let i = 0; i < 7; i++) {
				const ang = (i / 7) * Math.PI * 2;
				orbs.push({
					x: player.x,
					y: player.y,
					vx: Math.cos(ang) * 9,
					vy: Math.sin(ang) * 9,
					radius: 20,
					maxDistance: 380,
					damageMult: 3.6,
					type: 'magic',
					destructionPower: 260,
					particle: 'spirit_orb_blue'
				});
			}
			return { projectiles: orbs };
		}
	},

	fox_tail_11: {
		id: 'fox_tail_11',
		name: 'Bencana Sinar Kosmis Ekor 11 (SUPREME BIJUU BEAM)',
		cd: 16000,
		mpCost: 110,
		execute(player, targetPos) {
			const angle = Math.atan2(targetPos.y - player.y, targetPos.x - player.x);
			// Mega beam line + massive impact crater
			const beamSteps = [];
			for (let d = 50; d <= 600; d += 60) {
				beamSteps.push({
					x: player.x + Math.cos(angle) * d,
					y: player.y + Math.sin(angle) * d,
					radius: 80,
					damageMult: 7.5,
					type: 'magic',
					destructionPower: 600,
					particle: 'gold_beam_cosmic'
				});
			}
			return {
				megaBeam: {
					startX: player.x,
					startY: player.y,
					angle,
					length: 600,
					width: 90,
					durationMs: 900
				},
				aoeSteps: beamSteps,
				shakeIntensity: 24
			};
		}
	}
};
