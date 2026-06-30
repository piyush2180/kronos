import React from 'react';
import { 
  Activity, Archive, TrendingUp, Target, ShieldCheck, 
  BookOpen, Play, FileText, ArrowLeft 
} from 'lucide-react';

export default function ResearchSidebar({ activeView, setActiveView, onExit, isTablet = false }) {
  const coreItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'archive', label: 'Research archive', icon: Archive },
    { id: 'timeline', label: 'Optimization timeline', icon: TrendingUp },
    { id: 'calibration', label: 'Engine calibration', icon: Target },
    { id: 'compare', label: 'Experiment comparison', icon: FileText }
  ];

  const diagItems = [
    { id: 'validation', label: 'Search validation', icon: ShieldCheck },
    { id: 'architecture', label: 'Architecture viewer', icon: BookOpen },
    { id: 'runner', label: 'Benchmark runner', icon: Play }
  ];

  const renderNavGroup = (title, items) => (
    <div style={{ marginBottom: '1.25rem' }}>
      {!isTablet && (
        <div style={{ fontSize: '0.68rem', fontWeight: '600', color: 'var(--color-text-dim)', padding: '0 0.85rem 0.4rem 0.85rem', textTransform: 'capitalize' }}>
          {title}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isTablet ? 'center' : 'flex-start',
                gap: isTablet ? '0' : '0.75rem',
                padding: isTablet ? '0.6rem 0' : '0.55rem 0.85rem',
                borderRadius: '4px',
                backgroundColor: isActive ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                border: 'none',
                borderLeft: !isTablet && isActive ? '3px solid #d4af37' : '3px solid transparent',
                fontSize: '0.825rem',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                width: '100%'
              }}
              onClick={() => setActiveView(item.id)}
              title={isTablet ? item.label : ''}
            >
              <Icon size={16} color={isActive ? '#d4af37' : '#7a6a5f'} />
              {!isTablet && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside style={{
      ...styles.sidebar,
      width: isTablet ? '64px' : '240px',
      padding: isTablet ? '1rem 0.25rem' : '1.25rem 0.5rem'
    }}>
      <div>
        {!isTablet && (
          <div style={styles.brandSection}>
            <span style={styles.brandTag}>Kronos engine lab</span>
            <h3 style={styles.brandTitle}>Engineering suite</h3>
          </div>
        )}

        <nav>
          {renderNavGroup('Research workspace', coreItems)}
          {renderNavGroup('Diagnostics & suite', diagItems)}
        </nav>
      </div>

      <div style={styles.footerSection}>
        <button 
          style={{
            ...styles.exitBtn,
            justifyContent: isTablet ? 'center' : 'flex-start',
            padding: isTablet ? '0.55rem 0' : '0.55rem 0.75rem'
          }} 
          onClick={onExit}
          title={isTablet ? "Exit workstation" : ""}
        >
          <ArrowLeft size={15} />
          {!isTablet && <span>Exit workstation</span>}
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    backgroundColor: 'var(--color-bg-surface, #1e1712)',
    borderRight: '1px solid rgba(52, 40, 30, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '1.25rem 0.5rem',
    userSelect: 'none'
  },
  brandSection: {
    padding: '0 0.85rem 1.25rem 0.85rem',
    marginBottom: '1rem',
    borderBottom: '1px solid rgba(52, 40, 30, 0.4)'
  },
  brandTag: {
    fontSize: '0.68rem',
    fontWeight: 600,
    color: '#d4af37'
  },
  brandTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--color-text-primary, #fffff0)',
    margin: '0.2rem 0 0 0'
  },
  footerSection: {
    paddingTop: '0.75rem',
    paddingLeft: '0.25rem',
    paddingRight: '0.25rem',
    borderTop: '1px solid rgba(52, 40, 30, 0.4)'
  },
  exitBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
    padding: '0.55rem 0.75rem',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }
};
