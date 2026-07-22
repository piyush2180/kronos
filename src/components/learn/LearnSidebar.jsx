import React from 'react';
import { BookOpen, Cpu, Shield, HelpCircle, Layers, Award, BarChart3, Database, X } from 'lucide-react';

export default function LearnSidebar({ activeSection, setActiveSection, isSidebarOpen, setIsSidebarOpen }) {
  const groups = [
    {
      title: 'Beginner Path',
      items: [
        { id: 'chess-fundamentals', label: 'Chess Fundamentals', icon: BookOpen },
      ],
    },
    {
      title: 'Intermediate Path',
      items: [
        { id: 'engine-fundamentals', label: 'Engine Fundamentals', icon: Cpu },
      ],
    },
    {
      title: 'Advanced Path',
      items: [
        { id: 'engine-advanced', label: 'Advanced Search', icon: Shield },
      ],
    },
    {
      title: 'Research & Telemetry',
      items: [
        { id: 'research-insights', label: 'Research Insights', icon: HelpCircle },
        { id: 'engine-architecture', label: 'Engine Architecture', icon: Layers },
        { id: 'interactive-demos', label: 'Interactive Visuals', icon: Award },
        { id: 'benchmark-explorer', label: 'Benchmark Explorer', icon: BarChart3 },
        { id: 'research-docs', label: 'Research Manifests', icon: Database },
      ],
    },
  ];

  return (
    <aside className={`card-secondary learn-mobile-drawer ${isSidebarOpen ? 'open' : ''}`} style={{ width: '240px', padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0, borderColor: 'rgba(139, 115, 85, 0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem 0.5rem 0.5rem', borderBottom: '1px solid rgba(139, 115, 85, 0.2)' }}>
        <div>
          <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#8D837A', textTransform: 'capitalize' }}>Technical docs</span>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#F4F1EA', margin: '0.1rem 0' }}>Learn & Specs</h3>
        </div>
        <button className="desktop-only" onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: '#B7AEA5', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {groups.map((group) => (
          <div key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: '700', color: 'var(--color-brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.55rem' }}>
              {group.title}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              {group.items.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => { setActiveSection(sec.id); setIsSidebarOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.45rem 0.55rem',
                      borderRadius: '4px',
                      backgroundColor: isActive ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                      color: isActive ? '#F4F1EA' : '#B7AEA5',
                      border: 'none',
                      borderLeft: isActive ? '3px solid #d4af37' : '3px solid transparent',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={14} color={isActive ? '#d4af37' : '#8D837A'} />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
