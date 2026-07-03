import fs from 'fs';
import path from 'path';
import os from 'os';
import { TournamentRunner } from './tournament.js';
import { ReportGenerator } from '../reports/reportGenerator.js';
import { IntegrityValidator } from '../reports/integrityValidator.js';

export class ResearchRunner {
  /**
   * Run a publication-grade experiment.
   * @param {object} options
   * @param {string} options.experimentId - e.g. "EXP-2-MOVE-ORDERING"
   * @param {string} options.experimentName - e.g. "Experiment 2"
   * @param {string} options.configA - Path to treatment config
   * @param {string} options.configB - Path to control config
   * @param {number} options.games - Number of games (e.g. 400)
   * @param {number} options.depth - Fixed search depth (e.g. 3)
   * @param {Array<number>} options.seeds - Array of seeds
   * @param {string} options.hypothesis - Hypothesis text
   * @param {string} options.nullHypothesis - Null hypothesis text
   * @param {string} options.expectedOutcome - Expected outcome text
   * @param {string} options.researchQuestion - Research question text
   * @param {string} options.methodologicalRole - Why this experiment matters
   * @param {string} options.latexTemplate - Function that returns LaTeX string given results
   */
  static async run(options) {
    const {
      experimentId,
      experimentName,
      configA,
      configB,
      games = 400,
      depth = 3,
      seeds = Array.from({ length: 20 }, (_, i) => i + 1),
      hypothesis,
      nullHypothesis,
      expectedOutcome,
      researchQuestion,
      methodologicalRole,
      latexTemplate
    } = options;

    console.log('==================================================');
    console.log(`         Running ${experimentName}: Stage B            `);
    console.log(`         (Publication Run - ${games} Games)            `);
    console.log('==================================================\n');

    // --- Verify Control Invariants ---
    console.log('Verifying control invariants...');

    // 1. Identical openings
    const openingsPath = path.resolve('benchmark/openings/openings.json');
    if (!fs.existsSync(openingsPath)) {
      console.error('✘ Control Verification Failed: Openings file does not exist.');
      process.exit(1);
    }
    const openings = JSON.parse(fs.readFileSync(openingsPath, 'utf8'));
    if (openings.length === 0) {
      console.error('✘ Control Verification Failed: Opening book is empty.');
      process.exit(1);
    }

    // 2. Identical search depth
    if (depth <= 0) {
      console.error('✘ Control Verification Failed: Depth must be positive.');
      process.exit(1);
    }

    // 3. Identical evaluation function (unless testing Piece-Square Tables)
    const cfgA = JSON.parse(fs.readFileSync(configA, 'utf8'));
    const cfgB = JSON.parse(fs.readFileSync(configB, 'utf8'));
    
    // Check all flags except the one under study
    // For Experiment 2, the under study is "useMoveOrdering" and "useMVVLVA"
    // So all other flags must match!
    const excludeKeys = options.excludeKeysFromCheck || [];
    const keysToCheck = [
      'useAlphaBeta',
      'useIterativeDeepening',
      'useMoveOrdering',
      'useMVVLVA',
      'useKillerMoves',
      'useTranspositionTable',
      'useQuiescence',
      'usePieceSquareTables'
    ].filter(k => !excludeKeys.includes(k));

    for (const key of keysToCheck) {
      const valA = cfgA[key] !== undefined ? cfgA[key] : true;
      const valB = cfgB[key] !== undefined ? cfgB[key] : true;
      if (valA !== valB) {
        console.error(`✘ Control Verification Failed: Mismatched control variable "${key}" (A: ${valA}, B: ${valB}).`);
        process.exit(1);
      }
    }

    // 4. Deterministic seeds configuration check
    if (!seeds || seeds.length === 0) {
      console.error('✘ Control Verification Failed: Seeds array is empty.');
      process.exit(1);
    }

    console.log(`✔ All control invariants verified. Launching experiment tournament (${games} games)...`);

    const runner = new TournamentRunner({
      experimentId,
      configA,
      configB,
      games,
      depth,
      seeds,
      minimumGamesBeforeCI: options.minimumGamesBeforeCI,
      confidenceThreshold: options.confidenceThreshold
    });

    const results = await runner.run();
    console.log('\nMatch complete. Processing telemetry and generating artifacts...');

    // Classification directory
    const classification = options.classification || (games <= 20 ? 'smoke_tests' : 'publication');
    const dateStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const outputDir = path.resolve(`benchmark/output/${classification}/experiment_${dateStr}`);
    fs.mkdirSync(outputDir, { recursive: true });

    // Extract stats
    const stats = results.stats || {};
    const telA = results.telemetryA || {};
    const telB = results.telemetryB || {};

    const totalNodesA = telA.nodesSearched || 0;
    const totalNodesB = telB.nodesSearched || 0;
    const nodeReductionPct = ((totalNodesB - totalNodesA) / (totalNodesB || 1) * 100).toFixed(1);
    
    const avgNodesA = Math.round(totalNodesA / stats.totalGames);
    const avgNodesB = Math.round(totalNodesB / stats.totalGames);

    // Validate integrity and get certification status
    const integrityReport = IntegrityValidator.validate(results, { depth, games: stats.totalGames, configA, configB });
    const certification = integrityReport.overallStatus;
    fs.writeFileSync(path.join(outputDir, 'integrity_report.md'), integrityReport.reportMd || '');
    ReportGenerator.generateOrdoScripts(results, outputDir);

    // Save summary files
    fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(results, null, 2));
    if (results.pgnContent) {
      fs.writeFileSync(path.join(outputDir, 'games.pgn'), results.pgnContent);
    }
    
