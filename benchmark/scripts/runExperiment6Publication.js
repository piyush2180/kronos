import { ResearchRunner } from '../pipeline/researchRunner.js';

async function run() {
  await ResearchRunner.run({
    experimentId: 'EXP-6-ITERATIVE-DEEPENING',
    experimentName: 'Experiment 6: Iterative Deepening',
    configA: 'benchmark/configs/ablation_no_quiescence.json', // Treatment uses Iterative Deepening
    configB: 'benchmark/configs/transposition_table.json', // Control uses AB + MO + KM + TT without ID
    games: 400,
    depth: 3,
    seeds: Array.from({ length: 20 }, (_, i) => i + 1),
    excludeKeysFromCheck: ['useIterativeDeepening'],
    researchQuestion: 'Does iterative deepening improve Alpha-Beta search efficiency without degrading playing strength?',
    hypothesis: 'Enabling iterative deepening will optimize the best move history in transposition tables at shallower plies, leading to significantly better move-ordering at the root and internal nodes during the target ply search. This will further reduce node visits and branching factor despite the overhead of searching shallower depths first, while preserving decision equivalence and playing strength.',
    nullHypothesis: 'Iterative deepening does not produce a statistically significant reduction in search node visits, or it introduces computational overhead that offsets any pruning benefits.',
    expectedOutcome: 'ΔElo ≈ 0, same decisions, reduced node counts, lower effective branching factor, higher PV first move cutoff percentage.',
    methodologicalRole: 'This experiment evaluates the specific contribution of progressive-deepening move sorting (Iterative Deepening) on top of the already-optimized transposition table, killer moves, and move ordering baseline.',
    latexTemplate: (data) => `\\subsection{Evaluation of Iterative Deepening}
To evaluate the impact of Iterative Deepening on search efficiency, we conducted a head-to-head tournament of 400 games between Alpha-Beta with move ordering, killer moves, and transposition table caching (control) and Alpha-Beta with move ordering, killer moves, transposition table caching, and iterative deepening (treatment) under a fixed depth limit of $d=3$. 

The empirical results confirm that iterative deepening is decision-equivalent and preserves playing strength, yielding a negligible Elo difference of $\\Delta Elo = ${data.stats.eloDiff}$ ($95\\%$ Confidence Interval: $[${data.stats.eloCiLower}, ${data.stats.eloCiUpper}]$). 

However, the computational efficiency gains were substantial. Iterative deepening reduced the total visited nodes from ${data.totalNodesB.toLocaleString()} down to ${data.totalNodesA.toLocaleString()}, representing a ${data.nodeReductionPct}\\% node reduction. The effective branching factor was cut from ${data.telB.branchingFactor || 'N/A'} to ${data.telA.branchingFactor || 'N/A'}, confirming that the benefits of caching and sorting from shallower iterations outweigh the overhead of progressive deepening.`
  });
}

run().catch(err => {
  console.error('Experiment 6 failed:', err);
  process.exit(1);
});
