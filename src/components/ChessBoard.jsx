// Kronos Chess V2 — Chessboard & HUD Container
// Uses react-chessboard v5 API (options prop object)

import React, { useMemo, useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import EvaluationBar from './EvaluationBar';

const BOARD_COLORS = {
  walnut: { light: '#f0d9b5', dark: '#b58863' },
  green:  { light: '#ececd7', dark: '#739552' },
  slate:  { light: '#e8ebef', dark: '#4d6073' }
};

const HUD_PIECE_GLYPHS = {
  p: '♙', n: '♘', b: '♗', r: '♖', q: '♕'
};

export default function ChessBoard({
  fen,
  gameHistory,
  boardOrientation,
  boardTheme,
  evalScore,
  isSearching,
  gameStatus,
  playerColor,
  playerTime,
  engineTime,
  captured,
  inCheck,
  modeSelected,
  difficulty,
  timeControl,
  makeMove,
  premove,
  onPremove,
  clearPremove,
  candidateMoves = [],
  reviewedMove = null,
  showHeatmap = false,
  whitePlayerName = 'White Player',
  blackPlayerName = 'Black Player'
}) {
  const [selectedSquare, setSelectedSquare] = useState(null);

  // ── Orientation helpers ───────────────────────────────────────────────────
  const isWhiteBottom = boardOrientation === 'white';
  const bottomSide = isWhiteBottom ? 'white' : 'black';
  const topSide    = isWhiteBottom ? 'black' : 'white';

  // ── Theme colours ─────────────────────────────────────────────────────────
  const themeColors = useMemo(
    () => BOARD_COLORS[boardTheme] || BOARD_COLORS.walnut,
    [boardTheme]
  );

  // ── Timer formatter ───────────────────────────────────────────────────────
  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── King-in-check highlight ───────────────────────────────────────────────
  const checkSquareStyle = useMemo(() => {
    if (!inCheck || !fen) return {};
    const turn = fen.split(' ')[1];
    const rows = fen.split(' ')[0].split('/');
    let checkSquare = null;
    for (let r = 0; r < 8 && !checkSquare; r++) {
      let fileIdx = 0;
      for (const ch of rows[r]) {
        if (isNaN(ch)) {
          if ((turn === 'w' && ch === 'K') || (turn === 'b' && ch === 'k')) {
            checkSquare = `${String.fromCharCode(97 + fileIdx)}${8 - r}`;
            break;
          }
          fileIdx++;
        } else {
          fileIdx += parseInt(ch);
        }
      }
    }
    return checkSquare
      ? { [checkSquare]: { background: 'radial-gradient(circle, rgba(220,38,38,0.65) 0%, rgba(220,38,38,0.15) 70%, transparent 100%)' } }
      : {};
  }, [fen, inCheck]);

  // ── Legal Moves calculation ────────────────────────────────────────────────
  const legalMovesForSelected = useMemo(() => {
    if (!selectedSquare || !fen) return [];
    try {
      const chess = new Chess(fen);
      return chess.moves({ square: selectedSquare, verbose: true }).map(m => ({
        to: m.to,
        isCapture: !!chess.get(m.to)
      }));
    } catch {
      return [];
    }
  }, [fen, selectedSquare]);

  // ── Square highlight styles ───────────────────────────────────────────────
  const squareStyles = useMemo(() => {
    const s = {};

    // 1. Move Heatmap Overlay (lowest priority, drawn first)
    if (showHeatmap && gameHistory && gameHistory.length > 0) {
      const frequencies = {};
      gameHistory.forEach(m => {
        if (m.to) {
          frequencies[m.to] = (frequencies[m.to] || 0) + 1;
        }
      });
      const maxFreq = Math.max(...Object.values(frequencies), 1);
      Object.keys(frequencies).forEach(sq => {
        const intensity = frequencies[sq] / maxFreq;
        s[sq] = {
          backgroundColor: `rgba(212, 175, 55, ${0.1 + intensity * 0.45})`,
          boxShadow: `inset 0 0 0 2px rgba(212, 175, 55, ${0.2 + intensity * 0.5})`
        };
      });
    }

    // 2. Standard board overlays (check, selected, last-move, premove)
    if (checkSquareStyle) {
      Object.assign(s, checkSquareStyle);
    }

    if (selectedSquare) {
      s[selectedSquare] = {
        ...s[selectedSquare],
        backgroundColor: 'rgba(212, 175, 55, 0.35)',
        boxShadow: 'inset 0 0 0 3px rgba(212, 175, 55, 0.9)'
      };
    }

    // 2.5. Legal Moves Highlighting (radial dots or capture rings)
    legalMovesForSelected.forEach(({ to, isCapture }) => {
      s[to] = {
        ...s[to],
        background: isCapture
          ? 'radial-gradient(circle, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.5) 85%, transparent 90%)'
          : 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.3) 25%, transparent 28%)',
        cursor: 'pointer'
      };
    });

    if (gameHistory && gameHistory.length > 0) {
      const last = gameHistory[gameHistory.length - 1];
      if (last?.from) s[last.from] = { ...s[last.from], backgroundColor: 'rgba(212, 175, 55, 0.2)' };
      if (last?.to)   s[last.to]   = { ...s[last.to],   backgroundColor: 'rgba(212, 175, 55, 0.2)' };
    }
    if (premove) {
      s[premove.from] = {
        ...s[premove.from],
        backgroundColor: 'rgba(249, 115, 22, 0.35)',
        boxShadow: 'inset 0 0 0 3px rgba(249, 115, 22, 0.8)'
      };
      s[premove.to] = {
        ...s[premove.to],
        backgroundColor: 'rgba(249, 115, 22, 0.25)',
        boxShadow: 'inset 0 0 0 3px rgba(249, 115, 22, 0.6)'
      };
    }
    // Highlight Stockfish best move squares in analysis mode
    if (modeSelected === 'analysis' && candidateMoves && candidateMoves.length > 0) {
      const bestMoveUci = candidateMoves[0]?.bestMove;
      if (bestMoveUci && bestMoveUci.length >= 4) {
        const fromSquare = bestMoveUci.slice(0, 2);
        const toSquare = bestMoveUci.slice(2, 4);
        s[fromSquare] = {
          ...s[fromSquare],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          boxShadow: 'inset 0 0 0 3px rgba(59, 130, 246, 0.6)'
        };
        s[toSquare] = {
          ...s[toSquare],
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          boxShadow: 'inset 0 0 0 3px rgba(59, 130, 246, 0.4)'
        };
      }
    }

    // 3. Post-Game Blunder Circles (highest priority, drawn last)
    if (reviewedMove && reviewedMove.to) {
      const cls = reviewedMove.classification;
      if (cls === 'Blunder') {
        s[reviewedMove.to] = {
          ...s[reviewedMove.to],
          background: 'radial-gradient(circle, rgba(220,38,38,0.75) 0%, rgba(220,38,38,0.2) 65%, transparent 100%)',
          boxShadow: 'inset 0 0 0 3px rgba(220,38,38,0.9)'
        };
      } else if (cls === 'Mistake') {
        s[reviewedMove.to] = {
          ...s[reviewedMove.to],
          background: 'radial-gradient(circle, rgba(237,137,54,0.75) 0%, rgba(237,137,54,0.2) 65%, transparent 100%)',
          boxShadow: 'inset 0 0 0 3px rgba(237,137,54,0.9)'
        };
      } else if (cls === 'Inaccuracy') {
        s[reviewedMove.to] = {
          ...s[reviewedMove.to],
          background: 'radial-gradient(circle, rgba(236,201,75,0.75) 0%, rgba(236,201,75,0.2) 65%, transparent 100%)',
          boxShadow: 'inset 0 0 0 3px rgba(236,201,75,0.9)'
        };
      }
    }

    return s;
  }, [checkSquareStyle, selectedSquare, gameHistory, premove, modeSelected, candidateMoves, reviewedMove, showHeatmap, legalMovesForSelected]);

  // ── Best move arrow suggestion ─────────────────────────────────────────────
  const arrows = useMemo(() => {
    if (modeSelected === 'analysis' && candidateMoves && candidateMoves.length > 0) {
      const bestMoveUci = candidateMoves[0]?.bestMove;
      if (bestMoveUci && bestMoveUci.length >= 4) {
        const from = bestMoveUci.slice(0, 2);
        const to = bestMoveUci.slice(2, 4);
        return [{
          startSquare: from,
          endSquare: to,
          color: 'rgba(59, 130, 246, 0.75)'
        }];
      }
    }
    return [];
  }, [modeSelected, candidateMoves]);

  // ── v5 Event handlers (NOTE: v5 uses named-arg objects, not positional) ──
  // onSquareClick receives: { piece, square }
  const handleSquareClick = useCallback(({ square }) => {
    if (gameStatus !== 'active') return;

    // Premove logic when it is not our turn in AI mode
    if (modeSelected === 'ai') {
      const turn = fen ? fen.split(' ')[1] : 'w';
      if (turn !== playerColor || isSearching) {
        if (selectedSquare) {
          if (selectedSquare === square) {
            setSelectedSquare(null);
          } else {
            if (onPremove) onPremove(selectedSquare, square);
            setSelectedSquare(null);
          }
        } else {
          setSelectedSquare(square);
        }
        return;
      }
    }

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
      } else {
        const moved = makeMove({ from: selectedSquare, to: square, promotion: 'q' });
        if (moved) {
          setSelectedSquare(null);
        } else {
          setSelectedSquare(square);
        }
      }
    } else {
      setSelectedSquare(square);
    }
  }, [gameStatus, isSearching, modeSelected, playerColor, fen, selectedSquare, onPremove, makeMove]);

  // onPieceDrop receives: { piece, sourceSquare, targetSquare }
  const handlePieceDrop = useCallback(({ sourceSquare, targetSquare }) => {
    if (gameStatus !== 'active') return false;

    // Premove logic when it is not our turn in AI mode
    if (modeSelected === 'ai') {
      const turn = fen ? fen.split(' ')[1] : 'w';
      if (turn !== playerColor || isSearching) {
        if (onPremove) {
          onPremove(sourceSquare, targetSquare);
          return true;
        }
        return false;
      }
    }

    const moved = makeMove({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    if (moved) {
      setSelectedSquare(null);
      return true;
    }
    return false;
  }, [gameStatus, isSearching, modeSelected, playerColor, fen, onPremove, makeMove]);

  // canDragPiece receives: { isSparePiece, piece, square }
  // Block dragging when game is over, or dragging opponent's pieces
  const canDragPiece = useCallback(({ piece, square }) => {
    if (gameStatus !== 'active') return false;
    if (modeSelected === 'simulate') return false;
    if (modeSelected === 'ai') {
      const pieceColor = piece.pieceType ? piece.pieceType[0] : piece[0];
      const isWhitePiece = pieceColor === 'w' || pieceColor === 'W';
      if (playerColor === 'w' && !isWhitePiece) return false;
      if (playerColor === 'b' && isWhitePiece) return false;
    }
    return true;
  }, [gameStatus, modeSelected, playerColor]);

  const handleSquareRightClick = useCallback(({ square }) => {
    if (clearPremove) clearPremove();
  }, [clearPremove]);

  // ── v5 options object ────────────────────────────────────────────────────
  const boardOptions = useMemo(() => ({
    id: 'KronosBoard',
    position: fen || 'start',
    boardOrientation,
    darkSquareStyle:  { backgroundColor: themeColors.dark },
    lightSquareStyle: { backgroundColor: themeColors.light },
    squareStyles,
    arrows,
    allowDragging: true,   // always allow dragging — canDragPiece gates it
    canDragPiece,
    onPieceDrop: handlePieceDrop,
    onSquareClick: handleSquareClick,
    onSquareRightClick: handleSquareRightClick,
    animationDurationInMs: 150,
    showAnimations: true,
    showBoardLabels: true,
    boardStyle: {
      borderRadius: '2px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
    }
  }), [
    fen, boardOrientation,
    themeColors.dark, themeColors.light,
    squareStyles, arrows, canDragPiece, handlePieceDrop, handleSquareClick, handleSquareRightClick
  ]);

  // ── HUD renderer ──────────────────────────────────────────────────────────
  const renderHUD = (side, isTop) => {
    const isPlayerSide = side === boardOrientation;

    let displayName = 'Player';
    let displayRating = '';
    
    if (modeSelected === 'ai') {
      if (isPlayerSide) {
        displayName = localStorage.getItem('kronos_v2_active_user') || 'Guest';
        displayRating = ' (1500 Elo)';
      } else {
        displayName = 'Kronos';
        const depthVal = difficulty === 'beginner' ? 2 : difficulty === 'casual' ? 4 : difficulty === 'club' ? 5 : difficulty === 'advanced' ? 6 : 7;
        displayRating = ` (${depthVal}-ply)`;
      }
    } else if (modeSelected === 'local') {
      displayName = side === 'white' ? whitePlayerName : blackPlayerName;
    } else if (modeSelected === 'analysis') {
      displayName = isPlayerSide ? 'Player' : 'Stockfish';
    } else if (modeSelected === 'simulate') {
      displayName = side === 'white' ? 'Kronos (White)' : 'Kronos (Black)';
    }

    // Fix the timer swapping bug when board is flipped
    let clockTime = 0;
    if (modeSelected === 'local') {
      clockTime = side === 'white' ? playerTime : engineTime;
    } else {
      const isPlayerWhite = playerColor === 'w';
      if (side === 'white') {
        clockTime = isPlayerWhite ? playerTime : engineTime;
      } else {
        clockTime = isPlayerWhite ? engineTime : playerTime;
      }
    }

    const hasClock = timeControl !== 'casual' && modeSelected !== 'analysis';
    const capturedList = side === 'white' ? (captured?.w || []) : (captured?.b || []);
    const balance = captured?.balance || 0;
    const showBalance = side === 'white' ? balance > 0 : balance < 0;
    const isLowTime = hasClock && clockTime < 30;

    return (
      <div style={styles.hudWrapper}>
        <div style={styles.hudLeft}>
          <div style={styles.avatarCircle}>{displayName[0].toUpperCase()}</div>
          <div style={styles.hudInfo}>
            <div style={styles.nameRow}>
              <span style={styles.hudName}>{displayName}</span>
              {displayRating && <span style={styles.hudRating}>{displayRating}</span>}
              {isTop && !isPlayerSide && modeSelected === 'ai' && (
                <span style={styles.engineBadge}>Kronos AI</span>
              )}
            </div>
            {!isTop && (
              <div style={styles.capturedContainer}>
                {capturedList.map((p, idx) => (
                  <span key={idx} style={styles.capturedPiece}>
                    {HUD_PIECE_GLYPHS[p.type] || p.type}
                  </span>
                ))}
                {showBalance && (
                  <span style={styles.balanceText}>+{Math.abs(balance)}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {hasClock && (
          <div style={{
            ...styles.timerBox,
            backgroundColor: isLowTime ? '#4a1111' : 'var(--color-bg-elevated)',
            borderColor:     isLowTime ? '#9b2c2c' : 'rgba(255, 255, 255, 0.05)',
            color:           isLowTime ? '#f56565' : 'var(--color-text-primary)'
          }}>
            {formatTime(clockTime)}
          </div>
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const hasEvalBar = modeSelected !== 'local' && evalScore !== undefined && evalScore !== '';
  const boardSize = 'min(70vh, 50vw, 700px)';
  const totalWidth = hasEvalBar ? `calc(${boardSize} + 28px)` : boardSize;

  return (
    <div style={{ ...styles.boardHUDWrapper, maxWidth: totalWidth }}>
      {renderHUD(topSide, true)}

      <div style={{ ...styles.boardRow, height: boardSize }}>
        {hasEvalBar && (
          <EvaluationBar score={evalScore} orientation={boardOrientation} />
        )}
        <div style={{ ...styles.boardContainer, width: boardSize, height: boardSize }}>
          <Chessboard options={boardOptions} />
        </div>
      </div>

      {renderHUD(bottomSide, false)}
    </div>
  );
}

const styles = {
  boardHUDWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  hudWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    height: '56px',
    minHeight: '56px',
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
  },
  hudLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
  },
  hudInfo: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  engineBadge: {
    fontSize: '9px',
    fontWeight: '850',
    backgroundColor: 'rgba(200, 159, 61, 0.1)',
    color: 'var(--color-brand-primary)',
    border: '1px solid rgba(200, 159, 61, 0.3)',
    padding: '1px 5px',
    borderRadius: '3px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  avatarCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  hudName: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  hudRating: {
    fontSize: '12px',
    color: 'var(--color-text-dim)',
    marginLeft: '4px',
    fontWeight: '500',
  },
  capturedContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1px',
    fontSize: '16px',
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    flexShrink: 1,
  },
  capturedPiece: {
    lineHeight: 1,
    opacity: 0.8,
  },
  balanceText: {
    fontSize: '10px',
    fontWeight: '800',
    color: 'var(--color-brand-bronze)',
    marginLeft: '6px',
    flexShrink: 0,
  },
  timerBox: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
    fontSize: '15px',
    fontWeight: '700',
    textAlign: 'center',
    minWidth: '72px',
    flexShrink: 0,
    transition: 'all 0.15s ease',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  },
  boardRow: {
    display: 'flex',
    gap: '0px',
    alignItems: 'stretch',
    width: '100%',
  },
  boardContainer: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    overflow: 'hidden',
    backgroundColor: '#171311',
  }
};
