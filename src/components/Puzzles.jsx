import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import { playChessSound } from '../utils/sound';
import PuzzleDesktop from './puzzles/PuzzleDesktop';
import PuzzleMobile from './puzzles/PuzzleMobile';

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

export default function Puzzles({ boardTheme = 'walnut', onBack }) {
  const [selectedRange, setSelectedRange] = useState('1000-1200');
  const [puzzles, setPuzzles] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [chess, setChess] = useState(null);
  const [fen, setFen] = useState('');
  const [step, setStep] = useState(1);
  
  const [status, setStatus] = useState('idle');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHintMsg, setShowHintMsg] = useState(false);
  const [solvedIds, setSolvedIds] = useState([]);
  const [sessionCount, setSessionCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const availableThemes = useMemo(() => {
    const set = new Set();
    puzzles.forEach(p => {
      if (p.themes) {
        p.themes.forEach(t => set.add(t));
      }
    });
    return ['All', ...Array.from(set).sort()];
  }, [puzzles]);

  const filteredPuzzles = useMemo(() => {
    if (selectedTheme === 'All') return puzzles;
    return puzzles.filter(p => p.themes && p.themes.includes(selectedTheme));
  }, [puzzles, selectedTheme]);

  const activePuzzle = filteredPuzzles[currentIndex];

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kronos_v2_puzzles_solved');
      if (saved) setSolvedIds(JSON.parse(saved));
    } catch {}
  }, []);

  const loadPuzzle = useCallback((puzzle) => {
    if (!puzzle) return;
    try {
      const inst = new Chess(puzzle.fen);
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
      const playedUci = expectedPromo ? `${source}${target}${expectedPromo}` : `${source}${target}`;

      if (playedUci === expectedUci) {
        const moveResult = chess.move({ from: source, to: target, promotion: expectedPromo || 'q' });
        if (!moveResult) return false;

        playChessSound(!!moveResult.captured, chess.inCheck());
        setFen(chess.fen());

        const nextStep = step + 1;

        if (nextStep >= activePuzzle.solution.length) {
          setStatus('correct_complete');
          setSessionCount(prev => prev + 1);

          if (!solvedIds.includes(activePuzzle.id)) {
            const nextSolved = [...solvedIds, activePuzzle.id];
            setSolvedIds(nextSolved);
            localStorage.setItem('kronos_v2_puzzles_solved', JSON.stringify(nextSolved));

            try {
              const user = localStorage.getItem('kronos_v2_active_user') || 'Guest';
              const pKey = `kronos_v2_profile_${user}`;
              const profile = JSON.parse(localStorage.getItem(pKey) || '{}');
              profile.solvedPuzzleIds = nextSolved;
              profile.puzzlesSolved = nextSolved.length;
              localStorage.setItem(pKey, JSON.stringify(profile));
            } catch (err) {}
          }

          setTimeout(() => {
            if (currentIndex < filteredPuzzles.length - 1) {
              setCurrentIndex(prev => prev + 1);
            }
          }, 1800);
        } else {
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '12px' }} className="animate-fade-in">
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Loading {selectedRange} Puzzles...</div>
      </div>
    );
  }

  if (!activePuzzle) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-dim)' }}>No puzzles found matching this filter.</div>
    );
  }

  const orientation = activePuzzle.sideToMove;

  const props = {
    onBack,
    selectedRange,
    setSelectedRange,
    RATING_BANDS,
    activePuzzle,
    currentIndex,
    filteredPuzzles,
    orientation,
    fen,
    handleMove,
    themeColors,
    status,
    sanSolution,
    showHintMsg,
    handleReset,
    handleHint,
    handleReveal,
    handleNext,
    selectedTheme,
    setSelectedTheme,
    availableThemes,
    paginatedPuzzles,
    currentPage,
    totalPages,
    setCurrentPage,
    solvedIds,
    handleSelectPuzzle,
    sessionCount,
  };

  if (isMobile) {
    return <PuzzleMobile {...props} />;
  }

  return <PuzzleDesktop {...props} />;
}
