import React from 'react';
import { Target, Eye, Lightbulb, BookOpen, ChevronLeft } from 'lucide-react';
import { colors, spacing, geometry } from '../theme/designTokens';

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
          Kronos Chess is a web-based chess engine workstation designed for play, analysis, and research.
        </p>
      </div>

      <div style={styles.divider} />

      <div style={styles.grid}>
        <div style={styles.card} className="panel-card">
          <div style={{ ...styles.iconContainer, backgroundColor: 'rgba(200, 159, 61, 0.08)', borderColor: 'rgba(200, 159, 61, 0.2)' }}>
            <Target size={24} color={colors.goldAccent} />
          </div>
          <h3 style={styles.cardTitle}>Local Minimax Engine</h3>
          <p style={styles.cardText}>
            Play against a local chess engine running in a Web Worker, featuring alpha-beta search, quiescence search, and transposition tables for off-thread calculation.
          </p>
        </div>

        <div style={styles.card} className="panel-card">
          <div style={{ ...styles.iconContainer, backgroundColor: 'rgba(75, 175, 122, 0.08)', borderColor: 'rgba(75, 175, 122, 0.2)' }}>
            <Eye size={24} color={colors.success} />
          </div>
          <h3 style={styles.cardTitle}>Stockfish Integration</h3>
          <p style={styles.cardText}>
            Real-time evaluation bar and position analysis powered by Stockfish. Analyze candidate moves and review game accuracy.
          </p>
        </div>

        <div style={styles.card} className="panel-card">
          <div style={{ ...styles.iconContainer, backgroundColor: 'rgba(201, 138, 57, 0.08)', borderColor: 'rgba(201, 138, 57, 0.2)' }}>
            <Lightbulb size={24} color={colors.warning} />
          </div>
          <h3 style={styles.cardTitle}>Lichess Puzzles Database</h3>
          <p style={styles.cardText}>
            Tactical checkmate and middle-game puzzles sourced from the Lichess database, verified via <code>chess.js</code>, and sorted by difficulty bands.
          </p>
        </div>

        <div style={styles.card} className="panel-card">
          <div style={{ ...styles.iconContainer, backgroundColor: 'rgba(196, 93, 93, 0.08)', borderColor: 'rgba(196, 93, 93, 0.2)' }}>
            <BookOpen size={24} color={colors.danger} />
          </div>
          <h3 style={styles.cardTitle}>Opening Theory Explorer</h3>
          <p style={styles.cardText}>
            Explore opening theory for standard chess lines. View typical plans, explore variation trees, and preview moves interactively.
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
    padding: `${spacing.xxl} ${spacing.xl}`,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: geometry.radiusInteractive,
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
    marginTop: spacing.sm,
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: spacing.xl,
    marginTop: spacing.sm,
  },
  card: {
    padding: spacing.xl,
    borderRadius: geometry.radiusCard,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: 'rgba(21, 16, 12, 0.25)',
    border: '1px solid var(--color-border-subtle)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  iconContainer: {
    width: '44px',
    height: '44px',
    borderRadius: geometry.radiusCard,
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
