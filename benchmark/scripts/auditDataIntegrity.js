import fs from 'fs';
import path from 'path';

const CSV_PATH = path.resolve('benchmark/output/publication/FINAL_RESULTS.csv');
const OUTPUT_BASE = path.resolve('benchmark/output');

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function runAudit() {
  console.log('==================================================');
  console.log('          Master Registry Integrity Audit         ');
  console.log('==================================================\n');

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`✘ Error: Master CSV not found at ${CSV_PATH}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(CSV_PATH, 'utf8').trim();
  const lines = rawContent.split('\n');
  
  if (lines.length < 2) {
    console.error('✘ Error: Master CSV is empty or lacks headers.');
    process.exit(1);
  }

  const headers = parseCsvLine(lines[0]);
  console.log(`Detected Headers (${headers.length} columns):`);
  console.log(headers.map((h, i) => `  ${i + 1}. ${h}`).join('\n'));
  console.log('');

  const expectedHeaders = [
    'Experiment', 'Treatment', 'Control', 'Games', 'Wins', 'Losses', 'Draws', 'Score',
    'Elo', '95% CI', 'Total Nodes', 'Node Reduction %', 'Avg Nodes/Game', 'Avg Branching Factor',
    'Avg Search Time', 'Median Search Time', 'Avg NPS', 'Beta Cutoff %', 'PV First Move %',
    'Artifact Folder', 'Git Commit'
  ];

  let headersMatch = true;
  for (let i = 0; i < expectedHeaders.length; i++) {
    if (headers[i] !== expectedHeaders[i]) {
      console.warn(`⚠ Warning: Header column mismatch at index ${i + 1}. Expected: "${expectedHeaders[i]}", Got: "${headers[i]}"`);
      headersMatch = false;
    }
  }

  if (headersMatch) {
    console.log('✔ CSV Headers are strictly aligned with schema.');
  } else {
    console.log('⚠ Warning: CSV Headers have schema mismatches.');
  }

  let failedRows = 0;
  const rows = lines.slice(1);
  console.log(`\nAuditing ${rows.length} experimental records...`);

  rows.forEach((line, idx) => {
    if (!line.trim()) return;
    
    const cols = parseCsvLine(line);
    const rowNum = idx + 2;
    console.log(`\n--- Record ${idx + 1}: ${cols[0] || 'Unknown'} ---`);

    if (cols.length < expectedHeaders.length) {
      console.error(`  ✘ Error (Row ${rowNum}): Expected at least ${expectedHeaders.length} columns, got ${cols.length}`);
      failedRows++;
      return;
    }

    // Check numbers
    const games = parseInt(cols[3]);
    const wins = parseInt(cols[4]);
    const losses = parseInt(cols[5]);
    const draws = parseInt(cols[6]);
    const elo = parseFloat(cols[8]);
    const totalNodes = parseInt(cols[10]);

    if (isNaN(games) || games <= 0) {
      console.error(`  ✘ Error (Row ${rowNum}): Invalid 'Games' count: ${cols[3]}`);
      failedRows++;
    }
    if (isNaN(wins) || isNaN(losses) || isNaN(draws)) {
      console.error(`  ✘ Error (Row ${rowNum}): Invalid Win/Loss/Draw count`);
      failedRows++;
    }
    if (isNaN(elo)) {
      console.error(`  ✘ Error (Row ${rowNum}): Invalid Elo: ${cols[8]}`);
      failedRows++;
    }
    if (isNaN(totalNodes) || totalNodes < 0) {
      console.error(`  ✘ Error (Row ${rowNum}): Invalid 'Total Nodes' count: ${cols[10]}`);
      failedRows++;
    }

    // Verify folder files
    const relFolder = cols[19];
    if (!relFolder) {
      console.error(`  ✘ Error (Row ${rowNum}): Missing 'Artifact Folder' field`);
      failedRows++;
      return;
    }

    const folderPath = path.join(OUTPUT_BASE, relFolder);
    console.log(`  Verifying folder: ${folderPath}`);

    if (!fs.existsSync(folderPath)) {
      console.error(`  ✘ Error (Row ${rowNum}): Folder does not exist: ${folderPath}`);
      failedRows++;
      return;
    }

    const requiredFiles = [
      'summary.json',
      'summary.csv',
      'results.csv',
      'games.pgn',
      'reproducibility.md',
      'discussion.md',
      'REPORT.md',
      'latex_results.tex',
      'plots/node_reduction.svg',
      'plots/branching_factor.svg',
      'plots/cutoff_rate.svg',
      'plots/search_time.svg',
      'plots/elo_progression.svg'
    ];

    let missingFiles = 0;
    requiredFiles.forEach(file => {
      const filePath = path.join(folderPath, file);
      if (!fs.existsSync(filePath)) {
        console.error(`    ✘ Missing File: ${file}`);
        missingFiles++;
      }
    });

    if (missingFiles === 0) {
      console.log('  ✔ All required publication files are present.');
    } else {
      console.error(`  ✘ Error: ${missingFiles} required files are missing from the artifact package.`);
      failedRows++;
    }
  });

  console.log('\n==================================================');
  if (failedRows === 0) {
    console.log('✔ AUDIT SUCCESS: All experimental data is 100% integral and verified!');
    process.exit(0);
  } else {
    console.error(`✘ AUDIT FAILED: Found ${failedRows} issues. Please run missing publication scripts.`);
    process.exit(1);
  }
}

runAudit();
