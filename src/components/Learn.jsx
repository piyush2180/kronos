import React, { useState } from 'react';
import LearnSidebar from './learn/LearnSidebar';
import ChessFundamentals from './learn/ChessFundamentals';
import EngineFundamentals from './learn/EngineFundamentals';
import EngineAdvanced from './learn/EngineAdvanced';
import ResearchInsights from './learn/ResearchInsights';
import EngineArchitecture from './learn/EngineArchitecture';
import InteractiveDemos from './learn/InteractiveDemos';
import BenchmarkExplorer from './learn/BenchmarkExplorer';
import ResearchDocs from './learn/ResearchDocs';
import AlgorithmTable from './learn/AlgorithmTable';
import { FileCode, ShieldCheck, Cpu, Play, Menu, X } from 'lucide-react';
import { colors, spacing, geometry, typography } from '../theme/designTokens';

export default function Learn() {
  const [activeSection, setActiveSection] = useState('chess-fundamentals');
  const [inspectedSourceFile, setInspectedSourceFile] = useState('src/engine/minimax.js');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSelectSource = (filePath) => {
    setInspectedSourceFile(filePath);
  };

  const navigateToResearch = (view) => {
    window.location.hash = `#/research?view=${view}`;
  };

  const renderCenterContent = () => {
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
    <div style={{ display: 'flex', gap: spacing.xl, width: '100%', alignItems: 'flex-start', padding: `${spacing.xl} 0` }} className="animate-fade-in learn-mobile-container">
      {/* Mobile Drawer Overlay */}
      <div 
        className={`learn-drawer-overlay desktop-only ${isSidebarOpen ? 'open' : ''}`}
        style={{ display: isSidebarOpen ? 'block' : 'none' }}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* 1. Left Column: Table of Contents Navigation */}
      <LearnSidebar activeSection={activeSection} setActiveSection={setActiveSection} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* 2. Center Column: Main Interactive Documentation Stream */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
        {/* Mobile menu toggle */}
        <div className="desktop-only" style={{ marginBottom: spacing.md }}>
          <button className="btn-secondary" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={16} />
            <span>Contents</span>
          </button>
        </div>

        {renderCenterContent()}

        {/* Master Algorithm Performance Matrix */}
        <AlgorithmTable />
      </main>

      {/* 3. Right Column: GitBook Quick Specs & Source Inspector */}
      <aside className="card-secondary" style={{ width: '260px', padding: spacing.lg, display: 'flex', flexDirection: 'column', gap: spacing.xl, flexShrink: 0, borderColor: 'var(--color-border-subtle)', borderRadius: geometry.radiusCard }}>
        <div style={{ paddingBottom: spacing.sm, borderBottom: '1px solid var(--color-border-subtle)' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: '600', color: colors.textMuted, textTransform: 'capitalize' }}>Quick Specs</span>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: colors.textPrimary, margin: '0.1rem 0' }}>Documentation Inspector</h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
          <span style={{ fontSize: '0.7rem', color: colors.textMuted, fontWeight: '600' }}>Active Source Reference</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, backgroundColor: 'var(--color-bg-base)', padding: `${spacing.sm} ${spacing.md}`, borderRadius: geometry.radiusInteractive, border: '1px solid var(--color-border-subtle)' }}>
            <FileCode size={14} color={colors.success} />
            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: colors.success, fontWeight: '600', wordBreak: 'break-all' }}>
              {inspectedSourceFile}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
          <span style={{ fontSize: '0.7rem', color: colors.textMuted, fontWeight: '600' }}>Engine System Status</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, fontSize: '0.78rem', color: colors.textSecondary }}>
            <Cpu size={13} color={colors.goldAccent} />
            <span>Multithreaded Stockfish 16 Worker</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, fontSize: '0.78rem', color: colors.success }}>
            <ShieldCheck size={13} color={colors.success} />
            <span>SHA256 Reproducible Pipeline</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, paddingTop: spacing.sm, borderTop: '1px solid var(--color-border-subtle)' }}>
          <span style={{ fontSize: '0.7rem', color: colors.textMuted, fontWeight: '600' }}>Workstation Navigation</span>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', padding: '0.55rem', borderRadius: geometry.radiusInteractive }} onClick={() => navigateToResearch('runner')}>
            <Play size={13} /> Open Benchmark Workspace
          </button>
        </div>
      </aside>
    </div>
  );
}
