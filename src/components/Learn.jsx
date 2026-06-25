// Kronos Chess V2 — Learn Section
// Dedicated page providing explanations, links, and diagrams for chess algorithms and practical chess theory.

import React, { useState } from 'react';
import { BookOpen, Code, Compass, HelpCircle, ExternalLink, Target, Sword, Clock } from 'lucide-react';

const LEARN_TOPICS = [
  // Computer Chess Algorithms
  {
    id: 'minimax',
    title: 'Minimax Search',
    category: 'Computer Science',
    explanation: 'Minimax is a decision-rule algorithm used to determine the optimal move in a two-player, zero-sum game. The engine assumes the opponent will play their best possible response, evaluating positions recursively down to a target depth and selecting the path that maximizes the minimum score.',
    wikipedia: 'https://en.wikipedia.org/wiki/Minimax',
    cpw: 'https://www.chessprogramming.org/Minimax',
    diagram: `
     [Root - Maximize]
         /       \\
    [Min]         [Min]
    /   \\         /   \\
  (3)   (6)     (2)   (9)  -> Selects Max(3, 2) = 3
`
  },
  {
    id: 'alphabeta',
    title: 'Alpha-Beta Pruning',
    category: 'Computer Science',
    explanation: 'Alpha-Beta Pruning is an optimization technique that reduces the number of nodes evaluated by the minimax algorithm in its search tree. It stops evaluating a move once at least one possibility has been found that proves the move to be worse than a previously examined option.',
    wikipedia: 'https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning',
    cpw: 'https://www.chessprogramming.org/Alpha-Beta',
    diagram: `
       [Max Node]
        /      \\
     [Min]     [Min] -> If first option yields score 5,
     /   \\       /      and second options starts with 3,
   (5)   (8)   (3)      prune remainder because Min will choose <= 3!
`
  },
  {
    id: 'iterative',
    title: 'Iterative Deepening',
    category: 'Computer Science',
    explanation: 'Iterative Deepening Search (IDS) searches progressively deeper plies (depth 1, then depth 2, depth 3, etc.) within a specified time limit. If the search is aborted mid-ply due to timeout, the engine discards the incomplete search and falls back on the best move computed at the previous completed depth.',
    wikipedia: 'https://en.wikipedia.org/wiki/Iterative_deepening_depth-first_search',
    cpw: 'https://www.chessprogramming.org/Iterative_Deepening',
    diagram: `
Depth 1: [Search complete] -> Best Move e2e4
Depth 2: [Search complete] -> Best Move e2e4 (score +0.1)
Depth 3: [Search complete] -> Best Move Nf3 (score +0.15)
Depth 4: [ABORTED - TIMEOUT] -> Fallback to Depth 3 move: Nf3
`
  },
  {
    id: 'zobrist',
    title: 'Zobrist Hashing',
    category: 'Computer Science',
    explanation: 'Zobrist Hashing is a method to generate a unique 64-bit fingerprint for a board position using bitwise XOR operations. It represents piece positions, side-to-move, castling rights, and en passant files, allowing rapid transposition table lookups in O(1) time.',
    wikipedia: 'https://en.wikipedia.org/wiki/Zobrist_hashing',
    cpw: 'https://www.chessprogramming.org/Zobrist_Hashing',
    diagram: `
Zobrist Key = 0n (Start Hash)
   ^= randomPieceKeys[piece_index][square_index]
   ^= sideToMoveKey (if Black's turn)
   ^= castlingKeys[castling_rights_bits]
`
  },
  {
    id: 'transposition',
    title: 'Transposition Tables',
    category: 'Computer Science',
    explanation: 'A Transposition Table is a hash map used to store previously searched positions, evaluations, search depths, and best moves. Since different sequences of moves can lead to the exact same board state, the table prevents searching redundant lines twice.',
    wikipedia: 'https://en.wikipedia.org/wiki/Transposition_table',
    cpw: 'https://www.chessprogramming.org/Transposition_Table',
    diagram: `
Move sequence A: 1. e4 e6 2. d4 d5
Move sequence B: 1. d4 d5 2. e4 e6
Both yield the French Defense start position!
The engine retrieves the cached evaluation in O(1).
`
  },
  {
    id: 'quiescence',
    title: 'Quiescence Search',
    category: 'Computer Science',
    explanation: 'Quiescence Search is a critical mechanism to combat the Horizon Effect. When the search reaches depth 0, the engine continues to search only quiet captures and checks. This prevents evaluating a position as favorable when a heavy piece is hanging on the next ply.',
    wikipedia: 'https://en.wikipedia.org/wiki/Quiescence_search',
    cpw: 'https://www.chessprogramming.org/Quiescence_Search',
    diagram: `
Depth 0: White has captured a bishop. (Eval: +3.0)
Wait, on next ply Black can capture White's Queen!
Quiescence search forces captures evaluation.
Final stable static score: -6.0.
`
  },

  // Practical Chess Theory
  {
    id: 'openings',
    title: 'Chess Openings Guide',
    category: 'Openings',
    explanation: 'Openings comprise the initial phase of the match. The main objective is to develop minor pieces (knights, bishops), claim control of central squares (d4, e4, d5, e5), and castle to guarantee king safety. Famous openings include the Sicilian Defense, Italian Game, Caro-Kann, and Ruy Lopez.',
    wikipedia: 'https://en.wikipedia.org/wiki/Chess_opening',
    cpw: 'https://en.wikipedia.org/wiki/List_of_chess_openings',
    diagram: `
Control center squares directly (d4, e4, d5, e5).
Develop Knights and Bishops to active squares (Nf3, Nc6, Bc4).
Castle early to place King behind safe pawn shields.
`
  },
  {
    id: 'tactics',
    title: 'Tactics & Mating Patterns',
    category: 'Tactics',
    explanation: 'Tactics are short move sequences that yield material gains or deliver checkmate. Key concepts include Forks (attacking two pieces at once), Pins (immobilizing a piece because moving it exposes a higher value target), and Skewers (forcing a high-value piece to move, exposing a weaker piece behind it).',
    wikipedia: 'https://en.wikipedia.org/wiki/Chess_tactics',
    cpw: 'https://en.wikipedia.org/wiki/Tactics_(chess)',
    diagram: `
Fork: Knight on c7 attacks King on e8 and Rook on a8.
Pin: Bishop on b5 pins Knight on c6 against King on e8.
Skewer: Rook on h1 attacks King on h8, which must move, exposing Rook on h5.
`
  },
  {
    id: 'endgames',
    title: 'Endgames Fundamentals',
    category: 'Endgames',
    explanation: 'The endgame occurs when most pieces have been swapped off, leaving kings, pawns, and select heavy pieces. King activity becomes paramount, and the primary objective is promoting pawns to queens. Key endgame theory includes the Lucena Position (bridging rooks) and pawn opposition rules.',
    wikipedia: 'https://en.wikipedia.org/wiki/Chess_endgame',
    cpw: 'https://en.wikipedia.org/wiki/King_and_pawn_versus_king_endgame',
    diagram: `
Kings must become active and participate in fights.
Opposition: Kings stand face-to-face separated by 1 square.
Lucena Bridge: Rook shields King on 4th rank so pawn can promote.
`
  },

  // Chess Openings
  {
    id: 'london',
    title: 'The London System',
    category: 'Openings',
    explanation: 'The London System (1.d4 2.Nf3 3.Bf4) is a solid, low-theory opening for White. It prioritizes piece coordination over immediate pawn battles. The light-squared bishop is developed before playing e3, forming a stable setup. White aims for a kingside attack with h3, g4 ideas, or a queenside expansion.',
    wikipedia: 'https://en.wikipedia.org/wiki/London_System',
    cpw: 'https://www.chessgames.com/openings/london-system',
    diagram: `
1. d4  d5
2. Nf3 Nf6
3. Bf4 e6
4. e3  Be7
5. Bd3 O-O
6. O-O c5
Key idea: Central control + bishop pair + solid pawn structure.
`
  },
  {
    id: 'italian',
    title: 'Italian Game',
    category: 'Openings',
    explanation: 'The Italian Game begins 1.e4 e5 2.Nf3 Nc6 3.Bc4. White aims to place the bishop on the long diagonal targeting f7. The Giuoco Piano (3...Bc5) leads to rich middlegames, while the Two Knights (3...Nf6) offers Black sharp counterplay. A classic and rich opening for both sides.',
    wikipedia: 'https://en.wikipedia.org/wiki/Italian_Game',
    cpw: 'https://www.chessgames.com/openings/italian-game',
    diagram: `
1. e4  e5
2. Nf3 Nc6
3. Bc4 Bc5  (Giuoco Piano)
4. c3  Nf6
5. d4  exd4
6. cxd4 Bb4+
Key idea: Attack f7, open center with d4 at the right moment.
`
  },
  {
    id: 'ruylopez',
    title: 'Ruy Lopez (Spanish)',
    category: 'Openings',
    explanation: 'The Ruy Lopez (1.e4 e5 2.Nf3 Nc6 3.Bb5) is one of the oldest and most analyzed openings. White pins the knight defending e5, threatening to win the e5 pawn long-term. Black has numerous defenses: the Morphy Defense (3...a6), Marshall Attack (9...d5), and Berlin Defense (3...Nf6).',
    wikipedia: 'https://en.wikipedia.org/wiki/Ruy_Lopez',
    cpw: 'https://www.chessgames.com/openings/ruy-lopez',
    diagram: `
1. e4  e5
2. Nf3 Nc6
3. Bb5 a6   (Morphy Defense)
4. Ba4 Nf6
5. O-O Be7
6. Re1 b5
Key idea: Pressure on e5 pawn through piece coordination.
`
  },
  {
    id: 'sicilian',
    title: 'Sicilian Defense',
    category: 'Openings',
    explanation: 'The Sicilian Defense (1.e4 c5) is the most popular response to 1.e4. Black avoids symmetry, aiming for a dynamic game with asymmetrical pawn structures. Main lines include the Najdorf (5...a6), Dragon (5...g6), Scheveningen (5...e6), and Classical (5...Nc6). White typically plays the Open Sicilian (2.Nf3 + 3.d4).',
    wikipedia: 'https://en.wikipedia.org/wiki/Sicilian_Defence',
    cpw: 'https://www.chessgames.com/openings/sicilian-defense',
    diagram: `
1. e4  c5
2. Nf3 d6
3. d4  cxd4
4. Nxd4 Nf6
5. Nc3 a6   (Najdorf)
6. Bg5 e6
Key idea: Counterattack on queenside while White attacks kingside.
`
  },
  {
    id: 'french',
    title: 'French Defense',
    category: 'Openings',
    explanation: 'The French Defense (1.e4 e6) is a solid, strategic defense. Black allows White to occupy the center with 2.d4, then challenges it with 2...d5. The resulting positions are rich in pawn structures. White can choose the Advance (3.e5), Exchange (3.exd5), or Classical (3.Nc3). Black often gets queenside counterplay.',
    wikipedia: 'https://en.wikipedia.org/wiki/French_Defence',
    cpw: 'https://www.chessgames.com/openings/french-defense',
    diagram: `
1. e4  e6
2. d4  d5
3. Nc3 Nf6  (Classical)
4. Bg5 Be7
5. e5  Nfd7
6. Bxe7 Qxe7
Key idea: Undermine White's center with ...c5 and ...f6.
`
  },
  {
    id: 'carokann',
    title: 'Caro-Kann Defense',
    category: 'Openings',
    explanation: 'The Caro-Kann (1.e4 c6) is a solid defense where Black prepares ...d5 with tempo. Unlike the French, the light-squared bishop is not blocked. Main lines include the Classical (3...dxe4 4.Nxe4 Bf5), Advance (3.e5), and Panov Attack. Favored by players who prefer solid positions with fewer weaknesses.',
    wikipedia: 'https://en.wikipedia.org/wiki/Caro%E2%80%93Kann_Defence',
    cpw: 'https://www.chessgames.com/openings/caro-kann-defense',
    diagram: `
1. e4  c6
2. d4  d5
3. Nc3 dxe4  (Classical)
4. Nxe4 Bf5
5. Ng3 Bg6
6. Nf3 Nd7
Key idea: Solid center, no bishop locked in, queenside flexibility.
`
  },

  // Tactics
  {
    id: 'forks',
    title: 'Forks',
    category: 'Tactics',
    explanation: 'A fork is a tactic where a single piece attacks two or more enemy pieces simultaneously. Knights are particularly effective forking pieces due to their unique movement. Queens, rooks, bishops, and even pawns can execute forks. The key is forcing the opponent into a position where they cannot save both attacked pieces.',
    wikipedia: 'https://en.wikipedia.org/wiki/Fork_(chess)',
    cpw: 'https://www.chessprogramming.org/',
    diagram: `
   . . . . k . . .
   . . . . . . . .
   . . . . . . . .
   . . . N . . . .   Knight on d5 forks
   . . . . . r . .   King on e8 and Rook on f4!
   . . . . . . . .
Black must lose the rook.
`
  },
  {
    id: 'pins',
    title: 'Pins',
    category: 'Tactics',
    explanation: 'A pin restricts a piece from moving because doing so would expose a more valuable piece behind it. An absolute pin is against the king (the pinned piece legally cannot move). A relative pin is against another valuable piece. Bishops and rooks create pins along ranks, files, and diagonals.',
    wikipedia: 'https://en.wikipedia.org/wiki/Pin_(chess)',
    cpw: 'https://www.chessprogramming.org/',
    diagram: `
   . . . . k . . .
   . . . . . . . .
   . . . . N . . .   Knight on e6 is pinned!
   . . . . . . . .
   . . . . . . . .
   . . . . . . B .   Bishop on g3 pins N against King.
Moving the knight exposes the king to check — illegal!
`
  },
  {
    id: 'skewers',
    title: 'Skewers',
    category: 'Tactics',
    explanation: 'A skewer is the reverse of a pin. A long-range piece attacks a high-value piece, which must move, exposing a less valuable piece behind it to capture. Rooks, bishops, and queens execute skewers. A common skewer forces the king to move, revealing a rook or queen behind it.',
    wikipedia: 'https://en.wikipedia.org/wiki/Skewer_(chess)',
    cpw: 'https://www.chessprogramming.org/',
    diagram: `
   . . . . . . . k   King on h8
   . . . . . . . .
   . . . . . . . R   Rook on h1 skewers!
   . . . . . . . .
King must move — Rook on h5 is captured next!
The higher-value piece (King) is attacked first.
`
  },
  {
    id: 'discovered',
    title: 'Discovered Attacks',
    category: 'Tactics',
    explanation: 'A discovered attack occurs when a piece moves and reveals an attack from a piece behind it. A discovered check is particularly powerful since the king must respond to the check, allowing the moving piece to capture freely. A double check (both pieces give check simultaneously) can only be escaped by moving the king.',
    wikipedia: 'https://en.wikipedia.org/wiki/Discovered_attack',
    cpw: 'https://www.chessprogramming.org/',
    diagram: `
   . . . . k . . .
   . . . . . . . .
   . . . . N . . .   Knight moves: Ne6-d8+
   . . . . . . . .   Reveals Bishop attack on b3!
   . . b . . . . .   Double threat: check + free bishop capture!
`
  },

  // Endgames
  {
    id: 'opposition',
    title: 'The Opposition',
    category: 'Endgames',
    explanation: 'Opposition occurs when two kings stand on the same rank, file, or diagonal separated by one square. The player who does NOT have to move "has the opposition" and has a positional advantage. In K+P vs K endgames, taking the opposition is often the key to winning (or drawing for the defender).',
    wikipedia: 'https://en.wikipedia.org/wiki/Opposition_(chess)',
    cpw: 'https://en.wikipedia.org/wiki/King_and_pawn_versus_king_endgame',
    diagram: `
   . . . . . . . .
   . . . k . . . .   Black King on d6
   . . . . . . . .
   . . . K . . . .   White King on d4: White has the opposition!
   . . . . . . . .
   . . . P . . . .   Pawn on d2 will promote with correct play.
With opposition, White's king escorts the pawn safely.
`
  },
  {
    id: 'lucena',
    title: 'Lucena Position',
    category: 'Endgames',
    explanation: 'The Lucena Position is a winning rook-and-pawn endgame technique. White\'s king is in front of the pawn, Black\'s king is cut off, and White needs to use the "building a bridge" method: the rook shields the White king from checks by Black\'s rook, allowing the pawn to promote safely.',
    wikipedia: 'https://en.wikipedia.org/wiki/Lucena_position',
    cpw: 'https://en.wikipedia.org/wiki/Lucena_position',
    diagram: `
Building the Bridge:
1. Rc4 (cut off Black rook laterally)
2. Kd7 (advance the king)
3. Ra4+ (drive king away)
4. Kd8 → pawn promotes!
`
  },
  {
    id: 'philidor',
    title: 'Philidor Position',
    category: 'Endgames',
    explanation: 'The Philidor Position is the key defensive resource in rook-and-pawn endgames. The defending rook sits on the third rank to cut off the attacking king. Once the pawn advances, the rook switches to checking from behind. Named after François-André Philidor who analyzed it in 1749.',
    wikipedia: 'https://en.wikipedia.org/wiki/Philidor_position',
    cpw: 'https://en.wikipedia.org/wiki/Philidor_position',
    diagram: `
Defender's recipe:
1. Rook sits on 6th rank (if pawn on e4, rook on e6 or f6)
2. Wait until pawn advances to 5th rank
3. Switch to checking from behind: Ra6+ (perpetual)
This draws even against king + rook + pawn.
`
  },
  {
    id: 'kpk',
    title: 'King & Pawn vs King',
    category: 'Endgames',
    explanation: 'The K+P vs K endgame is a fundamental. White wins only if the king can escort the pawn to promotion without the Black king blocking on the queening square. The rule of the square: if the defending king can step into the "square" (diagonal) of the advancing pawn in one move, it draws. Rook pawns are always drawn unless the king is far away.',
    wikipedia: 'https://en.wikipedia.org/wiki/King_and_pawn_versus_king_endgame',
    cpw: 'https://en.wikipedia.org/wiki/King_and_pawn_versus_king_endgame',
    diagram: `
Rule of the Square:
Pawn on e4, Black King on a8.
Draw the diagonal from e4 to e8, e8 to a8: the square.
If Black King can reach ANY square inside — DRAW.
If White King can take opposition on d6/e6/f6 — WIN.
`
  },
];

