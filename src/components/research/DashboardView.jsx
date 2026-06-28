import React from 'react';
import { Activity, ShieldCheck, Cpu, Database, Play, History, ArrowRight } from 'lucide-react';
import EmptyState from './EmptyState';

export default function DashboardView({ experiments = [], onNavigate, onInspect }) {
  if (experiments.length === 0) {
    return <EmptyState />;
  }

  const latest = experiments[0];

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.workstationHeader}>
        <div>
          <span style={styles.badge}>INTERNAL ENGINEERING WORKSTATION</span>
          <h2 style={styles.title}>Developer Dashboard</h2>
          <p style={styles.sub}>Empirical research telemetry and active engine calibration metrics.</p>
        </div>
        <button style={styles.launchBtn} onClick={() => onNavigate('runner')}>
          <Play size={14} />
          <span>Launch Benchmark Runner</span>
        </button>
      </div>

      {/* Top Stat Cards */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Framework Status</span>
          <span style={styles.cardValSuccess}>
            <ShieldCheck size={16} /> Verified
          </span>
          <span style={styles.cardSub}>SPRT Hypothesis Engine Ready</span>
        </div>

        <div style={styles.card}>
          <span style={styles.cardLabel}>Loaded Experiment Datasets</span>
          <span style={styles.cardVal}>{experiments.length} Runs</span>
          <span style={styles.cardSub}>Stored in benchmark/output/</span>
        </div>

        <div style={styles.card}>
          <span style={styles.cardLabel}>Latest Experiment</span>
          <span style={styles.cardValHighlight}>{latest.name}</span>
          <span style={styles.cardSub}>Fixed Depth {latest.depth} | {latest.games} Games</span>
        </div>
      </div>

      {/* Recent Experiments Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Recent Experiment Packages</h3>
          <button style={styles.linkBtn} onClick={() => onNavigate('archive')}>
            View All Archive &rarr;
          </button>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Experiment Name</th>
                <th style={styles.th}>Engine Pair</th>
                <th style={styles.th}>Games</th>
                <th style={styles.th}>Elo Diff</th>
                <th style={styles.th}>Certification</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {experiments.slice(0, 3).map((exp) => (
                <tr key={exp.id} style={styles.tr}>
                  <td style={styles.tdBold}>{exp.name}</td>
                  <td style={styles.td}>{exp.engineA} vs {exp.engineB}</td>
                  <td style={styles.td}>{exp.games}</td>
                  <td style={styles.tdHighlight}>+{exp.stats.eloDiff} Elo</td>
                  <td style={styles.td}>
                    <span style={styles.certBadge(exp.certification)}>{exp.certification}</span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.actionBtn} onClick={() => onInspect(exp)}>Inspect &rarr;</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  workstationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)'
  },
  badge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#d4af37',
    letterSpacing: '0.08em'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--color-text-primary, #fffff0)',
    margin: '0.2rem 0'
  },
  sub: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary, #bdaea4)',
    margin: 0
  },
  launchBtn: {
    backgroundColor: 'var(--color-brand-primary, #d4af37)',
    color: '#15100c',
    border: 'none',
    borderRadius: '6px',
    padding: '0.6rem 1rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem'
  },
  card: {
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column'
  },
  cardLabel: {
    fontSize: '0.7rem',
    color: 'var(--color-text-dim, #7a6a5f)',
    fontWeight: 700,
    marginBottom: '0.4rem'
  },
  cardVal: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--color-text-primary, #fffff0)'
  },
  cardValSuccess: {
    fontSize: '1.3rem',
    fontWeight: 800,
    color: '#34D399',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  cardValHighlight: {
    fontSize: '1.1rem',
    fontWeight: 800,
    color: '#d4af37'
  },
  cardSub: {
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary, #bdaea4)',
    marginTop: '0.4rem'
  },
  section: {
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '8px',
    padding: '1.25rem'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--color-text-primary, #fffff0)',
    margin: 0
  },
  linkBtn: {
    backgroundColor: 'transparent',
    color: '#d4af37',
    border: 'none',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.825rem'
  },
  th: {
    backgroundColor: 'var(--color-bg-base, #15100c)',
    color: 'var(--color-text-dim, #7a6a5f)',
    padding: '0.65rem 0.85rem',
    fontWeight: 600,
    borderBottom: '1px solid var(--color-border-subtle, #34281e)'
  },
  tr: {
    borderBottom: '1px solid var(--color-border-subtle, #34281e)'
  },
  td: {
    padding: '0.75rem 0.85rem',
    color: '#bdaea4'
  },
  tdBold: {
    padding: '0.75rem 0.85rem',
    color: '#fffff0',
    fontWeight: 700
  },
  tdHighlight: {
    padding: '0.75rem 0.85rem',
    color: '#34D399',
    fontWeight: 700
  },
  certBadge: (cert) => ({
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    fontSize: '0.68rem',
    fontWeight: 700,
    backgroundColor: cert === 'RESEARCH READY' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    color: cert === 'RESEARCH READY' ? '#34D399' : '#FCA5A5',
    border: cert === 'RESEARCH READY' ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
  }),
  actionBtn: {
    backgroundColor: 'var(--color-bg-elevated, #2d231b)',
    color: '#d4af37',
    border: '1px solid var(--color-border-subtle, #34281e)',
    padding: '0.3rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer'
  }
};
