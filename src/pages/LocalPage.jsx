import React, { useState, useEffect } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import PassPlayDesktop from '../components/local/PassPlayDesktop';
import PassPlayMobile from '../components/local/PassPlayMobile';

export default function LocalPage({ boardTheme, soundEnabled }) {
  const game = useChessGame('kronos_v2_local_state', 'local');
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

  const [whitePlayerName, setWhitePlayerName] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kronos_v2_local_state') || '{}');
      return saved?.whitePlayerName || 'White Player';
    } catch { return 'White Player'; }
  });
  const [blackPlayerName, setBlackPlayerName] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kronos_v2_local_state') || '{}');
      return saved?.blackPlayerName || 'Black Player';
    } catch { return 'Black Player'; }
  });

  const [gameStarted, setGameStarted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kronos_v2_local_state') || '{}');
      return saved?.gameStatus === 'active' && (saved?.gameHistory?.length > 0);
    } catch { return false; }
  });

  useEffect(() => {
    game.setBoardTheme(boardTheme);
  }, [boardTheme]);

  useEffect(() => {
    game.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (game.gameStatus !== 'active' && game.gameStatus !== 'idle') {
      setReviewTabActive(true);
    }
  }, [game.gameStatus]);

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

  const handleLobbyStart = ({ timeControl, startingOrientation, rules, whiteName, blackName }) => {
    setWhitePlayerName(whiteName || 'White Player');
    setBlackPlayerName(blackName || 'Black Player');
    game.setRulesLevel(rules);
    game.setBoardOrientation(startingOrientation);
    game.resetGame(startingOrientation === 'white' ? 'w' : 'b', timeControl, 'local');

    try {
      const stateKey = 'kronos_v2_local_state';
      const existing = JSON.parse(localStorage.getItem(stateKey) || '{}');
      existing.whitePlayerName = whiteName || 'White Player';
      existing.blackPlayerName = blackName || 'Black Player';
      localStorage.setItem(stateKey, JSON.stringify(existing));
    } catch {}

    setGameStarted(true);
    setReviewTabActive(false);
    setPreviewIndex(null);
  };

  const handleResetToLobby = () => {
    game.resetGame(null, null, 'local');
    setGameStarted(false);
    setReviewTabActive(false);
    setPreviewIndex(null);
  };

  const props = {
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
  };

  if (isMobile) {
    return <PassPlayMobile {...props} />;
  }

  return <PassPlayDesktop {...props} />;
}
