import React, { useState } from 'react';
import CrossNav from './CrossNav';

export default function EngineArchitecture({ onSelectSource }) {
  const [selectedBlock, setSelectedBlock] = useState('worker');

  const blocks = {
    ui: {
      name: 'React Application UI',
      sub: 'App.jsx / PlayPage.jsx',
      simpleNote: 'The visual screen you see and interact with. It draws the board, listens to clicks, and displays evaluation bars.',
      desc: 'Renders chessboard views, user controls, and live telemetry streams.',
      role: 'Captures player inputs, dispatches moves to game hook, and displays search evaluations.'
    },
    controller: {
      name: 'Game Controller Hook',
      sub: 'useChessGame.js',
      simpleNote: 'The match manager. Keeps track of who is to move, active timers, match history, and coordinates with the AI worker thread.',
      desc: 'Orchestrates match state, clocks, move histories, and AI search calls.',
      role: 'Maintains state persistence in localStorage and manages asynchronous Web Worker communication.'
    },
    worker: {
      name: 'Engine Web Worker Thread',
      sub: 'stockfishWorker.js',
      simpleNote: 'Runs heavy engine calculations in a separate background thread so your web browser screen never freezes.',
      desc: 'Executes heavy iterative search off the main UI thread.',
      role: 'Prevents browser UI freezing by running minimax and alpha-beta search asynchronously in background Web Worker threads.'
    },
    search: {
      name: 'Search Engine Core',
      sub: 'minimax.js / quiescence.js',
      simpleNote: 'The brain of Kronos. Explores millions of future move combinations using Alpha-Beta pruning to pick the best move.',
      desc: 'Evaluates move decision trees using Alpha-Beta pruning & Move Ordering.',
      role: 'Executes recursive tree traversal, TT lookups, killer move heuristic checks, and quiescence extensions.'
    },
    eval: {
      name: 'Evaluation Function',
      sub: 'evaluation.js',
      simpleNote: 'Scores any board position in points (centipawns). Adds up piece values plus positional square bonuses.',
      desc: 'Calculates static position scores in centipawns.',
      role: 'Combines material balance weights with dynamic Piece-Square Tables (PST) for midgame and endgame positional evaluation.'
    },
    movegen: {
      name: 'Move Generator & Ordering',
      sub: 'moveOrdering.js / killerMoves.js',
      simpleNote: 'Generates all possible moves and sorts captures first to help the engine calculate much faster.',
      desc: 'Generates pseudo-legal moves and ranks captures via MVV-LVA.',
      role: 'Prioritizes high-value captures and killer moves to maximize alpha-beta pruning cutoffs.'
    },
    chessjs: {
      name: 'Chess.js Rules Engine',
      sub: 'chess.js npm dependency',
      simpleNote: 'The referee. Enforces standard FIDE chess rules, checks, and checkmates.',
      desc: 'Enforces official FIDE chess rules and board state validation.',
      role: 'Validates move legality, detects check/checkmate/draws, and updates FEN strings.'
    }
  };

  const curr = blocks[selectedBlock];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#F4F1EA', margin: 0 }}>Engine Architecture Viewer</h2>
        <p style={{ fontSize: '0.85rem', color: '#B7AEA5', margin: '0.2rem 0 0 0' }}>Interactive subsystem dependency graph explaining how Kronos modules connect and pass data.</p>
      </div>

      {/* Interactive Subsystem Graph */}
      <div className="card-primary" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderColor: 'rgba(139, 115, 85, 0.2)' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#8D837A', textTransform: 'capitalize' }}>Subsystem Dependency Graph (Click to Inspect)</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>
          {Object.entries(blocks).map(([key, item], idx) => (
            <React.Fragment key={key}>
              <button
                onClick={() => setSelectedBlock(key)}
                className={selectedBlock === key ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.8rem', padding: '0.65rem 0.9rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.1rem' }}
              >
                <span>{item.name}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{item.sub}</span>
              </button>
              {idx < Object.keys(blocks).length - 1 && (
                <span style={{ color: '#8D837A', fontWeight: 'bold', fontSize: '0.9rem' }}>➔</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Selected Component Details */}
      <div className="card-secondary" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderColor: 'rgba(139, 115, 85, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(139, 115, 85, 0.2)', paddingBottom: '0.6rem' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#4BAF7A', textTransform: 'capitalize' }}>Inspected Subsystem</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#F4F1EA', margin: '0.1rem 0' }}>{curr.name}</h3>
          </div>
          <button 
            className="btn-ghost" 
            style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#4BAF7A', backgroundColor: 'rgba(75, 175, 122, 0.1)' }}
            onClick={() => onSelectSource && onSelectSource(curr.sub)}
          >
            File: {curr.sub} ↗
          </button>
        </div>

        <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#d4af37', textTransform: 'uppercase' }}>In Simple Terms</span>
          <p style={{ fontSize: '0.85rem', color: '#B7AEA5', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>{curr.simpleNote}</p>
        </div>

        <p style={{ fontSize: '0.88rem', color: '#B7AEA5', margin: 0 }}>{curr.desc}</p>
        <div style={{ backgroundColor: 'var(--color-bg-base)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.825rem', color: '#F4F1EA', border: '1px solid rgba(139, 115, 85, 0.2)' }}>
          <strong style={{ color: '#8D837A' }}>Core Responsibility: </strong>{curr.role}
        </div>
      </div>

      <CrossNav title="View system telemetry in Metadata Inspector" />
    </div>
  );
}
