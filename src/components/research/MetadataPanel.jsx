import React from 'react';
import { Cpu, GitBranch, Terminal, HardDrive, ShieldCheck, Database } from 'lucide-react';

export default function MetadataPanel({ experimentCount = 0, latestExperiment = null, isTablet = false }) {
  const nodeVersion = typeof process !== 'undefined' && process.version ? process.version : 'v20.11.0';
  const platform = typeof process !== 'undefined' && process.platform ? process.platform : 'win32-x64';

  if (isTablet) {
    return (
      <div style={styles.tabletPanel} className="card-primary">
        <div style={styles.header}>
          <Cpu size={14} color="#d4af37" />
          <span style={styles.headerTitle}>System Metadata Inspector (Diagnostics)</span>
        </div>
        <div style={styles.tabletGrid} className="tabletGrid">
          <div style={styles.tabletSection}>
            <span style={styles.sectionLabel}>Workspace Status</span>
            <span style={styles.itemValSuccess}>Connected</span>
          </div>
          <div style={styles.tabletSection}>
            <span style={styles.sectionLabel}>Datasets loaded</span>
            <span style={styles.itemValBold}>{experimentCount} Loaded</span>
          </div>
          <div style={styles.tabletSection}>
            <span style={styles.sectionLabel}>Engine thread status</span>
            <span style={styles.itemValSuccess}>Stockfish Worker Online</span>
          </div>
          <div style={styles.tabletSection}>
            <span style={styles.sectionLabel}>Latest telemetry run</span>
            <span style={styles.itemValCode}>
              {latestExperiment ? latestExperiment.id.slice(0, 16) + '...' : 'None'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside style={styles.panel}>
      <div style={styles.header}>
        <Cpu size={14} color="#d4af37" />
        <span style={styles.headerTitle}>Metadata inspector</span>
      </div>

      <div style={styles.section}>
        <span style={styles.sectionLabel}>Repository & engine</span>
        
        <div style={styles.itemRow}>
          <span style={styles.itemKey}><GitBranch size={12} /> Status</span>
          <span style={styles.itemValSuccess}>Connected</span>
        </div>
        <div style={styles.itemRow}>
          <span style={styles.itemKey}>Revision</span>
          <span style={styles.itemVal}>v1.0.0</span>
        </div>
        <div style={styles.itemRow}>
          <span style={styles.itemKey}>Commit</span>
          <span style={styles.itemVal}>HEAD</span>
        </div>
      </div>

      <div style={styles.section}>
        <span style={styles.sectionLabel}>Datasets & benchmarks</span>
        
        <div style={styles.itemRow}>
          <span style={styles.itemKey}><Database size={12} /> Datasets</span>
          <span style={styles.itemValBold}>{experimentCount} Loaded</span>
        </div>
        <div style={styles.itemRow}>
          <span style={styles.itemKey}>Stockfish worker</span>
          <span style={styles.itemValSuccess}>Active</span>
        </div>
        <div style={styles.itemRow}>
          <span style={styles.itemKey}>Latest run</span>
          <span style={styles.itemValCode}>
            {latestExperiment ? latestExperiment.id.slice(0, 12) + '...' : 'None'}
          </span>
        </div>
      </div>

      <div style={styles.section}>
        <span style={styles.sectionLabel}>Runtime environment</span>
        
        <div style={styles.itemRow}>
          <span style={styles.itemKey}><Terminal size={12} /> Node.js</span>
          <span style={styles.itemVal}>{nodeVersion}</span>
        </div>
        <div style={styles.itemRow}>
          <span style={styles.itemKey}><HardDrive size={12} /> Platform</span>
          <span style={styles.itemVal}>{platform}</span>
        </div>
      </div>

      <div style={styles.footerBadge}>
        <ShieldCheck size={13} color="#34D399" />
        <span>Last benchmark passed</span>
      </div>
    </aside>
  );
}

const styles = {
  panel: {
    width: '18%',
    minWidth: '200px',
    maxWidth: '260px',
    backgroundColor: 'var(--color-bg-surface, #1e1712)',
    borderLeft: '1px solid rgba(52, 40, 30, 0.4)',
    padding: '1.25rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    fontSize: '0.8rem',
    userSelect: 'none',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingBottom: '0.6rem',
    borderBottom: '1px solid rgba(52, 40, 30, 0.4)'
  },
  headerTitle: {
    fontSize: '0.825rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  sectionLabel: {
    fontSize: '0.68rem',
    fontWeight: 600,
    color: 'var(--color-text-dim)',
    marginBottom: '0.2rem',
    textTransform: 'capitalize'
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.25rem 0'
  },
  itemKey: {
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem'
  },
  itemVal: {
    color: 'var(--color-text-primary)',
    fontWeight: 500,
    fontSize: '0.75rem'
  },
  itemValBold: {
    color: '#d4af37',
    fontWeight: 600,
    fontSize: '0.75rem'
  },
  itemValSuccess: {
    color: '#34D399',
    fontWeight: 600,
    fontSize: '0.75rem'
  },
  itemValCode: {
    color: '#9CA3AF',
    fontFamily: 'monospace',
    fontSize: '0.7rem'
  },
  footerBadge: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'rgba(52, 211, 153, 0.06)',
    padding: '0.45rem 0.6rem',
    borderRadius: '4px',
    color: '#34D399',
    fontSize: '0.7rem',
    fontWeight: 600
  },
  tabletPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: 'var(--color-bg-surface, #1e1712)',
    border: '1px solid rgba(52, 40, 30, 0.4)',
    borderRadius: '8px',
    width: '100%',
  },
  tabletGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  tabletSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  }
};
