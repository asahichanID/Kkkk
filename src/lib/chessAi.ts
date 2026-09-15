import { Chess } from 'chess.js';

export type AiDifficulty = 'easy' | 'normal' | 'hard' | 'extreme';

// Nilai dasar bidak catur
const PIECE_BASE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Piece-Square Tables (PST) berorientasi Putih (8 baris x 8 kolom dari rank 8 ke rank 1)
const PAWN_PST = [
  [0,   0,   0,   0,   0,   0,   0,   0],
  [50,  50,  50,  50,  50,  50,  50,  50],
  [10,  10,  20,  30,  30,  20,  10,  10],
  [5,   5,  10,  25,  25,  10,   5,   5],
  [0,   0,   0,  20,  20,   0,   0,   0],
  [5,  -5, -10,   0,   0, -10,  -5,   5],
  [5,  10,  10, -20, -20,  10,  10,   5],
  [0,   0,   0,   0,   0,   0,   0,   0]
];

const KNIGHT_PST = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20,   0,   0,   0,   0, -20, -40],
  [-30,   0,  10,  15,  15,  10,   0, -30],
  [-30,   5,  15,  20,  20,  15,   5, -30],
  [-30,   0,  15,  20,  20,  15,   0, -30],
  [-30,   5,  10,  15,  15,  10,   5, -30],
  [-40, -20,   0,   5,   5,   0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50]
];

const BISHOP_PST = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10,   0,   0,   0,   0,   0,   0, -10],
  [-10,   0,   5,  10,  10,   5,   0, -10],
  [-10,   5,   5,  10,  10,   5,   5, -10],
  [-10,   0,  10,  10,  10,  10,   0, -10],
  [-10,  10,  10,  10,  10,  10,  10, -10],
  [-10,   5,   0,   0,   0,   0,   5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20]
];

const ROOK_PST = [
  [0,   0,   0,   0,   0,   0,   0,   0],
  [5,  10,  10,  10,  10,  10,  10,   5],
  [-5,   0,   0,   0,   0,   0,   0,  -5],
  [-5,   0,   0,   0,   0,   0,   0,  -5],
  [-5,   0,   0,   0,   0,   0,   0,  -5],
  [-5,   0,   0,   0,   0,   0,   0,  -5],
  [-5,   0,   0,   0,   0,   0,   0,  -5],
  [0,   0,   0,   5,   5,   0,   0,   0]
];

const QUEEN_PST = [
  [-20, -10, -10,  -5,  -5, -10, -10, -20],
  [-10,   0,   0,   0,   0,   0,   0, -10],
  [-10,   0,   5,   5,   5,   5,   0, -10],
  [-5,   0,   5,   5,   5,   5,   0,  -5],
  [0,   0,   5,   5,   5,   5,   0,  -5],
  [-10,   5,   5,   5,   5,   5,   0, -10],
  [-10,   0,   5,   0,   0,   0,   0, -10],
  [-20, -10, -10,  -5,  -5, -10, -10, -20]
];

const KING_MIDGAME_PST = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20,  20,   0,   0,   0,   0,  20,  20],
  [20,  30,  10,   0,   0,  10,  30,  20]
];

function getPstBonus(type: string, rankIdx: number, fileIdx: number, isWhite: boolean): number {
  const r = isWhite ? rankIdx : 7 - rankIdx;
  const f = isWhite ? fileIdx : 7 - fileIdx;

  switch (type) {
    case 'p': return PAWN_PST[r][f];
    case 'n': return KNIGHT_PST[r][f];
    case 'b': return BISHOP_PST[r][f];
    case 'r': return ROOK_PST[r][f];
    case 'q': return QUEEN_PST[r][f];
    case 'k': return KING_MIDGAME_PST[r][f];
    default: return 0;
  }
}

/**
 * Evaluasi posisi papan dari sudut pandang Putih (positif = unggul Putih, negatif = unggul Hitam)
 */
function evaluateBoard(chess: Chess, usePst: boolean = true): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -99999 : 99999;
  }
  if (chess.isDraw() || chess.isStalemate()) {
    return 0;
  }

  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;

      const val = PIECE_BASE_VALUES[piece.type] || 0;
      const pst = usePst ? getPstBonus(piece.type, r, f, piece.color === 'w') : 0;
      const total = val + pst;

      if (piece.color === 'w') {
        score += total;
      } else {
        score -= total;
      }
    }
  }

  return score;
}

