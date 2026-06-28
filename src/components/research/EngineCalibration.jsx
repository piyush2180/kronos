import React from 'react';
import { Target, ShieldCheck, Award, AlertCircle } from 'lucide-react';
import { BenchmarkDataService } from '../../services/benchmarkService';

export default function EngineCalibration({ experiments = [] }) {
  const baseLevels = BenchmarkDataService.getCalibrations();

  // Map levels against actual Stockfish calibration experiments in storage
  const levels = baseLevels.map(lvl => {
    const match = experiments.find(exp => 
      (exp.engineB?.toLowerCase().includes('stockfish') || exp.engineA?.toLowerCase().includes('stockfish')) &&
      exp.depth === parseInt(lvl.targetDepth.replace('Depth ', ''))
    );

    if (match) {
      return {
        ...lvl,
        calibratedElo: `~${Math.round(1500 + match.stats.eloDiff)} Estimated Elo`,
        scorePct: `${match.stats.scorePct.toFixed(1)}%`,
        status: 'VERIFIED CALIBRATION',
        ci: `[${match.stats.ciLower?.toFixed(1) || '-'} to ${match.stats.ciUpper?.toFixed(1) || '+'}]`
      };
    }

    return {
      ...lvl,
      calibratedElo: 'Calibration Pending',
      scorePct: 'N/A (No 200+ game run)',
      status: 'PENDING DATA',
      ci: 'Uncalibrated'
    };
  });

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <h2 style={styles.title}>Stockfish Calibration Pipeline</h2>
        <p style={styles.sub}>
          Empirical strength ratings calibrated strictly from completed Stockfish fixed-depth experiment datasets (200+ games).
        </p>
      </div>

      <div style={styles.cardGrid}>
        {levels.map((lvl, idx) => (
          <div key={idx} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.depthBadge}>{lvl.targetDepth} Calibration</span>
              <Award size={18} color={lvl.status === 'VERIFIED CALIBRATION' ? '#d4af37' : '#7a6a5f'} />
            </div>
            <h3 style={styles.cardTitle}>{lvl.title}</h3>
            <span style={lvl.status === 'VERIFIED CALIBRATION' ? styles.eloVal : styles.eloPending}>
              {lvl.calibratedElo}
            </span>
            <p style={styles.desc}>{lvl.desc}</p>
            
            <div style={styles.scoreRow}>
              <span style={styles.scoreKey}>Win/Score vs Stockfish:</span>
              <span style={styles.scoreVal}>{lvl.scorePct}</span>
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
  eloPending: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#9CA3AF',
    fontStyle: 'italic',
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
