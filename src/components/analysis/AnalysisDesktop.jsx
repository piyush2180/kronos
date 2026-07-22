import React from 'react';
import ChessBoard from '../ChessBoard';
import ControlPanel from '../ControlPanel';
import OpeningExplorer from '../OpeningExplorer';

export default function AnalysisDesktop({
  game,
  boardFen,
  evalBarVisible,
  showExplorer,
  setShowExplorer,
  previewIndex,
  setPreviewIndex,
}) {
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
