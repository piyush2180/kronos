import React from 'react';
import ChessBoard from '../ChessBoard';
import ControlPanel from '../ControlPanel';
import OpeningExplorer from '../OpeningExplorer';

export default function AnalysisMobile({
  game,
  boardFen,
  evalBarVisible,
  showExplorer,
  setShowExplorer,
  previewIndex,
  setPreviewIndex,
}) {
  return (
    <div style={styles.mobileContainer} className="animate-fade-in">
      {/* Centered Board (95% width) */}
      <div style={styles.boardMobileContainer}>
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

      {/* Analysis Control Panel & Explorer */}
      <div style={styles.panelMobileCard}>
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
        <div style={styles.explorerOverlay}>
          <OpeningExplorer
            openingName={game.openingName}
            ecoCode={game.ecoCode}
            onClose={() => setShowExplorer(false)}
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  mobileContainer: {
    width: '100%',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxSizing: 'border-box',
  },
  boardMobileContainer: {
    width: '95%',
    maxWidth: '420px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
  },
  panelMobileCard: {
    width: '100%',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '10px',
    padding: '12px',
    boxSizing: 'border-box',
  },
  explorerOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 11000,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
