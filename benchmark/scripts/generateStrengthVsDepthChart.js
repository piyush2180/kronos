// generateStrengthVsDepthChart.js
// Generates a publication-grade SVG chart demonstrating Elo strength scaling across search depths.

import fs from 'fs';
import path from 'path';

const ENGINES = [
  "Baseline Minimax",
  "Alpha-Beta Only",
  "Move Ordering (MVV-LVA)",
  "Killer Moves",
  "Transposition Table & Zobrist",
  "Full Kronos (No Quiescence)",
  "Full Kronos Engine"
];

const COLORS = {
  "Baseline Minimax": "#9CA3AF",
  "Alpha-Beta Only": "#60A5FA",
  "Move Ordering (MVV-LVA)": "#34D399",
  "Killer Moves": "#F59E0B",
  "Transposition Table & Zobrist": "#A78BFA",
  "Full Kronos (No Quiescence)": "#F472B6",
  "Full Kronos Engine": "#F87171"
};

function main() {
  const ratingsPath = path.resolve('ENGINE_RATINGS.json');
  if (!fs.existsSync(ratingsPath)) {
    console.error('ENGINE_RATINGS.json not found. Run rating calculation script first.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(ratingsPath, 'utf8'));
  const ratings = data.ratings;

  const depths = [3, 4, 5];
  
  // Dimensions and padding
  const width = 800;
  const height = 550;
  const paddingLeft = 90;
  const paddingRight = 240; // Space for legend
  const paddingTop = 70;
  const paddingBottom = 70;

  // Determine global min and max Elo
  let minElo = 0;
  let maxElo = 0;
  for (const depth of depths) {
    if (!ratings[depth]) continue;
    for (const eng of ENGINES) {
      const val = ratings[depth][eng];
      if (val !== undefined && val !== null) {
        if (val < minElo) minElo = val;
        if (val > maxElo) maxElo = val;
      }
    }
  }

  // Margin buffer
  minElo = Math.floor(minElo / 100) * 100 - 50;
  maxElo = Math.ceil(maxElo / 100) * 100 + 50;

  const getX = (d) => paddingLeft + ((d - 3) / 2) * (width - paddingLeft - paddingRight);
  const getY = (elo) => height - paddingBottom - ((elo - minElo) / (maxElo - minElo)) * (height - paddingTop - paddingBottom);

  let gridLines = '';
  // Horizontal grid lines every 100 Elo
  const gridStep = 100;
  const startGrid = Math.ceil(minElo / 100) * 100;
  for (let val = startGrid; val <= maxElo; val += gridStep) {
    const gy = getY(val);
    gridLines += `<line x1="${paddingLeft}" y1="${gy}" x2="${width - paddingRight}" y2="${gy}" stroke="#374151" stroke-dasharray="3,3" stroke-width="1"/>\n`;
    gridLines += `<text x="${paddingLeft - 12}" y="${gy + 4}" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#9CA3AF" text-anchor="end">${val > 0 ? '+' : ''}${val}</text>\n`;
  }

  // Draw Vertical lines for depths
  for (const d of depths) {
    const gx = getX(d);
    gridLines += `<line x1="${gx}" y1="${paddingTop}" x2="${gx}" y2="${height - paddingBottom}" stroke="#374151" stroke-dasharray="3,3" stroke-width="1"/>\n`;
    gridLines += `<text x="${gx}" y="${height - paddingBottom + 22}" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle" font-weight="500">Depth ${d}</text>\n`;
  }

  let chartContent = '';
  let plotMarkers = '';

  // Plot lines and data markers for each engine
  for (const eng of ENGINES) {
    const color = COLORS[eng];
    let pathData = '';
    
    for (let idx = 0; idx < depths.length; idx++) {
      const d = depths[idx];
      if (!ratings[d] || ratings[d][eng] === undefined || ratings[d][eng] === null) continue;
      
      const val = ratings[d][eng];
      const px = getX(d);
      const py = getY(val);

      if (pathData === '') {
        pathData += `M ${px} ${py}`;
      } else {
        pathData += ` L ${px} ${py}`;
      }

      // Add a data point circle
      plotMarkers += `<circle cx="${px}" cy="${py}" r="5" fill="${color}" stroke="#111827" stroke-width="1.5"/>\n`;
      // Small value bubble
      plotMarkers += `<text x="${px}" y="${py - 10}" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#F3F4F6" text-anchor="middle" font-weight="bold">${val > 0 ? '+' : ''}${val}</text>\n`;
    }

    if (pathData) {
      chartContent += `<path d="${pathData}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>\n`;
    }
  }

  // Generate legend items
  let legendItems = '';
  let legendY = paddingTop + 10;
  for (const eng of ENGINES) {
    const color = COLORS[eng];
    legendItems += `
    <g transform="translate(${width - paddingRight + 20}, ${legendY})">
      <rect width="14" height="14" rx="3" fill="${color}"/>
      <text x="24" y="11" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#E5E7EB">${eng}</text>
    </g>\n`;
    legendY += 28;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#111827" rx="8"/>
  
  <!-- Header Title -->
  <text x="${(width - paddingRight + paddingLeft) / 2}" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" fill="#F9FAFB" text-anchor="middle">Relative Elo Strength vs. Search Depth</text>
  <text x="${(width - paddingRight + paddingLeft) / 2}" y="56" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle">Calculated using Bradley-Terry rating model over 100-game match pairs</text>
  
  <!-- Plot Border -->
  <rect x="${paddingLeft}" y="${paddingTop}" width="${width - paddingRight - paddingLeft}" height="${height - paddingBottom - paddingTop}" fill="none" stroke="#4B5563" stroke-width="1.5"/>

  <!-- Grid lines -->
  ${gridLines}

  <!-- Plot lines -->
  ${chartContent}

  <!-- Markers & Values -->
  ${plotMarkers}

  <!-- Legend -->
  <g>
    <rect x="${width - paddingRight + 10}" y="${paddingTop - 10}" width="${paddingRight - 20}" height="${legendY - paddingTop}" fill="#1F2937" rx="6" stroke="#374151" stroke-width="1"/>
    <text x="${width - paddingRight + 20}" y="${paddingTop + 10}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="bold" fill="#9CA3AF" letter-spacing="1">ENGINE CONFIG</text>
    ${legendItems}
  </g>

  <!-- Axis Titles -->
  <text x="${(width - paddingRight + paddingLeft) / 2}" y="${height - 15}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="bold" fill="#9CA3AF" text-anchor="middle">Target Search Depth</text>
  <text x="25" y="${(height - paddingBottom + paddingTop) / 2}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="bold" fill="#9CA3AF" text-anchor="middle" transform="rotate(-90 25 ${(height - paddingBottom + paddingTop) / 2})">Relative Elo Rating (Baseline = 0)</text>
</svg>`;

  const outPath1 = path.resolve('benchmark/output/publication/strength_vs_depth.svg');
  const outPath2 = path.resolve('strength_vs_depth.svg');

  fs.mkdirSync(path.dirname(outPath1), { recursive: true });
  fs.writeFileSync(outPath1, svg);
  fs.writeFileSync(outPath2, svg);

  console.log('✔ Strength scaling SVG charts generated:');
  console.log(`- ${outPath1}`);
  console.log(`- ${outPath2}`);
}

main();
