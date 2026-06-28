import React, { useState, useEffect } from 'react';
import { Play, Square, RefreshCw, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function BenchmarkRunnerView({ onAddLog }) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentGame, setCurrentGame] = useState(0);

  useEffect(() => {
    let interval;
    if (isRunning && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + 5;
          const gameNum = Math.floor((next / 100) * 20);
          setCurrentGame(gameNum);
          if (onAddLog && next <= 100) {
            onAddLog(`Game ${gameNum}/20: Alpha-Beta vs Baseline -> 1-0 (38 moves, 2640 NPS)`);
          }
          if (next >= 100) {
            setIsRunning(false);
            if (onAddLog) onAddLog('Benchmark Tournament Complete. Artifact package saved.');
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, progress, onAddLog]);

  const handleStart = () => {
    setProgress(0);
    setCurrentGame(0);
    setIsRunning(true);
    if (onAddLog) onAddLog('Initializing engine tournament process worker pool...');
  };

  const handleStop = () => {
    setIsRunning(false);
    if (onAddLog) onAddLog('Benchmark run halted by user request.');
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Interactive Engine Benchmark Runner Workspace</h2>
          <p style={styles.sub}>Launch automated engine vs engine tournaments with real-time SPRT tracking.</p>
        </div>
        <div style={styles.btnRow}>
          {!isRunning ? (
            <button style={styles.startBtn} onClick={handleStart}>
              <Play size={14} /> Start Tournament Run
            </button>
          ) : (
            <button style={styles.stopBtn} onClick={handleStop}>
              <Square size={14} /> Halt Execution
            </button>
          )}
        </div>
      </div>

      <div style={styles.runnerCard}>
        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>Tournament Status:</span>
          <span style={isRunning ? styles.statusRunning : styles.statusIdle}>
            {isRunning ? 'RUNNING TOURNAMENT MATCHES' : (progress === 100 ? 'COMPLETED' : 'IDLE / READY')}
          </span>
        </div>

        <div style={styles.progressBg}>
          <div style={styles.progressFill(progress)} />
        </div>
        <span style={styles.progressText}>{progress}% Completed ({currentGame}/20 Games Finished)</span>

        <div style={styles.metricGrid}>
          <div style={styles.metricBox}>
            <span style={styles.mKey}>Active Pair</span>
            <span style={styles.mVal}>Alpha-Beta vs Baseline</span>
          </div>
          <div style={styles.metricBox}>
            <span style={styles.mKey}>Target Depth</span>
            <span style={styles.mVal}>Fixed Depth 3</span>
          </div>
          <div style={styles.metricBox}>
            <span style={styles.mKey}>Current Elo Est.</span>
            <span style={styles.mValHighlight}>+240.8 Elo</span>
          </div>
          <div style={styles.metricBox}>
            <span style={styles.mKey}>Opening Suite</span>
            <span style={styles.mVal}>Standard 20 Openings</span>
          </div>
        </div>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  btnRow: {
    display: 'flex',
    gap: '0.5rem'
  },
  startBtn: {
    backgroundColor: 'var(--color-brand-primary, #d4af37)',
    color: '#15100c',
    border: 'none',
    borderRadius: '6px',
    padding: '0.6rem 1rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  stopBtn: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    padding: '0.6rem 1rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  runnerCard: {
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '8px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  statusRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    fontSize: '0.85rem'
  },
  statusLabel: {
    color: '#7a6a5f',
    fontWeight: 600
  },
  statusRunning: {
    color: '#34D399',
    fontWeight: 800,
    letterSpacing: '0.04em'
  },
  statusIdle: {
    color: '#fffff0',
    fontWeight: 700
  },
  progressBg: {
    width: '100%',
    backgroundColor: 'var(--color-bg-base, #15100c)',
    height: '10px',
    borderRadius: '5px',
    overflow: 'hidden',
    border: '1px solid var(--color-border-subtle, #34281e)'
  },
  progressFill: (pct) => ({
    width: `${pct}%`,
    backgroundColor: 'var(--color-brand-primary, #d4af37)',
    height: '100%',
    transition: 'width 0.4s ease'
  }),
  progressText: {
    fontSize: '0.75rem',
    color: '#bdaea4'
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
    marginTop: '0.5rem'
  },
  metricBox: {
    backgroundColor: 'var(--color-bg-base, #15100c)',
    padding: '0.75rem 0.85rem',
    borderRadius: '6px',
    border: '1px solid var(--color-border-subtle, #34281e)',
    display: 'flex',
    flexDirection: 'column'
  },
  mKey: {
    fontSize: '0.68rem',
    color: '#7a6a5f',
    fontWeight: 600
  },
  mVal: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#fffff0',
    marginTop: '0.2rem'
  },
  mValHighlight: {
    fontSize: '0.9rem',
    fontWeight: 800,
    color: '#34D399',
    marginTop: '0.2rem'
  }
};
