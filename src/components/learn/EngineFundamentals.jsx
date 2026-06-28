import React, { useState, useEffect } from 'react';
import CrossNav from './CrossNav';

export default function EngineFundamentals({ onSelectSource }) {
  const [selectedAlgo, setSelectedAlgo] = useState('alphabeta');
  const [ttStep, setTtStep] = useState(0);

  // 1-Second TT Lookup Animation Loop
  useEffect(() => {
    if (selectedAlgo === 'transposition') {
      const interval = setInterval(() => {
        setTtStep((prev) => (prev + 1) % 5);
      }, 700);
      return () => clearInterval(interval);
    }
  }, [selectedAlgo]);

  const algos = {
    alphabeta: {
      name: 'Alpha-Beta Pruning',
      simpleNote: 'Think of it as ignoring bad moves early. If you already know one move gives you a winning position (+5), you don\'t waste time checking moves for your opponent that let them win even more (+8).',
      purpose: 'Prunes branches that cannot affect the final minimax decision.',
      complexity: 'O(b^(d/2)) optimal',
      file: 'src/engine/minimax.js',
      advantages: 'Cuts search space by up to 90% when paired with move ordering.',
      disadvantages: 'Highly dependent on searching good moves first.',
      kronosUse: 'Main search routine for all engine evaluations.'
    },
    transposition: {
      name: 'Transposition Tables',
      purpose: 'Caches evaluated positions, search depths, and bounds.',
      simpleNote: 'In chess, different move sequences often reach the exact same board position! Instead of calculating that position again from scratch, Kronos remembers the result in an instant lookup cache.',
      complexity: 'O(1) lookup',
      file: 'src/engine/transpositionTable.js',
      advantages: 'Prevents re-searching identical positions reached via different move orders.',
      disadvantages: 'Requires dedicated RAM cache allocation.',
      kronosUse: 'Stores 100,000+ evaluated positions per tournament.'
    },
    minimax: {
      name: 'Minimax Search',
      simpleNote: 'Assumes your opponent will always make their absolute best move. You choose the path that gives you the highest score against their best response.',
      purpose: 'Standard decision-rule algorithm for zero-sum turn games.',
      complexity: 'O(b^d)',
      file: 'src/engine/minimax.js',
      advantages: 'Guarantees mathematically optimal moves for finite depths.',
      disadvantages: 'Exponential tree explosion without pruning.',
      kronosUse: 'Baseline comparison target in research benchmark suites.'
    },
    iterative: {
      name: 'Iterative Deepening',
      simpleNote: 'Searches 1 move ahead, then 2 moves ahead, then 3... If time runs out, the engine safely plays the best move from the last fully completed search depth.',
      purpose: 'Searches progressively deeper plies within time limits.',
      complexity: 'O(b^d)',
      file: 'src/engine/worker.js',
      advantages: 'Ensures best move availability if search times out mid-depth.',
      disadvantages: 'Slight overhead from repeating shallow searches.',
      kronosUse: 'Controls search depth timing in Web Worker threads.'
    },
    moveordering: {
      name: 'Move Ordering & MVV-LVA',
      simpleNote: 'Checks capturing moves first! Specifically: captures using a small piece (like a pawn) to take a big piece (like a queen) are evaluated before quiet moves.',
      purpose: 'Ranks promising moves (Most Valuable Victim - Least Valuable Attacker) first.',
      complexity: 'O(N log N)',
      file: 'src/engine/moveOrdering.js',
      advantages: 'Maximizes alpha-beta pruning efficiency.',
      disadvantages: 'Minor sorting overhead per ply.',
      kronosUse: 'Sorts captures and killer moves prior to branch search.'
    },
    killer: {
      name: 'Killer Move Heuristic',
      simpleNote: 'Remembers non-capture moves that proved so strong in other lines that they forced the opponent to change plans. These "killer moves" are checked early.',
      purpose: 'Stores quiet moves that caused beta cutoffs at identical search depths.',
      complexity: 'O(1) lookup',
      file: 'src/engine/killerMoves.js',
      advantages: 'Prunes non-capture lines rapidly without expensive static eval.',
      disadvantages: 'Limited to two slots per ply depth.',
      kronosUse: 'Prioritized immediately after captures in move ordering.'
    },
    zobrist: {
      name: 'Zobrist Hashing',
      simpleNote: 'Creates a unique 64-bit ID number for every position on the board using lightning-fast XOR math operations.',
      purpose: 'Generates unique 64-bit fingerprint keys for board positions.',
      complexity: 'O(1) update via XOR',
      file: 'src/engine/zobrist.js',
      advantages: 'Allows instant O(1) transposition table indexing.',
      disadvantages: 'Rare risk of hash collisions.',
      kronosUse: 'Indexes every searched position in TT table.'
    },
    quiescence: {
      name: 'Quiescence Search',
      simpleNote: 'Prevents stopping the calculation in the middle of a piece trade. It keeps looking at captures until the position is peaceful ("quiet").',
      purpose: 'Extends search on capture lines at depth 0 to combat Horizon Effect.',
      complexity: 'O(b_captures^d_q)',
      file: 'src/engine/quiescence.js',
      advantages: 'Prevents blundering hanging pieces on evaluation boundaries.',
      disadvantages: 'Increases node counts in tactical melee positions.',
      kronosUse: 'Runs automatically when search depth reaches 0.'
    }
  };

  const curr = algos[selectedAlgo];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#F4F1EA', margin: 0 }}>Engine Fundamentals</h2>
        <p style={{ fontSize: '0.85rem', color: '#B7AEA5', margin: '0.2rem 0 0 0' }}>Core computer chess algorithms explained with step-by-step animations and beginner guides.</p>
      </div>

      {/* Algorithm Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
        {Object.entries(algos).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setSelectedAlgo(key)}
            className={selectedAlgo === key ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.78rem', justifyContent: 'center' }}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Step-by-Step Interactive Diagram Panel */}
      <div className="card-primary" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', borderColor: 'rgba(139, 115, 85, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(139, 115, 85, 0.2)', paddingBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#8D837A', textTransform: 'capitalize' }}>Algorithm Specification</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F4F1EA', margin: '0.1rem 0' }}>{curr.name}</h3>
          </div>
          <button 
            className="btn-ghost"
            style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#4BAF7A', backgroundColor: 'rgba(75, 175, 122, 0.1)' }}
            onClick={() => onSelectSource && onSelectSource(curr.file)}
          >
            Source: {curr.file} ↗
          </button>
        </div>

        {/* Beginner Explanation */}
        <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#d4af37', textTransform: 'uppercase' }}>In Simple Terms (Beginner Explanation)</span>
          <p style={{ fontSize: '0.85rem', color: '#B7AEA5', margin: '0.3rem 0 0 0', lineHeight: 1.5 }}>{curr.simpleNote}</p>
        </div>

        {/* STEP-BY-STEP ANIMATED DIAGRAMS IN WARM DARK BROWN CONTAINER */}
        {selectedAlgo === 'alphabeta' && (
          <div style={{ backgroundColor: '#1E1713', padding: '1.25rem', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', border: '1px solid rgba(139, 115, 85, 0.2)' }}>
            <span style={{ fontSize: '0.7rem', color: '#8D837A', fontWeight: '600' }}>Animated Alpha-Beta Search Tree Pruning</span>
            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#F4F1EA', textAlign: 'center', lineHeight: 1.6 }}>
              <div>ROOT (Depth 0)</div>
              <div style={{ color: '#8D837A' }}>/ &nbsp; &nbsp; | &nbsp; &nbsp; \</div>
              <div>[+3] &nbsp; [+5] &nbsp; <span style={{ color: '#E57373', textDecoration: 'line-through' }}>[+2]</span></div>
              <div style={{ fontSize: '0.75rem', color: '#4BAF7A', marginTop: '0.4rem' }}>
                ✂ β Cutoff Occurs! Third branch (+2) pruned automatically because [+5] is already guaranteed!
              </div>
            </div>
          </div>
        )}

        {selectedAlgo === 'transposition' && (
          <div style={{ backgroundColor: '#1E1713', padding: '1.25rem', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid rgba(139, 115, 85, 0.2)' }}>
            <span style={{ fontSize: '0.7rem', color: '#8D837A', fontWeight: '600', textAlign: 'center' }}>1-Second Transposition Table Cache Flow</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: '0.78rem' }}>
              <span style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', backgroundColor: ttStep >= 0 ? 'rgba(212,175,55,0.15)' : 'transparent', color: ttStep >= 0 ? '#F4F1EA' : '#8D837A' }}>Position</span>
              <span style={{ color: '#8D837A' }}>→</span>
              <span style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', backgroundColor: ttStep >= 1 ? 'rgba(212,175,55,0.15)' : 'transparent', color: ttStep >= 1 ? '#F4F1EA' : '#8D837A' }}>Zobrist Hash</span>
              <span style={{ color: '#8D837A' }}>→</span>
              <span style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', backgroundColor: ttStep >= 2 ? 'rgba(212,175,55,0.15)' : 'transparent', color: ttStep >= 2 ? '#F4F1EA' : '#8D837A' }}>Table Index</span>
              <span style={{ color: '#8D837A' }}>→</span>
              <span style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', backgroundColor: ttStep >= 3 ? 'rgba(75,175,122,0.15)' : 'transparent', color: ttStep >= 3 ? '#4BAF7A' : '#8D837A' }}>Cache Hit ✓</span>
              <span style={{ color: '#8D837A' }}>→</span>
              <span style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', backgroundColor: ttStep >= 4 ? 'rgba(75,175,122,0.25)' : 'transparent', color: ttStep >= 4 ? '#4BAF7A' : '#8D837A', fontWeight: 'bold' }}>Reuse Evaluation!</span>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          <div className="card-flat" style={{ borderColor: 'rgba(139, 115, 85, 0.2)' }}>
            <span style={{ fontSize: '0.7rem', color: '#8D837A', fontWeight: '600' }}>Time Complexity</span>
            <div style={{ fontSize: '0.85rem', color: '#d4af37', fontFamily: 'monospace', marginTop: '0.2rem' }}>{curr.complexity}</div>
          </div>
          <div className="card-flat" style={{ borderColor: 'rgba(139, 115, 85, 0.2)' }}>
            <span style={{ fontSize: '0.7rem', color: '#8D837A', fontWeight: '600' }}>Kronos Integration</span>
            <div style={{ fontSize: '0.85rem', color: '#B7AEA5', marginTop: '0.2rem' }}>{curr.kronosUse}</div>
          </div>
        </div>
      </div>

      <CrossNav title="Observe algorithm performance in Benchmark Runner" />
    </div>
  );
}
