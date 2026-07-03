import { ResearchRunner } from '../pipeline/researchRunner.js';

async function run() {
  await ResearchRunner.run({
    experimentId: 'EXP-7-QUIESCENCE-SEARCH',
    experimentName: 'Experiment 7: Quiescence Search',
    configA: 'benchmark/configs/full_kronos.json', // Treatment uses Quiescence search (enabled)
    configB: 'benchmark/configs/ablation_no_quiescence.json', // Control disables Quiescence search
    games: 400,
    depth: 3,
    seeds: Array.from({ length: 20 }, (_, i) => i + 1),
    excludeKeysFromCheck: ['useQuiescence'],
    researchQuestion: 'Does Quiescence Search improve the tactical playing strength at the cost of expanding visited node counts?',
    hypothesis: 'Enabling Quiescence Search will resolve the horizon effect by extending search paths along capture sequences, leading to a statistically significant increase in playing strength (positive Elo difference). However, because it dynamically expands capture branches beyond the depth limit, it will also increase the total number of searched nodes.',
    nullHypothesis: 'Quiescence Search does not alter the playing strength or node visit rates.',
    expectedOutcome: 'Statistically significant positive Elo difference (ΔElo > 25 Elo), moderate to large increase in visited node counts due to tactical extension nodes, reduction in tactical blunders.',
    methodologicalRole: 'This experiment evaluates the specific contribution of tactical search extensions (Quiescence Search) to playing strength and search node explosion compared against the fully-optimized but depth-blind baseline.',
    latexTemplate: (data) => `\\subsection{Evaluation of Quiescence Search}
To evaluate the impact of Quiescence Search on tactical playing strength and search space efficiency, we conducted a head-to-head tournament of 400 games between Alpha-Beta without quiescence (control) and Alpha-Beta with quiescence (treatment) under a fixed depth limit of $d=3$. 

The empirical results confirm that quiescence search substantially improves playing strength, yielding a statistically significant Elo gain of $\\Delta Elo = ${data.stats.eloDiff}$ ($95\\%$ Confidence Interval: $[${data.stats.eloCiLower}, ${data.stats.eloCiUpper}]$). 

However, this tactical safety came at a computational cost. Quiescence search increased the total visited nodes from ${data.totalNodesB.toLocaleString()} to ${data.totalNodesA.toLocaleString()}, representing a ${data.nodeReductionPct.startsWith('-') ? data.nodeReductionPct.substring(1) : data.nodeReductionPct}\\% node increase. The effective branching factor shifted from ${data.telB.branchingFactor || 'N/A'} to ${data.telA.branchingFactor || 'N/A'}, confirming that the tactical expansion of capture branches increases the search envelope to prevent the horizon effect.`
  });
}

run().catch(err => {
  console.error('Experiment 7 failed:', err);
  process.exit(1);
});
