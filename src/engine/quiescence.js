// Quiescence search — extends the search along capture sequences at leaf nodes
// to avoid evaluating positions in the middle of tactical exchanges.

import { evaluateBoard } from './evaluation.js';
import { orderMoves } from './moveOrdering.js';

/** Search only capture moves until the position is quiet. */
export function quiescenceSearch(chess, alpha, beta, stats, isTimeUp) {
  stats.quiescenceNodes++;

  if (isTimeUp()) {
    return alpha;
  }

  // Stand pat: if static eval beats beta, prune this branch
  const turn = chess.turn();
  const isWhite = turn === 'w';
  const standPat = evaluateBoard(chess) * (isWhite ? 1 : -1);

  if (standPat >= beta) {
    return beta;
  }
  if (standPat > alpha) {
    alpha = standPat;
  }

  // Generate capture-only moves
  const moves = chess._moves ? chess._moves() : chess.moves({ verbose: true });
  const captures = moves.filter(m => m.captured || (typeof m.flags === 'number' && (m.flags & 16)));

  if (captures.length === 0) {
    return standPat;
  }

  // Order captures (MVV-LVA)
  orderMoves(captures, null, 0);

  // Search each capture
  for (const move of captures) {
    if (chess._makeMove) {
      chess._makeMove(move);
    } else {
      chess.move(move);
    }

    const score = -quiescenceSearch(chess, -beta, -alpha, stats, isTimeUp);

    if (chess._undoMove) {
      chess._undoMove();
    } else {
      chess.undo();
    }

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
