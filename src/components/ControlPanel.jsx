// Kronos Chess V2 — Control Panel Component
// Manages game state options, timers, action triggers, and engine telemetry display.
import React, { useState } from 'react';
import { Target, Shuffle, Volume2, RefreshCw, Flag, Award, Eye, Clipboard, ArrowLeft, Cpu, Sliders, FileText, ExternalLink, ShieldAlert } from 'lucide-react';
import { colors, spacing, geometry, typography } from '../theme/designTokens';
import MoveHistory from './MoveHistory';

export default function ControlPanel({
  modeSelected,
  setModeSelected,
  difficulty,
  setDifficulty,
  rulesLevel,
  setRulesLevel,
  timeControl,
  setTimeControl,
  engineStats,
  candidateMoves,
  isSearching,
  thinkingStatus,
  gameStatus,
  winner,
  playerColor,
  resetGame,
  resignGame,
  offerDraw,
  flipBoard,
  undoMove,
  fen,
  gameHistory,
  importFen,
  importPgn,
  openingName = 'Starting Position',
  ecoCode = 'A00',
  onOpenExplorer,
  premoveEnabled = true,
  setPremoveEnabled = () => {},
  showPV = true,
  previewIndex,
  setPreviewIndex,
}) {
  const [activeTab, setActiveTab] = useState('game'); // 'game' | 'engine' | 'tools'
  const [fenInput, setFenInput] = useState('');
  const [pgnInput, setPgnInput] = useState('');
  const [showImportArea, setShowImportArea] = useState(null); // 'fen' | 'pgn' | null
  const [errorMsg, setErrorMsg] = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
  };

  // Copy current FEN
  const handleCopyFen = () => {
    navigator.clipboard.writeText(fen);
  };

  // Paste / Import FEN
  const handleImportFenSubmit = (e) => {
    e.preventDefault();
    if (!fenInput) return;
    setErrorMsg('');
    const success = importFen(fenInput.trim());
    if (success) {
      setFenInput('');
      setShowImportArea(null);
    } else {
      setErrorMsg('Invalid FEN position string. Verify layout.');
    }
  };

  // Copy PGN
  const handleCopyPgn = () => {
    let pgn = '';
    gameHistory.forEach((m, idx) => {
      if (idx % 2 === 0) pgn += `${Math.floor(idx / 2) + 1}. `;
      pgn += `${m.san} `;
    });
    navigator.clipboard.writeText(pgn.trim());
  };

  // Import PGN
  const handleImportPgnSubmit = (e) => {
    e.preventDefault();
    if (!pgnInput) return;
    setErrorMsg('');
    const success = importPgn(pgnInput.trim());
    if (success) {
      setPgnInput('');
      setShowImportArea(null);
    } else {
      setErrorMsg('Failed to parse PGN content. Verify syntax.');
    }
  };

  // Parse time controls for select
  const handleTimeControlChange = (e) => {
    const control = e.target.value;
    setTimeControl(control);
    resetGame(playerColor, control);
  };

  const showEngineTab = modeSelected !== 'local';
  const currentTab = showEngineTab ? activeTab : (activeTab === 'engine' ? 'game' : activeTab);

  return (
    <div style={styles.controlPanelWrapper}>
      
      {/* Tab Navigation */}
      <div style={styles.tabHeader}>
        <button
          onClick={() => handleTabChange('game')}
          style={{
            ...styles.tabBtn,
            borderBottom: currentTab === 'game' ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
            color: currentTab === 'game' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)'
          }}
        >
          <Sliders size={13} />
          <span>Game</span>
        </button>
        {showEngineTab && (
          <button
            onClick={() => handleTabChange('engine')}
            style={{
              ...styles.tabBtn,
              borderBottom: currentTab === 'engine' ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
              color: currentTab === 'engine' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)'
            }}
          >
            <Cpu size={13} />
            <span>Engine</span>
          </button>
        )}
        <button
          onClick={() => handleTabChange('tools')}
          style={{
            ...styles.tabBtn,
            borderBottom: currentTab === 'tools' ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
            color: currentTab === 'tools' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)'
          }}
        >
          <FileText size={13} />
          <span>Tools</span>
        </button>
      </div>

      {/* Inline system error message banner */}
      {errorMsg && (
        <div style={styles.errorBanner} className="animate-fade-in">
          <ShieldAlert size={14} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-danger)' }}>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg('')} style={styles.errorCloseBtn}>&times;</button>
        </div>
      )}

      {/* Tab Content Panel */}
      <div style={styles.tabContent} className="tab-transition-pane">
        
        {/* GAME TAB */}
        {currentTab === 'game' && (
          <div style={styles.tabPane} className="animate-fade-in">
            {/* Game Over Announcements */}
            {gameStatus !== 'active' && gameStatus !== 'idle' && (
              <div style={styles.gameResultBanner}>
                <Award size={18} style={{ color: 'var(--color-brand-primary)' }} />
                <div>
                  <div style={styles.resultText}>
                    {gameStatus === 'checkmate' && `Checkmate — ${winner === 'w' ? 'White' : 'Black'} Wins`}
                    {gameStatus === 'timeout' && `Timeout — ${winner === 'w' ? 'White' : 'Black'} Wins`}
                    {gameStatus === 'resign' && `Resignation — ${winner === 'w' ? 'White' : 'Black'} Wins`}
                    {gameStatus === 'draw' && `Game Drawn`}
                  </div>
                  <div style={styles.resultDesc}>Review the game or start a new match.</div>
                </div>
              </div>
            )}

            {/* Actions Responsive Toolbar */}
            <div style={styles.toolbarContainer}>
              <button 
                onClick={() => resetGame()} 
                style={styles.toolbarBtn} 
                className="btn-gold" 
                title="New Game"
              >
                <RefreshCw size={15} />
              </button>
              <button 
                onClick={undoMove} 
                style={styles.toolbarBtn} 
                className="btn-bronze" 
                title="Undo Move" 
                disabled={rulesLevel === 'competitive' || gameHistory.length === 0}
              >
                <ArrowLeft size={15} />
              </button>
              <button 
                onClick={flipBoard} 
                style={styles.toolbarBtn} 
                className="btn-bronze" 
                title="Flip Board"
              >
                <Shuffle size={15} />
              </button>
              <button 
                onClick={offerDraw} 
                style={styles.toolbarBtn} 
                className="btn-bronze" 
                title="Offer Draw" 
                disabled={gameStatus !== 'active'}
              >
                <Award size={15} />
              </button>
              <button 
                onClick={resignGame} 
                style={styles.toolbarBtn} 
                className="btn-bronze" 
                title="Resign Game" 
                disabled={gameStatus !== 'active'}
              >
                <Flag size={15} />
              </button>
            </div>

            {/* Move List */}
            <div style={styles.historyWrapper}>
              <MoveHistory
                gameHistory={gameHistory}
                openingName={openingName}
                ecoCode={ecoCode}
                previewIndex={previewIndex}
                setPreviewIndex={setPreviewIndex}
                modeSelected={modeSelected}
                onOpenExplorer={onOpenExplorer}
              />
            </div>
          </div>
        )}

        {/* ENGINE TAB */}
        {currentTab === 'engine' && showEngineTab && (
          <div style={styles.tabPane} className="animate-fade-in">

            {/* Opening card */}
            <div style={styles.openingCard}>
              <div style={styles.openingHeader}>
                <span style={styles.ecoBadge}>{ecoCode}</span>
                <span style={styles.openingTitle}>Opening</span>
              </div>
              <div style={styles.openingNameText}>{openingName}</div>
            </div>

            {/* Engine Identity + Status */}
            <div style={styles.engineIdentityCard}>
              <div style={styles.engineNameRow}>
                <span style={styles.engineNameBig}>
                  {difficulty === 'beginner' ? 'Kronos D2' :
                   difficulty === 'casual'   ? 'Kronos D4' :
                   difficulty === 'club'     ? 'Kronos D5' :
                   difficulty === 'advanced' ? 'Kronos D6 Flagship' :
                                              'Kronos D7'}
                </span>
                <div style={styles.statusPill(isSearching)}>
                  <span style={styles.statusDot(isSearching)} className={isSearching ? 'active-pulse-dot' : ''} />
                  <span>{isSearching ? 'SEARCHING' : 'IDLE'}</span>
                </div>
              </div>
              <div style={styles.statusLine}>{thinkingStatus}</div>
            </div>

            {/* Telemetry Grid */}
            <div style={styles.telemetryCard}>
              <div style={styles.telemetryHeader}>Live Search Statistics</div>
              <div style={styles.telemetryGrid}>
                <div style={styles.telItem}>
                  <div style={styles.telVal}>
                    {engineStats.depth > 0 ? `${engineStats.depth}` : '—'}
                    <span style={{ fontSize: '0.6rem', opacity: 0.5, marginLeft: '2px' }}>
                      / {difficulty === 'beginner' ? 2 : difficulty === 'casual' ? 4 : difficulty === 'club' ? 5 : difficulty === 'advanced' ? 6 : 7}
                    </span>
                  </div>
                  <div style={styles.telLbl}>Depth (Ply)</div>
                </div>
                <div style={styles.telItem}>
                  <div style={styles.telVal}>
                    {engineStats.nodes > 0 ? (engineStats.nodes >= 1000000
                      ? (engineStats.nodes / 1000000).toFixed(1) + 'M'
                      : engineStats.nodes >= 1000
                      ? (engineStats.nodes / 1000).toFixed(0) + 'k'
                      : engineStats.nodes) : '—'}
                  </div>
                  <div style={styles.telLbl}>Nodes</div>
                </div>
                <div style={styles.telItem}>
                  <div style={styles.telVal}>
                    {engineStats.nps > 0 ? (engineStats.nps >= 1000
                      ? (engineStats.nps / 1000).toFixed(0) + 'k'
                      : engineStats.nps) : '—'}
                  </div>
                  <div style={styles.telLbl}>NPS</div>
                </div>
                <div style={styles.telItem}>
                  <div style={styles.telVal}>
                    {engineStats.nodes > 0
                      ? (engineStats.transpositionHits / engineStats.nodes * 100).toFixed(1) + '%'
                      : '—'}
                  </div>
                  <div style={styles.telLbl}>TT Hit %</div>
                </div>
              </div>

              {/* Evaluation row */}
              {candidateMoves[0] && (
                <div style={styles.evalRow}>
                  <span style={styles.evalLabel}>Evaluation</span>
                  <span style={styles.evalValue}>
                    {candidateMoves[0].score && !candidateMoves[0].score.includes('M')
                      ? (parseFloat(candidateMoves[0].score) > 0 ? '+' : '') + candidateMoves[0].score
                      : candidateMoves[0].score || '0.00'}
                  </span>
                </div>
              )}

              {/* PV line */}
              {candidateMoves[0]?.line && showPV && (
                <div style={styles.pvBlock}>
                  <div style={styles.pvLabel}>Principal Variation</div>
                  <div style={styles.pvLine}>{candidateMoves[0].line}</div>
                </div>
              )}
            </div>

            {/* Analysis mode candidate lines */}
            {modeSelected === 'analysis' && (
              <div style={styles.candidatesList}>
                {candidateMoves.length > 0 ? (
                  candidateMoves.map((cand) => (
                    <div key={cand.pvIdx} style={styles.candidateRow}>
                      <div style={styles.candIndex}>pv{cand.pvIdx}</div>
                      <div style={styles.candScore}>{cand.score}</div>
                      <div style={styles.candLine}>{cand.line}...</div>
                    </div>
                  ))
                ) : (
                  <div style={styles.emptyTelemetry}>
                    {isSearching ? 'Stockfish is calculating lines...' : 'Awaiting position changes to analyze...'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TOOLS TAB */}
        {currentTab === 'tools' && (
          <div style={styles.tabPane} className="animate-fade-in">
            {/* Clipboard Action Buttons */}
            <div style={styles.clipboardRow}>
              <button onClick={handleCopyFen} style={styles.clipBtn}>
                <Clipboard size={12} />
                <span>Copy FEN</span>
              </button>
              <button onClick={() => setShowImportArea(showImportArea === 'fen' ? null : 'fen')} style={styles.clipBtn}>
                <span>Import FEN</span>
              </button>
              <button onClick={handleCopyPgn} style={styles.clipBtn}>
                <Clipboard size={12} />
                <span>Copy PGN</span>
              </button>
              <button onClick={() => setShowImportArea(showImportArea === 'pgn' ? null : 'pgn')} style={styles.clipBtn}>
                <span>Import PGN</span>
              </button>
            </div>

            {/* Import Form Areas */}
            {showImportArea === 'fen' && (
              <form onSubmit={handleImportFenSubmit} style={styles.importForm} className="animate-fade-in">
                <input
                  type="text"
                  placeholder="Paste FEN position string here..."
                  value={fenInput}
                  onChange={e => setFenInput(e.target.value)}
                  style={styles.importInput}
                  required
                />
                <div style={styles.formActionRow}>
                  <button type="submit" className="btn-gold" style={styles.importSubmit}>Load FEN</button>
                  <button type="button" onClick={() => setShowImportArea(null)} style={styles.importCancel}>Cancel</button>
                </div>
              </form>
            )}

            {showImportArea === 'pgn' && (
              <form onSubmit={handleImportPgnSubmit} style={styles.importForm} className="animate-fade-in">
                <textarea
                  placeholder="Paste PGN algebraic move history here..."
                  value={pgnInput}
                  onChange={e => setPgnInput(e.target.value)}
                  style={styles.importTextarea}
                  required
                />
                <div style={styles.formActionRow}>
                  <button type="submit" className="btn-gold" style={styles.importSubmit}>Load PGN</button>
                  <button type="button" onClick={() => setShowImportArea(null)} style={styles.importCancel}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  controlPanelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    height: '100%',
  },
  tabHeader: {
    display: 'flex',
    borderBottom: '1px solid var(--color-border-subtle)',
    gap: '4px',
  },
  tabBtn: {
    flex: 1,
    padding: '10px 0',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'none',
    letterSpacing: '0.02em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  tabContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  tabPane: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  toolbarContainer: {
    display: 'flex',
    gap: '8px',
    width: '100%',
    flexShrink: 0,
  },
  toolbarBtn: {
    flex: 1,
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  historyWrapper: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  configGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  configCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  configLabel: {
    fontSize: '9px',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '600',
  },
  selectInput: {
    padding: '8px',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    color: 'var(--color-text-primary)',
    fontSize: '11px',
    fontWeight: '600',
    outline: 'none',
  },
  readOnlyField: {
    padding: '8px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: geometry.radiusInteractive,
    color: 'var(--color-text-secondary)',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    minHeight: '32px',
    boxSizing: 'border-box',
  },
  gameResultBanner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    boxSizing: 'border-box',
  },
  resultTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
  },
  resultDesc: {
    fontSize: '11px',
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    lineHeight: '1.4',
  },
  actionRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
    marginTop: '6px',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    height: '32px',
    fontSize: '11px',
    fontWeight: '700',
  },
  actionsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    marginBottom: '8px',
  },
  clipboardRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  clipBtn: {
    height: '32px',
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
  },
  importForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
    padding: '12px',
  },
  importInput: {
    width: '100%',
    padding: '8px 10px',
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
    color: 'var(--color-text-primary)',
    fontSize: '11px',
    outline: 'none',
    fontFamily: 'monospace',
  },
  importTextarea: {
    width: '100%',
    height: '80px',
    padding: '8px 10px',
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
    color: 'var(--color-text-primary)',
    fontSize: '11px',
    outline: 'none',
    resize: 'none',
    fontFamily: 'monospace',
  },
  formActionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  importSubmit: {
    padding: '6px 12px',
    fontSize: '10px',
    fontWeight: '700',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  },
  importCancel: {
    padding: '6px 12px',
    fontSize: '10px',
    fontWeight: '600',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border-default)',
    color: 'var(--color-text-secondary)',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  openingCard: {
    backgroundColor: 'transparent',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    padding: '12px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  openingHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  ecoBadge: {
    fontSize: '9px',
    fontWeight: '800',
    backgroundColor: 'var(--color-brand-primary)',
    color: '#15100c',
    padding: '2px 5px',
    borderRadius: '3px',
    fontFamily: 'monospace',
  },
  openingTitle: {
    fontSize: '9px',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '800',
  },
  openingNameText: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  explorerBtn: {
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border-default)',
    color: 'var(--color-text-secondary)',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    marginTop: '2px',
  },
  engineIdentityCard: {
    backgroundColor: 'transparent',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    padding: '12px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  engineNameRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  engineNameBig: {
    fontSize: '0.82rem',
    fontWeight: 800,
    color: 'var(--color-brand-primary)',
  },
  statusPill: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.58rem',
    fontWeight: 800,
    letterSpacing: '0.06em',
    color: active ? '#ecc94b' : 'var(--color-text-dim)',
    backgroundColor: active ? 'rgba(236,201,75,0.08)' : 'rgba(255,255,255,0.04)',
    padding: '2px 7px',
    borderRadius: '10px',
    border: `1px solid ${active ? 'rgba(236,201,75,0.2)' : 'rgba(255,255,255,0.06)'}`,
  }),
  statusDot: (active) => ({
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: active ? '#ecc94b' : '#4a5568',
    flexShrink: 0,
  }),
  statusLine: {
    fontSize: '0.7rem',
    color: 'var(--color-text-dim)',
    fontStyle: 'italic',
  },
  telemetryCard: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '12px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  telemetryHeader: {
    fontSize: '9px',
    fontWeight: '800',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  searchStatusDot: (searching) => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: searching ? '#ecc94b' : '#4a5568',
    transition: 'background-color 0.2s ease',
  }),
  telemetryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px',
  },
  telItem: {
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: '6px 4px',
    borderRadius: '4px',
  },
  telVal: {
    fontFamily: 'monospace',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  telLbl: {
    fontSize: '8px',
    color: 'var(--color-text-dim)',
    marginTop: '3px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  evalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px 8px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '4px',
  },
  evalLabel: {
    fontSize: '0.7rem',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    fontWeight: 700,
  },
  evalValue: {
    fontFamily: 'monospace',
    fontSize: '0.82rem',
    fontWeight: 800,
    color: 'var(--color-brand-primary)',
  },
  pvBlock: {
    backgroundColor: 'var(--color-bg-base)',
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid var(--color-border-subtle)',
  },
  pvLabel: {
    fontSize: '0.62rem',
    textTransform: 'uppercase',
    color: 'var(--color-text-dim)',
    fontWeight: 700,
    marginBottom: '4px',
    letterSpacing: '0.05em',
  },
  pvLine: {
    fontFamily: 'monospace',
    fontSize: '0.72rem',
    color: 'var(--color-text-primary)',
    wordBreak: 'break-all',
    lineHeight: 1.5,
  },
  emptyTelemetry: {
    fontSize: '11px',
    color: 'var(--color-text-dim)',
    textAlign: 'center',
    padding: '10px 0',
    lineHeight: '1.4',
  },
  candidatesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  candidateRow: {
    display: 'grid',
    gridTemplateColumns: '40px 50px 1fr',
    alignItems: 'center',
    fontSize: '11px',
    padding: '4px 6px',
    backgroundColor: 'var(--color-bg-base)',
    borderRadius: '3px',
    borderLeft: '2px solid var(--color-brand-bronze)',
  },
  candIndex: {
    fontWeight: '800',
    color: 'var(--color-text-dim)',
  },
  candScore: {
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
    fontFamily: 'monospace',
  },
  candLine: {
    color: 'var(--color-text-secondary)',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'rgba(196, 93, 93, 0.08)',
    border: '1px solid rgba(196, 93, 93, 0.3)',
    borderRadius: '4px',
    margin: '6px 0',
  },
  errorCloseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-dim)',
    cursor: 'pointer',
    marginLeft: 'auto',
    fontSize: '14px',
    fontWeight: '700',
    padding: '0 4px',
  }
};
