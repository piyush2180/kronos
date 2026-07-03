import fs from 'fs';
import path from 'path';
import { ConfigurableKronosEngine } from '../engines/configurableEngine.js';

const OPENINGS_PATH = path.resolve('benchmark/openings/openings.json');
const CONFIG_PATH = path.resolve('benchmark/configs/full_kronos.json');
const OUTPUT_DIR = path.resolve('benchmark/output/publication/scaling');

function loadOpenings() {
  if (fs.existsSync(OPENINGS_PATH)) {
    return JSON.parse(fs.readFileSync(OPENINGS_PATH, 'utf8'));
  }
  return [{ name: 'Starting Position', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' }];
}

async function runScalingAnalysis() {
  console.log('==================================================');
  console.log('       Scaling and Node Growth Analysis           ');
  console.log('==================================================\n');

  const openings = loadOpenings();
  const depths = [2, 3, 4, 5];
  const results = [];

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

  for (const depth of depths) {
    console.log(`Running searches at Depth ${depth}...`);
    let totalNodes = 0;
    let totalTime = 0;
    let totalNps = 0;
    let totalBf = 0;
    let count = 0;

    for (const opening of openings) {
      const engine = new ConfigurableKronosEngine(config);
      // Fresh engine state per position search to avoid carry-over caching
      const searchRes = engine.go({ depth, fen: opening.fen });
      
      const nodes = searchRes.stats.nodesSearched || 0;
      const timeMs = searchRes.timeMs || 0;
      const nps = Math.round(nodes / (timeMs / 1000 || 0.001));
      const bf = Math.pow(nodes, 1 / depth);

      totalNodes += nodes;
      totalTime += timeMs;
      totalNps += nps;
      totalBf += bf;
      count++;
    }

    results.push({
      depth,
      avgNodes: Math.round(totalNodes / count),
      avgTimeMs: (totalTime / count).toFixed(2),
      avgNps: Math.round(totalNps / count),
      avgBf: (totalBf / count).toFixed(2)
    });
  }

  console.log('\nScaling results compiled:');
  console.table(results);

  // Write findings to CROSS_DEPTH_ANALYSIS.md
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const reportsDir = path.resolve('benchmark/output/profiles');
  fs.mkdirSync(reportsDir, { recursive: true });
  
  let md = `# Cross-Depth Search Scaling Analysis (Full Kronos)

This report logs the scaling properties of the Full Kronos search engine across depths 2, 3, 4, and 5 over the standard chess opening book suite.

---

## 1. Search Behavior Scaling Database

| Search Depth | Average Nodes Searched | Average Search Time (ms) | Effective Branching Factor ($b$) | Average NPS |
| :---: | :---: | :---: | :---: | :---: |
`;

  results.forEach(r => {
    md += `| **Depth ${r.depth}** | ${r.avgNodes.toLocaleString()} | ${parseFloat(r.avgTimeMs).toLocaleString()} ms | ${r.avgBf} | ${r.avgNps.toLocaleString()} |\n`;
  });

  md += `\n---\n\n## 2. Visualizations\n\nThe following scaling charts have been generated:\n`;
  md += `- Nodes vs Depth: \`plots/nodes_vs_depth.svg\`\n`;
  md += `- Time vs Depth: \`plots/time_vs_depth.svg\`\n`;
  md += `- Branching Factor vs Depth: \`plots/branching_factor_vs_depth.svg\`\n`;
  md += `- NPS vs Depth: \`plots/nps_vs_depth.svg\`\n`;

  fs.writeFileSync('CROSS_DEPTH_ANALYSIS.md', md);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'CROSS_DEPTH_ANALYSIS.md'), md);
  fs.writeFileSync(path.join(reportsDir, 'CROSS_DEPTH_ANALYSIS.md'), md);

  // Write plot charts
  generateLinePlots(results);
}

