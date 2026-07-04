// Zobrist hashing — 64-bit position keys using BigInt.

// Seeded LCG for deterministic key generation
let seed = 123456789n;
function random64() {
  // LCG parameters
  seed = (seed * 6364136223846793005n + 1442695040888963407n);
  return seed;
}

// Piece type to index (0-5, offset by +6 for black)
export const PIECE_INDICES = {
  'p': 0, 'n': 1, 'b': 2, 'r': 3, 'q': 4, 'k': 5, // White
  'P': 0, 'N': 1, 'B': 2, 'R': 3, 'Q': 4, 'K': 5  // Black (we differentiate color separately)
};

export const COLOR_INDICES = {
  'w': 0,
  'b': 1
};

// Zobrist key tables: 12 pieces × 64 squares
export const pieceKeys = Array.from({ length: 12 }, () => 
  Array.from({ length: 64 }, () => random64())
);

// Side to move (Black to move, White is default)
export const sideKey = random64();

// Castling rights (4 bits: WK, WQ, BK, BQ)
export const castlingKeys = Array.from({ length: 16 }, () => random64());

// En passant files (8 files)
export const enPassantKeys = Array.from({ length: 8 }, () => random64());

/** Returns the piece index (0-11) for Zobrist table lookup. */
function getPieceIndex(type, color) {
  const base = PIECE_INDICES[type];
  return color === 'w' ? base : base + 6;
}

/** Computes a full Zobrist key from the current board state. */
export function getZobristKey(chess) {
  let hash = 0n;

  // 1. Hash pieces on the board
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const squareIndex = r * 8 + c;
        const pieceIndex = getPieceIndex(piece.type, piece.color);
        hash ^= pieceKeys[pieceIndex][squareIndex];
      }
    }
  }

  // 2. Hash active color (side to move)
  if (chess.turn() === 'b') {
    hash ^= sideKey;
  }

  // 3. Hash castling rights
  let castlingIndex = 0;
  const wRights = chess.getCastlingRights('w');
  const bRights = chess.getCastlingRights('b');
  if (wRights.k) castlingIndex |= 1;
  if (wRights.q) castlingIndex |= 2;
  if (bRights.k) castlingIndex |= 4;
  if (bRights.q) castlingIndex |= 8;
  hash ^= castlingKeys[castlingIndex];

  // 4. Hash en passant square (extracted from FEN)
  const fenParts = chess.fen().split(' ');
  const epField = fenParts[3]; // e.g. 'e3' or '-'
  if (epField && epField !== '-') {
    const file = epField.charCodeAt(0) - 97; // 'a' is 97, so 0-7
    if (file >= 0 && file < 8) {
      hash ^= enPassantKeys[file];
    }
  }

  return hash;
}
