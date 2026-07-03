import { Chess } from 'chess.js';
import { startSearch, SEARCH_OPTIONS } from '../../src/engine/minimax.js';
import { tt } from '../../src/engine/transposition.js';

// Disable all enhancements in SEARCH_OPTIONS
SEARCH_OPTIONS.pvs = false;
SEARCH_OPTIONS.history = false;
SEARCH_OPTIONS.lmr = false;
SEARCH_OPTIONS.nmp = false;
SEARCH_OPTIONS.aspiration = false;
SEARCH_OPTIONS.moveOrdering = false;
SEARCH_OPTIONS.tt = false;

const POSITIONS = [
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Starting
  'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', // Kiwipete
  'n1r5/1p1q1b1k/p5pp/3p1p2/8/2P1RB1P/PP1Q1PP1/6K1 w - - 0 1' // Tactical
];

const SEARCH_DEPTH = 4;
const TIME_LIMIT = 30000;

let totalNodes = 0;
for (const fen of POSITIONS) {
  const chess = new Chess(fen);
  tt.clear();
  const res = startSearch(chess, SEARCH_DEPTH, TIME_LIMIT);
  console.log(`FEN: ${fen.substring(0, 30)}... visited ${res.stats.nodesSearched} nodes`);
  totalNodes += res.stats.nodesSearched;
}
console.log(`Total nodes for completely unoptimized AB search: ${totalNodes}`);