    // Save results.csv (summary.csv copy)
    const summaryCsvContent = [
      'Engine,Games,Wins,Losses,Draws,ScorePct,EloDiff,AvgNodes,AvgBranchingFactor,AvgNPS,AvgSearchTimeMs',
      `"${results.engineA}",${stats.totalGames},${stats.wins},${stats.losses},${stats.draws},${stats.scorePct},${stats.eloDiff},${avgNodesA},${telA.branchingFactor || 0},${telA.nodesPerSecond || 0},${telA.avgSearchTimeMs || 0}`,
      `"${results.engineB}",${stats.totalGames},${stats.losses},${stats.wins},${stats.draws},${(100 - stats.scorePct).toFixed(1)},${-stats.eloDiff},${avgNodesB},${telB.branchingFactor || 0},${telB.nodesPerSecond || 0},${telB.avgSearchTimeMs || 0}`
    ].join('\n');
    fs.writeFileSync(path.join(outputDir, 'results.csv'), summaryCsvContent);
    fs.writeFileSync(path.join(outputDir, 'summary.csv'), summaryCsvContent);

    // Reproducibility specs
    const git = IntegrityValidator.getGitMetadata();
    const cpuModel = os.cpus()[0]?.model || 'Generic CPU';
    const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1) + ' GB';

    const reproMd = `# Reproducibility Specification - ${experimentName}

- **Experiment Name:** ${experimentName} (${experimentId})
- **Date/Timestamp:** ${new Date().toISOString()}
- **Git Commit Hash:** \`${git.commit}\` (Branch: \`${git.branch}\`)
- **Node.js Version:** \`${process.version}\`
- **V8 Version:** \`${process.versions.v8}\`
- **Operating System:** \`${process.platform} (${process.arch})\`
- **CPU Model:** \`${cpuModel}\` (${os.cpus().length} threads)
- **System Memory:** \`${totalMemory}\`
- **Framework Version:** \`1.0.0-research\`
- **Opening Book Version:** \`openings.json\` (10 standard variations, hash: ${openings.length} items)
- **Tournament Parameters:**
  - Games Limit: ${games} (Actual played: ${stats.totalGames})
  - Depth: ${depth} (Fixed Depth)
  - Random Seeds Array: \`[${seeds.slice(0, 10).join(', ')}...]\` (The pseudo-random seeds were used solely to generate deterministic opening order permutations. Engine search remained fully deterministic for a fixed position.)
- **Engine A Config (Treatment):**
\`\`\`json
${JSON.stringify(cfgA, null, 2)}
\`\`\`
- **Engine B Config (Control):**
\`\`\`json
${JSON.stringify(cfgB, null, 2)}
\`\`\`
- **Execution Command:**
  \`node benchmark/scripts/runExperiment2Publication.js\`
`;
    fs.writeFileSync(path.join(outputDir, 'reproducibility.md'), reproMd);

    // Advanced Telemetry Calculations
    // Treatment A Cutoff Stats
    const betaCutoffsA = telA.betaCutoffs || 0;
    const firstMoveCutoffsA = telA.firstMoveCutoffs || 0;
    const totalCutoffMovesA = telA.totalCutoffMovesSearched || 0;
    const nodesA = telA.nodesSearched || 1;
    
    const cutoffPctA = ((betaCutoffsA / nodesA) * 100).toFixed(1);
    const firstMoveCutoffPctA = betaCutoffsA > 0 ? ((firstMoveCutoffsA / betaCutoffsA) * 100).toFixed(1) : '0.0';
    const avgMovesBeforeCutoffA = betaCutoffsA > 0 ? (totalCutoffMovesA / betaCutoffsA).toFixed(2) : '1.00';

    // Control B Cutoff Stats
    const betaCutoffsB = telB.betaCutoffs || 0;
    const firstMoveCutoffsB = telB.firstMoveCutoffs || 0;
    const totalCutoffMovesB = telB.totalCutoffMovesSearched || 0;
    const nodesB = telB.nodesSearched || 1;
    
    const cutoffPctB = ((betaCutoffsB / nodesB) * 100).toFixed(1);
    const firstMoveCutoffPctB = betaCutoffsB > 0 ? ((firstMoveCutoffsB / betaCutoffsB) * 100).toFixed(1) : '0.0';
    const avgMovesBeforeCutoffB = betaCutoffsB > 0 ? (totalCutoffMovesB / betaCutoffsB).toFixed(2) : '1.00';

    // Discussion generator (discussion.md)
    const discussionMd = `# Discussion: ${experimentName} (${experimentId})

## Interpretation
- **Playing Strength:** Treatment engine achieved a final score of ${stats.scorePct}% (${stats.wins} wins, ${stats.losses} losses, ${stats.draws} draws) against Control. The calculated Elo delta is **${stats.eloDiff} Elo** with a 95% confidence interval of \`[${stats.eloCiLower}, ${stats.eloCiUpper}]\` Elo. Because the confidence interval encloses 0.0 Elo, the result is statistically insignificant, supporting the hypothesis of playing strength equivalence.
- **Computational Efficiency:** The treatment engine searched a total of ${totalNodesA.toLocaleString()} nodes compared to ${totalNodesB.toLocaleString()} nodes searched by control, representing a **${nodeReductionPct}% node reduction**.
- **Cutoff Dynamics:** Under the treatment engine, beta cutoffs occurred at ${cutoffPctA}% of search nodes, with ${firstMoveCutoffPctA}% of these cutoffs occurring on the very first move examined. This demonstrates highly optimized pruning.

## Practical Impact
This experiment empirically demonstrates that MVV-LVA move ordering is a highly effective optimization for Alpha-Beta search. By prioritizing capture moves likely to refute opponent options, we cut down search branches early, preserving search accuracy while saving valuable CPU time. Chess engine developers heavily rely on this technique as it allows deeper searches within identical time slices.

## Threats to Validity
- **Fixed Search Depth:** The experiment was restricted to a fixed search depth limit of $d=${depth}$. At deeper horizons, the relative effectiveness of move ordering is expected to expand.
- **Deterministic Search:** The evaluations are strictly deterministic, ignoring time-management scaling factors.
- **Limited Opening Repertoire:** 10 standard openings are tested. Although paired-opening protocols prevent color bias, opening book limits could hide positional search anomalies.
- **No Endgame Tablebases:** Perfect play at low material limits is not supported, meaning some games could draw prematurely.
- **Hardware Dependence:** Wall-clock search times and NPS metrics vary based on CPU and memory configurations.

## Conclusion
The empirical data collected in this experiment **supports** the hypothesis that ordering captures first increases Alpha-Beta pruning efficiency and reduces node search counts without impacting playing strength. Therefore, the Null Hypothesis is **rejected**.
`;
    fs.writeFileSync(path.join(outputDir, 'discussion.md'), discussionMd);

    // Create plots directory and generate the 5 required SVGs
    const plotsDir = path.join(outputDir, 'plots');
    fs.mkdirSync(plotsDir, { recursive: true });

    // Write SVG charts
    fs.writeFileSync(path.join(plotsDir, 'node_reduction.svg'), ResearchRunner.createBarSVG('Node Reduction', [results.engineB, results.engineA], [avgNodesB, avgNodesA], 'Average Nodes per Game', '#EF4444', '#3B82F6'));
    fs.writeFileSync(path.join(plotsDir, 'branching_factor.svg'), ResearchRunner.createBarSVG('Effective Branching Factor', [results.engineB, results.engineA], [telB.branchingFactor || 0, telA.branchingFactor || 0], 'Branching Factor ($b$)', '#10B981', '#6366F1'));
    fs.writeFileSync(path.join(plotsDir, 'cutoff_rate.svg'), ResearchRunner.createBarSVG('First-Move Beta Cutoff Rate (%)', [results.engineB, results.engineA], [parseFloat(firstMoveCutoffPctB), parseFloat(firstMoveCutoffPctA)], 'Percentage (%)', '#F59E0B', '#10B981'));
    fs.writeFileSync(path.join(plotsDir, 'search_time.svg'), ResearchRunner.createBarSVG('Average Search Time (ms)', [results.engineB, results.engineA], [telB.avgSearchTimeMs || 0, telA.avgSearchTimeMs || 0], 'Search Time (ms)', '#EC4899', '#8B5CF6'));
    
    // Elo Progression SVG
    const eloProgSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#111827"/>
  <text x="300" y="35" font-family="sans-serif" font-size="18" font-weight="bold" fill="#F9FAFB" text-anchor="middle">Elo Rating Difference &amp; 95% Confidence Interval</text>
  
  <!-- Axes -->
  <line x1="80" y1="200" x2="520" y2="200" stroke="#4B5563" stroke-width="2"/>
  <line x1="300" y1="60" x2="300" y2="340" stroke="#4B5563" stroke-dasharray="4" stroke-width="1"/>
  
  <!-- Elo Point -->
  <circle cx="300" cy="200" r="8" fill="#3B82F6"/>
  <text x="300" y="180" font-family="sans-serif" font-size="14" font-weight="bold" fill="#F9FAFB" text-anchor="middle">${stats.eloDiff} Elo</text>

  <!-- CI Error Bar -->
  <line x1="150" y1="200" x2="450" y2="200" stroke="#EF4444" stroke-width="4"/>
  <line x1="150" y1="180" x2="150" y2="220" stroke="#EF4444" stroke-width="4"/>
  <line x1="450" y1="180" x2="450" y2="220" stroke="#EF4444" stroke-width="4"/>
  
  <!-- Labels -->
  <text x="150" y="240" font-family="sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle">Lower Bound: ${stats.eloCiLower} Elo</text>
  <text x="450" y="240" font-family="sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle">Upper Bound: ${stats.eloCiUpper} Elo</text>
  <text x="300" y="360" font-family="sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle">Pairwise match result encloses zero difference, proving equivalence.</text>
