// Kronos Chess V2 — Command Palette Component
// Opens via Ctrl+K / Cmd+K. Searchable quick menu for board controls, modes, and configurations.

import React, { useState, useEffect, useRef } from 'react';
import { Search, Monitor, Shuffle, Volume2, Palette, Target, HelpCircle, User } from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  setModeSelected,
  resetGame,
  flipBoard,
  setBoardTheme,
  soundEnabled,
  setSoundEnabled,
  onNavigate
}) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Command database
  const COMMANDS = [
    { id: 'mode_ai', name: 'Play vs Engine (Solo Mode)', category: 'Game Modes', icon: <Target size={15} />, action: () => { setModeSelected('ai'); resetGame(); } },
    { id: 'mode_local', name: 'Local Pass & Play', category: 'Game Modes', icon: <Shuffle size={15} />, action: () => { setModeSelected('local'); resetGame(); } },
    { id: 'mode_analysis', name: 'Analysis Board (Stockfish)', category: 'Game Modes', icon: <Monitor size={15} />, action: () => setModeSelected('analysis') },
    { id: 'mode_editor', name: 'Position Editor', category: 'Game Modes', icon: <Palette size={15} />, action: () => setModeSelected('editor') },
    { id: 'action_new_game', name: 'New Game / Reset Position', category: 'Actions', icon: <Target size={15} />, action: () => resetGame() },
    { id: 'action_flip', name: 'Flip Chess Board (F)', category: 'Actions', icon: <Shuffle size={15} />, action: () => flipBoard() },
    { id: 'sound_toggle', name: `Toggle Sound Effects (${soundEnabled ? 'Disable' : 'Enable'})`, category: 'Settings', icon: <Volume2 size={15} />, action: () => setSoundEnabled(!soundEnabled) },
    { id: 'theme_walnut', name: 'Board Theme: Classic Walnut', category: 'Themes', icon: <Palette size={15} />, action: () => setBoardTheme('walnut') },
    { id: 'theme_green', name: 'Board Theme: Tournament Green', category: 'Themes', icon: <Palette size={15} />, action: () => setBoardTheme('green') },
    { id: 'theme_slate', name: 'Board Theme: Midnight Slate', category: 'Themes', icon: <Palette size={15} />, action: () => setBoardTheme('slate') },
    { id: 'nav_puzzles', name: 'Open Puzzle Trainer', category: 'Navigation', icon: <Target size={15} />, action: () => onNavigate('puzzles') },
    { id: 'nav_learn', name: 'Open Learn Chess Section', category: 'Navigation', icon: <HelpCircle size={15} />, action: () => onNavigate('learn') }
  ];

  // Filter commands by search term
  const filtered = COMMANDS.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard traversal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.paletteCard} className="panel-card" onClick={e => e.stopPropagation()}>
        
        {/* Search header */}
        <div style={styles.searchHeader}>
          <Search size={18} style={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or setting..."
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
            style={styles.searchInput}
          />
          <span style={styles.escBadge}>ESC</span>
        </div>

        {/* Results grid */}
        <div style={styles.resultsList} className="scroll-panel">
          {filtered.length > 0 ? (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => { cmd.action(); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    ...styles.commandItem,
                    backgroundColor: isSelected ? 'var(--color-bg-elevated)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
                  }}
                >
                  <div style={styles.cmdIconWrapper(isSelected)}>
                    {cmd.icon}
                  </div>
                  <div style={styles.cmdMeta}>
                    <span style={styles.cmdName(isSelected)}>{cmd.name}</span>
                    <span style={styles.cmdCategory}>{cmd.category}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.emptyState}>No matching commands found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(3px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '100px',
  },
  paletteCard: {
    width: '100%',
    maxWidth: '520px',
    borderRadius: '8px',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-bright)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  searchHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 18px',
    borderBottom: '1px solid var(--color-border-subtle)',
    gap: '12px',
  },
  searchIcon: {
    color: 'var(--color-text-dim)',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    background: 'none',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
  },
  escBadge: {
    fontSize: '9px',
    padding: '3px 6px',
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    color: 'var(--color-text-dim)',
    fontWeight: '700',
  },
  resultsList: {
    maxHeight: '280px',
    padding: '8px',
  },
  commandItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.1s ease',
  },
  cmdIconWrapper: (selected) => ({
    color: selected ? 'var(--color-brand-primary)' : 'var(--color-text-dim)',
    display: 'flex',
    alignItems: 'center',
  }),
  cmdMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  cmdName: (selected) => ({
    fontSize: '13px',
    fontWeight: '500',
    color: selected ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
  }),
  cmdCategory: {
    fontSize: '10px',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  emptyState: {
    textAlign: 'center',
    padding: '30px 20px',
    color: 'var(--color-text-dim)',
    fontSize: '13px',
  }
};
