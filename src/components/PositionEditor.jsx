// Kronos Chess V2 — Board Position Editor
// Interactive editor to set up custom board FENs and launch them in Play, Analysis, or Local modes.

import React, { useState, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Trash2, RotateCcw, Play, Clipboard, Eye, Shuffle } from 'lucide-react';

const PIECE_LIST = [
  { code: 'wP', label: '♙', color: 'w', type: 'p' },
  { code: 'wN', label: '♘', color: 'w', type: 'n' },
  { code: 'wB', label: '♗', color: 'w', type: 'b' },
  { code: 'wR', label: '♖', color: 'w', type: 'r' },
  { code: 'wQ', label: '♕', color: 'w', type: 'q' },
  { code: 'wK', label: '♔', color: 'w', type: 'k' },
  { code: 'bP', label: '♟', color: 'b', type: 'p' },
  { code: 'bN', label: '♞', color: 'b', type: 'n' },
  { code: 'bB', label: '♝', color: 'b', type: 'b' },
  { code: 'bR', label: '♜', color: 'b', type: 'r' },
  { code: 'bQ', label: '♛', color: 'b', type: 'q' },
  { code: 'bK', label: '♚', color: 'b', type: 'k' }
];

const BOARD_THEME_COLORS = {
  walnut: { dark: '#b58863', light: '#f0d9b5' },
  green:  { dark: '#739552', light: '#ececd7' },
  slate:  { dark: '#4d6073', light: '#e8ebef' }
};

