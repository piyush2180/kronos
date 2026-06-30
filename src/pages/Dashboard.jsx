// Kronos Chess V2 — Dashboard Page
// Desktop-first 3x2 card grid replacing the stacked vertical layout.

import React from 'react';
import { Target, Shuffle, Eye, Lightbulb, User, Edit, BookOpen, ArrowRight } from 'lucide-react';

const CARDS = [
  {
    title: 'Play vs Engine',
    desc: 'Challenge Kronos at 5 difficulty levels — from 600 to 2200 ELO.',
    icon: Target,
    route: '/play',
    accent: '#d4af37',
    badge: 'SOLO',
  },
  {
    title: 'Pass & Play',
    desc: 'Two-player local match on a single device. Board auto-flips each turn.',
    icon: Shuffle,
    route: '/local',
    accent: '#a67c52',
    badge: 'LOCAL',
  },
  {
    title: 'Analysis Board',
    desc: 'Explore any position with Stockfish, import PGNs, and study opening lines.',
    icon: Eye,
    route: '/analysis',
    accent: '#5a9fd4',
    badge: 'ENGINE',
  },
  {
    title: 'Position Editor',
    desc: 'Build custom board positions using a drag-and-drop piece editor.',
    icon: Edit,
    route: '/editor',
    accent: '#68d391',
    badge: 'TOOL',
  },
  {
    title: 'Puzzle Trainer',
    desc: 'Sharpen your tactics with 30 verified puzzles — forks, pins, mates, and more.',
    icon: Lightbulb,
    route: '/puzzles',
    accent: '#f6ad55',
    badge: 'TRAIN',
  },
  {
    title: 'Learn Chess',
    desc: 'Study openings, endgames, tactical motifs, and engine evaluation theory.',
    icon: BookOpen,
    route: '/learn',
    accent: '#fc8181',
    badge: 'LEARN',
  },
];

export default function Dashboard({ username, navigate }) {
  return (
    <div style={styles.page} className="animate-fade-in">
      {/* Welcome Banner */}
      <div style={styles.welcomeBanner} className="dashboard-welcome-banner">
        <div>
          <h1 style={styles.welcomeTitle}>Welcome back, {username || 'Grandmaster'}</h1>
          <p style={styles.welcomeSubtitle}>Select a mode below — your previous sessions are auto-saved.</p>
        </div>
        <button onClick={() => navigate('/profile')} style={styles.profileBtn} className="profile-quick-btn">
          <User size={15} />
          <span>View Profile</span>
        </button>
      </div>

      {/* 3x2 Card Grid */}
      <div style={styles.cardGrid} className="dashboard-card-grid">
        {CARDS.map((card, idx) => (
          <button
            key={idx}
            style={styles.card}
            onClick={() => navigate(card.route)}
            className="dashboard-card"
          >
            {/* Icon header strip */}
            <div style={{ ...styles.cardIconRow, '--card-accent': card.accent }}>
              <div style={{ ...styles.iconBox, backgroundColor: `${card.accent}18`, border: `1px solid ${card.accent}30` }}>
                <card.icon size={26} color={card.accent} />
              </div>
              <span style={{ ...styles.cardBadge, backgroundColor: `${card.accent}18`, color: card.accent, border: `1px solid ${card.accent}30` }}>
                {card.badge}
              </span>
            </div>

            {/* Text */}
            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardDesc}>{card.desc}</p>
            </div>

            {/* CTA arrow */}
            <div style={styles.cardFooter}>
              <span style={styles.cardCta}>Open</span>
              <ArrowRight size={14} style={styles.cardArrow} />
            </div>

            {/* Bottom accent bar */}
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
    gap: '28px',
  },
  welcomeBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 32px',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '10px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    backgroundImage: 'linear-gradient(135deg, rgba(212,175,55,0.07) 0%, transparent 60%)',
  },
  welcomeTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-display)',
    letterSpacing: '-0.01em',
  },
  welcomeSubtitle: {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    marginTop: '6px',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '6px',
    color: 'var(--color-text-primary)',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '18px',
  },
  card: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    padding: '20px',
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
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBadge: {
    fontSize: '9px',
    fontWeight: '800',
    letterSpacing: '0.08em',
    padding: '3px 7px',
    borderRadius: '4px',
    fontFamily: 'monospace',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-display)',
    letterSpacing: '-0.01em',
  },
  cardDesc: {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.55',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px',
  },
  cardCta: {
    fontSize: '11px',
    fontWeight: '700',
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
