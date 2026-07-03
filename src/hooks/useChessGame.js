// Kronos Chess V2 — Parameterized Game State Hook
// Accepts a storageKey so each route (Play, Local, Analysis) has isolated state.
// Includes premove queue for Play vs Engine mode.

import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { getOpeningDetails, getCapturedPieces } from '../utils/openingsData';
import { playChessSound } from '../utils/sound';
import CustomChessWorker from '../engine/worker.js?worker';

export const DIFFICULTY_SETTINGS = {
  beginner: { label: 'Kronos D2',             maxDepth: 2, timeLimitMs: 400,  blunderRate: 0.20 },
  casual:   { label: 'Kronos D4',             maxDepth: 4, timeLimitMs: 800,  blunderRate: 0.10 },
  club:     { label: 'Kronos D5',             maxDepth: 5, timeLimitMs: 1500, blunderRate: 0.05 },
  advanced: { label: '⭐ Kronos D6 Flagship',   maxDepth: 6, timeLimitMs: 3000, blunderRate: 0.00 },
  expert:   { label: 'Kronos D7 Experimental', maxDepth: 7, timeLimitMs: 5000, blunderRate: 0.00 }
};

export function getInitialTime(control) {
  if (control === '1+0')  return 60;
  if (control === '3+0')  return 180;
  if (control === '5+0')  return 300;
  if (control === '10+0') return 600;
  if (control === '30+0') return 1800;
  return 0; // Casual / Untimed
}

