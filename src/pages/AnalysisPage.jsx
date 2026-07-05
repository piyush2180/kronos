// Kronos Chess V2 — Analysis Board Page
// Manages isolated analysis state with Stockfish telemetry and slide-out opening explorer.

import React, { useState, useEffect } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import ChessBoard from '../components/ChessBoard';
import ControlPanel from '../components/ControlPanel';
import OpeningExplorer from '../components/OpeningExplorer';
import { colors, spacing, geometry, typography } from '../theme/designTokens';

export default function AnalysisPage({ boardTheme, soundEnabled }) {
  const game = useChessGame('kronos_v2_analysis_state', 'analysis');
  const { previewIndex, setPreviewIndex } = game;
  const [showExplorer, setShowExplorer] = useState(false);
  const [evalBarVisible, setEvalBarVisible] = useState(true);

  // Force modeSelected to analysis on mount
  useEffect(() => {
    game.setModeSelected('analysis');
  }, []);

  // Sync theme and sound from global shell
  useEffect(() => {
    game.setBoardTheme(boardTheme);
  }, [boardTheme]);

  useEffect(() => {
    game.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // Keyboard shortcuts and command palette events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e || typeof e.key !== 'string') return;
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
      if (isInputFocused) return;

      const key = e.key.toLowerCase();

      if (key === 'n') {
        e.preventDefault();
        game.resetGame(null, null, 'analysis');
        setPreviewIndex(null);
      }
      if (key === 'f') {
        e.preventDefault();
        game.flipBoard();
      }
      if (key === 'e') {
        e.preventDefault();
        setEvalBarVisible(prev => !prev);
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
      game.resetGame(null, null, 'analysis');
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

  const boardFen = previewIndex !== null && game.gameHistory[previewIndex]
    ? game.gameHistory[previewIndex].after
    : game.fen;

  return (
    <div style={styles.splitGrid} className="animate-fade-in game-split-grid">
      {/* Left: Chessboard Column */}
      <div style={styles.boardColumn} className="board-column-wrapper">
        <ChessBoard
          fen={boardFen}
          gameHistory={game.gameHistory}
          boardOrientation={game.boardOrientation}
          boardTheme={game.boardTheme}
          evalScore={evalBarVisible ? game.evalScore : ''}
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
          candidateMoves={game.candidateMoves}
        />
      </div>

      {/* Right: Sidebar container */}
      <div style={styles.sidebarColumn} className="sidebar-column-wrapper">
        <div style={styles.sidebarWrapper} className="sidebar-card-wrapper">
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
            isSearching={game.isSearching}
            thinkingStatus={game.thinkingStatus}
            gameStatus={game.gameStatus}
            winner={game.winner}
            playerColor={game.playerColor}
            resetGame={game.resetGame}
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
            onOpenExplorer={() => setShowExplorer(true)}
            previewIndex={previewIndex}
            setPreviewIndex={setPreviewIndex}
          />
        </div>

        {/* Slide-out Opening Explorer Panel */}
        {showExplorer && (
          <OpeningExplorer
            openingName={game.openingName}
            ecoCode={game.ecoCode}
            onClose={() => setShowExplorer(false)}
          />
        )}
      </div>
    </div>
  );
}

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
