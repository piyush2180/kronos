import fs from 'fs';
import path from 'path';
import { TournamentRunner } from './pipeline/tournament.js';
import { ConfigurableKronosEngine } from './engines/configurableEngine.js';

async function verifyAlphaBeta() {
  console.log('==================================================');
  console.log('    AlphaBeta Equivalence Validation Run          ');
  console.log('==================================================\n');

  const configA = 'benchmark/configs/alphabeta.json';
  const configB = 'benchmark/configs/baseline.json';

  const gamesCount = 10;
  const depth = 2; // depth 2 is extremely fast and sufficient to prove equivalence
  const seed = 42;

  const runner = new TournamentRunner({
    configA,
    configB,
    games: gamesCount,
    depth,
    seed
  });

  const results = await runner.run();
  const games = results.games;

  let allEquivalent = true;
  const diagnosticData = [];

  // Group by opening pair (each pair has Game 2N-1 and Game 2N)
  const pairCount = gamesCount / 2;
  for (let pairIdx = 0; pairIdx < pairCount; pairIdx++) {
    const g1 = games[pairIdx * 2];
    const g2 = games[pairIdx * 2 + 1];

    if (!g1 || !g2) continue;

    // Check if the move sequences are identical
    const pgn1Moves = g1.pgn.split('\n').pop().trim();
    const pgn2Moves = g2.pgn.split('\n').pop().trim();
    const movesMatch = pgn1Moves === pgn2Moves;

    // Check outcome match
    const outcomeMatch = g1.result === g2.result;

    const equivalent = movesMatch && outcomeMatch;
    if (!equivalent) {
      allEquivalent = false;
    }

    diagnosticData.push({
      pairIndex: pairIdx + 1,
      opening: g1.opening,
      equivalent,
      g1: {
        white: g1.white,
        black: g1.black,
        result: g1.result,
        moves: pgn1Moves,
        nodes: g1.nodesSearched,
        time: g1.searchTimeMs
      },
      g2: {
        white: g2.white,
        black: g2.black,
        result: g2.result,
        moves: pgn2Moves,
        nodes: g2.nodesSearched,
        time: g2.searchTimeMs
      }
    });
  }

  if (allEquivalent) {
    console.log('✔ AlphaBeta search equivalence validated successfully! All moves are identical.');
    // Remove old diagnostic file if it exists
    if (fs.existsSync('ALPHABETA_DIAGNOSTIC.md')) {
      fs.unlinkSync('ALPHABETA_DIAGNOSTIC.md');
    }
  } else {
    console.log('✘ AlphaBeta equivalence validation FAILED! Generating ALPHABETA_DIAGNOSTIC.md...');
    
    let md = `# Alpha-Beta Search Equivalence Diagnostic\n\n`;
    md += `**Generated On:** ${new Date().toISOString()}  \n`;
    md += `**Validation Verdict:** ✘ SEARCH EQUIVALENCE FAILED  \n\n`;
    md += `> [!CAUTION]\n`;
    md += `> Alpha-Beta search returned different moves or game outcomes compared to the control Baseline Minimax.  \n\n`;
    
    md += `## 1. Opening-by-Opening Score Comparison\n\n`;
    md += `| Pair | Opening | Equivalent? | Game 1 Result | Game 2 Result | Nodes G1 | Nodes G2 |\n`;
    md += `| :--- | :--- | :---: | :---: | :---: | :---: | :---: |\n`;
    
    diagnosticData.forEach(d => {
      md += `| ${d.pairIndex} | ${d.opening} | ${d.equivalent ? '✔ YES' : '✘ NO'} | ${d.g1.result} | ${d.g2.result} | ${d.g1.nodes} | ${d.g2.nodes} |\n`;
    });
    md += `\n`;

    md += `## 2. Detailed Discrepancies\n\n`;
    diagnosticData.filter(d => !d.equivalent).forEach(d => {
      md += `### Pair ${d.pairIndex}: ${d.opening}\n`;
      md += `- **Game 1 (A=White):** \`${d.g1.result}\` | Moves: \`${d.g1.moves}\` | Nodes: \`${d.g1.nodes}\`\n`;
      md += `- **Game 2 (B=White):** \`${d.g2.result}\` | Moves: \`${d.g2.moves}\` | Nodes: \`${d.g2.nodes}\`\n`;
      md += `- **Move Differences:**\n`;
      md += `  - G1 PGN: \`${d.g1.moves}\`\n`;
      md += `  - G2 PGN: \`${d.g2.moves}\`\n\n`;
    });

    fs.writeFileSync('ALPHABETA_DIAGNOSTIC.md', md);
    const reportsDir = path.resolve('benchmark/output/profiles');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(reportsDir, 'ALPHABETA_DIAGNOSTIC.md'), md);
    fs.writeFileSync(path.resolve('benchmark/docs/ALPHABETA_DIAGNOSTIC.md'), md);
    
    console.log('Diagnostic file created at ALPHABETA_DIAGNOSTIC.md.');
    process.exit(1);
  }
}

verifyAlphaBeta().catch(err => {
  console.error('Fatal error during AlphaBeta equivalence validation:', err);
  process.exit(1);
});
