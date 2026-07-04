// Negamax search with alpha-beta, PVS, LMR, NMP, and iterative deepening.

import { Chess } from 'chess.js';
import { evaluateBoard } from './evaluation.js';
import { getZobristKey, pieceKeys, sideKey, castlingKeys, enPassantKeys } from './zobrist.js';
import { tt, TT_FLAGS } from './transposition.js';
import { orderMoves, storeKillerMove, clearKillerMoves, storeHistoryScore } from './moveOrdering.js';
import { quiescenceSearch } from './quiescence.js';

export const SEARCH_OPTIONS = {
  pvs: true,
  history: true,
  lmr: true,
  nmp: true,
  aspiration: true,
  moveOrdering: true,
  tt: true
};

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

// 0x88 square to 64-square index conversion helper
function getSquareIndex(sqName) {
  if (typeof sqName === 'number') return ((sqName >> 4) * 8) + (sqName & 7);
  const file = sqName.charCodeAt(0) - 97;
  const rank = 8 - parseInt(sqName[1]);
  return rank * 8 + file;
}

function getPieceIndex(type, color) {
  const pieceValues = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 };
  const base = pieceValues[type];
  return color === 'w' ? base : base + 6;
}

const SQUARES_MAP = [
  'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
  'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
  'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
  'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
  'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
  'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
  'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
  'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
];

function squareToAlgebraic(ox88Square) {
  const file = ox88Square & 7;
  const rank = ox88Square >> 4;
  return SQUARES_MAP[rank * 8 + file];
}

function convertToPublicMove(chess, internalMove) {
  if (!internalMove) return null;
  if (typeof internalMove.from === 'string') return internalMove;
  
  const fromAlgebraic = squareToAlgebraic(internalMove.from);
  const toAlgebraic = squareToAlgebraic(internalMove.to);
  const verboseMoves = chess.moves({ verbose: true });
  return verboseMoves.find(m => 
    m.from === fromAlgebraic && 
    m.to === toAlgebraic && 
    m.promotion === internalMove.promotion
  ) || null;
}

// Incremental Zobrist Key update helper
function getNextZobristKey(chess, currentKey, move, prevEpFile, prevCastlingIndex) {
  let newKey = currentKey ^ sideKey;

  const fromIdx = ((move.from >> 4) * 8) + (move.from & 7);
  const pieceIdx = getPieceIndex(move.piece, move.color);
  newKey ^= pieceKeys[pieceIdx][fromIdx];

  const toIdx = ((move.to >> 4) * 8) + (move.to & 7);
  if (move.promotion) {
    const promoPieceIdx = getPieceIndex(move.promotion, move.color);
    newKey ^= pieceKeys[promoPieceIdx][toIdx];
  } else {
    newKey ^= pieceKeys[pieceIdx][toIdx];
  }

  if (move.captured) {
    if (move.flags & 8) { // EP_CAPTURE = 8
      const capturedIdx = ((move.from >> 4) * 8) + (move.to & 7);
      const capturedPieceIdx = getPieceIndex('p', move.color === 'w' ? 'b' : 'w');
      newKey ^= pieceKeys[capturedPieceIdx][capturedIdx];
    } else {
      const capturedPieceIdx = getPieceIndex(move.captured, move.color === 'w' ? 'b' : 'w');
      newKey ^= pieceKeys[capturedPieceIdx][toIdx];
    }
  }

  // Castling
  if (move.flags & 32) { // KSIDE_CASTLE = 32
    if (move.color === 'w') {
      newKey ^= pieceKeys[getPieceIndex('r', 'w')][55];
      newKey ^= pieceKeys[getPieceIndex('r', 'w')][61];
    } else {
      newKey ^= pieceKeys[getPieceIndex('r', 'b')][7];
      newKey ^= pieceKeys[getPieceIndex('r', 'b')][5];
    }
  } else if (move.flags & 64) { // QSIDE_CASTLE = 64
    if (move.color === 'w') {
      newKey ^= pieceKeys[getPieceIndex('r', 'w')][56];
      newKey ^= pieceKeys[getPieceIndex('r', 'w')][59];
    } else {
      newKey ^= pieceKeys[getPieceIndex('r', 'b')][0];
      newKey ^= pieceKeys[getPieceIndex('r', 'b')][3];
    }
  }

  // Castling index
  let newCastling = prevCastlingIndex;
  if (move.piece === 'k') {
    if (move.color === 'w') {
      newCastling &= ~1;
      newCastling &= ~2;
    } else {
      newCastling &= ~4;
      newCastling &= ~8;
    }
  }
  
  if (move.piece === 'r') {
    if (move.color === 'w') {
      if (move.from === 119) newCastling &= ~1;
      if (move.from === 112) newCastling &= ~2;
    } else {
      if (move.from === 7) newCastling &= ~4;
      if (move.from === 0) newCastling &= ~8;
    }
  }
  
  if (move.captured === 'r') {
    if (move.color === 'w') {
      if (move.to === 7) newCastling &= ~4;
      if (move.to === 0) newCastling &= ~8;
    } else {
      if (move.to === 119) newCastling &= ~1;
      if (move.to === 112) newCastling &= ~2;
    }
  }

  newKey ^= castlingKeys[prevCastlingIndex] ^ castlingKeys[newCastling];

  // En-passant
  let newEpFile = -1;
  if (move.flags & 4) { // BIG_PAWN = 4
    newEpFile = move.to & 7;
  }

  if (prevEpFile !== -1) {
    newKey ^= enPassantKeys[prevEpFile];
  }
  if (newEpFile !== -1) {
    newKey ^= enPassantKeys[newEpFile];
  }

  return { newKey, newEpFile, newCastling };
}

