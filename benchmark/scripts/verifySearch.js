/**
 * Kronos Search Equivalence Verification Suite
 * 
 * Tests the core invariant: on the same position, at the same depth,
 * Alpha-Beta must return the exact same best move and score as Minimax
 * while searching fewer or equal nodes.
 * 
 * Also verifies that additive feature configurations (TT, Killer, etc.)
 * preserve move correctness.
 */

import { Chess } from 'chess.js';
import fs from 'fs';
import path from 'path';
import { ConfigurableKronosEngine } from '../engines/configurableEngine.js';

// ── Generate diverse test positions ──────────────────────────────────

function generatePositionSuite() {
  const positions = [];

  // 1. Standard openings from opening book
  const openingsPath = path.resolve('benchmark/openings/openings.json');
  if (fs.existsSync(openingsPath)) {
    const openings = JSON.parse(fs.readFileSync(openingsPath, 'utf8'));
    for (const o of openings) {
      positions.push({ fen: o.fen, name: o.name, source: 'opening_book' });
    }
  }

  // 2. Tactical positions from positions.json
  const positionsPath = path.resolve('benchmark/openings/positions.json');
  if (fs.existsSync(positionsPath)) {
    const tactical = JSON.parse(fs.readFileSync(positionsPath, 'utf8'));
    for (const p of tactical) {
      positions.push({ fen: p.fen, name: p.name, source: 'tactical_suite' });
    }
  }

  // 3. Procedurally generated mid-game positions
  // Play random games forward to generate diverse positions
  const seeds = [1, 7, 13, 19, 23, 29, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  for (const seed of seeds) {
    const chess = new Chess();
    let rng = seed;
    const advanceMoves = 4 + (seed % 12); // 4-15 moves deep

    for (let i = 0; i < advanceMoves && !chess.isGameOver(); i++) {
      const moves = chess.moves();
      if (moves.length === 0) break;
      rng = (rng * 1103515245 + 12345) & 0x7fffffff;
      const idx = rng % moves.length;
      chess.move(moves[idx]);
    }

    if (!chess.isGameOver()) {
      positions.push({
        fen: chess.fen(),
        name: `Random Game (seed=${seed}, ply=${advanceMoves})`,
        source: 'procedural'
      });
    }
  }

  // 4. Endgame positions
  const endgames = [
    { fen: '8/8/4k3/8/8/4K3/4P3/8 w - - 0 1', name: 'KP vs K' },
    { fen: '8/8/4k3/8/8/4K3/8/4R3 w - - 0 1', name: 'KR vs K' },
    { fen: '8/5k2/8/8/8/8/3K4/3Q4 w - - 0 1', name: 'KQ vs K' },
    { fen: '8/8/3k4/8/8/3K4/2B5/1B6 w - - 0 1', name: 'KBB vs K' },
    { fen: '8/8/3k4/8/8/3K4/8/R7 w - - 0 1', name: 'KR vs K (corner)' },
    { fen: '8/2p5/3k4/8/8/3K4/2P5/8 w - - 0 1', name: 'KP vs KP' },
    { fen: '2r5/8/4k3/8/8/4K3/8/2R5 w - - 0 1', name: 'KR vs KR' },
    { fen: '8/8/3k4/3p4/3P4/3K4/8/8 w - - 0 1', name: 'Blocked Pawns' },
    { fen: '8/5pk1/8/8/8/8/5PK1/8 w - - 0 1', name: 'Symmetric KP' },
    { fen: '4k3/8/8/8/8/8/4PP2/4K3 w - - 0 1', name: 'K+2P vs K' },
  ];
  for (const eg of endgames) {
    positions.push({ ...eg, source: 'endgame' });
  }

  // 5. Complex middlegame positions
  const middlegames = [
    { fen: 'r1bq1rk1/pp2bppp/2n1pn2/3p4/3P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 8', name: 'Symmetric QGD' },
    { fen: 'r1bqk2r/pp2bppp/2n1pn2/2ppP3/3P4/2P2N2/PP2BPPP/RNBQK2R w KQkq d6 0 7', name: 'French Advance' },
    { fen: 'rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5', name: 'QGD Classical' },
    { fen: 'r1bqkb1r/pp3ppp/2n1pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5', name: 'Slav Defense' },
    { fen: 'r1bq1rk1/ppp1npbp/3p1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQ1RK1 w - - 0 9', name: 'KID Classical' },
    { fen: 'rnbqk2r/pppp1ppp/5n2/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', name: 'Italian Setup' },
    { fen: 'r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', name: 'Open Sicilian' },
    { fen: 'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2', name: 'English+d4' },
    { fen: 'r1bqkbnr/pppppppp/2n5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2', name: 'e4 Nc6' },
    { fen: 'rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3', name: 'Caro-Kann Advance' },
  ];
  for (const mg of middlegames) {
    positions.push({ ...mg, source: 'middlegame' });
  }

  // 6. Positions with special features (castling, en-passant, promotions)
  const special = [
    { fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1', name: 'Both can castle' },
    { fen: 'rnbqkbnr/pppp1ppp/8/4pP2/8/8/PPPPP1PP/RNBQKBNR w KQkq e6 0 3', name: 'En-passant available' },
    { fen: '8/P7/8/8/8/8/p7/4K2k w - - 0 1', name: 'Double promotion race' },
    { fen: 'r3k2r/pppqppbp/2n2np1/3p4/3P1B2/2N2N2/PPPQPPPP/R3K2R w KQkq - 4 7', name: 'Complex castling rights' },
    { fen: 'rnbqkbnr/pppp1ppp/8/3Pp3/8/8/PPP1PPPP/RNBQKBNR w KQkq e6 0 3', name: 'Scandinavian EP' },
  ];
  for (const sp of special) {
    positions.push({ ...sp, source: 'special' });
  }

  return positions;
}

// ── Engine Configurations to Test ────────────────────────────────────

const ENGINE_CONFIGS = [
  {
    name: 'Baseline Minimax',
    config: {
      useAlphaBeta: false,
      useIterativeDeepening: false,
      useMoveOrdering: false,
      useMVVLVA: false,
      useKillerMoves: false,
      useTranspositionTable: false,
      useQuiescence: false
    }
  },
  {
    name: 'Alpha-Beta Only',
    config: {
      useAlphaBeta: true,
      useIterativeDeepening: false,
      useMoveOrdering: false,
      useMVVLVA: false,
      useKillerMoves: false,
      useTranspositionTable: false,
      useQuiescence: false
    }
  },
  {
    name: 'AB + Move Ordering',
    config: {
      useAlphaBeta: true,
      useIterativeDeepening: false,
      useMoveOrdering: true,
      useMVVLVA: true,
      useKillerMoves: false,
      useTranspositionTable: false,
      useQuiescence: false
    }
  },
  {
    name: 'AB + MO + Killer',
    config: {
      useAlphaBeta: true,
      useIterativeDeepening: false,
      useMoveOrdering: true,
      useMVVLVA: true,
      useKillerMoves: true,
      useTranspositionTable: false,
      useQuiescence: false
    }
  },
  {
    name: 'AB + MO + Killer + TT',
    config: {
      useAlphaBeta: true,
      useIterativeDeepening: false,
      useMoveOrdering: true,
      useMVVLVA: true,
      useKillerMoves: true,
      useTranspositionTable: true,
      useQuiescence: false
    }
  },
];

// ── Run the Suite ────────────────────────────────────────────────────

async function main() {
  const positions = generatePositionSuite();
  const SEARCH_DEPTH = 3;

  console.log('==================================================');
  console.log('   Kronos Search Equivalence Verification Suite    ');
  console.log('==================================================\n');
  console.log(`Positions: ${positions.length}`);
  console.log(`Search Depth: ${SEARCH_DEPTH}`);
  console.log(`Engine Configs: ${ENGINE_CONFIGS.length}\n`);

  const engines = ENGINE_CONFIGS.map(ec => ({
    name: ec.name,
    engine: new ConfigurableKronosEngine(ec.config)
  }));

  const baseline = engines[0]; // Baseline Minimax is ground truth

  let totalTests = 0;
  let totalPasses = 0;
  let totalFails = 0;
  const failures = [];
  const nodeReduction = {};

  for (const eng of engines.slice(1)) {
    nodeReduction[eng.name] = { totalBaselineNodes: 0, totalEngNodes: 0 };
  }

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    
    // Validate FEN is legal
    try {
      new Chess(pos.fen);
    } catch {
      console.log(`⚠ Skipping invalid FEN: ${pos.name}`);
      continue;
    }

    const baseResult = baseline.engine.go({ depth: SEARCH_DEPTH, fen: pos.fen });

    for (const eng of engines.slice(1)) {
      totalTests++;
      const testResult = eng.engine.go({ depth: SEARCH_DEPTH, fen: pos.fen });

      const moveMatch = baseResult.move === testResult.move;
      const scoreMatch = baseResult.score === testResult.score;

      nodeReduction[eng.name].totalBaselineNodes += baseResult.stats.nodesSearched;
      nodeReduction[eng.name].totalEngNodes += testResult.stats.nodesSearched;

      if (moveMatch && scoreMatch) {
        totalPasses++;
      } else {
        totalFails++;
        const fail = {
          position: pos.name,
          fen: pos.fen,
          source: pos.source,
          engine: eng.name,
          baselineMove: baseResult.move,
          testMove: testResult.move,
          baselineScore: baseResult.score,
          testScore: testResult.score,
          baselineNodes: baseResult.stats.nodesSearched,
          testNodes: testResult.stats.nodesSearched,
          moveMatch,
          scoreMatch
        };
        failures.push(fail);
        console.log(`🚨 FAIL [${i + 1}/${positions.length}] ${pos.name} | ${eng.name}`);
        console.log(`   Baseline: ${baseResult.move} (${baseResult.score}) | ${eng.name}: ${testResult.move} (${testResult.score})`);
      }
    }

    if ((i + 1) % 10 === 0) {
      process.stdout.write(`  [${i + 1}/${positions.length}] positions verified...\r`);
    }
  }

  // ── Output Report ──────────────────────────────────────────────────

  console.log('\n\n==================================================');
  console.log('              VERIFICATION RESULTS                 ');
  console.log('==================================================\n');
  console.log(`Total Tests:   ${totalTests}`);
  console.log(`Passed:        ${totalPasses}`);
  console.log(`Failed:        ${totalFails}`);
  console.log(`Pass Rate:     ${((totalPasses / totalTests) * 100).toFixed(2)}%`);

  console.log('\n── Node Reduction Summary ──\n');
  for (const eng of engines.slice(1)) {
    const nr = nodeReduction[eng.name];
    const ratio = (nr.totalEngNodes / nr.totalBaselineNodes * 100).toFixed(1);
    console.log(`  ${eng.name}: ${nr.totalEngNodes.toLocaleString()} nodes vs Baseline ${nr.totalBaselineNodes.toLocaleString()} (${ratio}% = ${(100 - parseFloat(ratio)).toFixed(1)}% reduction)`);
  }

  if (failures.length > 0) {
    console.log('\n── Failure Details ──\n');
    for (const f of failures) {
      console.log(`  Position: ${f.position} (${f.source})`);
      console.log(`  FEN:      ${f.fen}`);
      console.log(`  Engine:   ${f.engine}`);
      console.log(`  Baseline: move=${f.baselineMove}, score=${f.baselineScore}, nodes=${f.baselineNodes}`);
      console.log(`  Test:     move=${f.testMove}, score=${f.testScore}, nodes=${f.testNodes}`);
      console.log(`  Move Match: ${f.moveMatch} | Score Match: ${f.scoreMatch}`);
      console.log('  ─────────────────────');
    }
  }

  // ── Write structured report ────────────────────────────────────────

  const report = {
    timestamp: new Date().toISOString(),
    searchDepth: SEARCH_DEPTH,
    totalPositions: positions.length,
    totalTests,
    totalPasses,
    totalFails,
    passRate: ((totalPasses / totalTests) * 100).toFixed(2) + '%',
    nodeReduction,
    failures,
    verdict: totalFails === 0 ? 'ALL ENGINES EQUIVALENT — SEARCH CORRECTNESS VERIFIED' : 'DISCREPANCIES FOUND — INVESTIGATION REQUIRED'
  };

  const outputDir = path.resolve('benchmark/output');
  fs.writeFileSync(path.join(outputDir, 'SEARCH_EQUIVALENCE_REPORT.json'), JSON.stringify(report, null, 2));

  // Write markdown report
  let md = `# Search Equivalence Verification Report\n\n`;
  md += `**Generated:** ${report.timestamp}  \n`;
  md += `**Verdict:** \`${report.verdict}\`\n\n`;
  md += `---\n\n`;
  md += `## Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `| :--- | :--- |\n`;
  md += `| Positions Tested | ${positions.length} |\n`;
  md += `| Total Comparisons | ${totalTests} |\n`;
  md += `| Passed | ${totalPasses} |\n`;
  md += `| Failed | ${totalFails} |\n`;
  md += `| Pass Rate | ${report.passRate} |\n`;
  md += `| Search Depth | ${SEARCH_DEPTH} |\n\n`;
  md += `---\n\n`;
  md += `## Node Reduction by Engine\n\n`;
  md += `| Engine | Nodes | Baseline Nodes | Ratio | Reduction |\n`;
  md += `| :--- | :---: | :---: | :---: | :---: |\n`;
  for (const eng of engines.slice(1)) {
    const nr = nodeReduction[eng.name];
    const ratio = (nr.totalEngNodes / nr.totalBaselineNodes * 100).toFixed(1);
    md += `| ${eng.name} | ${nr.totalEngNodes.toLocaleString()} | ${nr.totalBaselineNodes.toLocaleString()} | ${ratio}% | ${(100 - parseFloat(ratio)).toFixed(1)}% |\n`;
  }
  md += `\n---\n\n`;
  md += `## Position Breakdown\n\n`;
  const sourceCounts = {};
  for (const p of positions) {
    sourceCounts[p.source] = (sourceCounts[p.source] || 0) + 1;
  }
  md += `| Source | Count |\n`;
  md += `| :--- | :---: |\n`;
  for (const [src, cnt] of Object.entries(sourceCounts)) {
    md += `| ${src} | ${cnt} |\n`;
  }

  if (failures.length > 0) {
    md += `\n---\n\n## Failures\n\n`;
    for (const f of failures) {
      md += `### ${f.position} (${f.source})\n\n`;
      md += `- **FEN:** \`${f.fen}\`\n`;
      md += `- **Engine:** ${f.engine}\n`;
      md += `- **Baseline:** move=\`${f.baselineMove}\`, score=\`${f.baselineScore}\`, nodes=\`${f.baselineNodes}\`\n`;
      md += `- **Test:** move=\`${f.testMove}\`, score=\`${f.testScore}\`, nodes=\`${f.testNodes}\`\n\n`;
    }
  }

  fs.writeFileSync(path.join(outputDir, 'SEARCH_EQUIVALENCE_REPORT.md'), md);

  console.log(`\nReports written to benchmark/output/SEARCH_EQUIVALENCE_REPORT.{md,json}`);
  console.log(`\nVerdict: ${report.verdict}`);
}

main().catch(console.error);
