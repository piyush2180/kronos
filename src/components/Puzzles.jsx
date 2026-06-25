// Kronos Chess — Puzzle Trainer Component
// Interactive tactical puzzle solver using official Lichess puzzles.
// Supports lazy loading, pagination, hint square detection, and automatic opponent replies.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { 
  ArrowLeft, Trophy, Star, Filter, RotateCcw, Lightbulb, CheckCircle2, ChevronRight, Play, Eye
} from 'lucide-react';
import { playChessSound } from '../utils/sound';

const BOARD_THEME_COLORS = {
  walnut: { dark: '#b58863', light: '#f0d9b5' },
  green:  { dark: '#739552', light: '#ececd7' },
  slate:  { dark: '#4d6073', light: '#e8ebef' }
};

const RATING_BANDS = [
  { label: '800-1000', value: '800_1000' },
  { label: '1000-1200', value: '1000_1200' },
  { label: '1200-1400', value: '1200_1400' },
  { label: '1400-1600', value: '1400_1600' },
  { label: '1600-1800', value: '1600_1800' },
  { label: '1800+', value: '1800_plus' }
];

// Helper to replay solution on a temporary board and output SAN notation
const getSanSolution = (puzzle) => {
  try {
    const temp = new Chess(puzzle.fen);
    const sanList = [];
    for (let i = 0; i < puzzle.solution.length; i++) {
      const uci = puzzle.solution[i];
      const from = uci.substring(0, 2);
      const to = uci.substring(2, 4);
      const promotion = uci.length > 4 ? uci.substring(4, 5).toLowerCase() : undefined;
      const res = temp.move({ from, to, promotion });
      if (res) {
        if (i >= 1) {
          sanList.push(res.san);
        }
      }
    }
    return sanList;
  } catch (e) {
    return [];
  }
};

