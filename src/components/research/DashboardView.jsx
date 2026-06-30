import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus } from 'lucide-react';
import EmptyState from './EmptyState';

export default function DashboardView({ experiments = [], onNavigate, onInspect }) {
  if (experiments.length === 0) {
    return <EmptyState />;
  }

  const latest = experiments[0];
  const nodes = latest.telemetryA?.nodesSearched || 0;
  const nps = latest.telemetryA?.nps || latest.telemetryA?.nodesPerSecond || 0;
  const branchingFactor = latest.telemetryA?.branchingFactor || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#d4af37', textTransform: 'capitalize' }}>Kronos engine lab</span>
          <h2 className="heading-page" style={{ margin: '0.2rem 0' }}>Research dashboard</h2>
          <p className="text-subtitle">Empirical research telemetry and active engine calibration metrics.</p>
        </div>
        <button className="btn-primary" onClick={() => onNavigate('runner')}>
          <Plus size={15} />
          <span>New benchmark</span>
        </button>
      </div>

      {/* 2. Engineering Status Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', backgroundColor: 'var(--color-bg-surface)', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.78rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--color-text-dim)' }}>Branch</span>
          <span style={{ fontWeight: '600' }}>{latest.repositoryBranch || 'main'}</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--color-text-dim)' }}>Commit</span>
          <span style={{ fontWeight: '600' }}>{latest.gitCommitHash ? latest.gitCommitHash.substring(0, 7) : 'HEAD'}</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--color-text-dim)' }}>Datasets</span>
          <span style={{ fontWeight: '600' }}>{experiments.length} Loaded</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--color-text-dim)' }}>Integrity</span>
          <span style={{ color: '#34D399', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ShieldCheck size={13} /> {latest.certification || 'Verified'}
          </span>
        </div>
      </div>

      {/* 3. Live Telemetry Stream */}
      <div className="card-secondary" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34D399', boxShadow: '0 0 8px #34D399' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>Empirical engine telemetry monitor</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-dim)' }}>Latest dataset: {latest.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>Branching factor</span>
            <span style={{ fontSize: '1.15rem', fontWeight: '700', color: '#60A5FA' }}>{branchingFactor}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>Nodes evaluated</span>
            <span style={{ fontSize: '1.15rem', fontWeight: '700', color: '#34D399' }}>{nodes.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>NPS (Nodes/Sec)</span>
            <span style={{ fontSize: '1.15rem', fontWeight: '700' }}>{nps.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>Active tournament</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#d4af37' }}>{latest.engineA} vs {latest.engineB}</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Experiments Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="heading-section">Recent experiment packages</h3>
            <p className="text-subtitle">Empirical test suites stored in benchmark/output/</p>
          </div>
          <button className="btn-ghost" onClick={() => onNavigate('archive')}>
            View all archive &rarr;
          </button>
        </div>

        <div className="card-primary" style={{ padding: 0, overflow: 'hidden' }}>
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
                  <td className="num-col" style={{ color: '#34D399', fontWeight: '600' }}>+{exp.stats.eloDiff} Elo</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', backgroundColor: exp.certification === 'RESEARCH READY' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: exp.certification === 'RESEARCH READY' ? '#34D399' : '#FCA5A5' }}>
                      {exp.certification}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-ghost" style={{ fontSize: '0.75rem', color: '#d4af37' }} onClick={() => onInspect(exp)}>Inspect &rarr;</button>
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
