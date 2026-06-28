import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import EmptyState from './EmptyState';

export default function ExperimentComparison({ experiments = [] }) {
  const [expA, setExpA] = useState(experiments[0] || null);
  const [expB, setExpB] = useState(experiments[1] || experiments[0] || null);

  if (experiments.length < 2) {
    return <EmptyState title="Insufficient Experiments for Comparison" message="At least two benchmark run packages are required to execute side-by-side delta analysis." />;
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <h2 style={styles.title}>Side-by-Side Experiment Delta Comparator</h2>
        <p style={styles.sub}>Compare telemetry deltas, configuration checksums, and empirical win ratios.</p>
      </div>

      <div style={styles.selectorRow}>
        <div style={styles.selectBox}>
          <label style={styles.label}>Baseline Experiment (A):</label>
          <select style={styles.select} value={expA.id} onChange={(e) => setExpA(experiments.find(x => x.id === e.target.value))}>
            {experiments.map(x => <option key={x.id} value={x.id}>{x.name} ({x.id.slice(0, 12)})</option>)}
          </select>
        </div>
        <div style={styles.selectBox}>
          <label style={styles.label}>Comparison Experiment (B):</label>
          <select style={styles.select} value={expB.id} onChange={(e) => setExpB(experiments.find(x => x.id === e.target.value))}>
            {experiments.map(x => <option key={x.id} value={x.id}>{x.name} ({x.id.slice(0, 12)})</option>)}
          </select>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Metric / Parameter</th>
              <th style={styles.th}>{expA.name}</th>
              <th style={styles.th}>{expB.name}</th>
              <th style={styles.th}>Calculated Delta</th>
            </tr>
          </thead>
          <tbody>
            <tr style={styles.tr}>
              <td style={styles.tdBold}>Score Percentage</td>
              <td style={styles.td}>{expA.stats.scorePct}%</td>
              <td style={styles.td}>{expB.stats.scorePct}%</td>
              <td style={styles.tdHighlight}>{(expA.stats.scorePct - expB.stats.scorePct).toFixed(1)}%</td>
            </tr>
            <tr style={styles.tr}>
              <td style={styles.tdBold}>Pairwise Elo Difference</td>
              <td style={styles.td}>+{expA.stats.eloDiff} Elo</td>
              <td style={styles.td}>+{expB.stats.eloDiff} Elo</td>
              <td style={styles.tdHighlight}>{(expA.stats.eloDiff - expB.stats.eloDiff).toFixed(1)} Elo</td>
            </tr>
            <tr style={styles.tr}>
              <td style={styles.tdBold}>Engine A Throughput</td>
              <td style={styles.td}>{expA.telemetryA.nps.toLocaleString()} NPS</td>
              <td style={styles.td}>{expB.telemetryA.nps.toLocaleString()} NPS</td>
              <td style={styles.td}>{(expA.telemetryA.nps - expB.telemetryA.nps).toLocaleString()} NPS</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
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
  selectorRow: {
    display: 'flex',
    gap: '1.5rem',
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '8px',
    padding: '1rem'
  },
  selectBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    flex: 1
  },
  label: {
    fontSize: '0.75rem',
    color: '#7a6a5f',
    fontWeight: 600
  },
  select: {
    backgroundColor: 'var(--color-bg-base, #15100c)',
    color: '#fffff0',
    border: '1px solid var(--color-border-subtle, #34281e)',
    padding: '0.5rem',
    borderRadius: '6px',
    fontSize: '0.825rem'
  },
  tableWrapper: {
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '8px',
    overflow: 'hidden'
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
    padding: '0.75rem 1rem',
    fontWeight: 600,
    borderBottom: '1px solid var(--color-border-subtle, #34281e)'
  },
  tr: {
    borderBottom: '1px solid var(--color-border-subtle, #34281e)'
  },
  td: {
    padding: '0.85rem 1rem',
    color: '#bdaea4'
  },
  tdBold: {
    padding: '0.85rem 1rem',
    color: '#fffff0',
    fontWeight: 700
  },
  tdHighlight: {
    padding: '0.85rem 1rem',
    color: '#34D399',
    fontWeight: 700
  }
};
