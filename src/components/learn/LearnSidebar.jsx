import React from 'react';
import { BookOpen, Cpu, Layers, GitBranch, TrendingUp, Activity, Database } from 'lucide-react';

export default function LearnSidebar({ activeSection, setActiveSection }) {
  const sections = [
    { id: 'chess-fundamentals', label: 'Chess Fundamentals', icon: BookOpen },
    { id: 'engine-fundamentals', label: 'Engine Fundamentals', icon: Cpu },
    { id: 'engine-architecture', label: 'Engine Architecture', icon: Layers },
    { id: 'research-methodology', label: 'Research Methodology', icon: GitBranch },
    { id: 'optimization-timeline', label: 'Optimization Timeline', icon: TrendingUp },
    { id: 'interactive-demos', label: 'Interactive Visualizations', icon: Activity },
    { id: 'research-docs', label: 'Research Documentation', icon: Database },
  ];

  return (
    <aside className="card-secondary" style={{ width: '240px', padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0, borderColor: 'rgba(139, 115, 85, 0.2)' }}>
      <div style={{ padding: '0 0.5rem 0.5rem 0.5rem', borderBottom: '1px solid rgba(139, 115, 85, 0.2)' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#8D837A', textTransform: 'capitalize' }}>Technical docs</span>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#F4F1EA', margin: '0.1rem 0' }}>Learn & Specs</h3>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.55rem 0.75rem',
                borderRadius: '4px',
                backgroundColor: isActive ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                color: isActive ? '#F4F1EA' : '#B7AEA5',
                border: 'none',
                borderLeft: isActive ? '3px solid #d4af37' : '3px solid transparent',
                fontSize: '0.8rem',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={15} color={isActive ? '#d4af37' : '#8D837A'} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
