# Contributing to Kronos Chess

Thank you for your interest in contributing to Kronos Chess! As a research-oriented and performance-focused chess engine workstation, we hold changes to a rigorous standard.

## Code of Conduct

Please maintain a professional and respectful environment. Ensure your communication remains clear, constructive, and evidence-based.

## How to Contribute

1. **Bug Reports**: If you find an issue, open an issue with detailed reproduction steps, Node.js or browser version, OS, and any relevant logs/PGNs.
2. **Feature Requests**: We welcome ideas to improve search efficiency, memory usage, or UI capabilities. Open an issue first to discuss your idea.
3. **Pull Requests**:
   - Create a feature branch from `main`.
   - Ensure all changes match the existing code style.
   - Run linter checks (`npm run lint`) and verify your code builds (`npm run build`).

## Performance Verification Standard

Because Kronos is a performance-sensitive chess engine, any PR proposing search or evaluation optimizations **must** include empirical validation data:

* **Tournament Validation**: Run a minimum of 200 head-to-head games against the baseline using the benchmark suite:
  ```bash
  npm run benchmark -- --games 200 --depth 3 --seed 42
  ```
* **Ablation Data**: Verify the nodes searched and branching factor changes.
* **No Regression**: Show that the proposed change does not introduce tactical regressions or memory leaks.

Please document these results directly in your pull request description.
