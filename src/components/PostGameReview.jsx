// Kronos Chess V2 — Post Game Review Analytics
// Computes centipawn accuracy percentages and lists critical moments.

import React, { useMemo } from 'react';
import { Award, ShieldAlert, Star, CheckCircle2, TrendingUp, RefreshCw, Eye } from 'lucide-react';

export default function PostGameReview({
  gameHistory,
  openingName,
  winner,
  playerColor,
  modeSelected,
  onReset,
  onSelectMoveIndex,
  isAnalyzing = false,
  analysisProgress = 0,
  showHeatmap = false,
  onToggleHeatmap = () => {}
}) {

  // Calculate accuracy and counts for both sides
  const stats = useMemo(() => {
    const counts = {
      w: { best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, total: 0 },
      b: { best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, total: 0 }
    };

    const criticalMoments = []; // [{ ply, color, move, class, fen, type }]

    gameHistory.forEach((m, idx) => {
      const isWhite = m.color === 'w';
      const side = isWhite ? 'w' : 'b';
      const classification = m.classification || 'Good';

      counts[side].total++;

      if (classification === 'Best Move') counts[side].best++;
      else if (classification === 'Excellent') counts[side].excellent++;
      else if (classification === 'Good') counts[side].good++;
      else if (classification === 'Inaccuracy') {
        counts[side].inaccuracy++;
        criticalMoments.push({ ply: idx, color: isWhite ? 'White' : 'Black', san: m.san, classification, fen: m.after, type: 'inaccuracy' });
      } else if (classification === 'Mistake') {
        counts[side].mistake++;
        criticalMoments.push({ ply: idx, color: isWhite ? 'White' : 'Black', san: m.san, classification, fen: m.after, type: 'mistake' });
      } else if (classification === 'Blunder') {
        counts[side].blunder++;
        criticalMoments.push({ ply: idx, color: isWhite ? 'White' : 'Black', san: m.san, classification, fen: m.after, type: 'blunder' });
      }
    });

    // Accuracy weights: Best=100%, Excellent=90%, Good=75%, Inaccuracy=40%, Mistake=15%, Blunder=0%
    const calculateAccuracy = (side) => {
      const c = counts[side];
      if (c.total === 0) return 0;
      const sum = (c.best * 1.0) + (c.excellent * 0.9) + (c.good * 0.75) + (c.inaccuracy * 0.4) + (c.mistake * 0.15);
      return Math.round((sum / c.total) * 100);
    };

    return {
      whiteAccuracy: calculateAccuracy('w'),
      blackAccuracy: calculateAccuracy('b'),
      whiteCounts: counts.w,
      blackCounts: counts.b,
      criticalMoments
    };
  }, [gameHistory]);

  if (isAnalyzing) {
    return (
      <div style={styles.loaderWrapper} className="animate-fade-in">
        <Award size={36} style={styles.loaderIcon} />
        <div style={styles.loaderTitle}>Generating Game Review</div>
        <div style={styles.loaderSubtitle}>
          Kronos is analyzing move evaluations and detecting blunders...
        </div>
        
        <div style={styles.progressContainer}>
          <div style={styles.progressBar(analysisProgress)} />
        </div>
        
        <div style={styles.progressText}>
          {analysisProgress}% Completed
        </div>
      </div>
    );
  }

  const activeUser = localStorage.getItem('kronos_v2_active_user') || 'Guest';

  // Determine label matches
  const isAIMode = modeSelected === 'ai';
  const playerSide = playerColor === 'w' ? 'white' : 'black';
  const playerAcc = playerColor === 'w' ? stats.whiteAccuracy : stats.blackAccuracy;
  const oppAcc = playerColor === 'w' ? stats.blackAccuracy : stats.whiteAccuracy;
  
  const playerCounts = playerColor === 'w' ? stats.whiteCounts : stats.blackCounts;
  const oppCounts = playerColor === 'w' ? stats.blackCounts : stats.whiteCounts;

  const resultHeader = () => {
    if (winner === 'draw') return 'Game Drawn';
    if (modeSelected === 'local') {
      return winner === 'w' ? 'White Won the Match' : 'Black Won the Match';
    }
    const playerWon = winner === playerColor;
    return playerWon ? 'Victory for You!' : 'Defeat — Engine Wins';
  };

  return (
    <div style={styles.reviewWrapper} className="animate-fade-in">
      
      {/* Result Heading banner */}
      <div style={styles.resultBanner}>
        <Award size={22} style={{ color: 'var(--color-brand-primary)' }} />
        <div>
          <div style={styles.resultText}>{resultHeader()}</div>
          <div style={styles.openingText}>Opening: {openingName}</div>
        </div>
      </div>

      {/* Heatmap Toggle */}
      <div style={styles.heatmapToggleContainer}>
        <div style={styles.heatmapToggleLabel}>
          <Eye size={14} style={{ color: showHeatmap ? 'var(--color-brand-primary)' : 'var(--color-text-dim)' }} />
          <span style={styles.heatmapToggleText}>Move Heatmap Overlay</span>
        </div>
        <button
          onClick={() => onToggleHeatmap(!showHeatmap)}
          style={{
            ...styles.toggleBtn,
            backgroundColor: showHeatmap ? 'var(--color-brand-primary)' : 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{
            ...styles.toggleKnob,
            transform: showHeatmap ? 'translateX(16px)' : 'translateX(0px)',
          }} />
        </button>
      </div>

      {/* Accuracy Comparison row */}
      <div style={styles.accuracyContainer}>
        {/* Player column */}
        <div style={styles.accCol}>
          <div style={styles.accVal}>{modeSelected === 'local' ? stats.whiteAccuracy : playerAcc}%</div>
          <div style={styles.accLabel}>{modeSelected === 'local' ? 'White' : activeUser}</div>
        </div>

        <div style={styles.accDivider}>
          <TrendingUp size={14} color="var(--color-text-dim)" />
          <span style={styles.accDividerText}>Accuracy</span>
        </div>

        {/* Opponent column */}
        <div style={styles.accCol}>
          <div style={styles.accVal}>{modeSelected === 'local' ? stats.blackAccuracy : oppAcc}%</div>
          <div style={styles.accLabel}>{modeSelected === 'local' ? 'Black' : (isAIMode ? 'Kronos' : 'Opponent')}</div>
        </div>
      </div>

      {/* Accuracy details grid list */}
      <div style={styles.statsCard} className="panel-card">
        <div style={styles.statsGridHeader}>
          <span>Performance Metrics</span>
          <span>{modeSelected === 'local' ? 'White / Black' : 'You / Engine'}</span>
        </div>

        <div style={styles.statsList}>
          <div style={styles.statsRow}>
            <div style={styles.metricLabel}><Star size={11} fill="#d4af37" color="#d4af37" /> Best Moves</div>
            <div style={styles.metricVal}>
              {modeSelected === 'local' ? `${stats.whiteCounts.best} / ${stats.blackCounts.best}` : `${playerCounts.best} / ${oppCounts.best}`}
            </div>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.metricLabel}><CheckCircle2 size={11} color="#48bb78" /> Excellent</div>
            <div style={styles.metricVal}>
              {modeSelected === 'local' ? `${stats.whiteCounts.excellent} / ${stats.blackCounts.excellent}` : `${playerCounts.excellent} / ${oppCounts.excellent}`}
            </div>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.metricLabel}><CheckCircle2 size={11} color="#a0aec0" /> Good</div>
            <div style={styles.metricVal}>
              {modeSelected === 'local' ? `${stats.whiteCounts.good} / ${stats.blackCounts.good}` : `${playerCounts.good} / ${oppCounts.good}`}
            </div>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.metricLabel}><ShieldAlert size={11} color="#ecc94b" /> Inaccuracies</div>
            <div style={styles.metricVal}>
              {modeSelected === 'local' ? `${stats.whiteCounts.inaccuracy} / ${stats.blackCounts.inaccuracy}` : `${playerCounts.inaccuracy} / ${oppCounts.inaccuracy}`}
            </div>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.metricLabel}><ShieldAlert size={11} color="#ed8936" /> Mistakes</div>
            <div style={styles.metricVal}>
              {modeSelected === 'local' ? `${stats.whiteCounts.mistake} / ${stats.blackCounts.mistake}` : `${playerCounts.mistake} / ${oppCounts.mistake}`}
            </div>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.metricLabel}><ShieldAlert size={11} color="#f56565" /> Blunders</div>
            <div style={styles.metricVal}>
              {modeSelected === 'local' ? `${stats.whiteCounts.blunder} / ${stats.blackCounts.blunder}` : `${playerCounts.blunder} / ${oppCounts.blunder}`}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Moments list */}
      <div style={styles.criticalCard}>
        <div style={styles.criticalHeader}>Critical Moments ({stats.criticalMoments.length})</div>
        <div style={styles.criticalList} className="scroll-panel">
          {stats.criticalMoments.length > 0 ? (
            stats.criticalMoments.map((mom, idx) => (
              <div 
                key={idx} 
                onClick={() => onSelectMoveIndex(mom.ply)}
                style={styles.criticalRow}
              >
                <div style={styles.critLeft}>
                  <span style={styles.critColor}>{mom.color} played</span>
                  <span style={styles.critMove}>{mom.san}</span>
                </div>
                <div style={styles.critRight}>
                  <span style={styles.critClass(mom.type)}>{mom.classification}</span>
                  <Eye size={12} style={styles.critEye} />
                </div>
              </div>
            ))
          ) : (
            <div style={styles.emptyCritical}>A clean game! No critical blunders or mistakes detected.</div>
          )}
        </div>
      </div>

      <button onClick={onReset} style={styles.resetBtn} className="btn-gold">
        <RefreshCw size={14} /> Start New Match
      </button>

    </div>
  );
}

