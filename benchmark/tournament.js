import { Chess } from 'chess.js';
import fs from 'fs';
import path from 'path';
import { PRNG } from './prng.js';
import { EngineFactory } from './engineFactory.js';
import { TelemetryCollector } from './telemetry.js';
import { BenchmarkStats } from './stats.js';
import { SPRTTest } from './sprt.js';

export class TournamentRunner {
  constructor(options = {}) {
    this.configASpec = options.configA || 'benchmark/configs/full_kronos.json';
    this.configBSpec = options.configB || 'benchmark/configs/baseline.json';
    this.gamesCount = options.games || 20;
    this.depth = options.depth || 3;
    this.seed = options.seed || 42;
    this.useSprt = options.sprt || false;
    this.maxPlies = options.maxPlies || 30;

    this.prng = new PRNG(this.seed);
    this.telemetryA = new TelemetryCollector();
    this.telemetryB = new TelemetryCollector();
  }

  loadOpenings() {
    const filePath = path.resolve('benchmark/openings/openings.json');
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return [{ name: 'Starting Position', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' }];
  }

  async run() {
    const engineA = EngineFactory.createEngine(this.configASpec);
    const engineB = EngineFactory.createEngine(this.configBSpec);

    if (engineA.init) await engineA.init();
    if (engineB.init) await engineB.init();

    const nameA = engineA.name || engineA.config?.name || 'Engine A';
    const nameB = engineB.name || engineB.config?.name || 'Engine B';

    const openings = this.loadOpenings();
    const shuffledOpenings = [...openings];
    this.prng.shuffle(shuffledOpenings);

    let winsA = 0;
    let winsB = 0;
    let draws = 0;
    const pgnList = [];
    const gameRecords = [];

    const sprtEvaluator = new SPRTTest(0.05, 0.05, 0, 10);
    let sprtStatus = { llr: 0, status: 'CONTINUE' };

    console.log(`Starting Tournament: ${nameA} vs ${nameB}`);
    console.log(`Seed: ${this.seed} | Depth: ${this.depth} | Mode: ${this.useSprt ? 'SPRT' : 'Fixed Games (' + this.gamesCount + ')'}\n`);

    for (let g = 1; g <= this.gamesCount; g++) {
      const opening = shuffledOpenings[(g - 1) % shuffledOpenings.length];
      // Color alternation: Odd games EngineA is White, Even games EngineA is Black
      const isAWhite = g % 2 !== 0;

      // Fresh state initialization per game to prevent state leakage
      if (engineA.clearState) engineA.clearState();
      if (engineB.clearState) engineB.clearState();

      const whiteEngine = isAWhite ? engineA : engineB;
      const blackEngine = isAWhite ? engineB : engineA;
      const whiteName = isAWhite ? nameA : nameB;
      const blackName = isAWhite ? nameB : nameA;

      const chess = new Chess(opening.fen);
      const gameMoves = [];
      let totalNodesThisGame = 0;
      let totalTimeThisGame = 0;

      let moveCount = 0;
      const maxPlies = this.maxPlies || 30; // Cap to prevent ultra-long draw games in benchmark tests
      let terminationReason = 'normal';

      while (!chess.isGameOver() && moveCount < maxPlies) {
        const currentTurn = chess.turn();
        const currentEngine = currentTurn === 'w' ? whiteEngine : blackEngine;
        const currentTelemetry = (currentEngine === engineA) ? this.telemetryA : this.telemetryB;

        const result = await currentEngine.go({ depth: this.depth, fen: chess.fen() });
        if (!result.move) {
          terminationReason = 'no_move';
          break;
        }

        try {
          chess.move(result.move);
        } catch (e) {
          // Strict legal move verification: throw explicit error rather than silent fallback
          throw new Error(`Engine ${currentEngine === engineA ? nameA : nameB} made illegal move "${result.move}" in game ${g} at FEN ${chess.fen()}`);
        }

        gameMoves.push(result.move);
        totalNodesThisGame += result.stats?.nodesSearched || 0;
        totalTimeThisGame += result.timeMs || 0;
        currentTelemetry.addSearchStats(result.stats || {}, result.timeMs || 0, result.depthReached || this.depth);
        moveCount++;
      }

      let outcome = 'draw';
      let resultHeader = '1/2-1/2';
      let winnerName = 'Draw';

      if (chess.isCheckmate()) {
        if (chess.turn() === 'b') {
          // White won
          outcome = isAWhite ? 'winA' : 'winB';
          resultHeader = '1-0';
          winnerName = whiteName;
          if (isAWhite) winsA++; else winsB++;
        } else {
          // Black won
          outcome = isAWhite ? 'winB' : 'winA';
          resultHeader = '0-1';
          winnerName = blackName;
          if (isAWhite) winsB++; else winsA++;
        }
      } else {
        draws++;
        if (chess.isDraw()) {
          if (chess.isStalemate()) terminationReason = 'stalemate';
          else if (chess.isThreefoldRepetition()) terminationReason = 'threefold_repetition';
          else if (chess.isInsufficientMaterial()) terminationReason = 'insufficient_material';
          else terminationReason = '50_move_rule';
        } else if (moveCount >= maxPlies) {
          terminationReason = 'max_plies_reached';
        }
      }

      // Format PGN string
      const pgn = [
        `[Event "Kronos Benchmark Tournament"]`,
        `[Site "Kronos Platform"]`,
        `[Date "${new Date().toISOString().split('T')[0]}"]`,
        `[Round "${g}"]`,
        `[White "${whiteName}"]`,
        `[Black "${blackName}"]`,
        `[Result "${resultHeader}"]`,
        `[Termination "${terminationReason}"]`,
        `[FEN "${opening.fen}"]`,
        `[SetUp "1"]`,
        `\n${chess.pgn()}\n`
      ].join('\n');

      pgnList.push(pgn);

      const nps = Math.round(totalNodesThisGame / (totalTimeThisGame / 1000 || 0.001));
      gameRecords.push({
        game: g,
        white: whiteName,
        black: blackName,
        winner: winnerName,
        result: resultHeader,
        moveCount,
        nodesSearched: totalNodesThisGame,
        searchTimeMs: totalTimeThisGame,
        nodesPerSecond: nps,
        opening: opening.name,
        pgn
      });

      console.log(`Game ${g}/${this.gamesCount}: ${whiteName} vs ${blackName} -> ${resultHeader} (${moveCount} moves, ${nps} NPS)`);

      if (this.useSprt) {
        sprtStatus = sprtEvaluator.calculateLLR(winsA, winsB, draws);
        if (sprtStatus.status !== 'CONTINUE') {
          console.log(`\nSPRT Stopping condition met at Game ${g}! Result: ${sprtStatus.status} (LLR: ${sprtStatus.llr})`);
          break;
        }
      }
    }

    if (engineA.quit) engineA.quit();
    if (engineB.quit) engineB.quit();

    const stats = BenchmarkStats.calculate(winsA, winsB, draws);
    return {
      engineA: nameA,
      engineB: nameB,
      settings: {
        gamesPlayed: gameRecords.length,
        maxGames: this.gamesCount,
        depth: this.depth,
        seed: this.seed,
        sprtMode: this.useSprt,
        sprtStatus
      },
      stats,
      telemetryA: this.telemetryA.getSummary(),
      telemetryB: this.telemetryB.getSummary(),
      games: gameRecords,
      openingsUsed: openings,
      pgnContent: pgnList.join('\n\n')
    };
  }
}
