import React, { useState, useRef, useEffect } from 'react';
import { Terminal, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

export default function BenchmarkConsole({ logs = [], onClear }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const bodyRef = useRef(null);

  const defaultLogs = [
    { time: '09:32:14', level: 'SYSTEM', message: 'Initializing Research Workspace...' },
    { time: '09:32:14', level: 'INFO', message: 'Loading benchmark artifacts...' },
    { time: '09:32:15', level: 'INFO', message: '2 experiment datasets discovered in benchmark/output/' },
    { time: '09:32:15', level: 'SUCCESS', message: 'SHA256 reproducible pipeline verified' },
    { time: '09:32:16', level: 'SYSTEM', message: 'Stockfish Worker threads online (multithreaded)' },
    { time: '09:32:16', level: 'SUCCESS', message: 'Engineering suite online. Ready for benchmark execution.' }
  ];

  const activeLogs = logs.length > 0 
    ? logs.map((log, index) => {
        if (typeof log === 'object' && log.message) return log;
        return {
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          level: log.includes('ERROR') ? 'ERROR' : log.includes('SUCCESS') ? 'SUCCESS' : 'INFO',
          message: log
        };
      })
    : defaultLogs;

  useEffect(() => {
    if (bodyRef.current && !isCollapsed) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logs, isCollapsed]);

  const getLevelColor = (level) => {
    switch (level) {
      case 'SUCCESS': return '#34D399';
      case 'ERROR': return '#FCA5A5';
      case 'SYSTEM': return '#d4af37';
      default: return '#9CA3AF';
    }
  };

  return (
    <div style={styles.consoleContainer}>
      <div style={styles.consoleHeader} onClick={() => setIsCollapsed(!isCollapsed)}>
        <div style={styles.headerLeft}>
          <Terminal size={14} color="#d4af37" />
          <span style={styles.consoleTitle}>BENCHMARK EXECUTION TERMINAL</span>
          <span style={styles.logCount}>({activeLogs.length} events)</span>
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
        <div style={styles.consoleBody} ref={bodyRef}>
          {activeLogs.map((item, idx) => (
            <div key={idx} style={styles.logLine}>
              <span style={styles.logTime}>{item.time}</span>
              <span style={{ ...styles.logLevel, color: getLevelColor(item.level) }}>
                [{item.level}]
              </span>
              <span style={styles.logMsg}>{item.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  consoleContainer: {
    backgroundColor: '#0A0D14',
    borderTop: '1px solid var(--color-border-default, #34281e)',
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none'
  },
  consoleHeader: {
    backgroundColor: 'var(--color-bg-surface, #1e1712)',
    padding: '0.45rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  },
  consoleTitle: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#fffff0',
    letterSpacing: '0.06em'
  },
  logCount: {
    fontSize: '0.68rem',
    color: '#8c7a6b'
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
    height: '135px',
    overflowY: 'auto',
    padding: '0.6rem 1rem',
    fontFamily: '"Fira Code", "JetBrains Mono", Menlo, Consolas, monospace',
    fontSize: '0.78rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    backgroundColor: '#080B10'
  },
  logLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    lineHeight: 1.4
  },
  logTime: {
    color: '#6B7280',
    fontSize: '0.72rem'
  },
  logLevel: {
    fontWeight: 700,
    fontSize: '0.7rem',
    width: '65px'
  },
  logMsg: {
    color: '#E5E7EB'
  }
};
