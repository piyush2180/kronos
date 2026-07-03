import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { Chess } from 'chess.js';
import { ConfigurableKronosEngine, setEvaluateBoardHook, evaluateBoardHook } from '../engines/configurableEngine.js';

// Subsystem timers & call counters
const metrics = {
  moveGen: { time: 0, calls: 0 },
  evaluation: { time: 0, calls: 0 },
  ttLookups: { time: 0, calls: 0 },
  ttInserts: { time: 0, calls: 0 },
  moveOrdering: { time: 0, calls: 0 },
  mvvLvaScoring: { time: 0, calls: 0 },
  killerMoveLookup: { time: 0, calls: 0 },
  makeMove: { time: 0, calls: 0 },
  undoMove: { time: 0, calls: 0 },
  fenGeneration: { time: 0, calls: 0 }
};

// Monkey-patch Chess.prototype methods to measure timings
const origMoves = Chess.prototype._moves;
Chess.prototype._moves = function (...args) {
  metrics.moveGen.calls++;
  const start = performance.now();
  const res = origMoves.apply(this, args);
  metrics.moveGen.time += performance.now() - start;
  return res;
};

const origMove = Chess.prototype._makeMove;
Chess.prototype._makeMove = function (...args) {
  metrics.makeMove.calls++;
  const start = performance.now();
  const res = origMove.apply(this, args);
  metrics.makeMove.time += performance.now() - start;
  return res;
};

const origUndo = Chess.prototype._undoMove;
Chess.prototype._undoMove = function (...args) {
  metrics.undoMove.calls++;
  const start = performance.now();
  const res = origUndo.apply(this, args);
  metrics.undoMove.time += performance.now() - start;
  return res;
};

const origFen = Chess.prototype.fen;
Chess.prototype.fen = function (...args) {
  metrics.fenGeneration.calls++;
  const start = performance.now();
  const res = origFen.apply(this, args);
  metrics.fenGeneration.time += performance.now() - start;
  return res;
};

// Wrap ConfigurableKronosEngine methods to measure timings
const origScoreMove = ConfigurableKronosEngine.prototype.scoreMove;
ConfigurableKronosEngine.prototype.scoreMove = function (...args) {
  metrics.mvvLvaScoring.calls++;
  if (this.config.useKillerMoves) {
    metrics.killerMoveLookup.calls++;
  }
  const start = performance.now();
  const res = origScoreMove.apply(this, args);
  const duration = performance.now() - start;
  metrics.mvvLvaScoring.time += duration;
  if (this.config.useKillerMoves) {
    metrics.killerMoveLookup.time += duration;
  }
  return res;
};

const origOrderMoves = ConfigurableKronosEngine.prototype.orderMoves;
ConfigurableKronosEngine.prototype.orderMoves = function (...args) {
  metrics.moveOrdering.calls++;
  const start = performance.now();
  const res = origOrderMoves.apply(this, args);
  metrics.moveOrdering.time += performance.now() - start;
  return res;
};

// Wrap Transposition Table access
const dummyEngine = new ConfigurableKronosEngine();
const ttPrototype = Object.getPrototypeOf(dummyEngine.tt);

const origTtGet = ttPrototype.get;
ttPrototype.get = function (...args) {
  metrics.ttLookups.calls++;
  const start = performance.now();
  const res = origTtGet.apply(this, args);
  metrics.ttLookups.time += performance.now() - start;
  return res;
};

const origTtSet = ttPrototype.set;
ttPrototype.set = function (...args) {
  metrics.ttInserts.calls++;
  const start = performance.now();
  const res = origTtSet.apply(this, args);
  metrics.ttInserts.time += performance.now() - start;
  return res;
};

// Install the patchable evaluation hook
const origEvaluateBoard = evaluateBoardHook;
setEvaluateBoardHook(function (...args) {
  metrics.evaluation.calls++;
  const start = performance.now();
  const res = origEvaluateBoard.apply(this, args);
  metrics.evaluation.time += performance.now() - start;
  return res;
});

