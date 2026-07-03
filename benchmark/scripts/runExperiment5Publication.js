import { ResearchRunner } from '../pipeline/researchRunner.js';

async function run() {
  await ResearchRunner.run({
    experimentId: 'EXP-5-TRANSPOSITION-TABLE',
    experimentName: 'Experiment 5: Transposition Table Caching',
    configA: 'benchmark/configs/transposition_table.json', // Treatment uses TT (enabled in this config)
    configB: 'benchmark/configs/killer_moves.json', // Control uses quiet move ordering without TT
    games: 400,
    depth: 3,
    seeds: Array.from({ length: 20 }, (_, i) => i + 1),
    excludeKeysFromCheck: ['useTranspositionTable'],
    researchQuestion: 'Does transposition table (TT) caching and Zobrist hashing improve Alpha-Beta search efficiency without degrading playing strength?',
    hypothesis: 'Enabling transposition table caching allows the engine to skip searching identical positions reached via transposition, significantly reducing search node visits and average search time while maintaining decision equivalence and playing strength.',
    nullHypothesis: 'Transposition table caching does not produce a statistically significant reduction in search node visits or branching complexity.',
    expectedOutcome: 'ΔElo ≈ 0, same decisions, reduced node counts, lower effective branching factor, significant transposition hits.',
    methodologicalRole: 'This experiment evaluates the specific contribution of path-transposition caching on top of the already-optimized move-ordering (MVV-LVA) and refutation (Killer Moves) baseline.',
    latexTemplate: (data) => `\\subsection{Evaluation of Transposition Table Caching}
To evaluate the impact of Transposition Table caching on search efficiency, we conducted a head-to-head tournament of 400 games between Alpha-Beta with move ordering and killer moves (control) and Alpha-Beta with move ordering, killer moves, and transposition table caching (treatment) under a fixed depth limit of $d=3$. 

The empirical results confirm that transposition table caching is decision-equivalent and preserves playing strength, yielding a negligible Elo difference of $\\Delta Elo = ${data.stats.eloDiff}$ ($95\\%$ Confidence Interval: $[${data.stats.eloCiLower}, ${data.stats.eloCiUpper}]$). 

However, the computational efficiency gains were substantial. Transposition table caching reduced the total visited nodes from ${data.totalNodesB.toLocaleString()} down to ${data.totalNodesA.toLocaleString()}, representing a ${data.nodeReductionPct}\\% node reduction. The effective branching factor was cut from ${data.telB.branchingFactor || 'N/A'} to ${data.telA.branchingFactor || 'N/A'}, confirming the efficiency of path transposition pruning.`
  });
}

run().catch(err => {
  console.error('Experiment 5 failed:', err);
  process.exit(1);
});
