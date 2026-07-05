import React, { useState } from 'react';
import { Layers, Terminal, Code, FileCode, Folder, Play, Cpu, Copy, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ArchitectureViewer() {
  const [activeTab, setActiveTab] = useState('engine'); // engine, framework
  const [selectedEngineBlock, setSelectedEngineBlock] = useState('search');
  const [selectedFrameBlock, setSelectedFrameBlock] = useState('configs');
  const [copiedText, setCopiedText] = useState('');

  const handleCopy = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedText(cmd);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const engineBlocks = {
    ui: {
      name: 'React Application UI',
      sub: 'src/pages/PlayPage.jsx',
      simpleNote: 'The visual screens of Kronos. It draws the chessboard, listens to user move inputs, and updates status HUDs.',
      desc: 'Renders chessboard views, user control sidebars, and live evaluation telemetry graphs.',
      role: 'Captures player inputs, coordinates client settings, and interfaces with useChessGame manager hooks.'
    },
    controller: {
      name: 'Game Controller Hook',
      sub: 'src/hooks/useChessGame.js',
      simpleNote: 'The match manager. Tracks whose turn it is, counts clocks, stores move lists, and passes search jobs to Web Workers.',
      desc: 'Orchestrates active game state, time limits, moves history array, and background engine thread queries.',
      role: 'Handles local storage persistence, parses move validations, and handles async Web Worker postMessage loops.'
    },
    worker: {
      name: 'Engine Web Worker Thread',
      sub: 'public/stockfishWorker.js',
      simpleNote: 'Runs calculation loops in a separate background thread so the web page never freezes during AI move searches.',
      desc: 'Launches Stockfish web assembly or Kronos native search tasks off the browser main UI thread.',
      role: 'Manages sandboxed worker runtime execution, listens to postMessage triggers, and dispatches bestmove findings.'
    },
    search: {
      name: 'Search Engine Core',
      sub: 'src/engine/minimax.js',
      simpleNote: 'The brain of Kronos. Explores millions of future move possibilities using Alpha-Beta pruning to find the best response.',
      desc: 'Navigates game tree matrices using iterative deepening and Alpha-Beta minimax formulas.',
      role: 'Runs recursive tree evaluations, transposition table checks, killer move ordering, and quiescence capture extensions.'
    },
    eval: {
      name: 'Evaluation Function',
      sub: 'src/engine/evaluation.js',
      simpleNote: 'Scores any board position in points. Adds up material balances plus positional coordinate bonuses.',
      desc: 'Calculates static numerical scores in centipawn units from the viewpoint of the side to move.',
      role: 'Evaluates material weight balances combined with dynamic Piece-Square Tables (PST) for midgame and endgame phases.'
    },
    movegen: {
      name: 'Move Generator & Ordering',
      sub: 'src/engine/moveOrdering.js',
      simpleNote: 'Generates all legal options and sorts captures first to help the search engine prune bad moves faster.',
      desc: 'Computes legal move arrays and sorts options prior to minimax exploration.',
      role: 'Prioritizes high-value captures (via MVV-LVA scoring) and killer moves to trigger early alpha-beta branch cutoffs.'
    }
  };

  const frameworkBlocks = {
    configs: {
      name: 'Engine Feature Configurations',
      dir: 'benchmark/configs/',
      files: ['baseline.json', 'alphabeta.json', 'move_ordering.json', 'killer_moves.json', 'transposition_table.json', 'quiescence.json', 'full_kronos.json'],
      desc: 'JSON configurations setting search parameters dynamically during tournaments (e.g., toggling transposition tables or killer move heuristics).',
      command: 'node benchmark/scripts/runner.js tournament --depth 3 --games 20'
    },
    engines: {
      name: 'Search Engine Adapters & Telemetry',
      dir: 'benchmark/engines/',
      files: ['configurableEngine.js', 'engineFactory.js', 'prng.js', 'sprt.js', 'stats.js', 'telemetry.js', 'uciAdapter.js'],
      desc: 'Local engine simulators, mulberry32 seeded PRNGs for deterministic tournaments, Wald\'s Sequential Probability Ratio Testing (SPRT), and statistics wrappers.',
      command: 'npm run benchmark:calibrate'
    },
    pipeline: {
      name: 'Tournament Match Orchestration',
      dir: 'benchmark/pipeline/',
      files: ['pipelineManager.js', 'researchRunner.js', 'tournament.js'],
      desc: 'Schedules head-to-head validation matches between different engine configurations, switching colors between rounds to neutralize coloring bias.',
      command: 'npm run benchmark -- --games 40 --depth 3'
    },
    positions: {
      name: 'Search Quality Position Suites',
      dir: 'benchmark/positions/',
      files: ['positionBenchmark.js', 'positions.json'],
      desc: 'A test suite of 100 tactical positions in EPD format used to benchmark search time and solution correctness at target depths.',
      command: 'npm run benchmark:positions -- --depth 3'
    },
    reports: {
      name: 'Report Exporters & Rating Estimations',
      dir: 'benchmark/reports/',
      files: ['exportOrdo.js', 'graphGenerator.js', 'integrityValidator.js', 'reportGenerator.js'],
      desc: 'Exports test summaries (Markdown, JSON, CSV), validates PGN structures, and formats rating metrics.',
      command: 'node benchmark/scripts/runner.js tournament --depth 3'
    }
  };

  const currEngine = engineBlocks[selectedEngineBlock];
  const currFrame = frameworkBlocks[selectedFrameBlock];

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Kronos Technical Architecture & System Internals</h2>
        <p style={styles.sub}>Interactive system map detailing engine search subsystems and backend tournament runner scripts.</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabRow}>
        <button
          onClick={() => setActiveTab('engine')}
          style={activeTab === 'engine' ? styles.tabActive : styles.tab}
        >
          <Cpu size={14} />
          <span>Search Engine Internals</span>
        </button>
        <button
          onClick={() => setActiveTab('framework')}
          style={activeTab === 'framework' ? styles.tabActive : styles.tab}
        >
          <Terminal size={14} />
          <span>Benchmark Framework Structure</span>
        </button>
      </div>

      {/* Viewport Content */}
      <div style={styles.body}>
        {activeTab === 'engine' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Interactive Flow Diagram */}
            <div style={styles.flowCard}>
              <span style={styles.sectionBadge}>subsystem execution pipeline</span>
              <div style={styles.flowRow}>
                {Object.entries(engineBlocks).map(([key, item], idx) => (
                  <React.Fragment key={key}>
                    <button
                      onClick={() => setSelectedEngineBlock(key)}
                      style={selectedEngineBlock === key ? styles.flowBtnActive : styles.flowBtn}
                    >
                      <span style={{ fontWeight: 700 }}>{item.name}</span>
                      <span style={styles.flowBtnSub}>{item.sub.split('/').pop()}</span>
                    </button>
                    {idx < Object.keys(engineBlocks).length - 1 && (
                      <ChevronRight size={14} color="var(--color-text-dim)" style={{ flexShrink: 0 }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Inspector Card */}
            <div style={styles.inspectCard}>
              <div style={styles.inspectHeader}>
                <div>
                  <span style={styles.inspectBadge}>Subsystem Inspector</span>
                  <h3 style={styles.inspectTitle}>{currEngine.name}</h3>
                </div>
                <div style={styles.fileBox}>
                  <FileCode size={13} color="var(--color-brand-primary)" />
                  <code>{currEngine.sub}</code>
                </div>
              </div>

              <div style={styles.explanationBox}>
                <span style={styles.explanationTitle}>In Simple Terms</span>
                <p style={styles.explanationText}>{currEngine.simpleNote}</p>
              </div>

              <div style={styles.descField}>
                <span style={styles.fieldLabel}>Functional Description</span>
                <p style={styles.fieldText}>{currEngine.desc}</p>
              </div>

              <div style={styles.responsibilityBox}>
                <span style={styles.respLabel}>Core System Responsibility</span>
                <p style={styles.respText}>{currEngine.role}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'framework' && (
          <div style={styles.splitLayout}>
            {/* Left: Directory Tree Navigation */}
            <div style={styles.treeCard}>
              <span style={styles.sectionBadge}>Benchmark directory layout</span>
              <div style={styles.treeList}>
                {Object.entries(frameworkBlocks).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedFrameBlock(key)}
                    style={selectedFrameBlock === key ? styles.treeItemActive : styles.treeItem}
                  >
                    <Folder size={14} color={selectedFrameBlock === key ? 'var(--color-brand-primary)' : 'var(--color-text-dim)'} />
                    <span>{item.dir}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Component Detail Viewer */}
            <div style={styles.inspectCard}>
              <div style={styles.inspectHeader}>
                <div>
                  <span style={styles.inspectBadge}>Module Framework Description</span>
                  <h3 style={styles.inspectTitle}>{currFrame.name}</h3>
                </div>
                <div style={styles.fileBox}>
                  <Folder size={13} color="var(--color-brand-primary)" />
                  <code>{currFrame.dir}</code>
                </div>
              </div>

              <div style={styles.descField}>
                <span style={styles.fieldLabel}>Contained Files & Utilities</span>
                <div style={styles.filesGrid}>
                  {currFrame.files.map((file, i) => (
                    <div key={i} style={styles.fileItem}>
                      <FileCode size={12} color="#7a6a5f" />
                      <span>{file}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.descField}>
                <span style={styles.fieldLabel}>Module Role</span>
                <p style={styles.fieldText}>{currFrame.desc}</p>
              </div>

              {/* CLI Command Exporter */}
              <div style={styles.cliBox}>
                <div style={styles.cliHeader}>
                  <Terminal size={12} color="var(--color-brand-primary)" />
                  <span>Execute Rerun CLI Command</span>
                </div>
                <div style={styles.cliRow}>
                  <code style={styles.cliCode}>{currFrame.command}</code>
                  <button style={styles.copyBtn} onClick={() => handleCopy(currFrame.command)}>
                    {copiedText === currFrame.command ? <CheckCircle2 size={13} color="#34d399" /> : <Copy size={13} />}
                    <span>{copiedText === currFrame.command ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  header: {
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--color-text-primary, #fffff0)',
    margin: 0,
  },
  sub: {
    fontSize: '0.825rem',
    color: 'var(--color-text-secondary, #bdaea4)',
    margin: '0.2rem 0 0 0',
  },
  tabRow: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)',
    paddingBottom: '2px',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--color-text-dim)',
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    borderRadius: '4px 4px 0 0',
    transition: 'all 0.15s ease',
  },
  tabActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--color-brand-primary)',
    borderBottom: '2px solid var(--color-brand-primary)',
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    borderRadius: '4px 4px 0 0',
  },
  body: {
    marginTop: '0.5rem',
  },
  flowCard: {
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  sectionBadge: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  flowRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  flowBtn: {
    flex: 1,
    minWidth: '140px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '6px',
    padding: '0.55rem 0.75rem',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    gap: '0.15rem',
  },
  flowBtnActive: {
    flex: 1,
    minWidth: '140px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    border: '1px solid var(--color-brand-primary)',
    borderRadius: '6px',
    padding: '0.55rem 0.75rem',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    textAlign: 'left',
    gap: '0.15rem',
  },
  flowBtnSub: {
    fontSize: '0.65rem',
    color: 'var(--color-text-dim)',
    fontFamily: 'monospace',
  },
  inspectCard: {
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '8px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    flex: 1,
  },
  inspectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)',
    paddingBottom: '0.85rem',
  },
  inspectBadge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#34d399',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  inspectTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: 'var(--color-text-primary, #fffff0)',
    margin: '0.2rem 0 0 0',
  },
  fileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'var(--color-bg-base, #15100c)',
    padding: '0.4rem 0.65rem',
    borderRadius: '4px',
    fontSize: '0.72rem',
    color: 'var(--color-brand-primary)',
    border: '1px solid var(--color-border-subtle, #34281e)',
  },
  explanationBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    border: '1px solid rgba(212, 175, 55, 0.15)',
    padding: '0.85rem 1.25rem',
    borderRadius: '6px',
  },
  explanationTitle: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: 'var(--color-brand-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  explanationText: {
    fontSize: '0.825rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.45,
    margin: '0.25rem 0 0 0',
  },
  descField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  fieldLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--color-text-dim)',
  },
  fieldText: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.45,
    margin: 0,
  },
  responsibilityBox: {
    backgroundColor: 'var(--color-bg-base, #15100c)',
    padding: '0.85rem 1.25rem',
    borderRadius: '6px',
    border: '1px solid var(--color-border-subtle, #34281e)',
  },
  respLabel: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  respText: {
    fontSize: '0.825rem',
    color: 'var(--color-text-primary)',
    lineHeight: 1.45,
    margin: '0.25rem 0 0 0',
  },
  splitLayout: {
    display: 'flex',
    gap: '1.25rem',
    flexWrap: 'wrap',
  },
  treeCard: {
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '8px',
    padding: '1.25rem',
    width: '260px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flexShrink: 0,
  },
  treeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  treeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--color-text-secondary)',
    fontSize: '0.8rem',
    fontWeight: 500,
    padding: '0.5rem 0.65rem',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  treeItemActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    border: 'none',
    color: 'var(--color-brand-primary)',
    fontSize: '0.8rem',
    fontWeight: 700,
    padding: '0.5rem 0.65rem',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  filesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '0.5rem',
    backgroundColor: 'var(--color-bg-base, #15100c)',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--color-border-subtle, #34281e)',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
  },
  cliBox: {
    backgroundColor: '#0A0D14',
    border: '1px solid #2a2018',
    borderRadius: '6px',
    padding: '0.75rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  cliHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#7a6a5f',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  cliRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  cliCode: {
    fontFamily: 'monospace',
    fontSize: '0.78rem',
    color: '#34d399',
  },
  copyBtn: {
    backgroundColor: 'transparent',
    color: 'var(--color-brand-primary)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '4px',
    padding: '0.3rem 0.6rem',
    fontSize: '0.72rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  }
};
