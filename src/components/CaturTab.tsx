import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import {
  Copy,
  Check,
  RotateCcw,
  LogOut,
  HelpCircle,
  Wifi,
  WifiOff,
  User,
  Swords,
  Crown,
  Sparkles,
  Volume2,
  VolumeX,
  Bot,
  Users,
  BrainCircuit,
  Zap,
  Shield,
  Flame,
  ArrowRight
} from 'lucide-react';
import { getBestAiMove, AiDifficulty } from '../lib/chessAi';
import { REAL_CHESS_MOVE_SOUND, REAL_CHESS_CAPTURE_SOUND } from '../lib/chessSounds';

interface PlayerInfo {
  id: string;
  name: string;
  connected?: boolean;
}

interface MoveHistoryItem {
  from: string;
  to: string;
  piece: string;
  san: string;
  captured?: string | null;
}

// Bidak catur klasik dengan simbol Unicode berkualitas tinggi
const CHESS_PIECE_SYMBOLS: Record<string, string> = {
  wP: '♙',
  wN: '♘',
  wB: '♗',
  wR: '♖',
  wQ: '♕',
  wK: '♔',
  bP: '♟',
  bN: '♞',
  bB: '♝',
  bR: '♜',
  bQ: '♛',
  bK: '♚'
};

// Audio Engine Catur Realistis Berbasis Rekaman Kayu Asli (Super Crisp Wood Sound)
class ChessAudioEngine {
  public enabled = true;
  private moveAudioPool: HTMLAudioElement[] = [];
  private captureAudioPool: HTMLAudioElement[] = [];
  private poolIndex = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        // Pool audio untuk responsivitas instan tanpa latency
        for (let i = 0; i < 4; i++) {
          const m = new Audio(REAL_CHESS_MOVE_SOUND);
          m.preload = 'auto';
          this.moveAudioPool.push(m);

          const c = new Audio(REAL_CHESS_CAPTURE_SOUND);
          c.preload = 'auto';
          this.captureAudioPool.push(c);
        }
      } catch (e) {
        console.warn('[AUDIO INIT]', e);
      }
    }
  }

  // Suara langkah kayu renyah asli (Crisp Wood Tap)
  playMove() {
    if (!this.enabled || typeof window === 'undefined') return;
    try {
      if (this.moveAudioPool.length > 0) {
        const snd = this.moveAudioPool[this.poolIndex % this.moveAudioPool.length];
        this.poolIndex++;
        snd.currentTime = 0;
        snd.volume = 1.0;
        snd.play().catch(() => {});
      } else {
        const snd = new Audio(REAL_CHESS_MOVE_SOUND);
        snd.volume = 1.0;
        snd.play().catch(() => {});
      }
    } catch {}
  }

  // Suara makan bidak kayu renyah & padat (Authentic Wood Capture Snap)
  playCapture() {
    if (!this.enabled || typeof window === 'undefined') return;
    try {
      if (this.captureAudioPool.length > 0) {
        const snd = this.captureAudioPool[this.poolIndex % this.captureAudioPool.length];
        this.poolIndex++;
        snd.currentTime = 0;
        snd.volume = 1.0;
        snd.play().catch(() => {});
      } else {
        const snd = new Audio(REAL_CHESS_CAPTURE_SOUND);
        snd.volume = 1.0;
        snd.play().catch(() => {});
      }
    } catch {}
  }

  // Suara skak (Authentic double wood alert)
  playCheck() {
    if (!this.enabled || typeof window === 'undefined') return;
    try {
      this.playCapture();
      setTimeout(() => {
        this.playMove();
      }, 100);
    } catch {}
  }

  // Suara kemenangan
  playWin() {
    if (!this.enabled || typeof window === 'undefined') return;
    try {
      this.playMove();
      setTimeout(() => this.playCapture(), 120);
      setTimeout(() => this.playMove(), 240);
    } catch {}
  }
}

const audio = new ChessAudioEngine();

