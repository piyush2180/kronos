// Kronos Chess V2 — Match Setup Page
// Full-screen pre-game configuration. The "Start Match" button is always visible at the bottom.

import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import ChessBoard from './ChessBoard';
import { DIFFICULTY_SETTINGS } from '../hooks/useChessGame';

const ENGINE_CONFIGS = [
  {
    key: 'beginner',
    label: 'Kronos D2',
    depth: 2,
    description: 'Horizon depth 2. Rapid moves, minimal lookahead.',
    icon: '🔵',
    tags: ['Depth 2', '~2k NPS'],
  },
  {
    key: 'casual',
    label: 'Kronos D4',
    depth: 4,
    description: 'Full alpha-beta at depth 4. Solid, principled chess.',
    icon: '🟢',
    tags: ['Depth 4', '~8k NPS', 'Alpha-Beta'],
  },
  {
    key: 'club',
    label: 'Kronos D5',
    depth: 5,
    description: 'PVS + killer heuristics. Threatens tactics and plans.',
    icon: '🟡',
    tags: ['Depth 5', '~20k NPS', 'PVS + Killers'],
  },
  {
    key: 'advanced',
    label: 'Kronos D6',
    depth: 6,
    description: 'Flagship. Full LMR, NMP, History heuristics. ~1485 Elo anchor.',
    icon: '⭐',
    tags: ['Depth 6', '~50k NPS', 'LMR · NMP', '~1485 Elo'],
    flagship: true,
  },
  {
    key: 'expert',
    label: 'Kronos D7',
    depth: 7,
    description: 'Experimental. Search Depth 7. Strongest, slowest.',
    icon: '🔬',
    tags: ['Depth 7', '~120k NPS'],
  },
];

const TIME_OPTIONS = [
  { value: '1+0',    label: '1 min',   type: 'Bullet' },
  { value: '3+0',    label: '3 min',   type: 'Blitz' },
  { value: '5+0',    label: '5 min',   type: 'Blitz' },
  { value: '10+0',   label: '10 min',  type: 'Rapid' },
  { value: '30+0',   label: '30 min',  type: 'Classical' },
  { value: 'casual', label: 'Untimed', type: 'Casual' },
];

const COLOR_OPTIONS = [
  { value: 'w',        label: 'White',   symbol: '♔' },
  { value: 'b',        label: 'Black',   symbol: '♚' },
  { value: 'random',   label: 'Random',  symbol: '⚄' },
  { value: 'simulate', label: 'Spectate',symbol: '👁' },
];

