import React from 'react';
import { Target, Shuffle, Eye, Lightbulb, Edit, BookOpen, ArrowRight, Cpu, PlayCircle, ShieldCheck, Zap, Activity } from 'lucide-react';
import { colors } from '../../theme/designTokens';

const CARDS = [
  {
    title: 'Play vs Engine',
    desc: 'Challenge Kronos at any strength — from D2 up to flagship D6 and D7 levels.',
    icon: Target,
    route: '/play',
    badge: 'Solo Match',
    cta: 'Start',
  },
  {
    title: 'Pass & Play',
    desc: 'Two-player local match on a single device with auto-flipping board rules.',
    icon: Shuffle,
    route: '/local',
    badge: 'Local Match',
    cta: 'Start',
  },
  {
    title: 'Analysis Board',
    desc: 'Explore positions with Stockfish evaluations and PGN imports.',
    icon: Eye,
    route: '/analysis',
    badge: 'Engine Analysis',
    cta: 'Open',
  },
  {
    title: 'Position Editor',
    desc: 'Build custom board FEN layouts using a piece editor canvas.',
    icon: Edit,
    route: '/editor',
    badge: 'Board Editor',
    cta: 'Open',
  },
  {
    title: 'Puzzle Trainer',
    desc: 'Train tactics with verified checkmate & positional puzzle banks.',
    icon: Lightbulb,
    route: '/puzzles',
    badge: 'Tactical Trainer',
    cta: 'Train',
  },
  {
    title: 'Learn Chess',
    desc: 'Study opening theories, endgames, and search engine internals.',
    icon: BookOpen,
    route: '/Knowledge Hub',
    cta: 'Learn',
  },
  {
    title: 'Benchmark Suite',
    desc: 'Run automated engine tournaments and trace telemetry.',
    icon: Cpu,
    route: '/research',
    badge: 'Maintainer Suite',
    cta: 'Open',
  },
];

