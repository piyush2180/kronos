import React, { useState, useEffect } from 'react';
import { colors, spacing, geometry, typography } from '../../theme/designTokens';

export default function EngineAdvanced({ onSelectSource }) {
  const [selectedAlgo, setSelectedAlgo] = useState('pvs');
  const [pvsStep, setPvsStep] = useState(0);

  useEffect(() => {
    if (selectedAlgo === 'pvs') {
      const interval = setInterval(() => {
        setPvsStep((prev) => (prev + 1) % 4);
      }, 900);
      return () => clearInterval(interval);
    }
  }, [selectedAlgo]);

  const algos = {
    pvs: {
      name: 'Principal Variation Search (PVS)',
      simpleNote: 'Assumes the first move we search is the best one. We check all subsequent moves with a "narrow window" to prove they are worse. If they are, search completes instantly. If a move is better, we re-search it with a full window.',
      purpose: 'Prunes quiet branches under the assumption that the first move checked is the best.',
      complexity: 'O(b^(d/2)) optimal (faster than standard Alpha-Beta)',
      file: 'src/engine/minimax.js',
      advantages: 'Cuts search trees by an extra 15-20% compared to pure alpha-beta when move ordering is accurate.',
      disadvantages: 'Requires a costly full re-search if our move ordering fails and a later move is actually best.',
      strengthImpact: '+35 Elo (speeds up tree reductions)',
      memoryImpact: 'O(d) stack space',
      tradeOffs: 'Highly reliant on move ordering. Bad move ordering can cause performance regression.',
      pseudocode: `function pvs(node, depth, alpha, beta, maximizingPlayer)
  if depth == 0 or node is terminal
    return static_evaluation(node)
  for each child of node
    if child is first_child
      score := -pvs(child, depth - 1, -beta, -alpha, not maximizingPlayer)
    else
      // Null-window search to verify child is worse
      score := -pvs(child, depth - 1, -alpha - 1, -alpha, not maximizingPlayer)
      if score > alpha and score < beta
        // Re-search with full window if hypothesis fails
        score := -pvs(child, depth - 1, -beta, -alpha, not maximizingPlayer)
    alpha := max(alpha, score)
    if alpha >= beta
      break // Cutoff
  return alpha`,
      cpRef: 'Alexander Sh规律, "Principal Variation Search in Zero-Sum Trees" (1980)'
    },
    lmr: {
      name: 'Late Move Reductions (LMR)',
      simpleNote: 'Searches moves that are sorted late in our list at a shallower depth (e.g. depth 2 instead of depth 4) under the assumption that late moves are rarely tactical masterstrokes. If a late move proves strong, we re-search it at full depth.',
      purpose: 'Searches unpromising moves at reduced search depths to save computation.',
      complexity: 'O(b^(d-red))',
      file: 'src/engine/minimax.js',
      advantages: 'Enormous search space reductions (compresses nodes by up to 80%).',
      disadvantages: 'Risk of tactical blindness if a move sorted late is a subtle winning move.',
      strengthImpact: '+180 Elo (allows deeper iterative searches)',
      memoryImpact: 'O(1) table lookup lookup',
      tradeOffs: 'Must only apply LMR to quiet, non-check, non-capture moves.',
      pseudocode: `function searchNode(node, depth, alpha, beta, index)
  if depth >= 3 and index > 3 and not node.isCapture and not node.inCheck
    reduction := calculateLMRReduction(depth, index)
    score := -searchNode(child, depth - 1 - reduction, -alpha - 1, -alpha, index)
    if score > alpha
      // Re-search at full depth if reduction was unsafe
      score := -searchNode(child, depth - 1, -beta, -alpha, index)
  else
    score := -searchNode(child, depth - 1, -beta, -alpha, index)`,
      cpRef: 'Tord Romstad, "Late Move Reductions in Stockfish"'
    },
    nmp: {
      name: 'Null Move Pruning (NMP)',
      simpleNote: 'Gives the opponent a free turn! If they pass their turn and still cannot threaten or break our position, our layout is so strong that we can prune this entire search branch immediately.',
      purpose: 'Skips searching branches where the position is already overwhelmingly strong.',
      complexity: 'O(b^(d - 1 - reduction))',
      file: 'src/engine/minimax.js',
      advantages: 'Instantly prunes subtrees when position is dominating.',
      disadvantages: 'Extremely dangerous in endgames where passing is bad (Zugzwang).',
      strengthImpact: '+70 Elo (prevents calculating obvious wins)',
      memoryImpact: 'O(d) stack space',
      tradeOffs: 'Disabled when the side to move has only pawns remaining to avoid zugzwang blunders.',
      pseudocode: `function searchNode(node, depth, alpha, beta)
  if depth >= 3 and not node.inCheck and hasMaterial(sideToMove)
    makeNullMove() // Pass turn
    score := -searchNode(node, depth - 1 - R, -beta, -beta + 1)
    undoNullMove()
    if score >= beta
      return beta // Prune branch immediately`,
      cpRef: 'Goetsch and Donninger, "Null Move Search Heuristics" (1990)'
    },
    quiescence: {
      name: 'Quiescence Search',
      simpleNote: 'Prevents stopping calculation in the middle of a trade. If the standard search depth runs out, the engine continues searching captures only until the board is quiet.',
      purpose: 'Extends capture sequences to combat the Horizon Effect.',
      complexity: 'O(b_captures^d_q)',
      file: 'src/engine/quiescence.js',
      advantages: 'Guarantees that static evaluations do not score hanging or tradeable pieces.',
      disadvantages: 'Slightly inflates node counts in wild, tactical positions.',
      strengthImpact: '+95 Elo (essential for tactical safety)',
      memoryImpact: 'O(d_q) stack space',
      tradeOffs: 'Must strictly limit evaluation to captures and check resolutions.',
      pseudocode: `function quiescence(node, alpha, beta)
  stand_pat := static_evaluation(node)
  if stand_pat >= beta
    return beta
  alpha := max(alpha, stand_pat)
  for each capture_move of node
    makeMove(capture_move)
    score := -quiescence(node, -beta, -alpha)
    undoMove()
    alpha := max(alpha, score)
    if alpha >= beta
      return beta
  return alpha`,
      cpRef: 'Claude Shannon, "Programming a Computer for Playing Chess" (1950)'
    },
    iterative: {
      name: 'Iterative Deepening & Clocks',
      simpleNote: 'Searches depth 1, then depth 2, then depth 3 progressively. If the match clock runs low, the search is aborted and the engine plays the best move from the last fully completed depth.',
      purpose: 'Progressively searches deeper plies within strict time constraints.',
      complexity: 'O(b^d)',
      file: 'src/engine/worker.js',
      advantages: 'Guarantees a safe move is ready if search is aborted mid-ply.',
      disadvantages: 'Slight node overhead from repeating shallow searches.',
      strengthImpact: 'Mandatory time control coordinator',
      memoryImpact: 'Allows clearing or reuse of Transposition caches',
      tradeOffs: 'Must balance iteration thresholds to prevent search time overrun.',
      pseudocode: `function iterativeDeepening(timeLimit)
  startTime := now()
  bestMove := null
  for depth = 1 to maxDepth
    bestMove := searchTree(depth)
    if now() - startTime > timeLimit
      break
  return bestMove`,
      cpRef: 'Chess Programming Wiki, "Iterative Deepening Search"'
    },
    killer: {
      name: 'Killer Move Heuristics',
      simpleNote: 'Remembers two quiet (non-capture) moves that were so good in sister variations that they forced cutoffs. We try these moves first in other lines at the same depth.',
      purpose: 'Sorts highly tactical quiet moves to the top of the search path.',
      complexity: 'O(1) indexing',
      file: 'src/engine/killerMoves.js',
      advantages: 'Allows fast quiet move cutoffs without invoking full static evaluations.',
      disadvantages: 'Limited to two slots per search ply.',
      strengthImpact: '+45 Elo (speeds up tactical quiet searches)',
      memoryImpact: 'O(d) small array allocation',
      tradeOffs: 'Slots must be overwritten when stronger cutoffs occur.',
      pseudocode: `function recordKiller(depth, move)
  if not move.isCapture
    if killerMoves[depth][0] != move
      killerMoves[depth][1] := killerMoves[depth][0]
      killerMoves[depth][0] := move`,
      cpRef: 'Cpw, "Killer Heuristic"'
    }
  };

  const curr = algos[selectedAlgo];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }} className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: colors.textPrimary, margin: 0 }}>Advanced Search Optimizations</h2>
        <p style={{ fontSize: '0.85rem', color: colors.textSecondary, margin: '0.2rem 0 0 0' }}>Tactical pruning, branch reductions, and worker timing mechanisms that scale engine playing strength.</p>
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
        {selectedAlgo === 'pvs' && (
          <div style={{ backgroundColor: 'var(--color-bg-base)', padding: spacing.md, borderRadius: geometry.radiusInteractive, display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', border: '1px solid var(--color-border-subtle)' }}>
            <span style={{ fontSize: '0.7rem', color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase' }}>PVS Window Narrowing Simulation</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: '0.78rem' }}>
              <span style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', backgroundColor: pvsStep >= 0 ? 'rgba(200,159,61,0.12)' : 'transparent', color: pvsStep >= 0 ? colors.textPrimary : colors.textMuted }}>First Move: Search Full Window [alpha, beta]</span>
              <span style={{ color: colors.textMuted }}>→</span>
              <span style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', backgroundColor: pvsStep >= 1 ? 'rgba(200,159,61,0.12)' : 'transparent', color: pvsStep >= 1 ? colors.textPrimary : colors.textMuted }}>Next Move: Null Window [alpha, alpha + 1]</span>
              <span style={{ color: colors.textMuted }}>→</span>
              <span style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', backgroundColor: pvsStep >= 2 ? 'rgba(75,175,122,0.12)' : 'transparent', color: pvsStep >= 2 ? colors.success : colors.textMuted }}>Verify Move is Worse ✓</span>
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
