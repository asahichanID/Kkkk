/**
 * Ular Tangga Realtime WebSocket & Room Manager
 * Supports up to 4 players per room, native WS broadcasting and HTTP fallback.
 */

import { WebSocketServer, WebSocket } from 'ws';

const rooms = new Map(); // roomCode -> Room Object

// Standard Snake and Ladder mapping (10x10 board = 100 cells)
export const BOARD_MAP = {
	ladders: {
		4: 14,
		9: 31,
		20: 38,
		28: 84,
		40: 59,
		51: 67,
		63: 81,
		71: 91,
		80: 99
	},
	snakes: {
		17: 7,
		54: 34,
		62: 19,
		64: 60,
		87: 36,
		93: 73,
		95: 75,
		98: 79
	}
};

export const PLAYER_COLORS = [
	{ name: 'Merah', hex: '#ef4444', icon: '🔴', light: '#fca5a5' },
	{ name: 'Biru', hex: '#3b82f6', icon: '🔵', light: '#93c5fd' },
	{ name: 'Kuning', hex: '#eab308', icon: '🟡', light: '#fde047' },
	{ name: 'Hijau', hex: '#22c55e', icon: '🟢', light: '#86efac' }
];

function generateRoomCode() {
	let code;
	let tries = 0;
	do {
		code = String(Math.floor(1000 + Math.random() * 9000));
		tries++;
	} while (rooms.has(code) && tries < 50);
	return code;
}

export class UlarTanggaManager {
	static wss = null;

	static init(httpServer) {
		if (this.wss) return this.wss;
		try {
			this.wss = new WebSocketServer({
				noServer: true
			});

			this.wss.on('connection', (ws, req) => {
				this.handleConnection(ws, req);
			});

			console.log('🐍 Ular Tangga WebSocket Server mounted on /ws/ulartangga');
		} catch (err) {
			console.error('Failed to init Ular Tangga WebSocket Server:', err);
		}
		return this.wss;
	}

	static handleConnection(ws, req) {
		ws.isAlive = true;
		ws.playerId = null;
		ws.roomCode = null;

		ws.on('pong', () => { ws.isAlive = true; });

		ws.on('message', (raw) => {
			try {
				const data = JSON.parse(raw.toString());
				this.handleMessage(ws, data);
			} catch (err) {
				ws.send(JSON.stringify({ type: 'error', message: 'Format pesan tidak valid' }));
			}
		});

		ws.on('close', () => {
			if (ws.roomCode && ws.playerId) {
				this.leaveRoom(ws.roomCode, ws.playerId);
			}
		});
	}

