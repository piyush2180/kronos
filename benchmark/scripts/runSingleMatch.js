import { TournamentRunner } from '../pipeline/tournament.js';
import path from 'path';

async function main() {
  // Simple manual argv parser
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const parts = arg.slice(2).split('=');
      const key = parts[0];
      const val = parts[1] || true;
      args[key] = val;
    }
  });
  
  const configA = args.configA || 'benchmark/configs/full_kronos_d6.json';
  const configB = args.configB || 'benchmark/configs/full_kronos_d5.json';
  const games = parseInt(args.games, 10) || 20;
  const depth = parseInt(args.depth, 10) || 4;
  const experimentId = args.experimentId || 'default';

  console.log(`[Single Match] Starting match: ${configA} vs ${configB} | Games: ${games} | Depth: ${depth} | ExpId: ${experimentId}`);

  const runner = new TournamentRunner({
    configA,
    configB,
    games,
    depth,
    experimentId,
    checkpoint: true,
    checkpointInterval: 5,
    minimumGamesBeforeCI: 10,
    confidenceThreshold: 20
  });

  try {
    await runner.run();
    console.log(`[Single Match] Match completed successfully: ${experimentId}`);
    process.exit(0);
  } catch (err) {
    console.error(`[Single Match] Match failed: ${experimentId}`, err);
    process.exit(1);
  }
}

main();
