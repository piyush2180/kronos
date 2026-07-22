import React, { useState } from 'react';
import ChessBoard from '../ChessBoard';
import ControlPanel from '../ControlPanel';
import PostGameReview from '../PostGameReview';
import { PlayCircle, User } from 'lucide-react';

export default function PassPlayMobile({
  gameStarted,
  game,
  boardTheme,
  whitePlayerName,
  blackPlayerName,
  reviewTabActive,
  showHeatmap,
  previewIndex,
  setPreviewIndex,
  setShowHeatmap,
  handleLobbyStart,
  handleResetToLobby,
}) {
  // Lobby state
  const [selectedTime, setSelectedTime] = useState(game.timeControl || '10+0');
  const [whiteName, setWhiteName] = useState(whitePlayerName || 'White Player');
  const [blackName, setBlackName] = useState(blackPlayerName || 'Black Player');
  const [startingOrientation, setStartingOrientation] = useState('white');
  const [rules, setRules] = useState('casual');

  const TIME_OPTIONS = [
    { value: '1+0', label: '1 min' },
    { value: '3+0', label: '3 min' },
    { value: '5+0', label: '5 min' },
    { value: '10+0', label: '10 min' },
    { value: '30+0', label: '30 min' },
    { value: 'casual', label: 'Casual' },
  ];

  if (!gameStarted) {
    return (
      <div style={styles.mobileLobbyWrapper} className="animate-fade-in">
        {/* 1. Board Preview (95% width, centered) */}
        <div style={styles.boardPreviewCard}>
          <div style={{ width: '95%', maxWidth: '380px', margin: '0 auto', aspectRatio: '1' }}>
            <ChessBoard
              fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
              boardOrientation={startingOrientation}
              boardTheme={boardTheme}
              evalScore=""
              isSearching={false}
              gameStatus="idle"
              playerColor="w"
              makeMove={() => {}}
              whitePlayerName={whiteName}
              blackPlayerName={blackName}
              timeControl={selectedTime}
            />
          </div>
        </div>

        {/* 2. Players Card (Full Width) */}
        <div style={styles.card}>
          <div style={styles.sectionLabel}>Players</div>
          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <User size={16} style={{ color: '#f0d9b5', flexShrink: 0 }} />
              <input
                type="text"
                value={whiteName}
                onChange={(e) => setWhiteName(e.target.value)}
                style={styles.textInput}
                placeholder="White Player Name"
              />
            </div>
            <div style={styles.inputWrapper}>
              <User size={16} style={{ color: '#b58863', flexShrink: 0 }} />
              <input
                type="text"
                value={blackName}
                onChange={(e) => setBlackName(e.target.value)}
                style={styles.textInput}
                placeholder="Black Player Name"
              />
            </div>
          </div>
        </div>

        {/* 3. Time Controls (Responsive Grid) */}
        <div style={styles.card}>
          <div style={styles.sectionLabel}>Time Control</div>
          <div style={styles.timeGrid}>
            {TIME_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedTime(t.value)}
                style={{
                  ...styles.timeBtn,
                  backgroundColor: selectedTime === t.value ? 'rgba(212, 175, 55, 0.15)' : 'var(--color-bg-elevated)',
                  borderColor: selectedTime === t.value ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)',
                  color: selectedTime === t.value ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Orientation */}
        <div style={styles.card}>
          <div style={styles.sectionLabel}>Board Orientation</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setStartingOrientation('white')}
              style={{
                ...styles.toggleBtn,
                backgroundColor: startingOrientation === 'white' ? 'rgba(212, 175, 55, 0.15)' : 'var(--color-bg-elevated)',
                borderColor: startingOrientation === 'white' ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
                color: startingOrientation === 'white' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              }}
            >
              White Bottom
            </button>
            <button
              onClick={() => setStartingOrientation('black')}
              style={{
                ...styles.toggleBtn,
                backgroundColor: startingOrientation === 'black' ? 'rgba(212, 175, 55, 0.15)' : 'var(--color-bg-elevated)',
                borderColor: startingOrientation === 'black' ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
                color: startingOrientation === 'black' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              }}
            >
              Black Bottom
            </button>
          </div>
        </div>

        {/* 5. Rules */}
        <div style={styles.card}>
          <div style={styles.sectionLabel}>Rules Level</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setRules('casual')}
              style={{
                ...styles.toggleBtn,
                backgroundColor: rules === 'casual' ? 'rgba(212, 175, 55, 0.15)' : 'var(--color-bg-elevated)',
                borderColor: rules === 'casual' ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
                color: rules === 'casual' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              }}
            >
              Casual (Undo)
            </button>
            <button
              onClick={() => setRules('competitive')}
              style={{
                ...styles.toggleBtn,
                backgroundColor: rules === 'competitive' ? 'rgba(212, 175, 55, 0.15)' : 'var(--color-bg-elevated)',
                borderColor: rules === 'competitive' ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
                color: rules === 'competitive' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              }}
            >
              Competitive
            </button>
          </div>
        </div>

        {/* 6. Sticky Start Match Button */}
        <div style={styles.stickyActionBox}>
          <button
            onClick={() => handleLobbyStart({ timeControl: selectedTime, startingOrientation, rules, whiteName, blackName })}
            style={styles.startBtnSticky}
          >
            <PlayCircle size={18} />
            <span>Start Match</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Game Mobile View
  const boardFen = previewIndex !== null && game.gameHistory[previewIndex]
    ? game.gameHistory[previewIndex].after
    : game.fen;

  return (
    <div style={styles.mobileGameWrapper} className="animate-fade-in">
      {/* Centered Board 95% Width */}
      <div style={styles.boardMobileContainer}>
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
          whitePlayerName={whitePlayerName}
          blackPlayerName={blackPlayerName}
        />
      </div>

      {/* Controls & Review Panel Stacked */}
      <div style={styles.controlMobileCard}>
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
            previewIndex={previewIndex}
            setPreviewIndex={setPreviewIndex}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  mobileLobbyWrapper: {
    width: '100%',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxSizing: 'border-box',
  },
  boardPreviewCard: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  card: {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '6px',
    padding: '8px 12px',
  },
  textInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text-primary)',
    fontSize: '13px',
    fontWeight: '600',
    outline: 'none',
  },
  timeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  timeBtn: {
    height: '44px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  toggleBtn: {
    flex: 1,
    height: '44px',
    fontSize: '12px',
    fontWeight: '700',
    borderRadius: '6px',
    border: '1px solid',
    cursor: 'pointer',
  },
  stickyActionBox: {
    position: 'sticky',
    bottom: '16px',
    zIndex: 20,
    marginTop: '8px',
  },
  startBtnSticky: {
    width: '100%',
    height: '48px',
    backgroundColor: 'var(--color-brand-primary)',
    color: '#15100c',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 16px rgba(200, 159, 61, 0.4)',
    cursor: 'pointer',
  },
  mobileGameWrapper: {
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
  controlMobileCard: {
    width: '100%',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '10px',
    padding: '12px',
    boxSizing: 'border-box',
  },
};