	static handleMessage(ws, data) {
		const { type, roomCode, playerName, playerId, bet } = data;

		switch (type) {
			case 'ping':
				ws.send(JSON.stringify({ type: 'pong', time: Date.now() }));
				break;

			case 'create_room': {
				const name = (playerName || 'Host').trim().slice(0, 16);
				const id = playerId || 'p_' + Math.random().toString(36).substring(2, 9);
				const code = generateRoomCode();

				const hostPlayer = {
					id,
					name,
					colorIndex: 0,
					color: PLAYER_COLORS[0],
					pos: 1,
					isHost: true,
					ws
				};

				const room = {
					code,
					hostId: id,
					players: [hostPlayer],
					turnIndex: 0,
					started: false,
					winner: null,
					lastRoll: null,
					lastEvent: 'Room dibuat oleh ' + name,
					createdAt: Date.now(),
					lastActive: Date.now()
				};

				rooms.set(code, room);
				ws.playerId = id;
				ws.roomCode = code;

				ws.send(JSON.stringify({
					type: 'room_created',
					roomCode: code,
					player: { id, name, colorIndex: 0, color: PLAYER_COLORS[0], pos: 1, isHost: true },
					room: this.sanitizeRoom(room)
				}));
				break;
			}

			case 'join_room': {
				const targetCode = String(roomCode || '').trim();
				const room = rooms.get(targetCode);

				if (!room) {
					return ws.send(JSON.stringify({ type: 'error', message: 'Room dengan kode ' + targetCode + ' tidak ditemukan!' }));
				}

				if (room.players.length >= 4) {
					return ws.send(JSON.stringify({ type: 'error', message: 'Room sudah penuh (Maksimal 4 Pemain)!' }));
				}

				if (room.started) {
					return ws.send(JSON.stringify({ type: 'error', message: 'Permainan sudah dimulai!' }));
				}

				const name = (playerName || 'Player ' + (room.players.length + 1)).trim().slice(0, 16);
				const id = playerId || 'p_' + Math.random().toString(36).substring(2, 9);
				const colorIndex = room.players.length;

				const newPlayer = {
					id,
					name,
					colorIndex,
					color: PLAYER_COLORS[colorIndex],
					pos: 1,
					isHost: false,
					ws
				};

				room.players.push(newPlayer);
				room.lastActive = Date.now();
				room.lastEvent = `${name} bergabung ke room!`;

				ws.playerId = id;
				ws.roomCode = targetCode;

				this.broadcast(room, {
					type: 'player_joined',
					newPlayer: { id, name, colorIndex, color: PLAYER_COLORS[colorIndex], pos: 1, isHost: false },
					room: this.sanitizeRoom(room)
				});
				break;
			}

			case 'start_game': {
				const targetCode = String(roomCode || ws.roomCode || '').trim();
				const room = rooms.get(targetCode);
				if (!room) return ws.send(JSON.stringify({ type: 'error', message: 'Room tidak ditemukan' }));
				if (room.hostId !== ws.playerId) {
					return ws.send(JSON.stringify({ type: 'error', message: 'Hanya Host yang bisa memulai permainan!' }));
				}
				if (room.players.length < 2) {
					return ws.send(JSON.stringify({ type: 'error', message: 'Minimal butuh 2 pemain untuk memulai!' }));
				}

				room.started = true;
				room.turnIndex = 0;
				room.lastEvent = `Permainan dimulai! Giliran ${room.players[0].name} (🔴)`;
				room.lastActive = Date.now();

				this.broadcast(room, {
					type: 'game_started',
					room: this.sanitizeRoom(room)
				});
				break;
			}

			case 'roll_dice': {
				const targetCode = String(roomCode || ws.roomCode || '').trim();
				const room = rooms.get(targetCode);
				if (!room || !room.started || room.winner) return;

				const curPlayer = room.players[room.turnIndex];
				if (curPlayer.id !== ws.playerId) {
					return ws.send(JSON.stringify({ type: 'error', message: 'Bukan giliranmu sekarang!' }));
				}

				const diceVal = Math.floor(Math.random() * 6) + 1;
				const oldPos = curPlayer.pos;
				let targetPos = oldPos + diceVal;

				// Over 100 bounce rule
				if (targetPos > 100) {
					targetPos = 100 - (targetPos - 100);
				}

				// Build step path
				const stepPath = [];
				if (targetPos >= oldPos) {
					for (let s = oldPos + 1; s <= targetPos; s++) stepPath.push(s);
				} else {
					for (let s = oldPos + 1; s <= 100; s++) stepPath.push(s);
					for (let s = 99; s >= targetPos; s--) stepPath.push(s);
				}

				let specialAction = null; // 'ladder' | 'snake'
				let finalPos = targetPos;

				if (BOARD_MAP.ladders[targetPos]) {
					specialAction = { type: 'ladder', from: targetPos, to: BOARD_MAP.ladders[targetPos] };
					finalPos = BOARD_MAP.ladders[targetPos];
				} else if (BOARD_MAP.snakes[targetPos]) {
					specialAction = { type: 'snake', from: targetPos, to: BOARD_MAP.snakes[targetPos] };
					finalPos = BOARD_MAP.snakes[targetPos];
				}

				curPlayer.pos = finalPos;
				room.lastRoll = { playerId: curPlayer.id, dice: diceVal };
				room.lastActive = Date.now();

				let extraTurn = diceVal === 6;
				let winner = null;

				if (finalPos === 100) {
					winner = {
						id: curPlayer.id,
						name: curPlayer.name,
						color: curPlayer.color,
						rewardCode: `UT-WIN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
					};
					room.winner = winner;
					room.lastEvent = `🏆 ${curPlayer.name} Memenangkan Permainan Ular Tangga!`;
				} else {
					if (!extraTurn) {
						room.turnIndex = (room.turnIndex + 1) % room.players.length;
					}
					const nextPlayer = room.players[room.turnIndex];
					let note = '';
					if (specialAction?.type === 'ladder') note = `🪜 Naik tangga ke ${finalPos}!`;
					if (specialAction?.type === 'snake') note = `🐍 Tergelincir ular ke ${finalPos}!`;
					if (extraTurn) note += ' (Dapat Dadu 6: Giliran Tambahan!)';

					room.lastEvent = `${curPlayer.name} melempar 🎲 ${diceVal}. ${note} Selanjutnya: ${nextPlayer.name} (${nextPlayer.color.icon})`;
				}

				this.broadcast(room, {
					type: 'dice_rolled',
					playerId: curPlayer.id,
					dice: diceVal,
					oldPos,
					targetPos,
					finalPos,
					stepPath,
					specialAction,
					extraTurn,
					winner,
					room: this.sanitizeRoom(room)
				});
				break;
			}

			case 'chat': {
				const targetCode = String(roomCode || ws.roomCode || '').trim();
				const room = rooms.get(targetCode);
				if (!room) return;
				const sender = room.players.find(p => p.id === ws.playerId);
				if (!sender) return;

				const text = String(data.text || '').trim().slice(0, 60);
				if (!text) return;

				this.broadcast(room, {
					type: 'chat_message',
					sender: { id: sender.id, name: sender.name, color: sender.color },
					text,
					time: Date.now()
				});
				break;
			}
		}
	}

	static leaveRoom(roomCode, playerId) {
		const room = rooms.get(roomCode);
		if (!room) return;

		const idx = room.players.findIndex(p => p.id === playerId);
		if (idx === -1) return;

		const leaver = room.players[idx];
		room.players.splice(idx, 1);

		if (room.players.length === 0) {
			rooms.delete(roomCode);
			return;
		}

		// Reassign host if host left
		if (room.hostId === playerId) {
			room.hostId = room.players[0].id;
			room.players[0].isHost = true;
		}

		if (room.turnIndex >= room.players.length) {
			room.turnIndex = 0;
		}

		room.lastEvent = `${leaver.name} keluar dari room.`;
		room.lastActive = Date.now();

		this.broadcast(room, {
			type: 'player_left',
			leaverId: playerId,
			room: this.sanitizeRoom(room)
		});
	}

	static broadcast(room, payload) {
		const raw = JSON.stringify(payload);
		room.players.forEach(p => {
			if (p.ws && p.ws.readyState === WebSocket.OPEN) {
				try {
					p.ws.send(raw);
				} catch (e) {}
			}
		});
	}

	static sanitizeRoom(room) {
		return {
			code: room.code,
			hostId: room.hostId,
			players: room.players.map(p => ({
				id: p.id,
				name: p.name,
				colorIndex: p.colorIndex,
				color: p.color,
				pos: p.pos,
				isHost: p.isHost
			})),
			turnIndex: room.turnIndex,
			currentTurnPlayer: room.players[room.turnIndex] ? {
				id: room.players[room.turnIndex].id,
				name: room.players[room.turnIndex].name,
				color: room.players[room.turnIndex].color
			} : null,
			started: room.started,
			winner: room.winner,
			lastRoll: room.lastRoll,
			lastEvent: room.lastEvent,
			createdAt: room.createdAt
		};
	}

	static getRoom(code) {
		const room = rooms.get(String(code).trim());
		return room ? this.sanitizeRoom(room) : null;
	}

	static listRooms() {
		const list = [];
		const now = Date.now();
		for (const [code, room] of rooms.entries()) {
			// clean old rooms after 2 hours
			if (now - room.lastActive > 7200000) {
				rooms.delete(code);
				continue;
			}
			list.push(this.sanitizeRoom(room));
		}
		return list;
	}
}

export function initUlarTanggaWs(httpServer) {
	return UlarTanggaManager.init(httpServer);
}
