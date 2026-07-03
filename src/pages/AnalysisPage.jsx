// Kronos Chess V2 — Analysis Board Page
// Manages isolated analysis state with Stockfish telemetry and slide-out opening explorer.

import React, { useState, useEffect } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import ChessBoard from '../components/ChessBoard';
import ControlPanel from '../components/ControlPanel';
import MoveHistory from '../components/MoveHistory';
import OpeningExplorer from '../components/OpeningExplorer';

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
      {/* Left: Chessboard */}
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
        <div style={styles.sidebarWrapper} className="panel-card sidebar-card-wrapper">
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
              onOpenExplorer={() => setShowExplorer(true)}
            />
          </div>
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
    gridTemplateColumns: '70% 30%',
    gap: '12px',
    height: 'calc(100vh - 56px)',
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '12px 16px',
    position: 'relative',
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
    position: 'relative',
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
    position: 'relative',
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
