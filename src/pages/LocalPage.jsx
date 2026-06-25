// Kronos Chess V2 — Pass & Play Page
// Shows a lobby setup screen before the game starts so the timer only runs after clicking Start Game.

import React, { useState, useEffect } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import ChessBoard from '../components/ChessBoard';
import ControlPanel from '../components/ControlPanel';
import MoveHistory from '../components/MoveHistory';
import PostGameReview from '../components/PostGameReview';
import { PlayCircle, Users } from 'lucide-react';

// ── Lobby Setup Screen ────────────────────────────────────────────────────────
function LocalGameLobby({ onStart, defaultTimeControl }) {
  const [selectedTime, setSelectedTime] = useState(defaultTimeControl || '10+0');

  const TIME_OPTIONS = [
    { value: '1+0',    label: '1 min',   type: 'Bullet' },
    { value: '3+0',    label: '3 min',   type: 'Blitz' },
    { value: '5+0',    label: '5 min',   type: 'Blitz' },
    { value: '10+0',   label: '10 min',  type: 'Rapid' },
    { value: '30+0',   label: '30 min',  type: 'Classical' },
    { value: 'casual', label: 'Casual',  type: 'Untimed' },
  ];

  return (
    <div style={lobby.overlay} className="animate-fade-in">
      <div style={lobby.card} className="panel-card">

        {/* Header */}
        <div style={lobby.header}>
          <div style={lobby.headerIcon}>
            <Users size={40} color="var(--color-brand-primary)" />
          </div>
          <div>
            <h2 style={lobby.title}>Pass & Play</h2>
            <p style={lobby.subtitle}>Two players, one device. Board flips automatically after each move.</p>
          </div>
        </div>

        <div style={lobby.divider} />

        {/* Time Control */}
        <div style={lobby.section}>
          <div style={lobby.sectionLabel}>Time Control</div>
          <div style={lobby.timeGrid}>
            {TIME_OPTIONS.map(t => (
              <button
                key={t.value}
                onClick={() => setSelectedTime(t.value)}
                style={{
                  ...lobby.timeBtn,
                  backgroundColor: selectedTime === t.value ? 'rgba(212,175,55,0.1)' : 'var(--color-bg-elevated)',
                  borderColor: selectedTime === t.value ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
                  color: selectedTime === t.value ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                }}
              >
                <span style={lobby.timeLabel}>{t.label}</span>
                <span style={lobby.timeType}>{t.type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Players info */}
        <div style={lobby.playersRow}>
          <div style={lobby.playerChip}>
            <span style={lobby.pieceWhite}>♔</span>
            <span style={lobby.chipLabel}>Player 1 — White</span>
          </div>
          <span style={lobby.vsText}>vs</span>
          <div style={lobby.playerChip}>
            <span style={lobby.pieceBlack}>♚</span>
            <span style={lobby.chipLabel}>Player 2 — Black</span>
          </div>
        </div>

        <div style={lobby.divider} />

        {/* Start Button */}
        <button onClick={() => onStart(selectedTime)} style={lobby.startBtn} className="btn-gold">
          <PlayCircle size={18} />
          <span>Start Game</span>
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LocalPage({ boardTheme, soundEnabled }) {
  const game = useChessGame('kronos_v2_local_state', 'local');
  const [previewIndex, setPreviewIndex] = useState(null);
  const [reviewTabActive, setReviewTabActive] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Show lobby if no active game with moves played
  const [gameStarted, setGameStarted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kronos_v2_local_state') || '{}');
      return saved?.gameStatus === 'active' && (saved?.gameHistory?.length > 0);
    } catch { return false; }
  });

  // Sync theme and sound from global shell
  useEffect(() => {
    game.setBoardTheme(boardTheme);
  }, [boardTheme]);

  useEffect(() => {
    game.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // Show review when game ends
  useEffect(() => {
    if (game.gameStatus !== 'active' && game.gameStatus !== 'idle') {
      setReviewTabActive(true);
    }
  }, [game.gameStatus]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e || typeof e.key !== 'string') return;
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
      if (isInputFocused) return;

      const key = e.key.toLowerCase();

      if (key === 'n') {
        e.preventDefault();
        setGameStarted(false);
        setReviewTabActive(false);
        setPreviewIndex(null);
      }
      if (key === 'f') {
        e.preventDefault();
        game.flipBoard();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (game.gameHistory.length > 0) {
          setPreviewIndex(prev => {
            if (prev === null) return game.gameHistory.length - 1;
            return Math.max(0, prev - 1);
          });
        }
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (previewIndex !== null) {
          setPreviewIndex(prev => {
            if (prev === game.gameHistory.length - 1) return null;
            return prev + 1;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const handleNewGame = () => {
      setGameStarted(false);
      setReviewTabActive(false);
      setPreviewIndex(null);
    };
    const handleFlipBoard = () => game.flipBoard();

    window.addEventListener('kronos_new_game', handleNewGame);
    window.addEventListener('kronos_flip_board', handleFlipBoard);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('kronos_new_game', handleNewGame);
      window.removeEventListener('kronos_flip_board', handleFlipBoard);
    };
  }, [game, previewIndex]);

  const handleLobbyStart = (timeControl) => {
    // resetGame applies timeControl and resets all state including timers
    game.resetGame(null, timeControl, 'local');
    setGameStarted(true);
    setReviewTabActive(false);
    setPreviewIndex(null);
  };

  const handleResetToLobby = () => {
    game.resetGame(null, null, 'local');
    setGameStarted(false);
    setReviewTabActive(false);
    setPreviewIndex(null);
  };

  // Show lobby before game starts
  if (!gameStarted) {
    return (
      <LocalGameLobby
        onStart={handleLobbyStart}
        defaultTimeControl={game.timeControl}
      />
    );
  }

  const boardFen = previewIndex !== null && game.gameHistory[previewIndex]
    ? game.gameHistory[previewIndex].after
    : game.fen;

  return (
    <div style={styles.splitGrid} className="animate-fade-in">
      {/* Left: Chessboard */}
      <div style={styles.boardColumn}>
        <ChessBoard
          fen={boardFen}
          gameHistory={game.gameHistory}
          boardOrientation={game.boardOrientation}
          boardTheme={game.boardTheme}
          evalScore=""
          isSearching={false}
          gameStatus={game.gameStatus}
          playerColor={game.playerColor}
          playerTime={game.playerTime}
          engineTime={game.engineTime}
          captured={game.captured}
          inCheck={game.inCheck}
          modeSelected={game.modeSelected}
          difficulty={game.difficulty}
          timeControl={game.timeControl}
          makeMove={game.makeMove}
          reviewedMove={previewIndex !== null ? game.gameHistory[previewIndex] : null}
          showHeatmap={showHeatmap}
        />
      </div>

      {/* Right: Sidebar */}
      <div style={styles.sidebarColumn}>
        <div style={styles.sidebarWrapper} className="panel-card">
          {reviewTabActive ? (
            <PostGameReview
              gameHistory={game.gameHistory}
              openingName={game.openingName}
              winner={game.winner}
              playerColor={game.playerColor}
              modeSelected={game.modeSelected}
              onReset={handleResetToLobby}
              onSelectMoveIndex={(idx) => setPreviewIndex(idx)}
              isAnalyzing={game.isAnalyzing}
              analysisProgress={game.analysisProgress}
              showHeatmap={showHeatmap}
              onToggleHeatmap={setShowHeatmap}
            />
          ) : (
            <>
              <div style={styles.controlSection}>
                <ControlPanel
                  modeSelected={game.modeSelected}
                  setModeSelected={game.setModeSelected}
                  difficulty={game.difficulty}
                  setDifficulty={game.setDifficulty}
                  rulesLevel={game.rulesLevel}
                  setRulesLevel={game.setRulesLevel}
                  timeControl={game.timeControl}
                  setTimeControl={game.setTimeControl}
                  engineStats={game.engineStats}
                  candidateMoves={game.candidateMoves}
                  isSearching={false}
                  thinkingStatus={game.thinkingStatus}
                  gameStatus={game.gameStatus}
                  winner={game.winner}
                  playerColor={game.playerColor}
                  resetGame={handleResetToLobby}
                  resignGame={game.resignGame}
                  offerDraw={game.offerDraw}
                  flipBoard={game.flipBoard}
                  undoMove={game.undoMove}
                  fen={game.fen}
                  gameHistory={game.gameHistory}
                  importFen={game.importFen}
                  importPgn={game.importPgn}
                  openingName={game.openingName}
                  ecoCode={game.ecoCode}
                />
              </div>
              <div style={styles.historyDivider} />
              <div style={styles.historySection}>
                <MoveHistory
                  gameHistory={game.gameHistory}
                  openingName={game.openingName}
                  ecoCode={game.ecoCode}
                  previewIndex={previewIndex}
                  setPreviewIndex={setPreviewIndex}
                  modeSelected={game.modeSelected}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Lobby Styles ──────────────────────────────────────────────────────────────
const lobby = {
  overlay: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  headerIcon: {
    flexShrink: 0,
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-display)',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    marginTop: '4px',
    lineHeight: 1.5,
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--color-border-subtle)',
    margin: '16px 0',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-dim)',
  },
  timeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  timeBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    padding: '12px 8px',
    border: '1px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'var(--font-sans)',
  },
  timeLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'inherit',
  },
  timeType: {
    fontSize: '10px',
    color: 'var(--color-text-dim)',
    fontWeight: '600',
  },
  playersRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '12px 0',
  },
  playerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '8px',
    flex: 1,
    justifyContent: 'center',
  },
  pieceWhite: {
    fontSize: '20px',
    color: '#f0e8d0',
  },
  pieceBlack: {
    fontSize: '20px',
    color: '#9e8a7a',
  },
  chipLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-text-secondary)',
  },
  vsText: {
    fontSize: '12px',
    fontWeight: '800',
    color: 'var(--color-text-dim)',
    flexShrink: 0,
  },
  startBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px',
    fontSize: '14px',
    fontWeight: '800',
    borderRadius: '8px',
    letterSpacing: '0.02em',
    width: '100%',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-display)',
  },
};

// ── Game Page Styles ──────────────────────────────────────────────────────────
const styles = {
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '70% 30%',
    gap: '12px',
    height: 'calc(100vh - 56px)',
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '12px 16px',
    boxSizing: 'border-box',
  },
  boardColumn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
  },
  sidebarColumn: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarWrapper: {
    flex: 1,
    minHeight: 0,
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  controlSection: {
    flexShrink: 0,
  },
  historyDivider: {
    height: '1px',
    backgroundColor: 'var(--color-border-subtle)',
    margin: '10px 0',
    flexShrink: 0,
  },
  historySection: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
};
