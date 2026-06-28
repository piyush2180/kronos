import React from 'react';
import { Database, Terminal, FileText, ExternalLink } from 'lucide-react';

export default function EmptyState({ title = "No benchmark datasets found", message = "Generate empirical experiment packages using the standalone Node.js benchmarking framework." }) {
  return (
    <div style={styles.container}>
      <div style={styles.iconBox}>
        <Database size={28} color="#a67c52" />
      </div>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.message}>{message}</p>

      <div style={styles.cliBox}>
        <div style={styles.cliHeader}>
          <Terminal size={12} color="#d4af37" />
          <span>Execute CLI Benchmark Pipeline</span>
        </div>
        <code style={styles.code}>npm run benchmark -- --games 20 --depth 3 --seed 42</code>
      </div>

      <div style={styles.instructions}>
        <span>Experiment output artifacts will be saved to <code>benchmark/output/</code> and automatically discovered by this dashboard.</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '10px',
    padding: '2.5rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    margin: '1rem 0'
  },
  iconBox: {
    backgroundColor: 'rgba(166, 124, 82, 0.1)',
    padding: '0.85rem',
    borderRadius: '50%',
    marginBottom: '1rem'
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'var(--color-text-primary, #fffff0)',
    margin: '0 0 0.4rem 0'
  },
  message: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary, #bdaea4)',
    maxWidth: '460px',
    lineHeight: 1.5,
    marginBottom: '1.5rem'
  },
  cliBox: {
    backgroundColor: 'var(--color-bg-base, #15100c)',
    border: '1px solid var(--color-border-subtle, #34281e)',
    borderRadius: '6px',
    padding: '0.85rem 1.25rem',
    textAlign: 'left',
    marginBottom: '1rem',
    width: '100%',
    maxWidth: '480px'
  },
  cliHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#7a6a5f',
    marginBottom: '0.4rem',
    letterSpacing: '0.04em'
  },
  code: {
    color: '#34D399',
    fontFamily: 'monospace',
    fontSize: '0.825rem'
  },
  instructions: {
    fontSize: '0.75rem',
    color: '#7a6a5f'
  }
};