const INIT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function loadSavedState(storageKey) {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

function getSaved(storageKey, key, defaultValue) {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed[key] !== undefined) return parsed[key];
    }
  } catch {}
  return defaultValue;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useChessGame(storageKey = 'kronos_v2_game_state', defaultMode = 'ai') {
  const chessRef    = useRef(null);
  const storageKeyRef = useRef(storageKey); // stable ref for callbacks

  // ── Initialize chess.js instance (only once) ─────────────────────────────
  if (!chessRef.current) {
    const saved = loadSavedState(storageKey);
    const isActive = saved?.gameStatus === 'active';

    let initialFen       = INIT_FEN;
    let historyToReplay  = [];

    if (isActive && saved) {
      if (saved.startFen)    initialFen      = saved.startFen;
      if (saved.gameHistory) historyToReplay = saved.gameHistory;
    }

    chessRef.current = new Chess(initialFen);

    if (isActive && historyToReplay.length > 0) {
      try {
        for (const m of historyToReplay) chessRef.current.move(m.san || m);
      } catch {
        try {
          if (saved?.fen) chessRef.current.load(saved.fen);
        } catch {
          chessRef.current = new Chess(INIT_FEN);
        }
      }
    }
  }

  // ── Determine restore context ─────────────────────────────────────────────
  const saved            = loadSavedState(storageKey);
  const isRestoringGame  = saved?.gameStatus === 'active';
  const sk               = storageKey; // alias

  // ── Core board state ──────────────────────────────────────────────────────
  const [startFen,        setStartFen]        = useState(() => isRestoringGame ? getSaved(sk, 'startFen', INIT_FEN) : INIT_FEN);
  const [fen,             setFen]             = useState(() => isRestoringGame ? getSaved(sk, 'fen',      INIT_FEN) : INIT_FEN);
  const [gameHistory,     setGameHistory]     = useState(() => isRestoringGame ? getSaved(sk, 'gameHistory', [])    : []);
  const [boardOrientation,setBoardOrientation]= useState(() => getSaved(sk, 'boardOrientation', 'white'));
  const [difficulty,      setDifficulty]      = useState(() => getSaved(sk, 'difficulty', 'club'));
  const [playerColor,     setPlayerColor]     = useState(() => getSaved(sk, 'playerColor', 'w'));

  // ── History Preview / Display state ────────────────────────────────────────
  const [previewIndex,    setPreviewIndex]    = useState(null);
  const displayedFen = previewIndex !== null && gameHistory[previewIndex]
    ? gameHistory[previewIndex].after
    : fen;

  // ── Game parameters ───────────────────────────────────────────────────────
  const [gameStatus, setGameStatus] = useState('active');  // never restore finished state
  const [winner,     setWinner]     = useState(null);
  const [inCheck,    setInCheck]    = useState(() => isRestoringGame ? getSaved(sk, 'inCheck', false) : false);

  const [timeControl, setTimeControl] = useState(() => getSaved(sk, 'timeControl', '10+0'));
  const [playerTime,  setPlayerTime]  = useState(() => {
    const t = getSaved(sk, 'playerTime', null);
    return (isRestoringGame && t && t > 0) ? t : getInitialTime(getSaved(sk, 'timeControl', '10+0'));
  });
  const [engineTime, setEngineTime]   = useState(() => {
    const t = getSaved(sk, 'engineTime', null);
    return (isRestoringGame && t && t > 0) ? t : getInitialTime(getSaved(sk, 'timeControl', '10+0'));
  });

  // ── Customizations ────────────────────────────────────────────────────────
  const [boardTheme,   setBoardTheme]   = useState(() => localStorage.getItem('kronos_v2_board_theme') || 'walnut');
  const [modeSelected, setModeSelected] = useState(() => getSaved(sk, 'modeSelected', defaultMode));
  const [rulesLevel,   setRulesLevel]   = useState(() => getSaved(sk, 'rulesLevel', 'casual'));
  const [soundEnabled, setSoundEnabled] = useState(true);

  // ── Opening & material ────────────────────────────────────────────────────
  const [openingName, setOpeningName] = useState(() => getSaved(sk, 'openingName', 'Starting Position'));
  const [ecoCode,     setEcoCode]     = useState(() => getSaved(sk, 'ecoCode', 'A00'));
  const [captured,    setCaptured]    = useState(() => getCapturedPieces(chessRef.current));

  // ── Engine state ──────────────────────────────────────────────────────────
  const [isSearching,     setIsSearching]     = useState(false);
  const [thinkingStatus,  setThinkingStatus]  = useState('Waiting for move...');
  const [evalScore,       setEvalScore]       = useState(() => getSaved(sk, 'evalScore', '0.00'));
  const [engineStats,     setEngineStats]     = useState({ depth: 0, nodes: 0, nps: 0, betaCutoffs: 0, transpositionHits: 0, timeTaken: 0 });
  const [candidateMoves,  setCandidateMoves]  = useState([]);
  const [isAnalyzing,     setIsAnalyzing]     = useState(false);
  const [analysisProgress,setAnalysisProgress] = useState(0);
  const [analysisCompleted,setAnalysisCompleted] = useState(false);

  // ── Premove state (Play vs Engine only) ───────────────────────────────────
  const [premove, setPremove] = useState(null); // { from, to } | null
  const [premoveEnabled, setPremoveEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('kronos_v2_premove_enabled');
      return saved !== 'false';
    } catch { return true; }
  });

  useEffect(() => {
    localStorage.setItem('kronos_v2_premove_enabled', premoveEnabled.toString());
    if (!premoveEnabled) setPremove(null);
  }, [premoveEnabled]);

  // ── Refs & Search State ───────────────────────────────────────────────────
  const customWorkerRef    = useRef(null);
  const stockfishWorkerRef = useRef(null);
  const stockfishCodeRef   = useRef(null);
  const stockfishPromiseRef= useRef(null);
  const timerIntervalRef   = useRef(null);
  const hasSavedRef        = useRef(false);
  const isMounted          = useRef(true);
  const analysisWorkerRef  = useRef(null);
  const currentSearchFenRef = useRef(null);
  const simulateTimeoutRef   = useRef(null);

  const searchStateRef = useRef({
    currentSearchId: 0,
    latestDepth: 0,
    depthData: {},
    completedDepth: 0,
    completedData: [],
    nodes: 0,
    nps: 0,
    betaCutoffs: 0,
    transpositionHits: 0,
    timeTaken: 0,
  });

  const lastUIUpdateTimeRef = useRef(0);
  const throttleTimeoutRef = useRef(null);

  const triggerUIUpdate = useCallback(() => {
    if (!isMounted.current) return;
    const state = searchStateRef.current;
    if (state.completedData && state.completedData.length > 0) {
      const bestLine = state.completedData[0];
      setEvalScore(bestLine.score);
      setCandidateMoves(state.completedData);
    }
    setEngineStats({
      depth: state.latestDepth,
      nodes: state.nodes,
      nps: state.nps,
      betaCutoffs: state.betaCutoffs,
      transpositionHits: state.transpositionHits,
      timeTaken: state.timeTaken,
    });
  }, []);

  const scheduleUIUpdate = useCallback(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUIUpdateTimeRef.current;
    const throttleLimit = 150;

    if (throttleTimeoutRef.current) return;

    if (timeSinceLastUpdate >= throttleLimit) {
      triggerUIUpdate();
      lastUIUpdateTimeRef.current = now;
    } else {
      const delay = throttleLimit - timeSinceLastUpdate;
      throttleTimeoutRef.current = setTimeout(() => {
        triggerUIUpdate();
        lastUIUpdateTimeRef.current = Date.now();
        throttleTimeoutRef.current = null;
      }, delay);
    }
  }, [triggerUIUpdate]);

  const forceFinalUIUpdate = useCallback(() => {
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
      throttleTimeoutRef.current = null;
    }
    triggerUIUpdate();
    lastUIUpdateTimeRef.current = Date.now();
  }, [triggerUIUpdate]);

  const resetSearchState = useCallback(() => {
    searchStateRef.current = {
      currentSearchId: searchStateRef.current.currentSearchId + 1,
      latestDepth: 0,
      depthData: {},
      completedDepth: 0,
      completedData: [],
      nodes: 0,
      nps: 0,
      betaCutoffs: 0,
      transpositionHits: 0,
      timeTaken: 0,
    };
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
      throttleTimeoutRef.current = null;
    }
  }, []);

  const modeSelectedRef = useRef(null);
  const difficultyRef = useRef(null);
  const classifyMoveRef = useRef(null);
  const triggerMoveSoundRef = useRef(null);
  const updateGameStatusAndSaveRef = useRef(null);
  const playerColorRef = useRef(null);
  // Monotonically incrementing search ID — any result with a stale ID is discarded
  const searchIdRef = useRef(0);

  // ─────────────────────────────────────────────────────────────────────────
  // PERSIST TO STORAGE
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const state = {
      startFen, fen, gameHistory, boardOrientation, difficulty, playerColor,
      gameStatus, winner, inCheck, timeControl, playerTime, engineTime,
      modeSelected, rulesLevel, openingName, ecoCode, evalScore
    };
    try {
      localStorage.setItem(storageKeyRef.current, JSON.stringify(state));
      localStorage.setItem('kronos_v2_board_theme', boardTheme);
    } catch {}
  }, [
    startFen, fen, gameHistory, boardOrientation, difficulty, playerColor,
    gameStatus, winner, inCheck, timeControl, playerTime, engineTime,
    modeSelected, rulesLevel, boardTheme, openingName, ecoCode, evalScore
  ]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (customWorkerRef.current)    customWorkerRef.current.terminate();
      if (stockfishWorkerRef.current) stockfishWorkerRef.current.terminate();
      if (analysisWorkerRef.current)  analysisWorkerRef.current.terminate();
      if (timerIntervalRef.current)   clearInterval(timerIntervalRef.current);
      if (simulateTimeoutRef.current) clearTimeout(simulateTimeoutRef.current);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // SOUND
  // ─────────────────────────────────────────────────────────────────────────
  const triggerMoveSound = useCallback((capturedPiece, inCheckState) => {
    if (soundEnabled) playChessSound(capturedPiece, inCheckState);
  }, [soundEnabled]);

  // ─────────────────────────────────────────────────────────────────────────
  // MOVE CLASSIFICATION
  // ─────────────────────────────────────────────────────────────────────────
  const classifyMove = useCallback((prevScore, nextScore, isWhiteTurn) => {
    const parse = (s) => {
      if (typeof s === 'string' && s.includes('M')) {
        const m = parseInt(s.replace('M','').replace('+',''));
        return m > 0 ? (1000 - m) : (-1000 - m);
      }
      return parseFloat(s) || 0;
    };
    const loss = isWhiteTurn ? (parse(prevScore) - parse(nextScore)) : (parse(nextScore) - parse(prevScore));
    if (loss <= 0.0)  return 'Best Move';
    if (loss <= 0.20) return 'Excellent';
    if (loss <= 0.50) return 'Good';
    if (loss <= 0.90) return 'Inaccuracy';
    if (loss <= 1.90) return 'Mistake';
    return 'Blunder';
  }, []);

  const cancelPostGameAnalysis = useCallback(() => {
    if (analysisWorkerRef.current) {
      analysisWorkerRef.current.terminate();
      analysisWorkerRef.current = null;
    }
    setIsAnalyzing(false);
    setAnalysisProgress(0);
  }, []);

  const triggerPostGameAnalysis = useCallback(async () => {
    if (isAnalyzing || gameHistory.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      let code = stockfishCodeRef.current;
      if (!code) {
        setThinkingStatus('Downloading Stockfish engine...');
        const response = await fetch("https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js");
        if (!response.ok) throw new Error('Failed to fetch Stockfish');
        code = await response.text();
        stockfishCodeRef.current = code;
      }

      const blob = new Blob([code], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      analysisWorkerRef.current = worker;

      worker.postMessage('uci');
      worker.postMessage('setoption name MultiPV value 1');
      worker.postMessage('isready');

      const fensToEvaluate = [startFen, ...gameHistory.map(m => m.after)];
      const evaluations = [];

      const evaluateSingleFen = (fen) => {
        return new Promise((resolve) => {
          let score = '0.00';
          const parts = fen.split(' ');
          const turn = parts[1] || 'w';

          const handleMessage = (e) => {
            const line = e.data;
            if (line.startsWith('info') && line.includes('pv')) {
              const cpM = line.match(/score\s+cp\s+(-?\d+)/);
              const mateM = line.match(/score\s+mate\s+(-?\d+)/);
              if (cpM) {
                const v = parseInt(cpM[1]);
                score = turn === 'w' ? (v / 100).toFixed(2) : (-v / 100).toFixed(2);
              } else if (mateM) {
                const mv = parseInt(mateM[1]);
                if (turn === 'w') {
                  score = mv > 0 ? `M${mv}` : `-M${Math.abs(mv)}`;
                } else {
                  score = mv > 0 ? `-M${mv}` : `M${Math.abs(mv)}`;
                }
              }
            }
            if (line.startsWith('bestmove')) {
              worker.removeEventListener('message', handleMessage);
              resolve(score);
            }
          };

          worker.addEventListener('message', handleMessage);
          worker.postMessage(`position fen ${fen}`);
          worker.postMessage('go depth 10');
        });
      };

      for (let i = 0; i < fensToEvaluate.length; i++) {
        if (!isMounted.current || analysisWorkerRef.current !== worker) {
          worker.terminate();
          return;
        }
        const score = await evaluateSingleFen(fensToEvaluate[i]);
        evaluations.push(score);
        setAnalysisProgress(Math.round(((i + 1) / fensToEvaluate.length) * 100));
      }

      const updatedHistory = gameHistory.map((move, idx) => {
        const prevEval = evaluations[idx];
        const nextEval = evaluations[idx + 1];
        const classification = classifyMove(prevEval, nextEval, move.color === 'w');
        return {
          ...move,
          evalScore: nextEval,
          classification
        };
      });

      setGameHistory(updatedHistory);
      setIsAnalyzing(false);
      worker.terminate();
      if (analysisWorkerRef.current === worker) {
        analysisWorkerRef.current = null;
      }
    } catch (err) {
      console.error('Post-game analysis failed:', err);
      setIsAnalyzing(false);
      if (analysisWorkerRef.current) {
        analysisWorkerRef.current.terminate();
        analysisWorkerRef.current = null;
      }
    }
  }, [isAnalyzing, gameHistory, startFen, classifyMove]);


  // ─────────────────────────────────────────────────────────────────────────
  // GAME PROFILE SAVE
  // ─────────────────────────────────────────────────────────────────────────
  const saveGameProfile = useCallback((status, winSide) => {
    if (hasSavedRef.current) return;
    if (modeSelected === 'simulate') return; // Don't save spectator games to stats
    hasSavedRef.current = true;
    try {
      const user       = localStorage.getItem('kronos_v2_active_user') || 'Guest';
      const profileKey = `kronos_v2_profile_${user}`;
      const stored     = localStorage.getItem(profileKey);
      let profile      = { gamesPlayed: 0, wins: 0, losses: 0, draws: 0, favoriteOpening: 'None yet', averageMoves: 0, history: [] };
      if (stored) profile = JSON.parse(stored);

      profile.gamesPlayed += 1;
      let result = 'draw';
      if (status === 'draw') result = 'draw';
      else if (modeSelected === 'local') result = winSide === 'w' ? 'White Won' : 'Black Won';
      else result = winSide === playerColor ? 'win' : 'loss';

      if (result === 'win')  profile.wins   += 1;
      else if (result === 'loss')  profile.losses += 1;
      else profile.draws += 1;

      profile.history.push({ date: new Date().toLocaleDateString(), opponent: modeSelected === 'local' ? 'Local Opponent' : 'Kronos Engine', result, moves: gameHistory.length, opening: openingName });
      profile.averageMoves = Math.round(profile.history.reduce((s, h) => s + h.moves, 0) / profile.gamesPlayed);

      const counts = {};
      profile.history.forEach(h => { if (h.opening && h.opening !== 'Starting Position') counts[h.opening] = (counts[h.opening] || 0) + 1; });
      let fav = 'None yet', max = 0;
      Object.keys(counts).forEach(k => { if (counts[k] > max) { max = counts[k]; fav = k; } });
      profile.favoriteOpening = fav;

      localStorage.setItem(profileKey, JSON.stringify(profile));
    } catch (e) { console.warn('Error saving profile:', e); }
  }, [modeSelected, playerColor, gameHistory, openingName]);

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE GAME STATUS & FEN
  // ─────────────────────────────────────────────────────────────────────────
  const updateGameStatusAndSave = useCallback(() => {
    const chess = chessRef.current;
    const currentFen = chess.fen();
    setFen(currentFen);
    setInCheck(chess.inCheck());

    const history = chess.history({ verbose: true });
    const details = getOpeningDetails(history);
    setOpeningName(details.name);
    setEcoCode(details.eco);
    setCaptured(getCapturedPieces(chess));

    if (chess.isGameOver()) {
      let status = 'draw', winSide = 'draw';
      if (chess.isCheckmate()) {
        status  = 'checkmate';
        winSide = chess.turn() === 'w' ? 'b' : 'w';
        setWinner(winSide);
        setGameStatus('checkmate');
      } else {
        setWinner('draw');
        setGameStatus('draw');
      }
      playChessSound(false, false, true);
      saveGameProfile(status, winSide);
    } else {
      setGameStatus('active');
      setWinner(null);
    }

    const mappedHistory = chess.history({ verbose: true }).map((m, idx) => {
      const existing = gameHistory[idx];
      return { ...m, evalScore: existing?.evalScore || '0.00', classification: existing?.classification || 'Good' };
    });
    setGameHistory(mappedHistory);
  }, [gameHistory, saveGameProfile]);

  // ─────────────────────────────────────────────────────────────────────────
  // CUSTOM MINIMAX WORKER
  // ─────────────────────────────────────────────────────────────────────────
  const startCustomWorker = useCallback(() => {
    if (customWorkerRef.current) customWorkerRef.current.terminate();
    customWorkerRef.current = new CustomChessWorker();

    customWorkerRef.current.onmessage = (e) => {
      if (!isMounted.current) return;
      const { type, depth, bestMove, score, stats, timeTaken, pv, searchId } = e.data;

      // Discard results from any search that has been superseded
      if (searchId !== undefined && searchId !== searchIdRef.current) return;

      if (type === 'ITERATION_COMPLETE' || type === 'SEARCH_COMPLETE') {
        const nps = stats ? Math.round((stats.nodesSearched + stats.quiescenceNodes) / (timeTaken / 1000)) : 0;
        let displayScore = '0.00';
        const MATE_THRESHOLD = 90000;
        if (score !== undefined) {
          const isWhiteTurn = chessRef.current.turn() === 'w';
          if (score > MATE_THRESHOLD) {
            const plies = 100000 - score;
            const moves = Math.ceil(plies / 2);
            displayScore = isWhiteTurn ? `M${moves}` : `-M${moves}`;
          } else if (score < -MATE_THRESHOLD) {
            const plies = 100000 + score;
            const moves = Math.ceil(plies / 2);
            displayScore = isWhiteTurn ? `-M${moves}` : `M${moves}`;
          } else {
            const sign = isWhiteTurn ? 1 : -1;
            displayScore = ((score * sign) / 100).toFixed(2);
          }
        }

        const cand = {
          pvIdx: 1,
          depth: depth || stats?.maxDepthReached || 0,
          score: displayScore,
          bestMove: bestMove ? (bestMove.from + bestMove.to) : '',
          line: pv || (bestMove ? bestMove.san || (bestMove.from + bestMove.to) : '')
        };

        const state = searchStateRef.current;
        if (depth > 0) {
          state.latestDepth = Math.max(state.latestDepth, depth);
          state.depthData[depth] = [cand];
          state.nodes = (stats?.nodesSearched || 0) + (stats?.quiescenceNodes || 0);
          state.nps = isFinite(nps) ? nps : 0;
          state.betaCutoffs = stats?.betaCutoffs || 0;
          state.transpositionHits = stats?.transpositionHits || 0;
          state.timeTaken = timeTaken || 0;

          for (let d = 1; d <= depth; d++) {
            if (state.depthData[d] && d > state.completedDepth) {
              state.completedDepth = d;
              state.completedData = state.depthData[d];
            }
          }
        }

        if (type === 'SEARCH_COMPLETE') {
          if (depth) {
            state.latestDepth = depth;
            state.completedDepth = depth;
            state.completedData = [cand];
          }
          forceFinalUIUpdate();
          setIsSearching(false);
          setThinkingStatus('Your move');

          if (chessRef.current.fen() !== currentSearchFenRef.current) return;

          const isEngineTurn = modeSelectedRef.current === 'simulate' ||
            (modeSelectedRef.current === 'ai' && chessRef.current.turn() !== playerColorRef.current);

          if (bestMove && isEngineTurn) {
            let finalMove = bestMove;
            const settings = DIFFICULTY_SETTINGS[difficultyRef.current];
            if (settings.blunderRate > 0 && Math.random() < settings.blunderRate) {
              const legals = chessRef.current.moves({ verbose: true });
              if (legals.length > 0) finalMove = legals[Math.floor(Math.random() * legals.length)];
            }

            const applyEngineMove = () => {
              if (chessRef.current.fen() !== currentSearchFenRef.current) return;
              try {
                const res = chessRef.current.move(finalMove);
                if (res) {
                  triggerMoveSoundRef.current(!!res.captured, chessRef.current.inCheck());
                  setGameHistory(prev => {
                    const copy = [...prev];
                    if (copy.length > 0) {
                      const idx = copy.length - 1;
                      const prevEval = idx > 0 ? copy[idx - 1].evalScore : '0.00';
                      copy[idx].evalScore = displayScore;
                      copy[idx].classification = classifyMoveRef.current(prevEval, displayScore, chessRef.current.turn() === 'b');
                    }
                    return copy;
                  });
                  updateGameStatusAndSaveRef.current();
                }
              } catch (err) { console.warn('Engine move failed', err); }
            };

            if (modeSelectedRef.current === 'simulate') {
              if (simulateTimeoutRef.current) clearTimeout(simulateTimeoutRef.current);
              simulateTimeoutRef.current = setTimeout(applyEngineMove, 600);
            } else {
              applyEngineMove();
            }
          }
        } else {
          scheduleUIUpdate();
        }
      }
    };
  }, [forceFinalUIUpdate, scheduleUIUpdate]);

  // ── Helper to resolve Stockfish worker asynchronously ─────────────────────
  const getStockfishWorker = useCallback(() => {
    if (stockfishWorkerRef.current) return Promise.resolve(stockfishWorkerRef.current);
    if (stockfishPromiseRef.current) return stockfishPromiseRef.current;

    stockfishPromiseRef.current = (async () => {
      try {
        let code = stockfishCodeRef.current;
        if (!code) {
          setThinkingStatus('Downloading Stockfish engine...');
          const response = await fetch("https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js");
          if (!response.ok) throw new Error('Failed to fetch Stockfish');
          code = await response.text();
          stockfishCodeRef.current = code;
        }

        const blob = new Blob([code], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        worker.postMessage('uci');
        worker.postMessage('setoption name MultiPV value 3');
        worker.postMessage('isready');

        worker.onmessage = (e) => {
          if (!isMounted.current) return;
          const line = e.data;
          if (line.startsWith('bestmove')) {
            const state = searchStateRef.current;
            const maxDepth = Math.max(...Object.keys(state.depthData).map(Number), 0);
            if (maxDepth > state.completedDepth && state.depthData[maxDepth]) {
              state.completedDepth = maxDepth;
              state.completedData = state.depthData[maxDepth].filter(Boolean);
            }
            forceFinalUIUpdate();

            setIsSearching(false);
            setThinkingStatus('Analysis ready');
          }
          if (line.startsWith('info') && line.includes('pv')) {
            const depthM  = line.match(/depth\s+(\d+)/);
            const pvIdxM  = line.match(/multipv\s+(\d+)/);
            const cpM     = line.match(/score\s+cp\s+(-?\d+)/);
            const mateM   = line.match(/score\s+mate\s+(-?\d+)/);
            const pvM     = line.match(/pv\s+(.+)/);
            if (pvM) {
              const pvIdx  = pvIdxM ? parseInt(pvIdxM[1]) : 1;
              const moves  = pvM[1].split(' ');
              const depth  = depthM ? parseInt(depthM[1]) : 0;
              
              let scoreStr = '0.00';
              if (cpM) {
                const v = parseInt(cpM[1]);
                scoreStr = chessRef.current.turn() === 'w' ? (v / 100).toFixed(2) : (-v / 100).toFixed(2);
              } else if (mateM) {
                const mv = parseInt(mateM[1]);
                if (chessRef.current.turn() === 'w') {
                  scoreStr = mv > 0 ? `M${mv}` : `-M${Math.abs(mv)}`;
                } else {
                  scoreStr = mv > 0 ? `-M${mv}` : `M${Math.abs(mv)}`;
                }
              }

              const cand = {
                pvIdx,
                depth,
                score: scoreStr,
                bestMove: moves[0],
                line: moves.slice(0, 5).join(' ')
              };

              const state = searchStateRef.current;
              if (depth > 0) {
                state.latestDepth = Math.max(state.latestDepth, depth);
                state.depthData[depth] = state.depthData[depth] || [];
                state.depthData[depth][pvIdx - 1] = cand;

                // All depths strictly less than latestDepth are complete
                for (let d = 1; d < state.latestDepth; d++) {
                  if (state.depthData[d] && d > state.completedDepth) {
                    state.completedDepth = d;
                    state.completedData = state.depthData[d].filter(Boolean);
                  }
                }
              }

              scheduleUIUpdate();
            }
          }
        };

        stockfishWorkerRef.current = worker;
        return worker;
      } catch (err) {
        console.warn('Stockfish failed to load:', err);
        stockfishPromiseRef.current = null;
        throw err;
      }
    })();

    return stockfishPromiseRef.current;
  }, [forceFinalUIUpdate, scheduleUIUpdate]);

  // ── Trigger Engine search on FEN changes ──────────────────────────────────
  useEffect(() => {
    if (gameStatus !== 'active') return;

    if (modeSelected === 'analysis') {
      resetSearchState();
      setIsSearching(true);
      setThinkingStatus('Stockfish is analysing...');
      getStockfishWorker()
        .then(worker => {
          if (!isMounted.current || modeSelected !== 'analysis') return;
          worker.postMessage(`position fen ${displayedFen}`);
          worker.postMessage('go depth 16');
        })
        .catch(() => {
          if (!isMounted.current) return;
          setIsSearching(false);
          setThinkingStatus('Failed to load Stockfish engine');
        });
    } else if (modeSelected === 'simulate') {
      if (!customWorkerRef.current) startCustomWorker();
      resetSearchState();
      const sid = searchIdRef.current + 1;
      searchIdRef.current = sid;
      setIsSearching(true);
      setThinkingStatus('Engine simulation calculating...');
      currentSearchFenRef.current = displayedFen;
      customWorkerRef.current.postMessage({ type: 'SEARCH', fen: displayedFen, maxDepth: DIFFICULTY_SETTINGS[difficulty].maxDepth, timeLimitMs: DIFFICULTY_SETTINGS[difficulty].timeLimitMs, searchId: sid });
    } else if (modeSelected === 'ai') {
      if (chessRef.current.turn() !== playerColor) {
        // Engine's turn — dedicate the worker entirely to finding a move
        if (!customWorkerRef.current) startCustomWorker();
        resetSearchState();
        const sid = searchIdRef.current + 1;
        searchIdRef.current = sid;
        setIsSearching(true);
        setThinkingStatus('Engine is calculating...');
        currentSearchFenRef.current = displayedFen;
        customWorkerRef.current.postMessage({ type: 'SEARCH', fen: displayedFen, maxDepth: DIFFICULTY_SETTINGS[difficulty].maxDepth, timeLimitMs: DIFFICULTY_SETTINGS[difficulty].timeLimitMs, searchId: sid });
      }
      // On player's turn: do not run a background search — keep the worker free for the next engine turn
    }
  }, [displayedFen, modeSelected, gameStatus, playerColor, difficulty, getStockfishWorker, startCustomWorker, resetSearchState]);

  // ── PREMOVE EXECUTION — fires when it becomes the player's turn after engine moves
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!premoveEnabled || !premove || isSearching || gameStatus !== 'active') return;
    if (modeSelected !== 'ai') return;
    if (chessRef.current.turn() !== playerColor) return;

    // Try to execute queued premove
    const { from, to } = premove;
    setPremove(null); // clear it first so we don't loop

    try {
      const res = chessRef.current.move({ from, to, promotion: 'q' });
      if (res) {
        triggerMoveSound(!!res.captured, chessRef.current.inCheck());
        updateGameStatusAndSave();
      }
    } catch {
      // Premove was illegal — silently discard
    }
  }, [isSearching, premove, gameStatus, modeSelected, playerColor, triggerMoveSound, updateGameStatusAndSave, premoveEnabled]);

  // Reset searching on mode change
  useEffect(() => {
    setIsSearching(false);
    setThinkingStatus('Waiting for move...');
    setCandidateMoves([]);
    setPremove(null);
  }, [modeSelected]);

  // ─────────────────────────────────────────────────────────────────────────
  // GAME ACTIONS
  // ─────────────────────────────────────────────────────────────────────────
  const makeMove = useCallback((moveInput) => {
    const chess = chessRef.current;
    if (chess.isGameOver()) return false;
    if (modeSelected === 'simulate') return false;
    if (modeSelected === 'ai' && (isSearching || chess.turn() !== playerColor)) return false;

    // Truncate history if making a move from a previewed state
    if (previewIndex !== null && gameHistory[previewIndex]) {
      const targetFen = gameHistory[previewIndex].after;
      chess.load(targetFen);
      const newHistory = gameHistory.slice(0, previewIndex + 1);
      setGameHistory(newHistory);
      setPreviewIndex(null);
    }

    try {
      const res = chess.move(moveInput);
      if (res) {
        triggerMoveSound(!!res.captured, chess.inCheck());
        updateGameStatusAndSave();
        if (modeSelected === 'local') setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
        return true;
      }
    } catch { return false; }
    return false;
  }, [modeSelected, playerColor, isSearching, triggerMoveSound, updateGameStatusAndSave, previewIndex, gameHistory]);

  const queuePremove = useCallback((from, to) => {
    if (premoveEnabled) {
      setPremove({ from, to });
    }
  }, [premoveEnabled]);

  const clearPremove = useCallback(() => {
    setPremove(null);
  }, []);

  const undoMove = useCallback(() => {
    if ((modeSelected === 'ai' && isSearching) || rulesLevel === 'competitive') return;
    const chess = chessRef.current;
    if (modeSelected === 'local' || modeSelected === 'analysis') {
      chess.undo();
      if (modeSelected === 'local') setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
    } else if (modeSelected === 'ai') {
      chess.undo(); chess.undo(); // undo engine + player move
    }
    if (simulateTimeoutRef.current) {
      clearTimeout(simulateTimeoutRef.current);
      simulateTimeoutRef.current = null;
    }
    currentSearchFenRef.current = null;
    setPreviewIndex(null);
    setAnalysisCompleted(false);
    cancelPostGameAnalysis();
    updateGameStatusAndSave();
  }, [isSearching, modeSelected, rulesLevel, cancelPostGameAnalysis, updateGameStatusAndSave]);

  const resetGame = useCallback((newColor = null, newControl = null, forceMode = null) => {
    const chess = chessRef.current;
    chess.reset();

    if (simulateTimeoutRef.current) {
      clearTimeout(simulateTimeoutRef.current);
      simulateTimeoutRef.current = null;
    }
    currentSearchFenRef.current = null;

    setIsSearching(false);
    setThinkingStatus('Waiting for move...');
    setCandidateMoves([]);
    setPremove(null);
    setPreviewIndex(null);

    if (customWorkerRef.current) customWorkerRef.current.postMessage({ type: 'CLEAR_CACHE' });

    const start = chess.fen();
    setStartFen(start);
    setFen(start);
    setGameHistory([]);
    hasSavedRef.current = false;
    setWinner(null);
    setGameStatus('active');
    setInCheck(false);
    setEvalScore('0.00');
    setAnalysisCompleted(false);
    cancelPostGameAnalysis();
 
     const controlToUse = newControl || timeControl;
     if (newControl) setTimeControl(newControl);
     const initTime = getInitialTime(controlToUse);
     setPlayerTime(initTime);
     setEngineTime(initTime);
 
     const colorToUse = newColor || playerColor;
     setPlayerColor(colorToUse);
     
     const modeToUse = forceMode || modeSelected;
     if (modeToUse !== 'analysis') {
       setBoardOrientation(colorToUse === 'w' ? 'white' : 'black');
     }
 
     if (forceMode) setModeSelected(forceMode);
 
     setOpeningName('Starting Position');
     setEcoCode('A00');
     setCaptured({ w: [], b: [], balance: 0 });
   }, [timeControl, playerColor, modeSelected, cancelPostGameAnalysis]);

  const importFen = useCallback((newFen) => {
    try {
      const chess = new Chess(newFen);
      chessRef.current = chess;
      setStartFen(newFen);
      setFen(newFen);
      hasSavedRef.current = false;
      setWinner(null);
      setGameStatus('active');
      setCandidateMoves([]);
      setEvalScore('0.00');
      setPremove(null);
      setPreviewIndex(null);
      setAnalysisCompleted(false);
      cancelPostGameAnalysis();
      updateGameStatusAndSave();
      if (customWorkerRef.current) customWorkerRef.current.postMessage({ type: 'CLEAR_CACHE' });
      return true;
    } catch { return false; }
  }, [updateGameStatusAndSave, cancelPostGameAnalysis]);

  const importPgn = useCallback((pgnText) => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgnText);
      chessRef.current = chess;
      setStartFen(INIT_FEN);
      setFen(chess.fen());
      hasSavedRef.current = false;
      setWinner(null);
      setGameStatus('active');
      setPremove(null);
      setPreviewIndex(null);
      setAnalysisCompleted(false);
      cancelPostGameAnalysis();
      updateGameStatusAndSave();
      return true;
    } catch { return false; }
  }, [updateGameStatusAndSave, cancelPostGameAnalysis]);

  const resignGame = useCallback(() => {
    setGameStatus('resign');
    setWinner(playerColor === 'w' ? 'b' : 'w');
    saveGameProfile('resign', playerColor === 'w' ? 'b' : 'w');
    playChessSound(false, false, true);
  }, [playerColor, saveGameProfile]);

  const offerDraw = useCallback(() => {
    setGameStatus('draw');
    setWinner('draw');
    saveGameProfile('draw', 'draw');
    playChessSound(false, false, true);
  }, [saveGameProfile]);

  const flipBoard = useCallback(() => {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // TIMER
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameStatus !== 'active' || timeControl === 'casual') {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      const activeSide = chessRef.current.turn();
      if (modeSelected === 'local' || modeSelected === 'simulate') {
        if (activeSide === 'w') {
          setPlayerTime(prev => {
            if (prev <= 1) { setGameStatus('timeout'); setWinner('b'); saveGameProfile('timeout', 'b'); return 0; }
            return prev - 1;
          });
        } else {
          setEngineTime(prev => {
            if (prev <= 1) { setGameStatus('timeout'); setWinner('w'); saveGameProfile('timeout', 'w'); return 0; }
            return prev - 1;
          });
        }
      } else {
        if (activeSide === playerColor) {
          setPlayerTime(prev => {
            if (prev <= 1) { setGameStatus('timeout'); setWinner(playerColor === 'w' ? 'b' : 'w'); saveGameProfile('timeout', playerColor === 'w' ? 'b' : 'w'); return 0; }
            return prev - 1;
          });
        } else {
          setEngineTime(prev => {
            if (prev <= 1) { setGameStatus('timeout'); setWinner(playerColor); saveGameProfile('timeout', playerColor); return 0; }
            return prev - 1;
          });
        }
      }
    }, 1000);

    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [gameStatus, timeControl, playerColor, modeSelected, saveGameProfile]);

  // ─────────────────────────────────────────────────────────────────────────
  // FEN IMPORT FROM EDITOR
  // ─────────────────────────────────────────────────────────────────────────
  const setTimeControlWithReset = useCallback((newControl) => {
    setTimeControl(newControl);
    const t = getInitialTime(newControl);
    setPlayerTime(t);
    setEngineTime(t);
  }, []);

  // ── Post-game analysis is now user-triggered, not auto-fired ──────────────
  // (triggerPostGameAnalysis is exposed and called by the PostGameReview component)

  // Update stable refs for worker closure safety
  modeSelectedRef.current = modeSelected;
  difficultyRef.current = difficulty;
  classifyMoveRef.current = classifyMove;
  triggerMoveSoundRef.current = triggerMoveSound;
  updateGameStatusAndSaveRef.current = updateGameStatusAndSave;
  playerColorRef.current = playerColor;

  // ─────────────────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────────────────
  return {
    // Board state
    fen, gameHistory, boardOrientation, difficulty, playerColor, previewIndex,
    // Game state
    isSearching, gameStatus, winner, inCheck,
    isAnalyzing, analysisProgress,
    // Engine
    engineStats, thinkingStatus, candidateMoves, evalScore,
    // Timers
    timeControl, playerTime, engineTime,
    // Settings
    soundEnabled, boardTheme, modeSelected, rulesLevel,
    // Opening
    openingName, ecoCode, captured,
    // Premove
    premove, premoveEnabled,
    // Setters
    setBoardTheme, setRulesLevel, setSoundEnabled, setModeSelected,
    setDifficulty, setPlayerColor, setBoardOrientation, setPremoveEnabled,
    setPreviewIndex,
    setTimeControl: setTimeControlWithReset,
    // Actions
    makeMove, queuePremove, clearPremove,
    undoMove, resetGame, importFen, importPgn,
    resignGame, offerDraw, flipBoard,
    triggerPostGameAnalysis, cancelPostGameAnalysis
  };
}
