import fs from 'fs';
import path from 'path';
import { ResearchRunner } from '../pipeline/researchRunner.js';

const EXPERIMENTS = [
  {
    experimentId: 'EXP-2-MOVE-ORDERING',
    experimentName: 'Experiment 2: MVV-LVA Move Ordering',
    configA: 'benchmark/configs/move_ordering.json',
    configB: 'benchmark/configs/alphabeta.json',
    excludeKeysFromCheck: ['useMoveOrdering', 'useMVVLVA'],
    researchQuestion: 'Does MVV-LVA move ordering improve Alpha-Beta search efficiency without affecting playing strength?',
    hypothesis: 'Ordering promising captures first increases Alpha-Beta pruning efficiency, reducing node count and search complexity while preserving move selection.',
    nullHypothesis: 'Move ordering produces no statistically significant reduction in search effort.',
    expectedOutcome: 'ΔElo ≈ 0, same decisions, reduced nodes, lower branching factor, and higher cutoff efficiency.',
    methodologicalRole: 'Evaluates capture-sorting tree reduction.',
    latexTemplate: (data) => `\\subsection{Evaluation of MVV-LVA Move Ordering (d=${data.depth})}`
  },
  {
    experimentId: 'EXP-3-KILLER-MOVES',
    experimentName: 'Experiment 3: Killer Moves Heuristic',
    configA: 'benchmark/configs/killer_moves.json',
    configB: 'benchmark/configs/move_ordering.json',
    excludeKeysFromCheck: ['useKillerMoves'],
    researchQuestion: 'Does the killer moves heuristic improve Alpha-Beta search efficiency without degrading playing strength?',
    hypothesis: 'Caching and prioritizing quiet move refutations (killer moves) increases pruning efficiency at sibling nodes.',
    nullHypothesis: 'Killer moves do not produce a statistically significant reduction in search node visits.',
    expectedOutcome: 'ΔElo ≈ 0, reduced nodes, lower branching factor.',
    methodologicalRole: 'Evaluates refutation caching.',
    latexTemplate: (data) => `\\subsection{Evaluation of Killer Moves (d=${data.depth})}`
  },
  {
    experimentId: 'EXP-5-TRANSPOSITION-TABLE',
    experimentName: 'Experiment 5: Transposition Table Caching',
    configA: 'benchmark/configs/transposition_table.json',
    configB: 'benchmark/configs/killer_moves.json',
    excludeKeysFromCheck: ['useTranspositionTable'],
    researchQuestion: 'Does transposition table (TT) caching and Zobrist hashing improve Alpha-Beta search efficiency?',
    hypothesis: 'Enabling transposition table caching allows the engine to skip searching identical positions reached via transposition.',
    nullHypothesis: 'Transposition table caching does not produce a statistically significant reduction in search node visits.',
    expectedOutcome: 'ΔElo ≈ 0, reduced node counts, transposition hits.',
    methodologicalRole: 'Evaluates state-transposition pruning.',
    latexTemplate: (data) => `\\subsection{Evaluation of TT Caching (d=${data.depth})}`
  },
  {
    experimentId: 'EXP-6-ITERATIVE-DEEPENING',
    experimentName: 'Experiment 6: Iterative Deepening',
    configA: 'benchmark/configs/ablation_no_quiescence.json',
    configB: 'benchmark/configs/transposition_table.json',
    excludeKeysFromCheck: ['useIterativeDeepening'],
    researchQuestion: 'Does iterative deepening improve Alpha-Beta search efficiency?',
    hypothesis: 'Enabling iterative deepening optimizes the best move history in transposition tables at shallower plies.',
    nullHypothesis: 'Iterative deepening does not produce a statistically significant reduction in search node visits.',
    expectedOutcome: 'ΔElo ≈ 0, reduced node counts, higher PV first move cutoff percentage.',
    methodologicalRole: 'Evaluates progressive-deepening move sorting.',
    latexTemplate: (data) => `\\subsection{Evaluation of Iterative Deepening (d=${data.depth})}`
  },
  {
    experimentId: 'EXP-7-QUIESCENCE-SEARCH',
    experimentName: 'Experiment 7: Quiescence Search',
    configA: 'benchmark/configs/full_kronos.json',
    configB: 'benchmark/configs/ablation_no_quiescence.json',
    excludeKeysFromCheck: ['useQuiescence'],
    researchQuestion: 'Does Quiescence Search improve the tactical playing strength?',
    hypothesis: 'Enabling Quiescence Search will resolve the horizon effect by extending search paths along capture sequences, leading to a significant Elo gain.',
    nullHypothesis: 'Quiescence Search does not alter the playing strength or node visit rates.',
    expectedOutcome: 'Significant positive Elo difference, moderate to large increase in visited node counts.',
    methodologicalRole: 'Evaluates tactical search extensions.',
    latexTemplate: (data) => `\\subsection{Evaluation of Quiescence Search (d=${data.depth})}`
  }
];

async function main() {
  const args = process.argv.slice(2);
  const expIdArg = args.find(a => a.startsWith('--experimentId='));
  const depthArg = args.find(a => a.startsWith('--depth='));

  if (!expIdArg || !depthArg) {
    console.error('Usage: node runSingleValidationExperiment.js --experimentId=<id> --depth=<depth>');
    process.exit(1);
  }

  const expId = expIdArg.split('=')[1];
  const depth = parseInt(depthArg.split('=')[1], 10);

  const exp = EXPERIMENTS.find(e => e.experimentId === expId);
  if (!exp) {
    console.error(`Experiment ${expId} not found.`);
    process.exit(1);
  }

  console.log(`Starting worker: ${expId} at Depth ${depth}...`);
  const classification = `publication_depth${depth}`;

  await ResearchRunner.run({
    ...exp,
    depth,
    games: 100,
    seeds: Array.from({ length: 10 }, (_, i) => i + 1),
    classification,
    minimumGamesBeforeCI: 20, // Validation Mode early stopping
    confidenceThreshold: 40  // CI threshold ±40 Elo
  });

  console.log(`Worker completed: ${expId} at Depth ${depth}`);
}

main().catch(err => {
  console.error('Worker failed:', err);
  process.exit(1);
});