export default function Puzzles({ boardTheme, onBack }) {
  const [selectedRange, setSelectedRange] = useState('1000-1200');
  const [puzzles, setPuzzles] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Active puzzle states
  const [chess, setChess] = useState(null);
  const [fen, setFen] = useState('');
  const [step, setStep] = useState(1); // solution[0] is setup, player starts at step 1
  
  // HUD states
  const [status, setStatus] = useState('idle'); // 'idle' | 'correct_partial' | 'correct_complete' | 'wrong' | 'revealed'
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHintMsg, setShowHintMsg] = useState(false);
  const [solvedIds, setSolvedIds] = useState([]);
  const [sessionCount, setSessionCount] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Lazy-load puzzles when selected rating band changes
  useEffect(() => {
    setIsLoading(true);
    const fileSuffix = selectedRange === '1800+' ? '1800_plus' : selectedRange.replace('-', '_');
    fetch(`/puzzles/puzzles_${fileSuffix}.json`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load puzzles');
        return res.json();
      })
      .then(data => {
        setPuzzles(data);
        setCurrentIndex(0);
        setSelectedTheme('All');
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching puzzles:', err);
        setIsLoading(false);
      });
  }, [selectedRange]);

  // Extract unique themes in loaded puzzles
  const availableThemes = useMemo(() => {
    const set = new Set();
    puzzles.forEach(p => {
      if (p.themes) {
        p.themes.forEach(t => set.add(t));
      }
    });
    return ['All', ...Array.from(set).sort()];
  }, [puzzles]);

  // Filter puzzles based on selected theme
  const filteredPuzzles = useMemo(() => {
    if (selectedTheme === 'All') return puzzles;
    return puzzles.filter(p => p.themes && p.themes.includes(selectedTheme));
  }, [puzzles, selectedTheme]);

  const activePuzzle = filteredPuzzles[currentIndex];

  // Reset pagination page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTheme, puzzles]);

  const totalPages = Math.ceil(filteredPuzzles.length / pageSize) || 1;
  const paginatedPuzzles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPuzzles.slice(start, start + pageSize);
  }, [filteredPuzzles, currentPage]);

  const themeColors = useMemo(() => {
    return BOARD_THEME_COLORS[boardTheme] || BOARD_THEME_COLORS.walnut;
  }, [boardTheme]);

  // Load solved IDs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kronos_v2_puzzles_solved');
      if (saved) setSolvedIds(JSON.parse(saved));
    } catch {}
  }, []);

  // Load active puzzle and play the opponent's first setup move
  const loadPuzzle = useCallback((puzzle) => {
    if (!puzzle) return;
    try {
      const inst = new Chess(puzzle.fen);
      
      // Solution[0] is opponent setup move
      const setupMove = puzzle.solution[0];
      const from = setupMove.substring(0, 2);
      const to = setupMove.substring(2, 4);
      const promotion = setupMove.length > 4 ? setupMove.charAt(4) : undefined;
      
      const played = inst.move({ from, to, promotion: promotion || 'q' });
      
      if (played) {
        setChess(inst);
        setFen(inst.fen());
        setStep(1);
        setStatus('idle');
        setHintsUsed(0);
        setShowHintMsg(false);
      }
    } catch (e) {
      console.warn("Failed to load puzzle position", e);
    }
  }, []);

  useEffect(() => {
    if (activePuzzle) {
      loadPuzzle(activePuzzle);
    }
  }, [activePuzzle, loadPuzzle]);

  const sanSolution = useMemo(() => {
    if (!activePuzzle) return [];
    return getSanSolution(activePuzzle);
  }, [activePuzzle]);

  const handleMove = useCallback((source, target) => {
    if (!chess || !activePuzzle) return false;
    if (status === 'correct_complete' || status === 'revealed') return false;

    try {
      const expectedUci = activePuzzle.solution[step];
      const expectedPromo = expectedUci.length > 4 ? expectedUci.charAt(4) : undefined;
      
      // Construct player's played move in UCI format
      const playedUci = expectedPromo ? `${source}${target}${expectedPromo}` : `${source}${target}`;

      if (playedUci === expectedUci) {
        // Play player's move
        const moveResult = chess.move({ from: source, to: target, promotion: expectedPromo || 'q' });
        if (!moveResult) return false;

        playChessSound(!!moveResult.captured, chess.inCheck());
        setFen(chess.fen());

        const nextStep = step + 1;

        if (nextStep >= activePuzzle.solution.length) {
          // Completed puzzle!
          setStatus('correct_complete');
          setSessionCount(prev => prev + 1);

          // Save solved ID
          if (!solvedIds.includes(activePuzzle.id)) {
            const nextSolved = [...solvedIds, activePuzzle.id];
            setSolvedIds(nextSolved);
            localStorage.setItem('kronos_v2_puzzles_solved', JSON.stringify(nextSolved));

            // Sync user profile puzzle stats
            try {
              const user = localStorage.getItem('kronos_v2_active_user') || 'Guest';
              const pKey = `kronos_v2_profile_${user}`;
              const profile = JSON.parse(localStorage.getItem(pKey) || '{}');
              profile.solvedPuzzleIds = nextSolved;
              profile.puzzlesSolved = nextSolved.length;
              localStorage.setItem(pKey, JSON.stringify(profile));
            } catch (err) {}
          }

          // Auto-advance
          setTimeout(() => {
            if (currentIndex < filteredPuzzles.length - 1) {
              setCurrentIndex(prev => prev + 1);
            }
          }, 1800);
        } else {
          // Partial correct move: play opponent reply
          setStatus('correct_partial');
          setStep(nextStep);

          setTimeout(() => {
            try {
              const oppUci = activePuzzle.solution[nextStep];
              const oppFrom = oppUci.substring(0, 2);
              const oppTo = oppUci.substring(2, 4);
              const oppPromo = oppUci.length > 4 ? oppUci.charAt(4) : undefined;
              
              const oppMove = chess.move({ from: oppFrom, to: oppTo, promotion: oppPromo || 'q' });
              if (oppMove) {
                playChessSound(!!oppMove.captured, chess.inCheck());
                setFen(chess.fen());
                setStep(nextStep + 1);
                setStatus('idle');
              }
            } catch (err) {
              console.warn("Opponent reply move error", err);
            }
          }, 800);
        }

        return true;
      } else {
        // Wrong move played
        playChessSound(false, false);
        setStatus('wrong');
        setTimeout(() => setStatus(prev => prev === 'wrong' ? 'idle' : prev), 1200);
        return false;
      }
    } catch {
      return false;
    }
  }, [chess, activePuzzle, step, status, solvedIds, currentIndex, filteredPuzzles.length]);

  const handleReveal = () => {
    setStatus('revealed');
    setShowHintMsg(false);
  };

  const handleHint = () => {
    setHintsUsed(prev => prev + 1);
    setShowHintMsg(true);
    setTimeout(() => setShowHintMsg(false), 5000);
  };

  const handleNext = () => {
    if (currentIndex < filteredPuzzles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleReset = () => {
    if (activePuzzle) loadPuzzle(activePuzzle);
  };

  const handleSelectPuzzle = (puzzle) => {
    const idx = filteredPuzzles.findIndex(p => p.id === puzzle.id);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingWrapper} className="animate-fade-in">
        <RotateCcw className="animate-spin" size={24} style={{ color: 'var(--color-brand-primary)' }} />
        <div style={styles.loadingText}>Loading {selectedRange} Puzzles...</div>
      </div>
    );
  }

  if (!activePuzzle) {
    return (
      <div style={styles.empty}>No puzzles found matching this filter.</div>
    );
  }

  const orientation = activePuzzle.sideToMove; // 'white' or 'black'

  return (
    <div style={styles.puzzlesWrapper} className="animate-fade-in">
      
      {/* Header bar */}
      <div style={styles.header}>
        <div style={styles.hdrLeft}>
          <button onClick={onBack} style={styles.backBtn} className="btn-bronze">
            <ArrowLeft size={13} /> Lobby
          </button>
          <div>
            <h2 style={styles.title}>Tactical Puzzle Trainer</h2>
            <p style={styles.subtitle}>Solve real-game tactics step-by-step.</p>
          </div>
        </div>

        <div style={styles.hdrRight}>
          <div style={styles.statBox}>
            <Trophy size={14} color="var(--color-brand-primary)" />
            <span>Session: {sessionCount} solved</span>
          </div>
          <div style={styles.statBox}>
            <Star size={14} color="var(--color-brand-primary)" />
            <span>Total: {solvedIds.length} solved</span>
          </div>
        </div>
      </div>

      <div style={styles.mainGrid}>
        
        {/* Left column: board & status */}
        <div style={styles.boardCol}>
          
          {/* Puzzle Info Header */}
          <div style={styles.puzzleInfoBar}>
            <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
              <div style={styles.puzzleIndex}>
                Puzzle {currentIndex + 1} of {filteredPuzzles.length}
                {activePuzzle.opening && ` • ${activePuzzle.opening}`}
              </div>
              <div style={styles.puzzleTitle}>{activePuzzle.title}</div>
            </div>
            <div style={styles.tagsRow}>
              {activePuzzle.themes && activePuzzle.themes.slice(0, 1).map(theme => (
                <span key={theme} style={styles.themeTag}>{theme}</span>
              ))}
              <span style={styles.ratingTag}>★ {activePuzzle.rating}</span>
            </div>
          </div>

          {/* Board */}
          <div style={styles.boardCard} className="panel-card">
            <Chessboard
              options={{
                id: 'PuzzleBoard',
                position: fen,
                boardOrientation: orientation,
                onPieceDrop: ({ sourceSquare, targetSquare }) => handleMove(sourceSquare, targetSquare),
                darkSquareStyle: { backgroundColor: themeColors.dark },
                lightSquareStyle: { backgroundColor: themeColors.light },
                animationDurationInMs: 150,
                allowDragging: status !== 'correct_complete' && status !== 'revealed',
              }}
            />
          </div>

          {/* Status Displays */}
          {status !== 'idle' && (
            <div style={styles.statusBanner(status)}>
              {status === 'correct_partial' && 'Correct move! Keep calculating...'}
              {status === 'correct_complete' && 'Brilliant! Tactics solved successfully!'}
              {status === 'wrong' && 'Incorrect. Review the position and try again.'}
              {status === 'revealed' && `Solution line: ${sanSolution.join(' → ')}`}
            </div>
          )}

          {showHintMsg && (
            <div style={styles.hintBanner}>
              <Lightbulb size={14} />
              <span>{activePuzzle.hint}</span>
            </div>
          )}

          {/* Actions Row */}
          <div style={styles.actionsRow}>
            <button onClick={handleReset} style={styles.actBtn} className="btn-bronze">
              <RotateCcw size={12} /> Reset
            </button>
            <button 
              onClick={handleHint} 
              style={styles.actBtn} 
              className="btn-bronze"
              disabled={hintsUsed >= 2 || status === 'revealed' || status === 'correct_complete'}
            >
              <Lightbulb size={12} /> Hint {hintsUsed > 0 ? `(${2 - hintsUsed} left)` : ''}
            </button>
            <button 
              onClick={handleReveal} 
              style={styles.actBtn} 
              className="btn-bronze"
              disabled={status === 'revealed' || status === 'correct_complete'}
            >
              <Eye size={12} /> Solution
            </button>
            <button onClick={handleNext} style={styles.nextBtn} className="btn-gold">
              Next <ChevronRight size={13} />
            </button>
          </div>

        </div>

        {/* Right column: filters & puzzle list */}
        <div style={styles.sidebarCol}>
          
          {/* Rating Selection Grid */}
          <div style={styles.sidebarCard} className="panel-card">
            <div style={styles.sidebarTitle}><Trophy size={11} /> Select Rating Band</div>
            <div style={styles.filterGrid}>
              {RATING_BANDS.map(band => (
                <button
                  key={band.value}
                  onClick={() => setSelectedRange(band.label)}
                  style={{
                    ...styles.filterBtn,
                    backgroundColor: selectedRange === band.label ? 'rgba(212, 175, 55, 0.12)' : 'var(--color-bg-base)',
                    borderColor: selectedRange === band.label ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
                    color: selectedRange === band.label ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)'
                  }}
                >
                  {band.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Dropdown */}
          <div style={styles.sidebarCard} className="panel-card">
            <div style={styles.sidebarTitle}><Filter size={11} /> Filter by Theme</div>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              style={styles.selectFilter}
            >
              {availableThemes.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>

          {/* Puzzle List Bank */}
          <div className="panel-card" style={{ flex: 1, minHeight: '260px', display: 'flex', flexDirection: 'column', ...styles.sidebarCard }}>
            <div style={styles.sidebarTitle}>Puzzle Bank ({filteredPuzzles.length})</div>
            <div style={styles.puzzlesList} className="scroll-panel">
              {paginatedPuzzles.map((p, idx) => {
                const isSolved = solvedIds.includes(p.id);
                // Calculate absolute index in filteredPuzzles
                const absIndex = (currentPage - 1) * pageSize + idx;
                const isCurrent = absIndex === currentIndex;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPuzzle(p)}
                    style={{
                      ...styles.puzzleBankBtn,
                      backgroundColor: isCurrent ? 'var(--color-bg-elevated)' : 'transparent',
                      borderLeft: isCurrent ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
                      color: isCurrent ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)'
                    }}
                  >
                    <div style={styles.bankLeft}>
                      {isSolved ? <CheckCircle2 size={13} color="#48bb78" /> : <Play size={10} color="var(--color-text-dim)" />}
                      <span style={styles.bankTitle}>Puzzle #{p.id}</span>
                    </div>
                    <div style={styles.bankRight}>
                      <span style={styles.bankRating}>★{p.rating}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={styles.paginationRow}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={styles.pageBtn(currentPage === 1)}
                >
                  Prev
                </button>
                <span style={styles.pageInfo}>
                  {currentPage} / {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={styles.pageBtn(currentPage === totalPages)}
                >
                  Next
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

const styles = {
  puzzlesWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    padding: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--color-border-subtle)',
    paddingBottom: '12px',
  },
  hdrLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  backBtn: {
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    marginTop: '2px',
  },
  hdrRight: {
    display: 'flex',
    gap: '10px',
  },
  statBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '70% 30%',
    gap: '30px',
    alignItems: 'start',
  },
  boardCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  puzzleInfoBar: {
    width: '100%',
    maxWidth: '520px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'rgba(21, 16, 12, 0.4)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
  },
  puzzleIndex: {
    fontSize: '8px',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '800',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  puzzleTitle: {
    fontSize: '13px',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
    marginTop: '1px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tagsRow: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    flexShrink: 0,
  },
  themeTag: {
    fontSize: '9px',
    fontWeight: '800',
    padding: '2px 6px',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    color: 'var(--color-brand-primary)',
    borderRadius: '3px',
  },
  ratingTag: {
    fontSize: '9px',
    fontWeight: '700',
    padding: '2px 6px',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    color: 'var(--color-text-secondary)',
    borderRadius: '3px',
  },
  boardCard: {
    width: '100%',
    maxWidth: '520px',
    aspectRatio: '1',
    backgroundColor: '#1b120c',
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    padding: '2px',
  },
  statusBanner: (status) => ({
    width: '100%',
    maxWidth: '520px',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid',
    backgroundColor: status === 'wrong' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(72, 187, 120, 0.08)',
    borderColor: status === 'wrong' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(72, 187, 120, 0.25)',
    color: status === 'wrong' ? '#fc8181' : '#68d391',
    lineHeight: '1.3',
  }),
  hintBanner: {
    width: '100%',
    maxWidth: '520px',
    padding: '8px 12px',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    border: '1px solid rgba(212, 175, 55, 0.15)',
    borderRadius: '4px',
    fontSize: '11px',
    color: 'var(--color-brand-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  actionsRow: {
    width: '100%',
    maxWidth: '520px',
    display: 'flex',
    gap: '6px',
  },
  actBtn: {
    flex: 1,
    height: '32px',
    fontSize: '11px',
    fontWeight: '750',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
  },
  nextBtn: {
    flex: 1.5,
    height: '32px',
    fontSize: '11px',
    fontWeight: '750',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
  },
  sidebarCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '100%',
  },
  sidebarCard: {
    padding: '12px',
  },
  sidebarTitle: {
    fontSize: '9px',
    color: 'var(--color-text-dim)',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px',
  },
  filterBtn: {
    height: '24px',
    fontSize: '9px',
    fontWeight: '700',
    border: '1px solid',
    borderRadius: '3px',
    cursor: 'pointer',
    textAlign: 'center',
  },
  selectFilter: {
    width: '100%',
    padding: '6px 10px',
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    color: 'var(--color-text-primary)',
    fontSize: '11px',
    fontWeight: '600',
    outline: 'none',
    cursor: 'pointer',
  },
  puzzlesList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    maxHeight: '280px',
  },
  puzzleBankBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    borderRadius: '3px',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.1s ease',
    ':hover': { backgroundColor: 'var(--color-bg-base)' }
  },
  bankLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },
  bankTitle: {
    fontSize: '11px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bankRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
    marginLeft: '6px',
  },
  bankRating: {
    fontSize: '9px',
    fontWeight: '700',
    color: 'var(--color-brand-primary)',
  },
  paginationRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px 4px 10px',
    borderTop: '1px solid var(--color-border-subtle)',
    marginTop: '6px',
  },
  pageBtn: (isDisabled) => ({
    padding: '4px 8px',
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    color: 'var(--color-text-secondary)',
    borderRadius: '3px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.4 : 1,
  }),
  pageInfo: {
    fontSize: '10px',
    fontWeight: '750',
    color: 'var(--color-text-dim)',
    fontFamily: 'monospace',
  },
  loadingWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    gap: '12px',
  },
  loadingText: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--color-text-secondary)',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--color-text-dim)',
  }
};
