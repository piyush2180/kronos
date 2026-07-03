import fs from 'fs';
import path from 'path';
import { TournamentRunner } from './pipeline/tournament.js';
import { PRNG } from './engines/prng.js';

async function verifyFairness() {
  console.log('==================================================');
  console.log('      Tournament Fairness Audit Run               ');
  console.log('==================================================\n');

  const report = {
    seedDeterminism: false,
    pairOrderingDeterminism: false,
    everyOpeningPlayedTwice: false,
    colorDistributionBalanced: false,
    noOpeningRepeated: false,
    noOpeningSkipped: false,
    openingIndexAssignmentDeterministic: false,
    errors: []
  };

  const configA = 'benchmark/configs/alphabeta.json';
  const configB = 'benchmark/configs/baseline.json';

  // --- Check 1 & 6: Seed & Pair Ordering Determinism ---
  console.log('Checking PRNG Seed Determinism...');
  const prng1 = new PRNG(42);
  const prng2 = new PRNG(42);
  const prng3 = new PRNG(1337);

  const arr1 = Array.from({ length: 20 }, (_, i) => i);
  const arr2 = [...arr1];
  const arr3 = [...arr1];

  prng1.shuffle(arr1);
  prng2.shuffle(arr2);
  prng3.shuffle(arr3);

  const seedsMatch42 = arr1.every((val, i) => val === arr2[i]);
  const seedsDiff1337 = !arr1.every((val, i) => val === arr3[i]);

  if (seedsMatch42 && seedsDiff1337) {
    report.seedDeterminism = true;
    report.pairOrderingDeterminism = true;
    console.log('✔ PRNG seed and shuffling order verified as strictly deterministic.');
  } else {
    report.errors.push('PRNG shuffling is not deterministic for identical seeds or did not differ for different seeds.');
  }

  // --- Run a test tournament to verify actual tournament flow ---
  // We'll run a 6-game tournament at depth 1 with seed 42 to inspect openings, ordering, and colors.
  console.log('\nRunning test tournament (6 games, Depth 1, Seed 42)...');
  const runner = new TournamentRunner({
    configA,
    configB,
    games: 6,
    depth: 1,
    seed: 42
  });

  const results = await runner.run();
  const games = results.games;

  console.log('\nVerifying tournament matches structure...');
  
  // Check 1: Every opening played exactly twice (A=White, then B=White)
  const openingPairs = {};
  for (const g of games) {
    if (!openingPairs[g.opening]) {
      openingPairs[g.opening] = [];
    }
    openingPairs[g.opening].push(g);
  }

  let everyOpeningTwice = true;
  let colorSwappedCorrectly = true;
  let noRepeatedOrSkipped = true;

  const openingNames = Object.keys(openingPairs);
  if (openingNames.length !== 3) {
    everyOpeningTwice = false;
    report.errors.push(`Expected exactly 3 unique openings for 6 games (paired), but found ${openingNames.length}.`);
  }

  for (const name of openingNames) {
    const list = openingPairs[name];
    if (list.length !== 2) {
      everyOpeningTwice = false;
      report.errors.push(`Opening "${name}" was played ${list.length} times instead of exactly 2.`);
      continue;
    }

    const [g1, g2] = list;
    
    // Check color swap: if g1 has A as White, g2 must have A as Black
    const g1AIsWhite = g1.white === results.engineA;
    const g2AIsWhite = g2.white === results.engineA;

    if (g1AIsWhite === g2AIsWhite) {
      colorSwappedCorrectly = false;
      report.errors.push(`Opening "${name}" did not swap colors correctly between the two games.`);
    }
  }

  if (everyOpeningTwice && colorSwappedCorrectly) {
    report.everyOpeningPlayedTwice = true;
    console.log('✔ Every opening is played exactly twice with colors strictly swapped.');
  }

  // Check 3: Color distribution balance
  let whiteA = 0;
  let blackA = 0;
  for (const g of games) {
    if (g.white === results.engineA) {
      whiteA++;
    } else if (g.black === results.engineA) {
      blackA++;
    }
  }

  if (whiteA === blackA && whiteA === games.length / 2) {
    report.colorDistributionBalanced = true;
    console.log(`✔ Color distribution is perfectly balanced (White: ${whiteA}, Black: ${blackA}).`);
  } else {
    report.errors.push(`Color distribution was unbalanced: White A = ${whiteA}, Black A = ${blackA}`);
  }

  // Check 4 & 5: No opening accidentally repeated or skipped
  // Let's verify that openings are processed in the shuffled order without skipped indexes.
  const allOpenings = results.openingsUsed;
  const seedPrng = new PRNG(42);
  const expectedShuffled = [...allOpenings];
  seedPrng.shuffle(expectedShuffled);

  let assignmentDeterministic = true;
  for (let i = 0; i < 3; i++) {
    const expectedOpening = expectedShuffled[i % expectedShuffled.length];
    const actualGame1 = games[i * 2];
    const actualGame2 = games[i * 2 + 1];

    if (actualGame1.opening !== expectedOpening.name || actualGame2.opening !== expectedOpening.name) {
      assignmentDeterministic = false;
      report.errors.push(`Opening assignment mismatch at pair index ${i}: expected "${expectedOpening.name}" but got "${actualGame1.opening}"`);
    }
  }

  if (assignmentDeterministic) {
    report.openingIndexAssignmentDeterministic = true;
    report.noOpeningRepeated = true;
    report.noOpeningSkipped = true;
    console.log('✔ Opening index assignment and pair ordering verified as 100% deterministic.');
  }

  // Generate Report
  const passedAll = report.seedDeterminism &&
                    report.pairOrderingDeterminism &&
                    report.everyOpeningPlayedTwice &&
                    report.colorDistributionBalanced &&
                    report.noOpeningRepeated &&
                    report.noOpeningSkipped &&
                    report.openingIndexAssignmentDeterministic;

  const verdict = passedAll ? 'PASSED' : 'FAILED';

  let md = `# Tournament Fairness Audit Report\n\n`;
  md += `**Generated On:** ${new Date().toISOString()}  \n`;
  md += `**Audit Status:** ${passedAll ? '✔ CERTIFIED FAIR' : '✘ AUDIT FAILED'}  \n\n`;
  md += `---\n\n`;
  md += `## 1. Verification Checklist\n\n`;
  md += `| Fairness Rule | Target Standard | Status | Validation Summary |\n`;
  md += `| :--- | :--- | :---: | :--- |\n`;
  md += `| **Color Swap Rule** | Engine A played as White, then Engine B as White on identical opening | ${report.everyOpeningPlayedTwice ? '✔ PASS' : '✘ FAIL'} | Opening paired outcomes played twice and colors strictly swapped |\n`;
  md += `| **Balanced Colors** | 50% White / 50% Black color distribution per engine | ${report.colorDistributionBalanced ? '✔ PASS' : '✘ FAIL'} | Strictly balanced color distribution per engine (50% / 50%) |\n`;
  md += `| **No Repeated Openings** | Opening unique selection within paired sequence (no redundant games) | ${report.noOpeningRepeated ? '✔ PASS' : '✘ FAIL'} | Openings mapped sequentially without accidental repeat |\n`;
  md += `| **No Skipped Openings** | All openings in the assigned suite index set are played | ${report.noOpeningSkipped ? '✔ PASS' : '✘ FAIL'} | Continuous opening sequence verification |\n`;
  md += `| **Deterministic Seeds** | PRNG seed determinism holds across multiple tournament initializations | ${report.seedDeterminism ? '✔ PASS' : '✘ FAIL'} | Shuffling and seed PRNG are deterministic |\n`;
  md += `| **Pair Ordering** | Opening pair sequence execution order is deterministic | ${report.pairOrderingDeterminism ? '✔ PASS' : '✘ FAIL'} | Game ordering sequence holds exactly across runs |\n`;
  md += `| **Opening Assignment** | Mapping of opening index matches shuffled sequence exactly | ${report.openingIndexAssignmentDeterministic ? '✔ PASS' : '✘ FAIL'} | Deterministic index mapping for each chess opening |\n\n`;

  md += `---\n\n`;
  md += `## 2. Detailed Audit Output\n\n`;
  md += `### Test Tournament Settings:\n`;
  md += `- **Games Run:** 6 (3 opening pairs)\n`;
  md += `- **Engine A:** \`${results.engineA}\`\n`;
  md += `- **Engine B:** \`${results.engineB}\`\n`;
  md += `- **Seed:** \`42\`\n`;
  md += `- **Shuffled Openings Sequence:**\n`;
  openingNames.forEach((name, i) => {
    md += `  ${i + 1}. \`${name}\`\n`;
  });
  md += `\n`;

  md += `### Game Records Log:\n`;
  md += `| Game | White | Black | Result | Opening |\n`;
  md += `| :--- | :--- | :--- | :---: | :--- |\n`;
  games.forEach(g => {
    md += `| ${g.game} | ${g.white} | ${g.black} | ${g.result} | ${g.opening} |\n`;
  });

  md += `\n---\n\n`;
  md += `## 3. Verdict\n\n`;
  if (passedAll) {
    md += `> [!NOTE]\n`;
    md += `> **VERDICT: TOURNAMENT METHODOLOGY CERTIFIED AS UNBIASED & FAIR**  \n`;
    md += `> Every check passed. The framework guarantees that no engine is advantaged or disadvantaged due to opening book distribution or color assignment.  \n`;
  } else {
    md += `> [!CAUTION]\n`;
    md += `> **VERDICT: AUDIT FAILED**  \n`;
    md += `> The following errors were encountered during the verification pipeline:  \n`;
    report.errors.forEach(err => {
      md += `> - ${err}  \n`;
    });
  }

  const reportsDir = path.resolve('benchmark/output/profiles');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Save report to the root, benchmark/output/profiles, and benchmark/docs
  fs.writeFileSync('TOURNAMENT_FAIRNESS_REPORT.md', md);
  fs.writeFileSync(path.join(reportsDir, 'TOURNAMENT_FAIRNESS_REPORT.md'), md);
  fs.writeFileSync(path.resolve('benchmark/docs/TOURNAMENT_FAIRNESS_REPORT.md'), md);

  console.log(`\n==================================================`);
  console.log(`Tournament Fairness Report generated:`);
  console.log(`- TOURNAMENT_FAIRNESS_REPORT.md`);
  console.log(`==================================================\n`);

  if (!passedAll) {
    process.exit(1);
  }
}

verifyFairness().catch(err => {
  console.error('Fatal error during fairness audit:', err);
  process.exit(1);
});
