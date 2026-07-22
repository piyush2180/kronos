import React from 'react';
import { Chessboard } from 'react-chessboard';
import { Trophy, Star, RotateCcw, Lightbulb, CheckCircle2, ChevronRight, Play, Eye, Filter } from 'lucide-react';
import { colors, spacing, geometry } from '../../theme/designTokens';

export default function PuzzleMobile({
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
}) {
  return (
    <div style={styles.mobileContainer} className="animate-fade-in">
      {/* Top Session Stats */}
      <div style={styles.statRowMobile}>
        <div style={styles.statBadgeMobile}>
          <Trophy size={13} color="var(--color-brand-primary)" />
          <span>Session: {sessionCount}</span>
        </div>
        <div style={styles.statBadgeMobile}>
          <Star size={13} color="var(--color-brand-primary)" />
          <span>Total Solved: {solvedIds.length}</span>
        </div>
      </div>

      {/* 1. Puzzle Title & Info Header */}
      <div style={styles.infoCardMobile}>
        <div style={styles.infoTitleRowMobile}>
          <span style={styles.infoSubMobile}>Puzzle {currentIndex + 1} of {filteredPuzzles.length}</span>
          <span style={styles.ratingBadgeMobile}>Elo {activePuzzle.rating}</span>
        </div>
        <div style={styles.puzzleTitleMobile}>{activePuzzle.title}</div>
      </div>

      {/* 2. Board (95% Width Centered) */}
      <div style={styles.boardMobileContainer}>
        <div style={styles.boardCardMobile}>
          <Chessboard
            options={{
              id: 'PuzzleBoardMobile',
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
      </div>

      {/* Status Alert Messages */}
      {status !== 'idle' && (
        <div style={{
          ...styles.statusAlertMobile,
          backgroundColor: status === 'wrong' ? 'rgba(196, 93, 93, 0.1)' : 'rgba(75, 175, 122, 0.1)',
          borderColor: status === 'wrong' ? 'rgba(196, 93, 93, 0.3)' : 'rgba(75, 175, 122, 0.3)',
          color: status === 'wrong' ? colors.danger : colors.success,
        }}>
          {status === 'correct_partial' && 'Correct move! Keep calculating...'}
          {status === 'correct_complete' && 'Brilliant! Puzzle solved!'}
          {status === 'wrong' && 'Incorrect. Try again!'}
          {status === 'revealed' && `Solution: ${sanSolution.join(' → ')}`}
        </div>
      )}

      {showHintMsg && (
        <div style={styles.hintAlertMobile}>
          <Lightbulb size={14} color="var(--color-brand-primary)" />
          <span>{activePuzzle.hint}</span>
        </div>
      )}

      {/* 3. Action Buttons (Reset, Hint, Solution, Next) */}
      <div style={styles.actionGridMobile}>
        <button onClick={handleReset} style={styles.actionBtnMobile}>
          <RotateCcw size={14} /> Reset
        </button>
        <button onClick={handleHint} style={styles.actionBtnMobile}>
          <Lightbulb size={14} /> Hint
        </button>
        <button onClick={handleReveal} style={styles.actionBtnMobile}>
          <Eye size={14} /> Solution
        </button>
        <button onClick={handleNext} style={styles.nextBtnMobile}>
          <Play size={14} /> Next
        </button>
      </div>

      {/* 4. Rating Band Selector */}
      <div style={styles.cardMobile}>
        <div style={styles.cardHeaderMobile}>Rating Band</div>
        <div style={styles.chipsScrollRow}>
          {RATING_BANDS.map(band => (
            <button
              key={band.value}
              onClick={() => setSelectedRange(band.label)}
              style={{
                ...styles.chipBtn,
                backgroundColor: selectedRange === band.label ? 'rgba(212, 175, 55, 0.15)' : 'var(--color-bg-elevated)',
                borderColor: selectedRange === band.label ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)',
                color: selectedRange === band.label ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              }}
            >
              {band.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Filter Chips (Horizontally Scrollable) */}
      <div style={styles.cardMobile}>
        <div style={styles.cardHeaderMobile}>Theme Filters</div>
        <div style={styles.chipsScrollRow}>
          {availableThemes.map(theme => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(theme)}
              style={{
                ...styles.chipBtn,
                backgroundColor: selectedTheme === theme ? 'rgba(212, 175, 55, 0.15)' : 'var(--color-bg-elevated)',
                borderColor: selectedTheme === theme ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)',
                color: selectedTheme === theme ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              }}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Puzzle Bank Bottom List */}
      <div style={styles.cardMobile}>
        <div style={styles.cardHeaderMobile}>Puzzle Bank ({filteredPuzzles.length})</div>
        <div style={styles.puzzleListMobile}>
          {paginatedPuzzles.map(p => {
            const isSelected = activePuzzle && activePuzzle.id === p.id;
            const isSolved = solvedIds.includes(p.id);

            return (
              <div
                key={p.id}
                onClick={() => handleSelectPuzzle(p)}
                style={{
                  ...styles.puzzleItemMobile,
                  backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                  borderColor: isSelected ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)',
                }}
              >
                <div style={styles.puzzleItemInfoMobile}>
                  <div style={styles.puzzleItemTitleMobile}>
                    {p.title}
                    {isSolved && <CheckCircle2 size={13} color="#34D399" style={{ marginLeft: '6px' }} />}
                  </div>
                  <div style={styles.puzzleItemSubMobile}>Elo {p.rating} • {p.sideToMove}</div>
                </div>
                <ChevronRight size={14} color="var(--color-text-dim)" />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

const styles = {
  mobileContainer: {
    width: '100%',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxSizing: 'border-box',
  },
  statRowMobile: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'space-between',
  },
  statBadgeMobile: {
    flex: 1,
    height: '36px',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  infoCardMobile: {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '10px',
    padding: '12px 14px',
  },
  infoTitleRowMobile: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  infoSubMobile: {
    fontSize: '11px',
    color: 'var(--color-text-dim)',
    fontWeight: '700',
  },
  ratingBadgeMobile: {
    fontSize: '10px',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
    backgroundColor: 'rgba(200, 159, 61, 0.1)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  puzzleTitleMobile: {
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
  },
  boardMobileContainer: {
    width: '95%',
    maxWidth: '420px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
  },
  boardCardMobile: {
    width: '100%',
    aspectRatio: '1',
    backgroundColor: '#171311',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  statusAlertMobile: {
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    border: '1px solid',
    textAlign: 'center',
  },
  hintAlertMobile: {
    padding: '10px 14px',
    backgroundColor: 'rgba(200, 159, 61, 0.08)',
    border: '1px solid rgba(200, 159, 61, 0.25)',
    borderRadius: '8px',
    fontSize: '13px',
    color: 'var(--color-brand-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  actionGridMobile: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  actionBtnMobile: {
    height: '40px',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '8px',
    color: 'var(--color-text-primary)',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    cursor: 'pointer',
  },
  nextBtnMobile: {
    height: '40px',
    backgroundColor: 'var(--color-brand-primary)',
    border: 'none',
    borderRadius: '8px',
    color: '#15100c',
    fontSize: '12px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    cursor: 'pointer',
  },
  cardMobile: {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  cardHeaderMobile: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  chipsScrollRow: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  chipBtn: {
    height: '34px',
    padding: '0 12px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    cursor: 'pointer',
  },
  puzzleListMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '260px',
    overflowY: 'auto',
  },
  puzzleItemMobile: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  puzzleItemInfoMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  puzzleItemTitleMobile: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
  },
  puzzleItemSubMobile: {
    fontSize: '11px',
    color: 'var(--color-text-dim)',
  },
};
