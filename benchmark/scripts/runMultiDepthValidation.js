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
  const depths = [4, 5];
  const gamesCount = 100; // Validation Max Games
  const seeds = Array.from({ length: 10 }, (_, i) => i + 1);

  console.log('==================================================');
  console.log('   Optimized Validation Pipeline Resumer          ');
  console.log(`   Depths: ${depths.join(', ')} | Max Games: ${gamesCount}`);
  console.log('==================================================\n');

  for (const depth of depths) {
    const classification = `publication_depth${depth}`;
    const outputBaseDir = path.resolve(`benchmark/output/${classification}`);
    fs.mkdirSync(outputBaseDir, { recursive: true });

    // Initialize CSV database for this depth if it doesn't exist
    const csvPath = path.join(outputBaseDir, 'FINAL_RESULTS.csv');
    const headerCols = [
      'Experiment', 'Treatment', 'Control', 'Games', 'Wins', 'Losses', 'Draws', 'Score',
      'Elo', '95% CI', 'Total Nodes', 'Node Reduction %', 'Avg Nodes/Game', 'Avg Branching Factor',
      'Avg Search Time', 'Median Search Time', 'Avg NPS', 'Beta Cutoff %', 'PV First Move %',
      'Artifact Folder', 'Git Commit'
    ];
    if (!fs.existsSync(csvPath)) {
      fs.writeFileSync(csvPath, headerCols.join(',') + '\n');
    }

    for (const exp of EXPERIMENTS) {
      // Skip logic: Check if the experiment is already recorded in the CSV and has directory contents
      let alreadyCompleted = false;
      if (fs.existsSync(csvPath)) {
        const rows = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
        for (const row of rows) {
          if (row.includes(`"${exp.experimentName}"`) || row.includes(exp.experimentName)) {
            const cols = row.split(',');
            // The artifact folder column is index 19 (relative path)
            const folderCol = cols.find(c => c.includes('experiment_'));
            if (folderCol) {
              const cleanedFolder = folderCol.replace(/"/g, '').trim();
              const folderName = cleanedFolder.split('/').pop();
              const fullDir = path.join(outputBaseDir, folderName);
              if (fs.existsSync(fullDir) && fs.existsSync(path.join(fullDir, 'summary.json'))) {
                alreadyCompleted = true;
                break;
              }
            }
          }
        }
      }

      if (alreadyCompleted) {
        console.log(`✔ Skipping completed experiment: ${exp.experimentName} (Depth ${depth})`);
        continue;
      }

      if (depth === 5 && exp.experimentId === 'EXP-2-MOVE-ORDERING') {
        console.log(`✔ Skipping Experiment EXP-2-MOVE-ORDERING at Depth 5: brute-force baseline (Alpha-Beta Only) is computationally intractable at d=5.`);
        continue;
      }

      console.log(`\n==================================================`);
      console.log(`Running Experiment ${exp.experimentId} at Depth ${depth} (Validation Mode)`);
      console.log(`==================================================\n`);

      try {
        await ResearchRunner.run({
          ...exp,
          depth,
          games: gamesCount,
          seeds,
          classification,
          minimumGamesBeforeCI: 20, // Validation Mode: start early stop at game 20
          confidenceThreshold: 40  // Validation Mode: stop if CI radius <= ±40 Elo
        });
      } catch (err) {
        console.error(`✘ Error running ${exp.experimentId} at Depth ${depth}:`, err);
      }
    }
  }

  console.log('\n==================================================');
  console.log('   Optimized Validation Pipeline Completed!       ');
  console.log('==================================================\n');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
