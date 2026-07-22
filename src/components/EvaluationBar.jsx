// Kronos Chess V2 — Vertical Evaluation Bar (Redesigned)
// Wider bar (44px), score badge embedded at the divider line, smooth transitions.

import React from 'react';

export default function EvaluationBar({ score, orientation }) {
  const getPercentage = () => {
    if (!score) return 50;

    if (typeof score === 'string' && score.includes('M')) {
      return score.startsWith('-') ? 4 : 96;
    }

    const val = parseFloat(score);
    if (isNaN(val)) return 50;

    // Clamp between -8 and +8 pawns
    const clamped = Math.max(-8, Math.min(8, val));
    // Map: 0 → 50%, +8 → 96%, -8 → 4%
    const percent = 50 + (clamped / 8) * 46;
    return Math.max(4, Math.min(96, percent));
  };

  const whitePercent = getPercentage();
  const blackPercent = 100 - whitePercent;

  const isWhiteBottom = orientation === 'white';

  // White is at the bottom of the board view when orientation='white'
  // So bottom section of bar = white's portion
  const topHeight   = isWhiteBottom ? blackPercent  : whitePercent;
  const topColor    = isWhiteBottom ? '#1c1410'     : '#e8dcc8';
  const bottomColor = isWhiteBottom ? '#e8dcc8'     : '#1c1410';

  // Score display formatting
  const formatScore = (s) => {
    if (!s && s !== 0) return '0.00';
    if (typeof s === 'string') {
      if (s.startsWith('M') || s.startsWith('-M')) return s;
      const n = parseFloat(s);
      if (isNaN(n)) return s;
      return n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2);
    }
    return s > 0 ? `+${s.toFixed(2)}` : s.toFixed(2);
  };

  const displayScore = formatScore(score);

  // Determine score label position: always near the divider
  // In white-bottom: score label at (topHeight %) from top
  const labelTop = `${topHeight}%`;

  // Determine text color based on who is ahead
  const whiteAhead = whitePercent > 50;
  const labelBg = whiteAhead ? '#e8dcc8' : '#1c1410';
  const labelColor = whiteAhead ? '#1c1410' : '#e8dcc8';

  return (
    <div style={styles.wrapper} className="evaluation-bar-wrapper horizontal">
      <div style={styles.barContainer} className="evaluation-bar-container horizontal">
        {/* Black section (top) */}
        <div style={{
          ...styles.section,
          height: `${topHeight}%`,
          '--bar-percent': `${topHeight}%`,
          backgroundColor: topColor,
        }} className="evaluation-bar-fill horizontal" />

        {/* Bottom section */}
        <div style={{
          ...styles.section,
          height: `${100 - topHeight}%`,
          '--bar-percent': `${100 - topHeight}%`,
          backgroundColor: bottomColor,
        }} className="evaluation-bar-fill horizontal" />

        {/* Score label floating at the divider */}
        <div style={{
          ...styles.scoreBadge,
          top: labelTop,
          transform: 'translate(-50%, -50%)',
          backgroundColor: labelBg,
          color: labelColor,
          '--label-pos': labelTop,
        }} className="evaluation-bar-score horizontal">
          {displayScore}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    width: '28px',
    flexShrink: 0,
  },
  barContainer: {
    flex: 1,
    width: '28px',
    backgroundColor: '#0e0b08',
    border: '1px solid var(--color-border-default)',
    borderRight: 'none',
    borderTopLeftRadius: '4px',
    borderBottomLeftRadius: '4px',
    borderTopRightRadius: '0px',
    borderBottomRightRadius: '0px',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.4)',
  },
  section: {
    width: '100%',
    transition: 'height 0.45s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  scoreBadge: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%) translateY(-50%)',
    fontSize: '8px',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
    padding: '1px 3px',
    borderRadius: '2px',
    whiteSpace: 'nowrap',
    boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
    zIndex: 2,
    minWidth: '24px',
    textAlign: 'center',
    transition: 'top 0.45s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.45s cubic-bezier(0.16, 1, 0.3, 1), color 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
    letterSpacing: '0.01em',
  },
};
