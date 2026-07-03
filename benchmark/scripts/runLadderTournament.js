import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { TournamentRunner } from '../pipeline/tournament.js';

async function run() {
  console.log('==================================================');
  console.log('       Running Grand Ladder Tournament            ');
  console.log(' (Round-Robin: 7 Engines, 10 Games Each, Depth 3) ');
  console.log('==================================================\n');

  const configs = [
    { name: 'Baseline Minimax', path: 'benchmark/configs/baseline.json' },
    { name: 'Alpha-Beta Only', path: 'benchmark/configs/alphabeta.json' },
    { name: 'MVV-LVA Move Ordering', path: 'benchmark/configs/move_ordering.json' },
    { name: 'Killer Moves Heuristic', path: 'benchmark/configs/killer_moves.json' },
    { name: 'Transposition Table Caching', path: 'benchmark/configs/transposition_table.json' },
    { name: 'Iterative Deepening', path: 'benchmark/configs/ablation_no_quiescence.json' },
    { name: 'Full Kronos (with Quiescence)', path: 'benchmark/configs/full_kronos.json' }
  ];

  const outputDir = path.join('benchmark/output/publication', `ladder_${new Date().toISOString().replace(/[:.]/g, '')}`);
  fs.mkdirSync(outputDir, { recursive: true });

  const allGames = [];
  const ordoLines = [];
  const combinedPgn = [];

  let pairingIdx = 1;
  const totalPairings = (configs.length * (configs.length - 1)) / 2;

  for (let i = 0; i < configs.length; i++) {
    for (let j = i + 1; j < configs.length; j++) {
      const configA = configs[i];
      const configB = configs[j];

      console.log(`\n[Pairing ${pairingIdx}/${totalPairings}] ${configA.name} vs ${configB.name}`);
      const runner = new TournamentRunner({
        configA: configA.path,
        configB: configB.path,
        games: 10, // 5 seeds, 2 games per seed (color-flipped)
        depth: 3,
        seeds: [1, 2, 3, 4, 5],
        confidenceThreshold: 0 // Disable early stopping for round-robin games
      });

      const results = await runner.run();
      
      // Save games & PGNs
      for (const game of results.games) {
        allGames.push(game);
        
        // PGN format with custom tags
        const pgnText = `[Event "Grand Ladder Tournament"]
[Site "Localhost"]
[Date "${new Date().toISOString().split('T')[0]}"]
[Round "${pairingIdx}"]
[White "${game.white}"]
[Black "${game.black}"]
[Result "${game.result}"]
[TimeControl "Fixed Depth 3"]

${game.pgn.split('\n\n')[1] || ''}`;

        combinedPgn.push(pgnText);

        const wName = game.white;
        const bName = game.black;
        let resVal = '1/2-1/2';
        if (game.result === '1-0') resVal = '1-0';
        if (game.result === '0-1') resVal = '0-1';

        ordoLines.push(`${wName}\t${bName}\t${resVal}`);
      }

      pairingIdx++;
    }
  }

  // Save deliverables
  const pgnPath = path.join(outputDir, 'games.pgn');
  const ordoPath = path.join(outputDir, 'ordo_results.tsv');
  const summaryPath = path.join(outputDir, 'summary.json');

  fs.writeFileSync(pgnPath, combinedPgn.join('\n\n'));
  fs.writeFileSync(ordoPath, ordoLines.join('\n'));
  fs.writeFileSync(summaryPath, JSON.stringify({ gamesCount: allGames.length, games: allGames }, null, 2));

  console.log('\n==================================================');
  console.log('       Ladder Tournament Games Complete!          ');
  console.log(`Saved PGN: ${pgnPath}`);
  console.log(`Saved Ordo TSV: ${ordoPath}`);
  console.log('==================================================\n');

  // Try executing Ordo if installed
  let ordoOutput = '';
  let runOrdoCmd = `ordo -p "${ordoPath}" -a 0 --draw-elo 32.8 --draw-rate 0.5`;
  
  // Also write helper batch and shell files
  fs.writeFileSync(path.join(outputDir, 'run_ordo.sh'), `#!/bin/bash\nordo -p ordo_results.tsv -a 0 --draw-elo 32.8 --draw-rate 0.5\n`);
  fs.writeFileSync(path.join(outputDir, 'run_ordo.bat'), `@echo off\nordo -p ordo_results.tsv -a 0 --draw-elo 32.8 --draw-rate 0.5\n`);

  // Pure JavaScript Bradley-Terry Elo Solver
  console.log('Calculating Elo ratings using pure JavaScript Bradley-Terry Solver...');
  
  const players = new Set();
  const gameList = [];
  
  for (const line of ordoLines) {
    if (!line) continue;
    const parts = line.split('\t');
    if (parts.length < 3) continue;
    const [w, b, res] = parts;
    players.add(w);
    players.add(b);
    gameList.push({ w, b, res });
  }
  
  const playerList = Array.from(players);
  const ratings = {};
  const actualWins = {};
  const actualLosses = {};
  const actualDraws = {};
  const totalGames = {};
  
  for (const p of playerList) {
    ratings[p] = 0;
    actualWins[p] = 0;
    actualLosses[p] = 0;
    actualDraws[p] = 0;
    totalGames[p] = 0;
  }
  
  for (const game of gameList) {
    const { w, b, res } = game;
    totalGames[w]++;
    totalGames[b]++;
    
    if (res === '1-0') {
      actualWins[w]++;
      actualLosses[b]++;
    } else if (res === '0-1') {
      actualLosses[w]++;
      actualWins[b]++;
    } else {
      actualDraws[w]++;
      actualDraws[b]++;
    }
  }
  
  // Iterative Bradley-Terry MLE estimation
  for (let iter = 0; iter < 5000; iter++) {
    const expected = {};
    for (const p of playerList) {
      expected[p] = 0;
    }
    
    for (const game of gameList) {
      const { w, b } = game;
      const rW = ratings[w];
      const rB = ratings[b];
      
      const expW = 1 / (1 + Math.pow(10, (rB - rW) / 400));
      expected[w] += expW;
      expected[b] += (1 - expW);
    }
    
    let maxDiff = 0;
    for (const p of playerList) {
      const actualScore = actualWins[p] + 0.5 * actualDraws[p];
      const diff = actualScore - expected[p];
      // Learning rate step
      const step = 30 * (diff / totalGames[p]); 
      ratings[p] += step;
      if (Math.abs(step) > maxDiff) {
        maxDiff = Math.abs(step);
      }
    }
    
    // Anchor to Baseline Minimax = 0
    const anchor = ratings['Baseline Minimax'] || 0;
    for (const p of playerList) {
      ratings[p] -= anchor;
    }
    
    if (maxDiff < 1e-6) {
      break;
    }
  }
  
  // Sort and print
  const sorted = playerList.map(p => {
    const wins = actualWins[p];
    const losses = actualLosses[p];
    const draws = actualDraws[p];
    const gCount = totalGames[p];
    const scorePct = Math.round(((wins + 0.5 * draws) / gCount) * 100);
    const drawPct = Math.round((draws / gCount) * 100);
    
    // Approximate margin of error at 95% CI: 1.96 * 400 / (ln(10) * sqrt(I))
    const pVal = (wins + 0.5 * draws) / gCount;
    const ci = Math.round((1.96 * 400) / (Math.log(10) * Math.sqrt(gCount)));

    return {
      name: p,
      rating: Math.round(ratings[p]),
      ci: ci || 25,
      games: gCount,
      score: `${scorePct}%`,
      draws: `${drawPct}%`
    };
  }).sort((a, b) => b.rating - a.rating);
  
  let reportLines = [];
  reportLines.push('=====================================================================');
  reportLines.push('   #  Player                            Elo    +/-  games  score  draws');
  reportLines.push('=====================================================================');
  
  sorted.forEach((item, idx) => {
    const num = String(idx + 1).padStart(4, ' ');
    const name = item.name.padEnd(32, ' ');
    const elo = String(item.rating).padStart(6, ' ');
    const ci = String(item.ci).padStart(6, ' ');
    const gCount = String(item.games).padStart(6, ' ');
    const score = String(item.score).padStart(6, ' ');
    const draws = String(item.draws).padStart(6, ' ');
    
    reportLines.push(`${num}  ${name} ${elo} ${ci} ${gCount} ${score} ${draws}`);
  });
  reportLines.push('=====================================================================');
  
  const ratingOutput = reportLines.join('\n');
  console.log('>>> Consolidated Elo Ladder:');
  console.log(ratingOutput);
  
  fs.writeFileSync(path.join(outputDir, 'ordo_ratings.txt'), ratingOutput);
  
  try {
    execSync(runOrdoCmd, { encoding: 'utf8' });
  } catch (e) {
    console.log('\nNOTE: Ordo rating binary not found or failed to execute.');
    console.log('We have successfully computed the Bradley-Terry Elo ratings in JS above!');
    console.log('We also saved the helper script so you can execute it manually with the C++ Ordo tool:');
    console.log(`  Windows: cd ${outputDir} && run_ordo.bat`);
    console.log(`  Linux/macOS: cd ${outputDir} && chmod +x run_ordo.sh && ./run_ordo.sh`);
  }
}

run().catch(err => {
  console.error('Grand Ladder Tournament failed:', err);
  process.exit(1);
});
