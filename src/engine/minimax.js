// Minimax Search with Alpha-Beta Pruning, Iterative Deepening, and Transposition Tables

import { evaluateBoard } from './evaluation.js';
import { getZobristKey } from './zobrist.js';
import { tt, TT_FLAGS } from './transposition.js';
import { orderMoves, storeKillerMove, clearKillerMoves } from './moveOrdering.js';
import { quiescenceSearch } from './quiescence.js';

const INFINITY = 1000000;
const MATE_SCORE = 100000;

let searchStartTime = 0;
let searchTimeLimit = 0;
let isSearchAborted = false;

// Statistics object
const searchStats = {
  nodesSearched: 0,
  quiescenceNodes: 0,
  transpositionHits: 0,
  betaCutoffs: 0,
  maxDepthReached: 0
};

/**
 * Checks if the search time limit has been exceeded.
 */
function isTimeUp() {
  if (isSearchAborted) return true;
  if (searchTimeLimit <= 0) return false;
  const elapsed = Date.now() - searchStartTime;
  if (elapsed >= searchTimeLimit) {
    isSearchAborted = true;
    return true;
  }
  return false;
}

/**
 * Minimax algorithm with Alpha-Beta pruning (Negamax formulation)
 */
function minimax(chess, depth, ply, alpha, beta) {
  searchStats.nodesSearched++;

  if (isTimeUp()) {
    return alpha;
  }

  // 1. Check for draws or repetitions
  if (ply > 0 && (chess.isDraw() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial())) {
    return 0;
  }

  // 2. Mate/Stalemate check
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) {
      return -MATE_SCORE + ply; // Favor faster checkmate
    }
    return 0;
  }

  // 3. Quiescence search at depth 0
  if (depth <= 0) {
    return quiescenceSearch(chess, alpha, beta, searchStats, isTimeUp);
  }

  // 4. Transposition Table lookup
  const zobristKey = getZobristKey(chess);
  const ttEntry = tt.get(zobristKey);
  let ttMove = null;

  if (ttEntry) {
    searchStats.transpositionHits++;
    ttMove = ttEntry.bestMove;

    if (ttEntry.depth >= depth) {
      const storedVal = ttEntry.value;
      let score = storedVal;
      if (score > MATE_SCORE - 100) score -= ply;
      else if (score < -MATE_SCORE + 100) score += ply;

      if (ttEntry.flag === TT_FLAGS.EXACT) {
        return score;
      }
      if (ttEntry.flag === TT_FLAGS.ALPHA && score <= alpha) {
        return alpha;
      }
      if (ttEntry.flag === TT_FLAGS.BETA && score >= beta) {
        return beta;
      }
    }
  }

  // 5. Generate and order moves
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    if (chess.inCheck()) {
      return -MATE_SCORE + ply;
    }
    return 0;
  }

  orderMoves(moves, ttMove, depth);

  let bestMoveThisNode = null;
  let oldAlpha = alpha;
  let bestScore = -INFINITY;

  // 6. Search moves
  for (const move of moves) {
    chess.move(move);
    const score = -minimax(chess, depth - 1, ply + 1, -beta, -alpha);
    chess.undo();

    if (isTimeUp()) {
      return alpha;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMoveThisNode = move;
    }

    if (score > alpha) {
      alpha = score;
    }

    if (alpha >= beta) {
      searchStats.betaCutoffs++;
      if (!move.captured) {
        storeKillerMove(move, depth);
      }
      tt.set(zobristKey, beta, depth, TT_FLAGS.BETA, move);
      return beta;
    }
  }

  // 7. Store results in Transposition Table
  const flag = alpha > oldAlpha ? TT_FLAGS.EXACT : TT_FLAGS.ALPHA;
  let scoreToStore = alpha;
  if (scoreToStore > MATE_SCORE - 100) scoreToStore += ply;
  else if (scoreToStore < -MATE_SCORE + 100) scoreToStore -= ply;

  tt.set(zobristKey, scoreToStore, depth, flag, bestMoveThisNode);

  return alpha;
}

/**
 * Starts iterative deepening search.
 * @param {import('chess.js').Chess} chess - The chess.js instance
 * @param {number} maxDepth - The maximum depth to search
 * @param {number} timeLimitMs - Time limit for the search in milliseconds
 * @param {function} onIterationComplete - Callback invoked after each completed depth iteration
 * @returns {object} The best move found and search statistics
 */
export function startSearch(chess, maxDepth, timeLimitMs, onIterationComplete) {
  searchStartTime = Date.now();
  searchTimeLimit = timeLimitMs;
  isSearchAborted = false;

  // Reset statistics
  searchStats.nodesSearched = 0;
  searchStats.quiescenceNodes = 0;
  searchStats.transpositionHits = 0;
  searchStats.betaCutoffs = 0;
  searchStats.maxDepthReached = 0;

  clearKillerMoves();

  let bestMove = null;
  let bestScore = -INFINITY;

  // Clone chess instance
  const chessCopy = new ChessInstanceClone(chess);

  // Iterative Deepening loop
  for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
    if (isTimeUp()) break;

    const alpha = -INFINITY;
    const beta = INFINITY;

    minimax(chessCopy, currentDepth, 0, alpha, beta);

    if (isSearchAborted && currentDepth > 1) {
      break;
    }

    const zobristKey = getZobristKey(chessCopy);
    const entry = tt.get(zobristKey);
    if (entry && entry.bestMove) {
      bestMove = entry.bestMove;
      bestScore = entry.value;
      searchStats.maxDepthReached = currentDepth;

      if (onIterationComplete) {
        onIterationComplete({
          depth: currentDepth,
          bestMove,
          score: bestScore,
          stats: { ...searchStats },
          timeTaken: Date.now() - searchStartTime
        });
      }
    }
  }

  return {
    bestMove,
    score: bestScore,
    stats: { ...searchStats },
    timeTaken: Date.now() - searchStartTime
  };
}

/**
 * Minimal chess.js wrapper/clone to avoid dependency import issues inside Worker
 */
class ChessInstanceClone {
  constructor(chess) {
    this.chess = chess;
  }

  board() { return this.chess.board(); }
  fen() { return this.chess.fen(); }
  turn() { return this.chess.turn(); }
  moves(options) { return this.chess.moves(options); }
  move(m) { return this.chess.move(m); }
  undo() { return this.chess.undo(); }
  isGameOver() { return this.chess.isGameOver(); }
  isCheckmate() { return this.chess.isCheckmate(); }
  isDraw() { return this.chess.isDraw(); }
  isThreefoldRepetition() { return this.chess.isThreefoldRepetition(); }
  isInsufficientMaterial() { return this.chess.isInsufficientMaterial(); }
  inCheck() { return this.chess.inCheck(); }
  getCastlingRights(color) { return this.chess.getCastlingRights(color); }
}
