import fs from 'fs';
import path from 'path';
import os from 'os';
import { GraphGenerator } from './graphGenerator.js';
import { IntegrityValidator } from './integrityValidator.js';

export class ReportGenerator {
  /**
   * Generates research-grade experiment package directory.
   * @param {object} benchmarkData - Consolidated benchmark data
   * @param {object} options - Execution options
   * @returns {object} { outputDir, certification }
   */
  static generate(benchmarkData, options = {}) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    
    // Classify experiment based on execution parameters
    let classification = 'smoke_tests';
    const games = benchmarkData.stats?.totalGames || benchmarkData.games?.length || options.games || 0;
    const isCalibration = (options.configB === 'stockfish' || benchmarkData.engineB?.toLowerCase().includes('stockfish') || options.mode === 'calibrate');
    const isRobustness = options.robustness;

    if (isCalibration) {
      classification = 'calibration';
    } else if (isRobustness) {
      classification = 'robustness';
    } else if (games <= 20) {
      classification = 'smoke_tests';
    } else if (games > 20 && games <= 150) {
      classification = 'pilot_runs';
    } else if (games > 150) {
      classification = 'publication';
    }

    const outputDir = path.resolve('benchmark/output', classification, `experiment_${dateStr}`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const configAPath = options.configA || 'benchmark/configs/full_kronos.json';
    const configBPath = options.configB || 'benchmark/configs/baseline.json';
    const openingsPath = 'benchmark/openings/openings.json';

    // 1. Generate Research Metadata
    const metadata = IntegrityValidator.generateResearchMetadata(options, configAPath, configBPath, openingsPath);

    // 2. Perform Integrity Checks
    const openingSuiteRes = IntegrityValidator.validateOpeningSuite(benchmarkData.openingsUsed || []);
    const pgnRes = IntegrityValidator.validatePgnGames(benchmarkData.games || []);
    const telemetryRes = IntegrityValidator.validateTelemetry(benchmarkData.telemetryA, benchmarkData.telemetryB);
    const statsRes = IntegrityValidator.validateStatistics(benchmarkData.stats);

    // Check config isolation
    let configIsoRes = { valid: true, errors: [] };
    if (fs.existsSync(configAPath) && fs.existsSync(configBPath)) {
      try {
        const cfgA = JSON.parse(fs.readFileSync(configAPath, 'utf8'));
        const cfgB = JSON.parse(fs.readFileSync(configBPath, 'utf8'));
        const keys = ['useAlphaBeta', 'useIterativeDeepening', 'useMoveOrdering', 'useMVVLVA', 'useKillerMoves', 'useTranspositionTable', 'useQuiescence'];
        const diffs = keys.filter(k => cfgA[k] !== cfgB[k]);
        if (diffs.length > 1 && !options.allowMultiDiff) {
          configIsoRes = { valid: false, errors: [`Multiple optimizations differ between engines: [${diffs.join(', ')}]`] };
        }
      } catch (e) {
        configIsoRes = { valid: false, errors: [`Failed to parse engine configuration files: ${e.message}`] };
      }
    }

    const integrityReportObj = IntegrityValidator.generateIntegrityReport(metadata, {
      configIsolation: configIsoRes,
      openingSuite: openingSuiteRes,
      pgn: pgnRes,
      telemetry: telemetryRes,
      statistics: statsRes
    });

    // 3. Save Artifact Package Files
    // a. games.pgn
    if (benchmarkData.pgnFilePath && fs.existsSync(benchmarkData.pgnFilePath)) {
      try {
        fs.renameSync(benchmarkData.pgnFilePath, path.join(outputDir, 'games.pgn'));
      } catch (e) {
        try {
          fs.copyFileSync(benchmarkData.pgnFilePath, path.join(outputDir, 'games.pgn'));
          fs.unlinkSync(benchmarkData.pgnFilePath);
        } catch (err) {}
      }
    } else if (benchmarkData.pgnContent) {
      fs.writeFileSync(path.join(outputDir, 'games.pgn'), benchmarkData.pgnContent);
    }

    // b. metadata.json
    fs.writeFileSync(path.join(outputDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

    // c. summary.json
    const summaryJson = {
      metadata,
      certificationStatus: integrityReportObj.overallStatus,
      ...benchmarkData
    };
    fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(summaryJson, null, 2));

    // d. summary.csv
    const stats = benchmarkData.stats || {};
    const csvLines = [
      'Engine A,Engine B,Games,Wins A,Wins B,Draws,Score Pct,Elo Diff,95% CI Lower,95% CI Upper,Certification',
      `"${benchmarkData.engineA}","${benchmarkData.engineB}",${stats.totalGames},${stats.wins},${stats.losses},${stats.draws},${stats.scorePct}%,${stats.eloDiff},${stats.eloCiLower},${stats.eloCiUpper},"${integrityReportObj.overallStatus}"`
    ];
    fs.writeFileSync(path.join(outputDir, 'summary.csv'), csvLines.join('\n'));

    // e. integrity_report.md
    fs.writeFileSync(path.join(outputDir, 'integrity_report.md'), integrityReportObj.md);

    // f. graphs/
    GraphGenerator.generateAll(benchmarkData, outputDir);

    // g. copy exact configurations/ and openings/
    const cfgDir = path.join(outputDir, 'configurations');
    const opDir = path.join(outputDir, 'openings');
    fs.mkdirSync(cfgDir, { recursive: true });
    fs.mkdirSync(opDir, { recursive: true });

    if (fs.existsSync(configAPath)) fs.copyFileSync(configAPath, path.join(cfgDir, 'engineA.json'));
    if (fs.existsSync(configBPath)) fs.copyFileSync(configBPath, path.join(cfgDir, 'engineB.json'));
    if (fs.existsSync(openingsPath)) fs.copyFileSync(openingsPath, path.join(opDir, 'openings.json'));

    // h. report.md
    const mdContent = ReportGenerator.createMarkdownReport(summaryJson, integrityReportObj.overallStatus);
    fs.writeFileSync(path.join(outputDir, 'report.md'), mdContent);

    // i. research_summary.md — Structured experiment summary for paper-ready analysis
    const researchSummary = ReportGenerator.createResearchSummary(benchmarkData, summaryJson, options);
    fs.writeFileSync(path.join(outputDir, 'research_summary.md'), researchSummary);

    // j. Ordo scripts
    ReportGenerator.generateOrdoScripts(benchmarkData, outputDir);

    // Update index.json with new experiment metadata and relative path
    const indexFile = path.resolve('benchmark/output/index.json');
    let indexData = [];
    if (fs.existsSync(indexFile)) {
      try {
        indexData = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
      } catch (e) {}
    }

    const relativePath = `${classification}/experiment_${dateStr}`;
    const expId = options.experimentId || benchmarkData.settings?.experimentId || `EXP-${dateStr}`;
    const family = expId.startsWith('EXP-A') ? 'Family A (Cumulative)' :
                   expId.startsWith('EXP-B') ? 'Family B (Ablation)' :
                   expId.startsWith('EXP-E') ? 'Family E (Scalability)' : 'Independent Run';

    const indexRecord = {
      id: expId,
      timestamp: now.toISOString(),
      family,
      phase: classification,
      games,
      depth: options.depth || benchmarkData.settings?.depth || 3,
      seed: options.seed || benchmarkData.settings?.seed || 42,
      engineA: benchmarkData.engineA,
      engineB: benchmarkData.engineB,
      certification: integrityReportObj.overallStatus,
      path: relativePath
    };

    indexData = [indexRecord, ...indexData.filter(x => x.id !== expId && x.path !== relativePath)];
    fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));

