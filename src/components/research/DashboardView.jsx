import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus } from 'lucide-react';
import EmptyState from './EmptyState';
import { colors, spacing, geometry, typography } from '../../theme/designTokens';

const SUCCESS_COLOR = colors.success;
const INFO_COLOR = colors.goldAccent;

export default function DashboardView({ experiments = [], onNavigate, onInspect }) {
  if (experiments.length === 0) {
    return <EmptyState />;
  }

  const latest = experiments[0];
  const nodes = latest.telemetryA?.nodesSearched || 0;
  const nps = latest.telemetryA?.nps || latest.telemetryA?.nodesPerSecond || 0;
  const branchingFactor = latest.telemetryA?.branchingFactor || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }} className="animate-fade-in">
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: spacing.sm }}>
        <div>
          <span style={{ fontSize: '0.68rem', fontWeight: '600', color: colors.goldAccent, textTransform: 'capitalize' }}>Kronos engine lab</span>
          <h2 className="heading-page" style={{ margin: '0.2rem 0' }}>Research dashboard</h2>
          <p className="text-subtitle">Empirical research telemetry and active engine calibration metrics.</p>
        </div>
        <button className="btn-primary" onClick={() => onNavigate('runner')} style={{ borderRadius: geometry.radiusInteractive }}>
          <Plus size={15} />
          <span>New benchmark</span>
        </button>
      </div>

      {/* 2. Engineering Status Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, backgroundColor: 'rgba(255, 255, 255, 0.01)', padding: `${spacing.sm} ${spacing.lg}`, borderRadius: geometry.radiusInteractive, fontSize: '0.78rem', flexWrap: 'wrap', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: '0.2rem 0.5rem', borderRadius: geometry.radiusBadge, backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
          <span style={{ color: colors.textMuted }}>Branch</span>
          <span style={{ fontWeight: '600', color: colors.textPrimary }}>{latest.repositoryBranch || 'main'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: '0.2rem 0.5rem', borderRadius: geometry.radiusBadge, backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
          <span style={{ color: colors.textMuted }}>Commit</span>
          <span style={{ fontWeight: '600', color: colors.textPrimary }}>{latest.gitCommitHash ? latest.gitCommitHash.substring(0, 7) : 'HEAD'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: '0.2rem 0.5rem', borderRadius: geometry.radiusBadge, backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
          <span style={{ color: colors.textMuted }}>Datasets</span>
          <span style={{ fontWeight: '600', color: colors.textPrimary }}>{experiments.length} Loaded</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: '0.2rem 0.5rem', borderRadius: geometry.radiusBadge, backgroundColor: 'rgba(75, 175, 122, 0.08)', border: '1px solid rgba(75, 175, 122, 0.2)' }}>
          <span style={{ color: colors.textMuted }}>Integrity</span>
          <span style={{ color: SUCCESS_COLOR, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ShieldCheck size={13} /> {latest.certification || 'Verified'}
          </span>
        </div>
      </div>

      {/* 3. Live Telemetry Stream */}
      <div className="card-secondary" style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg, padding: spacing.lg, borderRadius: geometry.radiusCard, border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <span className="active-pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: SUCCESS_COLOR, boxShadow: `0 0 8px ${SUCCESS_COLOR}`, display: 'inline-block' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: colors.textPrimary }}>Empirical engine telemetry monitor</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: colors.textMuted }}>Latest dataset: {latest.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: spacing.lg }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
            <span style={{ fontSize: '0.7rem', color: colors.textMuted }}>Branching factor</span>
            <span style={{ fontSize: '1.15rem', fontWeight: '700', color: INFO_COLOR }}>{branchingFactor}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
            <span style={{ fontSize: '0.7rem', color: colors.textMuted }}>Nodes evaluated</span>
            <span style={{ fontSize: '1.15rem', fontWeight: '700', color: SUCCESS_COLOR }}>{nodes.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
            <span style={{ fontSize: '0.7rem', color: colors.textMuted }}>NPS (Nodes/Sec)</span>
            <span style={{ fontSize: '1.15rem', fontWeight: '700', color: colors.textPrimary }}>{nps.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
            <span style={{ fontSize: '0.7rem', color: colors.textMuted }}>Active tournament</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: colors.goldAccent }}>{latest.engineA} vs {latest.engineB}</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Experiments Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="heading-section">Recent experiment packages</h3>
            <p className="text-subtitle">Empirical test suites stored in benchmark/output/</p>
          </div>
          <button className="btn-ghost" onClick={() => onNavigate('archive')}>
            View all archive &rarr;
          </button>
        </div>

        <div className="card-primary" style={{ padding: 0, overflow: 'hidden', borderRadius: geometry.radiusCard, border: 'none' }}>
          <table className="table-research">
            <thead>
              <tr>
                <th>Experiment Name</th>
                <th>Engine Pair</th>
                <th className="num-col">Games</th>
                <th className="num-col">Elo Diff</th>
                <th style={{ textAlign: 'center' }}>Certification</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {experiments.slice(0, 4).map((exp) => (
                <tr key={exp.id}>
                  <td style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{exp.name}</td>
                  <td>{exp.engineA} vs {exp.engineB}</td>
                  <td className="num-col">{exp.games} games</td>
                  <td className="num-col" style={{ color: SUCCESS_COLOR, fontWeight: '600' }}>+{exp.stats.eloDiff} Elo</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', backgroundColor: exp.certification === 'RESEARCH READY' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: exp.certification === 'RESEARCH READY' ? SUCCESS_COLOR : '#FCA5A5' }}>
                      {exp.certification}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-ghost" style={{ fontSize: '0.75rem', color: 'var(--color-brand-primary)' }} onClick={() => onInspect(exp)}>Inspect &rarr;</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
