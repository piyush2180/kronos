import React, { useState, useEffect, useRef } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import ChessBoard from '../components/ChessBoard';
import ControlPanel from '../components/ControlPanel';
import PostGameReview from '../components/PostGameReview';
import MatchSetupPage from '../components/MatchSetupPage';
import { colors, spacing, geometry, typography } from '../theme/designTokens';

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PlayPage({ username, boardTheme, soundEnabled }) {
  const game = useChessGame('kronos_v2_play_state', 'ai');
  const { previewIndex, setPreviewIndex } = game;
  const [reviewTabActive, setReviewTabActive] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Game options set at setup time
  const [gameOptions, setGameOptions] = useState(() => {
    try {
      const saved = localStorage.getItem('kronos_v2_game_options');
      return saved ? JSON.parse(saved) : {
        showEvalBar: true, showPV: true, premoveEnabled: true, autoAnalysis: false, moveHints: false
      };
    } catch {
      return { showEvalBar: true, showPV: true, premoveEnabled: true, autoAnalysis: false, moveHints: false };
    }
  });

  // Show lobby if no active game
  const [gameStarted, setGameStarted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kronos_v2_play_state') || '{}');
      return saved?.gameStatus === 'active' && (saved?.gameHistory?.length > 0);
    } catch { return false; }
  });

  // Sync global theme and sound settings into the game hook
  useEffect(() => { game.setBoardTheme(boardTheme); }, [boardTheme]);
  useEffect(() => { game.setSoundEnabled(soundEnabled); }, [soundEnabled]);

  // Apply premove setting from game options
  useEffect(() => {
    game.setPremoveEnabled(gameOptions.premoveEnabled);
  }, [gameOptions.premoveEnabled]);

  // Switch to review tab when game ends (but do NOT auto-generate analysis)
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
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) return;
      const key = e.key.toLowerCase();

      if (key === 'n') { e.preventDefault(); setGameStarted(false); setReviewTabActive(false); setPreviewIndex(null); }
      if (key === 'f') { e.preventDefault(); game.flipBoard(); }
      if (key === 'e') { e.preventDefault(); setGameOptions(o => ({ ...o, showEvalBar: !o.showEvalBar })); }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (game.gameHistory.length > 0) setPreviewIndex(prev => prev === null ? game.gameHistory.length - 1 : Math.max(0, prev - 1));
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (previewIndex !== null) setPreviewIndex(prev => prev === game.gameHistory.length - 1 ? null : prev + 1);
      }
    };

    const handleNewGame  = () => { setGameStarted(false); setReviewTabActive(false); setPreviewIndex(null); };
    const handleFlipBoard = () => game.flipBoard();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('kronos_new_game', handleNewGame);
    window.addEventListener('kronos_flip_board', handleFlipBoard);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('kronos_new_game', handleNewGame);
      window.removeEventListener('kronos_flip_board', handleFlipBoard);
    };
  }, [game, previewIndex]);

  const handleLobbyStart = (color, difficulty, timeControl, options) => {
    setGameOptions(options);
    localStorage.setItem('kronos_v2_game_options', JSON.stringify(options));
    game.setDifficulty(difficulty);
    if (color === 'simulate') {
      game.resetGame('w', timeControl, 'simulate');
    } else {
      game.resetGame(color, timeControl, 'ai');
    }
    setGameStarted(true);
    setReviewTabActive(false);
    setPreviewIndex(null);
    setShowHeatmap(false);
  };

  const handleResetToLobby = () => {
    game.resetGame(null, null, 'ai');
    setGameStarted(false);
    setReviewTabActive(false);
    setPreviewIndex(null);
    setShowHeatmap(false);
  };

  // ── Show setup page if no game in progress ─────────────────────────────────
  if (!gameStarted) {
    return (
      <MatchSetupPage
        onStart={handleLobbyStart}
        defaultDifficulty={game.difficulty}
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
          evalScore={gameOptions.showEvalBar ? game.evalScore : ''}
          isSearching={game.isSearching}
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
          premove={game.premove}
          onPremove={game.queuePremove}
          clearPremove={game.clearPremove}
          reviewedMove={previewIndex !== null ? game.gameHistory[previewIndex] : null}
          showHeatmap={showHeatmap}
          candidateMoves={gameOptions.showPV ? game.candidateMoves : []}
        />
      </div>

      {/* Right: Sidebar */}
      <div style={styles.sidebarColumn} className="sidebar-column-wrapper">
        <div style={styles.sidebarWrapper} className="sidebar-card-wrapper">
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
              previewIndex={previewIndex}
              triggerAnalysis={game.triggerPostGameAnalysis}
              cancelAnalysis={game.cancelPostGameAnalysis}
            />
          ) : (
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
              candidateMoves={gameOptions.showPV ? game.candidateMoves : []}
              isSearching={game.isSearching}
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
              premoveEnabled={gameOptions.premoveEnabled}
              setPremoveEnabled={(v) => setGameOptions(o => ({ ...o, premoveEnabled: v }))}
              showPV={gameOptions.showPV}
              previewIndex={previewIndex}
              setPreviewIndex={setPreviewIndex}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Game Page Styles ────────────────────────────────────────────────────────────
const styles = {
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 440px',
    gap: '24px',
    height: '100%',
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '24px',
    position: 'relative',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  boardColumn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    height: '100%',
  },
  sidebarColumn: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: '100%',
    width: '440px',
    overflow: 'hidden',
  },
  sidebarWrapper: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '8px',
    height: '100%',
    overflow: 'hidden',
  },
};
