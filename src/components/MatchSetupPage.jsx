// Kronos Chess V2 — Match Setup Page
// Full-screen pre-game configuration lobby. Centers chessboard preview and displays options cleanly.

import React, { useState } from 'react';
import { PlayCircle, Target, Swords, Cpu, Volume2, Shield } from 'lucide-react';
import ChessBoard from './ChessBoard';
import Toggle from './ui/Toggle';

const ENGINE_CONFIGS = [
  {
    key: 'beginner',
    label: 'Kronos D2',
    depth: 2,
    description: 'Horizon depth 2. Rapid moves, minimal lookahead.',
    tags: ['Depth 2', '~2k NPS'],
  },
  {
    key: 'casual',
    label: 'Kronos D4',
    depth: 4,
    description: 'Full alpha-beta at depth 4. Solid, principled chess.',
    tags: ['Depth 4', '~8k NPS', 'Alpha-Beta'],
  },
  {
    key: 'club',
    label: 'Kronos D5',
    depth: 5,
    description: 'PVS + killer heuristics. Threatens tactics and plans.',
    tags: ['Depth 5', '~20k NPS', 'PVS + Killers'],
  },
  {
    key: 'advanced',
    label: 'Kronos D6',
    depth: 6,
    description: 'Flagship. Full LMR, NMP, History heuristics. ~1485 Elo anchor.',
    tags: ['Depth 6', '~50k NPS', 'LMR · NMP', '~1485 Elo'],
    flagship: true,
  },
  {
    key: 'expert',
    label: 'Kronos D7',
    depth: 7,
    description: 'Experimental. Search Depth 7. Strongest, slowest.',
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
  { value: 'w',        label: 'White' },
  { value: 'b',        label: 'Black' },
  { value: 'random',   label: 'Random' },
  { value: 'simulate', label: 'Spectate' },
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

      {/* ── Left: Board Preview (Vertically Centered, No details under board) ── */}
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
      </div>

      {/* ── Right: Configuration Panel ────────────────────────────────────── */}
      <div style={s.configCol}>

        {/* Header */}
        <div style={s.panelHeader}>
          <div style={s.panelBadge}>Benchmark Suite Setup</div>
          <h2 style={s.panelTitle}>Match Settings</h2>
        </div>

        {/* Scrollable options */}
        <div style={s.scrollBody}>

          {/* Engine Spec status card at the top */}
          <div style={s.engineSpecCard}>
            <div style={s.engineSpecHeader}>
              <Cpu size={16} color="var(--color-brand-primary)" />
              <span style={s.engineSpecName}>{selectedConfig.label} Profile</span>
            </div>
            <p style={s.engineSpecDesc}>{selectedConfig.description}</p>
            <div style={s.tagRow}>
              {selectedConfig.tags.map(t => (
                <span key={t} style={s.tag}>{t}</span>
              ))}
            </div>
          </div>

          {/* Engine Version Selection */}
          <div style={s.section}>
            <div style={s.sectionLabel}>Engine Version</div>
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

          {/* Side Selection */}
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
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Control Selection */}
          <div style={s.section}>
            <div style={s.sectionLabel}>Time Control</div>
            <div className="segmented-control" style={{ flexWrap: 'wrap', gap: '2px' }}>
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

          {/* Match Mode Selection */}
          <div style={s.section}>
            <div style={s.sectionLabel}>Match Mode</div>
            <div className="segmented-control">
              {[
                { value: 'casual',      label: 'Casual (Allow Undo)' },
                { value: 'competitive', label: 'Competitive' },
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

          {/* Telemetry Toggle Options */}
          <div style={s.section}>
            <div style={s.sectionLabel}>Telemetry Options</div>
            <div style={s.optionList}>
              <div style={s.optionRow}>
                <span style={s.optionLabel}>Show Evaluation Bar</span>
                <Toggle checked={showEvalBar} onChange={setShowEvalBar} />
              </div>
              <div style={s.optionRow}>
                <span style={s.optionLabel}>Show Principal Variation</span>
                <Toggle checked={showPV} onChange={setShowPV} />
              </div>
              <div style={s.optionRow}>
                <span style={s.optionLabel}>Premove System</span>
                <Toggle checked={premoveEnabled} onChange={setPremoveEnabled} />
              </div>
              <div style={s.optionRow}>
                <span style={s.optionLabel}>Auto-Analyze Game</span>
                <Toggle checked={autoAnalysis} onChange={setAutoAnalysis} />
              </div>
              <div style={s.optionRow}>
                <span style={s.optionLabel}>Highlight Search Hints</span>
                <Toggle checked={moveHints} onChange={setMoveHints} />
              </div>
            </div>
          </div>

        </div>

        {/* ── Start Match Button (Pinned) ────────────────────────────────── */}
        <div style={s.startFooter}>
          <button onClick={handleStart} className="btn-primary" style={s.startBtn}>
            <PlayCircle size={18} />
            <span>Start Match</span>
          </button>
        </div>

      </div>
    </div>
  );
}

const s = {
  root: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '40px',
    height: 'calc(100vh - 56px)',
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '32px 24px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  boardCol: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  boardWrap: {
    width: '100%',
    maxWidth: 'min(78vh, 660px)',
    flexShrink: 1,
    minHeight: 0,
  },
  // Configurations Column (Borderless panel, relies on whitespace & separators)
  configCol: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    backgroundColor: 'transparent',
    borderLeft: '1px solid rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
  },
  panelHeader: {
    padding: '0 24px 20px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    flexShrink: 0,
  },
  panelBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-brand-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '6px',
  },
  panelTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  scrollBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    minHeight: 0,
  },
  engineSpecCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  engineSpecHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  engineSpecName: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--color-brand-primary)',
  },
  engineSpecDesc: {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.45,
    margin: 0,
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '2px',
  },
  tag: {
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(200, 159, 61, 0.08)',
    color: 'var(--color-brand-primary)',
    border: '1px solid rgba(200, 159, 61, 0.15)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  optionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  optionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
  },
  optionLabel: {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    fontWeight: '500',
  },
  startFooter: {
    padding: '20px 24px 0 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    flexShrink: 0,
    backgroundColor: 'transparent',
  },
  startBtn: {
    width: '100%',
  },
};
