import React, { useState, useEffect } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import PlayDesktop from '../components/play/PlayDesktop';
import PlayMobile from '../components/play/PlayMobile';

export default function PlayPage({ username, boardTheme, soundEnabled }) {
  const game = useChessGame('kronos_v2_play_state', 'ai');
  const { previewIndex, setPreviewIndex } = game;
  const [reviewTabActive, setReviewTabActive] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [gameOptions, setGameOptions] = useState(() => {
    try {
      const saved = localStorage.getItem('kronos_v2_game_options');
      return saved ? JSON.parse(saved) : {
        showEvalBar: true, showPV: true, premoveEnabled: true, autoAnalysis: false, moveHints: false
      };
    } catch {
      return { showEvalBar: true, showPV: true, premoveEnabled: true, autoAnalysis: false, moveHints: false };
    }
  });

  const [gameStarted, setGameStarted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kronos_v2_play_state') || '{}');
      return saved?.gameStatus === 'active' && (saved?.gameHistory?.length > 0);
    } catch { return false; }
  });

  useEffect(() => { game.setBoardTheme(boardTheme); }, [boardTheme]);
  useEffect(() => { game.setSoundEnabled(soundEnabled); }, [soundEnabled]);

  useEffect(() => {
    game.setPremoveEnabled(gameOptions.premoveEnabled);
  }, [gameOptions.premoveEnabled]);

  useEffect(() => {
    if (game.gameStatus !== 'active' && game.gameStatus !== 'idle') {
      setReviewTabActive(true);
    }
  }, [game.gameStatus]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e || typeof e.key !== 'string') return;
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) return;
      const key = e.key.toLowerCase();

      if (key === 'n') { e.preventDefault(); setGameStarted(false); setReviewTabActive(false); setPreviewIndex(null); }
      if (key === 'f') { e.preventDefault(); game.flipBoard(); }
      if (key === 'e') { e.preventDefault(); setGameOptions(o => ({ ...o, showEvalBar: !o.showEvalBar })); }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (game.gameHistory.length > 0) setPreviewIndex(prev => prev === null ? game.gameHistory.length - 1 : Math.max(0, prev - 1));
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (previewIndex !== null) setPreviewIndex(prev => prev === game.gameHistory.length - 1 ? null : prev + 1);
      }
    };

    const handleNewGame  = () => { setGameStarted(false); setReviewTabActive(false); setPreviewIndex(null); };
    const handleFlipBoard = () => game.flipBoard();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('kronos_new_game', handleNewGame);
    window.addEventListener('kronos_flip_board', handleFlipBoard);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('kronos_new_game', handleNewGame);
      window.removeEventListener('kronos_flip_board', handleFlipBoard);
    };
  }, [game, previewIndex]);

  const handleLobbyStart = (color, difficulty, timeControl, options) => {
    setGameOptions(options);
    localStorage.setItem('kronos_v2_game_options', JSON.stringify(options));
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

  const boardFen = previewIndex !== null && game.gameHistory[previewIndex]
    ? game.gameHistory[previewIndex].after
    : game.fen;

  const props = {
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
  };

  if (isMobile) {
    return <PlayMobile {...props} />;
  }

  return <PlayDesktop {...props} />;
}
