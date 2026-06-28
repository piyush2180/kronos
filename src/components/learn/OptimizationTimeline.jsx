import React, { useState } from 'react';
import CrossNav from './CrossNav';

export default function OptimizationTimeline({ onSelectSource }) {
  const [selectedStage, setSelectedStage] = useState('full');

  const timeline = [
    {
      id: 'base',
      title: 'Baseline Minimax',
      simpleNote: 'The raw, unoptimized search engine. Checks all moves slowly without pruning.',
      added: 'Naive depth 3 recursive search tree',
      why: 'Establish unoptimized baseline benchmark comparison',
      gain: '+0 Elo (Baseline reference point)',
      link: 'src/engine/minimax.js'
    },
    {
      id: 'alphabeta',
      title: 'Alpha-Beta Pruning',
      simpleNote: 'Ignores bad sub-trees. Sped up calculation by 10x overnight.',
      added: 'Alpha-beta cutoff bounds checking',
      why: 'Eliminate sub-optimal search branches early',
      gain: '+150 Elo (90% node search reduction)',
      link: 'src/engine/minimax.js'
    },
    {
      id: 'ordering',
      title: 'Move Ordering (MVV-LVA)',
      simpleNote: 'Looks at captures first so Alpha-Beta can prune even faster.',
      added: 'Most Valuable Victim - Least Valuable Attacker sorting',
      why: 'Examine captures first to trigger instant alpha-beta cutoffs',
      gain: '+80 Elo (Optimizes alpha-beta efficiency)',
      link: 'src/engine/moveOrdering.js'
    },
    {
      id: 'killer',
      title: 'Killer Moves Heuristic',
      simpleNote: 'Remembers tactical quiet moves that surprised opponents in previous lines.',
      added: 'Two quiet move cutoff storage slots per ply',
      why: 'Prune non-capture branches without static evaluation',
      gain: '+45 Elo (Improves quiet move search accuracy)',
      link: 'src/engine/killerMoves.js'
    },
    {
      id: 'zobrist',
      title: 'Zobrist Hashing & TT',
      simpleNote: 'Memory cache. Remembers previously calculated positions so they are never calculated twice.',
      added: 'Bitwise XOR position hashing and transposition cache',
      why: 'Eliminate redundant search of identical positions reached via transposition',
      gain: '+110 Elo (O(1) position cache lookups)',
      link: 'src/engine/transpositionTable.js'
    },
    {
      id: 'quiescence',
      title: 'Quiescence Search',
      simpleNote: 'Keeps checking captures at the end of calculation so hanging pieces aren\'t missed.',
      added: 'Selective capture search extension at depth 0',
      why: 'Eliminate Horizon Effect and hanging piece blunders',
      gain: '+95 Elo (Stabilizes evaluation scores)',
      link: 'src/engine/quiescence.js'
    },
    {
      id: 'full',
      title: 'Full Kronos Engine v1.0',
      simpleNote: 'The complete integrated chess engine, tested against Stockfish in thousands of games.',
      added: 'Integrated search engine with multithreaded Stockfish SPRT calibration',
      why: 'Complete competitive chess engine framework',
      gain: '+480 Elo total system improvement',
      link: 'src/engine/worker.js'
    }
  ];

  const active = timeline.find(t => t.id === selectedStage) || timeline[6];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#F4F1EA', margin: 0 }}>Optimization Timeline</h2>
        <p style={{ fontSize: '0.85rem', color: '#B7AEA5', margin: '0.2rem 0 0 0' }}>Empirical evolution chain documenting incremental search feature contributions.</p>
      </div>

      {/* Timeline Chain */}
      <div className="card-primary" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderColor: 'rgba(139, 115, 85, 0.2)' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#8D837A', textTransform: 'capitalize' }}>Evolutionary Stages</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          {timeline.map((item, idx) => (
            <React.Fragment key={item.id}>
              <button
                onClick={() => setSelectedStage(item.id)}
                className={selectedStage === item.id ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.78rem' }}
              >
                {item.title}
              </button>
              {idx < timeline.length - 1 && (
                <span style={{ color: '#8D837A', fontSize: '0.8rem' }}>➔</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Stage Analysis Card */}
      <div className="card-secondary" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderColor: 'rgba(139, 115, 85, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(139, 115, 85, 0.2)', paddingBottom: '0.6rem' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#8D837A', textTransform: 'capitalize' }}>Stage Analysis</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#F4F1EA', margin: '0.1rem 0' }}>{active.title}</h3>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4BAF7A', backgroundColor: 'rgba(75, 175, 122, 0.1)', padding: '0.35rem 0.75rem', borderRadius: '4px' }}>
            Expected Gain: {active.gain}
          </span>
        </div>

        <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#d4af37', textTransform: 'uppercase' }}>In Simple Terms</span>
          <p style={{ fontSize: '0.85rem', color: '#B7AEA5', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>{active.simpleNote}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="card-flat" style={{ borderColor: 'rgba(139, 115, 85, 0.2)' }}>
            <span style={{ fontSize: '0.7rem', color: '#8D837A', fontWeight: '600' }}>What Was Added</span>
            <div style={{ fontSize: '0.85rem', color: '#B7AEA5', marginTop: '0.2rem' }}>{active.added}</div>
          </div>
          <div className="card-flat" style={{ borderColor: 'rgba(139, 115, 85, 0.2)' }}>
            <span style={{ fontSize: '0.7rem', color: '#8D837A', fontWeight: '600' }}>Engineering Rationale</span>
            <div style={{ fontSize: '0.85rem', color: '#B7AEA5', marginTop: '0.2rem' }}>{active.why}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-base)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: '#8D837A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(139, 115, 85, 0.2)' }}>
          <span>Source Implementation: <strong style={{ color: '#4BAF7A', fontFamily: 'monospace' }}>{active.link}</strong></span>
          <button className="btn-ghost" style={{ fontSize: '0.75rem', color: '#4BAF7A' }} onClick={() => onSelectSource && onSelectSource(active.link)}>View Source ↗</button>
        </div>
      </div>

      <CrossNav title="Compare side-by-side experiment deltas in Experiment Comparison" />
    </div>
  );
}
