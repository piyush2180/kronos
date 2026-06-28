import React from 'react';
import { ShieldCheck, Cpu, ArrowRight, Lock, Terminal, CheckCircle2 } from 'lucide-react';

export default function AccessScreen({ onEnter }) {
  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.card} className="panel-card">
        <div style={styles.headerBadge}>
          <Lock size={14} color="#d4af37" />
          <span>RESTRICTED ACCESS WORKSPACE</span>
        </div>
        
        <h1 style={styles.title}>Kronos Research Lab</h1>
        <p style={styles.subtitle}>
          Internal engineering environment for maintainers, engine developers, and research collaborators.
        </p>

        <div style={styles.statusGrid}>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Authorization Status</span>
            <span style={styles.statusValueSuccess}>
              <CheckCircle2 size={13} /> Authorized
            </span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Assigned Role</span>
            <span style={styles.statusValue}>Project Owner</span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Workspace Version</span>
            <span style={styles.statusValue}>Research Suite v2</span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Benchmark Pipeline</span>
            <span style={styles.statusValueSuccess}>
              <CheckCircle2 size={13} /> Verified
            </span>
          </div>
        </div>

        <div style={styles.disclaimerBox}>
          <Terminal size={14} color="#a67c52" />
          <span>This workstation contains telemetry tools, SPRT verification routines, and raw empirical dataset inspectors.</span>
        </div>

        <button style={styles.enterBtn} onClick={onEnter}>
          <span>Enter Engineering Workstation</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    backgroundColor: 'var(--color-bg-base, #120e0a)'
  },
  card: {
    width: '100%',
    maxWidth: '540px',
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '12px',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
  },
  headerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    color: '#d4af37',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '20px',
    padding: '0.3rem 0.8rem',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    marginBottom: '1.5rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    color: 'var(--color-text-primary, #fffff0)',
    margin: '0 0 0.5rem 0'
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary, #bdaea4)',
    lineHeight: 1.5,
    marginBottom: '2rem'
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    width: '100%',
    marginBottom: '1.5rem'
  },
  statusItem: {
    backgroundColor: 'var(--color-bg-base, #15100c)',
    border: '1px solid var(--color-border-subtle, #34281e)',
    borderRadius: '8px',
    padding: '0.85rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  statusLabel: {
    fontSize: '0.7rem',
    color: 'var(--color-text-dim, #7a6a5f)',
    fontWeight: 600,
    marginBottom: '0.25rem'
  },
  statusValue: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--color-text-primary, #fffff0)'
  },
  statusValueSuccess: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#34D399',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem'
  },
  disclaimerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    backgroundColor: 'rgba(166, 124, 82, 0.08)',
    border: '1px solid rgba(166, 124, 82, 0.2)',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary, #bdaea4)',
    textAlign: 'left',
    marginBottom: '2rem'
  },
  enterBtn: {
    width: '100%',
    backgroundColor: 'var(--color-brand-primary, #d4af37)',
    color: '#15100c',
    border: 'none',
    borderRadius: '8px',
    padding: '0.9rem',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease'
  }
};
