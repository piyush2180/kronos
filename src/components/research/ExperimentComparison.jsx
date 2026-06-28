import React, { useState } from 'react';
import { ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import EmptyState from './EmptyState';

export default function ExperimentComparison({ experiments = [] }) {
  const [expA, setExpA] = useState(experiments[0] || null);
  const [expB, setExpB] = useState(experiments[1] || experiments[0] || null);

  if (experiments.length < 2) {
    return <EmptyState title="Insufficient Experiments for Comparison" message="At least two benchmark run packages are required to execute side-by-side delta analysis." />;
  }

  const currentA = expA || experiments[0];
  const currentB = expB || experiments[1] || experiments[0];

  const metrics = [
    { label: 'Tournament Games', valA: `${currentA.games || currentA.stats?.totalGames || 0} games`, valB: `${currentB.games || currentB.stats?.totalGames || 0} games`, delta: `${(currentA.games || 0) - (currentB.games || 0)}` },
    { label: 'Score Percentage', valA: `${currentA.stats?.scorePct?.toFixed(1) || 0}%`, valB: `${currentB.stats?.scorePct?.toFixed(1) || 0}%`, delta: `${((currentA.stats?.scorePct || 0) - (currentB.stats?.scorePct || 0)).toFixed(1)}%` },
    { label: 'Pairwise Elo Difference', valA: `+${currentA.stats?.eloDiff?.toFixed(1) || 0} Elo`, valB: `+${currentB.stats?.eloDiff?.toFixed(1) || 0} Elo`, delta: `${((currentA.stats?.eloDiff || 0) - (currentB.stats?.eloDiff || 0)).toFixed(1)} Elo` },
    { label: 'Engine A Throughput (NPS)', valA: `${currentA.telemetryA?.nodesPerSecond?.toLocaleString() || 0} NPS`, valB: `${currentB.telemetryA?.nodesPerSecond?.toLocaleString() || 0} NPS`, delta: `${((currentA.telemetryA?.nodesPerSecond || 0) - (currentB.telemetryA?.nodesPerSecond || 0)).toLocaleString()} NPS` },
    { label: 'Average Branching Factor', valA: `${currentA.telemetryA?.branchingFactor?.toFixed(2) || 0}`, valB: `${currentB.telemetryA?.branchingFactor?.toFixed(2) || 0}`, delta: `${((currentA.telemetryA?.branchingFactor || 0) - (currentB.telemetryA?.branchingFactor || 0)).toFixed(2)}` },
    { label: 'Nodes Searched', valA: `${currentA.telemetryA?.nodesSearched?.toLocaleString() || 0}`, valB: `${currentB.telemetryA?.nodesSearched?.toLocaleString() || 0}`, delta: `${((currentA.telemetryA?.nodesSearched || 0) - (currentB.telemetryA?.nodesSearched || 0)).toLocaleString()}` },
    { label: 'Certification Status', valA: currentA.certification || 'N/A', valB: currentB.certification || 'N/A', delta: '-' }
  ];

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <h2 style={styles.title}>Side-by-Side Experiment Delta Comparator</h2>
        <p style={styles.sub}>Compare telemetry deltas, configuration checksums, and empirical win ratios between completed experiment packages.</p>
      </div>

      <div style={styles.selectorRow}>
        <div style={styles.selectBox}>
          <label style={styles.label}>Baseline Experiment (A):</label>
          <select style={styles.select} value={currentA.id} onChange={(e) => setExpA(experiments.find(x => x.id === e.target.value))}>
            {experiments.map(x => <option key={x.id} value={x.id}>{x.name} ({x.id.slice(0, 12)})</option>)}
          </select>
        </div>
        <div style={styles.selectBox}>
          <label style={styles.label}>Comparison Experiment (B):</label>
          <select style={styles.select} value={currentB.id} onChange={(e) => setExpB(experiments.find(x => x.id === e.target.value))}>
            {experiments.map(x => <option key={x.id} value={x.id}>{x.name} ({x.id.slice(0, 12)})</option>)}
          </select>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Metric / Parameter</th>
              <th style={styles.th}>{currentA.name}</th>
              <th style={styles.th}>{currentB.name}</th>
              <th style={styles.th}>Calculated Delta (A - B)</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, idx) => (
              <tr key={idx} style={styles.tr}>
                <td style={styles.tdBold}>{m.label}</td>
                <td style={styles.td}>{m.valA}</td>
                <td style={styles.td}>{m.valB}</td>
                <td style={styles.tdHighlight}>{m.delta}</td>
              </tr>
            ))}
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
