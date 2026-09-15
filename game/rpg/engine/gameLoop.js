/**
 * RPG Engine Game Loop
 * 20Hz Server-authoritative game loop, portal teleportation, and spatial delta broadcast.
 */

export class GameLoop {
	constructor(worldManager, playerManager, combatEngine, npcManager, broadcastCallback) {
		this.world = worldManager;
		this.players = playerManager;
		this.combat = combatEngine;
		this.npcs = npcManager;
		this.broadcast = broadcastCallback;
		this.isRunning = false;
		this.interval = null;
		this.tickRate = 20; // 20 updates per second (50ms)
	}

	start() {
		if (this.isRunning) return;
		this.isRunning = true;
		this.interval = setInterval(() => this.tick(), 1000 / this.tickRate);
	}

	stop() {
		if (this.interval) clearInterval(this.interval);
		this.isRunning = false;
	}

	tick() {
		const activePlayers = this.players.activePlayers;
		if (!activePlayers || activePlayers.size === 0) {
			return; // Skip tick to consume 0% CPU when no players are active in the RPG world
		}

		const now = Date.now();

		// 1. Tick Players (natural HP/MP regeneration & movement)
		for (const p of activePlayers.values()) {
			p.tick(now);

			// Apply velocity with boundary check
			const map = this.world.getMap(p.mapId);
			if (p.vx !== 0 || p.vy !== 0) {
				p.x = Math.max(30, Math.min(map.width - 30, p.x + p.vx * p.spd));
				p.y = Math.max(30, Math.min(map.height - 30, p.y + p.vy * p.spd));
			}

			// Check Portal Collision
			if (map.portals) {
				for (const portal of map.portals) {
					if (p.x >= portal.x && p.x <= portal.x + portal.w && p.y >= portal.y && p.y <= portal.y + portal.h) {
						// Teleport to target map
						const targetMap = this.world.getMap(portal.targetMap);
						p.mapId = portal.targetMap;
						p.x = targetMap.spawnPoint.x;
						p.y = targetMap.spawnPoint.y;
						p.vx = 0;
						p.vy = 0;
						break;
					}
				}
			}
		}

		// 2. Tick World (Destruction repair & Monster AI)
		this.world.tick(now, activePlayers);

		// 3. Tick Combat (Projectiles & Hit testing)
		this.combat.tick(activePlayers);

		// 4. Flush Combat Events
		const events = this.combat.flushEvents();

		// 5. Broadcast Room State per Map
		for (const mapId of Object.keys(this.world.maps)) {
			const mapPlayers = [];
			for (const p of activePlayers.values()) {
				if (p.mapId === mapId) {
					mapPlayers.push({
						id: p.id,
						name: p.name,
						classType: p.classType,
						nation: p.nation,
						race: p.race,
						level: p.level,
						x: Math.round(p.x),
						y: Math.round(p.y),
						facing: p.facing,
						hp: p.hp,
						maxHp: p.maxHp,
						mp: p.mp,
						maxMp: p.maxMp,
						foxTier: p.foxTier,
						foxActive: p.foxActive,
						isOwner: p.isOwner
					});
				}
			}

			// If no players on map, skip heavy broadcast
			if (mapPlayers.length === 0) continue;

			// Gather entities on this map
			const monsters = this.world.getMonsters(mapId).map(m => ({
				id: m.id,
				type: m.type,
				name: m.name,
				x: Math.round(m.x),
				y: Math.round(m.y),
				hp: m.hp,
				maxHp: m.maxHp,
				color: m.color,
				avatar: m.avatar,
				radius: m.radius,
				isBoss: m.isBoss
			}));

			const destructibles = this.world.getDestructibles(mapId).map(d => ({
				id: d.id,
				state: d.state,
				hp: d.hp,
				maxHp: d.maxHp
			}));

			const projectiles = this.combat.activeProjectiles
				.filter(p => p.mapId === mapId)
				.map(p => ({
					id: p.id,
					x: Math.round(p.x),
					y: Math.round(p.y),
					radius: p.radius,
					particle: p.particle
				}));

			const mapEvents = events.filter(e => e.mapId === mapId);

			const payload = {
				t: 'state',
				mapId,
				players: mapPlayers,
				monsters,
				destructibles,
				projectiles,
				events: mapEvents
			};

			this.broadcast(mapId, payload);
		}
	}
}
