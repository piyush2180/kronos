import fs from 'fs';
import path from 'path';

export class GraphGenerator {
  /**
   * Generates publication-ready SVG charts and CSV data files.
   * @param {object} benchmarkData - Consolidated benchmark statistics and telemetry
   * @param {string} outputDir - Output directory path
   */
  static generateAll(benchmarkData, outputDir) {
    const graphsDir = path.join(outputDir, 'graphs');
    if (!fs.existsSync(graphsDir)) {
      fs.mkdirSync(graphsDir, { recursive: true });
    }

    const telA = benchmarkData.telemetryA || {};
    const telB = benchmarkData.telemetryB || {};

    // 1. Bar Chart: NPS comparison
    const npsSvg = GraphGenerator.createBarChart(
      'Nodes Per Second (NPS) Comparison',
      [benchmarkData.engineA || 'Engine A', benchmarkData.engineB || 'Engine B'],
      [telA.nodesPerSecond || 0, telB.nodesPerSecond || 0],
      'NPS'
    );
    fs.writeFileSync(path.join(graphsDir, 'nps_comparison.svg'), npsSvg);

    // 2. Bar Chart: Branching Factor
    const bfSvg = GraphGenerator.createBarChart(
      'Effective Branching Factor',
      [benchmarkData.engineA || 'Engine A', benchmarkData.engineB || 'Engine B'],
      [telA.branchingFactor || 0, telB.branchingFactor || 0],
      'Branching Factor'
    );
    fs.writeFileSync(path.join(graphsDir, 'branching_factor.svg'), bfSvg);

    // 3. Bar Chart: Quiescence Percentage
    const qSvg = GraphGenerator.createBarChart(
      'Quiescence Search Node Percentage (%)',
      [benchmarkData.engineA || 'Engine A', benchmarkData.engineB || 'Engine B'],
      [telA.quiescencePercentage || 0, telB.quiescencePercentage || 0],
      'Percentage (%)'
    );
    fs.writeFileSync(path.join(graphsDir, 'quiescence_percentage.svg'), qSvg);

    // CSV Chart Data
    const csvContent = [
      'Metric,Engine A,Engine B',
      `Nodes Per Second,${telA.nodesPerSecond || 0},${telB.nodesPerSecond || 0}`,
      `Branching Factor,${telA.branchingFactor || 0},${telB.branchingFactor || 0}`,
      `Quiescence Pct,${telA.quiescencePercentage || 0},${telB.quiescencePercentage || 0}`,
      `TT Hits,${telA.transpositionHits || 0},${telB.transpositionHits || 0}`
    ].join('\n');

    fs.writeFileSync(path.join(graphsDir, 'graph_data.csv'), csvContent);
    return graphsDir;
  }

  static createBarChart(title, labels, values, yLabel) {
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
  <rect x="${x1}" y="${y1}" width="${barWidth}" height="${bar1Height}" fill="#3B82F6" rx="4"/>
  <text x="${x1 + barWidth / 2}" y="${y1 - 10}" font-family="sans-serif" font-size="14" fill="#60A5FA" text-anchor="middle">${values[0]}</text>
  <text x="${x1 + barWidth / 2}" y="${height - padding + 25}" font-family="sans-serif" font-size="14" fill="#9CA3AF" text-anchor="middle">${labels[0]}</text>

  <!-- Bar 2 -->
  <rect x="${x2}" y="${y2}" width="${barWidth}" height="${bar2Height}" fill="#10B981" rx="4"/>
  <text x="${x2 + barWidth / 2}" y="${y2 - 10}" font-family="sans-serif" font-size="14" fill="#34D399" text-anchor="middle">${values[1]}</text>
  <text x="${x2 + barWidth / 2}" y="${height - padding + 25}" font-family="sans-serif" font-size="14" fill="#9CA3AF" text-anchor="middle">${labels[1]}</text>

  <!-- Y Label -->
  <text x="20" y="${height / 2}" font-family="sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle" transform="rotate(-90 20 ${height / 2})">${yLabel}</text>
</svg>`;
  }
}
