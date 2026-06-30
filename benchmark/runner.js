import { TournamentRunner } from './tournament.js';
import { PositionBenchmarkRunner } from './positionBenchmark.js';
import { ReportGenerator } from './reportGenerator.js';
import { OrdoExporter } from './exportOrdo.js';
import path from 'path';

function parseArgs() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'tournament';
  const options = {
    mode,
    configA: 'benchmark/configs/full_kronos.json',
    configB: 'benchmark/configs/baseline.json',
    games: 10,
    depth: 3,
    seed: 42,
    sprt: false,
    pgn: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--configA' && args[i + 1]) options.configA = args[++i];
    if (args[i] === '--configB' && args[i + 1]) options.configB = args[++i];
    if (args[i] === '--games' && args[i + 1]) options.games = parseInt(args[++i], 10);
    if (args[i] === '--depth' && args[i + 1]) options.depth = parseInt(args[++i], 10);
    if (args[i] === '--seed' && args[i + 1]) options.seed = parseInt(args[++i], 10);
    if (args[i] === '--sprt') options.sprt = true;
    if (args[i] === '--pgn' && args[i + 1]) options.pgn = args[++i];
  }

  return options;
}

async function main() {
  const options = parseArgs();

  console.log(`==================================================`);
  console.log(`   Kronos Chess Research Benchmarking Suite      `);
  console.log(`==================================================\n`);

  if (options.mode === 'tournament') {
    const runner = new TournamentRunner(options);
    const results = await runner.run();
    const { outputDir, certification, checks } = ReportGenerator.generate(results, options);
    if (results.pgnContent) {
      OrdoExporter.export(path.join(outputDir, 'games.pgn'), outputDir);
    }

    console.log(`==================================================`);
    console.log(`              EXPERIMENT INTEGRITY                `);
    console.log(`==================================================`);
    console.log(`Configuration Isolation: ${checks?.configIsolation?.valid ? 'PASS' : 'FAIL'}`);
    console.log(`Opening Suite Validation: ${checks?.openingSuite?.valid ? 'PASS' : 'FAIL'}`);
    console.log(`PGN Validation:           ${checks?.pgn?.valid ? 'PASS' : 'FAIL'}`);
    console.log(`Telemetry Validation:     ${checks?.telemetry?.valid ? 'PASS' : 'FAIL'}`);
    console.log(`Statistical Validation:   ${checks?.statistics?.valid ? 'PASS' : 'FAIL'}\n`);
    console.log(`Overall Status: [ ${certification} ]`);
    console.log(`==================================================\n`);
  } else if (options.mode === 'position') {
    const runner = new PositionBenchmarkRunner(options);
    const results = await runner.run();
    console.log(`\nPosition Benchmark Summary:`);
    console.log(`${results.engineA}: ${results.solvedA}/${results.totalPositions} solved (${results.accuracyPctA}%)`);
    console.log(`${results.engineB}: ${results.solvedB}/${results.totalPositions} solved (${results.accuracyPctB}%)`);
  } else if (options.mode === 'calibrate') {
    console.log(`Running Stockfish Fixed-Depth Calibration (Depths 1..5)...`);
    for (let d = 1; d <= 5; d++) {
      console.log(`\n--- Calibrating Depth ${d} ---`);
      const runner = new TournamentRunner({
        ...options,
        configA: 'benchmark/configs/full_kronos.json',
        configB: 'stockfish',
        depth: d,
        games: 4
      });
      try {
        const results = await runner.run();
        ReportGenerator.generate(results, { ...options, configA: 'benchmark/configs/full_kronos.json', configB: 'stockfish', depth: d });
      } catch (err) {
        console.error(`Calibration at depth ${d} encountered engine process issue (e.g. Stockfish binary not on PATH): ${err.message}`);
        console.log(`Note: Install Stockfish on system PATH to enable full external calibration.`);
        break;
      }
    }
  } else if (options.mode === 'ordo' && options.pgn) {
    OrdoExporter.export(options.pgn);
  } else {
    console.log(`Unknown command mode or missing parameters. Modes: tournament, position, calibrate, ordo`);
  }
}

main().catch(err => {
  console.error('Fatal error during benchmark run:', err);
  process.exit(1);
});
