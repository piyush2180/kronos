// Quiescence Search
// Searches capture-only sequences to ensure static evaluation is stable (no hanging pieces)

import { evaluateBoard } from './evaluation.js';
import { orderMoves } from './moveOrdering.js';

/**
 * Quiescence search loop
 * @param {import('chess.js').Chess} chess - The chess.js instance
 * @param {number} alpha - Lower bound
 * @param {number} beta - Upper bound
 * @param {object} stats - Search performance statistics tracking node counts
 * @param {function} isTimeUp - Check if time limit exceeded
 */
export function quiescenceSearch(chess, alpha, beta, stats, isTimeUp) {
  stats.quiescenceNodes++;

  if (isTimeUp()) {
    return alpha;
  }

  // 1. Stand Pat: static evaluation serves as the lower bound
  const turn = chess.turn();
  const isWhite = turn === 'w';
  const standPat = evaluateBoard(chess) * (isWhite ? 1 : -1);

  if (standPat >= beta) {
    return beta;
  }
  if (standPat > alpha) {
    alpha = standPat;
  }

  // 2. Generate capture-only moves
  const moves = chess.moves({ verbose: true });
  const captures = moves.filter(m => m.captured || m.promotion);

  if (captures.length === 0) {
    return standPat;
  }

  // 3. Order the captures (MVV-LVA)
  orderMoves(captures, null, 0);

  // 4. Search captures
  for (const move of captures) {
    chess.move(move);
    const score = -quiescenceSearch(chess, -beta, -alpha, stats, isTimeUp);
    chess.undo();

    if (isTimeUp()) {
      return alpha;
    }

    if (score >= beta) {
      return beta;
    }
    if (score > alpha) {
      alpha = score;
    }
  }

  return alpha;
}
