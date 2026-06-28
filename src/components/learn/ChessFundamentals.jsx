import React, { useState } from 'react';
import CrossNav from './CrossNav';

export default function ChessFundamentals() {
  const [selectedTopic, setSelectedTopic] = useState('board');

  const topics = {
    board: {
      title: 'The Chessboard & Coordinate System',
      desc: 'An 8x8 grid of alternating light and dark squares, identified by files (a-h) and ranks (1-8).',
      details: 'In Kronos, squares are indexed from 0 to 63 internally, mapping directly to FEN strings for O(1) square lookups.'
    },
    pieces: {
      title: 'Piece Values & Roles',
      desc: 'Pawns (1), Knights (3), Bishops (3), Rooks (5), Queens (9), and Kings (Infinite value).',
      details: 'Kronos uses standard centipawn material weights (Pawn: 100, Knight: 320, Bishop: 330, Rook: 500, Queen: 900) adjusted by dynamic Piece-Square Tables.'
    },
    legal: {
      title: 'Legal Moves & Pseudo-Legality',
      desc: 'Moves that obey piece movement rules and do not leave or place your King in check.',
      details: 'Kronos validates move generation via chess.js bitboards to quickly prune illegal moves before alpha-beta search evaluation.'
    },
    check: {
      title: 'Check, Checkmate & Stalemate',
      desc: 'Check is a direct attack on the King. Checkmate is check with no escape. Stalemate is no legal moves while not in check.',
      details: 'Kronos evaluates Checkmate as mate scores (+M1, +M2) prioritized over standard material evaluations.'
    },
    castling: {
      title: 'Kingside & Queenside Castling',
      desc: 'A special double move placing the King behind a safe pawn shield while activating a Rook.',
      details: 'Castling rights are tracked as Zobrist bitwise flags (WK, WQ, BK, BQ) for persistent transposition indexing.'
    },
    enpassant: {
      title: 'En Passant Capture',
      desc: 'A pawn capturing an enemy pawn that jumped two squares on its initial move.',
      details: 'En passant target squares are tracked in FEN strings and checked dynamically during move generation.'
    },
    promotion: {
      title: 'Pawn Promotion',
      desc: 'When a pawn reaches the 8th rank, it transforms into a Queen, Rook, Bishop, or Knight.',
      details: 'Kronos evaluates promotion threats during search to anticipate endgame tactical explosions.'
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#F4F1EA', margin: 0 }}>Chess Fundamentals</h2>
        <p style={{ fontSize: '0.85rem', color: '#B7AEA5', margin: '0.2rem 0 0 0' }}>Core chess rules and how they are modeled inside the Kronos engine.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
        {Object.entries(topics).map(([key, item]) => (
          <div
            key={key}
            className={selectedTopic === key ? 'card-primary' : 'card-flat'}
            style={{ cursor: 'pointer', transition: 'all 0.15s ease', borderColor: selectedTopic === key ? 'rgba(212,175,55,0.4)' : 'rgba(139, 115, 85, 0.2)' }}
            onClick={() => setSelectedTopic(key)}
          >
            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: selectedTopic === key ? '#d4af37' : '#F4F1EA', margin: '0 0 0.3rem 0' }}>{item.title}</h4>
            <p style={{ fontSize: '0.78rem', color: '#B7AEA5', margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="card-primary" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem', borderColor: 'rgba(139, 115, 85, 0.2)' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#8D837A', textTransform: 'capitalize' }}>Engine Implementation Note</span>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F4F1EA', margin: 0 }}>{topics[selectedTopic].title}</h3>
        <p style={{ fontSize: '0.85rem', color: '#B7AEA5', lineHeight: 1.5, margin: 0 }}>{topics[selectedTopic].details}</p>
      </div>

      <CrossNav title="Test engine moves in Research Validation Suite" />
    </div>
  );
}
