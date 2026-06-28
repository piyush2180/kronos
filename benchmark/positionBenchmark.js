import fs from 'fs';
import path from 'path';
import { EngineFactory } from './engineFactory.js';

export class PositionBenchmarkRunner {
  constructor(options = {}) {
    this.configASpec = options.configA || 'benchmark/configs/full_kronos.json';
    this.configBSpec = options.configB || 'benchmark/configs/baseline.json';
    this.depth = options.depth || 3;
  }

  loadPositions() {
    const filePath = path.resolve('benchmark/openings/positions.json');
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return [];
  }

  async run() {
    const engineA = EngineFactory.createEngine(this.configASpec);
    const engineB = EngineFactory.createEngine(this.configBSpec);

    if (engineA.init) await engineA.init();
    if (engineB.init) await engineB.init();

    const nameA = engineA.name || engineA.config?.name || 'Engine A';
    const nameB = engineB.name || engineB.config?.name || 'Engine B';

    const positions = this.loadPositions();
    const results = [];

    let solvedA = 0;
    let solvedB = 0;

    console.log(`Starting Position Quality Benchmark: ${nameA} vs ${nameB} (Depth ${this.depth})\n`);

    for (const pos of positions) {
      const resA = await engineA.go({ depth: this.depth, fen: pos.fen });
      const resB = await engineB.go({ depth: this.depth, fen: pos.fen });

      const moveA = resA.san || resA.move || 'N/A';
      const moveB = resB.san || resB.move || 'N/A';

      const matchedA = moveA.toLowerCase().includes(pos.expectedMove.toLowerCase()) || 
                       pos.expectedMove.toLowerCase().includes(moveA.toLowerCase());
      const matchedB = moveB.toLowerCase().includes(pos.expectedMove.toLowerCase()) || 
                       pos.expectedMove.toLowerCase().includes(moveB.toLowerCase());

      if (matchedA) solvedA++;
      if (matchedB) solvedB++;

      results.push({
        positionId: pos.id,
        name: pos.name,
        type: pos.type,
        fen: pos.fen,
        expectedMove: pos.expectedMove,
        engineA: {
          move: moveA,
          matched: matchedA,
          score: resA.score,
          nodes: resA.stats?.nodesSearched || 0,
          timeMs: resA.timeMs
        },
        engineB: {
          move: moveB,
          matched: matchedB,
          score: resB.score,
          nodes: resB.stats?.nodesSearched || 0,
          timeMs: resB.timeMs
        }
      });

      console.log(`[${pos.type.toUpperCase()}] ${pos.name}: Expected ${pos.expectedMove} | ${nameA}: ${moveA} (${matchedA ? '✓' : '✗'}) | ${nameB}: ${moveB} (${matchedB ? '✓' : '✗'})`);
    }

    if (engineA.quit) engineA.quit();
    if (engineB.quit) engineB.quit();

    return {
      engineA: nameA,
      engineB: nameB,
      depth: this.depth,
      totalPositions: positions.length,
      solvedA,
      solvedB,
      accuracyPctA: Number(((solvedA / (positions.length || 1)) * 100).toFixed(2)),
      accuracyPctB: Number(((solvedB / (positions.length || 1)) * 100).toFixed(2)),
      details: results
    };
  }
}
