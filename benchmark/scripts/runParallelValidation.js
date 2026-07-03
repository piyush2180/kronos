import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import os from 'os';

const EXPERIMENTS = [
  { id: 'EXP-2-MOVE-ORDERING', name: 'Experiment 2: MVV-LVA Move Ordering' },
  { id: 'EXP-3-KILLER-MOVES', name: 'Experiment 3: Killer Moves Heuristic' },
  { id: 'EXP-5-TRANSPOSITION-TABLE', name: 'Experiment 5: Transposition Table Caching' },
  { id: 'EXP-6-ITERATIVE-DEEPENING', name: 'Experiment 6: Iterative Deepening' },
  { id: 'EXP-7-QUIESCENCE-SEARCH', name: 'Experiment 7: Quiescence Search' }
];

const DEPTHS = [4, 5];

function runWorker(expId, depth) {
  return new Promise((resolve, reject) => {
    const workerScript = path.resolve('benchmark/scripts/runSingleValidationExperiment.js');
    console.log(`[Scheduler] Spawning worker process for ${expId} (Depth ${depth})...`);
    
    const child = spawn('node', [workerScript, `--experimentId=${expId}`, `--depth=${depth}`], {
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Worker for ${expId} at depth ${depth} exited with code ${code}`));
      }
    });
  });
}

async function main() {
  console.log('==================================================');
  console.log('     Multi-Threaded Parallel Validation Scheduler  ');
  console.log('==================================================\n');

  const pendingTasks = [];

  for (const depth of DEPTHS) {
    const classification = `publication_depth${depth}`;
    const outputBaseDir = path.resolve(`benchmark/output/${classification}`);
    const csvPath = path.join(outputBaseDir, 'FINAL_RESULTS.csv');

    for (const exp of EXPERIMENTS) {
      // Exclude EXP-2 at Depth 5 due to brute force computational complexity
      if (depth === 5 && exp.id === 'EXP-2-MOVE-ORDERING') {
        console.log(`✔ [Skip Check] Skipping EXP-2-MOVE-ORDERING at Depth 5: brute-force baseline is computationally intractable.`);
        continue;
      }

      // Check if already completed
      let alreadyCompleted = false;
      if (fs.existsSync(csvPath)) {
        const rows = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
        for (const row of rows) {
          if (row.includes(`"${exp.name}"`) || row.includes(exp.name)) {
            const cols = row.split(',');
            const folderCol = cols.find(c => c.includes('experiment_'));
            if (folderCol) {
              const cleanedFolder = folderCol.replace(/"/g, '').trim();
              const folderName = cleanedFolder.split('/').pop();
              const fullDir = path.join(outputBaseDir, folderName);
              if (fs.existsSync(fullDir) && fs.existsSync(path.join(fullDir, 'summary.json'))) {
                alreadyCompleted = true;
                break;
              }
            }
          }
        }
      }

      if (alreadyCompleted) {
        console.log(`✔ [Skip Check] Skipping completed experiment: ${exp.name} (Depth ${depth})`);
        continue;
      }

      pendingTasks.push({ id: exp.id, depth });
    }
  }

  if (pendingTasks.length === 0) {
    console.log('\n✔ All validation experiments are already completed and verified!');
    process.exit(0);
  }

  const maxConcurrency = 3;
  console.log(`\nScheduled ${pendingTasks.length} validation tasks with maximum concurrency = ${maxConcurrency} workers.\n`);

  // Run tasks with limited concurrency pool
  const activeWorkers = [];
  const queue = [...pendingTasks];

  async function processQueue() {
    if (queue.length === 0) return;
    const task = queue.shift();
    try {
      await runWorker(task.id, task.depth);
    } catch (err) {
      console.error(`✘ Task failed: ${task.id} at Depth ${task.depth}:`, err.message);
    }
    await processQueue();
  }

  const workers = [];
  for (let i = 0; i < maxConcurrency; i++) {
    workers.push(processQueue());
  }

  await Promise.all(workers);

  console.log('\n==================================================');
  console.log('   All Parallel Validation Tournaments Complete!  ');
  console.log('==================================================\n');
}

main().catch(err => {
  console.error('Parallel scheduler execution failed:', err);
  process.exit(1);
});