export default function PositionEditor({ onPlayPosition, boardTheme }) {
  const [boardState, setBoardState] = useState({
    a1: 'wR', b1: 'wN', c1: 'wB', d1: 'wQ', e1: 'wK', f1: 'wB', g1: 'wN', h1: 'wR',
    a2: 'wP', b2: 'wP', c2: 'wP', d2: 'wP', e2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP',
    a7: 'bP', b7: 'bP', c7: 'bP', d7: 'bP', e7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
    a8: 'bR', b8: 'bN', c8: 'bB', d8: 'bQ', e8: 'bK', f8: 'bB', g8: 'bN', h8: 'bR'
  });

  const [activeTool, setActiveTool] = useState(null); // 'wP', 'wN', etc., or 'erase'
  const [fenInput, setFenInput] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [turn, setTurn] = useState('w');
  const [errorMsg, setErrorMsg] = useState('');

  const themeColors = useMemo(() => {
    return BOARD_THEME_COLORS[boardTheme] || BOARD_THEME_COLORS.walnut;
  }, [boardTheme]);

  const customDarkSquareStyle = useMemo(() => ({ backgroundColor: themeColors.dark }), [themeColors.dark]);
  const customLightSquareStyle = useMemo(() => ({ backgroundColor: themeColors.light }), [themeColors.light]);

  // Convert boardState object to FEN string
  const calculateFen = (state, activeTurn) => {
    try {
      const rows = [];
      for (let r = 8; r >= 1; r--) {
        let emptyCount = 0;
        let rowStr = '';
        for (let f = 0; f < 8; f++) {
          const file = String.fromCharCode(97 + f);
          const square = `${file}${r}`;
          const piece = state[square];

          if (piece) {
            if (emptyCount > 0) {
              rowStr += emptyCount;
              emptyCount = 0;
            }
            const color = piece[0];
            const type = piece[1];
            rowStr += color === 'w' ? type.toUpperCase() : type.toLowerCase();
          } else {
            emptyCount++;
          }
        }
        if (emptyCount > 0) {
          rowStr += emptyCount;
        }
        rows.push(rowStr);
      }

      let castling = '';
      if (state.e1 === 'wK') {
        if (state.h1 === 'wR') castling += 'K';
        if (state.a1 === 'wR') castling += 'Q';
      }
      if (state.e8 === 'bK') {
        if (state.h8 === 'bR') castling += 'k';
        if (state.a8 === 'bR') castling += 'q';
      }
      if (castling === '') castling = '-';

      return `${rows.join('/')} ${activeTurn} ${castling} - 0 1`;
    } catch (e) {
      return '';
    }
  };

  const handleSquareClick = (square) => {
    const newState = { ...boardState };

    if (activeTool === 'erase') {
      delete newState[square];
    } else if (activeTool) {
      newState[square] = activeTool;
    }

    setBoardState(newState);
    const newFen = calculateFen(newState, turn);
    setFenInput(newFen);
    setErrorMsg('');
  };

  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    const newState = { ...boardState };
    delete newState[sourceSquare];
    if (targetSquare) {
      newState[targetSquare] = piece;
    }

    setBoardState(newState);
    const newFen = calculateFen(newState, turn);
    setFenInput(newFen);
    setErrorMsg('');
    return true;
  };

  const handleClearBoard = () => {
    const newState = { e1: 'wK', e8: 'bK' }; // Keep kings
    setBoardState(newState);
    const newFen = calculateFen(newState, turn);
    setFenInput(newFen);
    setErrorMsg('');
  };

  const handleResetBoard = () => {
    const newState = {
      a1: 'wR', b1: 'wN', c1: 'wB', d1: 'wQ', e1: 'wK', f1: 'wB', g1: 'wN', h1: 'wR',
      a2: 'wP', b2: 'wP', c2: 'wP', d2: 'wP', e2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP',
      a7: 'bP', b7: 'bP', c7: 'bP', d7: 'bP', e7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
      a8: 'bR', b8: 'bN', c8: 'bB', d8: 'bQ', e8: 'bK', f8: 'bB', g8: 'bN', h8: 'bR'
    };
    setBoardState(newState);
    const newFen = calculateFen(newState, turn);
    setFenInput(newFen);
    setErrorMsg('');
  };

  const handleLoadFen = (fenStr) => {
    try {
      new Chess(fenStr); // Validate
      const rows = fenStr.split(' ')[0].split('/');
      const newState = {};

      for (let r = 0; r < 8; r++) {
        let fileIndex = 0;
        const rowStr = rows[r];
        for (let c = 0; c < rowStr.length; c++) {
          const char = rowStr[c];
          if (isNaN(char)) {
            const isWhite = char === char.toUpperCase();
            const pieceCode = (isWhite ? 'w' : 'b') + char.toUpperCase();
            const square = `${String.fromCharCode(97 + fileIndex)}${8 - r}`;
            newState[square] = pieceCode;
            fileIndex++;
          } else {
            fileIndex += parseInt(char);
          }
        }
      }

      setBoardState(newState);
      const activeTurn = fenStr.split(' ')[1] || 'w';
      setTurn(activeTurn);
      setFenInput(fenStr);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Invalid FEN format.');
    }
  };

  const handleCopyFen = () => {
    navigator.clipboard.writeText(fenInput);
  };

  const handlePasteFen = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) handleLoadFen(text.trim());
    } catch (e) {
      setErrorMsg('Clipboard access blocked. Please paste manually.');
    }
  };

  const handleStartGame = (mode) => {
    try {
      // Validate FEN with chess.js before launching
      const chess = new Chess(fenInput);
      if (chess.isGameOver()) {
        setErrorMsg('The game is already over in this position.');
        return;
      }
      onPlayPosition(fenInput, mode);
    } catch (err) {
      setErrorMsg('Cannot launch match: Invalid setup (ensure both kings exist).');
    }
  };

  return (
    <div style={styles.editorWrapper} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Position Editor</h2>
          <p style={styles.subtitle}>Drag pieces or click tools to design custom positions.</p>
        </div>
        <div style={styles.actionHeaderRow}>
          <button onClick={handleResetBoard} style={styles.hdrBtn} className="btn-bronze">
            <RotateCcw size={12} /> Reset
          </button>
          <button onClick={handleClearBoard} style={styles.hdrBtn} className="btn-bronze">
            <Trash2 size={12} /> Clear
          </button>
        </div>
      </div>

      <div style={styles.mainGrid} className="editor-main-grid">
        
        {/* Board column */}
        <div style={styles.boardCol} className="editor-board-col">
          <div style={styles.boardCard} className="panel-card">
            <Chessboard
              options={{
                id: 'EditorBoard',
                position: calculateFen(boardState, turn),
                onPieceDrop: ({ sourceSquare, targetSquare, piece }) =>
                  handlePieceDrop(sourceSquare, targetSquare, piece?.pieceType || piece),
                onSquareClick: ({ square }) => handleSquareClick(square),
                darkSquareStyle:  { backgroundColor: customDarkSquareStyle?.backgroundColor },
                lightSquareStyle: { backgroundColor: customLightSquareStyle?.backgroundColor },
                animationDurationInMs: 0,
                allowDragging: activeTool === null,
                allowDragOffBoard: true,
              }}
            />
          </div>
        </div>

        {/* Configuration Column */}
        <div style={styles.configCol} className="editor-config-col">
          
          {/* Piece Grid */}
          <div style={styles.configSection}>
            <div style={styles.sectionTitle}>Placeable Pieces</div>
            <div style={styles.pieceGrid}>
              {PIECE_LIST.map((p) => (
                <button
                  key={p.code}
                  onClick={() => setActiveTool(p.code)}
                  style={{
                    ...styles.pieceBtn,
                    backgroundColor: activeTool === p.code ? 'rgba(212, 175, 55, 0.15)' : 'var(--color-bg-elevated)',
                    borderColor: activeTool === p.code ? 'var(--color-brand-primary)' : 'var(--color-border-default)'
                  }}
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => setActiveTool('erase')}
                style={{
                  ...styles.toolBtn,
                  gridColumn: 'span 3',
                  backgroundColor: activeTool === 'erase' ? 'rgba(245, 101, 101, 0.1)' : 'var(--color-bg-elevated)',
                  borderColor: activeTool === 'erase' ? '#f56565' : 'var(--color-border-default)',
                  color: activeTool === 'erase' ? '#f56565' : 'var(--color-text-secondary)'
                }}
              >
                <Trash2 size={13} /> Eraser
              </button>
              <button
                onClick={() => setActiveTool(null)}
                style={{
                  ...styles.toolBtn,
                  gridColumn: 'span 3',
                  backgroundColor: activeTool === null ? 'var(--color-bg-elevated)' : 'var(--color-bg-elevated)',
                  borderColor: activeTool === null ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
                  color: activeTool === null ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)'
                }}
              >
                Drag pieces
              </button>
            </div>
          </div>

          {/* Turn selector */}
          <div style={styles.configSection}>
            <div style={styles.sectionTitle}>Side to Move</div>
            <div style={styles.turnRow}>
              <button
                onClick={() => { setTurn('w'); setFenInput(calculateFen(boardState, 'w')); }}
                style={{
                  ...styles.turnBtn,
                  backgroundColor: turn === 'w' ? 'var(--color-brand-primary)' : 'var(--color-bg-elevated)',
                  color: turn === 'w' ? '#1a130e' : 'var(--color-text-secondary)'
                }}
              >
                White to Move
              </button>
              <button
                onClick={() => { setTurn('b'); setFenInput(calculateFen(boardState, 'b')); }}
                style={{
                  ...styles.turnBtn,
                  backgroundColor: turn === 'b' ? 'var(--color-brand-primary)' : 'var(--color-bg-elevated)',
                  color: turn === 'b' ? '#1a130e' : 'var(--color-text-secondary)'
                }}
              >
                Black to Move
              </button>
            </div>
          </div>

          {/* FEN Box */}
          <div style={styles.configSection}>
            <div style={styles.sectionTitle}>FEN Position String</div>
            <div style={styles.fenForm}>
              <input
                type="text"
                value={fenInput}
                onChange={(e) => setFenInput(e.target.value)}
                style={styles.fenInput}
              />
              <div style={styles.fenActionRow}>
                <button onClick={handleCopyFen} style={styles.fenActionBtn} className="btn-bronze"><Clipboard size={12} /> Copy</button>
                <button onClick={handlePasteFen} style={styles.fenActionBtn} className="btn-bronze"><Clipboard size={12} /> Paste</button>
                <button onClick={() => handleLoadFen(fenInput)} style={styles.fenLoadBtn} className="btn-gold">Load</button>
              </div>
            </div>
            {errorMsg && <div style={styles.errorText}>{errorMsg}</div>}
          </div>

          {/* Launch Buttons */}
          <div style={styles.launchSection}>
            <div style={styles.sectionTitle}>Launch Position</div>
            <div style={styles.launchGrid}>
              <button onClick={() => handleStartGame('ai')} style={styles.launchBtn} className="btn-gold">
                <Play size={13} fill="#1a130e" /> Play vs Engine
              </button>
              <button onClick={() => handleStartGame('local')} style={styles.launchBtn} className="btn-gold">
                <Shuffle size={13} /> Pass & Play
              </button>
              <button onClick={() => handleStartGame('analysis')} className="btn-gold" style={{ gridColumn: 'span 2', ...styles.launchBtn }}>
                <Eye size={13} /> Open in Analysis Board
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

const styles = {
  editorWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    padding: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  actionHeaderRow: {
    display: 'flex',
    gap: '8px',
  },
  hdrBtn: {
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '70% 30%',
    gap: '30px',
    alignItems: 'start',
  },
  boardCol: {
    display: 'flex',
    justifyContent: 'center',
  },
  boardCard: {
    width: '100%',
    maxWidth: '520px',
    aspectRatio: '1',
    backgroundColor: '#171311',
    border: 'none',
  },
  configCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  configSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  sectionTitle: {
    fontSize: '9px',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '800',
  },
  pieceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    padding: '6px',
    borderRadius: '12px',
  },
  pieceBtn: {
    height: '36px',
    fontSize: '20px',
    color: 'var(--color-text-primary)',
    border: '1px solid',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.1s ease',
  },
  toolBtn: {
    height: '28px',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'none',
    border: '1px solid',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    transition: 'all 0.1s ease',
  },
  turnRow: {
    display: 'flex',
    gap: '6px',
  },
  turnBtn: {
    flex: 1,
    height: '32px',
    fontSize: '11px',
    fontWeight: '700',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textTransform: 'none',
    letterSpacing: '0.02em',
    transition: 'all 0.2s ease',
  },
  fenForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fenInput: {
    width: '100%',
    padding: '8px 10px',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    color: 'var(--color-text-primary)',
    fontSize: '11px',
    fontFamily: 'monospace',
    outline: 'none',
  },
  fenActionRow: {
    display: 'flex',
    gap: '6px',
  },
  fenActionBtn: {
    flex: 1,
    height: '28px',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  fenLoadBtn: {
    flex: 1.5,
    height: '28px',
    fontSize: '10px',
    fontWeight: '700',
  },
  errorText: {
    fontSize: '10px',
    color: '#fc8181',
    fontWeight: '600',
    lineHeight: '1.3',
  },
  launchSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  launchGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
  },
  launchBtn: {
    height: '34px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  }
};
