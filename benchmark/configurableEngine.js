import { Chess } from 'chess.js';
import { evaluateBoard } from '../src/engine/evaluation.js';

const INFINITY = 1000000;
const MATE_SCORE = 100000;

// Simple internal Zobrist table for TT caching when enabled
const TT_FLAGS = { EXACT: 0, ALPHA: 1, BETA: 2 };

class LocalTT {
  constructor(maxSize = 200000) {
    this.table = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.stores = 0;
  }

  clear() {
    this.table.clear();
    this.hits = 0;
    this.stores = 0;
  }

  get(key) {
    const entry = this.table.get(key);
    if (entry) {
      this.hits++;
      return entry;
    }
    return null;
  }

  set(key, value, depth, flag, bestMove) {
    if (this.table.size >= this.maxSize) {
      const firstKey = this.table.keys().next().value;
      if (firstKey !== undefined) this.table.delete(firstKey);
    }
    this.table.set(key, { value, depth, flag, bestMove });
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
    };

    this.tt = new LocalTT();
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

  resetStats() {
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

  quiescence(chess, alpha, beta) {
    this.stats.quiescenceNodes++;
    const isWhite = chess.turn() === 'w';
    const standPat = evaluateBoard(chess) * (isWhite ? 1 : -1);

    if (this.config.useAlphaBeta) {
      if (standPat >= beta) return beta;
      if (standPat > alpha) alpha = standPat;
    }

    const moves = chess.moves({ verbose: true });
    const captures = moves.filter(m => m.captured || m.promotion);
    if (captures.length === 0) return standPat;

    this.orderMoves(captures, null, 0);

    for (const move of captures) {
      chess.move(move);
      const score = -this.quiescence(chess, -beta, -alpha);
      chess.undo();

      if (this.config.useAlphaBeta) {
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
      }
    }
    return alpha;
  }

  searchRecursive(chess, depth, ply, alpha, beta) {
    this.stats.nodesSearched++;

    if (ply > 0 && (chess.isDraw() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial())) {
      return 0;
    }

    if (chess.isGameOver()) {
      if (chess.isCheckmate()) return -MATE_SCORE + ply;
      return 0;
    }

    if (depth <= 0) {
      if (this.config.useQuiescence) {
        return this.quiescence(chess, alpha, beta);
      }
      const isWhite = chess.turn() === 'w';
      return evaluateBoard(chess) * (isWhite ? 1 : -1);
    }

    const fenKey = chess.fen();
    let ttMove = null;
    if (this.config.useTranspositionTable) {
      const entry = this.tt.get(fenKey);
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

    const moves = chess.moves({ verbose: true });
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
      chess.move(move);
      
      let score;
      if (this.config.useAlphaBeta) {
        score = -this.searchRecursive(chess, depth - 1, ply + 1, -beta, -alpha);
      } else {
        score = -this.searchRecursive(chess, depth - 1, ply + 1, -INFINITY, INFINITY);
      }
      chess.undo();

      if (score > bestScore) {
        bestScore = score;
        bestMoveThisNode = move;
      }

      if (this.config.useAlphaBeta) {
        if (score > alpha) alpha = score;
        if (alpha >= beta) {
          this.stats.betaCutoffs++;
          if (moveIdx === 0) this.stats.firstMoveCutoffs++;
          if (!move.captured) this.storeKiller(move, depth);
          if (this.config.useTranspositionTable) {
            this.tt.set(fenKey, beta, depth, TT_FLAGS.BETA, move);
          }
          return beta;
        }
      }
      moveIdx++;
    }

    if (this.config.useTranspositionTable) {
      const flag = alpha > oldAlpha ? TT_FLAGS.EXACT : TT_FLAGS.ALPHA;
      this.tt.set(fenKey, alpha, depth, flag, bestMoveThisNode);
    }

    return this.config.useAlphaBeta ? alpha : bestScore;
  }

  go({ depth = 3, fen = null }) {
    this.resetStats();
    this.clearKillerMoves();

    const chess = new Chess(fen || undefined);
    const startTime = Date.now();
    let bestMove = null;
    let bestScore = -INFINITY;

    if (this.config.useIterativeDeepening) {
      for (let d = 1; d <= depth; d++) {
        const moves = chess.moves({ verbose: true });
        if (moves.length === 0) break;
        this.orderMoves(moves, bestMove, d);
        let currentBestMove = moves[0];
        let currentBestScore = -INFINITY;
        let alpha = -INFINITY;
        let beta = INFINITY;

        for (const m of moves) {
          chess.move(m);
          const score = -this.searchRecursive(chess, d - 1, 1, -beta, -alpha);
          chess.undo();
          if (score > currentBestScore) {
            currentBestScore = score;
            currentBestMove = m;
          }
          if (score > alpha) alpha = score;
        }
        bestMove = currentBestMove;
        bestScore = currentBestScore;
      }
    } else {
      const moves = chess.moves({ verbose: true });
      if (moves.length > 0) {
        this.orderMoves(moves, null, depth);
        let alpha = -INFINITY;
        let beta = INFINITY;
        bestMove = moves[0];
        for (const m of moves) {
          chess.move(m);
          const score = -this.searchRecursive(chess, depth - 1, 1, -beta, -alpha);
          chess.undo();
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

    return {
      move: bestMove ? (bestMove.lan || `${bestMove.from}${bestMove.to}${bestMove.promotion || ''}`) : null,
      san: bestMove ? bestMove.san : null,
      score: bestScore,
      timeMs,
      stats: { ...this.stats },
      depthReached: depth
    };
  }
}
