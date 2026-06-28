import React from 'react';
import { 
  Activity, Archive, TrendingUp, Target, ShieldCheck, 
  BookOpen, Play, FileText, Settings, ArrowLeft 
} from 'lucide-react';

export default function ResearchSidebar({ activeView, setActiveView, onExit }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'archive', label: 'Research Archive', icon: Archive },
    { id: 'timeline', label: 'Optimization Timeline', icon: TrendingUp },
    { id: 'calibration', label: 'Engine Calibration', icon: Target },
    { id: 'validation', label: 'Search Validation', icon: ShieldCheck },
    { id: 'architecture', label: 'Architecture Viewer', icon: BookOpen },
    { id: 'runner', label: 'Benchmark Runner', icon: Play },
    { id: 'reports', label: 'Reports & Logs', icon: FileText },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brandSection}>
        <span style={styles.brandTag}>KRONOS ENGINE LAB</span>
        <h3 style={styles.brandTitle}>Engineering Suite</h3>
      </div>

      <nav style={styles.navList}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              style={styles.navBtn(isActive)}
              onClick={() => setActiveView(item.id)}
            >
              <Icon size={18} color={isActive ? '#d4af37' : '#8c7a6b'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={styles.footerSection}>
        <button style={styles.exitBtn} onClick={onExit}>
          <ArrowLeft size={16} />
          <span>Exit Workstation</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    backgroundColor: 'var(--color-bg-surface, #1e1712)',
    borderRight: '1px solid var(--color-border-subtle, #34281e)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '1.25rem 0.5rem',
    userSelect: 'none'
  },
  brandSection: {
    padding: '0 0.75rem 1.25rem 0.75rem',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)',
    marginBottom: '1rem'
  },
  brandTag: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#d4af37',
    letterSpacing: '0.1em'
  },
  brandTitle: {
    fontSize: '1.05rem',
    fontWeight: 800,
    color: 'var(--color-text-primary, #fffff0)',
    margin: '0.25rem 0 0 0'
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    flex: 1
  },
  navBtn: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.65rem 0.85rem',
    borderRadius: '4px',
    backgroundColor: active ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
    color: active ? '#fffff0' : '#bdaea4',
    border: 'none',
    borderLeft: active ? '3px solid #d4af37' : '3px solid transparent',
    fontSize: '0.85rem',
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease'
  }),
  footerSection: {
    paddingTop: '1rem',
    borderTop: '1px solid var(--color-border-subtle, #34281e)',
    paddingLeft: '0.25rem',
    paddingRight: '0.25rem'
  },
  exitBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    backgroundColor: 'transparent',
    color: '#8c7a6b',
    border: '1px solid var(--color-border-subtle, #34281e)',
    borderRadius: '4px',
    padding: '0.6rem 0.75rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }
};
