# Kronos Chess Engine Research Paper Workspace

This directory contains the publication-quality LaTeX workspace for the Kronos Chess Engine research paper, using the IEEE Conference template (`IEEEtran.cls`).

## Project Structure

```text
research-paper/
├── main.tex                    # Main driver file containing preamble & package loading
├── references.bib              # Verified BibTeX bibliographical entries
├── ieee_template/              # Directory housing the document class
│   └── IEEEtran.cls            # IEEE LaTeX Class template file
├── sections/                   # Modular paper section files
│   ├── abstract.tex            # Abstract summary
│   ├── introduction.tex        # Introduction section
│   ├── related_work.tex        # Related Work and literature review
│   ├── system_architecture.tex  # Threading, Web Workers, and system topology
│   ├── engine_design.tex       # Board representations and transposition table design
│   ├── search_algorithms.tex   # Search algorithm structures (Minimax, PVS, LMR, etc.)
│   ├── benchmark_framework.tex  # Automatic testing suite and parallel scheduling
│   ├── experiments.tex         # Evaluation configurations and metrics formulas
│   ├── results.tex             # Final compiled tables and charts
│   ├── discussion.tex          # Performance trade-offs, JVM/V8, and analysis
│   ├── threats_to_validity.tex  # Internal/external limitations
│   ├── future_work.tex         # Project expansions (WebAssembly, NNUE)
│   ├── conclusion.tex          # Wrap-up of research findings
│   └── appendix.tex            # Audit tools, FEN tables, and scripts specs
├── figures/                    # Individual LaTeX TikZ and PGFPlots diagram definitions
├── tables/                     # Externalized LaTeX table structures using booktabs
├── algorithms/                 # Pseudo-code procedures utilizing algorithm2e
└── equations/                  # Mathematical equations and models
```

---

## Compilation Instructions

To build a PDF from the LaTeX files on your local machine, ensure you have a standard TeX distribution installed (e.g., **TeX Live**, **MiKTeX**, or **MacTeX**).

Run the following standard sequence of commands in your terminal from the `research-paper/` directory:

```bash
# 1. Compile document structure
pdflatex main.tex

# 2. Compile bibliography citations
bibtex main

# 3. Resolve cross-references and citation listings
pdflatex main.tex
pdflatex main.tex
```

This generates `main.pdf`.

> [!TIP]
> Alternatively, you can upload the entire `research-paper/` directory to **Overleaf** as a new project, and it will compile automatically out-of-the-box using their online editor.

---

## Bibliography Workflow

1. All bibliographical references reside inside [references.bib](references.bib).
2. Use verified, canonical BibTeX items only. Do not fabricate citations.
3. Cite references in your sections using the standard standard cite command:
   ```latex
   \cite{knuth1975analysis}
   ```

---

## Adding Figures

All diagrams are structured using **TikZ** or **PGFPlots** in the [figures/](figures/) directory:
- Skeletons are provided for both architectural flowcharts (using TikZ libraries) and data graphs (using PGFPlots).
- To adjust data points in a graph (e.g., strength or node growth), modify the coordinates block inside the respective `figures/` file:
  ```latex
  coordinates {
      (1, 1000)
      (2, 1250)
      (3, 1550)
  }
  ```
- Figures are included in sections using `\input{figures/filename}` inside the text.

---

## Adding Tables

Tables are externalized under the [tables/](tables/) directory to prevent cluttering the text blocks:
- They use the professional standard `booktabs` package rules: `\toprule`, `\midrule`, and `\bottomrule`.
- To input a table in a section:
  ```latex
  \input{tables/engine_feature_matrix}
  ```
- Replace `\todo{Val}` blocks with actual values once the experiment runs are completed.

---

## Adding Algorithms

Algorithms use the **`algorithm2e`** package, configured with the `algo2e` option to avoid namespace clashes:
- Place procedural pseudocode definitions under [algorithms/](algorithms/).
- Load algorithms using `\input{algorithms/filename}` inside the relevant sections.
- Example structure:
  ```latex
  \begin{algorithm2e}[H]
  \caption{Algorithm Title}
  \DontPrintSemicolon
  ...
  \end{algorithm2e}
  ```

---

## Generating Equations

Mathematical definitions reside in the [equations/](equations/) directory:
- Keep equations isolated to simplify debugging mathematical notation errors.
- Include them in sections using:
  ```latex
  \input{equations/elo_computation}
  ```
