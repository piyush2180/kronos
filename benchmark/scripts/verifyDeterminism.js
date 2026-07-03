// verifyDeterminism.js
// Validates search determinism, checkpoint serialization, and correct resumption.

import { TournamentRunner } from '../pipeline/tournament.js';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('==================================================');
  console.log('      Verifying Search Determinism & Checkpointing');
  console.log('==================================================\n');

  const configA = 'benchmark/configs/alphabeta.json';
  const configB = 'benchmark/configs/baseline.json';
  const expId = 'test_determinism_run';
  const depth = 2;
  const gamesCount = 6;
  const seed = 42;

  // Clean any existing checkpoints
  const cpDir = path.resolve('benchmark/output/checkpoints');
  const cpFile = path.resolve(cpDir, `checkpoint_${expId}_d${depth}.json`);
  const tempPgn = path.resolve(cpDir, `temp_${expId}_d${depth}.pgn`);

  if (fs.existsSync(cpFile)) fs.unlinkSync(cpFile);
  if (fs.existsSync(tempPgn)) fs.unlinkSync(tempPgn);

  console.log('Running SCENARIO 1: Continuous Execution (6 games)...');
  const continuousRunner = new TournamentRunner({
    experimentId: expId,
    configA,
    configB,
    games: gamesCount,
    depth,
    seed,
    checkpoint: false
  });

  const res1 = await continuousRunner.run();

  console.log(`\nSCENARIO 1 Results:`);
  console.log(`- Wins A: ${res1.stats.wins} | Wins B: ${res1.stats.losses} | Draws: ${res1.stats.draws}`);
  console.log(`- Total Nodes A: ${res1.telemetryA.nodesSearched}`);
  console.log(`- Total Nodes B: ${res1.telemetryB.nodesSearched}`);

  // Scenario 2: Resumed Execution
  console.log('\nRunning SCENARIO 2: Part 1 - Stop at Game 3...');
  const runnerPart1 = new TournamentRunner({
    experimentId: expId,
    configA,
    configB,
    games: gamesCount,
    depth,
    seed,
    checkpoint: true,
    stopAtGame: 3
  });

  const resPart1 = await runnerPart1.run();
  console.log(`- Games played before stop: ${resPart1.games.length}`);
  console.log(`- Checkpoint file exists: ${fs.existsSync(cpFile)}`);

  console.log('\nRunning SCENARIO 2: Part 2 - Resume from Checkpoint...');
  const runnerPart2 = new TournamentRunner({
    experimentId: expId,
    configA,
    configB,
    games: gamesCount,
    depth,
    seed,
    checkpoint: true
  });

  const resPart2 = await runnerPart2.run();
  console.log(`\nSCENARIO 2 Resumed Results:`);
  console.log(`- Wins A: ${resPart2.stats.wins} | Wins B: ${resPart2.stats.losses} | Draws: ${resPart2.stats.draws}`);
  console.log(`- Total Nodes A: ${resPart2.telemetryA.nodesSearched}`);
  console.log(`- Total Nodes B: ${resPart2.telemetryB.nodesSearched}`);

  console.log('\nPerforming Equality Asserts...');

  const statsMatch = 
    res1.stats.wins === resPart2.stats.wins &&
    res1.stats.losses === resPart2.stats.losses &&
    res1.stats.draws === resPart2.stats.draws;

  const telemetryMatch =
    res1.telemetryA.nodesSearched === resPart2.telemetryA.nodesSearched &&
    res1.telemetryB.nodesSearched === resPart2.telemetryB.nodesSearched;

  const pgnMatch = res1.pgnContent === resPart2.pgnContent;

  if (statsMatch && telemetryMatch && pgnMatch) {
    console.log('\n==================================================');
    console.log('   ✔ PASS: Determinism & Resumption Verified!     ');
    console.log('   Stats match exactly.                           ');
    console.log('   Telemetry counts match exactly.                ');
    console.log('   PGN contents match exactly.                    ');
    console.log('==================================================\n');
    process.exit(0);
  } else {
    console.error('\n==================================================');
    console.error('   ✘ FAIL: Determinism or Resumption Drifts!      ');
    console.error(`- Stats Match: ${statsMatch}`);
    console.error(`- Telemetry Match: ${telemetryMatch}`);
    console.error(`- PGN Match: ${pgnMatch}`);
    console.error('==================================================\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Failure in test execution:', err);
  process.exit(1);
});
