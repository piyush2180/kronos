import React from 'react';
import { 
  Activity, Archive, TrendingUp, Target, ShieldCheck, 
  BookOpen, Play, FileText, ArrowLeft 
} from 'lucide-react';
import { colors, spacing, geometry, typography } from '../../theme/designTokens';

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
    <div style={{ marginBottom: spacing.xl }}>
      {!isTablet && (
        <div style={{ fontSize: '0.68rem', fontWeight: '600', color: 'var(--color-text-dim)', padding: `0 ${spacing.lg} ${spacing.xs} ${spacing.lg}`, textTransform: 'capitalize' }}>
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
                gap: isTablet ? '0' : spacing.md,
                padding: isTablet ? `${spacing.sm} 0` : `${spacing.sm} ${spacing.lg}`,
                borderRadius: geometry.radiusInteractive,
                backgroundColor: isActive ? 'rgba(200, 159, 61, 0.08)' : 'transparent',
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                border: 'none',
                borderLeft: !isTablet && isActive ? `3px solid ${colors.goldAccent}` : '3px solid transparent',
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
              <Icon size={16} color={isActive ? colors.goldAccent : '#7a6a5f'} />
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
      padding: isTablet ? `${spacing.lg} ${spacing.xs}` : `${spacing.xl} ${spacing.sm}`
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
            padding: isTablet ? `${spacing.sm} 0` : `${spacing.sm} ${spacing.md}`
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
    backgroundColor: colors.bgSurface,
    borderRight: `1px solid ${colors.borderSubtle}`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: `${spacing.xl} ${spacing.sm}`,
    userSelect: 'none'
  },
  brandSection: {
    padding: `0 ${spacing.lg} ${spacing.xl} ${spacing.lg}`,
    marginBottom: spacing.lg,
    borderBottom: `1px solid ${colors.borderSubtle}`
  },
  brandTag: {
    fontSize: '0.68rem',
    fontWeight: 600,
    color: colors.goldAccent
  },
  brandTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: colors.textPrimary,
    margin: '0.2rem 0 0 0'
  },
  footerSection: {
    paddingTop: spacing.md,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    borderTop: `1px solid ${colors.borderSubtle}`
  },
  exitBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: geometry.radiusInteractive,
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }
};
