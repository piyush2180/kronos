import fs from 'fs';
import path from 'path';
import { TournamentRunner } from '../pipeline/tournament.js';
import { EngineFactory } from '../engines/engineFactory.js';
import { Chess } from 'chess.js';

const OUTPUT_DIR = path.resolve('benchmark/output/publication/diminishing_returns');
const PGN_PATH = path.join(OUTPUT_DIR, 'analysis_games.pgn');

async function main() {
  console.log('==================================================');
  console.log('       D5 vs D4 Victory Game-Level Analysis       ');
  console.log('==================================================\n');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const seeds = [42, 1337, 2026, 9001, 777]; // 5 seeds * 2 (color swapped) = 10 games
  const gamesCount = 10;

  const origCreate = EngineFactory.createEngine;
  EngineFactory.createEngine = (spec) => {
    const raw = origCreate('benchmark/configs/full_kronos.json');
    return {
      name: spec === 'treatment' ? 'Full Kronos D5' : 'Full Kronos D4',
      init: () => raw.init ? raw.init() : Promise.resolve(),
      clearState: () => raw.clearState ? raw.clearState() : Promise.resolve(),
      go: ({ fen, timeMs }) => raw.go({ depth: spec === 'treatment' ? 5 : 4, fen, timeMs }),
      quit: () => raw.quit ? raw.quit() : null
    };
  };

  const runner = new TournamentRunner({
    configA: 'treatment',
    configB: 'control',
    games: gamesCount,
    depth: 3, // overridden
    seeds
  });

  console.log('Running 10 games of D5 vs D4...');
  const res = await runner.run();

  // Restore original factory
  EngineFactory.createEngine = origCreate;

  // Save the PGNs
  fs.writeFileSync(PGN_PATH, res.pgnContent);
  console.log(`Saved tournament PGN to: ${PGN_PATH}`);

  const wonGames = res.games.filter(g => g.winner === 'Full Kronos D5');
  console.log(`\nFound ${wonGames.length} wins for Full Kronos D5 out of ${res.games.length} games.`);

  wonGames.forEach((g, idx) => {
    console.log(`\n==================================================`);
    console.log(`Win Game ${idx + 1}: Game #${g.game} (${g.opening})`);
    console.log(`White: ${g.white} | Black: ${g.black} | Result: ${g.result}`);
    console.log(`Moves: ${g.moveCount} | NPS: ${g.nodesPerSecond}`);
    console.log(`==================================================\n`);

    // Parse the game moves and analyze FENs to see when evaluate swings
    const chess = new Chess();
    const moves = g.pgn.split('\n\n')[1].split(/\d+\.\s+/).filter(x => x.trim()).flatMap(x => x.trim().split(' ')).filter(x => x && !x.includes('*') && !x.includes('1-0') && !x.includes('0-1') && !x.includes('1/2-1/2'));

    // Print moves for manual review
    console.log('Move List:');
    console.log(moves.join(' '));
  });
}

main().catch(err => {
  console.error('Analysis failed:', err);
  process.exit(1);
});