function generateLinePlots(data) {
  const plotsDir = path.join(OUTPUT_DIR, 'plots');
  fs.mkdirSync(plotsDir, { recursive: true });

  const depths = data.map(d => d.depth);

  fs.writeFileSync(path.join(plotsDir, 'nodes_vs_depth.svg'), createLineSVG('Average Nodes Searched vs Depth', depths, data.map(d => d.avgNodes), 'Depth', 'Nodes Searched', '#EF4444'));
  fs.writeFileSync(path.join(plotsDir, 'time_vs_depth.svg'), createLineSVG('Average Search Time (ms) vs Depth', depths, data.map(d => parseFloat(d.avgTimeMs)), 'Depth', 'Search Time (ms)', '#3B82F6'));
  fs.writeFileSync(path.join(plotsDir, 'branching_factor_vs_depth.svg'), createLineSVG('Effective Branching Factor vs Depth', depths, data.map(d => parseFloat(d.avgBf)), 'Depth', 'Branching Factor ($b$)', '#10B981'));
  fs.writeFileSync(path.join(plotsDir, 'nps_vs_depth.svg'), createLineSVG('Average NPS vs Depth', depths, data.map(d => d.avgNps), 'Depth', 'Nodes Per Second (NPS)', '#EC4899'));

  // Copy graphs folder contents to the publication/latest graphs copy
  const latestScalingDir = path.resolve('benchmark/output/latest/plots');
  fs.mkdirSync(latestScalingDir, { recursive: true });
  fs.readdirSync(plotsDir).forEach(file => {
    fs.copyFileSync(path.join(plotsDir, file), path.join(latestScalingDir, file));
  });

  console.log(`\n✔ Scaling visualizations generated and copied to ${plotsDir}`);
}

function createLineSVG(title, xValues, yValues, xLabel, yLabel, color) {
  const width = 600;
  const height = 400;
  const paddingLeft = 80;
  const paddingRight = 40;
  const paddingTop = 60;
  const paddingBottom = 60;

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = 0;
  const maxY = Math.max(...yValues, 1) * 1.15;

  const getX = (x) => paddingLeft + ((x - minX) / (maxX - minX || 1)) * (width - paddingLeft - paddingRight);
  const getY = (y) => height - paddingBottom - ((y - minY) / (maxY - minY)) * (height - paddingTop - paddingBottom);

  let pathData = '';
  let points = '';
  
  for (let i = 0; i < xValues.length; i++) {
    const px = getX(xValues[i]);
    const py = getY(yValues[i]);
    if (i === 0) {
      pathData += `M ${px} ${py}`;
    } else {
      pathData += ` L ${px} ${py}`;
    }
    points += `<circle cx="${px}" cy="${py}" r="6" fill="${color}"/>\n`;
    // Add value labels on top of points
    points += `<text x="${px}" y="${py - 12}" font-family="sans-serif" font-size="12" fill="#F9FAFB" text-anchor="middle">${yValues[i].toLocaleString()}</text>\n`;
  }

  // Draw 5 grid lines along Y-axis
  let grids = '';
  for (let i = 0; i <= 4; i++) {
    const val = minY + (i / 4) * (maxY - minY);
    const gy = getY(val);
    grids += `<line x1="${paddingLeft}" y1="${gy}" x2="${width - paddingRight}" y2="${gy}" stroke="#374151" stroke-width="1" stroke-dasharray="2"/>\n`;
    grids += `<text x="${paddingLeft - 10}" y="${gy + 4}" font-family="sans-serif" font-size="10" fill="#9CA3AF" text-anchor="end">${Math.round(val).toLocaleString()}</text>\n`;
  }

  // X Axis Labels
  let xLabels = '';
  for (let i = 0; i < xValues.length; i++) {
    const px = getX(xValues[i]);
    xLabels += `<text x="${px}" y="${height - paddingBottom + 20}" font-family="sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle">d=${xValues[i]}</text>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#111827"/>
  <text x="${width / 2}" y="35" font-family="sans-serif" font-size="18" font-weight="bold" fill="#F9FAFB" text-anchor="middle">${title}</text>
  
  <!-- Grid & Y ticks -->
  ${grids}
  
  <!-- Axes -->
  <line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" stroke="#4B5563" stroke-width="2"/>
  <line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${height - paddingBottom}" stroke="#4B5563" stroke-width="2"/>

  <!-- Plot Line -->
  <path d="${pathData}" fill="none" stroke="${color}" stroke-width="3"/>

  <!-- Data Points -->
  ${points}

  <!-- X Labels -->
  ${xLabels}

  <!-- Axis Titles -->
  <text x="${width / 2}" y="${height - 15}" font-family="sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle">${xLabel}</text>
  <text x="25" y="${height / 2}" font-family="sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle" transform="rotate(-90 25 ${height / 2})">${yLabel}</text>
</svg>`;
}

runScalingAnalysis().catch(err => {
  console.error('Scaling Analysis failed:', err);
  process.exit(1);
});
