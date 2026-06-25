// Chess Opening Data with ECO Codes, variations, and deep strategy guides.

export const OPENING_BOOK = {
  "e4": { name: "King's Pawn Game", eco: "B00" },
  "e4 e5": { name: "Open Game", eco: "C20" },
  "e4 e5 Nf3": { name: "King's Knight Opening", eco: "C40" },
  "e4 e5 Nf3 Nc6": { name: "Open Game: Symmetrical", eco: "C44" },
  "e4 e5 Nf3 Nc6 Bb5": { name: "Ruy Lopez (Spanish Opening)", eco: "C60" },
  "e4 e5 Nf3 Nc6 Bb5 a6": { name: "Ruy Lopez: Morphy Defense", eco: "C70" },
  "e4 e5 Nf3 Nc6 Bc4": { name: "Italian Game", eco: "C50" },
  "e4 e5 Nf3 Nc6 Bc4 Nf6": { name: "Italian Game: Two Knights Defense", eco: "C55" },
  "e4 e5 Nf3 Nc6 Bc4 Bc5": { name: "Giuoco Piano", eco: "C50" },
  "e4 e5 Nf3 Nc6 d4": { name: "Scotch Game", eco: "C44" },
  "e4 e5 Nf3 Nc6 d4 exd4": { name: "Scotch Game: Main Line", eco: "C45" },
  "e4 e5 Nf3 d6": { name: "Philidor Defense", eco: "C41" },
  "e4 e5 f4": { name: "King's Gambit", eco: "C30" },
  "e4 e5 f4 exf4": { name: "King's Gambit Accepted", eco: "C33" },
  "e4 c5": { name: "Sicilian Defense", eco: "B20" },
  "e4 c5 Nf3": { name: "Sicilian Defense: Normal Variation", eco: "B27" },
  "e4 c5 Nf3 d6": { name: "Sicilian Defense: Davis/Traditional", eco: "B50" },
  "e4 c5 Nf3 d6 d4": { name: "Sicilian Defense: Open Lines", eco: "B54" },
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3": { name: "Sicilian Defense: Classical Open", eco: "B56" },
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6": { name: "Sicilian Defense: Najdorf Variation", eco: "B90" },
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6": { name: "Sicilian Defense: Dragon Variation", eco: "B70" },
  "e4 c5 Nf3 e6": { name: "Sicilian Defense: French Variation", eco: "B40" },
  "e4 c5 Nf3 Nc6": { name: "Sicilian Defense: Old Sicilian", eco: "B30" },
  "e4 c5 c3": { name: "Sicilian Defense: Alapin Variation", eco: "B22" },
  "e4 e6": { name: "French Defense", eco: "C00" },
  "e4 e6 d4": { name: "French Defense: Normal", eco: "C01" },
  "e4 e6 d4 d5": { name: "French Defense: Main Line", eco: "C02" },
  "e4 e6 d4 d5 e5": { name: "French Defense: Advance Variation", eco: "C02" },
  "e4 e6 d4 d5 exd5": { name: "French Defense: Exchange Variation", eco: "C01" },
  "e4 c6": { name: "Caro-Kann Defense", eco: "B10" },
  "e4 c6 d4": { name: "Caro-Kann Defense: Normal", eco: "B12" },
  "e4 c6 d4 d5": { name: "Caro-Kann Defense: Main Line", eco: "B15" },
  "e4 c6 d4 d5 e5": { name: "Caro-Kann Defense: Advance Variation", eco: "B12" },
  "e4 d6": { name: "Pirc Defense", eco: "B07" },
  "e4 g6": { name: "Modern Defense", eco: "A42" },
  "e4 Nf6": { name: "Alekhine's Defense", eco: "B02" },
  "d4": { name: "Queen's Pawn Game", eco: "D00" },
  "d4 d5": { name: "Queen's Pawn Game: Closed Game", eco: "D00" },
  "d4 d5 c4": { name: "Queen's Gambit", eco: "D06" },
  "d4 d5 c4 e6": { name: "Queen's Gambit Declined", eco: "D30" },
  "d4 d5 c4 c6": { name: "Slav Defense", eco: "D10" },
  "d4 d5 c4 dxc4": { name: "Queen's Gambit Accepted", eco: "D20" },
  "d4 Nf6": { name: "Indian Defense", eco: "E00" },
  "d4 Nf6 c4": { name: "Indian Defense: Normal", eco: "E10" },
  "d4 Nf6 c4 e6": { name: "Indian Defense: East Line", eco: "E11" },
  "d4 Nf6 c4 e6 Nf3 b6": { name: "Queen's Indian Defense", eco: "E12" },
  "d4 Nf6 c4 e6 Nc3 Bb4": { name: "Nimzo-Indian Defense", eco: "E20" },
  "d4 Nf6 c4 g6": { name: "King's Indian Defense", eco: "E60" },
  "d4 Nf6 c4 g6 Nc3 Bg7": { name: "King's Indian Defense: Main Line", eco: "E61" },
  "d4 d5 Nf3 Nf6": { name: "Queen's Pawn Game: Symmetrical", eco: "D02" },
  "d4 Nf6 Bf4": { name: "London System", eco: "D02" },
  "d4 d5 Nf3 Nf6 Bf4": { name: "London System: Symmetrical", eco: "D02" },
  "Nf3": { name: "Réti Opening", eco: "A04" },
  "Nf3 d5": { name: "Réti Opening: Symmetrical", eco: "A09" },
  "c4": { name: "English Opening", eco: "A10" },
  "c4 e5": { name: "English Opening: King's English", eco: "A20" },
  "c4 c5": { name: "English Opening: Symmetrical", eco: "A30" },
  "f4": { name: "Bird's Opening", eco: "A02" },
  "g3": { name: "Benko Opening", eco: "A00" },
  "b3": { name: "Nimzo-Larsen Attack", eco: "A01" }
};

