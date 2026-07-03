import { Chess } from 'chess.js';
import { evaluateBoard as origEvaluateBoard } from '../../src/engine/evaluation.js';
import { getZobristKey, pieceKeys, sideKey, castlingKeys, enPassantKeys } from '../../src/engine/zobrist.js';
import { startSearch } from '../../src/engine/minimax.js';
import { tt as globalTT } from '../../src/engine/transposition.js';

export let evaluateBoardHook = origEvaluateBoard;
export function setEvaluateBoardHook(fn) {
  evaluateBoardHook = fn;
}
const evaluateBoard = (...args) => evaluateBoardHook(...args);

const INFINITY = 1000000;
const MATE_SCORE = 100000;

const TT_FLAGS = { EXACT: 0, ALPHA: 1, BETA: 2 };

// Square map helpers
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

  // Castling Index
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

class LocalTT {
  constructor(maxSize = 200000, isGlobal = false) {
    this._table = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.stores = 0;
    this.isGlobal = isGlobal;
  }

  clear() {
    if (this.isGlobal) {
      globalTT.clear();
      this.hits = 0;
      this.stores = 0;
      return;
    }
    this._table = new Map();
    this.hits = 0;
    this.stores = 0;
  }

  get table() {
    if (this.isGlobal) {
      return globalTT.table;
    }
    return this._table;
  }

  set table(val) {
    if (this.isGlobal) {
      globalTT.table = val;
    } else {
      this._table = val;
    }
  }

  get(key) {
    if (this.isGlobal) {
      const entry = globalTT.get(key);
      if (entry) this.hits = globalTT.hits;
      return entry;
    }
    const entry = this._table.get(key);
    if (entry) {
      this.hits++;
      return entry;
    }
    return null;
  }

  set(key, value, depth, flag, bestMove) {
    if (this.isGlobal) {
      globalTT.set(key, value, depth, flag, bestMove);
      this.stores = globalTT.writes;
      return;
    }
    if (this._table.size >= this.maxSize) {
      const firstKey = this._table.keys().next().value;
      if (firstKey !== undefined) this._table.delete(firstKey);
    }
    this._table.set(key, { value, depth, flag, bestMove });
    this.stores++;
  }

  getOccupancy() {
    return Number(((this.table.size / this.maxSize) * 100).toFixed(2));
  }
}

export class ConfigurableKronosEngine {
  constructor(config = {}) {
    this.config = {
      name: config.name || 'Kronos Variant',
      useAlphaBeta: config.useAlphaBeta !== undefined ? config.useAlphaBeta : true,
      useIterativeDeepening: config.useIterativeDeepening !== undefined ? config.useIterativeDeepening : true,
      useMoveOrdering: config.useMoveOrdering !== undefined ? config.useMoveOrdering : true,
      useMVVLVA: config.useMVVLVA !== undefined ? config.useMVVLVA : true,
      useKillerMoves: config.useKillerMoves !== undefined ? config.useKillerMoves : true,
      useTranspositionTable: config.useTranspositionTable !== undefined ? config.useTranspositionTable : true,
      useQuiescence: config.useQuiescence !== undefined ? config.useQuiescence : true,
      usePieceSquareTables: config.usePieceSquareTables !== undefined ? config.usePieceSquareTables : true,
    };

    const isGlobal = this.config.name && this.config.name.startsWith("Full Kronos");
    this.tt = new LocalTT(isGlobal ? 500000 : 200000, isGlobal);
    this.killerMoves = Array.from({ length: 64 }, () => [null, null]);
    this.stats = {
      nodesSearched: 0,
      quiescenceNodes: 0,
      transpositionHits: 0,
      transpositionStores: 0,
      betaCutoffs: 0,
      alphaCutoffs: 0,
      firstMoveCutoffs: 0,
      totalMovesSearched: 0
    };
  }