const styles = {
  reviewWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '100%',
  },
  heatmapToggleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'rgba(212, 175, 55, 0.03)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
  },
  heatmapToggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  heatmapToggleText: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-text-secondary)',
  },
  toggleBtn: {
    width: '36px',
    height: '20px',
    borderRadius: '10px',
    border: 'none',
    padding: '2px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s ease',
  },
  toggleKnob: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
    transition: 'transform 0.2s ease',
  },
  resultBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '4px',
  },
  resultText: {
    fontSize: '13px',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
  },
  openingText: {
    fontSize: '10px',
    color: 'var(--color-text-secondary)',
    marginTop: '1px',
  },
  accuracyContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '10px 0',
  },
  accCol: {
    textAlign: 'center',
  },
  accVal: {
    fontFamily: 'var(--font-display)',
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
  },
  accLabel: {
    fontSize: '11px',
    color: 'var(--color-text-secondary)',
    fontWeight: '600',
    marginTop: '2px',
  },
  accDivider: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  accDividerText: {
    fontSize: '9px',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  statsCard: {
    borderRadius: '6px',
    overflow: 'hidden',
  },
  statsGridHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'var(--color-border-subtle)',
    fontSize: '10px',
    fontWeight: '800',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--color-border-subtle)',
  },
  statsList: {
    display: 'flex',
    flexDirection: 'column',
    padding: '4px 0',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 12px',
    fontSize: '11px',
    borderBottom: '1px solid rgba(76, 61, 49, 0.15)',
  },
  metricLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--color-text-secondary)',
    fontWeight: '600',
  },
  metricVal: {
    fontFamily: 'monospace',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  criticalCard: {
    backgroundColor: 'rgba(21, 16, 12, 0.4)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    minHeight: '120px',
  },
  criticalHeader: {
    fontSize: '10px',
    fontWeight: '800',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  criticalList: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  criticalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 10px',
    backgroundColor: 'var(--color-bg-base)',
    borderRadius: '4px',
    cursor: 'pointer',
    borderLeft: '2px solid transparent',
    transition: 'all 0.15s ease',
    ':hover': {
      borderLeftColor: 'var(--color-brand-primary)',
      backgroundColor: 'var(--color-bg-elevated)'
    }
  },
  critLeft: {
    display: 'flex',
    gap: '6px',
    fontSize: '11px',
    alignItems: 'center',
  },
  critColor: {
    color: 'var(--color-text-dim)',
  },
  critMove: {
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  critRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  critClass: (type) => ({
    fontSize: '9px',
    fontWeight: '800',
    padding: '1px 5px',
    borderRadius: '3px',
    textTransform: 'uppercase',
    backgroundColor: type === 'blunder' ? 'rgba(245, 101, 101, 0.08)' : (type === 'mistake' ? 'rgba(237, 137, 54, 0.08)' : 'rgba(236, 201, 75, 0.08)'),
    color: type === 'blunder' ? '#f56565' : (type === 'mistake' ? '#ed8936' : '#ecc94b'),
  }),
  critEye: {
    color: 'var(--color-text-dim)',
  },
  emptyCritical: {
    fontSize: '11px',
    color: 'var(--color-text-dim)',
    textAlign: 'center',
    padding: '20px 0',
  },
  resetBtn: {
    padding: '10px',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: 'auto',
  },
  loaderWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '24px',
    gap: '14px',
    textAlign: 'center',
  },
  loaderIcon: {
    color: 'var(--color-brand-primary)',
  },
  loaderTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.02em',
  },
  loaderSubtitle: {
    fontSize: '12px',
    color: 'var(--color-text-dim)',
    maxWidth: '240px',
    lineHeight: '1.4',
  },
  progressContainer: {
    width: '100%',
    maxWidth: '200px',
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '6px',
    border: '1px solid rgba(212, 175, 55, 0.1)',
  },
  progressBar: (pct) => ({
    width: `${pct}%`,
    height: '100%',
    backgroundColor: 'var(--color-brand-primary)',
    backgroundImage: 'linear-gradient(90deg, #d4af37, #f39c12)',
    borderRadius: '3px',
    transition: 'width 0.2s ease-out',
  }),
  progressText: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-text-secondary)',
    fontFamily: 'monospace',
  }
};