export const BOOK_MOVES = {
  "": ["e4", "d4", "Nf3", "c4"],
  "e4": ["c5", "e5", "e6", "c6", "d6", "g6", "Nf6"],
  "e4 e5": ["Nf3", "f4", "Nc3"],
  "e4 e5 Nf3": ["Nc6", "d6", "Nf6"],
  "e4 e5 Nf3 Nc6": ["Bc4", "Bb5", "d4"],
  "e4 e5 Nf3 Nc6 Bc4": ["Bc5", "Nf6"],
  "e4 e5 Nf3 Nc6 Bb5": ["a6", "Nf6", "d6"],
  "e4 c5": ["Nf3", "Nc3", "c3"],
  "e4 c5 Nf3": ["d6", "e6", "Nc6"],
  "e4 c5 Nf3 d6": ["d4"],
  "e4 c5 Nf3 d6 d4 cxd4": ["Nxd4"],
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4": ["Nf6"],
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6": ["Nc3"],
  "e4 e6": ["d4", "d3"],
  "e4 e6 d4": ["d5"],
  "e4 e6 d4 d5": ["e5", "exd5", "Nc3", "Nd2"],
  "e4 c6": ["d4", "d3"],
  "e4 c6 d4": ["d5"],
  "e4 c6 d4 d5": ["e5", "exd5", "Nc3"],
  "d4": ["d5", "Nf6"],
  "d4 d5": ["c4", "Nf3"],
  "d4 d5 c4": ["e6", "c6", "dxc4"],
  "d4 d5 c4 e6": ["Nc3", "Nf3"],
  "d4 d5 c4 e6 Nf3": ["Nf6"],
  "d4 d5 c4 e6 Nf3 Nf6": ["Nc3"],
  "d4 Nf6": ["c4", "Nf3", "g3", "Bf4"],
  "d4 Nf6 c4": ["e6", "g6", "c5"],
  "d4 Nf6 c4 e6": ["Nf3", "Nc3", "g3"],
  "d4 Nf6 Bf4": ["d5", "e6", "g6"]
};

