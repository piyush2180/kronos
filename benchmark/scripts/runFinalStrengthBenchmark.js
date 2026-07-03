import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const MATCHES = [
  {
    experimentId: 'FINAL-D5-VS-D4',
    configA: 'benchmark/configs/full_kronos_d5.json',
    configB: 'benchmark/configs/full_kronos_d4.json',
    games: 20,
    depth: 4
  },
  {
    experimentId: 'FINAL-D6-VS-D5',
    configA: 'benchmark/configs/full_kronos_d6.json',
    configB: 'benchmark/configs/full_kronos_d5.json',
    games: 20,
    depth: 5
  },
  {
    experimentId: 'FINAL-D7-VS-D6',
    configA: 'benchmark/configs/full_kronos_d7.json',
    configB: 'benchmark/configs/full_kronos_d6.json',
    games: 10,
    depth: 6
  }
];

function runMatch(match) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve('benchmark/scripts/runSingleMatch.js');
    console.log(`[Scheduler] Spawning worker for ${match.experimentId}...`);

    const child = spawn('node', [
      scriptPath,
      `--configA=${match.configA}`,
      `--configB=${match.configB}`,
      `--games=${match.games}`,
      `--depth=${match.depth}`,
      `--experimentId=${match.experimentId}`
    ], { stdio: 'inherit' });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Match ${match.experimentId} exited with code ${code}`));
      }
    });
  });
}

async function main() {
  console.log('==================================================');
  console.log('      Final Engine Depth Benchmarking Scheduler   ');
  console.log('==================================================\n');

  // Spawn all matches in parallel
  const promises = MATCHES.map(m => runMatch(m));

  try {
    await Promise.all(promises);
    console.log('\n==================================================');
    console.log('      All Final Engine Matches Complete!           ');
    console.log('==================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ One or more matches failed during execution:', err);
    process.exit(1);
  }
}

main();
