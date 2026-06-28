// Kronos Research Suite — Pipeline Manager
// Orchestrates automated research execution, queue persistence, index tracking, and report generation.

import fs from 'fs';
import path from 'path';
import os from 'os';
import { TournamentRunner } from './tournament.js';
import { PositionBenchmarkRunner } from './positionBenchmark.js';
import { ReportGenerator } from './reportGenerator.js';
import { OrdoExporter } from './exportOrdo.js';
import { IntegrityValidator } from './integrityValidator.js';

const QUEUE_FILE = path.resolve('benchmark/output/queue_state.json');
const INDEX_FILE = path.resolve('benchmark/output/index.json');
const MANIFEST_FILE = path.resolve('benchmark/output/experiment_manifest.json');
const SUMMARY_MD_FILE = path.resolve('benchmark/output/summary.md');

const FAMILY_A_CUMULATIVE = [
  { id: 'EXP-A1', name: '1. Baseline vs AlphaBeta', configA: 'benchmark/configs/alphabeta.json', configB: 'benchmark/configs/baseline.json' },
  { id: 'EXP-A2', name: '2. AlphaBeta vs MoveOrdering', configA: 'benchmark/configs/move_ordering.json', configB: 'benchmark/configs/alphabeta.json' },
  { id: 'EXP-A3', name: '3. MoveOrdering vs Killer', configA: 'benchmark/configs/killer_moves.json', configB: 'benchmark/configs/move_ordering.json' },
  { id: 'EXP-A4', name: '4. Killer vs TranspositionTable', configA: 'benchmark/configs/transposition_table.json', configB: 'benchmark/configs/killer_moves.json' },
  { id: 'EXP-A5', name: '5. TranspositionTable vs Quiescence', configA: 'benchmark/configs/quiescence.json', configB: 'benchmark/configs/transposition_table.json' }
];

const FAMILY_B_ABLATION = [
  { id: 'EXP-B1', name: 'Ablation: Full Kronos vs No AlphaBeta', configA: 'benchmark/configs/full_kronos.json', configB: 'benchmark/configs/ablation_no_alphabeta.json' },
  { id: 'EXP-B2', name: 'Ablation: Full Kronos vs No TT', configA: 'benchmark/configs/full_kronos.json', configB: 'benchmark/configs/ablation_no_tt.json' },
  { id: 'EXP-B3', name: 'Ablation: Full Kronos vs No Quiescence', configA: 'benchmark/configs/full_kronos.json', configB: 'benchmark/configs/ablation_no_quiescence.json' },
  { id: 'EXP-B4', name: 'Ablation: Full Kronos vs No Killer', configA: 'benchmark/configs/full_kronos.json', configB: 'benchmark/configs/ablation_no_killer.json' },
  { id: 'EXP-B5', name: 'Ablation: Full Kronos vs No MoveOrdering', configA: 'benchmark/configs/full_kronos.json', configB: 'benchmark/configs/ablation_no_moveordering.json' }
];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    games: 10,
    depth: 3,
    seed: 42,
    sprt: false,
    robustness: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--games' && args[i + 1]) options.games = parseInt(args[++i], 10);
    if (args[i] === '--depth' && args[i + 1]) options.depth = parseInt(args[++i], 10);
    if (args[i] === '--seed' && args[i + 1]) options.seed = parseInt(args[++i], 10);
    if (args[i] === '--sprt') options.sprt = true;
    if (args[i] === '--robustness') options.robustness = true;
  }

  return options;
}

function logTimestamp(msg) {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  console.log(`[${timestamp}] ${msg}`);
}

function loadQueue() {
  if (fs.existsSync(QUEUE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    } catch (e) {}
  }
  return { queue: [], completed: [], status: 'IDLE' };
}

function saveQueue(queueState) {
  const dir = path.dirname(QUEUE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queueState, null, 2));
}

function updateIndex(experimentRecord) {
  let indexData = [];
  if (fs.existsSync(INDEX_FILE)) {
    try {
      indexData = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    } catch (e) {}
  }
  indexData = [experimentRecord, ...indexData.filter(x => x.id !== experimentRecord.id)];
  fs.writeFileSync(INDEX_FILE, JSON.stringify(indexData, null, 2));
}

async function main() {
  const options = parseArgs();
  logTimestamp('======================================================================');
  logTimestamp('         Kronos Research Suite — Automated Pipeline Manager           ');
  logTimestamp('======================================================================');
  logTimestamp(`Options: ${options.games} games | Depth ${options.depth} | Robustness Mode: ${options.robustness ? 'ON' : 'OFF'}\n`);

  let queueState = loadQueue();
  queueState.status = 'RUNNING';

  const plannedTasks = [
    ...FAMILY_A_CUMULATIVE,
    ...FAMILY_B_ABLATION
  ];

  const manifest = [];

  for (const task of plannedTasks) {
    const isDone = queueState.completed.some(c => c.id === task.id);
    if (isDone) {
      logTimestamp(`Skipping completed task: ${task.name} (${task.id})`);
      continue;
    }

    logTimestamp(`Executing Task: ${task.name} (${task.id})...`);
    const runner = new TournamentRunner({
      configA: task.configA,
      configB: task.configB,
      games: options.games,
      depth: options.depth,
      seed: options.seed,
      sprt: options.sprt,
      allowMultiDiff: task.id.startsWith('EXP-B')
    });

    try {
      const results = await runner.run();
      const { outputDir, certification } = ReportGenerator.generate(results, { 
        ...options, 
        configA: task.configA, 
        configB: task.configB,
        allowMultiDiff: task.id.startsWith('EXP-B')
      });

      if (results.pgnContent) OrdoExporter.export(path.join(outputDir, 'games.pgn'), outputDir);

      const experimentRecord = {
        id: task.id,
        name: task.name,
        path: outputDir,
        timestamp: new Date().toISOString(),
        certification,
        engineA: results.engineA,
        engineB: results.engineB,
        stats: results.stats
      };

      updateIndex(experimentRecord);
      queueState.completed.push(experimentRecord);
      saveQueue(queueState);
      manifest.push(experimentRecord);
      logTimestamp(`Task Completed: ${task.id} -> ${certification}`);
    } catch (err) {
      logTimestamp(`ERROR in Task ${task.id}: ${err.message}`);
      queueState.status = 'FAILED';
      saveQueue(queueState);
      process.exit(1);
    }
  }

  // Position validation run
  logTimestamp('Executing Position Validation Suite...');
  const posRunner = new PositionBenchmarkRunner(options);
  const posResults = await posRunner.run();
  logTimestamp(`Position Suite Solved: ${posResults.solvedA}/${posResults.totalPositions}`);

  // Save manifest & summary markdown
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  const summaryMd = `# Kronos Research Pipeline Summary
Generated On: ${new Date().toISOString()}

- Total Pipeline Tasks: ${plannedTasks.length}
- Position Suite Accuracy: ${posResults.accuracyPctA}%
- Overall Status: RESEARCH READY PIPELINE COMPLETED
`;
  fs.writeFileSync(SUMMARY_MD_FILE, summaryMd);

  queueState.status = 'COMPLETED';
  saveQueue(queueState);

  logTimestamp('\n======================================================================');
  logTimestamp('          Research Pipeline Completed Successfully                    ');
  logTimestamp('======================================================================\n');
}

main().catch(err => {
  logTimestamp(`Fatal Pipeline Manager error: ${err.message}`);
  process.exit(1);
});