// Deep Opening Details Database for "View Opening" card popup
export const OPENING_DETAILS_DB = {
  "B20": {
    name: "Sicilian Defense",
    eco: "B20",
    mainLine: "1. e4 c5",
    plans: [
      "Fight for the d4 square immediately from the flank.",
      "Create asymmetrical pawn structures where Black plays on the c-file.",
      "Counter-attack in the center with d6/e6 and eventual d5 breaks."
    ],
    players: ["Garry Kasparov", "Bobby Fischer", "Magnus Carlsen", "Mikhail Tal"],
    traps: [
      {
        name: "Bowdler Attack Trap",
        moves: "1. e4 c5 2. Bc4 e6 3. Nf3 d5 4. exd5 exd5 5. Bb5+ Bd7 6. Bxd7+ Nxd7",
        description: "Black easily counter-attacks in the center if White plays Bc4 early."
      },
      {
        name: "Siberian Trap (Keres Gambit)",
        moves: "1. e4 c5 2. d4 cxd4 3. c3 dxc3 4. Nxc3 Nc6 5. Nf3 e6 6. Bc4 Qc7 7. O-O Nf6 8. Qe2 Ng4 9. h3?? Nd4!",
        description: "Black wins the queen or checkmates on h2 with knight forks."
      }
    ]
  },
  "C60": {
    name: "Ruy Lopez (Spanish Opening)",
    eco: "C60",
    mainLine: "1. e4 e5 2. Nf3 Nc6 3. Bb5",
    plans: [
      "Create long-term pressure on Black's e5 pawn by pinning/attacking the c6 knight.",
      "Build a strong pawn center with c3 and d4.",
      "Maneuver the knight to f1-g3 via b1-d2."
    ],
    players: ["Anatoly Karpov", "Garry Kasparov", "Magnus Carlsen", "Bobby Fischer"],
    traps: [
      {
        name: "Noah's Ark Trap",
        moves: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 d6 5. d4 b5 6. Bb3 Nxd4 7. Nxd4 exd4 8. Qxd4?? c5 9. Qd5 Be6 10. Qc6+ Bd7 11. Qd5 c4",
        description: "Black traps White's light-squared bishop on b3 using pawn advances."
      }
    ]
  },
  "C50": {
    name: "Italian Game",
    eco: "C50",
    mainLine: "1. e4 e5 2. Nf3 Nc6 3. Bc4",
    plans: [
      "Attack the weak f7 square directly with the bishop.",
      "Control the center with c3 and d4, or play a quiet slow game with d3 (Giuoco Piano).",
      "Launch a swift kingside attack if Black castles early."
    ],
    players: ["Garry Kasparov", "Wesley So", "Hikaru Nakamura", "Giacchino Greco"],
    traps: [
      {
        name: "Blackburne Shilling Gambit",
        moves: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4?! 4. Nxe5? Qg5! 5. Nxf7? Qxg2 6. Rf1 Qxe4+ 7. Be2 Nf3#",
        description: "Black wins material and delivers a smothered checkmate by exploiting White's greed."
      }
    ]
  },
  "D06": {
    name: "Queen's Gambit",
    eco: "D06",
    mainLine: "1. d4 d5 2. c4",
    plans: [
      "Sacrifice a flank pawn temporarily to gain control of the center squares.",
      "Attack Black's queen pawn (d5) and create tension in the center.",
      "Develop queenside pieces efficiently with Nc3 and Bf4/Bg5."
    ],
    players: ["Garry Kasparov", "Magnus Carlsen", "Alexander Alekhine", "Mikhail Botvinnik"],
    traps: [
      {
        name: "Lasker Trap",
        moves: "1. d4 d5 2. c4 e5 3. dxe5 d4 4. e3? Bb4+ 5. Bd2 dxe3! 6. Bxb4?? exf2+ 7. Ke2 fxg1=N+! 8. Ke1 Qh4+",
        description: "Black underpromotes to a knight on g1, winning White's queen."
      }
    ]
  },
  "B10": {
    name: "Caro-Kann Defense",
    eco: "B10",
    mainLine: "1. e4 c6",
    plans: [
      "Build a solid defensive barrier with c6, preparing a safe d5 strike.",
      "Develop the light-squared bishop outside the pawn chain before playing e6.",
      "Counter-attack on the c-file after swapping pawns."
    ],
    players: ["Anatoly Karpov", "Mikhail Botvinnik", "Ding Liren", "Hikaru Nakamura"],
    traps: [
      {
        name: "Smyslov Trap",
        moves: "1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nd7 5. Qe2 Ngf6?? 6. Nd6#",
        description: "White delivers a brilliant smothered mate due to a pinned e-pawn."
      }
    ]
  },
  "C00": {
    name: "French Defense",
    eco: "C00",
    mainLine: "1. e4 e6",
    plans: [
      "Establish a solid pawn chain (d5 and e6) and block White's direct f7 attacks.",
      "Attack White's center with c5, Nc6, and Qb6.",
      "Solve the problem of the bad light-squared 'French' bishop on c8."
    ],
    players: ["Viktor Korchnoi", "Alexander Morozevich", "Ding Liren", "Mikhail Botvinnik"],
    traps: [
      {
        name: "Réti Gambit Trap",
        moves: "1. e4 e6 2. b3 d5 3. Bb2 dxe4 4. Nc3 Nf6 5. Qe2 Bd7 6. Nxe4 Nxe4 7. Qxe4 Bc6 8. Qg4",
        description: "White plays an active gambit to gain open diagonals for bishops."
      }
    ]
  },
  "D02": {
    name: "London System",
    eco: "D02",
    mainLine: "1. d4 d5 2. Nf3 Nf6 3. Bf4",
    plans: [
      "Create a highly resilient solid triangle pawn structure (c3, d4, e3).",
      "Safely develop the dark-squared bishop to f4 outside the pawn structure.",
      "Anchor a knight on e5 and attack Kingside."
    ],
    players: ["Magnus Carlsen", "Gata Kamsky", "Hikaru Nakamura", "Levon Aronian"],
    traps: [
      {
        name: "London Trap",
        moves: "1. d4 d5 2. Bf4 c5 3. e3 Nc6 4. c3 Nf6 5. Nd2 Qb6 6. Qb3 c4 7. Qc2 g6 8. Ngf3 Bf5",
        description: "Black wins tempo and grabs active squares on the queenside."
      }
    ]
  }
};

