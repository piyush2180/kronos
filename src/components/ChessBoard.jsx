// Kronos Chess V2 — Chessboard & HUD Container
// Uses react-chessboard v5 API (options prop object)

import React, { useMemo, useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
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
  showHeatmap = false
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
  }, [checkSquareStyle, selectedSquare, gameHistory, premove, modeSelected, candidateMoves, reviewedMove, showHeatmap]);

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
  const renderHUD = (side) => {
    const isPlayerSide = side === boardOrientation;

    let displayName = 'Local Opponent';
    if (modeSelected === 'ai') {
      displayName = isPlayerSide
        ? (localStorage.getItem('kronos_v2_active_user') || 'Guest')
        : 'Kronos';
    } else if (modeSelected === 'analysis') {
      displayName = isPlayerSide ? 'Analysis' : 'Stockfish';
    } else if (modeSelected === 'local') {
      displayName = side === 'white' ? 'White Player' : 'Black Player';
    } else if (modeSelected === 'simulate') {
      displayName = side === 'white' ? 'Kronos (White)' : 'Kronos (Black)';
    }

    const clockTime = side === 'white'
      ? (isWhiteBottom ? playerTime : engineTime)
      : (isWhiteBottom ? engineTime : playerTime);

    const hasClock = timeControl !== 'casual' && modeSelected !== 'analysis';
    const capturedList = side === 'white' ? (captured?.w || []) : (captured?.b || []);
    const balance = captured?.balance || 0;
    const showBalance = side === 'white' ? balance > 0 : balance < 0;
    const isLowTime = hasClock && clockTime < 30;

    return (
      <div style={styles.hudWrapper}>
        <div style={styles.hudLeft}>
          <div style={styles.avatarCircle}>{displayName[0].toUpperCase()}</div>
          <div style={styles.hudName}>{displayName}</div>
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
        </div>

        {hasClock && (
          <div style={{
            ...styles.timerBox,
            backgroundColor: isLowTime ? '#4a1111' : 'var(--color-bg-surface)',
            borderColor:     isLowTime ? '#9b2c2c' : 'var(--color-border-default)',
            color:           isLowTime ? '#f56565' : 'var(--color-text-primary)'
          }}>
            {formatTime(clockTime)}
          </div>
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.boardHUDWrapper}>
      {renderHUD(topSide)}

      <div style={styles.boardRow}>
        {modeSelected !== 'local' && (
          <EvaluationBar score={evalScore} orientation={boardOrientation} />
        )}
        <div style={styles.boardContainer}>
          <Chessboard options={boardOptions} />
        </div>
      </div>

      {renderHUD(bottomSide)}
    </div>
  );
}

const styles = {
  boardHUDWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    maxWidth: 'min(70vh, 680px)',
  },
  hudWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 12px',
    backgroundColor: 'rgba(27, 18, 12, 0.4)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
    height: '42px',
    minHeight: '42px',
  },
  hudLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
    overflow: 'hidden',
  },
  avatarCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-bright)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
    flexShrink: 0,
  },
  hudName: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px',
    flexShrink: 1,
  },
  capturedContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1px',
    fontSize: '15px',
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
    marginLeft: '4px',
    flexShrink: 0,
  },
  timerBox: {
    padding: '4px 10px',
    borderRadius: '4px',
    border: '1px solid',
    fontFamily: 'monospace',
    fontSize: '14px',
    fontWeight: '700',
    textAlign: 'center',
    minWidth: '60px',
    flexShrink: 0,
    transition: 'all 0.3s ease',
  },
  boardRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'stretch',
    width: '100%',
    aspectRatio: '1',
  },
  boardContainer: {
    flex: 1,
    minWidth: 0,
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: '#1b120c',
    padding: '2px',
  }
};
