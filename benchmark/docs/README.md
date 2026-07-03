# Kronos Chess Standalone Benchmarking & Calibration Framework

A research-grade, Node.js-based benchmarking, tournament runner, and calibration framework for Kronos Chess. This framework is completely independent from the browser UI and provides reproducible datasets, SPRT testing, research telemetry, automatic SVG/CSV graph generation, and publication-ready Markdown reports.

---

## Architecture Overview

```
benchmark/
├── runner.js               # CLI runner and main entry point
├── prng.js                 # Mulberry32 Seeded PRNG for reproducible runs
├── engineFactory.js        # Factory layer for Kronos variants & UCI engines
├── configurableEngine.js    # Instrumented Kronos search engine with togglable features
├── uciAdapter.js           # Generic UCI process adapter for Stockfish, Berserk, Ethereal, etc.
├── stockfishAdapter.js    # Specialized Stockfish calibration wrapper
├── tournament.js           # Tournament manager (games, color alternation, opening book)
├── sprt.js                 # Wald's Sequential Probability Ratio Test engine
├── positionBenchmark.js    # Standalone tactical/positional search quality benchmark
├── telemetry.js            # Metric logger (branching factor, cutoffs, TT occupancy, RAM)
├── stats.js                # Statistical engine (Win/Loss/Draw, Elo diffs, 95% CIs)
├── graphGenerator.js       # SVG and CSV chart generator
├── reportGenerator.js      # Generates summary.csv, summary.json, games.pgn, report.md
├── exportOrdo.js           # Ordo PGN helper export scripts
├── configs/                # JSON profiles for engine search optimization toggles
├── openings/               # Standard openings and tactical benchmark positions
└── output/                 # Destination for generated benchmark batches and reports
```

---

## 1. Quick Start Commands

Run benchmarks via `npm` or `node`:

### Run a Tournament
```bash
npm run benchmark -- --games 20 --depth 3 --seed 42
```

### Run Tournament with SPRT (Sequential Testing)
```bash
node benchmark/runner.js tournament --sprt --depth 3 --seed 42
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

## 2. Engine Search Optimization Configurations

Search optimizations can be independently configured in `benchmark/configs/*.json` files:

- `baseline.json`: Naive minimax without pruning.
- `alphabeta.json`: Minimax + Alpha-Beta pruning.
- `move_ordering.json`: Alpha-Beta + MVV-LVA move sorting.
- `killer_moves.json`: Alpha-Beta + Move Ordering + Killer Moves.
- `transposition_table.json`: Alpha-Beta + Move Ordering + Killer Moves + Transposition Table.
- `quiescence.json`: Alpha-Beta + Move Ordering + TT + Quiescence Search horizon extensions.
- `full_kronos.json`: All optimizations active.

---

## 3. Stockfish Calibration & Difficulty Ratings

To measure the playing strength of Kronos difficulty levels against Stockfish, Kronos is benchmarked at fixed search depths against Stockfish.

Estimated rating labels derived from fixed-depth calibration:
- **Beginner:** ~800 estimated Elo
- **Casual:** ~1100 estimated Elo
- **Club:** ~1500 estimated Elo
- **Advanced:** ~1800 estimated Elo
- **Expert:** ~2100 estimated Elo

---

## 4. Ordo Rating Integration

Ordo is an external rating tool for measuring precise engine ratings from PGN datasets.

After each tournament, the framework outputs Ordo execution helper scripts in `benchmark/output/run_<timestamp>/run_ordo.sh` and `run_ordo.bat`.

To run Ordo externally:
```bash
ordo -p benchmark/output/run_<timestamp>/games.pgn -o ordo_ratings.txt
```

---

## 5. Interpreting Research Telemetry

Generated Markdown reports (`report.md`) include deep empirical search statistics:

- **Nodes Per Second (NPS):** Throughput of the search algorithm.
- **Branching Factor ($b = N^{1/d}$):** Effective tree growth rate per depth ply.
- **Move Ordering Efficiency (%):** Percentage of beta-cutoffs occurring on the very first evaluated move.
- **Quiescence Percentage (%):** Proportion of search nodes spent resolving tactical captures at the search horizon.
- **Transposition Hits:** Coded hash lookups avoiding redundant subtree evaluations.
