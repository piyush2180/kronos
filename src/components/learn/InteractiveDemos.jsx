import React, { useState } from 'react';
import CrossNav from './CrossNav';

export default function InteractiveDemos() {
  const [activeDemo, setActiveDemo] = useState('tree');
  const [ttSimHits, setTtSimHits] = useState(142);
  const [ttSimMisses, setTtSimMisses] = useState(28);

  const triggerLookup = () => {
    if (Math.random() > 0.3) {
      setTtSimHits(prev => prev + 1);
    } else {
      setTtSimMisses(prev => prev + 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#F4F1EA', margin: 0 }}>Interactive Visualizations</h2>
        <p style={{ fontSize: '0.85rem', color: '#B7AEA5', margin: '0.2rem 0 0 0' }}>Visual algorithm simulators and heuristic execution demos.</p>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <button onClick={() => setActiveDemo('tree')} className={activeDemo === 'tree' ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: '0.78rem' }}>
          Search Tree Pruning Demo
        </button>
        <button onClick={() => setActiveDemo('tt')} className={activeDemo === 'tt' ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: '0.78rem' }}>
          Transposition Table Cache Simulator
        </button>
        <button onClick={() => setActiveDemo('pst')} className={activeDemo === 'pst' ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: '0.78rem' }}>
          Piece-Square Table Heatmap
        </button>
      </div>

      {activeDemo === 'tree' && (
        <div className="card-primary" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderColor: 'rgba(139, 115, 85, 0.2)' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#8D837A', textTransform: 'capitalize' }}>Alpha-Beta Cutoff Simulator</span>
          <div style={{ backgroundColor: '#1E1713', padding: '1.25rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.825rem', color: '#B7AEA5', lineHeight: 1.6, border: '1px solid rgba(139, 115, 85, 0.2)' }}>
            <div style={{ color: '#F4F1EA' }}>[Root Depth 0] Maximize</div>
            <div>├── [Move 1: e4] Eval: +0.30 (Alpha updated to +0.30)</div>
            <div>├── [Move 2: d4] Eval: +0.15 (Lesser than Alpha, ignore)</div>
            <div style={{ color: '#E57373' }}>├── [Move 3: Nf3] Branch Pruned! (Beta cutoff triggered at sub-node score ≥ +0.30)</div>
            <div style={{ color: '#4BAF7A', marginTop: '0.5rem' }}>✓ Result: 2 of 4 branches searched. 50% search acceleration.</div>
          </div>
        </div>
      )}

      {activeDemo === 'tt' && (
        <div className="card-primary" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderColor: 'rgba(139, 115, 85, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#8D837A', textTransform: 'capitalize' }}>Transposition Cache Simulator</span>
            <button className="btn-secondary" style={{ fontSize: '0.75rem' }} onClick={triggerLookup}>Simulate Position Lookup</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="card-flat" style={{ borderColor: 'rgba(139, 115, 85, 0.2)' }}>
              <span style={{ fontSize: '0.7rem', color: '#8D837A' }}>Cache Hits</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#4BAF7A' }}>{ttSimHits}</div>
            </div>
            <div className="card-flat" style={{ borderColor: 'rgba(139, 115, 85, 0.2)' }}>
              <span style={{ fontSize: '0.7rem', color: '#8D837A' }}>Cache Misses</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#E57373' }}>{ttSimMisses}</div>
            </div>
            <div className="card-flat" style={{ borderColor: 'rgba(139, 115, 85, 0.2)' }}>
              <span style={{ fontSize: '0.7rem', color: '#8D837A' }}>Hit Ratio</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#d4af37' }}>{Math.round((ttSimHits / (ttSimHits + ttSimMisses)) * 100)}%</div>
            </div>
          </div>
        </div>
      )}

      {activeDemo === 'pst' && (
        <div className="card-primary" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderColor: 'rgba(139, 115, 85, 0.2)' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#8D837A', textTransform: 'capitalize' }}>Knight Positional Heatmap (Midgame)</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px', maxWidth: '320px', margin: '0 auto' }}>
            {[-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50].map((val, idx) => (
              <div key={idx} style={{ backgroundColor: val > 10 ? 'rgba(75,175,122,0.2)' : val > 0 ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)', padding: '0.5rem 0.2rem', textAlign: 'center', fontSize: '0.68rem', fontWeight: '600', borderRadius: '3px', color: val > 10 ? '#4BAF7A' : val > 0 ? '#d4af37' : '#8D837A' }}>
                {val}
              </div>
            ))}
          </div>
          <span style={{ textAlign: 'center', fontSize: '0.75rem', color: '#8D837A' }}>Higher values (+20) reward controlling central squares e4, d4, e5, d5.</span>
        </div>
      )}

      <CrossNav title="Execute live tournaments in Benchmark Workspace" />
    </div>
  );
}
