import React, { useState } from 'react';
import CrossNav from './CrossNav';

export default function ResearchMethodology({ onSelectSource }) {
  const [selectedStep, setSelectedStep] = useState('pipeline');

  const steps = {
    pipeline: {
      title: 'Automated Research Pipeline Manager',
      file: 'benchmark/pipelineManager.js',
      simpleNote: 'An automated conductor script. Runs overnight experiments, manages queues, handles crashes, and updates the research database automatically.',
      desc: 'Orchestrates 9-stage overnight benchmark executions without manual user intervention.',
      details: 'Schedules Family A, Family B, Stockfish Calibration, and Position Validation suites while handling error recovery and crash state persistence.'
    },
    opening: {
      title: 'Opening Suite Datasets',
      file: 'benchmark/openings/',
      simpleNote: 'A set of starting positions (like Italian Game or Sicilian Defense) so both engines play fair matches from diverse setups.',
      desc: 'Standardized opening position suites ensuring unbiased engine match evaluation.',
      details: 'Includes Italian Game, Sicilian Defense, French Defense, Queen\'s Gambit, and random FEN position sets.'
    },
    tournament: {
      title: 'Engine vs Engine Tournament Runner',
      file: 'benchmark/tournament.js',
      simpleNote: 'Plays hundreds of games between different engine versions to see which one plays better chess.',
      desc: 'Executes multithreaded head-to-head matches between engine iterations.',
      details: 'Calculates win/loss/draw scores, win percentages, and node search efficiency stats across thousands of moves.'
    },
    calibration: {
      title: 'Stockfish Elo Calibration & SPRT',
      file: 'benchmark/calibrateStockfish.js',
      simpleNote: 'Tests Kronos against world-class Stockfish engine levels to calculate real mathematical Elo ratings.',
      desc: 'Calibrates Kronos performance against reference Stockfish levels.',
      details: 'Uses Sequential Probability Ratio Testing (SPRT) and Ordo ranking algorithms to generate publishable Elo ratings.'
    },
    validation: {
      title: 'Tactical & Search Solution Validation',
      file: 'benchmark/testSearchValidation.js',
      simpleNote: 'A tactical exam paper! Tests whether Kronos can solve checkmates and tactic puzzles accurately.',
      desc: 'Verifies static search solution accuracy against tactical puzzle suites.',
      details: 'Checks back-rank mate combinations, forks, and pins at fixed depth 4 to ensure zero tactical regressions.'
    },
    reports: {
      title: 'JSON Reports, PGN Exports & Archive',
      file: 'benchmark/output/',
      simpleNote: 'Saves all match logs into JSON files with cryptographic verification hashes so research can be verified by anyone.',
      desc: 'Archives every experiment with cryptographic SHA256 reproducibility hashes.',
      details: 'Generates structured JSON dataset manifests and standard PGN match logs loaded dynamically by the Benchmark Workspace.'
    }
  };

  const curr = steps[selectedStep];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#F4F1EA', margin: 0 }}>Research Methodology</h2>
        <p style={{ fontSize: '0.85rem', color: '#B7AEA5', margin: '0.2rem 0 0 0' }}>Automated empirical research workflow orchestrating overnight benchmark execution, validation, and archiving.</p>
      </div>

      {/* Interactive Data Flow Pipeline */}
      <div className="card-primary" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderColor: 'rgba(139, 115, 85, 0.2)' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#8D837A', textTransform: 'capitalize' }}>Animated Data Flow Pipeline</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.6rem', padding: '0.5rem 0' }}>
          {Object.entries(steps).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setSelectedStep(key)}
              className={selectedStep === key ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.78rem', justifyContent: 'center', textAlign: 'center' }}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Stage Details */}
      <div className="card-secondary" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderColor: 'rgba(139, 115, 85, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(139, 115, 85, 0.2)', paddingBottom: '0.6rem' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#4BAF7A', textTransform: 'capitalize' }}>Stage Details</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#F4F1EA', margin: '0.1rem 0' }}>{curr.title}</h3>
          </div>
          <button 
            className="btn-ghost" 
            style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#4BAF7A', backgroundColor: 'rgba(75, 175, 122, 0.1)' }}
            onClick={() => onSelectSource && onSelectSource(curr.file)}
          >
            File: {curr.file} ↗
          </button>
        </div>

        <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#d4af37', textTransform: 'uppercase' }}>In Simple Terms</span>
          <p style={{ fontSize: '0.85rem', color: '#B7AEA5', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>{curr.simpleNote}</p>
        </div>

        <p style={{ fontSize: '0.88rem', color: '#B7AEA5', margin: 0 }}>{curr.desc}</p>
        <div style={{ backgroundColor: 'var(--color-bg-base)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.825rem', color: '#F4F1EA', border: '1px solid rgba(139, 115, 85, 0.2)' }}>
          <strong style={{ color: '#8D837A' }}>Execution Rationale: </strong>{curr.details}
        </div>
      </div>

      <CrossNav title="Compare experiment data in Research Archive" />
    </div>
  );
}
