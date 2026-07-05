// Kronos Chess V2 — Post-Game Review Component
// Three-state flow: idle (game just ended) → analyzing → complete (full analysis shown)
// All values computed from engine; no placeholders.

import React, { useMemo, useState } from 'react';
import { Award, RefreshCw, BarChart2, Zap, AlertTriangle, CheckCircle2, Eye, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { DIFFICULTY_SETTINGS } from '../hooks/useChessGame';

// ── Helpers ───────────────────────────────────────────────────────────────────

function classifyColor(cls) {
  const map = {
    'Best Move':  { color: '#34d399', icon: '✦' },
    'Excellent':  { color: '#6ee7b7', icon: '✓' },
    'Good':       { color: '#a7c9e3', icon: '·' },
    'Inaccuracy': { color: '#fbbf24', icon: '?!' },
    'Mistake':    { color: '#f97316', icon: '?' },
    'Blunder':    { color: '#f87171', icon: '??' },
  };
  return map[cls] || { color: '#94a3b8', icon: '·' };
}

function evalToNum(s) {
  if (!s || s === '0.00') return 0;
  if (typeof s === 'string' && s.includes('M')) {
    const v = parseInt(s.replace('-M', '').replace('M', ''));
    return s.startsWith('-') ? -(100 - v) : (100 - v);
  }
  return parseFloat(s) || 0;
}

function scoreDisplay(s) {
  if (!s || s === '0.00') return '0.00';
  if (typeof s === 'string' && s.includes('M')) return s;
  const n = parseFloat(s);
  return (n > 0 ? '+' : '') + n.toFixed(2);
}

// ── Mini SVG Eval Graph ───────────────────────────────────────────────────────
function EvalGraph({ gameHistory, previewIndex, onSelectPly }) {
  const W = 280, H = 70;
  if (!gameHistory || gameHistory.length === 0) {
    return (
      <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-dim)', fontSize: '0.72rem' }}>
        No moves to display
      </div>
    );
  }

  const evals = [0, ...gameHistory.map(m => Math.max(-8, Math.min(8, evalToNum(m.evalScore))))];
  const totalPoints = evals.length;
  const xStep = W / Math.max(totalPoints - 1, 1);

  const pts = evals.map((v, i) => {
    const x = i * xStep;
    const y = H / 2 - (v / 8) * (H / 2 - 4);
    return `${x},${y}`;
  });

  const whiteArea = `0,${H / 2} ` + pts.join(' ') + ` ${W},${H / 2}`;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display: 'block', cursor: 'pointer', borderRadius: '4px', overflow: 'hidden' }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;
        const idx = Math.min(Math.round(relX * (totalPoints - 1)), totalPoints - 2);
        if (idx >= 0) onSelectPly(idx);
      }}
    >
      {/* Background */}
      <rect x={0} y={0} width={W} height={H} fill="#1a1208" />
      {/* Midline */}
      <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      {/* White advantage area */}
      <polygon points={whiteArea} fill="rgba(255,255,255,0.14)" />
      {/* Eval line */}
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="rgba(212,175,55,0.8)"
        strokeWidth={1.5}
      />
      {/* Preview cursor */}
      {previewIndex !== null && (
        <line
          x1={(previewIndex + 1) * xStep}
          y1={0}
          x2={(previewIndex + 1) * xStep}
          y2={H}
          stroke="rgba(212,175,55,0.9)"
          strokeWidth={1.5}
          strokeDasharray="3,2"
        />
      )}
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PostGameReview({
  gameHistory = [],
  openingName = 'Starting Position',
  winner,
  playerColor,
  modeSelected,
  difficulty,
  onReset,
  onSelectMoveIndex,
  isAnalyzing = false,
  analysisProgress = 0,
  showHeatmap = false,
  onToggleHeatmap = () => {},
  previewIndex = null,
  triggerAnalysis,
  cancelAnalysis,
}) {
  const [activeFilter, setActiveFilter] = useState('all');

  // Determine if analysis has been run (any move has a non-default classification)
  const analysisRan = useMemo(() => {
    return gameHistory.some(m => m.classification && m.classification !== 'Good');
  }, [gameHistory]);

  // --- Stats computation (only meaningful after analysis) ---
  const stats = useMemo(() => {
    const counts = {
      w: { best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, total: 0 },
      b: { best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, total: 0 },
    };
    const criticalMoments = [];

    gameHistory.forEach((m, idx) => {
      const side = m.color === 'w' ? 'w' : 'b';
      const cls = m.classification || 'Good';
      counts[side].total++;
      if (cls === 'Best Move') counts[side].best++;
      else if (cls === 'Excellent') counts[side].excellent++;
      else if (cls === 'Good') counts[side].good++;
      else if (cls === 'Inaccuracy') { counts[side].inaccuracy++; criticalMoments.push({ ply: idx, color: side === 'w' ? 'White' : 'Black', san: m.san, classification: cls, evalBefore: idx > 0 ? gameHistory[idx - 1].evalScore : '0.00', evalAfter: m.evalScore }); }
      else if (cls === 'Mistake') { counts[side].mistake++; criticalMoments.push({ ply: idx, color: side === 'w' ? 'White' : 'Black', san: m.san, classification: cls, evalBefore: idx > 0 ? gameHistory[idx - 1].evalScore : '0.00', evalAfter: m.evalScore }); }
      else if (cls === 'Blunder') { counts[side].blunder++; criticalMoments.push({ ply: idx, color: side === 'w' ? 'White' : 'Black', san: m.san, classification: cls, evalBefore: idx > 0 ? gameHistory[idx - 1].evalScore : '0.00', evalAfter: m.evalScore }); }
    });

    const calcAccuracy = (side) => {
      const c = counts[side];
      if (c.total === 0) return 0;
      const sum = c.best * 1.0 + c.excellent * 0.9 + c.good * 0.75 + c.inaccuracy * 0.4 + c.mistake * 0.15;
      return Math.round((sum / c.total) * 100);
    };

    return {
      whiteAcc: calcAccuracy('w'),
      blackAcc: calcAccuracy('b'),
      w: counts.w,
      b: counts.b,
      criticalMoments,
    };
  }, [gameHistory]);

  const filteredMoments = useMemo(() => {
    if (activeFilter === 'all') return stats.criticalMoments;
    if (activeFilter === 'error') return stats.criticalMoments.filter(m => m.classification === 'Blunder' || m.classification === 'Mistake');
    if (activeFilter === 'inaccuracy') return stats.criticalMoments.filter(m => m.classification === 'Inaccuracy');
    return stats.criticalMoments;
  }, [activeFilter, stats.criticalMoments]);

  // Result display
  const resultText = (() => {
    if (winner === 'draw') return 'Game Drawn';
    if (winner === 'w') return 'White Wins';
    if (winner === 'b') return 'Black Wins';
    return 'Game Over';
  })();

  const engineLabel = DIFFICULTY_SETTINGS[difficulty]?.label || 'Kronos Engine';

  // ── IDLE STATE: Game ended, no analysis yet ──────────────────────────────
  if (!isAnalyzing && !analysisRan) {
    return (
      <div style={s.root}>
        {/* Result Banner */}
        <div style={s.resultBanner}>
          <Award size={20} style={{ color: 'var(--color-brand-primary)' }} />
          <div>
            <div style={s.resultText}>{resultText}</div>
            <div style={s.openingLine}>
              <BookOpen size={10} style={{ flexShrink: 0 }} />
              {openingName}
            </div>
          </div>
        </div>

        {/* Generate Analysis CTA */}
        <div style={s.analysisCta}>
          <div style={s.ctaIcon}>
            <BarChart2 size={36} style={{ color: 'var(--color-brand-primary)' }} />
          </div>
          <div style={s.ctaTitle}>Generate Game Analysis</div>
          <div style={s.ctaDesc}>
            Evaluate every position using {engineLabel}. Identifies accuracy, blunders, critical moments, and best moves.
          </div>
          <div style={s.ctaInfo}>
            <Zap size={11} />
            <span>~{Math.max(5, Math.round(gameHistory.length * 0.8))} seconds · {gameHistory.length} positions</span>
          </div>
          <button
            onClick={triggerAnalysis}
            disabled={!triggerAnalysis || gameHistory.length === 0}
            style={s.analyzeBtn}
          >
            <BarChart2 size={15} />
            Generate Analysis
          </button>
        </div>

        {/* Quick game info */}
        <div style={s.quickInfo}>
          <div style={s.quickInfoRow}>
            <span style={s.qiLabel}>Engine</span>
            <span style={s.qiVal}>{engineLabel}</span>
          </div>
          <div style={s.quickInfoRow}>
            <span style={s.qiLabel}>Moves played</span>
            <span style={s.qiVal}>{gameHistory.length}</span>
          </div>
          <div style={s.quickInfoRow}>
            <span style={s.qiLabel}>Mode</span>
            <span style={s.qiVal}>{modeSelected === 'simulate' ? 'Engine vs Engine' : 'Play vs Engine'}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={s.actionRow}>
          <button onClick={onReset} style={s.primaryBtn} className="btn-primary">
            <RefreshCw size={14} />
            New Match Setup
          </button>
        </div>
      </div>
    );
  }

  // ── ANALYZING STATE ───────────────────────────────────────────────────────
  if (isAnalyzing) {
    return (
      <div style={s.root}>
        <div style={s.resultBanner}>
          <Award size={20} style={{ color: 'var(--color-brand-primary)' }} />
          <div>
            <div style={s.resultText}>{resultText}</div>
            <div style={s.openingLine}><BookOpen size={10} />{openingName}</div>
          </div>
        </div>

        <div style={s.analyzingCard}>
          <Loader2 size={28} style={{ color: 'var(--color-brand-primary)', animation: 'spin 1s linear infinite' }} />
          <div style={s.analyzingTitle}>Analyzing Game…</div>
          <div style={s.analyzingDesc}>
            Evaluating position {Math.round(analysisProgress / 100 * gameHistory.length)} / {gameHistory.length}
          </div>
          <div style={s.progressTrack}>
            <div style={{ ...s.progressBar, width: `${analysisProgress}%` }} />
          </div>
          <div style={s.progressPct}>{analysisProgress}%</div>
          <button onClick={cancelAnalysis} style={s.cancelBtn}>Cancel</button>
        </div>
      </div>
    );
  }

  // ── ANALYSIS COMPLETE STATE ───────────────────────────────────────────────
  const myColor = playerColor || 'w';
  const myAcc = myColor === 'w' ? stats.whiteAcc : stats.blackAcc;
  const oppAcc = myColor === 'w' ? stats.blackAcc : stats.whiteAcc;
  const myCounts = myColor === 'w' ? stats.w : stats.b;
  const oppCounts = myColor === 'w' ? stats.b : stats.w;

  return (
    <div style={s.root}>

      {/* Result Banner */}
      <div style={s.resultBanner}>
        <Award size={20} style={{ color: 'var(--color-brand-primary)' }} />
        <div>
          <div style={s.resultText}>{resultText}</div>
          <div style={s.openingLine}><BookOpen size={10} />{openingName}</div>
        </div>
        <button onClick={onReset} style={s.newMatchBtn}><RefreshCw size={12} /> New</button>
      </div>

      {/* Accuracy Cards */}
      {modeSelected !== 'simulate' && (
        <div style={s.accRow}>
          <div style={s.accCard}>
            <div style={s.accPct(myAcc)}>{myAcc}%</div>
            <div style={s.accLabel}>You ({myColor === 'w' ? 'White' : 'Black'})</div>
            <div style={{ ...s.accBar, width: '100%' }}>
              <div style={{ ...s.accFill, width: `${myAcc}%`, backgroundColor: myAcc >= 75 ? '#34d399' : myAcc >= 50 ? '#fbbf24' : '#f87171' }} />
            </div>
          </div>
          <div style={s.accCard}>
            <div style={s.accPct(oppAcc)}>{oppAcc}%</div>
            <div style={s.accLabel}>Engine</div>
            <div style={{ ...s.accBar, width: '100%' }}>
              <div style={{ ...s.accFill, width: `${oppAcc}%`, backgroundColor: oppAcc >= 75 ? '#34d399' : oppAcc >= 50 ? '#fbbf24' : '#f87171' }} />
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Graph */}
      <div style={s.graphCard}>
        <div style={s.cardTitle}>Evaluation Graph</div>
        <EvalGraph
          gameHistory={gameHistory}
          previewIndex={previewIndex}
          onSelectPly={(idx) => onSelectMoveIndex(idx)}
        />
      </div>

      {/* Move Counts */}
      <div style={s.countsRow}>
        {[
          { label: 'Best', key: 'best',      color: '#34d399' },
          { label: '!',    key: 'excellent',  color: '#6ee7b7' },
          { label: '?!',   key: 'inaccuracy', color: '#fbbf24' },
          { label: '?',    key: 'mistake',    color: '#f97316' },
          { label: '??',   key: 'blunder',    color: '#f87171' },
        ].map(cat => (
          <div key={cat.key} style={s.countCell}>
            <div style={{ ...s.countNum, color: cat.color }}>
              {modeSelected !== 'simulate' ? myCounts[cat.key] : (stats.w[cat.key] + stats.b[cat.key])}
            </div>
            <div style={s.countLabel}>{cat.label}</div>
          </div>
        ))}
      </div>

      {/* Critical Moments */}
      <div style={s.momentsCard}>
        <div style={s.momentsTitleRow}>
          <span style={s.cardTitle}>Critical Moments</span>
          <div style={s.filterRow}>
            {[
              { key: 'all',        label: 'All' },
              { key: 'error',      label: '?/?' },
              { key: 'inaccuracy', label: '?!' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  ...s.filterBtn,
                  backgroundColor: activeFilter === f.key ? 'rgba(212,175,55,0.15)' : 'transparent',
                  color: activeFilter === f.key ? 'var(--color-brand-primary)' : 'var(--color-text-dim)',
                  borderColor: activeFilter === f.key ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)',
                }}
              >{f.label}</button>
            ))}
          </div>
        </div>

        <div style={s.momentsList}>
          {filteredMoments.length === 0 ? (
            <div style={s.emptyMoments}>
              <CheckCircle2 size={14} style={{ opacity: 0.4 }} />
              <span>No {activeFilter === 'all' ? 'critical' : activeFilter} moments found</span>
            </div>
          ) : (
            filteredMoments.slice(0, 8).map((moment, i) => {
              const cc = classifyColor(moment.classification);
              return (
                <button
                  key={i}
                  style={{
                    ...s.momentRow,
                    borderLeft: `3px solid ${cc.color}`,
                    backgroundColor: previewIndex === moment.ply ? 'rgba(212,175,55,0.06)' : 'transparent',
                  }}
                  onClick={() => onSelectMoveIndex(moment.ply)}
                >
                  <span style={{ color: 'var(--color-text-dim)', fontSize: '0.65rem', minWidth: '22px' }}>
                    {Math.floor(moment.ply / 2) + 1}{moment.ply % 2 === 0 ? '.' : '…'}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>
                    {moment.san}
                  </span>
                  <span style={{ ...s.clsBadge, color: cc.color, borderColor: `${cc.color}33` }}>
                    {cc.icon} {moment.classification}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--color-text-dim)', fontFamily: 'monospace' }}>
                    {scoreDisplay(moment.evalBefore)} → {scoreDisplay(moment.evalAfter)}
                  </span>
                  <ChevronRight size={11} style={{ opacity: 0.3, flexShrink: 0 }} />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={s.actionRow}>
        <button onClick={onReset} style={s.primaryBtn} className="btn-primary">
          <RefreshCw size={13} />
          New Match Setup
        </button>
        <button onClick={onToggleHeatmap} style={s.secondaryBtn}>
          <Eye size={13} />
          {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
        </button>
      </div>

    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '100%',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingRight: '6px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--color-border-default) transparent',
  },
  resultBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: 'rgba(212,175,55,0.06)',
    border: '1px solid rgba(212,175,55,0.15)',
    borderRadius: '6px',
    flexShrink: 0,
  },
  resultText: {
    fontSize: '0.88rem',
    fontWeight: 800,
    color: 'var(--color-text-primary)',
  },
  openingLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.68rem',
    color: 'var(--color-text-dim)',
    marginTop: '2px',
  },
  newMatchBtn: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '4px',
    padding: '4px 9px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  // Idle CTA
  analysisCta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(21,16,12,0.6)',
    border: '1px solid rgba(212,175,55,0.12)',
    borderRadius: '8px',
    padding: '20px 16px',
    textAlign: 'center',
  },
  ctaIcon: {
    fontSize: '1.6rem',
  },
  ctaTitle: {
    fontSize: '0.9rem',
    fontWeight: 800,
    color: 'var(--color-text-primary)',
  },
  ctaDesc: {
    fontSize: '0.72rem',
    color: 'var(--color-text-dim)',
    lineHeight: 1.5,
    maxWidth: '260px',
  },
  ctaInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.68rem',
    color: 'var(--color-brand-primary)',
    opacity: 0.8,
  },
  analyzeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 20px',
    marginTop: '4px',
    backgroundColor: 'var(--color-brand-primary)',
    color: '#1c1410',
    fontWeight: 800,
    fontSize: '0.82rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'opacity 0.15s ease',
  },
  quickInfo: {
    backgroundColor: 'var(--color-bg-base)',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  quickInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '7px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  },
  qiLabel: { fontSize: '0.72rem', color: 'var(--color-text-dim)' },
  qiVal:   { fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-secondary)' },
  // Analyzing state
  analyzingCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '24px 16px',
    backgroundColor: 'rgba(21,16,12,0.6)',
    border: '1px solid rgba(212,175,55,0.1)',
    borderRadius: '8px',
    textAlign: 'center',
  },
  analyzingTitle: { fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' },
  analyzingDesc:  { fontSize: '0.72rem', color: 'var(--color-text-dim)' },
  progressTrack: {
    width: '100%',
    height: '5px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '6px',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'var(--color-brand-primary)',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  progressPct: { fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-brand-primary)' },
  cancelBtn: {
    marginTop: '4px',
    fontSize: '0.72rem',
    color: 'var(--color-text-dim)',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '4px',
    padding: '4px 12px',
    cursor: 'pointer',
  },
  // Analysis complete
  accRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  accCard: {
    backgroundColor: 'rgba(21,16,12,0.5)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '6px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  accPct: (acc) => ({
    fontSize: '1.3rem',
    fontWeight: 800,
    color: acc >= 75 ? '#34d399' : acc >= 50 ? '#fbbf24' : '#f87171',
    fontFamily: 'monospace',
  }),
  accLabel: { fontSize: '0.68rem', color: 'var(--color-text-dim)', fontWeight: 600 },
  accBar: { height: '3px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' },
  accFill: { height: '100%', borderRadius: '2px', transition: 'width 0.5s ease' },
  graphCard: {
    backgroundColor: 'rgba(21,16,12,0.5)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '6px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  cardTitle: { fontSize: '0.67rem', fontWeight: 800, color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  countsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '5px',
  },
  countCell: {
    textAlign: 'center',
    backgroundColor: 'rgba(21,16,12,0.5)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '5px',
    padding: '6px 4px',
  },
  countNum:   { fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace' },
  countLabel: { fontSize: '0.6rem', color: 'var(--color-text-dim)', fontWeight: 700, marginTop: '2px' },
  momentsCard: {
    backgroundColor: 'rgba(21,16,12,0.4)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '6px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minHeight: 0,
  },
  momentsTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterRow: { display: 'flex', gap: '4px' },
  filterBtn: {
    fontSize: '0.6rem',
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: '3px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  momentsList: { display: 'flex', flexDirection: 'column', gap: '3px' },
  momentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '6px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: '3px solid transparent',
    backgroundColor: 'transparent',
    width: '100%',
    textAlign: 'left',
    transition: 'background-color 0.1s ease',
  },
  clsBadge: {
    fontSize: '0.6rem',
    fontWeight: 700,
    padding: '1px 5px',
    borderRadius: '3px',
    border: '1px solid',
    whiteSpace: 'nowrap',
  },
  emptyMoments: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.72rem',
    color: 'var(--color-text-dim)',
    padding: '10px 0',
    justifyContent: 'center',
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
    marginTop: 'auto',
  },
  primaryBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    fontSize: '0.78rem',
    fontWeight: 700,
    borderRadius: '5px',
    cursor: 'pointer',
    border: 'none',
  },
  secondaryBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    fontSize: '0.78rem',
    fontWeight: 700,
    borderRadius: '5px',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    color: 'var(--color-text-secondary)',
  },
};
