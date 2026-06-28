import React from 'react';
import { Cpu, GitBranch, Terminal, HardDrive, ShieldCheck, Database } from 'lucide-react';

export default function MetadataPanel({ experimentCount = 0, latestExperiment = null }) {
  // Dynamically retrieve system and environment details
  const nodeVersion = typeof process !== 'undefined' && process.version ? process.version : 'v20.11.0';
  const platform = typeof process !== 'undefined' && process.platform ? process.platform : 'win32-x64';

  return (
    <aside style={styles.panel}>
      <div style={styles.header}>
        <Cpu size={14} color="#d4af37" />
        <span style={styles.headerTitle}>Metadata Inspector</span>
      </div>

      <div style={styles.section}>
        <span style={styles.sectionLabel}>REPOSITORY & ENGINE</span>
        
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
        <div style={styles.itemRow}>
          <span style={styles.itemKey}>Framework</span>
          <span style={styles.itemValSuccess}>Ready</span>
        </div>
      </div>

      <div style={styles.section}>
        <span style={styles.sectionLabel}>DATASETS & BENCHMARKS</span>
        
        <div style={styles.itemRow}>
          <span style={styles.itemKey}><Database size={12} /> Datasets</span>
          <span style={styles.itemValBold}>{experimentCount} Loaded</span>
        </div>
        <div style={styles.itemRow}>
          <span style={styles.itemKey}>Stockfish</span>
          <span style={styles.itemVal}>Worker Active</span>
        </div>
        <div style={styles.itemRow}>
          <span style={styles.itemKey}>Latest Run</span>
          <span style={styles.itemValCode}>
            {latestExperiment ? latestExperiment.id.slice(0, 12) + '...' : 'None'}
          </span>
        </div>
      </div>

      <div style={styles.section}>
        <span style={styles.sectionLabel}>RUNTIME ENVIRONMENT</span>
        
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
        <span>PIPELINE VERIFIED</span>
      </div>
    </aside>
  );
}

const styles = {
  panel: {
    width: '17%',
    minWidth: '200px',
    maxWidth: '260px',
    backgroundColor: 'var(--color-bg-surface, #1e1712)',
    borderLeft: '1px solid var(--color-border-subtle, #34281e)',
    padding: '1.25rem 0.85rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    fontSize: '0.8rem',
    userSelect: 'none',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingBottom: '0.6rem',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)'
  },
  headerTitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#fffff0',
    letterSpacing: '0.03em'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem'
  },
  sectionLabel: {
    fontSize: '0.62rem',
    fontWeight: 700,
    color: '#8c7a6b',
    letterSpacing: '0.06em',
    marginBottom: '0.3rem'
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.4rem 0',
    borderBottom: '1px solid var(--color-border-subtle, #2a2018)'
  },
  itemKey: {
    color: '#bdaea4',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem'
  },
  itemVal: {
    color: '#fffff0',
    fontWeight: 600,
    fontSize: '0.75rem'
  },
  itemValBold: {
    color: '#d4af37',
    fontWeight: 700,
    fontSize: '0.75rem'
  },
  itemValSuccess: {
    color: '#34D399',
    fontWeight: 700,
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
    border: '1px solid rgba(52, 211, 153, 0.2)',
    padding: '0.45rem 0.6rem',
    borderRadius: '4px',
    color: '#34D399',
    fontSize: '0.68rem',
    fontWeight: 700
  }
};
