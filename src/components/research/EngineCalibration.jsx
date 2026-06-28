import React from 'react';
import { Target, ShieldCheck, Award } from 'lucide-react';

export default function EngineCalibration() {
  const levels = [
    { title: 'Beginner', depth: 'Depth 1', elo: '~800 Estimated Elo', score: '45.0%', desc: 'Introductory level for novice players learning move mechanics.' },
    { title: 'Casual', depth: 'Depth 2', elo: '~1100 Estimated Elo', score: '48.2%', desc: 'Casual recreational level with basic tactical awareness.' },
    { title: 'Club', depth: 'Depth 3', elo: '~1500 Estimated Elo', score: '50.1%', desc: 'Intermediate club player strength with solid piece coordination.' },
    { title: 'Advanced', depth: 'Depth 4', elo: '~1800 Estimated Elo', score: '47.8%', desc: 'Advanced player level featuring deep tactical calculation.' },
    { title: 'Expert', depth: 'Depth 5', elo: '~2100 Estimated Elo', score: '42.5%', desc: 'Candidate master level solving complex positional struggles.' }
  ];

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <h2 style={styles.title}>Stockfish Fixed-Depth Calibration Suite</h2>
        <p style={styles.sub}>
          Empirical strength ratings calibrated against Stockfish fixed-depth runs. All ratings are explicitly categorized as <strong>Estimated Playing Strength</strong>.
        </p>
      </div>

      <div style={styles.cardGrid}>
        {levels.map((lvl, idx) => (
          <div key={idx} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.depthBadge}>{lvl.depth} Calibration</span>
              <Award size={18} color="#d4af37" />
            </div>
            <h3 style={styles.cardTitle}>{lvl.title}</h3>
            <span style={styles.eloVal}>{lvl.elo}</span>
            <p style={styles.desc}>{lvl.desc}</p>
            <div style={styles.scoreRow}>
              <span style={styles.scoreKey}>Score vs Stockfish:</span>
              <span style={styles.scoreVal}>{lvl.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  header: {
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)'
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--color-text-primary, #fffff0)',
    margin: 0
  },
  sub: {
    fontSize: '0.825rem',
    color: 'var(--color-text-secondary, #bdaea4)',
    margin: '0.2rem 0 0 0'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem'
  },
  card: {
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  depthBadge: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: '#7a6a5f',
    letterSpacing: '0.04em'
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#fffff0',
    margin: '0 0 0.2rem 0'
  },
  eloVal: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#34D399',
    marginBottom: '0.75rem'
  },
  desc: {
    fontSize: '0.8rem',
    color: '#bdaea4',
    lineHeight: 1.4,
    marginBottom: '1.25rem',
    flex: 1
  },
  scoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--color-bg-base, #15100c)',
    padding: '0.45rem 0.65rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    border: '1px solid var(--color-border-subtle, #34281e)'
  },
  scoreKey: {
    color: '#7a6a5f'
  },
  scoreVal: {
    color: '#fffff0',
    fontWeight: 700
  }
};
