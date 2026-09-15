/**
 * RPG WebSocket Server
 * Realtime multiplayer WebSocket server compatible with Pterodactyl and AI Studio.
 * Deteksi owner otomatis dari settings.js existing.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { WorldManager } from '../world/worldManager.js';
import { PlayerManager } from '../player/playerManager.js';
import { CombatEngine } from '../combat/combatEngine.js';
import { NpcManager } from '../npc/npcManager.js';
import { GameLoop } from '../engine/gameLoop.js';

let instance = null;

export class RpgServer {
	constructor(httpServer = null) {
		this.world = new WorldManager();
		this.players = new PlayerManager();
		this.combat = new CombatEngine(this.world);
		this.npcs = new NpcManager();

		// Socket sessions: socket -> { playerId, mapId }
		this.clients = new Map();

		// Setup WebSocket Server (noServer mode agar harmonis dengan WS lain)
		this.wss = new WebSocketServer({ noServer: true });

		this.wss.on('connection', (ws, req) => this.handleConnection(ws, req));

		// Game Loop with delta broadcasting
		this.loop = new GameLoop(
			this.world,
			this.players,
			this.combat,
			this.npcs,
			(mapId, delta) => this.broadcastToMap(mapId, delta)
		);
		this.loop.start();
	}

	static getInstance(httpServer = null) {
		if (!instance) {
			instance = new RpgServer(httpServer);
		} else if (httpServer && !instance.wss) {
			instance.attachHttpServer(httpServer);
		}
		return instance;
	}

	attachHttpServer(httpServer) {
		if (this.wss) {
			try { this.wss.close(); } catch (e) {}
		}
		this.wss = new WebSocketServer({ server: httpServer, path: '/ws/rpg' });
		this.wss.on('connection', (ws, req) => this.handleConnection(ws, req));
	}

	isOwnerUser(phoneNumber, name) {
		try {
			const owners = Array.isArray(global.owner) ? global.owner : [];
			const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');

			for (const o of owners) {
				const cleanOwner = String(o).replace(/[^0-9]/g, '');
				if (cleanOwner && cleanPhone && (cleanOwner === cleanPhone || cleanPhone.endsWith(cleanOwner) || cleanOwner.endsWith(cleanPhone))) {
					return true;
				}
			}

			// Juga cek jika nama mengandung identitas bot owner / author
			if (global.author && String(name).toLowerCase().includes(String(global.author).toLowerCase())) {
				return true;
			}
		} catch (e) {
			// fallback
		}
		return false;
	}

	handleConnection(ws, req) {
		ws.isAlive = true;
		ws.on('pong', () => { ws.isAlive = true; });

		ws.on('message', (raw) => {
			try {
				const msg = JSON.parse(raw.toString());
				this.handleClientMessage(ws, msg);
			} catch (e) {
				// Invalid JSON
			}
		});

		ws.on('close', () => {
			const session = this.clients.get(ws);
			if (session) {
				const player = this.players.activePlayers.get(session.playerId);
				if (player) {
					this.broadcastToMap(player.mapId, {
						t: 'player_leave',
						id: player.id,
						name: player.name
					});
				}
				this.players.removePlayer(session.playerId);
				this.clients.delete(ws);
			}
		});
	}

	handleClientMessage(ws, msg) {
		const type = msg.type || msg.t;

		if (type === 'join') {
			const rawName = (msg.name || 'Petualang').trim().slice(0, 16);
			const phone = msg.phone || msg.phoneNumber || '';
			const isOwner = this.isOwnerUser(phone, rawName) || !!msg.isOwner;

			const player = this.players.getOrCreatePlayer(rawName, isOwner, msg.preferredClass);
			this.clients.set(ws, { playerId: player.id, mapId: player.mapId });

			// Kirim data inisialisasi awal ke pemain
			const mapData = this.world.getMap(player.mapId);
			const nearNpcs = this.npcs.getNpcsNear(player.mapId, player.x, player.y, 600);

			ws.send(JSON.stringify({
				t: 'init',
				player: player.toJSON(),
				map: {
					id: mapData.id,
					name: mapData.name,
					width: mapData.width,
					height: mapData.height,
					groundColor: mapData.groundColor,
					tileType: mapData.tileType,
					safeZone: mapData.safeZone,
					portals: mapData.portals || [],
					buildings: mapData.buildings || [],
					decorations: mapData.decorations || []
				},
				npcs: nearNpcs
			}));

			// Beritahu pemain lain di map ini
			this.broadcastToMap(player.mapId, {
				t: 'player_join',
				player: {
					id: player.id,
					name: player.name,
					classType: player.classType,
					nation: player.nation,
					race: player.race,
					level: player.level,
					x: Math.round(player.x),
					y: Math.round(player.y),
					hp: player.hp,
					maxHp: player.maxHp,
					isOwner: player.isOwner,
					foxTier: player.foxTier
				}
			}, ws);
			return;
		}

		const session = this.clients.get(ws);
		if (!session) return;
		const player = this.players.activePlayers.get(session.playerId);
		if (!player) return;

		switch (type) {
			case 'move': {
				player.vx = Math.max(-1, Math.min(1, Number(msg.vx) || 0));
				player.vy = Math.max(-1, Math.min(1, Number(msg.vy) || 0));
				if (msg.facing) player.facing = msg.facing;
				break;
			}

			case 'skill': {
				const skillId = msg.skillId;
				const targetPos = {
					x: Number(msg.targetX) || player.x + (player.facing === 'right' ? 80 : -80),
					y: Number(msg.targetY) || player.y
				};

				const res = this.combat.executeSkill(player, skillId, targetPos, this.players.activePlayers);
				if (!res.success) {
					ws.send(JSON.stringify({ t: 'error', message: res.reason }));
				}
				break;
			}

			case 'interact_npc': {
				const npcId = msg.npcId;
				const res = this.npcs.interact(player, npcId);
				ws.send(JSON.stringify({ t: 'npc_dialogue', ...res }));
				break;
			}

			case 'buy_item': {
				const res = this.npcs.buyItem(player, msg.npcId, msg.itemId);
				ws.send(JSON.stringify({ t: 'shop_result', ...res }));
				break;
			}

			case 'chat': {
				const text = String(msg.text || '').trim().slice(0, 80);
				if (!text) return;
				this.broadcastToMap(player.mapId, {
					t: 'chat',
					senderId: player.id,
					senderName: player.name,
					text,
					isOwner: player.isOwner
				});
				break;
			}

			case 'respawn': {
				player.die();
				ws.send(JSON.stringify({
					t: 'respawned',
					player: player.toJSON()
				}));
				break;
			}
		}
	}

	broadcastToMap(mapId, data, excludeWs = null) {
		const payload = JSON.stringify(data);
		for (const [ws, session] of this.clients.entries()) {
			if (ws !== excludeWs && ws.readyState === WebSocket.OPEN && session.mapId === mapId) {
				try {
					ws.send(payload);
				} catch (e) {}
			}
		}
	}
}
