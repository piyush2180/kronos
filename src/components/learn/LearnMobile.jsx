import React, { useState } from 'react';
import LearnSidebar from './LearnSidebar';
import ChessFundamentals from './ChessFundamentals';
import EngineFundamentals from './EngineFundamentals';
import EngineAdvanced from './EngineAdvanced';
import ResearchInsights from './ResearchInsights';
import EngineArchitecture from './EngineArchitecture';
import InteractiveDemos from './InteractiveDemos';
import BenchmarkExplorer from './BenchmarkExplorer';
import ResearchDocs from './ResearchDocs';
import AlgorithmTable from './AlgorithmTable';
import { Menu, FileCode, Cpu, ShieldCheck } from 'lucide-react';
import { colors } from '../../theme/designTokens';

export default function LearnMobile({
  activeSection,
  setActiveSection,
  inspectedSourceFile,
  handleSelectSource,
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'chess-fundamentals':
        return <ChessFundamentals />;
      case 'engine-fundamentals':
        return <EngineFundamentals onSelectSource={handleSelectSource} />;
      case 'engine-advanced':
        return <EngineAdvanced onSelectSource={handleSelectSource} />;
      case 'research-insights':
        return <ResearchInsights />;
      case 'engine-architecture':
        return <EngineArchitecture onSelectSource={handleSelectSource} />;
      case 'interactive-demos':
        return <InteractiveDemos />;
      case 'benchmark-explorer':
        return <BenchmarkExplorer />;
      case 'research-docs':
        return <ResearchDocs onSelectSource={handleSelectSource} />;
      default:
        return <ChessFundamentals />;
    }
  };

  return (
    <div style={styles.mobileContainer} className="animate-fade-in">
      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div style={styles.overlay} onClick={() => setIsDrawerOpen(false)}>
          <div style={styles.drawerWrapper} onClick={e => e.stopPropagation()}>
            <LearnSidebar
              activeSection={activeSection}
              setActiveSection={(sec) => {
                setActiveSection(sec);
                setIsDrawerOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Mobile Header Bar */}
      <div style={styles.headerBar}>
        <button onClick={() => setIsDrawerOpen(true)} style={styles.tocBtn}>
          <Menu size={16} />
          <span>Table of Contents</span>
        </button>
        <span style={styles.activeLabel}>{activeSection.replace('-', ' ')}</span>
      </div>

      {/* Main Full-Width Documentation Content */}
      <main style={styles.contentStream}>
        {renderContent()}

        {/* Algorithm Table */}
        <div style={styles.tableCard}>
          <AlgorithmTable />
        </div>
      </main>
    </div>
  );
}

const styles = {
  mobileContainer: {
    width: '100%',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxSizing: 'border-box',
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '10px',
    padding: '10px 14px',
  },
  tocBtn: {
    height: '36px',
    padding: '0 12px',
    backgroundColor: 'var(--color-brand-primary)',
    color: '#15100c',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  },
  activeLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  contentStream: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  tableCard: {
    width: '100%',
    overflowX: 'auto',
  },
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 10000,
    display: 'flex',
  },
  drawerWrapper: {
    width: '280px',
    height: '100%',
    backgroundColor: 'var(--color-bg-surface)',
    padding: '16px',
    overflowY: 'auto',
  },
};
