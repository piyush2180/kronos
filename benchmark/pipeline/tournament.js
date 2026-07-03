import { Chess } from 'chess.js';
import fs from 'fs';
import path from 'path';
import { PRNG } from '../engines/prng.js';
import { EngineFactory } from '../engines/engineFactory.js';
import { TelemetryCollector } from '../engines/telemetry.js';
import { BenchmarkStats } from '../engines/stats.js';
import { SPRTTest } from '../engines/sprt.js';

export class TournamentRunner {
  constructor(options = {}) {
    this.configASpec = options.configA || 'benchmark/configs/full_kronos.json';
    this.configBSpec = options.configB || 'benchmark/configs/baseline.json';
    this.gamesCount = options.games || 20;
    this.depth = options.depth || 3;
    this.seed = options.seed || 42;
    this.seeds = options.seeds || (options.seed ? [options.seed] : [42, 1337, 2026, 9001]);
    this.confidenceThreshold = options.confidenceThreshold !== undefined ? options.confidenceThreshold : 25;
    this.minimumGamesBeforeCI = options.minimumGamesBeforeCI !== undefined ? options.minimumGamesBeforeCI : 100;
    this.useSprt = options.sprt || false;
    this.maxPlies = options.maxPlies || 200;

    this.experimentId = options.experimentId || (
      (options.configA && options.configB) ? 
      `exp_${path.basename(options.configA, '.json')}_vs_${path.basename(options.configB, '.json')}` : 
      'default'
    );
    this.checkpoint = options.checkpoint !== undefined ? options.checkpoint : true;
    this.checkpointInterval = options.checkpointInterval || 10;
    this.checkpointDir = options.checkpointDir || 'benchmark/output/checkpoints';
    this.stopAtGame = options.stopAtGame || null;

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

    let winsA = 0;
    let winsB = 0;
    let draws = 0;
    let pgnList = []; // Kept as empty placeholder for compatibility
    let gameRecords = [];
    let overallGameIndex = 1;
    let startSeedIndex = 0;
    let startPairIdx = 0;
    let startColorFlip = 0;

    const checkpointFile = path.resolve(this.checkpointDir, `checkpoint_${this.experimentId}_d${this.depth}.json`);
    const tempPgnFile = path.resolve(this.checkpointDir, `temp_${this.experimentId}_d${this.depth}.pgn`);

    if (!fs.existsSync(this.checkpointDir)) {
      fs.mkdirSync(this.checkpointDir, { recursive: true });
    }

    if (!fs.existsSync(checkpointFile) && fs.existsSync(tempPgnFile)) {
      try { fs.unlinkSync(tempPgnFile); } catch (e) {}
    }

    if (this.checkpoint && fs.existsSync(checkpointFile)) {
      try {
        const cp = JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
        winsA = cp.winsA || 0;
        winsB = cp.winsB || 0;
        draws = cp.draws || 0;
        overallGameIndex = cp.overallGameIndex || 1;
        startSeedIndex = cp.startSeedIndex || 0;
        startPairIdx = cp.startPairIdx || 0;
        startColorFlip = cp.startColorFlip || 0;
        gameRecords = cp.gameRecords || [];
        this.telemetryA.deserialize(cp.telemetryA);
        this.telemetryB.deserialize(cp.telemetryB);
        if (cp.eloHistory) this.eloHistory = cp.eloHistory;
        console.log(`\n[Resume] Found checkpoint. Resuming Tournament from Game ${overallGameIndex} (Seed index ${startSeedIndex})...\n`);
      } catch (e) {
        console.error(`[Resume] Failed to parse checkpoint file: ${e.message}. Starting from scratch.`);
      }
    }

    const sprtEvaluator = new SPRTTest(0.05, 0.05, 0, 10);
    let sprtStatus = { llr: 0, status: 'CONTINUE' };

    console.log(`Starting Tournament: ${nameA} vs ${nameB}`);
    console.log(`Seeds: ${this.seeds.join(', ')} | Depth: ${this.depth} | Mode: ${this.useSprt ? 'SPRT' : 'Fixed Games (' + this.gamesCount + ')'}\n`);

    const gamesPerSeed = [];
    const base = Math.floor(this.gamesCount / this.seeds.length);
    const extra = this.gamesCount % this.seeds.length;
    for (let i = 0; i < this.seeds.length; i++) {
      gamesPerSeed.push(base + (i < extra ? 1 : 0));
    }

    let ciLimitMet = false;

    for (let sIndex = startSeedIndex; sIndex < this.seeds.length; sIndex++) {
      const currentSeed = this.seeds[sIndex];
      const currentSeedGames = gamesPerSeed[sIndex];
      if (currentSeedGames <= 0) continue;

      const seedPrng = new PRNG(currentSeed);
      const shuffledOpenings = [...openings];
      seedPrng.shuffle(shuffledOpenings);

      // Paired openings: each opening is played twice (A=White, then A=Black)
      // This eliminates color-assignment bias in the tournament results.
      const numPairs = Math.ceil(currentSeedGames / 2);

      const pIdxStart = (sIndex === startSeedIndex) ? startPairIdx : 0;

      for (let pairIdx = pIdxStart; pairIdx < numPairs; pairIdx++) {
        const opening = shuffledOpenings[pairIdx % shuffledOpenings.length];

        const flipStart = (sIndex === startSeedIndex && pairIdx === startPairIdx) ? startColorFlip : 0;

        for (let colorFlip = flipStart; colorFlip < 2; colorFlip++) {
          if (overallGameIndex > this.gamesCount) break;

          const isAWhite = colorFlip === 0; // First game: A=White, Second: A=Black

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
          const maxPlies = this.maxPlies || 200;
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
            throw new Error(`Engine ${currentEngine === engineA ? nameA : nameB} made illegal move "${result.move}" in game ${overallGameIndex} at FEN ${chess.fen()}`);
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
            outcome = isAWhite ? 'winA' : 'winB';
            resultHeader = '1-0';
            winnerName = whiteName;
            if (isAWhite) winsA++; else winsB++;
          } else {
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

        const pgn = [
          `[Event "Kronos Benchmark Tournament"]`,
          `[Site "Kronos Platform"]`,
          `[Date "${new Date().toISOString().split('T')[0]}"]`,
          `[Round "${overallGameIndex}"]`,
          `[White "${whiteName}"]`,
          `[Black "${blackName}"]`,
          `[Result "${resultHeader}"]`,
          `[Termination "${terminationReason}"]`,
          `[FEN "${opening.fen}"]`,
          `[SetUp "1"]`,
          `\n${chess.pgn()}\n`
        ].join('\n');

        fs.appendFileSync(tempPgnFile, pgn + '\n\n');

        const nps = Math.round(totalNodesThisGame / (totalTimeThisGame / 1000 || 0.001));
        gameRecords.push({
          game: overallGameIndex,
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

        console.log(`Game ${overallGameIndex}/${this.gamesCount} (Seed ${currentSeed}): ${whiteName} vs ${blackName} -> ${resultHeader} (${moveCount} moves, ${nps} NPS)`);

        if (this.useSprt) {
          sprtStatus = sprtEvaluator.calculateLLR(winsA, winsB, draws);
          if (sprtStatus.status !== 'CONTINUE') {
            console.log(`\nSPRT Stopping condition met at Game ${overallGameIndex}! Result: ${sprtStatus.status} (LLR: ${sprtStatus.llr})`);
            break;
          }
        }

        // Confidence-interval early stopping check (Game 40 onward)
        if (overallGameIndex >= 40) {
          const currentStats = BenchmarkStats.calculate(winsA, winsB, draws);
          const ciRadius = (currentStats.eloCiUpper - currentStats.eloCiLower) / 2;
          
          if (!this.eloHistory) this.eloHistory = {};
          this.eloHistory[overallGameIndex] = currentStats.eloDiff;

          // Corrected node/time/BF telemetry to avoid NaN
          const avgNodesA = Math.round(this.telemetryA.nodesSearched / overallGameIndex);
          const avgNodesB = Math.round(this.telemetryB.nodesSearched / overallGameIndex);
          const avgTimeA = Math.round(this.telemetryA.searchTimeMs / overallGameIndex);
          const avgTimeB = Math.round(this.telemetryB.searchTimeMs / overallGameIndex);
          const bfA = (this.telemetryA.branchingFactorSum / (this.telemetryA.searchCalls || 1)).toFixed(2);
          const bfB = (this.telemetryB.branchingFactorSum / (this.telemetryB.searchCalls || 1)).toFixed(2);
          const npsA = Math.round(this.telemetryA.nodesSearched / (this.telemetryA.searchTimeMs / 1000 || 0.001));
          const npsB = Math.round(this.telemetryB.nodesSearched / (this.telemetryB.searchTimeMs / 1000 || 0.001));

          console.log(`  [CI Monitor] Game ${overallGameIndex}: Elo = ${currentStats.eloDiff > 0 ? '+' : ''}${currentStats.eloDiff.toFixed(1)} [${currentStats.eloCiLower.toFixed(1)}, ${currentStats.eloCiUpper.toFixed(1)}] Elo (CI Radius: ±${ciRadius.toFixed(1)} Elo) | Record: +${winsA}-${winsB}=${draws} | Avg Nodes: A=${avgNodesA.toLocaleString()}, B=${avgNodesB.toLocaleString()} | Avg Time: A=${avgTimeA}ms, B=${avgTimeB}ms | BF: A=${bfA}, B=${bfB} | NPS: A=${npsA.toLocaleString()}, B=${npsB.toLocaleString()}`);

          let stopTriggered = false;
          let stopReason = '';

          // Criterion A: Confidence radius <= ±60 Elo
          if (ciRadius <= 60) {
            stopTriggered = true;
            stopReason = `Criterion A: Confidence radius (${ciRadius.toFixed(1)} Elo) <= ±60 Elo`;
          }

          // Criterion B: Elo estimate changes by < 5 Elo over previous 10 games AND confidence radius < ±70 Elo
          if (!stopTriggered && overallGameIndex >= 50) {
            const prevElo = this.eloHistory[overallGameIndex - 10];
            if (prevElo !== undefined) {
              const eloDelta = Math.abs(currentStats.eloDiff - prevElo);
              if (eloDelta < 5 && ciRadius < 70) {
                stopTriggered = true;
                stopReason = `Criterion B: Elo delta over 10 games (${eloDelta.toFixed(1)} Elo) < 5 Elo AND radius (${ciRadius.toFixed(1)} Elo) < ±70 Elo`;
              }
            }
          }

          // Criterion C: Decisive result: Elo magnitude > 150 with confidence interval entirely on one side of zero
          if (!stopTriggered && Math.abs(currentStats.eloDiff) > 150) {
            if (currentStats.eloCiLower > 0 || currentStats.eloCiUpper < 0) {
              stopTriggered = true;
              stopReason = `Criterion C: Decisive result (Elo = ${currentStats.eloDiff.toFixed(1)}, CI = [${currentStats.eloCiLower.toFixed(1)}, ${currentStats.eloCiUpper.toFixed(1)}])`;
            }
          }

          if (stopTriggered) {
            console.log(`\n✔ Tournament Stopped Early: ${stopReason}`);
            this.stopReason = stopReason;
            ciLimitMet = true;
            break;
          }
        }

          if (this.stopAtGame && overallGameIndex === this.stopAtGame) {
            if (!fs.existsSync(this.checkpointDir)) {
              fs.mkdirSync(this.checkpointDir, { recursive: true });
            }
            let nextColorFlip = colorFlip + 1;
            let nextPairIdx = pairIdx;
            let nextSeedIndex = sIndex;
            if (nextColorFlip >= 2) {
              nextColorFlip = 0;
              nextPairIdx++;
              if (nextPairIdx >= numPairs) {
                nextPairIdx = 0;
                nextSeedIndex++;
              }
            }
            const cpData = {
              winsA,
              winsB,
              draws,
              overallGameIndex: overallGameIndex + 1,
              startSeedIndex: nextSeedIndex,
              startPairIdx: nextPairIdx,
              startColorFlip: nextColorFlip,
              gameRecords,
              telemetryA: this.telemetryA.serialize(),
              telemetryB: this.telemetryB.serialize(),
              eloHistory: this.eloHistory
            };
            fs.writeFileSync(checkpointFile, JSON.stringify(cpData, null, 2));
            console.log(`[Checkpoint] Saved state at game ${overallGameIndex} (stopAtGame triggered)`);
            this.stopReason = 'stopAtGame';
            ciLimitMet = true;
            break;
          }

          // Memory profiling every 5 games
          if (overallGameIndex % 5 === 0) {
            const mem = process.memoryUsage();
            const rssMb = (mem.rss / 1024 / 1024).toFixed(2);
            const heapTotalMb = (mem.heapTotal / 1024 / 1024).toFixed(2);
            const heapUsedMb = (mem.heapUsed / 1024 / 1024).toFixed(2);
            const externalMb = (mem.external / 1024 / 1024).toFixed(2);
            const ttSizeA = engineA.tt ? (engineA.tt.table ? engineA.tt.table.size : 0) : 0;
            const ttSizeB = engineB.tt ? (engineB.tt.table ? engineB.tt.table.size : 0) : 0;
            const msg = `[Memory Profiler] Game ${overallGameIndex}: RSS=${rssMb}MB | HeapUsed=${heapUsedMb}MB | TT_A=${ttSizeA} | TT_B=${ttSizeB}`;
            console.log(msg);

            // Log to MEMORY_PROFILE.md
            const profileFile = path.resolve('MEMORY_PROFILE.md');
            const timestamp = new Date().toISOString();
            const logLine = `| ${timestamp} | ${this.experimentId} | ${overallGameIndex} | ${rssMb} | ${heapTotalMb} | ${heapUsedMb} | ${externalMb} | ${ttSizeA} | ${ttSizeB} |\n`;
            
            if (!fs.existsSync(profileFile)) {
              const header = `# Kronos Framework Memory Profiling Log\n\n` +
                             `| Timestamp | Experiment | Game Index | RSS (MB) | Heap Total (MB) | Heap Used (MB) | External (MB) | TT A Size | TT B Size |\n` +
                             `| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`;
              fs.writeFileSync(profileFile, header + logLine);
            } else {
              fs.appendFileSync(profileFile, logLine);
            }
          }

          // Checkpoint saving every checkpointInterval games
          if (this.checkpoint && overallGameIndex % this.checkpointInterval === 0) {
            if (!fs.existsSync(this.checkpointDir)) {
              fs.mkdirSync(this.checkpointDir, { recursive: true });
            }
            // Calculate starting indices for next game
            let nextColorFlip = colorFlip + 1;
            let nextPairIdx = pairIdx;
            let nextSeedIndex = sIndex;
            if (nextColorFlip >= 2) {
              nextColorFlip = 0;
              nextPairIdx++;
              if (nextPairIdx >= numPairs) {
                nextPairIdx = 0;
                nextSeedIndex++;
              }
            }
            const cpData = {
              winsA,
              winsB,
              draws,
              overallGameIndex: overallGameIndex + 1,
              startSeedIndex: nextSeedIndex,
              startPairIdx: nextPairIdx,
              startColorFlip: nextColorFlip,
              gameRecords,
              telemetryA: this.telemetryA.serialize(),
              telemetryB: this.telemetryB.serialize(),
              eloHistory: this.eloHistory
            };
            fs.writeFileSync(checkpointFile, JSON.stringify(cpData, null, 2));
            console.log(`[Checkpoint] Saved state at game ${overallGameIndex}`);
          }

        overallGameIndex++;
        } // end colorFlip loop

        if (this.useSprt && sprtStatus.status !== 'CONTINUE') break;
        if (ciLimitMet) break;
        if (overallGameIndex > this.gamesCount) break;
      } // end pairIdx loop

      if (this.useSprt && sprtStatus.status !== 'CONTINUE') break;
      if (ciLimitMet) break;
    } // end seeds loop

    if (engineA.quit) engineA.quit();
    if (engineB.quit) engineB.quit();

    if (this.checkpoint && this.stopReason !== 'stopAtGame' && fs.existsSync(checkpointFile)) {
      try {
        fs.unlinkSync(checkpointFile);
        console.log(`[Checkpoint] Cleaned up checkpoint for ${this.experimentId}`);
      } catch (e) {}
    }

    const stats = BenchmarkStats.calculate(winsA, winsB, draws);
    return {
      engineA: nameA,
      engineB: nameB,
      settings: {
        gamesPlayed: gameRecords.length,
        maxGames: this.gamesCount,
        depth: this.depth,
        seed: this.seed,
        seeds: this.seeds,
        confidenceThreshold: this.confidenceThreshold,
        sprtMode: this.useSprt,
        sprtStatus
      },
      stats,
      telemetryA: this.telemetryA.getSummary(),
      telemetryB: this.telemetryB.getSummary(),
      games: gameRecords,
      openingsUsed: openings,
      pgnFilePath: tempPgnFile,
      stopReason: this.stopReason || 'Normal Completion'
    };
  }
}