export default function Learn() {
  const [activeTab, setActiveTab] = useState('minimax');

  const activeTopic = LEARN_TOPICS.find(t => t.id === activeTab);

  return (
    <div style={styles.learnWrapper} className="animate-fade-in">
      
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Learn Chess</h2>
          <p style={styles.subtitle}>Engine theory, opening systems, tactical patterns, and endgame technique.</p>
        </div>
      </div>

      <div style={styles.layoutGrid}>
        
        {/* Left Column: List navigation */}
        <div style={styles.navCol}>
          <div style={styles.navCard} className="panel-card">
            
            <div style={styles.navSectionTitle}><Code size={11} /> Engine Theory</div>
            <div style={styles.btnStack}>
              {LEARN_TOPICS.filter(t => t.category === 'Computer Science').map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    ...styles.navBtn,
                    backgroundColor: activeTab === t.id ? 'var(--color-bg-elevated)' : 'transparent',
                    borderLeft: activeTab === t.id ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
                    color: activeTab === t.id ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  {t.title}
                </button>
              ))}
            </div>

            <div style={styles.navSectionTitle}><Target size={11} /> Openings</div>
            <div style={styles.btnStack}>
              {LEARN_TOPICS.filter(t => t.category === 'Openings').map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    ...styles.navBtn,
                    backgroundColor: activeTab === t.id ? 'var(--color-bg-elevated)' : 'transparent',
                    borderLeft: activeTab === t.id ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
                    color: activeTab === t.id ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  {t.title}
                </button>
              ))}
            </div>

            <div style={styles.navSectionTitle}><Sword size={11} /> Tactics</div>
            <div style={styles.btnStack}>
              {LEARN_TOPICS.filter(t => t.category === 'Tactics').map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    ...styles.navBtn,
                    backgroundColor: activeTab === t.id ? 'var(--color-bg-elevated)' : 'transparent',
                    borderLeft: activeTab === t.id ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
                    color: activeTab === t.id ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  {t.title}
                </button>
              ))}
            </div>

            <div style={styles.navSectionTitle}><Clock size={11} /> Endgames</div>
            <div style={styles.btnStack}>
              {LEARN_TOPICS.filter(t => t.category === 'Endgames').map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    ...styles.navBtn,
                    backgroundColor: activeTab === t.id ? 'var(--color-bg-elevated)' : 'transparent',
                    borderLeft: activeTab === t.id ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
                    color: activeTab === t.id ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  {t.title}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Right Column: Article Details */}
        <div style={styles.contentCol}>
          {activeTopic && (
            <div style={styles.contentCard} className="panel-card animate-fade-in">
              
              <div style={styles.metaRow}>
                <span style={styles.categoryBadge}>{activeTopic.category}</span>
              </div>

              <h3 style={styles.topicTitle}>{activeTopic.title}</h3>
              <p style={styles.topicExplanation}>{activeTopic.explanation}</p>

              {/* Text diagram */}
              <div style={styles.diagramSection}>
                <div style={styles.diagramHeader}>Visual Representation / Flow</div>
                <pre style={styles.diagramText}>{activeTopic.diagram}</pre>
              </div>

              {/* Link references */}
              <div style={styles.linksRow}>
                <a href={activeTopic.wikipedia} target="_blank" rel="noopener noreferrer" style={styles.link}>
                  <span>Wikipedia Article</span>
                  <ExternalLink size={11} />
                </a>
                <a href={activeTopic.cpw} target="_blank" rel="noopener noreferrer" style={styles.link}>
                  <span>Chess Programming Wiki</span>
                  <ExternalLink size={11} />
                </a>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}

const styles = {
  learnWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    padding: '20px',
  },
  header: {
    borderBottom: '1px solid var(--color-border-subtle)',
    paddingBottom: '12px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    marginTop: '2px',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '30% 70%',
    gap: '30px',
    alignItems: 'start',
  },
  navCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  navCard: {
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  navSectionTitle: {
    fontSize: '9px',
    color: 'var(--color-text-dim)',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderBottom: '1px solid var(--color-border-subtle)',
    paddingBottom: '4px',
  },
  btnStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navBtn: {
    padding: '8px 10px',
    fontSize: '12px',
    fontWeight: '600',
    textAlign: 'left',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    ':hover': { backgroundColor: 'var(--color-bg-base)' }
  },
  contentCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  contentCard: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  metaRow: {
    display: 'flex',
  },
  categoryBadge: {
    fontSize: '9px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    padding: '3px 8px',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    color: 'var(--color-brand-primary)',
    borderRadius: '4px',
  },
  topicTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    marginTop: '-5px',
  },
  topicExplanation: {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.6',
  },
  diagramSection: {
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '6px',
    padding: '14px 18px',
  },
  diagramHeader: {
    fontSize: '9px',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '700',
    marginBottom: '8px',
  },
  diagramText: {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.4',
    whiteSpace: 'pre',
    overflowX: 'auto',
  },
  linksRow: {
    display: 'flex',
    gap: '20px',
    marginTop: '10px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-brand-primary)',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    ':hover': { color: 'var(--color-brand-hover)' }
  }
};
