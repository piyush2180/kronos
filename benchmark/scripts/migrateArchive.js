import fs from 'fs';
import path from 'path';

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

function migrate() {
  const outputDir = path.resolve('benchmark/output');
  const items = fs.readdirSync(outputDir);

  const categories = ['smoke_tests', 'pilot_runs', 'publication', 'calibration', 'robustness', 'profiles', 'latest', 'archives'];
  
  // Make sure target directories exist
  categories.forEach(cat => {
    const catPath = path.join(outputDir, cat);
    if (!fs.existsSync(catPath)) {
      fs.mkdirSync(catPath, { recursive: true });
    }
  });

  const migratedRecords = [];
  let latestExp = null;
  let latestTime = 0;

  for (const item of items) {
    const itemPath = path.join(outputDir, item);
    if (!fs.lstatSync(itemPath).isDirectory()) continue;
    if (categories.includes(item)) continue; // skip already organized folders

    // Identify if it's an experiment folder (e.g. experiment_* or run_*)
    if (!item.startsWith('experiment_') && !item.startsWith('run_')) {
      // Move other random directories to archives/deprecated/
      const dest = path.join(outputDir, 'archives/deprecated', item);
      console.log(`Archiving deprecated folder ${item} -> archives/deprecated/${item}`);
      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
      }
      fs.renameSync(itemPath, dest);
      continue;
    }

    // Check summary.json
    const summaryPath = path.join(itemPath, 'summary.json');
    let summary = null;
    if (fs.existsSync(summaryPath)) {
      try {
        summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      } catch (e) {
        console.error(`Failed to parse summary.json in ${item}: ${e.message}`);
      }
    }

    let games = 0;
    let engineA = 'Engine A';
    let engineB = 'Engine B';
    let certification = 'RESEARCH READY';
    let depth = 3;
    let seed = 42;
    let timestamp = new Date(fs.statSync(itemPath).mtime).toISOString();

    if (summary) {
      games = summary.stats?.totalGames || summary.settings?.gamesPlayed || 0;
      engineA = summary.engineA || 'Engine A';
      engineB = summary.engineB || 'Engine B';
      certification = summary.certificationStatus || 'RESEARCH READY';
      depth = summary.settings?.depth || 3;
      seed = summary.settings?.seed || 42;
      if (summary.metadata?.benchmarkTimestamp) {
        timestamp = summary.metadata.benchmarkTimestamp;
      }
    } else {
      // Try to determine games from games.pgn
      const pgnPath = path.join(itemPath, 'games.pgn');
      if (fs.existsSync(pgnPath)) {
        const pgnText = fs.readFileSync(pgnPath, 'utf8');
        games = (pgnText.match(/\[Event /g) || []).length;
      }
    }

    // Classification
    let classification = 'smoke_tests';
    const isCalibration = (engineB.toLowerCase().includes('stockfish') || item.includes('calibrate') || item.includes('calibration'));
    const isRobustness = (item.includes('robustness') || item.includes('italian') || item.includes('sicilian') || item.includes('gambit'));

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

    const destDir = path.join(outputDir, classification, item);
    console.log(`Migrating ${item} -> ${classification}/${item} (${games} games)`);
    
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true });
    }
    fs.renameSync(itemPath, destDir);

    const relativePath = `${classification}/${item}`;
    const recordTime = Date.parse(timestamp);

    // Track latest experiment
    if (recordTime > latestTime) {
      latestTime = recordTime;
      latestExp = destDir;
    }

    // Determine ID
    let expId = `EXP-${item.replace('experiment_', '').replace('run_', '')}`;
    if (summary?.metadata?.experimentSettings?.experimentId) {
      expId = summary.metadata.experimentSettings.experimentId;
    }

    const family = expId.startsWith('EXP-A') ? 'Family A (Cumulative)' :
                   expId.startsWith('EXP-B') ? 'Family B (Ablation)' :
                   expId.startsWith('EXP-E') ? 'Family E (Scalability)' : 'Independent Run';

    migratedRecords.push({
      id: expId,
      timestamp,
      family,
      phase: classification,
      games,
      depth,
      seed,
      engineA,
      engineB,
      certification,
      path: relativePath
    });
  }

  // Write updated index.json
  const indexFile = path.join(outputDir, 'index.json');
  fs.writeFileSync(indexFile, JSON.stringify(migratedRecords, null, 2));
  console.log(`Re-generated index registry file: ${indexFile}`);

  // Copy latest experiment to latest/
  if (latestExp) {
    const latestDir = path.join(outputDir, 'latest');
    console.log(`Updating latest reference folder with content from: ${path.basename(latestExp)}`);
    fs.rmSync(latestDir, { recursive: true, force: true });
    fs.mkdirSync(latestDir, { recursive: true });
    copyFolderSync(latestExp, latestDir);
  }

  console.log('\nMigration and reorganization completed successfully.');
}

migrate();