export default function DashboardMobile({ username, navigate }) {
  return (
    <div style={styles.mobileContainer} className="animate-fade-in">
      
      {/* 1. Welcome Card */}
      <div style={styles.welcomeCard}>
        <div style={styles.welcomeLogoRow}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C89F3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px' }}>
            <circle cx="12" cy="6" r="3" fill="#C89F3D" />
            <path d="M12 9a5 5 0 0 0-5 5v3h10v-3a5 5 0 0 0-5-5z" fill="#C89F3D" />
            <rect x="5" y="19" width="14" height="2" rx="1" fill="#C89F3D" />
          </svg>
          <span style={styles.welcomeBadge}>KRONOS MOBILE</span>
        </div>
        <h1 style={styles.welcomeTitle}>
          Welcome back,<br />
          <span style={{ color: 'var(--color-brand-primary)' }}>{username || 'Grandmaster'}</span>
        </h1>
        <p style={styles.welcomeSub}>
          Developer-focused chess workstation & engine benchmarking suite.
        </p>
      </div>

      {/* 2. Quick Actions */}
      <div style={styles.sectionBlock}>
        <div style={styles.sectionHeader}>Quick Actions</div>
        <div style={styles.quickGrid}>
          <button onClick={() => navigate('/play')} style={styles.quickBtnPrimary}>
            <PlayCircle size={18} />
            <span>Play Engine</span>
          </button>
          <button onClick={() => navigate('/analysis')} style={styles.quickBtnSecondary}>
            <Eye size={16} />
            <span>Analysis</span>
          </button>
        </div>
      </div>

      {/* 3. Platform Cards & 4. Developer Status (Single-Column Telemetry) */}
      <div style={styles.sectionBlock}>
        <div style={styles.sectionHeader}>Telemetry & Environment</div>
        <div style={styles.telemetryStack}>
          <div style={styles.telemetryRow}>
            <div style={styles.telemetryLabelRow}>
              <Cpu size={14} color={colors.goldAccent} />
              <span>Platform</span>
            </div>
            <span style={styles.telemetryVal}>Vercel Cloud</span>
          </div>

          <div style={styles.telemetryRow}>
            <div style={styles.telemetryLabelRow}>
              <Target size={14} color={colors.success} />
              <span>Developer Access</span>
            </div>
            <span style={styles.telemetryVal}>{username || 'Guest'}</span>
          </div>

          <div style={styles.telemetryRow}>
            <div style={styles.telemetryLabelRow}>
              <ShieldCheck size={14} color={colors.warning} />
              <span>Diagnostics</span>
            </div>
            <span style={{ ...styles.telemetryVal, color: colors.success }}>Online</span>
          </div>

          <div style={styles.telemetryRow}>
            <div style={styles.telemetryLabelRow}>
              <Zap size={14} color={colors.danger} />
              <span>Engine Spec</span>
            </div>
            <span style={{ ...styles.telemetryVal, color: colors.goldAccent }}>Kronos D6 Anchor</span>
          </div>
        </div>
      </div>

      {/* 5. Workspace Modes */}
      <div style={styles.sectionBlock}>
        <div style={styles.sectionHeader}>Workspace Modes</div>
        <div style={styles.modeStack}>
          {CARDS.map((card, idx) => (
            <div
              key={idx}
              onClick={() => navigate(card.route)}
              style={styles.modeCardMobile}
            >
              <div style={styles.modeIconBoxMobile}>
                <card.icon size={18} color="var(--color-brand-primary)" />
              </div>
              <div style={styles.modeContentMobile}>
                <div style={styles.modeTitleRowMobile}>
                  <span style={styles.modeTitleMobile}>{card.title}</span>
                  {card.badge && <span style={styles.modeBadgeMobile}>{card.badge}</span>}
                </div>
                <div style={styles.modeDescMobile}>{card.desc}</div>
              </div>
              <ArrowRight size={16} color="var(--color-text-dim)" style={{ flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* 6. Recent Activity */}
      <div style={styles.sectionBlock}>
        <div style={styles.sectionHeader}>Recent Activity</div>
        <div style={styles.activityCard}>
          <Activity size={16} color={colors.goldAccent} />
          <div style={styles.activityText}>
            <span>Session initialized. Ready for match or position analysis.</span>
          </div>
        </div>
      </div>

    </div>
  );
}

const styles = {
  mobileContainer: {
    width: '100%',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxSizing: 'border-box',
  },
  welcomeCard: {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  welcomeLogoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeBadge: {
    fontSize: '10px',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
    backgroundColor: 'rgba(200, 159, 61, 0.1)',
    border: '1px solid rgba(200, 159, 61, 0.25)',
    padding: '2px 8px',
    borderRadius: '4px',
    letterSpacing: '0.06em',
  },
  welcomeTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    margin: 0,
    lineHeight: 1.3,
  },
  welcomeSub: {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    margin: 0,
    lineHeight: 1.4,
  },
  sectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  quickGrid: {
    display: 'flex',
    gap: '10px',
  },
  quickBtnPrimary: {
    flex: 1,
    height: '44px',
    backgroundColor: 'var(--color-brand-primary)',
    color: '#15100c',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  quickBtnSecondary: {
    flex: 1,
    height: '44px',
    backgroundColor: 'var(--color-bg-surface)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  telemetryStack: {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  telemetryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
  },
  telemetryLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--color-text-secondary)',
    fontWeight: '500',
  },
  telemetryVal: {
    color: 'var(--color-text-primary)',
    fontWeight: '700',
    fontSize: '13px',
  },
  modeStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  modeCardMobile: {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  modeIconBoxMobile: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'rgba(200, 159, 61, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modeContentMobile: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  modeTitleRowMobile: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  modeTitleMobile: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  modeBadgeMobile: {
    fontSize: '9px',
    fontWeight: '700',
    color: 'var(--color-brand-primary)',
    backgroundColor: 'rgba(200, 159, 61, 0.1)',
    padding: '1px 5px',
    borderRadius: '3px',
    textTransform: 'uppercase',
  },
  modeDescMobile: {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.3,
  },
  activityCard: {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  activityText: {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
  },
};
