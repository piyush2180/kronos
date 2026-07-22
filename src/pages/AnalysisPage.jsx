import React, { useState, useEffect } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import AnalysisDesktop from '../components/analysis/AnalysisDesktop';
import AnalysisMobile from '../components/analysis/AnalysisMobile';

export default function AnalysisPage({ boardTheme, soundEnabled }) {
  const game = useChessGame('kronos_v2_analysis_state', 'analysis');
  const { previewIndex, setPreviewIndex } = game;
  const [showExplorer, setShowExplorer] = useState(false);
  const [evalBarVisible, setEvalBarVisible] = useState(true);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    game.setModeSelected('analysis');
  }, []);

  useEffect(() => {
    game.setBoardTheme(boardTheme);
  }, [boardTheme]);

  useEffect(() => {
    game.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e || typeof e.key !== 'string') return;
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
      if (isInputFocused) return;

      const key = e.key.toLowerCase();

      if (key === 'n') {
        e.preventDefault();
        game.resetGame(null, null, 'analysis');
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
      game.resetGame(null, null, 'analysis');
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

  const boardFen = previewIndex !== null && game.gameHistory[previewIndex]
    ? game.gameHistory[previewIndex].after
    : game.fen;

  const props = {
    game,
    boardFen,
    evalBarVisible,
    showExplorer,
    setShowExplorer,
    previewIndex,
    setPreviewIndex,
  };

  if (isMobile) {
    return <AnalysisMobile {...props} />;
  }

  return <AnalysisDesktop {...props} />;
}
