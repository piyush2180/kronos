import React from 'react';
import ResearchSidebar from './ResearchSidebar';
import MetadataPanel from './MetadataPanel';
import BenchmarkConsole from './BenchmarkConsole';

export default function ResearchLayout({ 
  activeView, 
  setActiveView, 
  onExit, 
  experimentCount, 
  latestExperiment,
  consoleLogs,
  onClearConsole,
  children 
}) {
  return (
    <div style={styles.ideContainer}>
      {/* Top Header Bar */}
      <header style={styles.topBar}>
        <div style={styles.titleGroup}>
          <span style={styles.ideBadge}>KRONOS RESEARCH LAB v2</span>
          <span style={styles.divider}>/</span>
          <span style={styles.currentViewName}>{activeView.toUpperCase()}</span>
        </div>
      </header>
      
      <div style={styles.middleWorkspace}>
        {/* Region 1: Left Engineering Sidebar */}
        <ResearchSidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          onExit={onExit} 
        />

        {/* Region 2: Center Engineering Workspace */}
        <main style={styles.centerWorkspace}>
          {children}
        </main>

        {/* Region 3: Right System Metadata Inspector */}
        <MetadataPanel 
          experimentCount={experimentCount} 
          latestExperiment={latestExperiment} 
        />
      </div>

      {/* Region 4: Bottom Execution Terminal Console */}
      <BenchmarkConsole 
        logs={consoleLogs} 
        onClear={onClearConsole} 
      />
    </div>
  );
}

const styles = {
  ideContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'var(--color-bg-base, #15100c)',
    color: 'var(--color-text-primary, #fffff0)',
    overflow: 'hidden'
  },
  topBar: {
    height: '38px',
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 1rem',
    userSelect: 'none'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  },
  ideBadge: {
    fontSize: '0.75rem',
    fontWeight: 800,
    color: '#d4af37',
    letterSpacing: '0.06em'
  },
  divider: {
    color: '#7a6a5f',
    fontSize: '0.8rem'
  },
  currentViewName: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#bdaea4'
  },
  middleWorkspace: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },
  centerWorkspace: {
    flex: 1,
    padding: '1.5rem',
    overflowY: 'auto',
    backgroundColor: 'var(--color-bg-base, #15100c)'
  }
};
