import React from 'react';
import { Target, Eye, Lightbulb, BookOpen, ChevronLeft } from 'lucide-react';

export default function AboutPage({ onBack }) {
  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn} className="btn-secondary">
          <ChevronLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
        <h1 style={styles.title}>About Kronos Chess</h1>
        <p style={styles.subtitle}>
          Kronos Chess is a premium, high-performance web chess platform designed for training, analysis, and play.
        </p>
      </div>

      <div style={styles.divider} />

      <div style={styles.grid}>
        <div style={styles.card} className="panel-card">
          <div style={{ ...styles.iconContainer, backgroundColor: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.2)' }}>
            <Target size={24} color="#d4af37" />
          </div>
          <h3 style={styles.cardTitle}>Local Minimax Engine</h3>
          <p style={styles.cardText}>
            Play against a custom local chess engine running in a Web Worker, utilizing alpha-beta pruning, quiescence search, and transposition tables. Designed to deliver a smooth and responsive playing experience right in your browser.
          </p>
        </div>

        <div style={styles.card} className="panel-card">
          <div style={{ ...styles.iconContainer, backgroundColor: 'rgba(90,159,212,0.08)', borderColor: 'rgba(90,159,212,0.2)' }}>
            <Eye size={24} color="#5a9fd4" />
          </div>
          <h3 style={styles.cardTitle}>Stockfish Integration</h3>
          <p style={styles.cardText}>
            Real-time position analysis and evaluation bar powered by a main-thread loaded Stockfish web worker instance. Instantly evaluate lines, find best replies, and review your tactical accuracy after every game.
          </p>
        </div>

        <div style={styles.card} className="panel-card">
          <div style={{ ...styles.iconContainer, backgroundColor: 'rgba(246,173,85,0.08)', borderColor: 'rgba(246,173,85,0.2)' }}>
            <Lightbulb size={24} color="#f6ad55" />
          </div>
          <h3 style={styles.cardTitle}>Lichess Puzzles Database</h3>
          <p style={styles.cardText}>
            Solve over 4,800+ tactical checkmate and middle-game puzzles curated from the official Lichess puzzles database, completely verified via <code>chess.js</code>. Sorted by rating bands to help sharpen your strategic vision at any level.
          </p>
        </div>

        <div style={styles.card} className="panel-card">
          <div style={{ ...styles.iconContainer, backgroundColor: 'rgba(252,129,129,0.08)', borderColor: 'rgba(252,129,129,0.2)' }}>
            <BookOpen size={24} color="#fc8181" />
          </div>
          <h3 style={styles.cardTitle}>Opening Theory Explorer</h3>
          <p style={styles.cardText}>
            Access real-time details and master strategies for 500+ standard Chess openings. View typical plans, famous experts, and explore mainline move lists interactively using the built-in mini chessboard preview.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.02em',
    marginTop: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
    maxWidth: '600px',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--color-border-subtle)',
    width: '100%',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '20px',
    marginTop: '8px',
  },
  card: {
    padding: '24px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: 'rgba(21, 16, 12, 0.25)',
    border: '1px solid var(--color-border-subtle)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  iconContainer: {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-display)',
  },
  cardText: {
    fontSize: '13px',
    color: 'var(--color-text-dim)',
    lineHeight: '1.6',
  },
};
