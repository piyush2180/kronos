// Kronos Chess V2 — Pass & Play Page
// Shows a lobby setup screen before the game starts so the timer only runs after clicking Start Game.

import React, { useState, useEffect } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import ChessBoard from '../components/ChessBoard';
import ControlPanel from '../components/ControlPanel';
import MoveHistory from '../components/MoveHistory';
import PostGameReview from '../components/PostGameReview';
import { PlayCircle, Users } from 'lucide-react';
import { colors, spacing, geometry, typography } from '../theme/designTokens';

// ── Lobby Setup Screen ────────────────────────────────────────────────────────
function LocalGameLobby({ onStart, defaultTimeControl, boardTheme }) {
  const [selectedTime, setSelectedTime] = useState(defaultTimeControl || '10+0');

  const TIME_OPTIONS = [
    { value: '1+0', label: '1 min', type: 'Bullet' },
    { value: '3+0', label: '3 min', type: 'Blitz' },
    { value: '5+0', label: '5 min', type: 'Blitz' },
    { value: '10+0', label: '10 min', type: 'Rapid' },
    { value: '30+0', label: '30 min', type: 'Classical' },
    { value: 'casual', label: 'Casual', type: 'Untimed' },
  ];

  return (
    <div style={styles.splitGrid} className="animate-fade-in">
      {/* Left Column: Board Preview */}
      <div style={styles.boardColumn}>
        <ChessBoard
          fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          boardOrientation="white"
          boardTheme={boardTheme}
          evalScore=""
          isSearching={false}
          gameStatus="idle"
          playerColor="w"
          makeMove={() => {}}
        />
      </div>

      {/* Right Column: Pass & Play Configuration */}
      <div style={styles.sidebarColumn}>
        <div style={{ ...lobby.configPanel, border: '1px solid var(--color-border-subtle)', boxShadow: 'none' }} className="panel-card">
          <div style={lobby.configHeader}>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: '600', color: 'var(--color-brand-primary)', textTransform: 'capitalize' }}>Local match setup</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0.1rem 0' }}>Pass & Play Settings</h2>
            </div>
          </div>

          <div style={lobby.scrollBody}>
            {/* Players Matchup */}
            <div style={lobby.section}>
              <div style={lobby.sectionLabel}>Matchup Overview</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '12px 0', backgroundColor: 'var(--color-bg-base)', borderRadius: '6px', border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>♔</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>White</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-dim)', fontWeight: '700' }}>VS</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>♚</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Black</span>
                </div>
              </div>
            </div>

            {/* Time Control Chips */}
            <div style={lobby.section}>
              <div style={lobby.sectionLabel}>Time Control</div>
              <div className="segmented-control" style={{ flexWrap: 'wrap' }}>
                {TIME_OPTIONS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setSelectedTime(t.value)}
                    className={`segmented-control-btn ${selectedTime === t.value ? 'segmented-control-btn-active' : ''}`}
                    style={{ flex: '1 0 30%' }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Match Rules & Specs */}
            <div style={{ backgroundColor: 'var(--color-bg-base)', padding: `10px 14px`, borderRadius: '6px', border: '1px solid var(--color-border-subtle)', fontSize: '0.72rem', color: 'var(--color-text-dim)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontWeight: '600', color: 'var(--color-text-secondary)' }}>Rules of Play</span>
              <span>Two players share one screen. The board flips automatically after each completed move to face the active side.</span>
            </div>
          </div>

          {/* Start Button Fixed at Bottom */}
          <div style={lobby.fixedFooter}>
            <button onClick={() => onStart(selectedTime)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.85rem' }}>
              <PlayCircle size={15} />
              <span>Start Match</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LocalPage({ boardTheme, soundEnabled }) {
  const game = useChessGame('kronos_v2_local_state', 'local');
  const { previewIndex, setPreviewIndex } = game;
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
        boardTheme={game.boardTheme}
      />
    );
  }

  const boardFen = previewIndex !== null && game.gameHistory[previewIndex]
    ? game.gameHistory[previewIndex].after
    : game.fen;

  return (
    <div style={styles.splitGrid} className="animate-fade-in game-split-grid">
      {/* Left: Chessboard */}
      <div style={styles.boardColumn} className="board-column-wrapper">
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
      <div style={styles.sidebarColumn} className="sidebar-column-wrapper">
        <div style={styles.sidebarWrapper} className="panel-card sidebar-card-wrapper">
          {reviewTabActive ? (
            <PostGameReview
              gameHistory={game.gameHistory}
              openingName={game.openingName}
              winner={game.winner}
              playerColor={game.playerColor}
              modeSelected={game.modeSelected}
              difficulty={game.difficulty}
              onReset={handleResetToLobby}
              onSelectMoveIndex={(idx) => setPreviewIndex(idx)}
              isAnalyzing={game.isAnalyzing}
              analysisProgress={game.analysisProgress}
              showHeatmap={showHeatmap}
              onToggleHeatmap={setShowHeatmap}
              triggerAnalysis={game.triggerPostGameAnalysis}
              cancelAnalysis={game.cancelPostGameAnalysis}
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

// ── Lobby Workstation Styles ──────────────────────────────────────────────────
const lobby = {
  configPanel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    padding: spacing.xl,
    gap: spacing.xl,
    overflow: 'hidden'
  },
  configHeader: {
    paddingBottom: spacing.sm,
    borderBottom: '1px solid var(--color-border-subtle)'
  },
  scrollBody: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
    paddingRight: '0.2rem'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs
  },
  sectionLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: 'var(--color-text-dim)',
    textTransform: 'capitalize'
  },
  playersRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm
  },
  playerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `${spacing.sm} ${spacing.md}`,
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: geometry.radiusCard,
    flex: 1
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  chipBtn: {
    padding: `${spacing.xs} ${spacing.md}`,
    fontSize: '0.78rem',
    fontWeight: '600',
    borderRadius: geometry.radiusInteractive,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center'
  },
  fixedFooter: {
    paddingTop: spacing.md,
    borderTop: '1px solid var(--color-border-subtle)',
    marginTop: 'auto'
  }
};

// ── Game Page Styles ──────────────────────────────────────────────────────────
const styles = {
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '60% 40%',
    gap: spacing.xl,
    height: 'calc(100vh - 56px)',
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: `${spacing.lg} ${spacing.xl}`,
    boxSizing: 'border-box'
  },
  boardColumn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    minWidth: 0,
    minHeight: 0
  },
  sidebarColumn: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column'
  },
  sidebarWrapper: {
    flex: 1,
    minHeight: 0,
    padding: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxSizing: 'border-box'
  },
  controlSection: {
    flexShrink: 0
  },
  historyDivider: {
    height: '1px',
    backgroundColor: 'var(--color-border-subtle)',
    margin: `${spacing.md} 0`,
    flexShrink: 0
  },
  historySection: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  }
};
