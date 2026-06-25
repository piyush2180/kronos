// Move Ordering for Alpha-Beta Pruning
// Orders moves to maximize search pruning (alpha-beta cutoffs)

import { PIECE_INDICES } from './zobrist.js';

// MVV-LVA table: [Victim][Attacker]
// Victim:   P=0, N=1, B=2, R=3, Q=4, K=5
// Attacker: P=0, N=1, B=2, R=3, Q=4, K=5
const MVV_LVA_VALUES = [100, 200, 300, 400, 500, 600];

// Killer moves: 2 moves per depth level
const killerMoves = Array.from({ length: 64 }, () => [null, null]);

export function clearKillerMoves() {
  for (let i = 0; i < 64; i++) {
    killerMoves[i][0] = null;
    killerMoves[i][1] = null;
  }
}

export function storeKillerMove(move, depth) {
  if (depth < 64) {
    if (isSameMove(killerMoves[depth][0], move)) return;
    killerMoves[depth][1] = killerMoves[depth][0];
    killerMoves[depth][0] = { from: move.from, to: move.to, promotion: move.promotion };
  }
}

function isSameMove(m1, m2) {
  if (!m1 || !m2) return false;
  return m1.from === m2.from && m1.to === m2.to && m1.promotion === m2.promotion;
}

/**
 * Score a single move for sorting. Higher score = search first.
 * @param {object} move - chess.js move object
 * @param {object|null} pvMove - The best move from the transposition table or PV
 * @param {number} searchDepth - The current depth in minimax
 */
function scoreMove(move, pvMove, searchDepth) {
  // 1. Principal Variation / Transposition Table move is absolute priority
  if (pvMove && isSameMove(move, pvMove)) {
    return 100000;
  }

  // 2. Captures: Order by MVV-LVA
  if (move.captured) {
    const victimIdx = PIECE_INDICES[move.captured.toLowerCase()];
    const attackerIdx = PIECE_INDICES[move.piece.toLowerCase()];
    const victimVal = MVV_LVA_VALUES[victimIdx] || 100;
    const attackerVal = attackerIdx || 0;
    return 50000 + victimVal * 10 - attackerVal;
  }

  // 3. Promotions: High value
  if (move.promotion) {
    if (move.promotion === 'q') return 40000;
    if (move.promotion === 'r') return 30000;
    if (move.promotion === 'b') return 20000;
    if (move.promotion === 'n') return 15000;
  }

  // 4. Killer Moves (quiet moves that caused beta-cutoffs in sibling nodes)
  if (searchDepth < 64) {
    if (isSameMove(move, killerMoves[searchDepth][0])) return 9000;
    if (isSameMove(move, killerMoves[searchDepth][1])) return 8000;
  }

  // 5. Castling / Center control or general quiet moves
  let score = 0;
  const toCol = move.to.charCodeAt(0) - 97;
  const toRow = parseInt(move.to[1]) - 1;
  
  if (toCol >= 2 && toCol <= 5 && toRow >= 2 && toRow <= 5) {
    score += 50;
  }

  // Encourage castles
  if (move.san === 'O-O' || move.san === 'O-O-O') {
    score += 100;
  }

  return score;
}

/**
 * Sorts an array of moves in place
 * @param {object[]} moves - Legal moves array
 * @param {object|null} pvMove - Best move from TT
 * @param {number} depth - Search depth
 */
export function orderMoves(moves, pvMove, depth) {
  return moves.sort((a, b) => scoreMove(b, pvMove, depth) - scoreMove(a, pvMove, depth));
}
