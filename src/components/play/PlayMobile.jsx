import React from 'react';
import ChessBoard from '../ChessBoard';
import ControlPanel from '../ControlPanel';
import PostGameReview from '../PostGameReview';
import MatchSetupPage from '../MatchSetupPage';

export default function PlayMobile({
  gameStarted,
  game,
  boardFen,
  gameOptions,
  reviewTabActive,
  showHeatmap,
  previewIndex,
  setPreviewIndex,
  setShowHeatmap,
  setGameOptions,
  handleLobbyStart,
  handleResetToLobby,
}) {
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

  return (
    <div style={styles.mobileWrapper} className="animate-fade-in">
      {/* 1. Chessboard (95% width, centered) */}
      <div style={styles.boardMobileContainer}>
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

      {/* 2. Controls & Panel Stacked */}
      <div style={styles.panelMobileCard}>
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
  );
}

const styles = {
  mobileWrapper: {
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
};
