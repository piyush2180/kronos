# Kronos Benchmarking & Calibration Framework

A Node.js-based benchmarking, tournament runner, and calibration framework for Kronos Chess. This framework runs independently from the browser UI to provide reproducible datasets, Sequential Probability Ratio Testing (SPRT), search telemetry, and report generation.

---

## Architecture Overview

```text
benchmark/
├── configs/                # JSON engine feature profiles (baseline, alphabeta, full_kronos, etc.)
├── engines/
│   ├── configurableEngine.js # Configurable search wrapper matching the production engine
│   ├── engineFactory.js    # Instantiation layer for Kronos variants and UCI engines
│   ├── prng.js             # Mulberry32 Seeded PRNG for reproducible tournaments
│   ├── sprt.js             # Wald's Sequential Probability Ratio Test engine
│   ├── stats.js            # Statistical calculations (Elo, variance, confidence intervals)
│   ├── telemetry.js        # Search metrics (NPS, branching factor, cutoffs)
│   └── uciAdapter.js       # UCI process adapter for external engines (Stockfish, etc.)
├── openings/               # Standard openings for tournament paired suites
├── output/                 # Destination for generated benchmark reports and PGNs
├── pipeline/
│   ├── pipelineManager.js  # Runs full validation tournaments and orchestrates experiments
│   ├── researchRunner.js   # Single experiment validation runner
│   └── tournament.js       # Head-to-head match scheduling and color-swapping logic
├── positions/
│   ├── positionBenchmark.js # Search quality benchmark on test positions
│   └── positions.json      # EPD test suite of 100 tactical positions
├── reports/
│   ├── exportOrdo.js       # Rating calculator export helper
│   ├── graphGenerator.js   # SVG and CSV chart exporter
│   ├── integrityValidator. # PGN structure and legal move validator
│   └── reportGenerator.js  # Markdown, CSV, and JSON report generator
└── scripts/
    └── runner.js           # CLI main entry point
```

---

## Quick Start Commands

Run benchmarks via `npm` or `node`:

### Run a Tournament
```bash
npm run benchmark -- --games 20 --depth 3 --seed 42
```

### Run Tournament with SPRT (Sequential Testing)
```bash
node benchmark/scripts/runner.js tournament --sprt --depth 3 --seed 42
```

### Run Search Quality Position Benchmark
```bash
npm run benchmark:positions -- --depth 3
```

### Run Stockfish Calibration
```bash
npm run benchmark:calibrate
```

---

## Engine Configurations

Search optimizations can be configured in `benchmark/configs/*.json`:

- `baseline.json`: Negamax without pruning or sorting.
- `alphabeta.json`: Negamax + Alpha-Beta pruning.
- `move_ordering.json`: Alpha-Beta + MVV-LVA move sorting.
- `killer_moves.json`: Alpha-Beta + Move Ordering + Killer Moves.
- `transposition_table.json`: Alpha-Beta + Move Ordering + Killer Moves + Transposition Table.
- `quiescence.json`: Alpha-Beta + Move Ordering + TT + Quiescence Search.
- `full_kronos.json`: All optimizations active.

---

## Stockfish Calibration

To measure the playing strength of Kronos difficulty levels, Kronos is benchmarked at fixed search depths against Stockfish.

Estimated ratings:
- **Beginner**: ~800 Elo
- **Casual**: ~1100 Elo
- **Club**: ~1500 Elo
- **Advanced**: ~1800 Elo
- **Expert**: ~2100 Elo

---

## Research Telemetry Metrics

Generated Markdown reports (`report.md`) include search statistics:

- **Branching Factor ($b = N^{1/d}$)**: Tree growth rate per depth ply.
- **Move Ordering Efficiency (%)**: Percentage of beta-cutoffs occurring on the first move.
- **Quiescence Nodes (%)**: Percentage of search nodes spent resolving tactical exchanges.
- **Transposition Hits**: Table lookups avoiding redundant search branches.
- **Nodes Per Second (NPS)**: Search throughput.
