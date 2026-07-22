import React from 'react';
import { Chessboard } from 'react-chessboard';
import { 
  ArrowLeft, Trophy, Star, Filter, RotateCcw, Lightbulb, CheckCircle2, ChevronRight, Play, Eye
} from 'lucide-react';
import { colors, spacing, geometry } from '../../theme/designTokens';

export default function PuzzleDesktop({
  onBack,
  sessionCount,
  solvedIds,
  currentIndex,
  filteredPuzzles,
  activePuzzle,
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
  selectedRange,
  setSelectedRange,
  RATING_BANDS,
  selectedTheme,
  setSelectedTheme,
  availableThemes,
  paginatedPuzzles,
  currentPage,
  totalPages,
  setCurrentPage,
  handleSelectPuzzle,
}) {
  return (
    <div style={styles.container} className="puzzles-wrapper animate-fade-in">
      
      {/* Header bar */}
      <div style={styles.header} className="puzzle-header">
        <div className="puzzle-hdr-left">
          <button onClick={onBack} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', borderRadius: geometry.radiusInteractive }}>
            <ArrowLeft size={13} /> Lobby
          </button>
          <div>
            <h2 className="heading-page" style={{ color: 'var(--color-brand-primary)', margin: 0 }}>Tactical Puzzle Trainer</h2>
            <p className="text-subtitle" style={{ margin: '0.1rem 0 0 0' }}>Solve real-game tactics step-by-step.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: spacing.sm }}>
          <div className="puzzle-stat-box" style={{ borderRadius: geometry.radiusInteractive }}>
            <Trophy size={14} color="var(--color-brand-primary)" />
            <span>Session: {sessionCount} solved</span>
          </div>
          <div className="puzzle-stat-box" style={{ borderRadius: geometry.radiusInteractive }}>
            <Star size={14} color="var(--color-brand-primary)" />
            <span>Total: {solvedIds.length} solved</span>
          </div>
        </div>
      </div>

      <div style={styles.splitGrid} className="puzzle-main-grid">
        
        {/* Left column: board & status */}
        <div style={styles.boardColumn} className="puzzle-board-col">
          
          {/* Puzzle Info Header */}
          <div className="puzzle-info-bar">
            <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                Puzzle {currentIndex + 1} of {filteredPuzzles.length}
                {activePuzzle.opening && ` • ${activePuzzle.opening}`}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-brand-primary)', marginTop: '1px' }}>{activePuzzle.title}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
              {activePuzzle.themes && activePuzzle.themes.slice(0, 1).map(theme => (
                <span key={theme} style={{ fontSize: '0.68rem', fontWeight: '700', padding: '2px 6px', backgroundColor: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.25)', color: 'var(--color-brand-primary)', borderRadius: '3px' }}>{theme}</span>
              ))}
              <span style={{ fontSize: '0.68rem', fontWeight: '600', padding: '2px 6px', backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-secondary)', borderRadius: '3px' }}>Elo: {activePuzzle.rating}</span>
            </div>
          </div>

          {/* Board */}
          <div style={{ width: '100%', maxWidth: 'min(62vh, 480px)', aspectRatio: '1', backgroundColor: '#171311', borderRadius: '12px', border: 'none', padding: 0 }} className="puzzle-board-card">
            <Chessboard
              options={{
                id: 'PuzzleBoardDesktop',
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
            <div style={{ width: '100%', maxWidth: '520px', padding: `${spacing.sm} ${spacing.md}`, borderRadius: geometry.radiusInteractive, fontSize: '0.8rem', fontWeight: '600', border: '1px solid', backgroundColor: status === 'wrong' ? 'rgba(196, 93, 93, 0.08)' : 'rgba(75, 175, 122, 0.08)', borderColor: status === 'wrong' ? 'rgba(196, 93, 93, 0.25)' : 'rgba(75, 175, 122, 0.25)', color: status === 'wrong' ? colors.danger : colors.success }}>
              {status === 'correct_partial' && 'Correct move! Keep calculating...'}
              {status === 'correct_complete' && 'Brilliant! Tactics solved successfully!'}
              {status === 'wrong' && 'Incorrect. Review the position and try again.'}
              {status === 'revealed' && `Solution line: ${sanSolution.join(' → ')}`}
            </div>
          )}

          {showHintMsg && (
            <div style={{ width: '100%', maxWidth: '520px', padding: `${spacing.sm} ${spacing.md}`, backgroundColor: 'rgba(200, 159, 61, 0.05)', border: '1px solid rgba(200, 159, 61, 0.15)', borderRadius: geometry.radiusInteractive, fontSize: '0.8rem', color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <Lightbulb size={14} />
              <span>{activePuzzle.hint}</span>
            </div>
          )}

          {/* Actions Row */}
          <div style={{ width: '100%', maxWidth: '520px', display: 'flex', gap: spacing.xs }}>
            <button onClick={handleReset} style={{ flex: 1, height: '34px', borderRadius: geometry.radiusInteractive }} className="btn-secondary">
              <RotateCcw size={12} /> Reset
            </button>
            <button 
              onClick={handleHint} 
              style={{ flex: 1, height: '34px', borderRadius: geometry.radiusInteractive }} 
              className="btn-secondary"
            >
              <Lightbulb size={12} /> Hint
            </button>
            <button 
              onClick={handleReveal} 
              style={{ flex: 1, height: '34px', borderRadius: geometry.radiusInteractive }} 
              className="btn-secondary"
            >
              <Eye size={12} /> Solution
            </button>
            <button 
              onClick={handleNext} 
              style={{ flex: 1, height: '34px', borderRadius: geometry.radiusInteractive }} 
              className="btn-primary"
            >
              <Play size={12} /> Next <ChevronRight size={12} />
            </button>
          </div>

        </div>

        {/* Right column: Filter & Puzzle Selector Bank */}
        <div style={styles.sidebarColumn} className="puzzle-sidebar-column">
          
          {/* Rating selector & theme filter panel */}
          <div className="card-primary" style={{ padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-brand-primary)' }}>
              <Filter size={13} />
              <span>Tactical Bank Filters</span>
            </div>

            {/* Rating Bands */}
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: '600', color: 'var(--color-text-dim)', marginBottom: '0.3rem', textTransform: 'capitalize' }}>Difficulty rating</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {RATING_BANDS.map(band => (
                  <button
                    key={band.value}
                    onClick={() => setSelectedRange(band.label)}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: '600',
                      padding: '3px 7px',
                      borderRadius: '4px',
                      border: '1px solid',
                      backgroundColor: selectedRange === band.label ? 'rgba(200, 159, 61, 0.15)' : 'var(--color-bg-base)',
                      borderColor: selectedRange === band.label ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)',
                      color: selectedRange === band.label ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {band.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tactical Themes */}
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: '600', color: 'var(--color-text-dim)', marginBottom: '0.3rem', textTransform: 'capitalize' }}>Tactical theme</div>
              <select
                value={selectedTheme}
                onChange={e => setSelectedTheme(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '4px',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-primary)',
                  outline: 'none'
                }}
              >
                {availableThemes.map(t => (
                  <option key={t} value={t}>{t === 'All' ? 'All Tactical Themes' : t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Paginated Puzzles List */}
          <div className="card-primary" style={{ flex: 1, padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>Puzzles ({filteredPuzzles.length})</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--color-text-dim)' }}>Page {currentPage} of {totalPages}</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '4px' }} className="scroll-panel">
              {paginatedPuzzles.map(p => {
                const isSelected = activePuzzle && activePuzzle.id === p.id;
                const isSolved = solvedIds.includes(p.id);

                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPuzzle(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '4px',
                      border: '1px solid',
                      backgroundColor: isSelected ? 'rgba(200, 159, 61, 0.12)' : 'var(--color-bg-surface)',
                      borderColor: isSelected ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-dim)', display: 'flex', gap: '6px', marginTop: '1px' }}>
                        <span>Elo {p.rating}</span>
                        <span>•</span>
                        <span style={{ textTransform: 'capitalize' }}>{p.sideToMove} to move</span>
                      </div>
                    </div>
                    {isSolved && <CheckCircle2 size={13} color="#4BAC7A" style={{ marginLeft: '6px', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                >
                  Prev
                </button>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
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
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    padding: `${spacing.lg} 0`
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottom: '1px solid var(--color-border-subtle)'
  },
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: spacing.xl,
    alignItems: 'start'
  },
  boardColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%'
  },
  sidebarColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md
  }
};