/** Negamax search with alpha-beta pruning. */
function minimax(chess, depth, ply, alpha, beta, zobristKey, activeEpFile, activeCastlingIndex) {
  searchStats.nodesSearched++;

  if (isTimeUp()) {
    return alpha;
  }

  // Handle fallback if keys are undefined
  if (zobristKey === undefined) {
    zobristKey = getZobristKey(chess);

    const fenParts = chess.fen().split(' ');
    const epField = fenParts[3];
    activeEpFile = -1;
    if (epField && epField !== '-') {
      activeEpFile = epField.charCodeAt(0) - 97;
    }

    activeCastlingIndex = 0;
    const wRights = chess.getCastlingRights('w');
    const bRights = chess.getCastlingRights('b');
    if (wRights.k) activeCastlingIndex |= 1;
    if (wRights.q) activeCastlingIndex |= 2;
    if (bRights.k) activeCastlingIndex |= 4;
    if (bRights.q) activeCastlingIndex |= 8;
  }

  // Draws / repetitions
  if (ply > 0 && (chess.isDraw() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial())) {
    return 0;
  }

  // Terminal positions
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) {
      return -MATE_SCORE + ply; // Favor faster checkmate
    }
    return 0;
  }

  // Leaf node — hand off to quiescence search
  if (depth <= 0) {
    return quiescenceSearch(chess, alpha, beta, searchStats, isTimeUp);
  }

  // TT probe (uses incremental Zobrist key, no FEN or board clones)
  const ttEntry = SEARCH_OPTIONS.tt ? tt.get(zobristKey) : null;
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

  // Null Move Pruning (NMP)
  if (SEARCH_OPTIONS.nmp && depth >= 5 && !chess.inCheck() && ply > 0 && hasNonPawnPieces(chess)) {
    // Toggle turn directly on the chess.js instance (preserving history stack)
    chess.chess._turn = chess.chess._turn === 'w' ? 'b' : 'w';
    const prevEp = chess.chess._epSquare;
    chess.chess._epSquare = -1;

    const nullScore = -minimax(chess, depth - 1 - 2, ply + 1, -beta, -beta + 1, zobristKey ^ sideKey, -1, activeCastlingIndex);
    
    // Restore original turn and EP
    chess.chess._turn = chess.chess._turn === 'w' ? 'b' : 'w';
    chess.chess._epSquare = prevEp;

    if (nullScore >= beta) {
      return beta;
    }
  }

  // Move generation and ordering
  const moves = chess._moves();
  if (moves.length === 0) {
    if (chess.inCheck()) {
      return -MATE_SCORE + ply;
    }
    return 0;
  }

  if (SEARCH_OPTIONS.moveOrdering) {
    orderMoves(moves, ttMove, depth);
  }

  let bestMoveThisNode = null;
  let oldAlpha = alpha;
  let bestScore = -INFINITY;
  let moveIndex = 0;

  // Main search loop
  for (const move of moves) {
    const { newKey, newEpFile, newCastling } = getNextZobristKey(chess, zobristKey, move, activeEpFile, activeCastlingIndex);

    chess._makeMove(move);
    
    let score;
    let needsFullSearch = true;

    // Late Move Reduction (LMR)
    if (SEARCH_OPTIONS.lmr && depth >= 3 && moveIndex >= 4 && !move.captured && !chess.inCheck()) {
      const reducedDepth = depth - 2;
      score = -minimax(chess, reducedDepth, ply + 1, -alpha - 1, -alpha, newKey, newEpFile, newCastling);
      if (score <= alpha) {
        needsFullSearch = false;
      }
    }

    if (needsFullSearch) {
      if (SEARCH_OPTIONS.pvs && moveIndex > 0) {
        // Principal Variation Search (zero window)
        score = -minimax(chess, depth - 1, ply + 1, -alpha - 1, -alpha, newKey, newEpFile, newCastling);
        if (score > alpha && score < beta) {
          // Re-search with full window
          score = -minimax(chess, depth - 1, ply + 1, -beta, -alpha, newKey, newEpFile, newCastling);
        }
      } else {
        score = -minimax(chess, depth - 1, ply + 1, -beta, -alpha, newKey, newEpFile, newCastling);
      }
    }

    chess._undoMove();
    moveIndex++;

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
        if (SEARCH_OPTIONS.history) {
          storeHistoryScore(move, depth);
        }
      }
      if (SEARCH_OPTIONS.tt) {
        tt.set(zobristKey, beta, depth, TT_FLAGS.BETA, move);
      }
      return beta;
    }
  }

  // Store in TT
  const flag = alpha > oldAlpha ? TT_FLAGS.EXACT : TT_FLAGS.ALPHA;
  let scoreToStore = alpha;
  if (scoreToStore > MATE_SCORE - 100) scoreToStore += ply;
  else if (scoreToStore < -MATE_SCORE + 100) scoreToStore -= ply;

  if (SEARCH_OPTIONS.tt) {
    tt.set(zobristKey, scoreToStore, depth, flag, bestMoveThisNode);
  }

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
  let publicBestMove = null;
  let bestScore = -INFINITY;

  // Clone chess instance
  const chessCopy = new ChessInstanceClone(chess);

  // Initial Zobrist key and state calculations (done once at root)
  const initialKey = getZobristKey(chessCopy);
  const fenParts = chessCopy.fen().split(' ');
  const epField = fenParts[3];
  let initialEpFile = -1;
  if (epField && epField !== '-') {
    initialEpFile = epField.charCodeAt(0) - 97;
  }

  let initialCastlingIndex = 0;
  const wRights = chessCopy.getCastlingRights('w');
  const bRights = chessCopy.getCastlingRights('b');
  if (wRights.k) initialCastlingIndex |= 1;
  if (wRights.q) initialCastlingIndex |= 2;
  if (bRights.k) initialCastlingIndex |= 4;
  if (bRights.q) initialCastlingIndex |= 8;

  const extractPV = (chess, depth) => {
    const pv = [];
    const visited = new Set();
    const chessCopyTemp = new Chess(chess.fen());
    for (let i = 0; i < depth; i++) {
      const key = getZobristKey(chessCopyTemp);
      if (visited.has(key)) break;
      visited.add(key);
      const entry = tt.get(key);
      if (!entry || !entry.bestMove) break;
      const publicMove = convertToPublicMove(chessCopyTemp, entry.bestMove);
      if (!publicMove) break;
      pv.push(publicMove.san);
      try {
        chessCopyTemp.move(publicMove);
      } catch {
        break;
      }
    }
    return pv.join(' ');
  };

  // Iterative Deepening loop
  for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
    if (isTimeUp()) break;

    const alpha = -INFINITY;
    const beta = INFINITY;

    minimax(chessCopy, currentDepth, 0, alpha, beta, initialKey, initialEpFile, initialCastlingIndex);

    if (isSearchAborted && currentDepth > 1) {
      break;
    }

    const entry = tt.get(initialKey);
    if (entry && entry.bestMove) {
      bestMove = entry.bestMove;
      publicBestMove = convertToPublicMove(chessCopy, bestMove);
      bestScore = entry.value;
      searchStats.maxDepthReached = currentDepth;

      if (onIterationComplete && publicBestMove) {
        onIterationComplete({
          depth: currentDepth,
          bestMove: publicBestMove,
          score: bestScore,
          stats: { ...searchStats },
          timeTaken: Date.now() - searchStartTime,
          pv: extractPV(chessCopy, currentDepth)
        });
      }
    }
  }

  return {
    bestMove: publicBestMove,
    score: bestScore,
    stats: { ...searchStats },
    timeTaken: Date.now() - searchStartTime,
    pv: extractPV(chessCopy, searchStats.maxDepthReached || 1)
  };
}

/**
 * Thin wrapper around chess.js to expose private _moves/_makeMove/_undoMove
 * methods through a consistent interface for the search tree.
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
  
  // Expose private methods
  _moves() { return this.chess._moves(); }
  _makeMove(m) { return this.chess._makeMove(m); }
  _undoMove() { return this.chess._undoMove(); }
}

function hasNonPawnPieces(chess) {
  const board = chess.board();
  const side = chess.turn();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type !== 'p' && p.type !== 'k' && p.color === side) {
        return true;
      }
    }
  }
  return false;
}