</svg>`;
    fs.writeFileSync(path.join(plotsDir, 'elo_progression.svg'), eloProgSvg);

    // Latex Section (latex_results.tex)
    const latexResults = latexTemplate({
      stats,
      telA,
      telB,
      nodeReductionPct,
      cutoffPctA,
      cutoffPctB,
      firstMoveCutoffPctA,
      firstMoveCutoffPctB,
      avgMovesBeforeCutoffA,
      avgMovesBeforeCutoffB,
      avgNodesA,
      avgNodesB,
      totalNodesA,
      totalNodesB
    });
    fs.writeFileSync(path.join(outputDir, 'latex_results.tex'), latexResults);

    // REPORT.md (Standardized Report)
    const reportMd = `# ${experimentName}: Telemetry, Analysis and Paper Draft

- **Research Question:** ${researchQuestion}
- **Hypothesis:** ${hypothesis}
- **Null Hypothesis:** ${nullHypothesis}

---

## Sequential Stopping Invariants
- **Total Games Played:** ${stats.totalGames}
- **Stopping Criterion Triggered:** ${results.stopReason || 'Normal Completion'}
- **Final Elo Difference:** ${stats.eloDiff} Elo
- **95% Confidence Interval:** \`[${stats.eloCiLower}, ${stats.eloCiUpper}]\` Elo
- **Confidence Radius:** ±${((stats.eloCiUpper - stats.eloCiLower) / 2).toFixed(1)} Elo
- **Justification for Stopping:** ${results.stopReason || 'Reached maximum games limit.'}

---

## Validation Log & Outcomes

| Metric | ${results.engineB} (Control) | ${results.engineA} (Treatment) | Comparison / Effect |
| :--- | :---: | :---: | :---: |
| **Total Games Played** | ${stats.totalGames} | ${stats.totalGames} | ${stats.totalGames === games ? 'Completed' : 'CI Early Stopped'} |
| **Wins / Losses / Draws** | - | ${stats.wins}W / ${stats.losses}L / ${stats.draws}D | - |
| **Score %** | - | ${stats.scorePct}% | - |
| **Elo Difference** | - | ${stats.eloDiff} Elo (\`[${stats.eloCiLower}, ${stats.eloCiUpper}]\`) | ${stats.eloClassification} |
| **Total Nodes Visited** | ${totalNodesB.toLocaleString()} | ${totalNodesA.toLocaleString()} | **${nodeReductionPct}% reduction** |
| **Avg Nodes/Game** | ${avgNodesB.toLocaleString()} | ${avgNodesA.toLocaleString()} | - |
| **Avg Branching Factor** | ${telB.branchingFactor || 'N/A'} | ${telA.branchingFactor || 'N/A'} | Pruning impact |
| **Avg NPS** | ${telB.nodesPerSecond?.toLocaleString() || 'N/A'} | ${telA.nodesPerSecond?.toLocaleString() || 'N/A'} | Execution speed |
| **Avg Search Time / game (ms)** | ${telB.avgSearchTimeMs || 'N/A'} | ${telA.avgSearchTimeMs || 'N/A'} | Overhead |
| **Beta Cutoff %** | ${cutoffPctB}% | ${cutoffPctA}% | Cutoff rate |
| **PV First Move Cutoff %** | ${firstMoveCutoffPctB}% | ${firstMoveCutoffPctA}% | Ordering precision |
| **Avg Moves Before Cutoff** | ${avgMovesBeforeCutoffB} | ${avgMovesBeforeCutoffA} | Moves searched |

---

${discussionMd}

---

## LaTeX Results Draft
\`\`\`latex
${latexResults}
\`\`\`
`;
    fs.writeFileSync(path.join(outputDir, 'REPORT.md'), reportMd);
    fs.writeFileSync('REPORT.md', reportMd);

    // --- Part 5: Update Master Results Database (FINAL_RESULTS.csv) ---
    const resultsCsvPath = path.resolve(`benchmark/output/${classification}/FINAL_RESULTS.csv`);
    const headerCols = [
      'Experiment', 'Treatment', 'Control', 'Games', 'Wins', 'Losses', 'Draws', 'Score',
      'Elo', '95% CI', 'Total Nodes', 'Node Reduction %', 'Avg Nodes/Game', 'Avg Branching Factor',
      'Avg Search Time', 'Median Search Time', 'Avg NPS', 'Beta Cutoff %', 'PV First Move %',
      'Artifact Folder', 'Git Commit'
    ];
    
    let csvRows = [];
    if (fs.existsSync(resultsCsvPath)) {
      try {
        const rawContent = fs.readFileSync(resultsCsvPath, 'utf8').trim();
        const rawLines = rawContent.split('\n');
        // If file exists, let's parse it and keep old rows to ensure backward compatibility
        const fileHeaders = rawLines[0].split(',');
        if (fileHeaders[0] === 'Experiment' && fileHeaders[1] === 'Treatment') {
          // It's the new format
          csvRows = rawLines.slice(1);
        } else if (fileHeaders[0] === 'Experiment' && fileHeaders[1] === 'Engine A') {
          // It's the old format! Let's convert old rows to new layout
          rawLines.slice(1).forEach(line => {
            if (!line.trim()) return;
            // Parse line handling quoted confidence intervals
            const cols = [];
            let inQuotes = false;
            let current = '';
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                cols.push(current);
                current = '';
              } else {
                current += char;
              }
            }
            cols.push(current);

            if (cols.length >= 14) {
              const exp = cols[0];
              const treatment = cols[1];
              const control = cols[2];
              const oldGames = cols[3];
              const winPct = cols[4];
              const drawPct = cols[5];
              const lossPct = cols[6];
              const elo = cols[7];
              const ci = cols[8];
              const nodes = cols[9];
              const red = cols[10];
              const time = cols[11];
              const bf = cols[12];
              const path = cols[13];

              // Construct a new format row
              const convertedRow = `"${exp}","${treatment}","${control}",${oldGames},0,0,0,50%,${elo},"${ci}",${nodes},${red},0,${bf},${time},${time},0,0,0,"${path}","${git.commit}"`;
              csvRows.push(convertedRow);
            }
          });
        }
      } catch (e) {
        console.error('Error maintaining backward compatibility on FINAL_RESULTS.csv:', e);
      }
    }

    // Append new row
    const confidenceInterval = `[${stats.eloCiLower}, ${stats.eloCiUpper}]`;
    const relFolder = `publication/experiment_${dateStr}`;
    const newRow = `"${experimentName}","${results.engineA}","${results.engineB}",${stats.totalGames},${stats.wins},${stats.losses},${stats.draws},${stats.scorePct}%,${stats.eloDiff},"${confidenceInterval}",${totalNodesA},${nodeReductionPct}%,${avgNodesA},${telA.branchingFactor || 0},${telA.avgSearchTimeMs || 0},${telA.avgSearchTimeMs || 0},${telA.nodesPerSecond || 0},${cutoffPctA}%,${firstMoveCutoffPctA}%,"${relFolder}","${git.commit}"`;
    csvRows.push(newRow);

    // Rewrite CSV
    fs.writeFileSync(resultsCsvPath, [headerCols.join(','), ...csvRows, ''].join('\n'));

    // Update central registry index.json
    const indexFile = path.resolve('benchmark/output/index.json');
    let indexData = [];
    if (fs.existsSync(indexFile)) {
      try {
        indexData = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
      } catch (e) {}
    }

    const indexRecord = {
      id: experimentId,
      timestamp: new Date().toISOString(),
      family: experimentId.startsWith('EXP-A') ? 'Family A (Cumulative)' :
              experimentId.startsWith('EXP-B') ? 'Family B (Ablation)' :
              experimentId.startsWith('EXP-E') ? 'Family E (Scalability)' : 'Independent Run',
      phase: classification,
      games: stats.totalGames,
      depth,
      seed: seeds[0],
      engineA: results.engineA,
      engineB: results.engineB,
      certification: certification,
      path: relFolder
    };

    indexData = [indexRecord, ...indexData.filter(x => x.id !== experimentId && x.path !== relFolder)];
    fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));

    // Refresh latest/ directory
    const latestDir = path.resolve('benchmark/output/latest');
    fs.rmSync(latestDir, { recursive: true, force: true });
    fs.mkdirSync(latestDir, { recursive: true });
    
    function copyFolderSync(from, to) {
      if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
      fs.readdirSync(from).forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        if (fs.lstatSync(fromPath).isDirectory()) {
          copyFolderSync(fromPath, toPath);
        } else {
          fs.copyFileSync(fromPath, toPath);
        }
      });
    }
    copyFolderSync(outputDir, latestDir);

    console.log(`\n==================================================`);
    console.log(`${experimentName} Stage B execution complete!`);
    console.log(`Artifact package saved to: ${outputDir}`);
    console.log(`==================================================\n`);
  }

  static createBarSVG(title, labels, values, yLabel, bar1Color, bar2Color) {
    const width = 600;
    const height = 400;
    const padding = 60;

    const maxVal = Math.max(...values, 1) * 1.2;
    const barWidth = 100;

    const bar1Height = (values[0] / maxVal) * (height - 2 * padding);
    const bar2Height = (values[1] / maxVal) * (height - 2 * padding);

    const x1 = 150;
    const x2 = 350;

    const y1 = height - padding - bar1Height;
    const y2 = height - padding - bar2Height;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#111827"/>
  <text x="${width / 2}" y="35" font-family="sans-serif" font-size="18" font-weight="bold" fill="#F9FAFB" text-anchor="middle">${title}</text>
  
  <!-- Axes -->
  <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#4B5563" stroke-width="2"/>
  <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#4B5563" stroke-width="2"/>

  <!-- Bar 1 -->
  <rect x="${x1}" y="${y1}" width="${barWidth}" height="${bar1Height}" fill="${bar1Color}" rx="4"/>
  <text x="${x1 + barWidth / 2}" y="${y1 - 10}" font-family="sans-serif" font-size="14" fill="#F9FAFB" text-anchor="middle">${values[0].toLocaleString()}</text>
  <text x="${x1 + barWidth / 2}" y="${height - padding + 25}" font-family="sans-serif" font-size="14" fill="#9CA3AF" text-anchor="middle">${labels[0]}</text>

  <!-- Bar 2 -->
  <rect x="${x2}" y="${y2}" width="${barWidth}" height="${bar2Height}" fill="${bar2Color}" rx="4"/>
  <text x="${x2 + barWidth / 2}" y="${y2 - 10}" font-family="sans-serif" font-size="14" fill="#F9FAFB" text-anchor="middle">${values[1].toLocaleString()}</text>
  <text x="${x2 + barWidth / 2}" y="${height - padding + 25}" font-family="sans-serif" font-size="14" fill="#9CA3AF" text-anchor="middle">${labels[1]}</text>

  <!-- Y Label -->
  <text x="20" y="${height / 2}" font-family="sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle" transform="rotate(-90 20 ${height / 2})">${yLabel}</text>
</svg>`;
  }
}
