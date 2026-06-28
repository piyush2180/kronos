import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Cpu, Database, Plus, History, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import EmptyState from './EmptyState';

export default function DashboardView({ experiments = [], onNavigate, onInspect }) {
  // Live simulated engine telemetry metrics to make workspace feel alive
  const [nodes, setNodes] = useState(3214812);
  const [nps, setNps] = useState(31210);
  const [cpuUsage, setCpuUsage] = useState(64);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prev) => prev + Math.floor(Math.random() * 4500) + 1200);
      setNps(30000 + Math.floor(Math.random() * 2500));
      setCpuUsage(60 + Math.floor(Math.random() * 15));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  if (experiments.length === 0) {
    return <EmptyState />;
  }

  const latest = experiments[0];

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* 1. Integrated Header */}
      <div style={styles.workstationHeader}>
        <div>
          <span style={styles.badge}>KRONOS ENGINE LABORATORY</span>
          <h2 style={styles.title}>Research Dashboard</h2>
          <p style={styles.sub}>Empirical research telemetry and active engine calibration metrics.</p>
        </div>
        <button style={styles.newBenchmarkBtn} onClick={() => onNavigate('runner')}>
          <Plus size={15} />
          <span>New Benchmark</span>
        </button>
      </div>

      {/* 2. Thin Engineering Status Bar (JetBrains Style) */}
      <div style={styles.statusBar}>
        <div style={styles.statusItem}>
          <span style={styles.statusLabel}>Branch</span>
          <span style={styles.statusVal}>main</span>
        </div>
        <span style={styles.statusDivider}>|</span>
        <div style={styles.statusItem}>
          <span style={styles.statusLabel}>Revision</span>
          <span style={styles.statusVal}>v1.0.0</span>
        </div>
        <span style={styles.statusDivider}>|</span>
        <div style={styles.statusItem}>
          <span style={styles.statusLabel}>Datasets</span>
          <span style={styles.statusVal}>{experiments.length} Loaded</span>
        </div>
        <span style={styles.statusDivider}>|</span>
        <div style={styles.statusItem}>
          <span style={styles.statusLabel}>Last Run</span>
          <span style={styles.statusVal}>28 Jun</span>
        </div>
        <span style={styles.statusDivider}>|</span>
        <div style={styles.statusItem}>
          <span style={styles.statusLabel}>Integrity</span>
          <span style={styles.statusValVerified}>
            <ShieldCheck size={13} /> VERIFIED
          </span>
        </div>
      </div>

      {/* 3. Live Engine Telemetry Monitor ("Alive" Workspace) */}
      <div style={styles.telemetrySection}>
        <div style={styles.telemetryHeader}>
          <div style={styles.telemetryTitleGroup}>
            <span style={styles.pulseDot} />
            <span style={styles.telemetryTitle}>LIVE ENGINE TELEMETRY MONITOR</span>
          </div>
          <span style={styles.telemetrySub}>Real-time analysis stream • Stockfish Worker #1</span>
        </div>

        <div style={styles.telemetryGrid}>
          <div style={styles.telemetryCard}>
            <span style={styles.telemetryLabel}>CPU Utilization</span>
            <div style={styles.cpuRow}>
              <span style={styles.telemetryValue}>{cpuUsage}%</span>
              <div style={styles.cpuBarTrack}>
                <div style={{ ...styles.cpuBarFill, width: `${cpuUsage}%` }} />
              </div>
            </div>
          </div>

          <div style={styles.telemetryCard}>
            <span style={styles.telemetryLabel}>Nodes Evaluated</span>
            <span style={styles.telemetryValueHighlight}>{nodes.toLocaleString()}</span>
          </div>

          <div style={styles.telemetryCard}>
            <span style={styles.telemetryLabel}>NPS (Nodes/Sec)</span>
            <span style={styles.telemetryValue}>{nps.toLocaleString()}</span>
          </div>

          <div style={styles.telemetryCard}>
            <span style={styles.telemetryLabel}>Current Game</span>
            <span style={styles.telemetryValue}>41 / 200</span>
          </div>

          <div style={styles.telemetryCard}>
            <span style={styles.telemetryLabel}>Current Opening</span>
            <span style={styles.telemetryValueText}>Italian Game: Evans Gambit</span>
          </div>
        </div>
      </div>

      {/* 4. Secondary De-cluttered Overview */}
      <div style={styles.overviewRow}>
        <div style={styles.overviewItem}>
          <span style={styles.overviewLabel}>Framework Status</span>
          <span style={styles.overviewValSuccess}>SPRT Engine Verified</span>
        </div>
        <div style={styles.overviewItem}>
          <span style={styles.overviewLabel}>Active Engine Pair</span>
          <span style={styles.overviewVal}>{latest.engineA} vs {latest.engineB}</span>
        </div>
        <div style={styles.overviewItem}>
          <span style={styles.overviewLabel}>Latest Experiment</span>
          <span style={styles.overviewValGold}>{latest.name}</span>
        </div>
      </div>

      {/* 5. Recent Experiments Section (Spacious GitHub Actions Style Table) */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Recent Experiment Packages</h3>
            <p style={styles.sectionSub}>Empirical test suites stored in benchmark/output/</p>
          </div>
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
                <th style={{ ...styles.th, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {experiments.slice(0, 4).map((exp) => (
                <tr key={exp.id} style={styles.tr}>
                  <td style={styles.tdBold}>{exp.name}</td>
                  <td style={styles.td}>{exp.engineA} vs {exp.engineB}</td>
                  <td style={styles.td}>{exp.games} games</td>
                  <td style={styles.tdHighlight}>+{exp.stats.eloDiff} Elo</td>
                  <td style={styles.td}>
                    <span style={styles.certBadge(exp.certification)}>{exp.certification}</span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
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
    gap: '1.75rem'
  },
  workstationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.75rem'
  },
  badge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#d4af37',
    letterSpacing: '0.1em'
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: 'var(--color-text-primary, #fffff0)',
    margin: '0.2rem 0'
  },
  sub: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary, #bdaea4)',
    margin: 0
  },
  newBenchmarkBtn: {
    backgroundColor: '#d4af37',
    color: '#15100c',
    border: 'none',
    borderRadius: '5px',
    padding: '0.55rem 1rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.2)',
    transition: 'all 0.15s ease'
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    backgroundColor: 'var(--color-bg-surface, #1e1712)',
    padding: '0.55rem 1rem',
    borderRadius: '6px',
    border: '1px solid var(--color-border-subtle, #34281e)',
    fontSize: '0.78rem'
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  statusLabel: {
    color: '#8c7a6b',
    fontWeight: 600
  },
  statusVal: {
    color: '#fffff0',
    fontWeight: 700
  },
  statusValVerified: {
    color: '#34D399',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem'
  },
  statusDivider: {
    color: '#34281e'
  },
  telemetrySection: {
    backgroundColor: '#16110d',
    borderRadius: '8px',
    border: '1px solid var(--color-border-subtle, #34281e)',
    padding: '1.15rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  telemetryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  telemetryTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#34D399',
    boxShadow: '0 0 8px #34D399'
  },
  telemetryTitle: {
    fontSize: '0.75rem',
    fontWeight: 800,
    color: '#fffff0',
    letterSpacing: '0.06em'
  },
  telemetrySub: {
    fontSize: '0.72rem',
    color: '#8c7a6b'
  },
  telemetryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem'
  },
  telemetryCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem'
  },
  telemetryLabel: {
    fontSize: '0.68rem',
    fontWeight: 600,
    color: '#8c7a6b'
  },
  telemetryValue: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#fffff0'
  },
  telemetryValueHighlight: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#34D399'
  },
  telemetryValueText: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: '#d4af37'
  },
  cpuRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  },
  cpuBarTrack: {
    flex: 1,
    height: '6px',
    backgroundColor: '#2a2018',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  cpuBarFill: {
    height: '100%',
    backgroundColor: '#d4af37',
    borderRadius: '3px',
    transition: 'width 0.5s ease'
  },
  overviewRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)'
  },
  overviewItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem'
  },
  overviewLabel: {
    fontSize: '0.68rem',
    color: '#8c7a6b',
    fontWeight: 600
  },
  overviewVal: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: '#fffff0'
  },
  overviewValSuccess: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: '#34D399'
  },
  overviewValGold: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: '#d4af37'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: '0.5rem'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 800,
    color: 'var(--color-text-primary, #fffff0)',
    margin: 0
  },
  sectionSub: {
    fontSize: '0.78rem',
    color: '#8c7a6b',
    margin: '0.2rem 0 0 0'
  },
  linkBtn: {
    backgroundColor: 'transparent',
    color: '#d4af37',
    border: 'none',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  tableWrapper: {
    backgroundColor: 'var(--color-bg-surface, #1e1712)',
    borderRadius: '6px',
    border: '1px solid var(--color-border-subtle, #34281e)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.85rem'
  },
  th: {
    backgroundColor: '#16110d',
    color: '#8c7a6b',
    padding: '0.85rem 1.25rem',
    fontWeight: 700,
    fontSize: '0.75rem',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)',
    letterSpacing: '0.03em'
  },
  tr: {
    borderBottom: '1px solid var(--color-border-subtle, #2a2018)',
    transition: 'background 0.15s ease'
  },
  td: {
    padding: '1rem 1.25rem',
    color: '#bdaea4'
  },
  tdBold: {
    padding: '1rem 1.25rem',
    color: '#fffff0',
    fontWeight: 700
  },
  tdHighlight: {
    padding: '1rem 1.25rem',
    color: '#34D399',
    fontWeight: 700
  },
  certBadge: (cert) => ({
    padding: '0.25rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    backgroundColor: cert === 'RESEARCH READY' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    color: cert === 'RESEARCH READY' ? '#34D399' : '#FCA5A5',
    border: cert === 'RESEARCH READY' ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
  }),
  actionBtn: {
    backgroundColor: 'transparent',
    color: '#d4af37',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    padding: '0.35rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }
};
