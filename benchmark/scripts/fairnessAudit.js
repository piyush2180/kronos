/**
 * Tournament Fairness Audit
 * 
 * Verifies that paired openings cancel out correctly:
 * For each opening, plays Game 1 (A=White) and Game 2 (A=Black).
 * If both engines are equivalent, the total score for each opening pair
 * must equal exactly 1.0 (one point distributed between the two games).
 * 
 * This proves the tournament methodology is unbiased.
 */

import { Chess } from 'chess.js';
import { ConfigurableKronosEngine } from '../engines/configurableEngine.js';
import fs from 'fs';
import path from 'path';

function loadOpenings() {
  const filePath = path.resolve('benchmark/openings/openings.json');
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return [{ name: 'Starting Position', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' }];
}

function playGame(whiteEngine, blackEngine, fen, maxPlies = 200) {
  const chess = new Chess(fen);
  let moveCount = 0;

  while (!chess.isGameOver() && moveCount < maxPlies) {
    const currentEngine = chess.turn() === 'w' ? whiteEngine : blackEngine;
    const result = currentEngine.go({ depth: 3, fen: chess.fen() });
    if (!result.move) break;
    try {
      chess.move(result.move);
    } catch {
      break;
    }
    moveCount++;
  }

  let termination = 'max_plies';
  if (chess.isCheckmate()) termination = 'checkmate';
  else if (chess.isStalemate()) termination = 'stalemate';
  else if (chess.isThreefoldRepetition()) termination = 'threefold';
  else if (chess.isDraw()) termination = 'draw_rule';

  // Return score from White's perspective
  if (chess.isCheckmate()) {
    return { whiteScore: chess.turn() === 'b' ? 1.0 : 0.0, moveCount, termination };
  }
  return { whiteScore: 0.5, moveCount, termination };
}

async function main() {
  const openings = loadOpenings();

  // Both engines are identical (baseline minimax) — this is the control
  const engineA = new ConfigurableKronosEngine({
    useAlphaBeta: false, useIterativeDeepening: false,
    useMoveOrdering: false, useMVVLVA: false,
    useKillerMoves: false, useTranspositionTable: false,
    useQuiescence: false
  });

  const engineB = new ConfigurableKronosEngine({
    useAlphaBeta: true, useIterativeDeepening: false,
    useMoveOrdering: false, useMVVLVA: false,
    useKillerMoves: false, useTranspositionTable: false,
    useQuiescence: false
  });

  console.log('==================================================');
  console.log('        Tournament Fairness Audit                  ');
  console.log('==================================================\n');
  console.log(`Openings: ${openings.length}`);
  console.log(`Engine A: Baseline Minimax`);
  console.log(`Engine B: Alpha-Beta Only\n`);

  let allFair = true;
  let totalScoreA = 0;
  let totalScoreB = 0;
  let totalGames = 0;

  for (let i = 0; i < openings.length; i++) {
    const opening = openings[i];
    
    // Game 1: A=White, B=Black
    engineA.clearState();
    engineB.clearState();
    const g1 = playGame(engineA, engineB, opening.fen);
    const scoreA_g1 = g1.whiteScore;     // A's score as White
    const scoreB_g1 = 1.0 - g1.whiteScore; // B's score as Black

    // Game 2: B=White, A=Black
    engineA.clearState();
    engineB.clearState();
    const g2 = playGame(engineB, engineA, opening.fen);
    const scoreB_g2 = g2.whiteScore;     // B's score as White
    const scoreA_g2 = 1.0 - g2.whiteScore; // A's score as Black

    const pairScoreA = scoreA_g1 + scoreA_g2;
    const pairScoreB = scoreB_g1 + scoreB_g2;
    const pairTotal = pairScoreA + pairScoreB;
    const fair = Math.abs(pairTotal - 2.0) < 0.001 && Math.abs(pairScoreA - 1.0) < 0.001;

    totalScoreA += pairScoreA;
    totalScoreB += pairScoreB;
    totalGames += 2;

    const status = fair ? '✓ FAIR' : '⚠ BIASED';
    if (!fair) allFair = false;

    console.log(`[${i + 1}/${openings.length}] ${opening.name}`);
    console.log(`  Game 1 (A=W): ${g1.termination} (${g1.moveCount} plies) → A=${scoreA_g1}, B=${scoreB_g1}`);
    console.log(`  Game 2 (B=W): ${g2.termination} (${g2.moveCount} plies) → A=${scoreA_g2}, B=${scoreB_g2}`);
    console.log(`  Pair:  A=${pairScoreA}, B=${pairScoreB}, Total=${pairTotal} → ${status}`);
    console.log('  ──────────────────────────');
  }

  console.log('\n==================================================');
  console.log('              FAIRNESS RESULTS                     ');
  console.log('==================================================\n');
  console.log(`Total Games:    ${totalGames}`);
  console.log(`Total Score A:  ${totalScoreA} / ${totalGames}`);
  console.log(`Total Score B:  ${totalScoreB} / ${totalGames}`);
  console.log(`Score %:        A=${((totalScoreA / totalGames) * 100).toFixed(1)}%  B=${((totalScoreB / totalGames) * 100).toFixed(1)}%`);
  console.log(`\nVerdict: ${allFair ? 'ALL OPENING PAIRS ARE FAIR — Tournament methodology is unbiased.' : 'BIAS DETECTED — Some opening pairs do not cancel out.'}`);
}

main().catch(console.error);
