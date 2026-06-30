// Kronos Chess V2 — Play vs Engine Page
// Shows a lobby setup screen before the game starts, letting the user pick color, difficulty, and time control.

import React, { useState, useEffect } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import ChessBoard from '../components/ChessBoard';
import ControlPanel from '../components/ControlPanel';
import MoveHistory from '../components/MoveHistory';
import PostGameReview from '../components/PostGameReview';
import { DIFFICULTY_SETTINGS } from '../hooks/useChessGame';
import { Shuffle, PlayCircle, ChevronDown } from 'lucide-react';

// ── Lobby Setup Screen ────────────────────────────────────────────────────────
function GameLobby({ onStart, defaultDifficulty, defaultTimeControl, boardTheme }) {
  const [selectedColor, setSelectedColor] = useState('w');
  const [selectedDifficulty, setSelectedDifficulty] = useState(defaultDifficulty || 'club');
  const [selectedTime, setSelectedTime] = useState(defaultTimeControl || '10+0');

  const COLORS = [
    { value: 'w', label: 'White', symbol: '♔', desc: 'Move first' },
    { value: 'b', label: 'Black', symbol: '♚', desc: 'Move second' },
    { value: 'random', label: 'Random', symbol: '⚄', desc: 'Surprise me' },
    { value: 'simulate', label: 'Spectate', symbol: '👁', desc: 'Engine vs Engine' },
  ];

  const TIME_OPTIONS = [
    { value: '1+0', label: '1 min', type: 'Bullet' },
    { value: '3+0', label: '3 min', type: 'Blitz' },
    { value: '5+0', label: '5 min', type: 'Blitz' },
    { value: '10+0', label: '10 min', type: 'Rapid' },
    { value: '30+0', label: '30 min', type: 'Classical' },
    { value: 'casual', label: 'Casual', type: 'Untimed' },
  ];

  const handleStart = () => {
    const resolvedColor = selectedColor === 'random'
      ? (Math.random() < 0.5 ? 'w' : 'b')
      : selectedColor;
    onStart(resolvedColor, selectedDifficulty, selectedTime);
  };

  const previewOrientation = selectedColor === 'b' ? 'black' : 'white';

  return (
    <div style={styles.splitGrid} className="animate-fade-in">
      {/* Left Column: Board Preview */}
      <div style={styles.boardColumn}>
        <ChessBoard
          fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          boardOrientation={previewOrientation}
          boardTheme={boardTheme}
          evalScore="+0.3"
          isSearching={false}
          gameStatus="idle"
          playerColor={selectedColor === 'random' ? 'w' : selectedColor}
          makeMove={() => {}}
        />
      </div>

      {/* Right Column: Engine Configuration */}
      <div style={styles.sidebarColumn}>
        <div style={lobby.configPanel} className="card-primary">
          <div style={lobby.configHeader}>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#d4af37', textTransform: 'capitalize' }}>Engine match setup</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: '0.1rem 0' }}>Engine Configuration</h2>
            </div>
          </div>

          <div style={lobby.scrollBody}>
            {/* Color Selection */}
            <div style={lobby.section}>
              <div style={lobby.sectionLabel}>Color Selection</div>
              <div style={lobby.colorGrid}>
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setSelectedColor(c.value)}
                    style={{
                      ...lobby.colorChip,
                      backgroundColor: selectedColor === c.value ? 'rgba(212, 175, 55, 0.12)' : 'var(--color-bg-base)',
                      borderColor: selectedColor === c.value ? 'var(--color-brand-primary)' : 'rgba(52, 40, 30, 0.4)',
                      color: selectedColor === c.value ? 'var(--color-brand-primary)' : 'var(--color-text-primary)'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{c.symbol}</span>
                    <span style={{ fontWeight: '600', fontSize: '0.8rem' }}>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Chips */}
            <div style={lobby.section}>
              <div style={lobby.sectionLabel}>Difficulty Level</div>
              <div style={lobby.chipRow}>
                {Object.entries(DIFFICULTY_SETTINGS).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDifficulty(key)}
                    style={{
                      ...lobby.chipBtn,
                      backgroundColor: selectedDifficulty === key ? 'rgba(212, 175, 55, 0.15)' : 'var(--color-bg-base)',
                      borderColor: selectedDifficulty === key ? 'var(--color-brand-primary)' : 'rgba(52, 40, 30, 0.4)',
                      color: selectedDifficulty === key ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)'
                    }}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Control Chips */}
            <div style={lobby.section}>
              <div style={lobby.sectionLabel}>Time Control</div>
              <div style={lobby.chipRow}>
                {TIME_OPTIONS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setSelectedTime(t.value)}
                    style={{
                      ...lobby.chipBtn,
                      backgroundColor: selectedTime === t.value ? 'rgba(212, 175, 55, 0.15)' : 'var(--color-bg-base)',
                      borderColor: selectedTime === t.value ? 'var(--color-brand-primary)' : 'rgba(52, 40, 30, 0.4)',
                      color: selectedTime === t.value ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)'
                    }}
                  >
                    <span>{t.label}</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.7, marginLeft: '0.2rem' }}>({t.type})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Engine Details */}
            <div style={{ backgroundColor: 'var(--color-bg-base)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--color-text-dim)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontWeight: '600', color: 'var(--color-text-secondary)' }}>Engine details</span>
              <span>Stockfish 16 Multithreaded Worker • SHA256 Verified Engine Pipeline</span>
            </div>
          </div>

          {/* Start Button Fixed at Bottom */}
          <div style={lobby.fixedFooter}>
            <button onClick={handleStart} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem' }}>
              <PlayCircle size={16} />
              <span>Start Game</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PlayPage({ username, boardTheme, soundEnabled }) {
  const game = useChessGame('kronos_v2_play_state', 'ai');
  const [previewIndex, setPreviewIndex] = useState(null);
  const [reviewTabActive, setReviewTabActive] = useState(false);
  const [evalBarVisible, setEvalBarVisible] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Show lobby if no active game
  const [gameStarted, setGameStarted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kronos_v2_play_state') || '{}');
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

  // Trigger post-game review automatically when game finishes
  useEffect(() => {
    if (game.gameStatus !== 'active' && game.gameStatus !== 'idle') {
      setReviewTabActive(true);
    }
  }, [game.gameStatus]);

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
        setGameStarted(false);
        setReviewTabActive(false);
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

  const handleLobbyStart = (color, difficulty, timeControl) => {
    // setDifficulty first so engine uses correct level
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

  // Show lobby if game hasn't started
  if (!gameStarted) {
    return (
      <GameLobby
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
                  premoveEnabled={game.premoveEnabled}
                  setPremoveEnabled={game.setPremoveEnabled}
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
    padding: '1.25rem',
    gap: '1.25rem',
    overflow: 'hidden'
  },
  configHeader: {
    paddingBottom: '0.75rem',
    borderBottom: '1px solid rgba(52, 40, 30, 0.4)'
  },
  scrollBody: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    paddingRight: '0.2rem'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  sectionLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: 'var(--color-text-dim)',
    textTransform: 'capitalize'
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem'
  },
  colorChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.6rem 0.85rem',
    borderRadius: '6px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem'
  },
  chipBtn: {
    padding: '0.4rem 0.75rem',
    fontSize: '0.78rem',
    fontWeight: '600',
    borderRadius: '4px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center'
  },
  fixedFooter: {
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(52, 40, 30, 0.4)',
    marginTop: 'auto'
  }
};

// ── Game Page Styles ──────────────────────────────────────────────────────────
const styles = {
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '58% 42%',
    gap: '1.5rem',
    height: 'calc(100vh - 56px)',
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '1.25rem 1.5rem',
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
    padding: '14px',
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
    margin: '10px 0',
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