  evaluate(chess) {
    if (this.config.usePieceSquareTables === false) {
      const board = chess.board();
      let score = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece) {
            const sign = piece.color === 'w' ? 1 : -1;
            let val = 0;
            switch (piece.type) {
              case 'p': val = 100; break;
              case 'n': val = 320; break;
              case 'b': val = 330; break;
              case 'r': val = 500; break;
              case 'q': val = 900; break;
              case 'k': val = 20000; break;
            }
            score += val * sign;
          }
        }
      }
      return score;
    }
    return evaluateBoard(chess);
  }

  clearState() {
    this.resetStats();
    this.clearKillerMoves();
    this.tt.clear();
    globalTT.clear();
  }

  resetStats() {
    this.stats = {
      nodesSearched: 0,
      quiescenceNodes: 0,
      transpositionHits: 0,
      transpositionStores: 0,
      betaCutoffs: 0,
      alphaCutoffs: 0,
      firstMoveCutoffs: 0,
      totalMovesSearched: 0,
      totalCutoffMovesSearched: 0
    };
  }

  clearKillerMoves() {
    for (let i = 0; i < 64; i++) {
      this.killerMoves[i][0] = null;
      this.killerMoves[i][1] = null;
    }
  }

  storeKiller(move, depth) {
    if (depth < 64) {
      if (this.isSameMove(this.killerMoves[depth][0], move)) return;
      this.killerMoves[depth][1] = this.killerMoves[depth][0];
      this.killerMoves[depth][0] = { from: move.from, to: move.to, promotion: move.promotion };
    }
  }

  isSameMove(m1, m2) {
    if (!m1 || !m2) return false;
    return m1.from === m2.from && m1.to === m2.to && m1.promotion === m2.promotion;
  }

  scoreMove(move, ttMove, depth) {
    if (ttMove && this.isSameMove(move, ttMove)) return 100000;

    if (this.config.useMVVLVA && move.captured) {
      const pieceValues = { p: 100, n: 300, b: 300, r: 500, q: 900, k: 10000 };
      const victimVal = pieceValues[move.captured.toLowerCase()] || 100;
      const attackerVal = pieceValues[move.piece.toLowerCase()] || 100;
      return 50000 + victimVal * 10 - attackerVal;
    }

    if (move.promotion) return 40000;

    if (this.config.useKillerMoves && depth < 64) {
      if (this.isSameMove(move, this.killerMoves[depth][0])) return 9000;
      if (this.isSameMove(move, this.killerMoves[depth][1])) return 8000;
    }

    return 0;
  }

  orderMoves(moves, ttMove, depth) {
    if (!this.config.useMoveOrdering) return moves;
    return moves.sort((a, b) => this.scoreMove(b, ttMove, depth) - this.scoreMove(a, ttMove, depth));
  }

  quiescence(chess, alpha, beta, qdepth = 0) {
    this.stats.quiescenceNodes++;
    const isWhite = chess.turn() === 'w';
    const standPat = this.evaluate(chess) * (isWhite ? 1 : -1);

    if (qdepth > 10) return standPat;

    if (this.config.useAlphaBeta) {
      if (standPat >= beta) return beta;
      if (standPat > alpha) alpha = standPat;
    }

    const moves = chess._moves ? chess._moves() : chess.moves({ verbose: true });
    const captures = moves.filter(m => m.captured || (typeof m.flags === 'number' && (m.flags & 16)));
    if (captures.length === 0) return standPat;

    this.orderMoves(captures, null, 0);
    let bestScore = standPat;

    for (const move of captures) {
      if (chess._makeMove) chess._makeMove(move);
      else chess.move(move);

      const score = -this.quiescence(chess, -beta, -alpha, qdepth + 1);

      if (chess._undoMove) chess._undoMove();
      else chess.undo();

      if (this.config.useAlphaBeta) {
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
      } else {
        if (score > bestScore) bestScore = score;
      }
    }
    return this.config.useAlphaBeta ? alpha : bestScore;
  }

  searchRecursive(chess, depth, ply, alpha, beta, zobristKey, activeEpFile, activeCastlingIndex) {
    this.stats.nodesSearched++;

    if (zobristKey === undefined) {
      zobristKey = getZobristKey(chess);
      const fenParts = chess.fen().split(' ');
      const epField = fenParts[3];
      activeEpFile = (epField && epField !== '-') ? epField.charCodeAt(0) - 97 : -1;
      
      activeCastlingIndex = 0;
      const wRights = chess.getCastlingRights('w');
      const bRights = chess.getCastlingRights('b');
      if (wRights.k) activeCastlingIndex |= 1;
      if (wRights.q) activeCastlingIndex |= 2;
      if (bRights.k) activeCastlingIndex |= 4;
      if (bRights.q) activeCastlingIndex |= 8;
    }

    if (depth <= 0) {
      if (this.config.useQuiescence) {
        return this.quiescence(chess, alpha, beta);
      }
      const isWhite = chess.turn() === 'w';
      return this.evaluate(chess) * (isWhite ? 1 : -1);
    }

    let ttMove = null;
    if (this.config.useTranspositionTable) {
      const entry = this.tt.get(zobristKey);
      if (entry) {
        this.stats.transpositionHits++;
        ttMove = entry.bestMove;
        if (entry.depth >= depth && this.config.useAlphaBeta) {
          if (entry.flag === TT_FLAGS.EXACT) return entry.value;
          if (entry.flag === TT_FLAGS.ALPHA && entry.value <= alpha) return alpha;
          if (entry.flag === TT_FLAGS.BETA && entry.value >= beta) return beta;
        }
      }
    }

    const moves = chess._moves();
    if (moves.length === 0) {
      if (chess.inCheck()) return -MATE_SCORE + ply;
      return 0;
    }

    this.orderMoves(moves, ttMove, depth);

    let bestMoveThisNode = moves[0];
    let oldAlpha = alpha;
    let bestScore = -INFINITY;
    let moveIdx = 0;

    for (const move of moves) {
      this.stats.totalMovesSearched++;
      
      const { newKey, newEpFile, newCastling } = getNextZobristKey(chess, zobristKey, move, activeEpFile, activeCastlingIndex);

      chess._makeMove(move);
      
      let score;
      if (this.config.useAlphaBeta) {
        score = -this.searchRecursive(chess, depth - 1, ply + 1, -beta, -alpha, newKey, newEpFile, newCastling);
      } else {
        score = -this.searchRecursive(chess, depth - 1, ply + 1, -INFINITY, INFINITY, newKey, newEpFile, newCastling);
      }
      chess._undoMove();

      if (score > bestScore) {
        bestScore = score;
        bestMoveThisNode = move;
      }

      if (this.config.useAlphaBeta) {
        if (score > alpha) alpha = score;
        if (alpha >= beta) {
          this.stats.betaCutoffs++;
          this.stats.totalCutoffMovesSearched += (moveIdx + 1);
          if (moveIdx === 0) this.stats.firstMoveCutoffs++;
          if (!move.captured) this.storeKiller(move, depth);
          if (this.config.useTranspositionTable) {
            this.tt.set(zobristKey, beta, depth, TT_FLAGS.BETA, move);
          }
          return beta;
        }
      }
      moveIdx++;
    }

    if (this.config.useTranspositionTable) {
      const flag = alpha > oldAlpha ? TT_FLAGS.EXACT : TT_FLAGS.ALPHA;
      this.tt.set(zobristKey, alpha, depth, flag, bestMoveThisNode);
    }

    return this.config.useAlphaBeta ? alpha : bestScore;
  }

  go({ depth = 3, fen = null }) {
    if (this.config.name && this.config.name.startsWith("Full Kronos")) {
      const chess = new Chess(fen || undefined);
      const searchDepth = this.config.fixedDepth || depth;
      const searchRes = startSearch(chess, searchDepth, 60000);
      const publicBestMove = searchRes.bestMove;
      return {
        move: publicBestMove ? (publicBestMove.lan || `${publicBestMove.from}${publicBestMove.to}${publicBestMove.promotion || ''}`) : null,
        san: publicBestMove ? publicBestMove.san : null,
        score: searchRes.score,
        timeMs: searchRes.timeTaken,
        stats: searchRes.stats,
        depthReached: searchRes.stats.maxDepthReached
      };
    }

    this.resetStats();
    this.clearKillerMoves();

    const chess = new Chess(fen || undefined);
    
    // Initial keys calculations
    const initialKey = getZobristKey(chess);
    const fenParts = chess.fen().split(' ');
    const epField = fenParts[3];
    let initialEpFile = (epField && epField !== '-') ? epField.charCodeAt(0) - 97 : -1;

    let initialCastlingIndex = 0;
    const wRights = chess.getCastlingRights('w');
    const bRights = chess.getCastlingRights('b');
    if (wRights.k) initialCastlingIndex |= 1;
    if (wRights.q) initialCastlingIndex |= 2;
    if (bRights.k) initialCastlingIndex |= 4;
    if (bRights.q) initialCastlingIndex |= 8;

    const startTime = Date.now();
    let bestMove = null;
    let bestScore = -INFINITY;

    if (this.config.useIterativeDeepening) {
      for (let d = 1; d <= depth; d++) {
        const moves = chess._moves();
        if (moves.length === 0) break;
        this.orderMoves(moves, bestMove, d);
        let currentBestMove = moves[0];
        let currentBestScore = -INFINITY;
        let alpha = -INFINITY;
        let beta = INFINITY;

        for (const m of moves) {
          const { newKey, newEpFile, newCastling } = getNextZobristKey(chess, initialKey, m, initialEpFile, initialCastlingIndex);
          chess._makeMove(m);
          const score = this.config.useAlphaBeta
            ? -this.searchRecursive(chess, d - 1, 1, -beta, -alpha, newKey, newEpFile, newCastling)
            : -this.searchRecursive(chess, d - 1, 1, -INFINITY, INFINITY, newKey, newEpFile, newCastling);
          chess._undoMove();
          if (score > currentBestScore) {
            currentBestScore = score;
            currentBestMove = m;
          }
          if (this.config.useAlphaBeta && score > alpha) alpha = score;
        }
        bestMove = currentBestMove;
        bestScore = currentBestScore;
      }
    } else {
      const moves = chess._moves();
      if (moves.length > 0) {
        this.orderMoves(moves, null, depth);
        let alpha = -INFINITY;
        let beta = INFINITY;
        bestMove = moves[0];
        for (const m of moves) {
          const { newKey, newEpFile, newCastling } = getNextZobristKey(chess, initialKey, m, initialEpFile, initialCastlingIndex);
          chess._makeMove(m);
          const score = this.config.useAlphaBeta
            ? -this.searchRecursive(chess, depth - 1, 1, -beta, -alpha, newKey, newEpFile, newCastling)
            : -this.searchRecursive(chess, depth - 1, 1, -INFINITY, INFINITY, newKey, newEpFile, newCastling);
          chess._undoMove();
          if (score > bestScore) {
            bestScore = score;
            bestMove = m;
          }
          if (this.config.useAlphaBeta && score > alpha) alpha = score;
        }
      }
    }

    const timeMs = Date.now() - startTime;
    this.stats.transpositionStores = this.tt.stores;
    this.stats.ttOccupancy = this.tt.getOccupancy();

    const publicBestMove = bestMove ? convertToPublicMove(chess, bestMove) : null;

    return {
      move: publicBestMove ? (publicBestMove.lan || `${publicBestMove.from}${publicBestMove.to}${publicBestMove.promotion || ''}`) : null,
      san: publicBestMove ? publicBestMove.san : null,
      score: bestScore,
      timeMs,
      stats: { ...this.stats },
      depthReached: depth
    };
  }
}
