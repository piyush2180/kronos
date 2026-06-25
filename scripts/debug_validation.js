import fs from 'fs';
import { Chess } from 'chess.js';

const raw = JSON.parse(fs.readFileSync('scripts/puzzles_raw.json', 'utf-8'));
if (raw.length > 0) {
  const p = raw[0];
  console.log("Testing puzzle:", p);
  try {
    const chess = new Chess(p.fen);
    console.log("FEN loaded. Active turn:", chess.turn());
    
    const setupMove = p.solution[0];
    console.log("Setup move:", setupMove);
    
    const from = setupMove.substring(0, 2);
    const to = setupMove.substring(2, 4);
    const promotion = setupMove.length > 4 ? setupMove.substring(4, 5).toLowerCase() : undefined;
    console.log("Parsed from:", from, "to:", to, "promotion:", promotion);
    
    const res = chess.move({ from, to, promotion });
    console.log("Result of move:", res);
  } catch (e) {
    console.error("Error thrown:", e);
  }
} else {
  console.log("No puzzles found in puzzles_raw.json");
}
