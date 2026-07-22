import React, { useState } from 'react';
import ChessBoard from '../ChessBoard';
import ControlPanel from '../ControlPanel';
import PostGameReview from '../PostGameReview';
import { PlayCircle, User } from 'lucide-react';

export default function PassPlayDesktop({
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
  const [selectedTime, setSelectedTime] = useState(game.timeControl || '10+0');
  const [whiteName, setWhiteName] = useState(whitePlayerName || 'White Player');
  const [blackName, setBlackName] = useState(blackPlayerName || 'Black Player');
  const [startingOrientation, setStartingOrientation] = useState('white');
  const [rules, setRules] = useState('casual');

  const TIME_OPTIONS = [
    { value: '1+0', label: '1 min', type: 'Bullet' },
    { value: '3+0', label: '3 min', type: 'Blitz' },
    { value: '5+0', label: '5 min', type: 'Blitz' },
    { value: '10+0', label: '10 min', type: 'Rapid' },
    { value: '30+0', label: '30 min', type: 'Classical' },
    { value: 'casual', label: 'Casual', type: 'Untimed' },
  ];

  if (!gameStarted) {
    return (
      <div style={styles.splitGrid} className="animate-fade-in">
        {/* Left Column: Board Preview */}
        <div style={styles.boardColumn}>
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

        {/* Right Column: Pass & Play Configuration */}
        <div style={styles.sidebarColumn}>
          <div style={lobby.configPanel}>
            <div style={lobby.configHeader}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Local Match Setup</span>
              <h2 className="heading-section" style={{ margin: '4px 0 0 0', fontSize: '20px' }}>Pass & Play</h2>
            </div>

            <div style={lobby.scrollBody} className="scroll-panel">
              {/* Players card */}
              <div style={lobby.card}>
                <div style={lobby.sectionLabel}>Players</div>
                <div style={lobby.inputGroup}>
                  <div style={lobby.inputWrapper}>
                    <User size={16} style={{ color: '#f0d9b5', flexShrink: 0 }} />
                    <input
                      type="text"
                      value={whiteName}
                      onChange={(e) => setWhiteName(e.target.value)}
                      style={lobby.textInput}
                      placeholder="White Player Name"
                    />
                  </div>
                  <div style={lobby.inputWrapper}>
                    <User size={16} style={{ color: '#b58863', flexShrink: 0 }} />
                    <input
                      type="text"
                      value={blackName}
                      onChange={(e) => setBlackName(e.target.value)}
                      style={lobby.textInput}
                      placeholder="Black Player Name"
                    />
                  </div>
                </div>
              </div>

              {/* Time Control selection */}
              <div style={lobby.card}>
                <div style={lobby.sectionLabel}>Time Control</div>
                <div className="segmented-control" style={{ flexWrap: 'wrap', gap: '4px', background: 'transparent', border: 'none', padding: 0 }}>
                  {TIME_OPTIONS.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setSelectedTime(t.value)}
                      className={`segmented-control-btn ${selectedTime === t.value ? 'segmented-control-btn-active' : ''}`}
                      style={{ flex: '1 0 30%', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', padding: '10px 4px' }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Starting Orientation */}
              <div style={lobby.card}>
                <div style={lobby.sectionLabel}>Board Orientation</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setStartingOrientation('white')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor: startingOrientation === 'white' ? 'rgba(212, 175, 55, 0.15)' : 'var(--color-bg-elevated)',
                      border: startingOrientation === 'white' ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border-default)',
                      color: startingOrientation === 'white' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    White on Bottom
                  </button>
                  <button
                    onClick={() => setStartingOrientation('black')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor: startingOrientation === 'black' ? 'rgba(212, 175, 55, 0.15)' : 'var(--color-bg-elevated)',
                      border: startingOrientation === 'black' ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border-default)',
                      color: startingOrientation === 'black' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Black on Bottom
                  </button>
                </div>
              </div>

              {/* Match Rules */}
              <div style={lobby.card}>
                <div style={lobby.sectionLabel}>Rules level</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setRules('casual')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor: rules === 'casual' ? 'rgba(212, 175, 55, 0.15)' : 'var(--color-bg-elevated)',
                      border: rules === 'casual' ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border-default)',
                      color: rules === 'casual' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Casual (Allows Undo)
                  </button>
                  <button
                    onClick={() => setRules('competitive')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor: rules === 'competitive' ? 'rgba(212, 175, 55, 0.15)' : 'var(--color-bg-elevated)',
                      border: rules === 'competitive' ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border-default)',
                      color: rules === 'competitive' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Competitive (No Undo)
                  </button>
                </div>
              </div>
            </div>

            {/* Start Button Fixed at Bottom */}
            <div style={lobby.fixedFooter}>
              <button 
                onClick={() => handleLobbyStart({ timeControl: selectedTime, startingOrientation, rules, whiteName, blackName })} 
                className="btn-primary" 
                style={{ width: '100%', height: '48px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--color-brand-primary)', color: '#1a130e', cursor: 'pointer' }}
              >
                <PlayCircle size={18} />
                <span>Start Match</span>
              </button>
            </div>
          </div>
        </div>
      </div>
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
          whitePlayerName={whitePlayerName}
          blackPlayerName={blackPlayerName}
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
    </div>
  );
}

const lobby = {
  configPanel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
  },
  configHeader: {
    paddingBottom: '16px',
    borderBottom: '1px solid var(--color-border-subtle)',
    flexShrink: 0,
  },
  scrollBody: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '16px 4px 16px 0',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '6px',
    padding: '6px 12px',
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
  fixedFooter: {
    paddingTop: '16px',
    borderTop: '1px solid var(--color-border-subtle)',
    flexShrink: 0,
    marginTop: 'auto',
  },
};

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
