// Chess AI Web Worker
// Performs deep minimax search in a background thread to prevent UI freezing.

import { Chess } from 'chess.js';
import { startSearch } from './minimax.js';
import { tt } from './transposition.js';

self.onmessage = function (e) {
  const { type, fen, maxDepth, timeLimitMs, searchId } = e.data;

  if (type === 'SEARCH') {
    try {
      const chess = new Chess(fen);

      // Perform iterative deepening search
      const result = startSearch(chess, maxDepth, timeLimitMs, (iterationData) => {
        self.postMessage({
          type: 'ITERATION_COMPLETE',
          searchId,          // echo back so host can discard stale results
          depth: iterationData.depth,
          bestMove: {
            from: iterationData.bestMove.from,
            to: iterationData.bestMove.to,
            promotion: iterationData.bestMove.promotion,
            san: iterationData.bestMove.san
          },
          score: iterationData.score,
          stats: iterationData.stats,
          timeTaken: iterationData.timeTaken,
          pv: iterationData.pv
        });
      });

      // Fallback to random legal move if search returned nothing
      let finalMove = result.bestMove;
      if (!finalMove) {
        const legalMoves = chess.moves({ verbose: true });
        if (legalMoves.length > 0) {
          const randomIdx = Math.floor(Math.random() * legalMoves.length);
          finalMove = legalMoves[randomIdx];
        }
      }

      self.postMessage({
        type: 'SEARCH_COMPLETE',
        searchId,            // echo back
        bestMove: finalMove ? {
          from: finalMove.from,
          to: finalMove.to,
          promotion: finalMove.promotion,
          san: finalMove.san
        } : null,
        score: result.score,
        stats: result.stats,
        timeTaken: result.timeTaken,
        pv: result.pv
      });

    } catch (err) {
      self.postMessage({
        type: 'ERROR',
        searchId,
        error: err.message
      });
    }
  } else if (type === 'CLEAR_CACHE') {
    tt.clear();
    self.postMessage({ type: 'CACHE_CLEARED' });
  }
};
