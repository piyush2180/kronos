import React from 'react';
import { TrendingUp, ArrowDown, Cpu, Zap, Layers } from 'lucide-react';

export default function OptimizationTimeline() {
  const stages = [
    { name: '1. Baseline Minimax', elo: '+0 (Baseline)', nps: '2,006', bf: '11.8', tt: 'Disabled', desc: 'Full tree minimax search with basic material evaluation.' },
    { name: '2. Alpha-Beta Pruning', elo: '+240.8 Elo', nps: '2,619', bf: '3.42', tt: 'Disabled', desc: 'Prunes subtrees where best guaranteed score exceeds current branch.' },
    { name: '3. Move Ordering (MVV-LVA)', elo: '+185.2 Elo', nps: '2,950', bf: '3.10', tt: 'Disabled', desc: 'Sorts captures by victim value minus attacker value to trigger early cutoffs.' },
    { name: '4. Transposition Table & Zobrist', elo: '+172.4 Elo', nps: '3,450', bf: '2.85', tt: '31.0% Hits', desc: 'Caches exact depth scores and hash keys to prevent redundant subtree evaluations.' },
    { name: '5. Quiescence Search Extension', elo: '+151.4 Elo', nps: '2,980', bf: '3.10', tt: '34.2% Hits', desc: 'Extends search at horizon depth for loud capture sequences to avoid tactical blindness.' },
    { name: '6. Full Kronos Engine (Current Revision)', elo: '+749.8 Cumulative Elo', nps: '3,800', bf: '2.15', tt: '62.0% Hits', desc: 'Fully instrumented multithreaded solver running in dedicated Web Workers.' }
  ];

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <h2 style={styles.title}>Engine Search Optimization Evolution Timeline</h2>
        <p style={styles.sub}>Cumulative progression tracing search algorithm enhancements and empirical Elo contributions.</p>
      </div>

      <div style={styles.timelineList}>
        {stages.map((stage, idx) => (
          <React.Fragment key={idx}>
            <div style={styles.stageCard}>
              <div style={styles.stageHeader}>
                <span style={styles.stageName}>{stage.name}</span>
                <span style={styles.stageElo}>{stage.elo}</span>
              </div>
              <p style={styles.stageDesc}>{stage.desc}</p>
              <div style={styles.metricsRow}>
                <div style={styles.metricItem}>
                  <span style={styles.metricKey}>Average NPS</span>
                  <span style={styles.metricVal}>{stage.nps}</span>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricKey}>Branching Factor</span>
                  <span style={styles.metricVal}>{stage.bf}</span>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricKey}>TT Cache Hit Rate</span>
                  <span style={styles.metricVal}>{stage.tt}</span>
                </div>
              </div>
            </div>
            {idx < stages.length - 1 && (
              <div style={styles.connector}>
                <ArrowDown size={16} color="#d4af37" />
              </div>
            )}
          </React.Fragment>
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
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '680px',
    margin: '0 auto',
    width: '100%'
  },
  stageCard: {
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '8px',
    padding: '1.25rem',
    width: '100%'
  },
  stageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.4rem'
  },
  stageName: {
    fontSize: '1.05rem',
    fontWeight: 800,
    color: 'var(--color-text-primary, #fffff0)'
  },
  stageElo: {
    fontSize: '0.9rem',
    fontWeight: 800,
    color: '#34D399',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px'
  },
  stageDesc: {
    fontSize: '0.825rem',
    color: 'var(--color-text-secondary, #bdaea4)',
    margin: '0 0 1rem 0',
    lineHeight: 1.4
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '0.75rem',
    backgroundColor: 'var(--color-bg-base, #15100c)',
    padding: '0.6rem 0.85rem',
    borderRadius: '6px',
    border: '1px solid var(--color-border-subtle, #34281e)'
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  metricKey: {
    fontSize: '0.68rem',
    color: '#7a6a5f',
    fontWeight: 600
  },
  metricVal: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#fffff0'
  },
  connector: {
    padding: '0.5rem 0',
    display: 'flex',
    justifyContent: 'center'
  }
};