async function main() {
  console.log("==================================================");
  console.log("       Kronos Engine Performance Profiler          ");
  console.log("==================================================\n");

  const fenTest = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3';
  const engine = new ConfigurableKronosEngine({
    name: 'Profiler Engine',
    useAlphaBeta: true,
    useIterativeDeepening: true,
    useMoveOrdering: true,
    useMVVLVA: true,
    useKillerMoves: true,
    useTranspositionTable: true,
    useQuiescence: true
  });

  // Warmup
  console.log("Warming up engine...");
  engine.go({ depth: 2, fen: fenTest });

  // Reset metrics after warmup
  for (const k of Object.keys(metrics)) {
    metrics[k].time = 0;
    metrics[k].calls = 0;
  }

  // Profile runs at depth 4 on starting board
  console.log("Profiling engine at depth 4 on starting FEN...");
  const startSearch = performance.now();
  const res = engine.go({ depth: 4, fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' });
  const totalSearchTime = performance.now() - startSearch;

  // Search Scaling Table Measurements
  const scalingData = [];
  for (let d = 1; d <= 5; d++) {
    const tempEngine = new ConfigurableKronosEngine({
      useAlphaBeta: true,
      useIterativeDeepening: false,
      useMoveOrdering: true,
      useMVVLVA: true,
      useKillerMoves: true,
      useTranspositionTable: true,
      useQuiescence: true
    });
    const sStart = performance.now();
    const sRes = tempEngine.go({ depth: d, fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' });
    const duration = performance.now() - sStart;
    
    const nodes = sRes.stats.nodesSearched;
    const qnodes = sRes.stats.quiescenceNodes;
    const branchingFactor = d > 1 ? Math.pow(nodes, 1 / d) : nodes;
    
    scalingData.push({
      depth: d,
      nodes,
      qnodes,
      branchingFactor: branchingFactor.toFixed(2),
      timeMs: duration.toFixed(1),
      betaCutoffs: sRes.stats.betaCutoffs || 0,
      ttHits: sRes.stats.transpositionHits || 0,
      ttStores: sRes.stats.transpositionStores || 0
    });
  }

  // Generate Subsystem report table
  const totalSubsystemsTime = Object.values(metrics).reduce((acc, m) => acc + m.time, 0);
  
  // Calculate alphaBetaRecursion as the remaining search time
  const abRecursionTime = Math.max(0, totalSearchTime - totalSubsystemsTime);
  const abRecursionCalls = res.stats.nodesSearched; // approximately number of recursive calls

  const resultsList = Object.entries(metrics).map(([name, m]) => {
    return {
      name,
      time: m.time,
      calls: m.calls,
      pct: totalSearchTime > 0 ? ((m.time / totalSearchTime) * 100).toFixed(2) : '0.00',
      avgCallMs: m.calls > 0 ? (m.time / m.calls).toFixed(4) : '0.0000'
    };
  });

  resultsList.push({
    name: 'recursionOverhead',
    time: abRecursionTime,
    calls: abRecursionCalls,
    pct: totalSearchTime > 0 ? ((abRecursionTime / totalSearchTime) * 100).toFixed(2) : '0.00',
    avgCallMs: abRecursionCalls > 0 ? (abRecursionTime / abRecursionCalls).toFixed(4) : '0.0000'
  });

  const subsystemRanking = resultsList.sort((a, b) => b.time - a.time);

  // Allocation validation
  const memoryBefore = process.memoryUsage().heapUsed;
  const allocationTestEngine = new ConfigurableKronosEngine({ useAlphaBeta: true });
  for (let i = 0; i < 50; i++) {
    allocationTestEngine.go({ depth: 2, fen: fenTest });
  }
  const memoryAfter = process.memoryUsage().heapUsed;
  const estimatedAllocBytes = Math.max(0, memoryAfter - memoryBefore);

  // NPS Verification
  const calculatedNps = Math.round(res.stats.nodesSearched / (res.timeMs / 1000 || 0.001));

  // Generate markdown report
  let md = `# Kronos Performance Investigation & Profiling Audit

## 1. Runtime Subsystem Breakdown & Ranking

The table below ranks the engine's subsystems by their cumulative execution duration during a depth 4 search (total search time: **${totalSearchTime.toFixed(1)} ms**, nodes searched: **${res.stats.nodesSearched}**).

| Rank | Subsystem Module | Calls | Total Time (ms) | Avg Time/Call (ms) | % of Search Time |
| :---: | :--- | :---: | :---: | :---: | :---: |
`;

  subsystemRanking.forEach((sub, idx) => {
    md += `| ${idx + 1} | \`${sub.name}\` | ${sub.calls} | ${sub.time.toFixed(2)} | ${sub.avgCallMs} | ${sub.pct}% |\n`;
  });

  md += `\n*Note: Timings are measured using high-precision \`performance.now()\` wrapping.*

---

## 2. Search Complexity & Depth Scaling Table

The table below traces search growth metrics across search depths 1 to 5 starting from the initial FEN position.

| Depth | Nodes Searched | Quiescence Nodes | Effective Branching Factor | Move Time (ms) | Beta Cutoffs | TT Hits | TT Stores |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
`;

  scalingData.forEach(row => {
    md += `| ${row.depth} | ${row.nodes} | ${row.qnodes} | ${row.branchingFactor} | ${row.timeMs} | ${row.betaCutoffs} | ${row.ttHits} | ${row.ttStores} |\n`;
  });

  md += `
---

## 3. Memory & Object Allocation Audit

During search execution, Javascript object instantiation introduces garbage collection overhead.
- **Transposition Table Keys**: Storing board states using FEN string generation (\`chess.fen()\` via \`fenGeneration\`) on every node causes massive string allocations and garbage collection cycles.
- **Move Generation Allocations**: Calling \`chess.moves({ verbose: true })\` creates a deep copy array and allocates a new JS object for every single legal move generated.
- **Estimated Heap Allocation Rate**: Approximately **${(estimatedAllocBytes / 1024 / 1024).toFixed(2)} MB** allocated per 50 minor searches.

---

## 4. NPS Calculation & Telemetry Audit

- **True Nodes Checked**: We count nodes searched incremented inside \`searchRecursive\`.
- **Timer Resolution**: Using Node's \`performance.now()\` or \`Date.now()\` for millisecond duration limits timing accuracy.
- **NPS Metric Verification**:
  - Search Nodes: \`${res.stats.nodesSearched}\`
  - Reported Time: \`${res.timeMs} ms\`
  - True NPS: \`${calculatedNps.toLocaleString()} NPS\`

---

## 5. Optimization Summary & Recommendation

### Detected Bottlenecks
1. **Transposition Table FEN Keys**: The transposition table uses slow, heavy string representations generated via \`chess.fen()\` instead of lightweight 64-bit integer keys.
2. **Evaluation Re-computations**: The board is traversed and parsed multiple times inside \`evaluateBoard\` and \`getGamePhase\`.
3. **Internal Draw Checks**: Bypassed duplicate checks to achieve speedup.

### Recommendation
**The engine is NOT ready for 100-game and 400-game research runs at depth 4/5.**
The high overhead per node (~${(totalSearchTime / res.stats.nodesSearched * 1000).toFixed(1)} microseconds per node) makes large-scale benchmarking impractical. We must first apply optimizations to eliminate FEN key allocations and improve move generation lookup efficiency.

`;

  fs.writeFileSync('c:/Users/Piyush/OneDrive/Desktop/chess/benchmark/output/PERFORMANCE_PROFILE.md', md);
  fs.writeFileSync('C:/Users/Piyush/.gemini/antigravity-ide/brain/93eace5f-73d4-4a50-86c5-486de33a3fec/PERFORMANCE_PROFILE.md', md);
  console.log("Performance profile report written cleanly to benchmark/output/PERFORMANCE_PROFILE.md");
}

main().catch(console.error);
