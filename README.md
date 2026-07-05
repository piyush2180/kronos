# Kronos Chess Engine

**Live Site:** [kronos-mocha.vercel.app](https://kronos-mocha.vercel.app)

[![JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](#)
[![Vite](https://img.shields.io/badge/Build-Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](#)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js_18+-339933?style=flat-square&logo=node.js&logoColor=white)](#)
[![Web Workers](https://img.shields.io/badge/Concurrency-Web_Workers-0052CC?style=flat-square)](#)

A JavaScript chess engine with an interactive React UI and a headless Node.js benchmarking framework for evaluating classical alpha-beta search techniques in managed, garbage-collected runtimes.

---

## What is Kronos?

Kronos is a chess engine and research platform that explores how game-tree search algorithms perform inside V8's garbage-collected environment. The engine implements the standard classical search stack (negamax, alpha-beta, PVS, LMR, quiescence search, transposition tables) while applying GC-aware techniques — object pooling, in-place board mutations, and bounded hash tables — to keep searches free of GC pauses.

The project has three parts:

1. **React UI** — a browser-based workstation (live at [kronos-mocha.vercel.app](https://kronos-mocha.vercel.app)) for playing against the engine, analyzing positions, solving puzzles, and exploring openings.
2. **Search Engine** — runs in a Web Worker to keep the UI responsive during deep searches.
3. **Benchmark Framework** — a headless Node.js runner for automated tournaments, ablation studies, and Stockfish calibration.

The codebase also includes a Learn section with interactive algorithm visualizations and a research paper workspace in LaTeX.

---

## Features

### Chess Engine
* **Search**: Negamax with alpha-beta pruning, Principal Variation Search (PVS), and iterative deepening.
* **Pruning**: Late Move Reductions (LMR), Null Move Pruning (NMP), and quiescence search to resolve the horizon effect.
* **Move Ordering**: MVV-LVA capture scoring, history heuristic, and killer move slots.
* **Hash Table**: Size-bounded transposition table indexed by 64-bit Zobrist keys with incremental hashing.

### Benchmark Framework
* **Tournament Runner**: Automated head-to-head matches with paired openings and color-swapped seeds.
* **SPRT Testing**: Sequential Probability Ratio Testing for accepting or rejecting optimization hypotheses.
* **Stockfish Calibration**: Maps Kronos playing strength against depth-limited Stockfish profiles.
* **Telemetry**: Node throughput, NPS, branching factor, and memory profiling.

### User Interface
* **Play**: Multiple engine difficulty levels (Depth 2–7) with selectable time controls.
* **Analysis**: Board analysis with evaluation bar and opening explorer.
* **Puzzles**: Tactical puzzles sourced from the Lichess database with move validation.
* **Learn**: Interactive walkthroughs from basic chess concepts to search algorithm internals.
* **Research Lab**: Run matches, compare experiments, inspect datasets, and calibrate ratings.

---

## Architecture

The engine runs in a dedicated Web Worker, keeping search calculations off the main thread:

```
┌─────────────────────────────────────────────────────────────┐
│                       REACT VIEW LAYER                      │
│   • Renders chessboard, evaluation bar, opening explorer    │
│   • Receives user events, dispatches moves to hook          │
└──────────────┬──────────────────────────────▲───────────────┘
               │                              │
               │ PostMessage (Move / FEN)     │ Telemetry (Nodes / PV / Depth)
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│                    WEB WORKER SEARCH ENGINE                 │
│   • Runs negamax search off the main thread                 │
│   • Manages search time limits & depth iterations           │
├─────────────────────────────────────────────────────────────┤
│   ┌─────────────────────────────────────────────────────┐   │
│   │                 NEGAMAX SEARCH CORE                 │   │
│   │   • Alpha-beta with PVS, LMR, and NMP              │   │
│   │   • MVV-LVA move ordering with killer moves         │   │
│   └──────────┬──────────────────────────────▲───────────┘   │
│              │ Zobrist Key                  │ Cache Hit      │
│              ▼                              │                │
│   ┌─────────────────────────────────────────┴───────────┐   │
│   │             TRANSPOSITION TABLE                     │   │
│   │   • Bounded Map with 64-bit Zobrist keys            │   │
│   │   • O(1) lookups to avoid re-searching positions    │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Repository Structure

* **`src/`** — React client, state hooks, theme tokens, and the Web Worker engine.
* **`benchmark/`** — Headless Node.js benchmarking framework, tournament runner, and experiment scripts.
* **`research-paper/`** — LaTeX source for the Kronos research paper (IEEE template).
* **`scripts/`** — Puzzle dataset scripts and validation utilities.
* **`public/`** — Static assets (favicon, icons, puzzle database).

---

## Tech Stack

* **Frontend**: React 19, Lucide React, Vanilla CSS
* **Build**: Vite 8, Rolldown, Oxlint
* **Chess Logic**: chess.js (move generation & validation), react-chessboard (board rendering)
* **Concurrency**: Web Workers (background search)
* **Benchmarking**: Node.js (headless runner), Stockfish.js (calibration)

---

## Research Highlights

* **GC-neutral search**: In-place board mutations, pre-allocated transposition caches, and avoiding object allocations inside the recursive search path eliminate GC pauses during deep searches.
* **Reproducible benchmarks**: Every run logs hardware specs, configuration checksums, and PRNG seeds to guarantee reproducibility.
* **Ablation studies**: Each search feature is isolated by running tournaments against sibling configs with individual features disabled.

### Key Results

* **Heap stabilization**: Size-bounded transposition tables keep heap usage flat, preventing V8 GC sweeps during deep search.
* **Quiescence search validation**: Under SPRT testing, quiescence search showed a +202 Elo gain (95% CI: [118, 316]), confirming its role in resolving the horizon effect.
* **LMR contribution**: Ablation runs showed LMR provides the largest search space reduction — up to 80% fewer nodes with minimal tactical loss.

---

## Screenshots

<div align="center">
  <h3>Dashboard</h3>
  <img src="src/assets/screenshots/dashboard.png" width="800" alt="Dashboard" />
  <br /><br />
  <h3>Play vs Engine</h3>
  <img src="src/assets/screenshots/play.png" width="800" alt="Play vs Engine" />
  <br /><br />
  <h3>Analysis Board</h3>
  <img src="src/assets/screenshots/analysis.png" width="800" alt="Analysis Board" />
  <br /><br />
  <h3>Research Lab</h3>
  <img src="src/assets/screenshots/research.png" width="800" alt="Research Lab" />
  <br /><br />
  <h3>Engine Calibration</h3>
  <img src="src/assets/screenshots/calibration.png" width="800" alt="Engine Calibration" />
  <br /><br />
  <h3>Learn</h3>
  <img src="src/assets/screenshots/learn.png" width="800" alt="Learn" />
  <br /><br />
  <h3>Puzzle Trainer</h3>
  <img src="src/assets/screenshots/puzzles.png" width="800" alt="Puzzle Trainer" />
</div>

---

## Quick Start

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:5173/)
npm run dev

# Production build
npm run build

# Run automated benchmark suite
npm run benchmark:suite

# Run full research pipeline (tournaments, calibration, validation)
npm run research
```

---

## Documentation

* **Research Paper**: LaTeX source in [`research-paper/`](research-paper/)
* **Experiment Results**: [`MASTER_RESULTS.md`](MASTER_RESULTS.md)
* **Memory Profiling**: [`MEMORY_PROFILE.md`](MEMORY_PROFILE.md)
* **Ablation Study**: [`ENGINE_FEATURE_MATRIX.md`](ENGINE_FEATURE_MATRIX.md)
* **Benchmark Framework**: [`benchmark/docs/README.md`](benchmark/docs/README.md)

---

## Future Work

* **NNUE Evaluation**: Replace piece-square tables with an efficiently updatable neural network.
* **WebAssembly Core**: Port the search loop and evaluation to Wasm for higher NPS.
* **Syzygy Tablebases**: Integrate 5-piece endgame tablebase lookups.
* **Lazy SMP**: Parallelize search across multiple threads sharing a lock-free transposition table.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. In short: optimization patches should include tournament validation data (minimum 200 games against the baseline) to verify Elo impact.

