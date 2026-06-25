// Kronos Chess V2 — Opening Book Explorer Panel
// Slide-out panel for exploring chess openings, plans, and historical traps.

import React from 'react';
import { X, Book, Award, Skull, ExternalLink } from 'lucide-react';
import { OPENING_DETAILS_DB } from '../utils/openingsData';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

function getFenForMoves(mainLine) {
  if (!mainLine || mainLine === 'No mainline registered.') {
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }
  try {
    const chess = new Chess();
    // Remove move numbers like "1.", "2.", "1...", etc.
    const cleanLine = mainLine.replace(/\d+\.+/g, ' ');
    const tokens = cleanLine.split(/\s+/).filter(t => t.trim() !== '');
    for (const move of tokens) {
      chess.move(move);
    }
    return chess.fen();
  } catch (err) {
    console.warn('Failed to parse mainline FEN:', err);
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }
}

export default function OpeningExplorer({ openingName, ecoCode, onClose }) {
  const details = OPENING_DETAILS_DB[ecoCode] || {
    name: openingName,
    eco: ecoCode,
    mainLine: 'No mainline registered.',
    plans: ['Control key central squares.', 'Develop minor pieces towards the center.', 'Ensure king safety by castling early.'],
    players: [],
    traps: []
  };

  const lichessUrl = `https://lichess.org/opening/${ecoCode}_${(details.name || openingName).replace(/[^a-zA-Z0-9]/g, '_')}`;
  const wikiUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(details.name || openingName)}`;

  return (
    <div style={styles.explorerWrapper} className="animate-slide-in panel-card">
      
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitleRow}>
          <Book size={16} style={{ color: 'var(--color-brand-primary)' }} />
          <h3 style={styles.headerTitle}>Opening Explorer</h3>
        </div>
        <button onClick={onClose} style={styles.closeBtn} className="close-explorer-btn" title="Close Explorer">
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div style={styles.content} className="scroll-panel">
        
        {/* Name & ECO Section */}
        <div style={styles.metaSection}>
          <span style={styles.ecoBadge}>{details.eco || ecoCode}</span>
          <h2 style={styles.openingName}>{details.name || openingName}</h2>
          {details.mainLine && (
            <div style={styles.mainLineBox}>
              <span style={styles.mainLineLabel}>Moves: </span>
              <span style={styles.mainLineMoves}>{details.mainLine}</span>
            </div>
          )}
          {/* Mini Chessboard Preview */}
          {details.mainLine && details.mainLine !== 'No mainline registered.' && (
            <div style={styles.miniBoardContainer}>
              <Chessboard
                options={{
                  id: 'OpeningExplorerMiniBoard',
                  position: getFenForMoves(details.mainLine),
                  darkSquareStyle: { backgroundColor: '#b58863' },
                  lightSquareStyle: { backgroundColor: '#f0d9b5' },
                  allowDragging: false,
                  animationDurationInMs: 0
                }}
              />
            </div>
          )}
        </div>

        {/* Typical Plans */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>
            <Award size={12} />
            <span>Strategic Plans</span>
          </h4>
          <ul style={styles.list}>
            {details.plans.map((plan, idx) => (
              <li key={idx} style={styles.listItem}>{plan}</li>
            ))}
          </ul>
        </div>

        {/* Famous Players */}
        {details.players && details.players.length > 0 && (
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Key Experts</h4>
            <div style={styles.playersBadgeRow}>
              {details.players.map((p, idx) => (
                <span key={idx} style={styles.playerBadge}>{p}</span>
              ))}
            </div>
          </div>
        )}

        {/* Tactical Traps */}
        {details.traps && details.traps.length > 0 && (
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>
              <Skull size={12} style={{ color: '#f56565' }} />
              <span>Known Traps</span>
            </h4>
            <div style={styles.trapsList}>
              {details.traps.map((trap, idx) => (
                <div key={idx} style={styles.trapCard}>
                  <div style={styles.trapName}>{trap.name}</div>
                  <div style={styles.trapMoves}>{trap.moves}</div>
                  <div style={styles.trapDesc}>{trap.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External Resources */}
        <div style={styles.resourcesSection}>
          <a href={lichessUrl} target="_blank" rel="noopener noreferrer" style={styles.resourceLink} className="explorer-resource-link">
            <span>Study on Lichess</span>
            <ExternalLink size={11} />
          </a>
          <a href={wikiUrl} target="_blank" rel="noopener noreferrer" style={styles.resourceLink} className="explorer-resource-link">
            <span>Wikipedia Article</span>
            <ExternalLink size={11} />
          </a>
        </div>

      </div>

    </div>
  );
}

const styles = {
  explorerWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: 'var(--color-bg-surface)',
    borderLeft: '1px solid var(--color-border-bright)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid var(--color-border-subtle)',
    backgroundColor: 'var(--color-bg-elevated)',
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerTitle: {
    fontSize: '13px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-display)',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  metaSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  miniBoardContainer: {
    width: '220px',
    height: '220px',
    margin: '12px auto 4px auto',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45)',
    border: '1px solid var(--color-border-subtle)',
  },
  ecoBadge: {
    alignSelf: 'flex-start',
    fontSize: '10px',
    fontWeight: '800',
    backgroundColor: 'var(--color-brand-primary)',
    color: '#15100c',
    padding: '2px 6px',
    borderRadius: '3px',
    fontFamily: 'monospace',
  },
  openingName: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-display)',
    lineHeight: '1.3',
  },
  mainLineBox: {
    backgroundColor: 'rgba(21, 16, 12, 0.3)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
    padding: '8px 10px',
    fontSize: '11px',
    fontFamily: 'monospace',
  },
  mainLineLabel: {
    color: 'var(--color-text-dim)',
    fontWeight: '700',
  },
  mainLineMoves: {
    color: 'var(--color-brand-hover)',
    fontWeight: '600',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--color-brand-bronze)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  list: {
    paddingLeft: '16px',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  listItem: {
    fontSize: '11px',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.4',
  },
  playersBadgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  playerBadge: {
    fontSize: '10px',
    fontWeight: '600',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    color: 'var(--color-text-secondary)',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  trapsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  trapCard: {
    backgroundColor: 'rgba(245, 101, 101, 0.04)',
    border: '1px solid rgba(245, 101, 101, 0.15)',
    borderRadius: '4px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  trapName: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#fc8181',
  },
  trapMoves: {
    fontSize: '10px',
    fontFamily: 'monospace',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: '4px 6px',
    borderRadius: '2px',
  },
  trapDesc: {
    fontSize: '10px',
    color: 'var(--color-text-dim)',
    lineHeight: '1.4',
  },
  resourcesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '1px solid var(--color-border-subtle)',
  },
  resourceLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    color: 'var(--color-text-secondary)',
    fontSize: '11px',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  }
};