export const CaturTab: React.FC = () => {
  // Pilihan Mode Utama: 'bot' (Lawan Bot) atau 'multiplayer' (2 Player)
  const [gameMode, setGameMode] = useState<'bot' | 'multiplayer'>('bot');

  // Konfigurasi Lawan Bot (Default: Normal)
  const [botDifficulty, setBotDifficulty] = useState<AiDifficulty>('normal');
  const [botColorPreference, setBotColorPreference] = useState<'w' | 'b' | 'random'>('w');
  const [isBotThinking, setIsBotThinking] = useState(false);

  // Nama pemain
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('catur_player_name') || `Pemain ${Math.floor(100 + Math.random() * 900)}`;
  });
  const [isEditingName, setIsEditingName] = useState(false);

  // Status room & game: DEFAULT LANGSUNG 'playing' LAWAN BOT NORMAL
  const [roomCode, setRoomCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [myColor, setMyColor] = useState<'w' | 'b'>('w');
  const [gameState, setGameState] = useState<'lobby' | 'waiting' | 'playing' | 'ended'>('playing');
  const [whitePlayer, setWhitePlayer] = useState<PlayerInfo | null>(() => ({
    id: 'human',
    name: localStorage.getItem('catur_player_name') || 'Pemain 1'
  }));
  const [blackPlayer, setBlackPlayer] = useState<PlayerInfo | null>(() => ({
    id: 'bot',
    name: 'Oguri Bot (Normal)'
  }));
  const [history, setHistory] = useState<MoveHistoryItem[]>([]);
  const [captured, setCaptured] = useState<{ w: string[]; b: string[] }>({ w: [], b: [] });
  const [winner, setWinner] = useState<'w' | 'b' | 'draw' | null>(null);
  const [winReason, setWinReason] = useState<string | null>(null);
  const [isCheck, setIsCheck] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Chess.js instance lokal
  const chessRef = useRef<Chess>(new Chess());
  const [fen, setFen] = useState<string>(chessRef.current.fen());
  const [turn, setTurn] = useState<'w' | 'b'>('w');

  // Interaksi bidak
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Koneksi WebSocket (Khusus mode 2 Player)
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  // Simpan nama
  const handleSaveName = (newName: string) => {
    const clean = newName.trim().slice(0, 16) || `Pemain ${Math.floor(100 + Math.random() * 900)}`;
    setPlayerName(clean);
    localStorage.setItem('catur_player_name', clean);
    setIsEditingName(false);
  };

  // Setup WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/catur`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        setErrorMessage(null);
      };

      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(() => {
          if (gameMode === 'multiplayer' && gameState !== 'lobby') {
            connectWebSocket();
          }
        }, 3000);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          if (!event || !event.data) return;
          const raw = typeof event.data === 'string' ? event.data.trim() : '';
          if (!raw || (!raw.startsWith('{') && !raw.startsWith('['))) return;
          const data = JSON.parse(raw);
          handleWsMessage(data);
        } catch {
          // Abaikan frame data non-JSON secara aman
        }
      };
    } catch {
      // WS connect error
    }
  }, [gameState, gameMode]);

  // Pesan dari WebSocket Server (Untuk 2 Player)
  const handleWsMessage = (data: any) => {
    switch (data.type) {
      case 'room_created': {
        setRoomCode(data.roomCode);
        setMyColor('w');
        setWhitePlayer(data.whitePlayer);
        setBlackPlayer(null);
        setGameState('waiting');
        chessRef.current.load(data.fen);
        setFen(data.fen);
        setTurn('w');
        setErrorMessage(null);
        break;
      }

      case 'game_start': {
        setRoomCode(data.roomCode);
        if (data.yourColor) {
          setMyColor(data.yourColor);
        }
        setWhitePlayer(data.whitePlayer);
        setBlackPlayer(data.blackPlayer);
        setGameState('playing');
        chessRef.current.load(data.fen);
        setFen(data.fen);
        setTurn(data.turn || 'w');
        setHistory(data.history || []);
        setCaptured(data.captured || { w: [], b: [] });
        setSelectedSquare(null);
        setLegalMoves([]);
        setErrorMessage(null);
        audio.playMove();
        break;
      }

      case 'room_reconnected': {
        setRoomCode(data.roomCode);
        setMyColor(data.color);
        setWhitePlayer(data.whitePlayer);
        setBlackPlayer(data.blackPlayer);
        setGameState(data.status);
        chessRef.current.load(data.fen);
        setFen(data.fen);
        setTurn(data.turn);
        setHistory(data.history || []);
        setCaptured(data.captured || { w: [], b: [] });
        setErrorMessage(null);
        break;
      }

      case 'move_made': {
        chessRef.current.load(data.fen);
        setFen(data.fen);
        setTurn(data.turn);
        setHistory(data.history || []);
        setCaptured(data.captured || { w: [], b: [] });
        setIsCheck(Boolean(data.isCheck));
        setLastMove({ from: data.move.from, to: data.move.to });
        setSelectedSquare(null);
        setLegalMoves([]);

        if (data.move.captured) {
          audio.playCapture();
        } else {
          audio.playMove();
        }

        if (data.isCheck && !data.isCheckmate) {
          audio.playCheck();
        }

        if (data.status === 'ended') {
          setGameState('ended');
          setWinner(data.winner);
          setWinReason(data.winReason);
          audio.playWin();
        }
        break;
      }

      case 'move_error': {
        setErrorMessage(data.message || 'Langkah tidak valid');
        setTimeout(() => setErrorMessage(null), 3500);
        break;
      }

      case 'player_disconnected': {
        setErrorMessage(data.message);
        setTimeout(() => setErrorMessage(null), 4000);
        break;
      }

      case 'error': {
        setErrorMessage(data.message);
        setTimeout(() => setErrorMessage(null), 4000);
        break;
      }

      default:
        break;
    }
  };

  // Mount effect: connect ws & cek query param url
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam && roomParam.length === 4) {
      setGameMode('multiplayer');
      setInputCode(roomParam.toUpperCase());
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  // =========================================================================
  // LOGIKA MODE LAWAN BOT (AI CHESS)
  // =========================================================================

  // Eksekusi langkah Bot dengan jeda berpikir alami
  const executeBotMove = useCallback((currentChess: Chess, humanColor: 'w' | 'b', diff: AiDifficulty) => {
    if (currentChess.isGameOver()) return;

    setIsBotThinking(true);

    const thinkingTime = diff === 'easy' ? 350 : diff === 'normal' ? 450 : diff === 'hard' ? 550 : 650;

    setTimeout(() => {
      try {
        const bestMove = getBestAiMove(currentChess, diff);
        if (!bestMove) {
          setIsBotThinking(false);
          return;
        }

        const moveResult = currentChess.move({
          from: bestMove.from,
          to: bestMove.to,
          promotion: bestMove.promotion || 'q'
        });

        if (moveResult) {
          setFen(currentChess.fen());
          setTurn(currentChess.turn());
          setLastMove({ from: moveResult.from, to: moveResult.to });
          setIsCheck(currentChess.inCheck());

          // Hitung captured pieces
          const newCaptured: { w: string[]; b: string[] } = { w: [], b: [] };
          currentChess.history({ verbose: true }).forEach((m) => {
            if (m.captured) {
              if (m.color === 'w') newCaptured.w.push(m.captured.toUpperCase());
              else newCaptured.b.push(m.captured.toUpperCase());
            }
          });
          setCaptured(newCaptured);

          if (moveResult.captured) {
            audio.playCapture();
          } else {
            audio.playMove();
          }

          if (currentChess.inCheck() && !currentChess.isCheckmate()) {
            audio.playCheck();
          }

          // Cek game over
          if (currentChess.isGameOver()) {
            setGameState('ended');
            if (currentChess.isCheckmate()) {
              setWinner(humanColor === 'w' ? 'b' : 'w'); // Bot menang
              setWinReason('checkmate');
            } else {
              setWinner('draw');
              setWinReason(currentChess.isStalemate() ? 'stalemate' : 'draw');
            }
            audio.playWin();
          }
        }
      } catch (err) {
        console.error('[BOT MOVE ERROR]', err);
      } finally {
        setIsBotThinking(false);
      }
    }, thinkingTime);
  }, []);

  // Ganti tingkat kesulitan Bot langsung dari bar atas
  const handleSelectDifficulty = (diff: AiDifficulty) => {
    setBotDifficulty(diff);
    const diffLabel = diff.charAt(0).toUpperCase() + diff.slice(1);
    if (myColor === 'w') {
      setBlackPlayer({ id: 'bot', name: `Oguri Bot (${diffLabel})` });
    } else {
      setWhitePlayer({ id: 'bot', name: `Oguri Bot (${diffLabel})` });
    }
  };

  // Mulai Game Lawan Bot (Default: Normal)
  const handleStartBotGame = (
    diff: AiDifficulty = botDifficulty,
    colorPref: 'w' | 'b' | 'random' = botColorPreference
  ) => {
    chessRef.current = new Chess();
    setFen(chessRef.current.fen());
    setTurn('w');
    setHistory([]);
    setCaptured({ w: [], b: [] });
    setWinner(null);
    setWinReason(null);
    setIsCheck(false);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setGameMode('bot');
    setBotDifficulty(diff);

    // Tentukan warna pemain
    let userColor: 'w' | 'b' = 'w';
    if (colorPref === 'random') {
      userColor = Math.random() > 0.5 ? 'w' : 'b';
    } else {
      userColor = colorPref;
    }
    setMyColor(userColor);

    const diffLabel = diff.charAt(0).toUpperCase() + diff.slice(1);
    const botName = `Oguri Bot (${diffLabel})`;

    if (userColor === 'w') {
      setWhitePlayer({ id: 'human', name: playerName });
      setBlackPlayer({ id: 'bot', name: botName });
      setGameState('playing');
    } else {
      setWhitePlayer({ id: 'bot', name: botName });
      setBlackPlayer({ id: 'human', name: playerName });
      setGameState('playing');

      // Bot jalan duluan sebagai Putih
      executeBotMove(chessRef.current, userColor, diff);
    }
  };

  // =========================================================================
  // LOGIKA 2 PLAYER MULTIPLAYER (WEBSOCKET)
  // =========================================================================

  const handleCreateRoom = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connectWebSocket();
    }
    const checkAndSend = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'create_room',
            playerName
          })
        );
      } else {
        setTimeout(checkAndSend, 150);
      }
    };
    checkAndSend();
  };

  const handleJoinRoom = useCallback(
    (codeToJoin: string) => {
      const clean = codeToJoin.trim().toUpperCase();
      if (clean.length !== 4) return;

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connectWebSocket();
      }

      const checkAndSend = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'join_room',
              roomCode: clean,
              playerName
            })
          );
        } else {
          setTimeout(checkAndSend, 150);
        }
      };
      checkAndSend();
    },
    [connectWebSocket, playerName]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().slice(0, 4);
    setInputCode(val);

    if (val.length === 4) {
      handleJoinRoom(val);
    }
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRematch = () => {
    if (gameMode === 'bot') {
      handleStartBotGame();
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'rematch',
          roomCode
        })
      );
    }
  };

  const handleLeaveRoom = () => {
    if (gameMode === 'multiplayer' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'leave_room',
          roomCode
        })
      );
    }
    setGameMode('bot');
    setRoomCode('');
    setInputCode('');
    setSelectedSquare(null);
    setLegalMoves([]);
    handleStartBotGame('normal', 'w');
  };

  // Klik petak catur (Mendukung Lawan Bot & 2 Player)
  const handleSquareClick = (square: string) => {
    if (gameState !== 'playing') return;

    // Pastikan giliran saya
    const currentTurn = chessRef.current.turn();
    if (myColor !== currentTurn) {
      if (gameMode === 'bot' && isBotThinking) {
        setErrorMessage('🤖 Bot sedang berpikir...');
      } else {
        setErrorMessage(`Menunggu giliran ${currentTurn === 'w' ? 'Putih' : 'Hitam'}...`);
      }
      setTimeout(() => setErrorMessage(null), 2000);
      return;
    }

    // Jika sudah ada petak yang dipilih dan mengklik petak tujuan legal
    if (selectedSquare) {
      if (legalMoves.includes(square)) {
        if (gameMode === 'bot') {
          // Eksekusi langkah di mode Lawan Bot (Lokal)
          try {
            const moveResult = chessRef.current.move({
              from: selectedSquare,
              to: square,
              promotion: 'q'
            });

            if (moveResult) {
              setFen(chessRef.current.fen());
              setTurn(chessRef.current.turn());
              setLastMove({ from: moveResult.from, to: moveResult.to });
              setIsCheck(chessRef.current.inCheck());

              // Hitung captured pieces
              const newCaptured: { w: string[]; b: string[] } = { w: [], b: [] };
              chessRef.current.history({ verbose: true }).forEach((m) => {
                if (m.captured) {
                  if (m.color === 'w') newCaptured.w.push(m.captured.toUpperCase());
                  else newCaptured.b.push(m.captured.toUpperCase());
                }
              });
              setCaptured(newCaptured);

              if (moveResult.captured) {
                audio.playCapture();
              } else {
                audio.playMove();
              }

              if (chessRef.current.inCheck() && !chessRef.current.isCheckmate()) {
                audio.playCheck();
              }

              setSelectedSquare(null);
              setLegalMoves([]);

              // Cek game over
              if (chessRef.current.isGameOver()) {
                setGameState('ended');
                if (chessRef.current.isCheckmate()) {
                  setWinner(myColor); // Pemain menang!
                  setWinReason('checkmate');
                } else {
                  setWinner('draw');
                  setWinReason(chessRef.current.isStalemate() ? 'stalemate' : 'draw');
                }
                audio.playWin();
                return;
              }

              // Giliran Bot!
              executeBotMove(chessRef.current, myColor, botDifficulty);
              return;
            }
          } catch (err) {
            console.error('[MOVE ERROR]', err);
          }
        } else {
          // Eksekusi langkah di mode 2 Player (WebSocket)
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: 'make_move',
                roomCode,
                from: selectedSquare,
                to: square,
                promotion: 'q'
              })
            );
          }
          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }
      }
    }

    // Cek apakah petak memiliki bidak milik pemain saat ini
    const piece = chessRef.current.get(square as any);
    if (piece && piece.color === myColor) {
      setSelectedSquare(square);
      const moves = chessRef.current.moves({ square: square as any, verbose: true });
      setLegalMoves(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Render petak papan catur 8x8
  const renderBoardSquares = () => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = myColor === 'b' ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
    const orderedFiles = myColor === 'b' ? [...files].reverse() : files;

    const squares: React.ReactNode[] = [];

    ranks.forEach((rank, rIdx) => {
      orderedFiles.forEach((file, fIdx) => {
        const squareName = `${file}${rank}`;
        const isLight = (rIdx + fIdx) % 2 === 0;
        const piece = chessRef.current.get(squareName as any);
        const isSelected = selectedSquare === squareName;
        const isLegalTarget = legalMoves.includes(squareName);
        const isLastMoveSquare = lastMove && (lastMove.from === squareName || lastMove.to === squareName);
        const isKingInCheck = isCheck && piece && piece.type === 'k' && piece.color === turn;

        const pieceKey = piece ? `${piece.color}${piece.type.toUpperCase()}` : null;
        const pieceSymbol = pieceKey ? CHESS_PIECE_SYMBOLS[pieceKey] : null;

        squares.push(
          <div
            key={squareName}
            id={`chess-sq-${squareName}`}
            onClick={() => handleSquareClick(squareName)}
            className={`relative flex items-center justify-center cursor-pointer transition-all duration-150 select-none ${
              isLight
                ? 'bg-[#edd5be] hover:bg-[#f5e3d0]'
                : 'bg-[#8c5228] hover:bg-[#9d5f32]'
            } ${isSelected ? 'ring-4 ring-amber-400 z-10 brightness-110 shadow-inner' : ''} ${
              isLastMoveSquare ? 'ring-2 ring-amber-300/80 bg-amber-200/40' : ''
            } ${isKingInCheck ? 'bg-red-700/80 animate-pulse ring-4 ring-red-500' : ''}`}
            style={{
              aspectRatio: '1/1',
              boxShadow: isLight
                ? 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.1)'
                : 'inset 0 1px 3px rgba(255,255,255,0.15), inset 0 -2px 3px rgba(0,0,0,0.35)'
            }}
          >
            {fIdx === 0 && (
              <span className="absolute top-0.5 left-1 text-[9px] font-bold opacity-60 pointer-events-none select-none text-stone-800">
                {rank}
              </span>
            )}
            {rIdx === 7 && (
              <span className="absolute bottom-0.5 right-1 text-[9px] font-bold opacity-60 pointer-events-none select-none text-stone-800">
                {file}
              </span>
            )}

            {isLegalTarget && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {piece ? (
                  <div className="w-full h-full border-4 border-emerald-500/90 rounded-full animate-pulse" />
                ) : (
                  <div className="w-4 h-4 bg-emerald-600/75 rounded-full shadow-sm ring-2 ring-emerald-300/60" />
                )}
              </div>
            )}

            {pieceSymbol && (
              <span
                className={`text-3xl sm:text-4xl md:text-5xl font-serif leading-none filter transition-transform hover:scale-110 ${
                  piece?.color === 'w'
                    ? 'text-[#fcfaf5] drop-shadow-[0_4px_3px_rgba(0,0,0,0.65)] [text-shadow:_0_1px_2px_#332014,_0_0_8px_rgba(255,255,255,0.4)]'
                    : 'text-[#1e130c] drop-shadow-[0_4px_3px_rgba(0,0,0,0.8)] [text-shadow:_0_1px_1px_rgba(255,255,255,0.3),_0_0_2px_#000]'
                }`}
                style={{
                  transform: 'translateZ(15px)',
                  fontFamily: '"Apple Color Emoji", "Segoe UI Symbol", "Noto Color Emoji", serif'
                }}
              >
                {pieceSymbol}
              </span>
            )}
          </div>
        );
      });
    });

    return squares;
  };

  const renderCapturedPieces = (pieces: string[], isWhite: boolean) => {
    return (
      <div className="flex flex-wrap items-center gap-1 min-h-[24px]">
        {pieces.map((p, idx) => {
          const sym = CHESS_PIECE_SYMBOLS[`${isWhite ? 'b' : 'w'}${p}`] || p;
          return (
            <span
              key={idx}
              className={`text-lg font-serif ${
                isWhite ? 'text-stone-900' : 'text-stone-200'
              } drop-shadow-sm`}
            >
              {sym}
            </span>
          );
        })}
      </div>
    );
  };

  // Info label bot
  const getDifficultyBadge = (diff: AiDifficulty) => {
    switch (diff) {
      case 'easy':
        return { label: 'Easy', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Shield };
      case 'normal':
        return { label: 'Normal', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Zap };
      case 'hard':
        return { label: 'Hard', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Flame };
      case 'extreme':
        return { label: 'Extreme', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: BrainCircuit };
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-3 sm:px-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#804d26] to-[#452713] flex items-center justify-center text-amber-100 shadow-md ring-2 ring-amber-700/30">
            <span className="text-2xl">♟️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-stone-900 tracking-tight">
                Catur 3D Klasik
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {gameMode === 'bot' ? 'Lawan Bot AI' : '2 Player Multiplayer'}
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Papan kayu klasik 3D asli • Mode Lawan Bot (4 Level) & 2 Player Realtime
            </p>
          </div>
        </div>

        {/* Right Controls: Name, Sound, WS Status, Guide */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Name Tag */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-300 text-xs font-medium text-stone-800">
            <User className="w-3.5 h-3.5 text-stone-600" />
            {isEditingName ? (
              <input
                type="text"
                defaultValue={playerName}
                autoFocus
                onBlur={(e) => handleSaveName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName((e.target as any).value);
                }}
                className="w-24 px-1 py-0.5 text-xs bg-white border border-stone-400 rounded outline-none"
              />
            ) : (
              <span
                onClick={() => setIsEditingName(true)}
                className="cursor-pointer hover:underline font-semibold"
                title="Klik untuk ubah nama"
              >
                {playerName}
              </span>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              audio.enabled = !soundEnabled;
              setSoundEnabled(!soundEnabled);
            }}
            title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          </button>

          {/* Tutorial Button */}
          <button
            onClick={() => setShowTutorialModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Panduan</span>
          </button>

          {/* WebSocket Status Indicator (hanya tampil saat di mode multiplayer) */}
          {gameMode === 'multiplayer' && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border ${
                wsConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {wsConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-rose-600" />}
              <span className="hidden sm:inline">{wsConnected ? 'WebSocket Aktif' : 'Terputus'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message Toast */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-shake">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* =========================================================================
          VIEW LOBBY: PILIHAN 2 MODE [LAWAN BOT] ATAU [2 PLAYER]
          ========================================================================= */}
      {gameState === 'lobby' && (
        <div className="max-w-2xl mx-auto my-4">
          {/* TAB MODE SWITCHER BESAR */}
          <div className="flex items-center justify-center p-1.5 rounded-2xl bg-stone-200/90 border border-stone-300 shadow-inner mb-8">
            <button
              id="mode-bot-tab-btn"
              onClick={() => {
                setGameMode('bot');
                handleStartBotGame(botDifficulty, botColorPreference);
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                gameMode === 'bot'
                  ? 'bg-gradient-to-r from-amber-800 to-amber-900 text-amber-50 shadow-md scale-101'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>[ 🤖 LAWAN BOT ]</span>
            </button>
            <button
              id="mode-multiplayer-tab-btn"
              onClick={() => setGameMode('multiplayer')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                gameMode === 'multiplayer'
                  ? 'bg-gradient-to-r from-stone-800 to-stone-900 text-stone-50 shadow-md scale-101'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-4 h-4 text-stone-300" />
              <span>[ 👥 2 PLAYER ]</span>
            </button>
          </div>

          {/* =====================================================================
              SUB-VIEW 1: MODE [LAWAN BOT] DENGAN 4 PILIHAN KESULITAN
              ===================================================================== */}
          {gameMode === 'bot' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-amber-50/70 to-amber-100/30 border-2 border-amber-300/80 shadow-md">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-800 to-amber-950 text-amber-100 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                  🤖
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  Tanding Catur Lawan Bot AI
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Pilih tingkat keahlian bot mulai dari Easy, Normal, Hard hingga Extreme!
                </p>
              </div>

              {/* 4 Pilihan Mode Kesulitan */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
                  Tingkat Kesulitan Bot (4 Mode):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['easy', 'normal', 'hard', 'extreme'] as AiDifficulty[]).map((diff) => {
                    const isSelected = botDifficulty === diff;
                    const badge = getDifficultyBadge(diff);
                    const IconComponent = badge.icon;
                    return (
                      <button
                        key={diff}
                        id={`bot-diff-${diff}`}
                        onClick={() => setBotDifficulty(diff)}
                        className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center ${
                          isSelected
                            ? 'bg-amber-900 border-amber-950 text-amber-50 shadow-md scale-102 ring-2 ring-amber-400/50'
                            : 'bg-white border-stone-300 text-stone-800 hover:border-amber-400 hover:bg-amber-50/50'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${
                            isSelected ? 'bg-amber-800/90 text-amber-200' : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs capitalize">{badge.label}</span>
                        <span
                          className={`text-[10px] mt-0.5 ${
                            isSelected ? 'text-amber-200/90' : 'text-stone-500'
                          }`}
                        >
                          {diff === 'easy' && 'Pemula / Santai'}
                          {diff === 'normal' && 'Sedang / Standar'}
                          {diff === 'hard' && 'Sulit / Taktis'}
                          {diff === 'extreme' && 'Master / Ekstrem'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pilihan Warna Pion */}
              <div className="mb-8">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
                  Warna Bidak Anda:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => setBotColorPreference('w')}
                    className={`py-3 px-3 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      botColorPreference === 'w'
                        ? 'bg-white border-amber-600 text-stone-900 shadow-md ring-2 ring-amber-300'
                        : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-white'
                    }`}
                  >
                    <span className="text-xl">♔</span>
                    <span>Putih (Jalan 1st)</span>
                  </button>
                  <button
                    onClick={() => setBotColorPreference('b')}
                    className={`py-3 px-3 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      botColorPreference === 'b'
                        ? 'bg-stone-900 border-amber-600 text-stone-50 shadow-md ring-2 ring-amber-300'
                        : 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-900'
                    }`}
                  >
                    <span className="text-xl">♚</span>
                    <span>Hitam (Jalan 2nd)</span>
                  </button>
                  <button
                    onClick={() => setBotColorPreference('random')}
                    className={`py-3 px-3 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      botColorPreference === 'random'
                        ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-md ring-2 ring-amber-300'
                        : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-white'
                    }`}
                  >
                    <span className="text-lg">🎲</span>
                    <span>Acak (Random)</span>
                  </button>
                </div>
              </div>

              {/* Tombol Mulai Lawan Bot */}
              <button
                id="catur-btn-start-bot"
                onClick={handleStartBotGame}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-800 to-amber-950 hover:from-amber-700 hover:to-amber-900 text-amber-50 font-black text-sm sm:text-base shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2.5"
              >
                <Swords className="w-5 h-5 text-amber-300" />
                <span>Mulai Tanding Lawan Bot Sekarang</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          )}

          {/* =====================================================================
              SUB-VIEW 2: MODE [2 PLAYER] MULTIPLAYER REALTIME (WEBSOCKET)
              ===================================================================== */}
          {gameMode === 'multiplayer' && (
            <div>
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  Tanding Catur 2 Player Realtime
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Buat room dan bagikan kode 4 digit ke teman, atau masukkan kode 4 digit untuk otomatis tanding seketika!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1: Buat Room Baru */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-50/70 to-amber-100/40 border-2 border-amber-300/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-800 text-amber-100 flex items-center justify-center text-2xl mb-4 shadow-inner">
                      ♔
                    </div>
                    <h4 className="text-lg font-bold text-stone-900 mb-1">Buat Room Baru</h4>
                    <p className="text-xs text-stone-600 mb-6 leading-relaxed">
                      Sistem akan membuatkan kode 4 digit unik. Anda bermain sebagai <b>Pemain Putih</b>.
                    </p>
                  </div>

                  <button
                    id="catur-btn-create-room"
                    onClick={handleCreateRoom}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-amber-50 font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Buat Room Sekarang</span>
                  </button>
                </div>

                {/* Card 2: Masukkan Kode (Auto Start tanpa nunggu tombol!) */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-stone-50 to-stone-100/70 border-2 border-stone-300/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-stone-800 text-stone-100 flex items-center justify-center text-2xl mb-4 shadow-inner">
                      ♚
                    </div>
                    <h4 className="text-lg font-bold text-stone-900 mb-1">Masuk Room Lawan</h4>
                    <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                      Ketik <b>4 Digit Kode</b> room lawan. Begitu kode terisi, game <b>otomatis langsung mulai</b>!
                    </p>

                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Kode Room (4 Digit)
                      </label>
                      <input
                        id="catur-input-join-code"
                        type="text"
                        maxLength={4}
                        value={inputCode}
                        onChange={handleInputChange}
                        placeholder="Contoh: 7K2M"
                        className="w-full text-center tracking-[0.4em] font-mono text-2xl font-black uppercase py-3 px-4 rounded-2xl bg-white border-2 border-amber-600/70 text-amber-950 focus:ring-4 focus:ring-amber-200 outline-none shadow-inner"
                      />
                      <span className="block text-[11px] text-center text-amber-800 mt-1.5 font-medium">
                        ⚡ Otomatis terhubung begitu 4 digit dimasukkan
                      </span>
                    </div>
                  </div>

                  <button
                    id="catur-btn-join-room"
                    onClick={() => handleJoinRoom(inputCode)}
                    disabled={inputCode.length !== 4}
                    className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:hover:bg-stone-900 text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Swords className="w-4 h-4" />
                    <span>Gabung Pertandingan</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: WAITING FOR OPPONENT (2 Player Mode)
          ========================================================================= */}
      {gameState === 'waiting' && (
        <div className="max-w-md mx-auto my-8 p-8 rounded-3xl bg-amber-50/80 border-2 border-amber-300 shadow-lg text-center">
          <div className="w-16 h-16 rounded-full bg-amber-800 text-amber-100 flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
            ♔
          </div>
          <h3 className="text-xl font-black text-stone-900 mb-1">Room Berhasil Dibuat!</h3>
          <p className="text-xs text-stone-600 mb-6">
            Berikan kode 4 digit ini kepada temanmu. Begitu temanmu memasukkan kode, pertandingan <b>otomatis langsung mulai</b>!
          </p>

          {/* 4 Digit Code Box */}
          <div className="p-4 rounded-2xl bg-white border-2 border-amber-600/50 shadow-inner mb-6">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Kode Room Anda
            </span>
            <div className="text-4xl font-black tracking-[0.3em] font-mono text-amber-900 mb-3">
              {roomCode}
            </div>
            <button
              id="catur-btn-copy-code"
              onClick={handleCopyCode}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-amber-300"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kode Berhasil Disalin!' : 'Salin Kode (Copy)'}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-900 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
            <span>Menunggu lawan memasukkan kode di web...</span>
          </div>

          <button
            onClick={handleLeaveRoom}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 underline"
          >
            Batalkan & Kembali ke Menu
          </button>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: PLAYING & ENDED (PAPAN CATUR 3D KAYU ASLI BERUJUNG BULAT)
          ========================================================================= */}
      {(gameState === 'playing' || gameState === 'ended') && (
        <div className="flex flex-col items-center">
          {/* BAR PEMILIHAN TANTANGAN DI ATAS PAPAN CATUR */}
          {gameMode === 'bot' ? (
            <div className="w-full max-w-xl mb-3.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 border-2 border-amber-600/70 text-amber-100 shadow-md">
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-800/40">
                <div className="flex items-center gap-1.5 text-xs font-black tracking-wide text-amber-200">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>PILIHAN TANTANGAN BOT:</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Switcher Mode 2-Player */}
                  <button
                    id="top-btn-switch-multiplayer"
                    onClick={() => {
                      setGameMode('multiplayer');
                      setGameState('lobby');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-stone-600 text-xs font-bold transition-all shadow-xs"
                    title="Beralih ke tanding 2-Player bersama teman via kode"
                  >
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>👥 2-Player</span>
                  </button>

                  {/* Reset Game / Papan Baru */}
                  <button
                    id="top-btn-reset-board"
                    onClick={() => handleStartBotGame(botDifficulty, botColorPreference)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-800/90 hover:bg-amber-700 text-amber-100 border border-amber-500 text-xs font-bold transition-all shadow-xs"
                    title="Mulai Ulang Papan Catur Baru"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Papan Baru</span>
                  </button>
                </div>
              </div>

              {/* 4 Pilihan Tingkat Kesulitan: Easy, Normal (Default), Hard, Extreme */}
              <div className="grid grid-cols-4 gap-1.5">
                {(['easy', 'normal', 'hard', 'extreme'] as AiDifficulty[]).map((diff) => {
                  const isCurrent = botDifficulty === diff;
                  const badge = getDifficultyBadge(diff);
                  const IconComponent = badge.icon;
                  return (
                    <button
                      key={diff}
                      id={`top-diff-btn-${diff}`}
                      onClick={() => handleSelectDifficulty(diff)}
                      className={`py-2 px-1 sm:px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border cursor-pointer ${
                        isCurrent
                          ? 'bg-gradient-to-b from-amber-400 to-amber-500 border-amber-200 text-stone-950 shadow-md ring-2 ring-amber-300/80 font-black scale-102'
                          : 'bg-stone-800/80 hover:bg-stone-700/80 border-stone-700 text-stone-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <IconComponent className={`w-3.5 h-3.5 ${isCurrent ? 'text-stone-950' : 'text-amber-400'}`} />
                        <span className="capitalize">{badge.label}</span>
                      </div>
                      {diff === 'normal' && (
                        <span className={`text-[9px] -mt-0.5 ${isCurrent ? 'text-stone-900 font-extrabold' : 'text-amber-300/80'}`}>
                          ★ Default
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-xl mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 border-2 border-amber-600/70 text-stone-100 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-200">Mode 2-Player (Realtime)</span>
              </div>
              <button
                id="top-btn-return-bot"
                onClick={() => {
                  setGameMode('bot');
                  setGameState('playing');
                  handleStartBotGame('normal', 'w');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-amber-50 border border-amber-500 text-xs font-bold shadow-xs transition-all"
              >
                <Bot className="w-3.5 h-3.5 text-amber-300" />
                <span>🤖 Lawan Bot (Normal)</span>
              </button>
            </div>
          )}

          {/* Status Match Bar */}
          <div className="w-full max-w-xl flex items-center justify-between p-3 rounded-2xl bg-stone-100/90 border border-stone-300 mb-4 shadow-xs">
            <div className="flex items-center gap-2">
              {gameMode === 'bot' ? (
                <div className="flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-amber-800" />
                  <span className="text-xs font-bold text-stone-800">Tingkat:</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                      getDifficultyBadge(botDifficulty).color
                    }`}
                  >
                    {botDifficulty.toUpperCase()}
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-xs font-bold text-stone-600">Room:</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-stone-300 font-mono font-black text-amber-900 text-xs">
                    {roomCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    title="Salin kode room"
                    className="p-1 hover:bg-white rounded text-stone-600"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </>
              )}
            </div>

            {/* Turn Banner */}
            <div className="text-center">
              {gameState === 'ended' ? (
                <span className="text-xs font-black text-emerald-800 uppercase px-3 py-1 bg-emerald-100 rounded-full border border-emerald-300">
                  🏆 Permainan Selesai
                </span>
              ) : isBotThinking ? (
                <div className="flex items-center gap-1.5 text-amber-800 animate-pulse">
                  <BrainCircuit className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-xs font-bold">Bot sedang berpikir...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      turn === myColor ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span className="text-xs font-black text-stone-900">
                    {turn === myColor ? '🟢 Giliran Kamu Melangkah!' : '⏳ Menunggu Langkah Lawan...'}
                  </span>
                </div>
              )}
            </div>

            {/* Leave button */}
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900 p-1 rounded hover:bg-rose-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>

          {/* Opponent Info Box (Atas) */}
          <div className="w-full max-w-xl flex items-center justify-between px-4 py-2.5 rounded-t-2xl bg-gradient-to-r from-stone-800 to-stone-900 text-stone-100 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{myColor === 'w' ? '♚' : '♔'}</span>
              <div>
                <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>
                    {myColor === 'w'
                      ? blackPlayer?.name || (gameMode === 'bot' ? `Oguri Bot (${botDifficulty})` : 'Lawan (Hitam)')
                      : whitePlayer?.name || (gameMode === 'bot' ? `Oguri Bot (${botDifficulty})` : 'Lawan (Putih)')}
                  </span>
                  {gameMode === 'bot' && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-600/60 text-[9px] font-semibold text-amber-200 uppercase">
                      Bot AI
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-stone-400">
                  {myColor === 'w' ? 'Bidak Hitam' : 'Bidak Putih'}
                </div>
              </div>
            </div>
            {renderCapturedPieces(myColor === 'w' ? captured.w : captured.b, myColor !== 'w')}
          </div>

          {/* =================================================================
              PAPAN CATUR 3D REALISTIS BERUJUNG BULAT (TRANSPARAN DI LUARNYA)
              ================================================================= */}
          <div
            className="my-3 w-full flex items-center justify-center select-none"
            style={{
              perspective: '1100px',
              backgroundColor: 'transparent'
            }}
          >
            {/* Outer 3D Wooden Bezel / Bingkai Kayu Berujung Bulat */}
            <div
              id="catur-3d-board-wrapper"
              className="relative p-4 sm:p-5 transition-transform duration-300"
              style={{
                width: 'min(92vw, 440px)',
                aspectRatio: '1/1',
                borderRadius: '32px', // Ujungnya bulat bukan kotak!
                background:
                  'radial-gradient(ellipse at 50% 20%, #7a4623 0%, #522d15 60%, #381e0d 100%)',
                boxShadow:
                  '0 20px 35px -5px rgba(50, 25, 10, 0.45), 0 10px 15px -3px rgba(0, 0, 0, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.25), inset 0 -6px 8px rgba(0, 0, 0, 0.6)',
                border: '4px solid #4a2711',
                transform: 'rotateX(16deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Inner Carved Wood Bevel Border */}
              <div
                className="w-full h-full p-2"
                style={{
                  borderRadius: '24px',
                  background:
                    'linear-gradient(135deg, #43220e 0%, #2b1509 100%)',
                  boxShadow:
                    'inset 0 2px 6px rgba(0, 0, 0, 0.7), 0 1px 2px rgba(255, 255, 255, 0.15)'
                }}
              >
                {/* 8x8 Chess Grid Container */}
                <div
                  id="catur-3d-board"
                  className="grid grid-cols-8 grid-rows-8 w-full h-full overflow-hidden shadow-inner"
                  style={{
                    borderRadius: '18px'
                  }}
                >
                  {renderBoardSquares()}
                </div>
              </div>
            </div>
          </div>

          {/* Player Info Box (Bawah / Anda Sendiri) */}
          <div className="w-full max-w-xl flex items-center justify-between px-4 py-2.5 rounded-b-2xl bg-gradient-to-r from-amber-900 to-[#502c14] text-amber-50 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{myColor === 'w' ? '♔' : '♚'}</span>
              <div>
                <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>{playerName} (Kamu)</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-700/80 text-[10px] font-semibold">
                    {myColor === 'w' ? 'Putih' : 'Hitam'}
                  </span>
                </div>
                <div className="text-[10px] text-amber-200/80">
                  {turn === myColor ? '⚡ Giliran Anda sekarang' : 'Menunggu langkah lawan'}
                </div>
              </div>
            </div>
            {renderCapturedPieces(myColor === 'w' ? captured.b : captured.w, myColor === 'w')}
          </div>

          {/* Modal Game Over */}
          {gameState === 'ended' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
              <div className="max-w-sm w-full p-6 rounded-3xl bg-white border-2 border-amber-600 shadow-2xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                  {winner === myColor ? '👑' : winner === 'draw' ? '🤝' : '⚔️'}
                </div>
                <h3 className="text-2xl font-black text-stone-900 mb-1">
                  {winner === myColor
                    ? 'Selamat, Kamu Menang!'
                    : winner === 'draw'
                    ? 'Hasil Imbang (Remis)'
                    : gameMode === 'bot'
                    ? `Bot ${botDifficulty.toUpperCase()} Menang!`
                    : 'Kamu Kalah'}
                </h3>
                <p className="text-xs text-stone-600 mb-6">
                  {winReason === 'checkmate'
                    ? 'Skakmat! Raja tidak memiliki jalan keluar lagi.'
                    : winReason === 'stalemate'
                    ? 'Stalemate! Tidak ada langkah sah yang tersisa.'
                    : 'Permainan telah berakhir.'}
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleRematch}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Main Lagi (Rematch)</span>
                  </button>
                  <button
                    onClick={handleLeaveRoom}
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
                  >
                    Kembali ke Menu Utama
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL TUTORIAL CATUR
          ========================================================================= */}
      {showTutorialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-white border border-stone-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <h3 className="text-lg font-black text-stone-900">
                  Panduan Gerakan Catur
                </h3>
              </div>
              <button
                onClick={() => setShowTutorialModal(false)}
                className="text-stone-500 hover:text-stone-800 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-medium">
                🎯 <b>Tujuan:</b> Menjebak Raja lawan sampai tidak dapat melangkah atau diselamatkan lagi (<b>Skakmat / Checkmate</b>).
              </div>

              <div className="p-3 rounded-xl bg-stone-100 border border-stone-300">
                <h4 className="font-bold text-stone-900 mb-1">🎮 Mode Permainan Tersedia:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li><b>[🤖 Lawan Bot]:</b> Latihan solo offline dengan 4 tingkat kesulitan: <i>Easy (Santai), Normal (Standar), Hard (Sulit), Extreme (Master)</i>.</li>
                  <li><b>[👥 2 Player]:</b> Tanding multiplayer realtime via WebSocket menggunakan kode 4 digit instan.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 text-sm">Gerakan Tiap Bidak:</h4>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <b className="text-stone-900">♙ Pion (Pawn):</b> Maju 1 petak ke depan (langkah pertama bisa 2 petak). Menyerang/memakan secara diagonal 1 petak.
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <b className="text-stone-900">♘ Kuda (Knight):</b> Melangkah pola huruf <b>L</b> (2 petak lurus + 1 petak belok). Satu-satunya bidak yang <b>bisa melompati</b> bidak lain!
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <b className="text-stone-900">♗ Gajah / Peluncur (Bishop):</b> Melangkah diagonal (miring) bebas sejauh mungkin di jalur warnanya.
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <b className="text-stone-900">♖ Benteng (Rook):</b> Melangkah lurus vertikal atau horizontal bebas sejauh tidak terhalang.
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <b className="text-stone-900">♕ Menteri / Ratu (Queen):</b> Bidak terkuat! Bebas melangkah ke segala arah (lurus maupun diagonal) sejauh mungkin.
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <b className="text-stone-900">♔ Raja (King):</b> Melangkah 1 petak ke segala arah. Wajib selalu dilindungi dari serangan.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowTutorialModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