    // Refresh latest reference folder with current experiment files
    const latestDir = path.resolve('benchmark/output/latest');
    fs.rmSync(latestDir, { recursive: true, force: true });
    fs.mkdirSync(latestDir, { recursive: true });

    function copyFolderSync(from, to) {
      if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
      }
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
    console.log(`Research Experiment Artifact Package generated in:`);
    console.log(`${outputDir}`);
    console.log(`Overall Certification Status: [ ${integrityReportObj.overallStatus} ]`);
    console.log(`==================================================\n`);

    return { outputDir, certification: integrityReportObj.overallStatus, checks: {
      configIsolation: configIsoRes,
      openingSuite: openingSuiteRes,
      pgn: pgnRes,
      telemetry: telemetryRes,
      statistics: statsRes
    } };
  }

  static createMarkdownReport(data, certificationStatus) {
    const meta = data.metadata || {};
    const sys = meta.system || {};
    const settings = data.settings || {};
    const stats = data.stats || {};
    const telA = data.telemetryA || {};
    const telB = data.telemetryB || {};

    return `# Kronos Chess Empirical Research Report

**Overall Certification:** \`${certificationStatus}\`  
**Generated On:** ${data.benchmarkTimestamp || new Date().toISOString()}  

---

## 1. Research Metadata & Environment Specs

| Property | Value |
| :--- | :--- |
| **Framework Version** | \`${meta.frameworkVersion}\` |
| **Git Commit Hash** | \`${meta.gitCommitHash}\` (\`${meta.repositoryBranch}\`) |
| **Node.js Version** | \`${sys.nodeVersion}\` |
| **V8 Engine Version** | \`${sys.v8Version || 'N/A'}\` |
| **Operating System** | ${sys.operatingSystem} |
| **CPU Model** | ${sys.cpuModel} (${sys.cpuCoreCount} cores) |
| **Total System Memory** | ${sys.totalMemoryGb} GB |
| **Random Seed** | \`${meta.experimentSettings?.randomSeed}\` |
| **Opening Suite Hash** | \`${meta.experimentSettings?.openingSuiteHash}\` |

---

## 2. Tournament Setup & Configurations

- **Engine A (Test Subject):** \`${data.engineA}\`
- **Engine B (Baseline / Opponent):** \`${data.engineB}\`
- **Search Depth:** Fixed Depth \`${settings.depth}\`
- **Mode:** ${settings.sprtMode ? `SPRT (Status: ${settings.sprtStatus?.status}, LLR: ${settings.sprtStatus?.llr})` : `Fixed Games (${settings.gamesPlayed})`}

---

## 3. Match Results & Statistical Analysis

| Metric | Result |
| :--- | :--- |
| **Total Games Played** | ${stats.totalGames} |
| **Wins (${data.engineA})** | ${stats.wins} |
| **Losses (${data.engineA})** | ${stats.losses} |
| **Draws** | ${stats.draws} |
| **Score Percentage** | **${stats.scorePct}%** |
| **Pairwise Elo Difference** | **${stats.eloDiff > 0 ? '+' : ''}${stats.eloDiff} Elo** (${stats.eloClassification || 'N/A'}) |
| **95% Confidence Interval** | \`[${stats.eloCiLower}, ${stats.eloCiUpper}]\` Elo |

---

## 4. Deep Research Telemetry

| Performance Telemetry | ${data.engineA} | ${data.engineB} |
| :--- | :--- | :--- |
| **Nodes Searched** | ${telA.nodesSearched?.toLocaleString() || 0} | ${telB.nodesSearched?.toLocaleString() || 0} |
| **Quiescence Nodes** | ${telA.quiescenceNodes?.toLocaleString() || 0} | ${telB.quiescenceNodes?.toLocaleString() || 0} |
| **Quiescence %** | ${telA.quiescencePercentage || 0}% | ${telB.quiescencePercentage || 0}% |
| **Nodes Per Second (NPS)** | **${telA.nodesPerSecond?.toLocaleString() || 0}** | **${telB.nodesPerSecond?.toLocaleString() || 0}** |
| **Branching Factor** | ${telA.branchingFactor || 0} | ${telB.branchingFactor || 0} |
| **Transposition Hits** | ${telA.transpositionHits || 0} | ${telB.transpositionHits || 0} |
| **Move Ordering Efficiency** | ${telA.moveOrderingEfficiency || 0}% | ${telB.moveOrderingEfficiency || 0}% |

---

## 5. Artifact Package Index

- Integrity Validation Report: \`integrity_report.md\`
- Comprehensive Research Metadata: \`metadata.json\`
- Consolidated PGN: \`games.pgn\`
- Machine JSON Summary: \`summary.json\`
- Data Vector CSV: \`summary.csv\`
- Exact Configurations Used: \`configurations/\`
- Exact Opening Book Used: \`openings/\`
- NPS Bar Chart: \`graphs/nps_comparison.svg\`
- Branching Factor Chart: \`graphs/branching_factor.svg\`
`;
  }

  static createResearchSummary(benchmarkData, summaryJson, options = {}) {
    const stats = benchmarkData.stats || {};
    const telA = benchmarkData.telemetryA || {};
    const telB = benchmarkData.telemetryB || {};
    const games = benchmarkData.games || [];
    const settings = benchmarkData.settings || {};

    // Count termination reasons
    const terminations = {};
    for (const g of games) {
      const pgn = g.pgn || '';
      const termMatch = pgn.match(/\[Termination "([^"]+)"\]/);
      const reason = termMatch ? termMatch[1] : 'unknown';
      terminations[reason] = (terminations[reason] || 0) + 1;
    }

    // Calculate averages
    const totalNodes = games.reduce((s, g) => s + (g.nodesSearched || 0), 0);
    const totalTime = games.reduce((s, g) => s + (g.searchTimeMs || 0), 0);
    const totalNps = games.reduce((s, g) => s + (g.nodesPerSecond || 0), 0);
    const avgNodes = games.length > 0 ? Math.round(totalNodes / games.length) : 0;
    const avgTimeMs = games.length > 0 ? Math.round(totalTime / games.length) : 0;
    const avgNps = games.length > 0 ? Math.round(totalNps / games.length) : 0;
    const avgMoveCount = games.length > 0 ? Math.round(games.reduce((s, g) => s + (g.moveCount || 0), 0) / games.length) : 0;

    // TT hit rate
    const ttHitsA = telA.transpositionHits || 0;
    const nodesA = telA.nodesSearched || 1;
    const ttHitRate = ((ttHitsA / nodesA) * 100).toFixed(1);

    // Generate experiment ID from directory name
    const expId = options.experimentId || `EXP-${Date.now().toString(36).toUpperCase().slice(-4)}`;

    let md = `# Research Experiment Summary\n\n`;
    md += `## ${expId}\n\n`;
    md += `**${benchmarkData.engineA}** vs **${benchmarkData.engineB}**\n\n`;
    md += `---\n\n`;

    md += `### Match Results\n\n`;
    md += `| Metric | Value |\n`;
    md += `| :--- | :--- |\n`;
    md += `| **Games** | ${stats.totalGames || games.length} |\n`;
    md += `| **Wins** | ${stats.wins || 0} |\n`;
    md += `| **Draws** | ${stats.draws || 0} |\n`;
    md += `| **Losses** | ${stats.losses || 0} |\n`;
    md += `| **Score** | ${stats.scorePct || 50}% |\n`;
    md += `| **ΔElo** | ${stats.eloDiff > 0 ? '+' : ''}${stats.eloDiff || 0} |\n`;
    md += `| **95% CI** | ±${stats.eloCiUpper && stats.eloCiLower ? Math.round((stats.eloCiUpper - stats.eloCiLower) / 2) : '?'} Elo |\n\n`;

    md += `---\n\n`;
    md += `### Performance Telemetry\n\n`;
    md += `| Metric | Value |\n`;
    md += `| :--- | :--- |\n`;
    md += `| **Average NPS** | ${avgNps.toLocaleString()} |\n`;
    md += `| **Average Nodes/Game** | ${avgNodes.toLocaleString()} |\n`;
    md += `| **Average Move Time** | ${avgTimeMs} ms |\n`;
    md += `| **Average Game Length** | ${avgMoveCount} plies |\n`;
    md += `| **TT Hit Rate** | ${ttHitRate}% |\n`;
    md += `| **Search Depth** | ${settings.depth || options.depth || '?'} |\n`;
    md += `| **Seeds** | ${(settings.seeds || [options.seed || 42]).join(', ')} |\n\n`;

    md += `---\n\n`;
    md += `### Termination Reasons\n\n`;
    md += `| Reason | Count |\n`;
    md += `| :--- | :---: |\n`;
    for (const [reason, count] of Object.entries(terminations).sort((a, b) => b[1] - a[1])) {
      const label = reason.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      md += `| ${label} | ${count} |\n`;
    }

    md += `\n---\n\n`;
    md += `*Generated: ${new Date().toISOString()}*\n`;

    return md;
  }

  static generateOrdoScripts(benchmarkData, outputDir) {
    const games = benchmarkData.games || [];

    // Generate Ordo-compatible results file
    const ordoLines = [];
    for (const g of games) {
      const wName = g.white || 'EngineA';
      const bName = g.black || 'EngineB';
      const result = g.result === '1-0' ? '1' : g.result === '0-1' ? '0' : '0.5';
      ordoLines.push(`${wName}\t${bName}\t${result}`);
    }

    const ordoPath = path.join(outputDir, 'ordo_results.tsv');
    fs.writeFileSync(ordoPath, ordoLines.join('\n'));

    // Generate run scripts
    const shScript = `#!/bin/bash\n# Run Ordo to compute Elo ratings\nordo -p ordo_results.tsv -a 0 --draw-elo 32.8 --draw-rate 0.5\n`;
    const batScript = `@echo off\nREM Run Ordo to compute Elo ratings\nordo -p ordo_results.tsv -a 0 --draw-elo 32.8 --draw-rate 0.5\n`;

    fs.writeFileSync(path.join(outputDir, 'run_ordo.sh'), shScript);
    fs.writeFileSync(path.join(outputDir, 'run_ordo.bat'), batScript);
  }
}