/**
 * Returns the name and ECO of the current opening based on the move history.
 */
export function getOpeningDetails(gameHistory) {
  if (!gameHistory || gameHistory.length === 0) {
    return { name: "Starting Position", eco: "A00" };
  }
  
  const sans = gameHistory.map(m => m.san);
  
  // Try to find the longest matching sequence
  for (let len = sans.length; len > 0; len--) {
    const subSeq = sans.slice(0, len).join(' ');
    if (OPENING_BOOK[subSeq]) {
      return OPENING_BOOK[subSeq];
    }
  }
  
  // Fallback to basic opening move if first move is known
  if (sans.length > 0 && OPENING_BOOK[sans[0]]) {
    return OPENING_BOOK[sans[0]];
  }
  
  return { name: "Custom Position", eco: "A00" };
}

/**
 * Calculates captured pieces for both sides and material balance.
 */
export function getCapturedPieces(chess) {
  const startPieces = {
    w: { p: 8, n: 2, b: 2, r: 2, q: 1 },
    b: { p: 8, n: 2, b: 2, r: 2, q: 1 }
  };
  
  const currentPieces = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
  };
  
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type !== 'k') {
        currentPieces[piece.color][piece.type]++;
      }
    }
  }
  
  const captured = {
    w: [], // Pieces White has captured (i.e. Black pieces)
    b: []  // Pieces Black has captured (i.e. White pieces)
  };
  
  const pieceOrder = ['q', 'r', 'b', 'n', 'p'];
  
  // White captured (Black pieces missing)
  for (const type of pieceOrder) {
    const count = startPieces.b[type] - currentPieces.b[type];
    for (let i = 0; i < count; i++) {
      captured.w.push({ type, color: 'b' });
    }
  }
  
  // Black captured (White pieces missing)
  for (const type of pieceOrder) {
    const count = startPieces.w[type] - currentPieces.w[type];
    for (let i = 0; i < count; i++) {
      captured.b.push({ type, color: 'w' });
    }
  }
  
  // Calculate material balance (standard values: P=1, N=3, B=3, R=5, Q=9)
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  let whiteVal = captured.w.reduce((sum, p) => sum + values[p.type], 0);
  let blackVal = captured.b.reduce((sum, p) => sum + values[p.type], 0);
  
  return {
    w: captured.w, // Captured Black pieces
    b: captured.b, // Captured White pieces
    balance: whiteVal - blackVal // Positive = White is up, negative = Black is up
  };
}

/**
 * Checks if the current move is part of the opening book.
 */
export function isBookMove(gameHistory) {
  if (!gameHistory || gameHistory.length === 0) return true;
  const moveSequence = gameHistory.map(m => m.san).join(' ');
  return OPENING_BOOK[moveSequence] !== undefined;
}
