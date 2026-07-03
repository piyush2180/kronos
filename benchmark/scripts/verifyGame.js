import { Chess } from 'chess.js';
import { ConfigurableKronosEngine } from '../engines/configurableEngine.js';

async function main() {
  const baseline = new ConfigurableKronosEngine({
    useAlphaBeta: false,
    useIterativeDeepening: false,
    useMoveOrdering: false,
    useMVVLVA: false,
    useKillerMoves: false,
    useTranspositionTable: false,
    useQuiescence: false
  });

  const ab = new ConfigurableKronosEngine({
    useAlphaBeta: true,
    useIterativeDeepening: false,
    useMoveOrdering: false,
    useMVVLVA: false,
    useKillerMoves: false,
    useTranspositionTable: false,
    useQuiescence: false
  });

  // Starting Sicilian FEN:
  const fen = "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2";
  const chess = new Chess(fen);
  
  console.log("Starting verification game playout...");
  console.log(`Initial FEN: ${fen}\n`);

  let ply = 1;
  while (!chess.isGameOver() && ply <= 40) {
    const currentFen = chess.fen();
    const turn = chess.turn();
    console.log(`[Ply ${ply}] Turn: ${turn}`);

    const resBaseline = baseline.go({ depth: 3, fen: currentFen });
    const resAB = ab.go({ depth: 3, fen: currentFen });

    console.log(`  Baseline: Move = ${resBaseline.move}, Score = ${resBaseline.score}, Nodes = ${resBaseline.stats.nodesSearched}`);
    console.log(`  Alpha-Beta: Move = ${resAB.move}, Score = ${resAB.score}, Nodes = ${resAB.stats.nodesSearched}`);

    if (resBaseline.move !== resAB.move || resBaseline.score !== resAB.score) {
      console.log(`🚨 DIVERGENCE DETECTED AT PLY ${ply}!`);
      console.log(`Baseline chose: ${resBaseline.move} with score ${resBaseline.score}`);
      console.log(`Alpha-Beta chose: ${resAB.move} with score ${resAB.score}`);
      return;
    }

    // Make the move (using baseline choice to advance)
    chess.move(resBaseline.move);
    ply++;
    console.log(`Board state: ${chess.fen()}`);
    console.log("----------------------------------------");
  }

  console.log("✓ Playout completed successfully. Both engines chose the exact same moves for 40 plies!");
}

main().catch(console.error);
