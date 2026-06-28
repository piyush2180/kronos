import React, { useState, useEffect } from 'react';
import { BenchmarkDataService } from '../../services/benchmarkService';
import CrossNav from './CrossNav';

export default function ResearchDocs({ onSelectSource }) {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await BenchmarkDataService.getExperiments();
        setExperiments(data);
      } catch {
        setExperiments([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#F4F1EA', margin: 0 }}>Research Documentation & Datasets</h2>
        <p style={{ fontSize: '0.85rem', color: '#B7AEA5', margin: '0.2rem 0 0 0' }}>Verified empirical benchmark logs, SPRT manifests, and Stockfish calibration records.</p>
      </div>

      {loading ? (
        <div className="card-primary" style={{ textAlign: 'center', color: '#8D837A', borderColor: 'rgba(139, 115, 85, 0.2)' }}>Loading research artifacts...</div>
      ) : experiments.length === 0 ? (
        <div className="card-primary" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'center', borderColor: 'rgba(139, 115, 85, 0.2)' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F4F1EA' }}>No verified benchmark has been generated yet.</span>
          <p style={{ fontSize: '0.825rem', color: '#B7AEA5', maxWidth: '480px', margin: 0 }}>
            Execute an automated research tournament using <code style={{ color: '#d4af37' }}>npm run research</code> to populate reproducible empirical dataset manifests.
          </p>
        </div>
      ) : (
        <div className="card-primary" style={{ padding: 0, overflow: 'hidden', borderColor: 'rgba(139, 115, 85, 0.2)' }}>
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: '1px solid rgba(139, 115, 85, 0.2)', backgroundColor: 'var(--color-bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#8D837A', textTransform: 'capitalize' }}>Empirical Dataset Index</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F4F1EA', margin: '0.1rem 0' }}>Verified Benchmark Manifests ({experiments.length})</h3>
            </div>
            <button className="btn-ghost" style={{ fontSize: '0.75rem', color: '#4BAF7A' }} onClick={() => onSelectSource && onSelectSource('benchmark/output/index.json')}>
              View Manifest Index ↗
            </button>
          </div>
          <div className="table-scroll-container">
            <table className="table-research">
              <thead>
                <tr>
                  <th>Experiment ID</th>
                  <th>Engine Matchup</th>
                  <th className="num-col">Games</th>
                  <th className="num-col">Elo Difference</th>
                  <th style={{ textAlign: 'center' }}>Certification</th>
                </tr>
              </thead>
              <tbody>
                {experiments.map((exp) => (
                  <tr key={exp.id}>
                    <td style={{ fontWeight: '600', color: '#F4F1EA', fontFamily: 'monospace' }}>{exp.name}</td>
                    <td style={{ color: '#B7AEA5' }}>{exp.engineA} vs {exp.engineB}</td>
                    <td className="num-col" style={{ color: '#B7AEA5' }}>{exp.games}</td>
                    <td className="num-col" style={{ color: '#4BAF7A', fontWeight: '600' }}>+{exp.stats.eloDiff} Elo</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', backgroundColor: exp.certification === 'RESEARCH READY' ? 'rgba(75, 175, 122, 0.1)' : 'rgba(229, 115, 115, 0.1)', color: exp.certification === 'RESEARCH READY' ? '#4BAF7A' : '#E57373' }}>
                        {exp.certification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CrossNav title="Inspect raw datasets in Research Archive" />
    </div>
  );
}
