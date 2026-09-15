/**
 * Catur 3D Realtime WebSocket Server & Room Manager
 * Multiplayer 2-Player Chess Engine menggunakan chess.js
 */

import { WebSocketServer } from 'ws';
import { Chess } from 'chess.js';

// Penyimpanan room aktif: roomCode (4 digit) -> Room Object
const rooms = new Map();

/**
 * Generate 4 digit room code (angka 1000-9999 unik atau alfanumerik 4 karakter)
 */
function generateRoomCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  let tries = 0;
  do {
    code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    tries++;
  } while (rooms.has(code) && tries < 100);

  // Fallback ke 4 digit numerik jika tabrakan
  if (rooms.has(code)) {
    code = String(Math.floor(1000 + Math.random() * 9000));
  }
  return code;
}

export class CaturManager {
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

      console.log('♟️ Catur 3D WebSocket Server aktif di /ws/catur');
    } catch (err) {
      console.error('❌ Gagal inisialisasi Catur WebSocket Server:', err);
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
        if (!raw) return;
        const str = raw.toString().trim();
        if (!str || (!str.startsWith('{') && !str.startsWith('['))) return;
        const data = JSON.parse(str);
        this.handleMessage(ws, data);
      } catch (err) {
        // Abaikan paket tidak valid dengan tenang
      }
    });

    ws.on('close', () => {
      if (ws.roomCode && ws.playerId) {
        this.handleDisconnect(ws.roomCode, ws.playerId);
      }
    });
  }

  static handleMessage(ws, data) {
    const { type, roomCode, playerName, playerId, from, to, promotion } = data;

    switch (type) {
      case 'create_room': {
        const code = generateRoomCode();
        const pId = playerId || `p_${Math.random().toString(36).substr(2, 9)}`;
        const pName = (playerName || 'Player 1').trim().slice(0, 20);

        const chess = new Chess();
        const room = {
          code,
          chess,
          createdAt: Date.now(),
          status: 'waiting', // waiting, playing, ended
          players: {
            white: { id: pId, name: pName, ws, connected: true },
            black: null
          },
          turn: 'w',
          history: [],
          captured: { w: [], b: [] },
          winner: null,
          winReason: null
        };

        rooms.set(code, room);
        ws.roomCode = code;
        ws.playerId = pId;

        ws.send(JSON.stringify({
          type: 'room_created',
          roomCode: code,
          playerId: pId,
          color: 'w',
          fen: chess.fen(),
          status: 'waiting',
          whitePlayer: { id: pId, name: pName },
          blackPlayer: null
        }));
        break;
      }

      case 'join_room': {
        const code = (roomCode || '').toUpperCase().trim();
        const pId = playerId || `p_${Math.random().toString(36).substr(2, 9)}`;
        const pName = (playerName || 'Player 2').trim().slice(0, 20);

        if (!rooms.has(code)) {
          return ws.send(JSON.stringify({
            type: 'error',
            message: `Room catur ${code} tidak ditemukan. Periksa kembali 4 digit kode!`
          }));
        }

        const room = rooms.get(code);

        // Jika pemain lama mencoba reconnect
        if (room.players.white?.id === pId) {
          room.players.white.ws = ws;
          room.players.white.connected = true;
          ws.roomCode = code;
          ws.playerId = pId;
          return ws.send(JSON.stringify({
            type: 'room_reconnected',
            roomCode: code,
            color: 'w',
            fen: room.chess.fen(),
            turn: room.chess.turn(),
            status: room.status,
            whitePlayer: { id: room.players.white.id, name: room.players.white.name },
            blackPlayer: room.players.black ? { id: room.players.black.id, name: room.players.black.name } : null,
            history: room.history,
            captured: room.captured
          }));
        }

        if (room.players.black?.id === pId) {
          room.players.black.ws = ws;
          room.players.black.connected = true;
          ws.roomCode = code;
          ws.playerId = pId;
          return ws.send(JSON.stringify({
            type: 'room_reconnected',
            roomCode: code,
            color: 'b',
            fen: room.chess.fen(),
            turn: room.chess.turn(),
            status: room.status,
            whitePlayer: { id: room.players.white.id, name: room.players.white.name },
            blackPlayer: { id: room.players.black.id, name: room.players.black.name },
            history: room.history,
            captured: room.captured
          }));
        }

        // Jika slot hitam masih kosong, langsung gabung dan OTOMATIS MULAI!
        if (!room.players.black) {
          room.players.black = { id: pId, name: pName, ws, connected: true };
          room.status = 'playing'; // OTOMATIS MULAI TANPA TOMBOL
          ws.roomCode = code;
          ws.playerId = pId;

          const startPayload = {
            type: 'game_start',
            roomCode: code,
            fen: room.chess.fen(),
            turn: room.chess.turn(),
            status: 'playing',
            whitePlayer: { id: room.players.white.id, name: room.players.white.name },
            blackPlayer: { id: room.players.black.id, name: room.players.black.name },
            history: room.history,
            captured: room.captured
          };

          // Kirim ke White
          if (room.players.white?.ws?.readyState === 1) {
            room.players.white.ws.send(JSON.stringify({ ...startPayload, yourColor: 'w' }));
          }

          // Kirim ke Black
          ws.send(JSON.stringify({ ...startPayload, yourColor: 'b' }));
          return;
        }

        // Jika room sudah penuh 2 orang
        return ws.send(JSON.stringify({
          type: 'error',
          message: `Room catur ${code} sudah penuh (2/2 pemain).`
        }));
      }

      case 'make_move': {
        const code = (roomCode || ws.roomCode || '').toUpperCase().trim();
        if (!rooms.has(code)) {
          return ws.send(JSON.stringify({ type: 'error', message: 'Room tidak aktif' }));
        }

        const room = rooms.get(code);
        if (room.status !== 'playing') {
          return ws.send(JSON.stringify({ type: 'error', message: 'Permainan belum dimulai atau sudah selesai' }));
        }

        const currentTurn = room.chess.turn(); // 'w' atau 'b'
        const expectedPlayer = currentTurn === 'w' ? room.players.white : room.players.black;

        if (expectedPlayer?.id !== ws.playerId) {
          return ws.send(JSON.stringify({
            type: 'move_error',
            message: `Bukan giliran Anda! Giliran saat ini: ${currentTurn === 'w' ? 'Putih' : 'Hitam'}`
          }));
        }

        try {
          // Lakukan langkah catur via chess.js
          const moveResult = room.chess.move({
            from,
            to,
            promotion: promotion || 'q'
          });

          if (!moveResult) {
            return ws.send(JSON.stringify({
              type: 'move_error',
              message: 'Langkah tidak sah menurut aturan catur!'
            }));
          }

          // Jika ada bidak yang termakan
          if (moveResult.captured) {
            const capturedPiece = moveResult.captured.toUpperCase();
            if (currentTurn === 'w') {
              room.captured.b.push(capturedPiece);
            } else {
              room.captured.w.push(capturedPiece);
            }
          }

          room.history.push({
            from: moveResult.from,
            to: moveResult.to,
            piece: moveResult.piece,
            color: moveResult.color,
            san: moveResult.san,
            fen: room.chess.fen(),
            captured: moveResult.captured || null
          });

          const isCheck = room.chess.inCheck();
          const isCheckmate = room.chess.isCheckmate();
          const isDraw = room.chess.isDraw();
          const isStalemate = room.chess.isStalemate();

          if (isCheckmate) {
            room.status = 'ended';
            room.winner = currentTurn;
            room.winReason = 'checkmate';
          } else if (isDraw || isStalemate) {
            room.status = 'ended';
            room.winner = 'draw';
            room.winReason = isStalemate ? 'stalemate' : 'draw';
          }

          const movePayload = {
            type: 'move_made',
            roomCode: code,
            move: {
              from: moveResult.from,
              to: moveResult.to,
              san: moveResult.san,
              piece: moveResult.piece,
              color: moveResult.color,
              captured: moveResult.captured || null
            },
            fen: room.chess.fen(),
            turn: room.chess.turn(),
            history: room.history,
            captured: room.captured,
            isCheck,
            isCheckmate,
            isDraw,
            status: room.status,
            winner: room.winner,
            winReason: room.winReason
          };

          // Broadcast ke kedua pemain
          this.broadcastToRoom(code, movePayload);
        } catch (moveErr) {
          return ws.send(JSON.stringify({
            type: 'move_error',
            message: 'Langkah ilegal: ' + (moveErr.message || 'Langkah tidak valid')
          }));
        }
        break;
      }

      case 'rematch': {
        const code = (roomCode || ws.roomCode || '').toUpperCase().trim();
        if (!rooms.has(code)) return;
        const room = rooms.get(code);

        // Reset chess board
        room.chess = new Chess();
        room.status = 'playing';
        room.history = [];
        room.captured = { w: [], b: [] };
        room.winner = null;
        room.winReason = null;

        // Tukar warna pemain untuk rematch yang adil
        const temp = room.players.white;
        room.players.white = room.players.black;
        room.players.black = temp;

        const rematchPayload = {
          type: 'game_start',
          roomCode: code,
          fen: room.chess.fen(),
          turn: room.chess.turn(),
          status: 'playing',
          whitePlayer: { id: room.players.white.id, name: room.players.white.name },
          blackPlayer: { id: room.players.black.id, name: room.players.black.name },
          history: [],
          captured: room.captured,
          isRematch: true
        };

        if (room.players.white?.ws?.readyState === 1) {
          room.players.white.ws.send(JSON.stringify({ ...rematchPayload, yourColor: 'w' }));
        }
        if (room.players.black?.ws?.readyState === 1) {
          room.players.black.ws.send(JSON.stringify({ ...rematchPayload, yourColor: 'b' }));
        }
        break;
      }

      case 'leave_room': {
        const code = (roomCode || ws.roomCode || '').toUpperCase().trim();
        this.handleDisconnect(code, ws.playerId);
        break;
      }

      default:
        break;
    }
  }

  static handleDisconnect(roomCode, playerId) {
    if (!roomCode || !rooms.has(roomCode)) return;
    const room = rooms.get(roomCode);

    if (room.players.white?.id === playerId) {
      room.players.white.connected = false;
      this.broadcastToRoom(roomCode, {
        type: 'player_disconnected',
        color: 'w',
        message: `${room.players.white.name} (Putih) terputus dari koneksi`
      });
    } else if (room.players.black?.id === playerId) {
      room.players.black.connected = false;
      this.broadcastToRoom(roomCode, {
        type: 'player_disconnected',
        color: 'b',
        message: `${room.players.black.name} (Hitam) terputus dari koneksi`
      });
    }

    // Hapus room jika kedua pemain sudah offline lebih dari 10 menit
    if (!room.players.white?.connected && (!room.players.black || !room.players.black?.connected)) {
      setTimeout(() => {
        if (!room.players.white?.connected && (!room.players.black || !room.players.black?.connected)) {
          rooms.delete(roomCode);
        }
      }, 10 * 60 * 1000);
    }
  }

  static broadcastToRoom(roomCode, payload) {
    if (!rooms.has(roomCode)) return;
    const room = rooms.get(roomCode);
    const msg = JSON.stringify(payload);

    if (room.players.white?.ws?.readyState === 1) {
      try { room.players.white.ws.send(msg); } catch {}
    }
    if (room.players.black?.ws?.readyState === 1) {
      try { room.players.black.ws.send(msg); } catch {}
    }
  }

  static getRoomInfo(roomCode) {
    const code = (roomCode || '').toUpperCase().trim();
    if (!rooms.has(code)) return null;
    const room = rooms.get(code);
    return {
      code: room.code,
      status: room.status,
      whitePlayer: room.players.white ? { id: room.players.white.id, name: room.players.white.name, connected: room.players.white.connected } : null,
      blackPlayer: room.players.black ? { id: room.players.black.id, name: room.players.black.name, connected: room.players.black.connected } : null,
      fen: room.chess.fen(),
      turn: room.chess.turn(),
      winner: room.winner,
      createdAt: room.createdAt
    };
  }

  static createRoomDirect(hostName = 'Host') {
    const code = generateRoomCode();
    const pId = `host_${Math.random().toString(36).substr(2, 8)}`;
    const chess = new Chess();
    const room = {
      code,
      chess,
      createdAt: Date.now(),
      status: 'waiting',
      players: {
        white: { id: pId, name: hostName.trim().slice(0, 20), ws: null, connected: false },
        black: null
      },
      turn: 'w',
      history: [],
      captured: { w: [], b: [] },
      winner: null,
      winReason: null
    };
    rooms.set(code, room);
    return { code, hostId: pId };
  }
}
