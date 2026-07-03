// Kronos Chess V2 — Dashboard
// Hero section with quick-play CTA plus full mode card grid.

import React from 'react';
import { Target, Shuffle, Eye, Lightbulb, Edit, BookOpen, ArrowRight, Cpu, PlayCircle, Swords } from 'lucide-react';

const CARDS = [
  {
    title: 'Play vs Engine',
    desc: 'Challenge Kronos at any strength — from D2 (rapid moves) up to the flagship D6 and experimental D7.',
    icon: Target,
    route: '/play',
    accent: '#d4af37',
    badge: 'SOLO',
    cta: 'Start Playing',
  },
  {
    title: 'Pass & Play',
    desc: 'Two-player local match on a single device. Board auto-flips every turn. Pick your time control and play.',
    icon: Shuffle,
    route: '/local',
    accent: '#a67c52',
    badge: 'LOCAL',
    cta: 'Start Match',
  },
  {
    title: 'Analysis Board',
    desc: 'Explore any position with Stockfish, import PGNs, study opening lines, and review engine evaluations.',
    icon: Eye,
    route: '/analysis',
    accent: '#5a9fd4',
    badge: 'ENGINE',
    cta: 'Open Board',
  },
  {
    title: 'Position Editor',
    desc: 'Build custom board positions using a drag-and-drop piece editor. Launch directly into any mode.',
    icon: Edit,
    route: '/editor',
    accent: '#68d391',
    badge: 'TOOL',
    cta: 'Open Editor',
  },
  {
    title: 'Puzzle Trainer',
    desc: 'Sharpen your tactics with 30 verified puzzles — forks, pins, discovered attacks, back-rank mates and more.',
    icon: Lightbulb,
    route: '/puzzles',
    accent: '#f6ad55',
    badge: 'TRAIN',
    cta: 'Train Now',
  },
  {
    title: 'Learn Chess',
    desc: 'Study openings, endgames, tactical motifs, and how Kronos evaluates positions under the hood.',
    icon: BookOpen,
    route: '/learn',
    accent: '#fc8181',
    badge: 'LEARN',
    cta: 'Start Learning',
  },
  {
    title: 'Research Lab',
    desc: 'Empirical workstation. Run engine tournaments, calibrate evaluation weights, and compare depth configurations.',
    icon: Cpu,
    route: '/research',
    accent: '#b794f4',
    badge: 'LAB',
    cta: 'Open Lab',
  },
];

export default function Dashboard({ username, navigate }) {
  return (
    <div style={styles.page} className="animate-fade-in">

      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <div style={styles.hero} className="dashboard-welcome-banner">
        <div style={styles.heroLeft}>
          <div style={styles.heroBadge}>Kronos Research Engine · V2</div>
          <h1 style={styles.heroTitle}>
            Welcome back,<br />
            <span style={{ color: 'var(--color-brand-primary)' }}>{username || 'Grandmaster'}</span>
          </h1>
          <p style={styles.heroSub}>
            A classical chess engine built for research. All modes are available below — your sessions are auto-saved.
          </p>
          <div style={styles.heroActions}>
            <button
              onClick={() => navigate('/play')}
              style={styles.heroPlayBtn}
              className="btn-primary"
            >
              <PlayCircle size={18} />
              Start Playing
            </button>
            <button
              onClick={() => navigate('/local')}
              style={styles.heroSecondaryBtn}
            >
              <Swords size={16} />
              Pass & Play
            </button>
            <button
              onClick={() => navigate('/analysis')}
              style={styles.heroSecondaryBtn}
            >
              <Eye size={16} />
              Analysis Board
            </button>
          </div>
        </div>

        <div style={styles.heroRight}>
          <div style={styles.engineStatGrid}>
            {[
              { label: 'Configurations', value: 'D2 – D7' },
              { label: 'Flagship Depth', value: '6-ply' },
              { label: 'Search', value: 'PVS + LMR' },
              { label: 'Estimated Elo', value: '~1485' },
            ].map(stat => (
              <div key={stat.label} style={styles.statCell}>
                <div style={styles.statVal}>{stat.value}</div>
                <div style={styles.statLbl}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mode Card Grid ────────────────────────────────────────────────── */}
      <div style={styles.sectionLabel}>All Modes</div>
      <div style={styles.cardGrid} className="dashboard-card-grid">
        {CARDS.map((card, idx) => (
          <button
            key={idx}
            style={styles.card}
            onClick={() => navigate(card.route)}
            className="dashboard-card"
          >
            <div style={{ ...styles.cardIconRow, '--card-accent': card.accent }}>
              <div style={{ ...styles.iconBox, backgroundColor: `${card.accent}18`, border: `1px solid ${card.accent}30` }}>
                <card.icon size={24} color={card.accent} />
              </div>
              <span style={{ ...styles.cardBadge, backgroundColor: `${card.accent}18`, color: card.accent, border: `1px solid ${card.accent}30` }}>
                {card.badge}
              </span>
            </div>

            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardDesc}>{card.desc}</p>
            </div>

            <div style={styles.cardFooter}>
              <span style={styles.cardCta}>{card.cta}</span>
              <ArrowRight size={13} style={styles.cardArrow} />
            </div>

            <div style={{ ...styles.accentBar, backgroundColor: card.accent }} />
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  // Hero
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '24px',
    padding: '28px 32px',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    backgroundImage: 'linear-gradient(135deg, rgba(212,175,55,0.07) 0%, transparent 60%)',
    flexWrap: 'wrap',
    gap: '20px',
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: '1 1 300px',
  },
  heroBadge: {
    display: 'inline-flex',
    alignSelf: 'flex-start',
    fontSize: '0.62rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-brand-primary)',
    backgroundColor: 'rgba(212,175,55,0.08)',
    border: '1px solid rgba(212,175,55,0.2)',
    padding: '3px 9px',
    borderRadius: '4px',
  },
  heroTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-display)',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
    margin: 0,
  },
  heroSub: {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '420px',
  },
  heroActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '4px',
  },
  heroPlayBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 22px',
    fontSize: '0.85rem',
    fontWeight: 800,
    borderRadius: '6px',
    cursor: 'pointer',
    border: 'none',
  },
  heroSecondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '10px 16px',
    fontSize: '0.82rem',
    fontWeight: 700,
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--color-text-secondary)',
    transition: 'all 0.15s ease',
  },
  heroRight: {
    flex: '0 0 auto',
  },
  engineStatGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  statCell: {
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '12px 16px',
    minWidth: '100px',
  },
  statVal: {
    fontSize: '1rem',
    fontWeight: 800,
    color: 'var(--color-brand-primary)',
    fontFamily: 'monospace',
  },
  statLbl: {
    fontSize: '0.62rem',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '4px',
    fontWeight: 700,
  },
  // Section label
  sectionLabel: {
    fontSize: '0.67rem',
    fontWeight: 800,
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  // Cards
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
    gap: '16px',
  },
  card: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '18px',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'left',
    overflow: 'hidden',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  },
  cardIconRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBadge: {
    fontSize: '8px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    padding: '3px 6px',
    borderRadius: '3px',
    fontFamily: 'monospace',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: 1,
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 800,
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-display)',
    letterSpacing: '-0.01em',
    margin: 0,
  },
  cardDesc: {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.55,
    margin: 0,
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginTop: '2px',
  },
  cardCta: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  cardArrow: {
    color: 'var(--color-text-dim)',
    transition: 'transform 0.2s ease',
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    opacity: 0.6,
  },
};
