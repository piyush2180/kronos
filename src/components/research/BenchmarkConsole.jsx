import React, { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

export default function BenchmarkConsole({ logs = [], onClear }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div style={styles.consoleContainer}>
      <div style={styles.consoleHeader} onClick={() => setIsCollapsed(!isCollapsed)}>
        <div style={styles.headerLeft}>
          <Terminal size={14} color="#d4af37" />
          <span style={styles.consoleTitle}>BENCHMARK EXECUTION CONSOLE</span>
          <span style={styles.logCount}>({logs.length} entries)</span>
        </div>
        
        <div style={styles.headerRight} onClick={(e) => e.stopPropagation()}>
          {onClear && (
            <button style={styles.iconBtn} onClick={onClear} title="Clear Terminal Logs">
              <Trash2 size={13} color="#7a6a5f" />
            </button>
          )}
          <button style={styles.iconBtn} onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronUp size={14} color="#bdaea4" /> : <ChevronDown size={14} color="#bdaea4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div style={styles.consoleBody}>
          {logs.length === 0 ? (
            <div style={styles.emptyLog}>Console idle. Ready for engine tournament benchmark tasks.</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} style={styles.logLine}>
                <span style={styles.logPrompt}>&gt;</span> {log}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  consoleContainer: {
    backgroundColor: '#0E1420',
    borderTop: '1px solid var(--color-border-default, #4c3d31)',
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none'
  },
  consoleHeader: {
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    padding: '0.5rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  consoleTitle: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#fffff0',
    letterSpacing: '0.05em'
  },
  logCount: {
    fontSize: '0.7rem',
    color: '#7a6a5f'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  iconBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.2rem',
    display: 'flex',
    alignItems: 'center'
  },
  consoleBody: {
    height: '130px',
    overflowY: 'auto',
    padding: '0.75rem 1rem',
    fontFamily: 'monospace',
    fontSize: '0.78rem',
    color: '#34D399',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    backgroundColor: '#0B0F19'
  },
  emptyLog: {
    color: '#7a6a5f',
    fontStyle: 'italic'
  },
  logLine: {
    lineHeight: 1.4
  },
  logPrompt: {
    color: '#d4af37',
    marginRight: '0.4rem'
  }
};
