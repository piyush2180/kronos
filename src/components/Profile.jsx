// Kronos Chess V2 — Player Profile Component
// Renders overall career metrics, win rate charts, and game history timelines from LocalStorage.

import React, { useMemo } from 'react';
import { Award, Trophy, Play, Star, Calendar, User, BarChart2 } from 'lucide-react';

export default function Profile({ username }) {
  
  // Retrieve profile details
  const profile = useMemo(() => {
    try {
      const pKey = `kronos_v2_profile_${username}`;
      const stored = localStorage.getItem(pKey);
      if (stored) return JSON.parse(stored);
    } catch {}
    
    // Default
    return {
      gamesPlayed: 0, wins: 0, losses: 0, draws: 0,
      favoriteOpening: 'None yet', averageMoves: 0, history: []
    };
  }, [username]);

  // Calculate percentages
  const winRate = useMemo(() => {
    if (profile.gamesPlayed === 0) return 0;
    return Math.round((profile.wins / profile.gamesPlayed) * 100);
  }, [profile]);

  return (
    <div style={styles.profileWrapper} className="animate-fade-in">
      
      {/* User Header */}
      <div style={styles.header}>
        <div style={styles.avatarLarge}>{username[0].toUpperCase()}</div>
        <div>
          <h2 style={styles.title}>{username}</h2>
          <p style={styles.subtitle}>Kronos Chess Member</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={styles.metricsGrid}>
        
        <div style={styles.metricCard} className="panel-card">
          <Trophy size={20} color="var(--color-brand-primary)" />
          <div style={styles.metricVal}>{profile.gamesPlayed}</div>
          <div style={styles.metricLabel}>Games Played</div>
        </div>

        <div style={styles.metricCard} className="panel-card">
          <Award size={20} color="var(--color-brand-primary)" />
          <div style={styles.metricVal}>{winRate}%</div>
          <div style={styles.metricLabel}>Win Rate</div>
        </div>

        <div style={styles.metricCard} className="panel-card">
          <BarChart2 size={20} color="var(--color-brand-primary)" />
          <div style={styles.metricVal}>{profile.wins}W / {profile.losses}L</div>
          <div style={styles.metricLabel}>Record</div>
        </div>

        <div style={styles.metricCard} className="panel-card">
          <Star size={20} color="var(--color-brand-primary)" />
          <div style={styles.metricVal}>{profile.favoriteOpening}</div>
          <div style={styles.metricLabel}>Favorite Opening</div>
        </div>

      </div>

      {/* Games list timeline */}
      <div style={styles.historySection} className="panel-card">
        <div style={styles.historyHeader}>Recent Matches</div>
        <div style={styles.historyList} className="scroll-panel">
          {profile.history && profile.history.length > 0 ? (
            profile.history.map((game, idx) => {
              const isWin = game.result === 'win' || game.result?.toLowerCase()?.includes('won');
              const isLoss = game.result === 'loss' || game.result?.toLowerCase()?.includes('lost');
              const isDraw = game.result === 'draw' || game.result?.toLowerCase()?.includes('drawn');
              
              let resultColor = 'var(--color-text-secondary)';
              if (isWin) resultColor = '#48bb78';
              else if (isLoss) resultColor = '#f56565';
              else if (isDraw) resultColor = '#ecc94b';

              return (
                <div key={idx} style={styles.historyRow}>
                  <div style={styles.historyLeft}>
                    <Calendar size={13} style={styles.rowIcon} />
                    <span style={styles.rowDate}>{game.date}</span>
                    <span style={styles.rowOpponent}>vs {game.opponent}</span>
                  </div>

                  <div style={styles.historyCenter}>
                    <span style={styles.rowOpening}>{game.opening}</span>
                    <span style={styles.rowMoves}>{game.moves} moves</span>
                  </div>

                  <div style={styles.historyRight}>
                    <span style={{ ...styles.rowResult, color: resultColor }}>
                      {game.result.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.emptyState}>No matches recorded in this profile yet.</div>
          )}
        </div>
      </div>

    </div>
  );
}

const styles = {
  profileWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
    padding: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    borderBottom: '1px solid var(--color-border-subtle)',
    paddingBottom: '16px',
  },
  avatarLarge: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '2px solid var(--color-brand-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '2px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  metricCard: {
    padding: '18px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    textAlign: 'center',
  },
  metricVal: {
    fontFamily: 'var(--font-display)',
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  metricLabel: {
    fontSize: '9px',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '700',
  },
  historySection: {
    padding: '16px',
  },
  historyHeader: {
    fontFamily: 'var(--font-display)',
    fontSize: '13px',
    fontWeight: '800',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--color-border-subtle)',
    paddingBottom: '8px',
    marginBottom: '10px',
  },
  historyList: {
    maxHeight: '260px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  historyRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    backgroundColor: 'rgba(21, 16, 12, 0.4)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
    fontSize: '12px',
  },
  historyLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
    flex: 1.5,
  },
  rowIcon: {
    color: 'var(--color-text-dim)',
    flexShrink: 0,
  },
  rowDate: {
    color: 'var(--color-text-dim)',
    fontWeight: '500',
  },
  rowOpponent: {
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  historyCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px',
    flex: 1.5,
    padding: '0 10px',
    minWidth: 0,
  },
  rowOpening: {
    fontWeight: '600',
    color: 'var(--color-brand-bronze)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  rowMoves: {
    fontSize: '10px',
    color: 'var(--color-text-dim)',
  },
  historyRight: {
    flex: 0.5,
    textAlign: 'right',
  },
  rowResult: {
    fontWeight: '800',
    fontSize: '11px',
    letterSpacing: '0.02em',
  },
  emptyState: {
    textAlign: 'center',
    padding: '30px 20px',
    color: 'var(--color-text-dim)',
    fontSize: '12px',
  }
};
