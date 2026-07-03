import fs from 'fs';
import path from 'path';
import { BenchmarkStats } from './engines/stats.js';
import { SPRTTest } from './engines/sprt.js';

function runStatisticalValidation() {
  console.log('==================================================');
  console.log('      Statistical Validation Audit Run            ');
  console.log('==================================================\n');

  const wins = 50;
  const losses = 30;
  const draws = 20;
  const total = wins + losses + draws;

  // 1. Independent validation recalculations
  const expectedScore = (wins + 0.5 * draws) / total;
  const expectedWinPct = (wins / total) * 100;
  const expectedLossPct = (losses / total) * 100;
  const expectedDrawPct = (draws / total) * 100;

  const expectedElo = -400 * Math.log10(1 / expectedScore - 1);

  const expectedVar = (wins / total) * Math.pow(1 - expectedScore, 2) + 
                      (losses / total) * Math.pow(0 - expectedScore, 2) + 
                      (draws / total) * Math.pow(0.5 - expectedScore, 2);
  const expectedSE = Math.sqrt(expectedVar / total);
  const expectedCIRadius = 1.96 * expectedSE;

  const expectedLowerScore = Math.max(0.001, expectedScore - expectedCIRadius);
  const expectedUpperScore = Math.min(0.999, expectedScore + expectedCIRadius);

  const expectedEloLower = -400 * Math.log10(1 / expectedLowerScore - 1);
  const expectedEloUpper = -400 * Math.log10(1 / expectedUpperScore - 1);

  // Wald's SPRT (Independent Implementation)
  const alpha = 0.05;
  const beta = 0.05;
  const elo0 = 0;
  const elo1 = 10;

  const ind_p0 = 1 / (1 + Math.pow(10, -elo0 / 400));
  const ind_p1 = 1 / (1 + Math.pow(10, -elo1 / 400));

  const ind_lowerBound = Math.log(beta / (1 - alpha));
  const ind_upperBound = Math.log((1 - beta) / alpha);

  const ind_deltaP = ind_p1 - ind_p0;
  const ind_llr = (total * ind_deltaP * (expectedScore - (ind_p0 + ind_p1) / 2)) / expectedVar;

  // 2. Cross-check against codebase implementation
  const actualStats = BenchmarkStats.calculate(wins, losses, draws);
  const sprtEvaluator = new SPRTTest(alpha, beta, elo0, elo1);
  const actualSprt = sprtEvaluator.calculateLLR(wins, losses, draws);

  // 3. Comparisons
  const scoreMatches = Math.abs(actualStats.scorePct - expectedScore * 100) < 0.001;
  const winsMatches = Math.abs(actualStats.winPct - expectedWinPct) < 0.001;
  const lossesMatches = Math.abs(actualStats.lossPct - expectedLossPct) < 0.001;
  const drawsMatches = Math.abs(actualStats.drawPct - expectedDrawPct) < 0.001;
  const eloMatches = Math.abs(actualStats.eloDiff - expectedElo) < 0.2;
  const eloLowerMatches = Math.abs(actualStats.eloCiLower - expectedEloLower) < 0.2;
  const eloUpperMatches = Math.abs(actualStats.eloCiUpper - expectedEloUpper) < 0.2;

  const sprtLowerMatches = Math.abs(actualSprt.lowerBound - ind_lowerBound) < 0.01;
  const sprtUpperMatches = Math.abs(actualSprt.upperBound - ind_upperBound) < 0.01;
  const sprtLlrMatches = Math.abs(actualSprt.llr - ind_llr) < 0.01;

  const allPassed = scoreMatches && winsMatches && lossesMatches && drawsMatches &&
                    eloMatches && eloLowerMatches && eloUpperMatches &&
                    sprtLowerMatches && sprtUpperMatches && sprtLlrMatches;

  console.log(`Score Match: ${scoreMatches ? '✔ PASS' : '✘ FAIL'} (Expected: ${expectedScore * 100}%, Actual: ${actualStats.scorePct}%)`);
  console.log(`Elo Match:   ${eloMatches ? '✔ PASS' : '✘ FAIL'} (Expected: ${expectedElo.toFixed(2)}, Actual: ${actualStats.eloDiff})`);
  console.log(`CI Match:    ${eloLowerMatches && eloUpperMatches ? '✔ PASS' : '✘ FAIL'} (Expected: [${expectedEloLower.toFixed(1)}, ${expectedEloUpper.toFixed(1)}], Actual: [${actualStats.eloCiLower}, ${actualStats.eloCiUpper}])`);
  console.log(`SPRT Match:  ${sprtLlrMatches ? '✔ PASS' : '✘ FAIL'} (Expected LLR: ${ind_llr.toFixed(3)}, Actual LLR: ${actualSprt.llr})`);

  let md = `# Statistical Validation Report\n\n`;
  md += `**Generated On:** ${new Date().toISOString()}  \n`;
  md += `**Audit Status:** ${allPassed ? '✔ CERTIFIED CORRECT' : '✘ AUDIT FAILED'}  \n\n`;
  md += `---\n\n`;
  md += `## 1. Mathematical Formulas Audited\n\n`;
  md += `### Score & Percentages\n`;
  md += `- **Score % ($s$):** $s = \\frac{W + 0.5D}{N}$\n`;
  md += `- **Trinomial Sample Variance ($V$):** $V = w(1-s)^2 + l(0-s)^2 + d(0.5-s)^2$\n`;
  md += `- **Standard Error ($SE$):** $SE = \\sqrt{\\frac{V}{N}}$\n`;
  md += `- **95% Confidence Interval:** $[s - 1.96 \\cdot SE, s + 1.96 \\cdot SE]$\n\n`;

  md += `### Pairwise Logistic Elo\n`;
  md += `- **Elo Difference:** $\\Delta Elo = -400 \\log_{10}\\left(\\frac{1}{s} - 1\\right)$\n`;
  md += `- **CI Lower Bounds:** Elo evaluated at $s - 1.96 \\cdot SE$\n`;
  md += `- **CI Upper Bounds:** Elo evaluated at $s + 1.96 \\cdot SE$\n\n`;

  md += `### Sequential Probability Ratio Test (SPRT)\n`;
  md += `- **Hypotheses Expected Scores:** $p_0 = \\frac{1}{1 + 10^{-Elo_0/400}}$, $p_1 = \\frac{1}{1 + 10^{-Elo_1/400}}$\n`;
  md += `- **Wald's Boundaries:** $\\eta_0 = \\log\\left(\\frac{\\beta}{1-\\alpha}\\right)$, $\\eta_1 = \\log\\left(\\frac{1-\\beta}{\\alpha}\\right)$\n`;
  md += `- **Log-Likelihood Ratio (LLR):** $LLR = \\frac{N(p_1 - p_0)(s - (p_0+p_1)/2)}{V}$\n\n`;

  md += `---\n\n`;
  md += `## 2. Validation Matrix (Wins=${wins}, Losses=${losses}, Draws=${draws}, Total=${total})\n\n`;
  md += `| Statistical Metric | Independent Formula | Codebase Implementation | Status |\n`;
  md += `| :--- | :---: | :---: | :---: |\n`;
  md += `| **Score Percentage** | ${(expectedScore * 100).toFixed(2)}% | ${actualStats.scorePct}% | ${scoreMatches ? '✔ PASS' : '✘ FAIL'} |\n`;
  md += `| **Win Percentage** | ${expectedWinPct.toFixed(2)}% | ${actualStats.winPct}% | ${winsMatches ? '✔ PASS' : '✘ FAIL'} |\n`;
  md += `| **Loss Percentage** | ${expectedLossPct.toFixed(2)}% | ${actualStats.lossPct}% | ${lossesMatches ? '✔ PASS' : '✘ FAIL'} |\n`;
  md += `| **Draw Percentage** | ${expectedDrawPct.toFixed(2)}% | ${actualStats.drawPct}% | ${drawsMatches ? '✔ PASS' : '✘ FAIL'} |\n`;
  md += `| **Pairwise Elo Diff** | ${expectedElo.toFixed(2)} | ${actualStats.eloDiff} | ${eloMatches ? '✔ PASS' : '✘ FAIL'} |\n`;
  md += `| **95% CI Lower Elo** | ${expectedEloLower.toFixed(2)} | ${actualStats.eloCiLower} | ${eloLowerMatches ? '✔ PASS' : '✘ FAIL'} |\n`;
  md += `| **95% CI Upper Elo** | ${expectedEloUpper.toFixed(2)} | ${actualStats.eloCiUpper} | ${eloUpperMatches ? '✔ PASS' : '✘ FAIL'} |\n`;
  md += `| **SPRT Lower Boundary** | ${ind_lowerBound.toFixed(3)} | ${actualSprt.lowerBound} | ${sprtLowerMatches ? '✔ PASS' : '✘ FAIL'} |\n`;
  md += `| **SPRT Upper Boundary** | ${ind_upperBound.toFixed(3)} | ${actualSprt.upperBound} | ${sprtUpperMatches ? '✔ PASS' : '✘ FAIL'} |\n`;
  md += `| **SPRT LLR Score** | ${ind_llr.toFixed(3)} | ${actualSprt.llr} | ${sprtLlrMatches ? '✔ PASS' : '✘ FAIL'} |\n\n`;

  md += `---\n\n`;
  md += `## 3. Verdict\n\n`;
  if (allPassed) {
    md += `> [!NOTE]\n`;
    md += `> **VERDICT: MATHEMATICAL VALIDATION SUCCESSFUL**  \n`;
    md += `> All calculations are verified to be 100% correct and internally consistent.  \n`;
  } else {
    md += `> [!CAUTION]\n`;
    md += `> **VERDICT: AUDIT FAILED**  \n`;
    md += `> Discrepancies were found between independent mathematical formulas and the codebase implementation.  \n`;
  }

  const profilesDir = path.resolve('benchmark/output/profiles');
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
  }

  fs.writeFileSync('STATISTICAL_VALIDATION_REPORT.md', md);
  fs.writeFileSync(path.join(profilesDir, 'STATISTICAL_VALIDATION_REPORT.md'), md);
  fs.writeFileSync(path.resolve('benchmark/docs/STATISTICAL_VALIDATION_REPORT.md'), md);

  console.log(`\n==================================================`);
  console.log(`Statistical Validation Report generated successfully.`);
  console.log(`==================================================\n`);

  if (!allPassed) {
    process.exit(1);
  }
}

runStatisticalValidation();
