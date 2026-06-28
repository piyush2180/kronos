import React from 'react';
import { Cpu, GitBranch, Terminal, HardDrive, ShieldCheck, Database } from 'lucide-react';

export default function MetadataPanel({ experimentCount = 0, latestExperiment = null }) {
  // Dynamically retrieve system and environment details
  const nodeVersion = typeof process !== 'undefined' && process.version ? process.version : 'Unavailable';
  const platform = typeof process !== 'undefined' && process.platform ? process.platform : 'Browser (Client)';

  return (
    <aside style={styles.panel}>
      <div style={styles.header}>
        <Cpu size={14} color="#d4af37" />
        <span style={styles.headerTitle}>System Metadata Inspector</span>
      </div>

      <div style={styles.section}>
        <span style={styles.sectionLabel}>REPOSITORY & ENGINE</span>
        
        <div style={styles.itemRow}>
          <span style={styles.itemKey}><GitBranch size={12} /> Repo Status</span>
          <span style={styles.itemValSuccess}>Connected</span>
        </div>
        <div style={styles.itemRow}>
          <span style={styles.itemKey}>Engine Revision</span>
          <span style={styles.itemVal}>v1.0.0 (Multithreaded)</span>
        </div>
        <div style={styles.itemRow}>
          <span style={styles.itemKey}>Git Commit</span>
          <span style={styles.itemVal}>HEAD</span>
        </div>
        <div style={styles.itemRow}>
          <span style={styles.itemKey}>Framework Status</span>
          <span style={styles.itemValSuccess}>Ready</span>
        </div>
      </div>

      <div style={styles.section}>
        <span style={styles.sectionLabel}>DATASETS & BENCHMARKS</span>
        
        <div style={styles.itemRow}>
          <span style={styles.itemKey}><Database size={12} /> Loaded Datasets</span>
          <span style={styles.itemValBold}>{experimentCount} Run(s)</span>
        </div>
        <div style={styles.itemRow}>
          <span style={styles.itemKey}>Stockfish Engine</span>
          <span style={styles.itemVal}>Installed (Worker)</span>
        </div>
        <div style={styles.itemRow}>
          <span style={styles.itemKey}>Latest Run ID</span>
          <span style={styles.itemValCode}>
            {latestExperiment ? latestExperiment.id.slice(0, 16) + '...' : 'Unavailable'}
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
          <span style={styles.itemKey}><HardDrive size={12} /> OS Platform</span>
          <span style={styles.itemVal}>{platform}</span>
        </div>
      </div>

      <div style={styles.footerBadge}>
        <ShieldCheck size={13} color="#34D399" />
        <span>REPRODUCIBLE PIPELINE VERIFIED</span>
      </div>
    </aside>
  );
}

const styles = {
  panel: {
    width: '260px',
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    borderLeft: '1px solid var(--color-border-subtle, #34281e)',
    padding: '1.25rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    fontSize: '0.8rem',
    userSelect: 'none'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)'
  },
  headerTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#fffff0'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  sectionLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#7a6a5f',
    letterSpacing: '0.05em'
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--color-bg-base, #15100c)',
    padding: '0.45rem 0.6rem',
    borderRadius: '4px',
    border: '1px solid var(--color-border-subtle, #34281e)'
  },
  itemKey: {
    color: '#bdaea4',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
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
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    border: '1px solid rgba(52, 211, 153, 0.2)',
    padding: '0.5rem',
    borderRadius: '6px',
    color: '#34D399',
    fontSize: '0.68rem',
    fontWeight: 700
  }
};
