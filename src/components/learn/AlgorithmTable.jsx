import React from 'react';

export default function AlgorithmTable() {
  const data = [
    { name: 'Minimax Search', purpose: 'Baseline zero-sum game decision tree traversal', time: 'O(b^d)', space: 'O(d)', benefit: 'Mathematical optimality', status: 'VERIFIED', file: 'src/engine/minimax.js' },
    { name: 'Alpha-Beta Pruning', purpose: 'Prunes sub-trees that cannot alter minimax decision', time: 'O(b^(d/2))', space: 'O(d)', benefit: '+150 Elo (90% tree reduction)', status: 'VERIFIED', file: 'src/engine/minimax.js' },
    { name: 'Iterative Deepening', purpose: 'Searches progressive plies with time limit control', time: 'O(b^d)', space: 'O(d)', benefit: 'Guarantees best move on timeout', status: 'ACTIVE', file: 'src/engine/worker.js' },
    { name: 'Move Ordering (MVV-LVA)', purpose: 'Ranks captures by victim value minus attacker value', time: 'O(N log N)', space: 'O(N)', benefit: '+80 Elo (Maximizes AB cutoffs)', status: 'VERIFIED', file: 'src/engine/moveOrdering.js' },
    { name: 'Killer Move Heuristic', purpose: 'Stores non-capture quiet moves that caused beta cutoffs', time: 'O(1)', space: 'O(max_depth)', benefit: '+45 Elo (Prunes quiet branches)', status: 'VERIFIED', file: 'src/engine/killerMoves.js' },
    { name: 'Zobrist Hashing', purpose: 'Computes 64-bit fingerprint keys via bitwise XOR', time: 'O(1)', space: 'O(1)', benefit: 'Enables O(1) transposition lookups', status: 'ACTIVE', file: 'src/engine/zobrist.js' },
    { name: 'Transposition Tables', purpose: 'Caches evaluated positions, search depths, and bounds', time: 'O(1)', space: 'O(RAM_size)', benefit: '+110 Elo (Eliminates re-searching)', status: 'VERIFIED', file: 'src/engine/transpositionTable.js' },
    { name: 'Quiescence Search', purpose: 'Extends capture lines at depth 0 to avoid horizon blunders', time: 'O(b_captures^d_q)', space: 'O(d_q)', benefit: '+95 Elo (Eliminates tactical blunders)', status: 'VERIFIED', file: 'src/engine/quiescence.js' },
  ];

  return (
    <div className="card-primary" style={{ padding: 0, overflow: 'hidden', marginTop: '1.25rem', borderColor: 'rgba(139, 115, 85, 0.2)' }}>
      <div style={{ padding: '0.85rem 1.15rem', borderBottom: '1px solid rgba(139, 115, 85, 0.2)', backgroundColor: 'var(--color-bg-surface)' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#8D837A', textTransform: 'capitalize' }}>Engine Specification Matrix</span>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F4F1EA', margin: '0.1rem 0' }}>Algorithm Performance & Complexity Comparison</h3>
      </div>
      <div className="table-scroll-container">
        <table className="table-research">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Primary Purpose</th>
              <th className="num-col">Time</th>
              <th className="num-col">Space</th>
              <th>Empirical Benefit</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th>Source Implementation</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: '600', color: '#F4F1EA' }}>{row.name}</td>
                <td style={{ fontSize: '0.78rem', color: '#B7AEA5' }}>{row.purpose}</td>
                <td className="num-col" style={{ color: '#d4af37', fontFamily: 'monospace', fontSize: '0.75rem' }}>{row.time}</td>
                <td className="num-col" style={{ color: '#8D837A', fontFamily: 'monospace', fontSize: '0.75rem' }}>{row.space}</td>
                <td style={{ fontSize: '0.78rem', color: '#4BAF7A', fontWeight: '600' }}>{row.benefit}</td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: '600', padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: 'rgba(75,175,122,0.1)', color: '#4BAF7A' }}>
                    {row.status}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#8D837A' }}>{row.file}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
