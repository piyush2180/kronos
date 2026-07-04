import React, { useState } from 'react';
import { colors, spacing, geometry, typography } from '../../theme/designTokens';
import { BarChart3, Cpu, Database, TrendingUp } from 'lucide-react';

export default function BenchmarkExplorer() {
  const [selectedMetric, setSelectedMetric] = useState('depth');

  const benchmarkRows = [
    { depth: 2, nodes: 5501, nps: 2515, time: 2187, elo: 358.8, ram: 24.2, desc: 'Rapid shallow checks' },
    { depth: 3, nodes: 42546, nps: 10422, time: 4082, elo: 269.4, ram: 24.5, desc: 'Foundational alpha-beta' },
    { depth: 4, nodes: 150310, nps: 29374, time: 5116, elo: 304.3, ram: 24.9, desc: 'TT caching & ordered moves' },
    { depth: 5, nodes: 1204084, nps: 91291, time: 13187, elo: 462.0, ram: 25.6, desc: 'Full selective search' },
    { depth: 6, nodes: 8521092, nps: 142018, time: 59992, elo: 575.4, ram: 26.8, desc: 'Flagship PVS + LMR + NMP' },
  ];

  const maxNodes = 8521092;
  const maxNps = 142018;
  const maxElo = 600;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }} className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: colors.textPrimary, margin: 0 }}>Benchmark Explorer</h2>
        <p style={{ fontSize: '0.85rem', color: colors.textSecondary, margin: '0.2rem 0 0 0' }}>Explore search metrics, nodes throughput, memory footprints, and playing strength scaling across depths.</p>
      </div>

      {/* Metric Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setSelectedMetric('depth')}
          className={selectedMetric === 'depth' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.78rem', padding: '0.6rem 0.8rem', borderRadius: geometry.radiusInteractive }}
        >
          <TrendingUp size={14} style={{ marginRight: '5px' }} /> Nodes & Telemetry Table
        </button>
        <button
          onClick={() => setSelectedMetric('nps')}
          className={selectedMetric === 'nps' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.78rem', padding: '0.6rem 0.8rem', borderRadius: geometry.radiusInteractive }}
        >
          <Cpu size={14} style={{ marginRight: '5px' }} /> NPS & Search Throughput
        </button>
        <button
          onClick={() => setSelectedMetric('ram')}
          className={selectedMetric === 'ram' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.78rem', padding: '0.6rem 0.8rem', borderRadius: geometry.radiusInteractive }}
        >
          <Database size={14} style={{ marginRight: '5px' }} /> Heap Memory Footprint
        </button>
      </div>

      {/* Main Display Grid */}
      <div className="card-primary" style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, padding: spacing.lg, borderRadius: geometry.radiusCard, borderColor: 'rgba(139, 115, 85, 0.2)' }}>
        {selectedMetric === 'depth' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unified Search Telemetry Matrix</span>
            <div className="table-scroll-container" style={{ margin: 0 }}>
              <table className="table-research" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Search Depth</th>
                    <th className="num-col">Nodes Searched</th>
                    <th className="num-col">NPS (Nodes/Sec)</th>
                    <th className="num-col">Average Clock Time</th>
                    <th className="num-col">Transitive Elo</th>
                    <th className="num-col">RAM Footprint</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkRows.map((row) => (
                    <tr key={row.depth}>
                      <td style={{ fontWeight: '700', color: colors.textPrimary }}>Depth {row.depth}</td>
                      <td className="num-col" style={{ color: colors.textSecondary, fontFamily: 'monospace' }}>{row.nodes.toLocaleString()}</td>
                      <td className="num-col" style={{ color: colors.goldAccent, fontFamily: 'monospace' }}>{row.nps.toLocaleString()}</td>
                      <td className="num-col" style={{ color: colors.textSecondary, fontFamily: 'monospace' }}>{row.time.toLocaleString()} ms</td>
                      <td className="num-col" style={{ color: colors.success, fontWeight: '700' }}>+{row.elo.toFixed(1)}</td>
                      <td className="num-col" style={{ color: colors.textSecondary, fontFamily: 'monospace' }}>{row.ram.toFixed(1)} MB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedMetric === 'nps' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Throughput Scaling (Nodes Per Second)</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
              {benchmarkRows.map((row) => {
                const percentage = (row.nps / maxNps) * 100;
                return (
                  <div key={row.depth} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: colors.textPrimary, fontWeight: '600' }}>Depth {row.depth} ({row.desc})</span>
                      <span style={{ color: colors.goldAccent, fontFamily: 'monospace' }}>{row.nps.toLocaleString()} NPS</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--color-bg-base)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-border-subtle)' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: colors.goldAccent, borderRadius: '4px', transition: 'width 0.5s ease-out' }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: '0.75rem', color: colors.textSecondary, margin: 0 }}>
              * **Search Throughput Analysis**: Moving from Depth 2 to Depth 6 triggers compiler optimization and JIT warmups in the Web Worker, boosting NPS from ~2.5k to over 142k.
            </p>
          </div>
        )}

        {selectedMetric === 'ram' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Memory Stability Profile (RSS Heap RAM Allocation)</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
              {benchmarkRows.map((row) => {
                const percentage = (row.ram / 30) * 100; // normalized to 30MB max
                return (
                  <div key={row.depth} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: colors.textPrimary, fontWeight: '600' }}>Depth {row.depth} Search Path</span>
                      <span style={{ color: colors.success, fontFamily: 'monospace' }}>{row.ram.toFixed(1)} MB</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--color-bg-base)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-border-subtle)' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: colors.success, borderRadius: '4px', transition: 'width 0.5s ease-out' }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: '0.75rem', color: colors.textSecondary, margin: 0 }}>
              * **Heap Stability Verified**: Thanks to pre-allocated buffers and size-bounded Transposition Tables, the memory allocations remain extremely flat (~24.2MB to ~26.8MB), completely bypassing large GC sweeps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
