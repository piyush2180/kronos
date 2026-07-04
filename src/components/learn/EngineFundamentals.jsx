import React, { useState, useEffect } from 'react';
import { colors, spacing, geometry, typography } from '../../theme/designTokens';

export default function EngineFundamentals({ onSelectSource }) {
  const [selectedAlgo, setSelectedAlgo] = useState('alphabeta');
  const [ttStep, setTtStep] = useState(0);

  useEffect(() => {
    if (selectedAlgo === 'transposition') {
      const interval = setInterval(() => {
        setTtStep((prev) => (prev + 1) % 5);
      }, 700);
      return () => clearInterval(interval);
    }
  }, [selectedAlgo]);

  const algos = {
    minimax: {
      name: 'Minimax Search',
      simpleNote: 'Assumes your opponent will always make their absolute best move. You choose the path that gives you the highest score against their best response.',
      purpose: 'Baseline zero-sum game decision tree traversal.',
      complexity: 'O(b^d)',
      file: 'src/engine/minimax.js',
      advantages: 'Guarantees mathematically optimal moves for finite search depths.',
      disadvantages: 'Exponential tree explosion (e.g. depth 5 searches over 10 million nodes).',
      strengthImpact: 'Base Reference (0 Elo)',
      memoryImpact: 'O(d) recursion stack space (extremely low)',
      tradeOffs: 'Simple but search is too shallow to be competitive.',
      pseudocode: `function minimax(node, depth, maximizingPlayer)
  if depth == 0 or node is terminal
    return static_evaluation(node)
  if maximizingPlayer
    value := -infinity
    for each child of node
      value := max(value, minimax(child, depth - 1, false))
    return value
  else
    value := +infinity
    for each child of node
      value := min(value, minimax(child, depth - 1, true))
    return value`,
      cpRef: 'Claude Shannon, "Programming a Computer for Playing Chess" (1950)'
    },
    alphabeta: {
      name: 'Alpha-Beta Pruning',
      simpleNote: 'Ignores bad sub-trees. If you already know move A is better than move B, you don\'t waste time checking how your opponent can punish move B.',
      purpose: 'Prunes branches that cannot affect the final minimax decision.',
      complexity: 'O(b^(d/2)) optimal',
      file: 'src/engine/minimax.js',
      advantages: 'Cuts searched nodes by up to 90% when moves are ordered.',
      disadvantages: 'Highly dependent on searching the best moves first.',
      strengthImpact: '+150 Elo (90% node search reduction)',
      memoryImpact: 'O(d) stack space',
      tradeOffs: 'No search drawbacks; universally mandatory optimization.',
      pseudocode: `function alphabeta(node, depth, alpha, beta, maximizingPlayer)
  if depth == 0 or node is terminal
    return static_evaluation(node)
  if maximizingPlayer
    value := -infinity
    for each child of node
      value := max(value, alphabeta(child, depth - 1, alpha, beta, false))
      alpha := max(alpha, value)
      if alpha >= beta
        break // beta cutoff
    return value
  else
    value := +infinity
    for each child of node
      value := min(value, alphabeta(child, depth - 1, alpha, beta, true))
      beta := min(beta, value)
      if alpha >= beta
        break // alpha cutoff
    return value`,
      cpRef: 'Knuth and Moore, "An Analysis of Alpha-Beta Pruning" (1975)'
    },
    moveordering: {
      name: 'Move Ordering & MVV-LVA',
      simpleNote: 'Checks capturing moves first! Specifically: captures using a small piece (like a pawn) to take a big piece (like a queen) are evaluated before quiet moves.',
      purpose: 'Sorts moves prior to search to trigger early alpha-beta cutoffs.',
      complexity: 'O(N log N) per node',
      file: 'src/engine/moveOrdering.js',
      advantages: 'Maximizes alpha-beta pruning efficiency towards the theoretical limit.',
      disadvantages: 'Minor sorting CPU overhead at every node.',
      strengthImpact: '+80 Elo (maximizes pruning cutoffs)',
      memoryImpact: 'O(N) transient array allocations',
      tradeOffs: 'Must balance sorting complexity against search speed gains.',
      pseudocode: `function orderMoves(moves, board)
  for each move in moves
    if move is capture
      victim := getPieceValue(move.captured)
      attacker := getPieceValue(move.piece)
      move.score := 1000 + (victim - attacker)
    else if move is killer
      move.score := 900
    else
      move.score := historyTable[move.piece][move.to]
  sort(moves, descending)`,
      cpRef: 'Marsland, "A Review of Game-Tree Pruning" (1986)'
    },
    evaluation: {
      name: 'Static Evaluation & PST',
      simpleNote: 'Calculates a score for the board position by summing material values and adding bonuses for active pieces on central squares.',
      purpose: 'Scores a leaf node position in centipawns (1/100 of a pawn value).',
      complexity: 'O(1)',
      file: 'src/engine/evaluation.js',
      advantages: 'Provides high-speed heuristic feedback of board balance.',
      disadvantages: 'Static tables do not capture complex long-term plans.',
      strengthImpact: 'Base evaluation quality anchor',
      memoryImpact: 'O(1) table lookup',
      tradeOffs: 'More complex evaluations slow down nodes/sec throughput.',
      pseudocode: `function evaluate(board)
  score := 0
  for each square on board
    piece := getPiece(square)
    if piece
      val := getMaterialValue(piece)
      pstBonus := PieceSquareTables[piece.type][square]
      if piece.color == white
        score := score + val + pstBonus
      else
        score := score - (val + pstBonus)
  return score`,
      cpRef: 'Dieter Donninger, "Chess Engine Evaluation Mechanics" (1996)'
    },
    zobrist: {
      name: 'Zobrist Hashing',
      simpleNote: 'Generates a unique 64-bit ID number for any board position using lightning-fast XOR bit operations.',
      purpose: 'Computes a unique 64-bit checksum signature for any board setup.',
      complexity: 'O(1) incremental update',
      file: 'src/engine/zobrist.js',
      advantages: 'Fast O(1) table index lookup, updated incrementally during make/undo.',
      disadvantages: 'Negligible risk of hash collisions.',
      strengthImpact: 'Foundation for transposition lookups',
      memoryImpact: 'O(1) storage for random keys bitboard matrix',
      tradeOffs: 'None. Extremely efficient and mandatory for cache speed.',
      pseudocode: `function updateHash(oldHash, move)
  hash := oldHash
  hash := hash XOR pieceKeys[move.piece][move.from]
  hash := hash XOR pieceKeys[move.piece][move.to]
  if move.isCapture
    hash := hash XOR pieceKeys[move.captured][move.to]
  return hash`,
      cpRef: 'Albert Zobrist, "A New Hashing Method with Application to Game Playing" (1970)'
    },
    transposition: {
      name: 'Transposition Tables',
      simpleNote: 'A memory cache. Remembers previously calculated positions so if a different move order reaches the same layout, the engine reuses the score instantly.',
      purpose: 'Caches searched positions, depths, and bounds to avoid redundant searches.',
      complexity: 'O(1) cache access',
      file: 'src/engine/transpositionTable.js',
      advantages: 'Eliminates redundant search of transposed move lines.',
      disadvantages: 'Demands dedicated RAM cache space.',
      strengthImpact: '+110 Elo (O(1) position cache lookups)',
      memoryImpact: 'Size-bounded table (typically ~24MB for 1M entries)',
      tradeOffs: 'Table entries must be cleaned or updated using aging rules.',
      pseudocode: `function storeTT(hash, depth, val, flag, bestMove)
  entry := TT[hash % tableSize]
  if entry.empty or entry.depth <= depth
    entry.hash := hash
    entry.depth := depth
    entry.value := val
    entry.flag := flag
    entry.bestMove := bestMove`,
      cpRef: 'Chess Programming Wiki, "Transposition Table Management"'
    }
  };

  const curr = algos[selectedAlgo];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }} className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: colors.textPrimary, margin: 0 }}>Engine Fundamentals</h2>
        <p style={{ fontSize: '0.85rem', color: colors.textSecondary, margin: '0.2rem 0 0 0' }}>Core computer chess search algorithms and how they build on top of each other.</p>
      </div>

      {/* Selector Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
        {Object.entries(algos).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setSelectedAlgo(key)}
            className={selectedAlgo === key ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.78rem', padding: '0.6rem 0.8rem', justifyContent: 'center', borderRadius: geometry.radiusInteractive }}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Main Algorithm Detail Card */}
      <div className="card-primary" style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, marginTop: spacing.xs, borderColor: 'rgba(139, 115, 85, 0.2)', borderRadius: geometry.radiusCard, padding: spacing.lg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(139, 115, 85, 0.2)', paddingBottom: spacing.sm }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: '600', color: colors.textMuted, textTransform: 'capitalize' }}>Core Spec Sheet</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.textPrimary, margin: '0.1rem 0' }}>{curr.name}</h3>
          </div>
          <button 
            className="btn-ghost"
            style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: colors.success, backgroundColor: 'rgba(75, 175, 122, 0.1)', padding: '0.35rem 0.65rem', borderRadius: geometry.radiusBadge, border: 'none', cursor: 'pointer' }}
            onClick={() => onSelectSource && onSelectSource(curr.file)}
          >
            Open Implementation ↗
          </button>
        </div>

        {/* Intuition Box */}
        <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.04)', padding: spacing.md, borderRadius: geometry.radiusInteractive, border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: colors.goldAccent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Intuition</span>
          <p style={{ fontSize: '0.85rem', color: colors.textSecondary, margin: '0.2rem 0 0 0', lineHeight: 1.45 }}>{curr.simpleNote}</p>
        </div>

        {/* Visual Animation Simulator */}
        {selectedAlgo === 'alphabeta' && (
          <div style={{ backgroundColor: 'var(--color-bg-base)', padding: spacing.md, borderRadius: geometry.radiusInteractive, display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', border: '1px solid var(--color-border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase' }}>Tree Search Cutoff Visualizer</span>
            <div style={{ fontFamily: 'monospace', fontSize: '0.825rem', color: colors.textPrimary, textAlign: 'center', lineHeight: 1.5 }}>
              <div>ROOT (d=0)</div>
              <div style={{ color: colors.textMuted }}>/ &nbsp; &nbsp; | &nbsp; &nbsp; \</div>
              <div>[+0.30] &nbsp; [+0.50] &nbsp; <span style={{ color: colors.danger, textDecoration: 'line-through' }}>[+0.12]</span></div>
              <div style={{ fontSize: '0.75rem', color: colors.success, marginTop: '0.4rem', fontWeight: '600' }}>
                ✂ Beta cutoff triggered. The third sub-tree (+0.12) is skipped because opponent can force a better response!
              </div>
            </div>
          </div>
        )}

        {selectedAlgo === 'transposition' && (
          <div style={{ backgroundColor: 'var(--color-bg-base)', padding: spacing.md, borderRadius: geometry.radiusInteractive, display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--color-border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: colors.textMuted, fontWeight: '600', textAlign: 'center', textTransform: 'uppercase' }}>TT Lookup Sequence</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: '0.78rem' }}>
              <span style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', backgroundColor: ttStep >= 0 ? 'rgba(200,159,61,0.12)' : 'transparent', color: ttStep >= 0 ? colors.textPrimary : colors.textMuted }}>Position</span>
              <span style={{ color: colors.textMuted }}>→</span>
              <span style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', backgroundColor: ttStep >= 1 ? 'rgba(200,159,61,0.12)' : 'transparent', color: ttStep >= 1 ? colors.textPrimary : colors.textMuted }}>Zobrist Key</span>
              <span style={{ color: colors.textMuted }}>→</span>
              <span style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', backgroundColor: ttStep >= 2 ? 'rgba(200,159,61,0.12)' : 'transparent', color: ttStep >= 2 ? colors.textPrimary : colors.textMuted }}>Table Index</span>
              <span style={{ color: colors.textMuted }}>→</span>
              <span style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', backgroundColor: ttStep >= 3 ? 'rgba(75,175,122,0.12)' : 'transparent', color: ttStep >= 3 ? colors.success : colors.textMuted }}>Cache Hit ✓</span>
              <span style={{ color: colors.textMuted }}>→</span>
              <span style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', backgroundColor: ttStep >= 4 ? 'rgba(75,175,122,0.2)' : 'transparent', color: ttStep >= 4 ? colors.success : colors.textMuted, fontWeight: 'bold' }}>Cutoff Leaf Node</span>
            </div>
          </div>
        )}

        {/* Technical Specification Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ fontSize: '0.78rem', color: colors.textSecondary }}><strong style={{ color: colors.textMuted }}>Time Complexity:</strong> <code style={{ color: colors.goldAccent, fontFamily: 'monospace' }}>{curr.complexity}</code></div>
            <div style={{ fontSize: '0.78rem', color: colors.textSecondary }}><strong style={{ color: colors.textMuted }}>Memory Cost:</strong> {curr.memoryImpact}</div>
            <div style={{ fontSize: '0.78rem', color: colors.textSecondary }}><strong style={{ color: colors.textMuted }}>Strength Impact:</strong> <span style={{ color: colors.success, fontWeight: '600' }}>{curr.strengthImpact}</span></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ fontSize: '0.78rem', color: colors.textSecondary }}><strong style={{ color: colors.textMuted }}>System Trade-Offs:</strong> {curr.tradeOffs}</div>
            <div style={{ fontSize: '0.78rem', color: colors.textSecondary }}><strong style={{ color: colors.textMuted }}>Literature Reference:</strong> <span style={{ fontStyle: 'italic', fontSize: '0.75rem' }}>{curr.cpRef}</span></div>
          </div>
        </div>

        {/* Pseudocode Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
          <span style={{ fontSize: '0.7rem', color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>Pseudocode Implementation</span>
          <pre style={{ margin: 0, padding: spacing.md, backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border-subtle)', borderRadius: geometry.radiusInteractive, overflowX: 'auto', fontFamily: 'monospace', fontSize: '0.78rem', color: colors.textSecondary, lineHeight: 1.4 }}>
            {curr.pseudocode}
          </pre>
        </div>
      </div>
    </div>
  );
}
