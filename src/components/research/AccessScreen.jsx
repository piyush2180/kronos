import React from 'react';
import { ShieldCheck, Cpu, ArrowRight, Lock, Terminal, CheckCircle2 } from 'lucide-react';
import { colors, spacing, geometry, typography } from '../../theme/designTokens';

export default function AccessScreen({ onEnter }) {
  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.card} className="panel-card">
        <div style={styles.headerBadge}>
          <Lock size={14} color={colors.goldAccent} />
          <span>RESTRICTED ACCESS WORKSPACE</span>
        </div>
        
        <h1 style={styles.title}>Kronos Research Lab</h1>
        <p style={styles.subtitle}>
          Internal engineering environment for maintainers, engine developers, and research collaborators.
        </p>

        <div style={styles.statusGrid}>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Authorization Status</span>
            <span style={styles.statusValueSuccess}>
              <CheckCircle2 size={13} /> Authorized
            </span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Assigned Role</span>
            <span style={styles.statusValue}>Project Owner</span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Workspace Version</span>
            <span style={styles.statusValue}>Research Suite v2</span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Benchmark Pipeline</span>
            <span style={styles.statusValueSuccess}>
              <CheckCircle2 size={13} /> Verified
            </span>
          </div>
        </div>

        <div style={styles.disclaimerBox}>
          <Terminal size={14} color={colors.textSecondary} />
          <span>This workstation contains telemetry tools, SPRT verification routines, and raw empirical dataset inspectors.</span>
        </div>

        <button style={styles.enterBtn} onClick={onEnter}>
          <span>Enter Engineering Workstation</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.bgBase
  },
  card: {
    width: '100%',
    maxWidth: '540px',
    backgroundColor: colors.bgSurface,
    border: `1px solid ${colors.borderDefault}`,
    borderRadius: geometry.radiusCard,
    padding: spacing.xl,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
  },
  headerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(200, 159, 61, 0.1)',
    color: colors.goldAccent,
    border: '1px solid rgba(200, 159, 61, 0.3)',
    borderRadius: '20px',
    padding: '0.3rem 0.8rem',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    marginBottom: spacing.xl
  },
  title: {
    fontSize: typography.titlePage,
    fontWeight: 800,
    color: colors.textPrimary,
    margin: '0 0 0.5rem 0'
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: 1.5,
    marginBottom: spacing.xl
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl
  },
  statusItem: {
    backgroundColor: colors.bgBase,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: geometry.radiusCard,
    padding: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  statusLabel: {
    fontSize: '0.7rem',
    color: colors.textMuted,
    fontWeight: 600,
    marginBottom: '0.25rem'
  },
  statusValue: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: colors.textPrimary
  },
  statusValueSuccess: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: colors.success,
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem'
  },
  disclaimerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(141, 131, 122, 0.08)',
    border: '1px solid rgba(141, 131, 122, 0.2)',
    borderRadius: geometry.radiusInteractive,
    padding: `${spacing.md} ${spacing.lg}`,
    fontSize: '0.75rem',
    color: colors.textSecondary,
    textAlign: 'left',
    marginBottom: spacing.xl
  },
  enterBtn: {
    width: '100%',
    backgroundColor: colors.goldAccent,
    color: colors.bgBase,
    border: 'none',
    borderRadius: geometry.radiusInteractive,
    padding: spacing.md,
    fontSize: typography.body,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    transition: 'all 0.2s ease'
  }
};
