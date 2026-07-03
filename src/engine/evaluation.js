// Chess Board Evaluation Function
// Returns evaluation from White's perspective (positive = White advantage, negative = Black advantage)

export const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Piece-Square Tables (PST)
// Evaluated from White's perspective. For Black, we mirror the table vertically (7 - row).
// High values encourage pieces to occupy those squares.

const PAWN_PST = [
  [  0,   0,   0,   0,   0,   0,   0,   0],
  [ 50,  50,  50,  50,  50,  50,  50,  50],
  [ 10,  10,  20,  30,  30,  20,  10,  10],
  [  5,   5,  10,  25,  25,  10,   5,   5],
  [  0,   0,   0,  20,  20,   0,   0,   0],
  [  5,  -5, -10,   0,   0, -10,  -5,   5],
  [  5,  10,  10, -20, -20,  10,  10,   5],
  [  0,   0,   0,   0,   0,   0,   0,   0]
];

const KNIGHT_PST = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20,   0,   0,   0,   0, -20, -40],
  [-30,   0,  10,  15,  15,  10,   0, -30],
  [-30,   5,  15,  20,  20,  15,   5, -30],
  [-30,   0,  15,  20,  20,  15,   0, -30],
  [-30,   5,  10,  15,  15,  10,   5, -30],
  [-40, -20,   0,   5,   5,   0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50]
];

const BISHOP_PST = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10,   0,   0,   0,   0,   0,   0, -10],
  [-10,   0,   5,  10,  10,   5,   0, -10],
  [-10,   5,   5,  10,  10,   5,   5, -10],
  [-10,   0,  10,  10,  10,  10,   0, -10],
  [-10,  10,  10,  10,  10,  10,  10, -10],
  [-10,   5,   0,   0,   0,   0,   5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20]
];

const ROOK_PST = [
  [  0,   0,   0,   5,   5,   0,   0,   0],
  [  5,  10,  10,  10,  10,  10,  10,   5],
  [ -5,   0,   0,   0,   0,   0,   0,  -5],
  [ -5,   0,   0,   0,   0,   0,   0,  -5],
  [ -5,   0,   0,   0,   0,   0,   0,  -5],
  [ -5,   0,   0,   0,   0,   0,   0,  -5],
  [ -5,   0,   0,   0,   0,   0,   0,  -5],
  [  0,   0,   0,   5,   5,   0,   0,   0]
];

const QUEEN_PST = [
  [-20, -10, -10,  -5,  -5, -10, -10, -20],
  [-10,   0,   0,   0,   0,   0,   0, -10],
  [-10,   0,   5,   5,   5,   5,   0, -10],
  [ -5,   0,   5,   5,   5,   5,   0,  -5],
  [  0,   0,   5,   5,   5,   5,   0,  -5],
  [-10,   5,   5,   5,   5,   5,   0, -10],
  [-10,   0,   5,   0,   0,   5,   0, -10],
  [-20, -10, -10,  -5,  -5, -10, -10, -20]
];

// King Middle Game (safety is primary)
const KING_MIDDLE_PST = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [ 20,  20,   0,   0,   0,   0,  20,  20],
  [ 20,  30,  10,   0,   0,  10,  30,  20]
];

// King End Game (active king is primary)
const KING_END_PST = [
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10,   0,   0, -10, -20, -30],
  [-30, -10,  20,  30,  30,  20, -10, -30],
  [-30, -10,  30,  40,  40,  30, -10, -30],
  [-30, -10,  30,  40,  40,  30, -10, -30],
  [-30, -10,  20,  30,  30,  20, -10, -30],
  [-30, -30,   0,   0,   0,   0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50]
];

/**
 * Detects the game phase based on the remaining non-pawn material.
 * Returns a value from 0 (opening/middlegame) to 1 (pure endgame).
 */
