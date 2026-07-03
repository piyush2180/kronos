// Kronos Research Suite — Automated Full Experiment Suite & Ablation Runner
// Runs Family A (Cumulative Evolution), Family B (Ablation Studies), and Calibration.

import { TournamentRunner } from '../pipeline/tournament.js';
import { ReportGenerator } from '../reports/reportGenerator.js';
import { OrdoExporter } from '../reports/exportOrdo.js';
import path from 'path';

const FAMILY_A_CUMULATIVE = [
  { name: '1. Baseline vs AlphaBeta', configA: 'benchmark/configs/alphabeta.json', configB: 'benchmark/configs/baseline.json' },
  { name: '2. AlphaBeta vs MoveOrdering', configA: 'benchmark/configs/move_ordering.json', configB: 'benchmark/configs/alphabeta.json' },
  { name: '3. MoveOrdering vs Killer', configA: 'benchmark/configs/killer_moves.json', configB: 'benchmark/configs/move_ordering.json' },
  { name: '4. Killer vs TranspositionTable', configA: 'benchmark/configs/transposition_table.json', configB: 'benchmark/configs/killer_moves.json' },
  { name: '5. TranspositionTable vs Quiescence', configA: 'benchmark/configs/quiescence.json', configB: 'benchmark/configs/transposition_table.json' }
];

const FAMILY_B_ABLATION = [
  { name: 'Ablation: Full Kronos vs No AlphaBeta', configA: 'benchmark/configs/full_kronos.json', configB: 'benchmark/configs/ablation_no_alphabeta.json' },
  { name: 'Ablation: Full Kronos vs No TT', configA: 'benchmark/configs/full_kronos.json', configB: 'benchmark/configs/ablation_no_tt.json' },
  { name: 'Ablation: Full Kronos vs No Quiescence', configA: 'benchmark/configs/full_kronos.json', configB: 'benchmark/configs/ablation_no_quiescence.json' },
  { name: 'Ablation: Full Kronos vs No Killer', configA: 'benchmark/configs/full_kronos.json', configB: 'benchmark/configs/ablation_no_killer.json' },
  { name: 'Ablation: Full Kronos vs No MoveOrdering', configA: 'benchmark/configs/full_kronos.json', configB: 'benchmark/configs/ablation_no_moveordering.json' }
];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    games: 10,
    depth: 3,
    seed: 42,
    sprt: false,
    skipAblation: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--games' && args[i + 1]) options.games = parseInt(args[++i], 10);
    if (args[i] === '--depth' && args[i + 1]) options.depth = parseInt(args[++i], 10);
    if (args[i] === '--seed' && args[i + 1]) options.seed = parseInt(args[++i], 10);
    if (args[i] === '--sprt') options.sprt = true;
    if (args[i] === '--skipAblation') options.skipAblation = true;
  }

  return options;
}

async function runSuite() {
  const options = parseArgs();

  console.log(`======================================================================`);
  console.log(`      Kronos Research Suite — Automated Full Suite & Ablation         `);
  console.log(`======================================================================`);
  console.log(`Games per match: ${options.games} | Depth: ${options.depth} | Seed: ${options.seed}\n`);

  const summaryTable = [];

  // 1. Run Family A: Cumulative Evolution
  console.log(`\n>>> FAMILY A: Cumulative Evolution Benchmark Suite <<<\n`);
  for (const exp of FAMILY_A_CUMULATIVE) {
    console.log(`Executing: ${exp.name}...`);
    const runner = new TournamentRunner({
      configA: exp.configA,
      configB: exp.configB,
      games: options.games,
      depth: options.depth,
      seed: options.seed,
      sprt: options.sprt
    });
    const results = await runner.run();
    const { outputDir, certification } = ReportGenerator.generate(results, { ...options, configA: exp.configA, configB: exp.configB });
    if (results.pgnContent) OrdoExporter.export(path.join(outputDir, 'games.pgn'), outputDir);

    summaryTable.push({
      family: 'Family A (Cumulative)',
      experiment: exp.name,
      eloDiff: `+${results.stats.eloDiff} Elo`,
      scorePct: `${results.stats.scorePct}%`,
      status: certification
    });
  }

  // 2. Run Family B: Ablation Study Suite
  if (!options.skipAblation) {
    console.log(`\n>>> FAMILY B: Ablation Study Benchmark Suite <<<\n`);
    for (const exp of FAMILY_B_ABLATION) {
      console.log(`Executing: ${exp.name}...`);
      const runner = new TournamentRunner({
        configA: exp.configA,
        configB: exp.configB,
        games: options.games,
        depth: options.depth,
        seed: options.seed,
        sprt: options.sprt,
        allowMultiDiff: true
      });
      const results = await runner.run();
      const { outputDir, certification } = ReportGenerator.generate(results, { ...options, configA: exp.configA, configB: exp.configB, allowMultiDiff: true });
      if (results.pgnContent) OrdoExporter.export(path.join(outputDir, 'games.pgn'), outputDir);

      summaryTable.push({
        family: 'Family B (Ablation)',
        experiment: exp.name,
        eloDiff: `+${results.stats.eloDiff} Elo`,
        scorePct: `${results.stats.scorePct}%`,
        status: certification
      });
    }
  }

  console.log(`\n======================================================================`);
  console.log(`                    RESEARCH SUITE COMPLETED                          `);
  console.log(`======================================================================\n`);
  console.table(summaryTable);
}

runSuite().catch(err => {
  console.error('Fatal error in research suite runner:', err);
  process.exit(1);
});
