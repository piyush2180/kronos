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
    const outputDir = path.resolve('benchmark/output', `experiment_${dateStr}`);

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
    if (benchmarkData.pgnContent) {
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

    console.log(`\n==================================================`);
    console.log(`Research Experiment Artifact Package generated in:`);
    console.log(`${outputDir}`);
    console.log(`Overall Certification Status: [ ${integrityReportObj.overallStatus} ]`);
    console.log(`==================================================\n`);

    return { outputDir, certification: integrityReportObj.overallStatus };
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
| **Pairwise Elo Difference** | **${stats.eloDiff > 0 ? '+' : ''}${stats.eloDiff} Elo** |
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
}