export function evaluateBoard(chess) {
  const board = chess.board();
  let score = 0;

  let nonPawnMaterial = 0;
  let whiteKingPos = null;
  let blackKingPos = null;
  let whiteBishops = 0;
  let blackBishops = 0;

  // Pawn tracking for pawn structure evaluation
  const whitePawnFiles = Array(8).fill(0);
  const blackPawnFiles = Array(8).fill(0);

  // Gather piece locations and count in a single pass
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const type = piece.type;
      const color = piece.color;
      const isWhite = color === 'w';
      const sign = isWhite ? 1 : -1;

      // 1. Material score
      const materialVal = PIECE_VALUES[type];
      score += materialVal * sign;

      if (type !== 'p' && type !== 'k') {
        nonPawnMaterial += materialVal;
      }

      // 2. Positional (PST) score
      const pstRow = isWhite ? r : 7 - r;
      const pstCol = isWhite ? c : 7 - c;

      if (type === 'k') {
        if (isWhite) {
          whiteKingPos = { r: pstRow, c: pstCol };
        } else {
          blackKingPos = { r: pstRow, c: pstCol };
        }
      } else {
        let pstVal = 0;
        switch (type) {
          case 'p':
            pstVal = PAWN_PST[pstRow][pstCol];
            if (isWhite) whitePawnFiles[c]++;
            else blackPawnFiles[c]++;
            break;
          case 'n':
            pstVal = KNIGHT_PST[pstRow][pstCol];
            break;
          case 'b':
            pstVal = BISHOP_PST[pstRow][pstCol];
            if (isWhite) whiteBishops++;
            else blackBishops++;
            break;
          case 'r':
            pstVal = ROOK_PST[pstRow][pstCol];
            // Rook on 7th rank (White row index 1, Black row index 6)
            if (isWhite && r === 1) score += 15;
            else if (!isWhite && r === 6) score -= 15;
            break;
          case 'q':
            pstVal = QUEEN_PST[pstRow][pstCol];
            break;
        }
        score += pstVal * sign;
      }
    }
  }

  // Calculate game phase
  const maxEndgameMaterial = 1600;
  const minEndgameMaterial = 0;
  let phase = 0;
  if (nonPawnMaterial <= minEndgameMaterial) {
    phase = 1;
  } else if (nonPawnMaterial < maxEndgameMaterial) {
    phase = (maxEndgameMaterial - nonPawnMaterial) / maxEndgameMaterial;
  }

  // Evaluate kings using phase
  if (whiteKingPos) {
    const middleVal = KING_MIDDLE_PST[whiteKingPos.r][whiteKingPos.c];
    const endVal = KING_END_PST[whiteKingPos.r][whiteKingPos.c];
    const pstVal = Math.round((1 - phase) * middleVal + phase * endVal);
    score += pstVal;
  }
  if (blackKingPos) {
    const middleVal = KING_MIDDLE_PST[blackKingPos.r][blackKingPos.c];
    const endVal = KING_END_PST[blackKingPos.r][blackKingPos.c];
    const pstVal = Math.round((1 - phase) * middleVal + phase * endVal);
    score -= pstVal;
  }

  // 3. Pawn structure evaluation
  for (let f = 0; f < 8; f++) {
    // White doubled pawns
    if (whitePawnFiles[f] > 1) {
      score -= (whitePawnFiles[f] - 1) * 15;
    }
    // Black doubled pawns
    if (blackPawnFiles[f] > 1) {
      score += (blackPawnFiles[f] - 1) * 15;
    }

    // White isolated pawns
    if (whitePawnFiles[f] > 0) {
      const leftAdjacent = f > 0 ? whitePawnFiles[f - 1] : 0;
      const rightAdjacent = f < 7 ? whitePawnFiles[f + 1] : 0;
      if (leftAdjacent === 0 && rightAdjacent === 0) {
        score -= 10;
      }
    }
    // Black isolated pawns
    if (blackPawnFiles[f] > 0) {
      const leftAdjacent = f > 0 ? blackPawnFiles[f - 1] : 0;
      const rightAdjacent = f < 7 ? blackPawnFiles[f + 1] : 0;
      if (leftAdjacent === 0 && rightAdjacent === 0) {
        score += 10;
      }
    }
  }

  // 4. Bishop Pair evaluation
  if (whiteBishops >= 2) score += 30;
  if (blackBishops >= 2) score -= 30;

  // 5. Passed Pawns evaluation
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'p') {
        const isWhite = piece.color === 'w';
        let isPassed = true;
        if (isWhite) {
          for (let row = 0; row < r; row++) {
            for (let col = Math.max(0, c - 1); col <= Math.min(7, c + 1); col++) {
              const p = board[row][col];
              if (p && p.type === 'p' && p.color === 'b') {
                isPassed = false;
                break;
              }
            }
            if (!isPassed) break;
          }
          if (isPassed) score += 20;
        } else {
          for (let row = r + 1; row < 8; row++) {
            for (let col = Math.max(0, c - 1); col <= Math.min(7, c + 1); col++) {
              const p = board[row][col];
              if (p && p.type === 'p' && p.color === 'w') {
                isPassed = false;
                break;
              }
            }
            if (!isPassed) break;
          }
          if (isPassed) score -= 20;
        }
      }
    }
  }

  // 6. Tempo evaluation
  const activeColor = chess.turn();
  if (activeColor === 'w') score += 10;
  else score -= 10;

  // 7. Piece Mobility evaluation
  const movesCount = chess.moves().length;
  if (activeColor === 'w') score += movesCount;
  else score -= movesCount;

  return score;
}
