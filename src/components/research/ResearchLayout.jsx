import React, { useState, useEffect } from 'react';
import ResearchSidebar from './ResearchSidebar';
import MetadataPanel from './MetadataPanel';
import BenchmarkConsole from './BenchmarkConsole';
import { Activity, Archive, Target, TrendingUp, FileText, Settings, ArrowLeft } from 'lucide-react';

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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const [isTablet, setIsTablet] = useState(() => window.innerWidth >= 640 && window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 640);
      setIsTablet(w >= 640 && w <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mobileTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'archive', label: 'Experiments', icon: Archive, activeMatch: ['archive', 'compare', 'runner', 'inspector'] },
    { id: 'calibration', label: 'Calibration', icon: Target, activeMatch: ['calibration', 'validation', 'architecture'] },
    { id: 'timeline', label: 'Optimization', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const isTabActive = (tab) => {
    if (tab.activeMatch) {
      return tab.activeMatch.includes(activeView);
    }
    return activeView === tab.id;
  };

  const handleMobileTabClick = (tabId) => {
    setActiveView(tabId);
  };

  const renderMobileSettings = () => (
    <div style={styles.mobileSettingsContainer} className="animate-fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#d4af37', textTransform: 'capitalize' }}>Kronos engine lab</span>
        <h2 className="heading-page">Workstation Settings</h2>
        <p className="text-subtitle">Manage environment execution parameters and local telemetry databases.</p>
      </div>

      <div className="card-primary" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>VCS Revision</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-brand-primary)', fontFamily: 'monospace', fontWeight: '600' }}>v1.0.0 (main)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>SPRT Test Seed</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-dim)', fontFamily: 'monospace' }}>HEAD (Active)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Datasets Discovered</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', fontWeight: '600' }}>{experimentCount} Packages</span>
        </div>
        
        <div style={{ height: '1px', backgroundColor: 'var(--color-border-subtle)' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Terminal Execution logs</span>
          <button className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.72rem', fontWeight: '700' }} onClick={onClearConsole}>
            Clear Event Logs
          </button>
        </div>
      </div>

      <button className="btn-danger" style={{ width: '100%', justifyContent: 'center', marginTop: '2rem', padding: '10px', fontSize: '0.825rem' }} onClick={onExit}>
        <ArrowLeft size={14} />
        <span>Exit Workstation</span>
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <div style={styles.ideContainer}>
        {/* Top Header Bar */}
        <header style={styles.topBar}>
          <div style={styles.titleGroup}>
            <span style={styles.ideBadge}>KRONOS ENGINEERING WORKSPACE</span>
            <span style={styles.divider}>/</span>
            <span style={styles.currentViewName}>{activeView === 'dashboard' ? 'RESEARCH DASHBOARD' : activeView.toUpperCase()}</span>
          </div>
        </header>

        <main style={{ ...styles.centerWorkspace, padding: '1.25rem 1rem', paddingBottom: '80px', overflowY: 'auto' }}>
          {activeView === 'settings' ? renderMobileSettings() : children}
        </main>

        {/* Bottom Tab Bar */}
        <nav style={styles.mobileTabBar}>
          {mobileTabs.map(tab => {
            const Icon = tab.icon;
            const active = isTabActive(tab);
            return (
              <button
                key={tab.id}
                onClick={() => handleMobileTabClick(tab.id)}
                style={styles.mobileTabButton(active)}
              >
                <Icon size={18} color={active ? 'var(--color-brand-primary)' : 'var(--color-text-dim)'} />
                <span style={{ fontSize: '8px', fontWeight: '700', marginTop: '3px' }}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div style={styles.ideContainer}>
      {/* Top Header Bar */}
      <header style={styles.topBar}>
        <div style={styles.titleGroup}>
          <span style={styles.ideBadge}>KRONOS ENGINEERING WORKSPACE</span>
          <span style={styles.divider}>/</span>
          <span style={styles.currentViewName}>{activeView === 'dashboard' ? 'RESEARCH DASHBOARD' : activeView.toUpperCase()}</span>
        </div>
      </header>
      
      <div style={styles.middleWorkspace}>
        {/* Region 1: Left Engineering Sidebar */}
        <ResearchSidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          onExit={onExit} 
          isTablet={isTablet}
        />

        {/* Region 2: Center Engineering Workspace */}
        <main style={{
          ...styles.centerWorkspace,
          padding: isTablet ? '1.25rem 1.5rem' : '1.75rem 2.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {children}

          {/* Region 3: Bottom System Metadata Inspector (Tablet view only) */}
          {isTablet && (
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
              <MetadataPanel 
                experimentCount={experimentCount} 
                latestExperiment={latestExperiment} 
                isTablet={true}
              />
            </div>
          )}
        </main>

        {/* Region 3: Right System Metadata Inspector (Desktop view only) */}
        {!isTablet && (
          <MetadataPanel 
            experimentCount={experimentCount} 
            latestExperiment={latestExperiment} 
          />
        )}
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
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: 'var(--color-bg-base, #120e0a)',
    color: 'var(--color-text-primary, #fffff0)',
    overflow: 'hidden'
  },
  topBar: {
    height: '36px',
    backgroundColor: 'var(--color-bg-surface, #1e1712)',
    borderBottom: '1px solid rgba(52, 40, 30, 0.4)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 1.25rem',
    userSelect: 'none'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  },
  ideBadge: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#d4af37'
  },
  divider: {
    color: 'var(--color-text-dim)',
    fontSize: '0.8rem'
  },
  currentViewName: {
    fontSize: '0.72rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textTransform: 'capitalize'
  },
  middleWorkspace: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    minHeight: 0
  },
  centerWorkspace: {
    flex: 1,
    minWidth: 0,
    padding: '1.75rem 2.25rem',
    overflowY: 'auto',
    backgroundColor: 'var(--color-bg-base, #120e0a)'
  },
  mobileTabBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: 'var(--color-bg-surface)',
    borderTop: '1px solid var(--color-border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 9999,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
    paddingBottom: 'safe-area-inset-bottom',
  },
  mobileTabButton: (active) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    color: active ? 'var(--color-brand-primary)' : 'var(--color-text-dim)',
    cursor: 'pointer',
    flex: 1,
    height: '100%',
    transition: 'color 0.15s ease',
  }),
  mobileSettingsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    width: '100%',
  }
};