/**
 * Minimax dengan Alpha-Beta Pruning
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess, true);
  }

  const moves = chess.moves({ verbose: true });

  // Move ordering: prioritas tangkapan & skak agar pruning lebih efektif
  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += (PIECE_BASE_VALUES[a.captured] || 0) * 10 - (PIECE_BASE_VALUES[a.piece] || 0);
    if (b.captured) scoreB += (PIECE_BASE_VALUES[b.captured] || 0) * 10 - (PIECE_BASE_VALUES[b.piece] || 0);
    if (a.san.includes('+')) scoreA += 50;
    if (b.san.includes('+')) scoreB += 50;
    return scoreB - scoreA;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalVal = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evalVal);
      alpha = Math.max(alpha, evalVal);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalVal = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evalVal);
      beta = Math.min(beta, evalVal);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Mendapatkan langkah terbaik AI berdasarkan tingkat kesulitan
 */
export function getBestAiMove(
  chess: Chess,
  difficulty: AiDifficulty
): { from: string; to: string; promotion?: string } | null {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  const isWhite = chess.turn() === 'w';

  // 1. EASY MODE:
  // 60% acak, 40% tangkapan sederhana (blunder sesekali seperti pemula)
  if (difficulty === 'easy') {
    if (Math.random() < 0.6) {
      const rnd = moves[Math.floor(Math.random() * moves.length)];
      return { from: rnd.from, to: rnd.to, promotion: rnd.promotion || 'q' };
    }
    // Cari tangkapan langsung
    const captureMoves = moves.filter(m => Boolean(m.captured));
    if (captureMoves.length > 0) {
      const chosen = captureMoves[Math.floor(Math.random() * captureMoves.length)];
      return { from: chosen.from, to: chosen.to, promotion: chosen.promotion || 'q' };
    }
    const rnd = moves[Math.floor(Math.random() * moves.length)];
    return { from: rnd.from, to: rnd.to, promotion: rnd.promotion || 'q' };
  }

  // 2. NORMAL MODE:
  // Depth 1-2 evaluasi dasar (tahu makan perwira, sesekali menghindari skak)
  if (difficulty === 'normal') {
    let bestMoves: typeof moves = [];
    let bestScore = isWhite ? -Infinity : Infinity;

    for (const move of moves) {
      chess.move(move);
      // Evaluasi 1 ply ke depan
      const score = evaluateBoard(chess, false);
      chess.undo();

      if (isWhite) {
        if (score > bestScore) {
          bestScore = score;
          bestMoves = [move];
        } else if (score === bestScore) {
          bestMoves.push(move);
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMoves = [move];
        } else if (score === bestScore) {
          bestMoves.push(move);
        }
      }
    }

    // Beri sedikit variasi manusiawi jika ada skor setara
    const chosen = bestMoves[Math.floor(Math.random() * bestMoves.length)] || moves[0];
    return { from: chosen.from, to: chosen.to, promotion: chosen.promotion || 'q' };
  }

  // 3. HARD MODE:
  // Minimax dengan Alpha-Beta Pruning Depth 3 + Piece-Square Tables
  if (difficulty === 'hard') {
    let bestMove = moves[0];
    let bestVal = isWhite ? -Infinity : Infinity;
    const depth = 2; // Depth 2-3 search

    for (const move of moves) {
      chess.move(move);
      const evalVal = minimax(chess, depth, -Infinity, Infinity, !isWhite);
      chess.undo();

      if (isWhite) {
        if (evalVal > bestVal) {
          bestVal = evalVal;
          bestMove = move;
        }
      } else {
        if (evalVal < bestVal) {
          bestVal = evalVal;
          bestMove = move;
        }
      }
    }

    return { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion || 'q' };
  }

  // 4. EXTREME MODE:
  // Minimax dengan Alpha-Beta Pruning Depth 3 dengan PST lengkap, Move Ordering, dan evaluasi taktis mendalam
  let bestMovesList: typeof moves = [];
  let bestVal = isWhite ? -Infinity : Infinity;
  const depth = 3;

  for (const move of moves) {
    chess.move(move);
    const evalVal = minimax(chess, depth, -Infinity, Infinity, !isWhite);
    chess.undo();

    if (isWhite) {
      if (evalVal > bestVal) {
        bestVal = evalVal;
        bestMovesList = [move];
      } else if (evalVal === bestVal) {
        bestMovesList.push(move);
      }
    } else {
      if (evalVal < bestVal) {
        bestVal = evalVal;
        bestMovesList = [move];
      } else if (evalVal === bestVal) {
        bestMovesList.push(move);
      }
    }
  }

  const chosen = bestMovesList[Math.floor(Math.random() * bestMovesList.length)] || moves[0];
  return { from: chosen.from, to: chosen.to, promotion: chosen.promotion || 'q' };
}
