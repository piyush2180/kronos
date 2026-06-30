// Kronos Chess V2 — Control Panel Component
// Manages game state options, timers, action triggers, and engine telemetry display.

import React, { useState } from 'react';
import { Target, Shuffle, Volume2, RefreshCw, Flag, Award, Eye, Clipboard, ArrowLeft, Cpu, Sliders, FileText, ExternalLink, ShieldAlert } from 'lucide-react';

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
  setPremoveEnabled = () => {}
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
            {/* Configurations Grid */}
            <div style={styles.configGrid}>
              {modeSelected === 'ai' && (
                <div style={styles.configCol}>
                  <label style={styles.configLabel}>Engine Strength</label>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={styles.selectInput}
                  >
                    <option value="beginner">Beginner (600 ELO)</option>
                    <option value="casual">Casual (1000 ELO)</option>
                    <option value="club">Club (1400 ELO)</option>
                    <option value="advanced">Advanced (1800 ELO)</option>
                    <option value="expert">Expert (2200 ELO)</option>
                  </select>
                </div>
              )}

              {modeSelected !== 'analysis' && (
                <div style={styles.configCol}>
                  <label style={styles.configLabel}>Time Control</label>
                  <select 
                    value={timeControl} 
                    onChange={handleTimeControlChange}
                    style={styles.selectInput}
                  >
                    <option value="casual">Untimed Match</option>
                    <option value="1+0">Bullet (1m)</option>
                    <option value="3+0">Blitz (3m)</option>
                    <option value="5+0">Blitz (5m)</option>
                    <option value="10+0">Rapid (10m)</option>
                    <option value="30+0">Classical (30m)</option>
                  </select>
                </div>
              )}

              <div style={styles.configCol}>
                <label style={styles.configLabel}>Match Rules</label>
                <select 
                  value={rulesLevel} 
                  onChange={(e) => setRulesLevel(e.target.value)}
                  style={styles.selectInput}
                >
                  <option value="casual">Casual (Allows Undo)</option>
                  <option value="competitive">Competitive (No Undo)</option>
                </select>
              </div>

              {modeSelected === 'ai' && (
                <div style={styles.configCol}>
                  <label style={styles.configLabel}>Premove System</label>
                  <select 
                    value={premoveEnabled ? 'enabled' : 'disabled'} 
                    onChange={(e) => setPremoveEnabled(e.target.value === 'enabled')}
                    style={styles.selectInput}
                  >
                    <option value="enabled">Premove: Enabled</option>
                    <option value="disabled">Premove: Disabled</option>
                  </select>
                </div>
              )}
            </div>

            {/* Game Over Announcements */}
            {gameStatus !== 'active' && (
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

            {/* Actions Grid */}
            <div style={styles.buttonsGrid}>
              <button onClick={() => resetGame()} style={styles.actionBtn} className="btn-gold">
                <RefreshCw size={13} />
                <span>New Game</span>
              </button>
              <button 
                onClick={resignGame} 
                style={styles.actionBtn} 
                className="btn-bronze"
                disabled={gameStatus !== 'active'}
              >
                <Flag size={13} />
                <span>Resign</span>
              </button>
              <button 
                onClick={offerDraw} 
                style={styles.actionBtn} 
                className="btn-bronze"
                disabled={gameStatus !== 'active'}
              >
                <Award size={13} />
                <span>Draw</span>
              </button>
              <button onClick={flipBoard} style={styles.actionBtn} className="btn-bronze">
                <Shuffle size={13} />
                <span>Flip Board</span>
              </button>
              <button 
                onClick={undoMove} 
                style={styles.actionBtn} 
                className="btn-bronze"
                disabled={rulesLevel === 'competitive' || gameHistory.length === 0}
              >
                <ArrowLeft size={13} />
                <span>Undo</span>
              </button>
            </div>
          </div>
        )}

        {/* ENGINE TAB */}
        {currentTab === 'engine' && showEngineTab && (
          <div style={styles.tabPane} className="animate-fade-in">
            {/* Opening details card */}
            <div style={styles.openingCard}>
              <div style={styles.openingHeader}>
                <span style={styles.ecoBadge}>{ecoCode}</span>
                <span style={styles.openingTitle}>Active Opening</span>
              </div>
              <div style={styles.openingNameText}>{openingName}</div>
              {onOpenExplorer && (
                <button onClick={onOpenExplorer} style={styles.explorerBtn}>
                  <span>Opening Book Explorer</span>
                  <ExternalLink size={11} />
                </button>
              )}
            </div>

            {/* Engine Telemetry */}
            <div style={styles.telemetryCard}>
              <div style={styles.telemetryHeader}>
                <span>Engine Telemetry</span>
                <span style={styles.searchStatusDot(isSearching)} className={isSearching ? 'active-pulse-dot' : ''} title={thinkingStatus} />
              </div>

              {modeSelected === 'ai' && (
                <div style={styles.telemetryGrid}>
                  <div style={styles.telItem}>
                    <div style={styles.telVal}>{engineStats.depth}</div>
                    <div style={styles.telLbl}>Depth</div>
                  </div>
                  <div style={styles.telItem}>
                    <div style={styles.telVal}>{(engineStats.nodes / 1000).toFixed(1)}k</div>
                    <div style={styles.telLbl}>Nodes</div>
                  </div>
                  <div style={styles.telItem}>
                    <div style={styles.telVal}>{(engineStats.nps / 1000).toFixed(1)}k</div>
                    <div style={styles.telLbl}>NPS</div>
                  </div>
                  <div style={styles.telItem}>
                    <div style={styles.telVal}>{engineStats.transpositionHits}</div>
                    <div style={styles.telLbl}>Cache Hits</div>
                  </div>
                </div>
              )}

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
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
  },
  tabContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  tabPane: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
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
  gameResultBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    border: '1px solid rgba(212, 175, 55, 0.22)',
    borderRadius: '4px',
  },
  resultText: {
    fontSize: '12px',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
  },
  resultDesc: {
    fontSize: '10px',
    color: 'var(--color-text-secondary)',
    marginTop: '1px',
  },
  buttonsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  actionBtn: {
    height: '32px',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
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
    gap: '8px',
    padding: '12px',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    marginTop: '4px',
  },
  importInput: {
    width: '100%',
    padding: '8px',
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    color: 'var(--color-text-primary)',
    fontSize: '11px',
    outline: 'none',
  },
  importTextarea: {
    width: '100%',
    height: '80px',
    padding: '8px',
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-default)',
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
    backgroundColor: 'rgba(34, 26, 20, 0.4)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
    padding: '12px 14px',
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
  telemetryCard: {
    backgroundColor: 'rgba(21, 16, 12, 0.4)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  telemetryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '10px',
    fontWeight: '800',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
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
    marginTop: '2px',
    textTransform: 'uppercase',
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
