// Kronos Chess V2 — Move History & Analytics Panel
// Renders algebraic moves list, classification badges, and Opening details with a detailed strategy card.

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, User, Star, Lightbulb, AlertTriangle, AlertOctagon, HelpCircle, Sliders } from 'lucide-react';
import { OPENING_DETAILS_DB } from '../utils/openingsData';

// Helper to return icon and color for move classifications
const CLASSIFICATION_CONFIG = {
  'Best Move':  { icon: <Star size={10} fill="var(--color-brand-primary)" />, color: 'var(--color-brand-primary)', bg: 'rgba(212, 175, 55, 0.08)' },
  'Excellent':  { icon: <CheckCircleIcon color="#48bb78" />, color: '#48bb78', bg: 'rgba(72, 187, 120, 0.08)' },
  'Good':       { icon: <CheckCircleIcon color="#a0aec0" />, color: '#a0aec0', bg: 'rgba(160, 174, 192, 0.08)' },
  'Inaccuracy': { icon: <AlertTriangle size={10} color="#ecc94b" />, color: '#ecc94b', bg: 'rgba(236, 201, 75, 0.08)' },
  'Mistake':    { icon: <AlertTriangle size={10} color="#ed8936" />, color: '#ed8936', bg: 'rgba(237, 137, 54, 0.08)' },
  'Blunder':    { icon: <AlertOctagon size={10} color="#f56565" />, color: '#f56565', bg: 'rgba(245, 101, 101, 0.08)' }
};

function CheckCircleIcon({ color }) {
  return <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }} />;
}

