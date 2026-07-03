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

  // Starting Position FEN
  const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const chess = new Chess(fen);
  
  console.log("Playing reverse game (Baseline = White, Alpha-Beta = Black)...");
  
  let ply = 1;
  while (!chess.isGameOver() && ply <= 200) {
    const currentFen = chess.fen();
    const turn = chess.turn();
    const currentEngine = turn === 'w' ? baseline : ab;

    const result = currentEngine.go({ depth: 3, fen: currentFen });
    chess.move(result.move);
    ply++;
  }

  console.log(`\nGame finished in ${ply - 1} plies.`);
  console.log(`Termination: ${chess.isCheckmate() ? "Checkmate" : "Draw/Other"}`);
  console.log(`Result: ${chess.isCheckmate() ? (chess.turn() === 'w' ? "0-1 (Black/Alpha-Beta wins)" : "1-0 (White/Baseline wins)") : "1/2-1/2"}`);
}

main().catch(console.error);
