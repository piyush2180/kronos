import React from 'react';
import { Target, Shuffle, Eye, Lightbulb, Edit, BookOpen, ArrowRight, Cpu, PlayCircle, ShieldCheck } from 'lucide-react';
import { colors, spacing } from '../../theme/designTokens';

const CARDS = [
  {
    title: 'Play vs Engine',
    desc: 'Challenge Kronos at any strength — from D2 up to flagship D6 and D7 levels.',
    icon: Target,
    route: '/play',
    accent: colors.goldAccent,
    badge: 'Solo Match',
    cta: 'Start Playing',
  },
  {
    title: 'Pass & Play',
    desc: 'Two-player local match on a single device with auto-flipping board rules.',
    icon: Shuffle,
    route: '/local',
    accent: colors.textSecondary,
    badge: 'Local Match',
    cta: 'Start Match',
  },
  {
    title: 'Analysis Board',
    desc: 'Explore positions with Stockfish evaluations, PGN imports, and opening theory lines.',
    icon: Eye,
    route: '/analysis',
    accent: colors.success,
    badge: 'Engine Analysis',
    cta: 'Open Board',
  },
  {
    title: 'Position Editor',
    desc: 'Build custom board FEN layouts using a drag-and-drop piece editor canvas.',
    icon: Edit,
    route: '/editor',
    accent: colors.warning,
    badge: 'Board Editor',
    cta: 'Open Editor',
  },
  {
    title: 'Puzzle Trainer',
    desc: 'Train tactics with verified checkmate, middlegame, and positional puzzle banks.',
    icon: Lightbulb,
    route: '/puzzles',
    accent: colors.goldAccent,
    badge: 'Tactical Trainer',
    cta: 'Train Now',
  },
  {
    title: 'Learn Chess',
    desc: 'Study opening theories, endgames, tactical motifs, and search engine internals.',
    icon: BookOpen,
    route: '/learn',
    accent: colors.danger,
    badge: 'Knowledge Hub',
    cta: 'Start Learning',
  },
  {
    title: 'Benchmark Workspace',
    desc: 'Run automated engine tournaments, calibrate search depth, and trace telemetry.',
    icon: Cpu,
    route: '/research',
    accent: colors.textSecondary,
    badge: 'Maintainer Suite',
    cta: 'Open Workspace',
  },
];

export default function DashboardDesktop({ username, navigate }) {
  const stats = [
    { label: 'Platform', value: 'Vercel Cloud', icon: Cpu, accent: colors.goldAccent },
    { label: 'Developer Access', value: username || 'Guest', icon: Target, accent: colors.success },
    { label: 'Diagnostics', value: 'Connected', icon: ShieldCheck, accent: colors.warning },
    { label: 'Engine Version', value: 'Kronos D6', icon: PlayCircle, accent: colors.danger },
  ];

  return (
    <div style={styles.page} className="animate-fade-in">
      {/* ── Hero Section (Borderless) ────────────────────────────────────── */}
      <div style={styles.hero}>
        <div style={styles.heroLeft}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C89F3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '40px', height: '40px', marginBottom: '12px' }}>
            <circle cx="12" cy="6" r="3" fill="#C89F3D" />
            <path d="M12 9a5 5 0 0 0-5 5v3h10v-3a5 5 0 0 0-5-5z" fill="#C89F3D" />
            <rect x="5" y="19" width="14" height="2" rx="1" fill="#C89F3D" />
          </svg>

          <h1 className="heading-page" style={{ marginBottom: '12px' }}>
            Welcome back,<br />
            <span style={{ color: 'var(--color-brand-primary)' }}>{username || 'Grandmaster'}</span>
          </h1>
          <p className="text-subtitle" style={{ maxWidth: '520px', marginBottom: '16px' }}>
            Kronos Chess is a clean, developer-focused chess workstation and local engine benchmarking platform.
          </p>
          <div style={styles.heroActions}>
            <button onClick={() => navigate('/play')} className="btn-primary">
              <PlayCircle size={18} />
              <span>Start Match</span>
            </button>
            <button onClick={() => navigate('/analysis')} className="btn-secondary">
              <Eye size={16} />
              <span>Analysis Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Four Telemetry Stats Cards ───────────────────────────────────── */}
      <div style={styles.statsRow}>
        {stats.map((stat, idx) => (
          <div key={idx} style={styles.statCard} className="stat-card-premium">
            <div style={styles.statHeader}>
              <span style={styles.statLabel}>{stat.label}</span>
              <stat.icon size={16} color={stat.accent} />
            </div>
            <div style={styles.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ── Mode Selection List (Borderless) ────────────────────────────── */}
      <div style={{ marginTop: '24px' }}>
        <div style={styles.sectionLabel}>Workstation Modes</div>
        
        <div style={styles.modeList}>
          {CARDS.map((card, idx) => (
            <div
              key={idx}
              onClick={() => navigate(card.route)}
              style={styles.modeItem}
              className="mode-item-hoverable"
            >
              <div style={styles.modeIconBox}>
                <card.icon size={20} color="var(--color-brand-primary)" />
              </div>
              <div style={styles.modeTextCol}>
                <div style={styles.modeTitleRow}>
                  <span style={styles.modeTitle}>{card.title}</span>
                  <span style={styles.modeBadge}>{card.badge}</span>
                </div>
                <div style={styles.modeDesc}>{card.desc}</div>
              </div>
              <div style={styles.modeCtaCol}>
                <span style={styles.modeCta}>{card.cta}</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '36px',
    boxSizing: 'border-box'
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  heroActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    width: '100%',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
    cursor: 'default'
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  statLabel: {
    fontSize: '13px',
    color: 'var(--color-text-dim)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--color-text-primary)'
  },
  sectionLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '16px'
  },
  modeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)'
  },
  modeItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    gap: '16px'
  },
  modeIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(200, 159, 61, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  modeTextCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'left'
  },
  modeTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  modeTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-text-primary)'
  },
  modeBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--color-brand-primary)',
    backgroundColor: 'rgba(200, 159, 61, 0.08)',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  modeDesc: {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.4
  },
  modeCtaCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--color-text-dim)',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'color 0.15s ease'
  },
  modeCta: {
    display: 'inline-block'
  }
};