export default function MoveHistory({
  gameHistory,
  openingName,
  ecoCode,
  previewIndex,
  setPreviewIndex,
  modeSelected,
  onOpenExplorer,
}) {
  const [showOpeningPopup, setShowOpeningPopup] = useState(false);

  // Group history into moves pairs: [ [WhiteMove, BlackMove], ... ]
  const groupedMoves = [];
  for (let i = 0; i < gameHistory.length; i += 2) {
    groupedMoves.push([gameHistory[i], gameHistory[i + 1]]);
  }

  // Navigation handlers
  const handlePrev = () => {
    if (gameHistory.length === 0) return;
    if (previewIndex === null) {
      setPreviewIndex(gameHistory.length - 1);
    } else if (previewIndex > 0) {
      setPreviewIndex(previewIndex - 1);
    }
  };

  const handleNext = () => {
    if (previewIndex === null) return;
    if (previewIndex === gameHistory.length - 1) {
      setPreviewIndex(null); // Return to live game
    } else {
      setPreviewIndex(previewIndex + 1);
    }
  };

  const handleSelect = (idx) => {
    if (idx === gameHistory.length - 1) {
      setPreviewIndex(null);
    } else {
      setPreviewIndex(idx);
    }
  };

  // Find opening metadata
  const openingMeta = OPENING_DETAILS_DB[ecoCode];

  // Use onOpenExplorer if provided (AnalysisPage), else local popup
  const handleOpenExplorer = onOpenExplorer || (() => setShowOpeningPopup(true));

  return (
    <div style={styles.historyCard}>
      
      {/* Opening Header */}
      <div style={styles.openingHeader}>
        <div style={styles.openingTextContainer}>
          <div style={styles.openingLabel}>Detected Opening</div>
          <div style={styles.openingName} title={openingName}>{openingName}</div>
        </div>
        <div style={styles.ecoBadge}>{ecoCode}</div>
      </div>

      {openingMeta && (
        <button 
          onClick={handleOpenExplorer}
          style={styles.exploreBtn}
          className="btn-bronze"
        >
          <BookOpen size={12} />
          <span>View Opening Plans & Traps</span>
        </button>
      )}

      {/* Moves grid list */}
      <div style={styles.scrollWrapper} className="scroll-panel move-history-scroll-panel">
        {gameHistory.length === 0 ? (
          <div style={styles.emptyState}>
            <Sliders size={20} style={{ color: 'var(--color-text-dim)', marginBottom: '8px' }} />
            <div style={styles.emptyTitle}>Awaiting Moves</div>
            <div style={styles.emptyText}>Algebraic moves and engine evaluations will display here once the match begins.</div>
          </div>
        ) : (
          <div style={styles.movesGrid}>
            {groupedMoves.map((pair, idx) => {
              const wIdx = idx * 2;
              const bIdx = idx * 2 + 1;

              const isWSelected = previewIndex === wIdx;
              const isBSelected = previewIndex === bIdx;

              const wClass = pair[0]?.classification || 'Good';
              const bClass = pair[1]?.classification || 'Good';

              const wCfg = CLASSIFICATION_CONFIG[wClass] || CLASSIFICATION_CONFIG['Good'];
              const bCfg = CLASSIFICATION_CONFIG[bClass] || CLASSIFICATION_CONFIG['Good'];

              return (
                <div key={idx} style={styles.gridRow}>
                  <span style={styles.moveNum}>{idx + 1}.</span>
                  
                  {/* White Move */}
                  <div 
                    onClick={() => handleSelect(wIdx)}
                    style={{
                      ...styles.moveCell,
                      backgroundColor: isWSelected ? 'var(--color-bg-elevated)' : 'transparent',
                      color: isWSelected ? 'var(--color-brand-primary)' : 'var(--color-text-primary)'
                    }}
                  >
                    <span style={styles.sanText}>{pair[0].san}</span>
                    {modeSelected !== 'local' && (
                      <span 
                        style={{ ...styles.classBadge, backgroundColor: wCfg.bg, color: wCfg.color }}
                        title={wClass}
                      >
                        {wCfg.icon}
                      </span>
                    )}
                  </div>

                  {/* Black Move */}
                  {pair[1] ? (
                    <div 
                      onClick={() => handleSelect(bIdx)}
                      style={{
                        ...styles.moveCell,
                        backgroundColor: isBSelected ? 'var(--color-bg-elevated)' : 'transparent',
                        color: isBSelected ? 'var(--color-brand-primary)' : 'var(--color-text-primary)'
                      }}
                    >
                      <span style={styles.sanText}>{pair[1].san}</span>
                      {modeSelected !== 'local' && (
                        <span 
                          style={{ ...styles.classBadge, backgroundColor: bCfg.bg, color: bCfg.color }}
                          title={bClass}
                        >
                          {bCfg.icon}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div style={styles.moveCellEmpty} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Timeline Controls */}
      <div style={styles.navRow}>
        <button 
          onClick={handlePrev} 
          style={styles.navBtn} 
          disabled={gameHistory.length === 0 || previewIndex === 0}
        >
          <ChevronLeft size={16} />
        </button>
        
        <button 
          onClick={() => setPreviewIndex(null)}
          style={{
            ...styles.navTextBtn,
            color: previewIndex === null ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
          }}
          disabled={previewIndex === null}
        >
          Live Position
        </button>

        <button 
          onClick={handleNext} 
          style={styles.navBtn} 
          disabled={previewIndex === null}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Opening Strategy plans / Traps popup */}
      {showOpeningPopup && openingMeta && (
        <div style={styles.popupOverlay} onClick={() => setShowOpeningPopup(false)}>
          <div style={styles.popupCard} className="panel-card" onClick={e => e.stopPropagation()}>
            <div style={styles.popupTitle}>{openingMeta.name} ({openingMeta.eco})</div>
            <div style={styles.popupSubtitle}>Main Line: {openingMeta.mainLine}</div>

            <div style={styles.popupBody} className="scroll-panel">
              {/* Typical Plans */}
              <div style={styles.sectionHeader}>Strategic Objectives</div>
              <ul style={styles.planList}>
                {openingMeta.plans.map((p, idx) => <li key={idx} style={styles.planItem}>{p}</li>)}
              </ul>

              {/* Famous Players */}
              <div style={styles.sectionHeader}>Famous Practitioners</div>
              <div style={styles.playersList}>
                {openingMeta.players.join(', ')}
              </div>

              {/* Traps */}
              {openingMeta.traps && openingMeta.traps.length > 0 && (
                <>
                  <div style={styles.sectionHeader}>Tactical Traps</div>
                  <div style={styles.trapsContainer}>
                    {openingMeta.traps.map((trap, idx) => (
                      <div key={idx} style={styles.trapCard}>
                        <div style={styles.trapName}>{trap.name}</div>
                        <div style={styles.trapMoves}>{trap.moves}</div>
                        <div style={styles.trapDesc}>{trap.description}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={() => setShowOpeningPopup(false)}
              style={styles.closePopupBtn}
              className="btn-gold"
            >
              Close Explorer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  historyCard: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  },
  openingHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '10px',
    borderBottom: '1px solid var(--color-border-subtle)',
    marginBottom: '8px',
  },
  openingTextContainer: {
    minWidth: 0,
  },
  openingLabel: {
    fontSize: '9px',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  openingName: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--color-brand-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ecoBadge: {
    fontSize: '10px',
    fontWeight: '800',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    color: 'var(--color-text-secondary)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  exploreBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '6px',
    fontSize: '10px',
    fontWeight: '700',
    marginBottom: '10px',
  },
  scrollWrapper: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    backgroundColor: 'rgba(21, 16, 12, 0.4)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
    padding: '8px',
    marginBottom: '8px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--color-border-default) transparent',
  },
  movesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  gridRow: {
    display: 'grid',
    gridTemplateColumns: '30px 1fr 1fr',
    alignItems: 'center',
    height: '24px',
    fontSize: '12px',
  },
  moveNum: {
    color: 'var(--color-text-dim)',
    fontWeight: '600',
    fontSize: '11px',
  },
  moveCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px',
    height: '100%',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.1s ease',
  },
  moveCellEmpty: {
    height: '100%',
  },
  sanText: {
    fontWeight: '600',
  },
  classBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '14px',
    height: '14px',
    borderRadius: '3px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '20px 10px',
    color: 'var(--color-text-dim)',
    fontSize: '12px',
  },
  navRow: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  navBtn: {
    flex: 1,
    height: '32px',
    backgroundColor: 'var(--color-bg-elevated)',
    border: 'none',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
  },
  navBtnEnabled: {
    ':hover': { backgroundColor: 'var(--color-border-default)' }
  },
  navTextBtn: {
    flex: 2,
    height: '32px',
    backgroundColor: 'var(--color-bg-base)',
    border: 'none',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    borderLeft: '1px solid var(--color-border-subtle)',
    borderRight: '1px solid var(--color-border-subtle)',
  },
  popupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  popupCard: {
    width: '100%',
    maxWidth: '480px',
    maxHeight: '80vh',
    padding: '25px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    border: '1px solid var(--color-border-bright)',
  },
  popupTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
  },
  popupSubtitle: {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    fontStyle: 'italic',
    marginTop: '-8px',
  },
  popupBody: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingRight: '4px',
  },
  sectionHeader: {
    fontFamily: 'var(--font-display)',
    fontSize: '12px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    borderBottom: '1px solid var(--color-border-subtle)',
    paddingBottom: '3px',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  planList: {
    paddingLeft: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  planItem: {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.4',
  },
  playersList: {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    fontWeight: '500',
  },
  trapsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  trapCard: {
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-subtle)',
    padding: '8px 12px',
    borderRadius: '4px',
  },
  trapName: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--color-brand-bronze)',
  },
  trapMoves: {
    fontFamily: 'monospace',
    fontSize: '10px',
    color: 'var(--color-text-dim)',
    margin: '3px 0',
  },
  trapDesc: {
    fontSize: '11px',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.3',
  },
  closePopupBtn: {
    padding: '10px',
    fontSize: '12px',
  },
  emptyState: {
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    height: '100%',
    color: 'var(--color-text-dim)',
  },
  emptyTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    marginBottom: '4px',
  },
  emptyText: {
    fontSize: '11px',
    color: 'var(--color-text-dim)',
    lineHeight: '1.4',
    maxWidth: '220px',
  }
};