export default function MatchSetupPage({ onStart, defaultDifficulty, defaultTimeControl, boardTheme }) {
  const [selectedEngine,  setSelectedEngine]  = useState(defaultDifficulty || 'advanced');
  const [selectedColor,   setSelectedColor]   = useState('w');
  const [selectedTime,    setSelectedTime]    = useState(defaultTimeControl || '10+0');
  const [rulesLevel,     setRulesLevel]     = useState('casual');
  const [showEvalBar,    setShowEvalBar]    = useState(true);
  const [showPV,         setShowPV]         = useState(true);
  const [premoveEnabled, setPremoveEnabled] = useState(true);
  const [autoAnalysis,   setAutoAnalysis]   = useState(false);
  const [moveHints,      setMoveHints]      = useState(false);

  const handleStart = () => {
    const resolvedColor = selectedColor === 'random'
      ? (Math.random() < 0.5 ? 'w' : 'b')
      : selectedColor;
    onStart(resolvedColor, selectedEngine, selectedTime, {
      showEvalBar, showPV, premoveEnabled, autoAnalysis, moveHints, rulesLevel,
    });
  };

  const previewOrientation = selectedColor === 'b' ? 'black' : 'white';
  const selectedConfig = ENGINE_CONFIGS.find(c => c.key === selectedEngine) || ENGINE_CONFIGS[3];

  return (
    <div style={s.root} className="animate-fade-in">

      {/* ── Left: Board Preview ───────────────────────────────────────────── */}
      <div style={s.boardCol}>
        <div style={s.boardWrap}>
          <ChessBoard
            fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
            boardOrientation={previewOrientation}
            boardTheme={boardTheme}
            evalScore=""
            isSearching={false}
            gameStatus="idle"
            playerColor={selectedColor === 'random' || selectedColor === 'simulate' ? 'w' : selectedColor}
            makeMove={() => {}}
          />
        </div>

        {/* Engine spec card — shown below board */}
        <div style={{ ...s.engineSpecCard, border: '1px solid var(--color-border-subtle)', boxShadow: 'none', backgroundColor: 'transparent' }}>
          <div style={s.engineSpecRow}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{selectedConfig.icon}</span>
            <div>
              <div style={s.engineSpecName}>{selectedConfig.label}</div>
              <div style={s.engineSpecDesc}>{selectedConfig.description}</div>
            </div>
          </div>
          <div style={s.tagRow}>
            {selectedConfig.tags.map(t => <span key={t} style={s.tag}>{t}</span>)}
          </div>
        </div>
      </div>

      {/* ── Right: Configuration Panel ────────────────────────────────────── */}
      <div style={{ ...s.configCol, boxShadow: 'none', borderColor: 'var(--color-border-subtle)' }}>

        {/* Header — always visible */}
        <div style={s.panelHeader}>
          <div style={s.panelBadge}>Benchmark Suite Setup</div>
          <h2 style={s.panelTitle}>Match Settings</h2>
        </div>

        {/* Scrollable options */}
        <div style={s.scrollBody}>

          {/* Engine */}
          <div style={s.section}>
            <div style={s.sectionLabel}>Search Configuration (Engine Version)</div>
            <div className="segmented-control">
              {ENGINE_CONFIGS.map(cfg => (
                <button
                  key={cfg.key}
                  type="button"
                  onClick={() => setSelectedEngine(cfg.key)}
                  className={`segmented-control-btn ${selectedEngine === cfg.key ? 'segmented-control-btn-active' : ''}`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div style={s.section}>
            <div style={s.sectionLabel}>Side Selection</div>
            <div className="segmented-control">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSelectedColor(c.value)}
                  className={`segmented-control-btn ${selectedColor === c.value ? 'segmented-control-btn-active' : ''}`}
                >
                  <span style={{ marginRight: '4px' }}>{c.symbol}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Control */}
          <div style={s.section}>
            <div style={s.sectionLabel}>Time Control</div>
            <div className="segmented-control" style={{ flexWrap: 'wrap' }}>
              {TIME_OPTIONS.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setSelectedTime(t.value)}
                  className={`segmented-control-btn ${selectedTime === t.value ? 'segmented-control-btn-active' : ''}`}
                  style={{ flex: '1 0 30%' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Match Rules */}
          <div style={s.section}>
            <div style={s.sectionLabel}>Match Mode</div>
            <div className="segmented-control">
              {[
                { value: 'casual',      label: 'Casual (Allow Undo)' },
                { value: 'competitive', label: 'Competitive (No Undo)' },
              ].map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRulesLevel(r.value)}
                  className={`segmented-control-btn ${rulesLevel === r.value ? 'segmented-control-btn-active' : ''}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div style={s.section}>
            <div style={s.sectionLabel}>Telemetry Options</div>
            <div style={s.optionList}>
              {[
                { label: 'Show Evaluation Bar',     value: showEvalBar,    set: setShowEvalBar },
                { label: 'Show Principal Variation', value: showPV,         set: setShowPV },
                { label: 'Premove System',           value: premoveEnabled, set: setPremoveEnabled },
                { label: 'Auto-Analyze Game',        value: autoAnalysis,   set: setAutoAnalysis },
                { label: 'Highlight Search Hints',   value: moveHints,      set: setMoveHints },
              ].map(opt => (
                <div key={opt.label} style={s.optionRow}>
                  <span style={s.optionLabel}>{opt.label}</span>
                  <button
                    onClick={() => opt.set(v => !v)}
                    style={{
                      ...s.toggle,
                      backgroundColor: opt.value ? 'var(--color-brand-primary)' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <div style={{
                      ...s.toggleKnob,
                      transform: opt.value ? 'translateX(16px)' : 'translateX(0)',
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>{/* end scrollBody */}

        {/* ── Start Match Button — always pinned at bottom ───────────────── */}
        <div style={s.startFooter}>
          <button onClick={handleStart} style={s.startBtn}>
            <PlayCircle size={18} />
            Start Match
          </button>
        </div>

      </div>{/* end configCol */}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  root: {
    display: 'grid',
    gridTemplateColumns: '55% 45%',
    gap: '1.5rem',
    height: 'calc(100vh - 56px)',
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '1.25rem 1.5rem',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },

  /* ── Left column ── */
  boardCol: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  boardWrap: {
    width: '100%',
    maxWidth: '460px',
    flexShrink: 1,
    minHeight: 0,
  },
  engineSpecCard: {
    width: '100%',
    maxWidth: '460px',
    flexShrink: 0,
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid rgba(212,175,55,0.15)',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  engineSpecRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  engineSpecName: {
    fontSize: '0.82rem',
    fontWeight: 800,
    color: 'var(--color-brand-primary)',
  },
  engineSpecDesc: {
    fontSize: '0.7rem',
    color: 'var(--color-text-dim)',
    lineHeight: 1.5,
    marginTop: '2px',
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  tag: {
    fontSize: '0.6rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '2px 6px',
    borderRadius: '3px',
    backgroundColor: 'rgba(212,175,55,0.08)',
    color: 'var(--color-brand-primary)',
    border: '1px solid rgba(212,175,55,0.2)',
  },

  /* ── Right column — flex column, no overflow so button sticks ── */
  configCol: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid rgba(76,61,49,0.35)',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    overflow: 'hidden',   /* clip content, footer is INSIDE flex column */
  },

  panelHeader: {
    padding: '1.1rem 1.25rem 0.85rem',
    borderBottom: '1px solid rgba(52,40,30,0.4)',
    flexShrink: 0,
  },
  panelBadge: {
    fontSize: '0.62rem',
    fontWeight: 700,
    color: 'var(--color-brand-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '4px',
  },
  panelTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--color-text-primary)',
    margin: 0,
  },

  scrollBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minHeight: 0,
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
  },
  sectionLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },

  /* Engine grid */
  engineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '6px',
  },
  engineCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 4px',
    borderRadius: '6px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    position: 'relative',
  },
  flagshipBadge: {
    position: 'absolute',
    top: '2px',
    right: '3px',
    fontSize: '0.55rem',
    color: 'var(--color-brand-primary)',
  },

  /* Color grid */
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px',
  },
  colorChip: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    padding: '8px 4px',
    borderRadius: '6px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  /* Time grid */
  timeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '6px',
  },
  timeChip: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '7px 4px',
    borderRadius: '6px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  /* Rules grid */
  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
  },
  rulesChip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  /* Options */
  optionList: {
    display: 'flex',
    flexDirection: 'column',
  },
  optionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '7px 0',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  },
  optionLabel: {
    fontSize: '0.78rem',
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
  },
  toggle: {
    width: '36px',
    height: '20px',
    borderRadius: '10px',
    border: 'none',
    padding: '2px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
  },
  toggleKnob: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
    transition: 'transform 0.2s ease',
  },

  /* Start button — pinned, never scrolls out of view */
  startFooter: {
    padding: '0.85rem 1.25rem',
    borderTop: '1px solid rgba(52,40,30,0.4)',
    flexShrink: 0,
    backgroundColor: 'var(--color-bg-surface)',
  },
  startBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    padding: '0.75rem',
    fontSize: '0.9rem',
    fontWeight: 800,
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: 'var(--color-brand-primary)',
    color: '#1c1410',
    transition: 'opacity 0.15s ease',
    letterSpacing: '0.01em',
  },
};
