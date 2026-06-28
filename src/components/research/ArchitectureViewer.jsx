import React from 'react';
import { BookOpen, Code, Terminal, FileCode, Layers } from 'lucide-react';

export default function ArchitectureViewer() {
  const docs = [
    { title: 'Negamax Formulation', complexity: 'O(b^d)', file: 'src/engine/minimax.js', desc: 'Symmetric Minimax search formulation evaluating positions cleanly from the active side viewpoint.' },
    { title: 'Alpha-Beta Pruning', complexity: 'O(b^(d/2))', file: 'src/engine/minimax.js', desc: 'Prunes branches once guaranteed cutoff scores exceed alpha-beta bounds.' },
    { title: 'Move Ordering (MVV-LVA)', complexity: 'O(N log N)', file: 'src/engine/minimax.js', desc: 'Sorts captures by Most Valuable Victim minus Least Valuable Aggressor before searching.' },
    { title: 'Killer Moves Heuristic', complexity: 'O(1)', file: 'src/engine/minimax.js', desc: 'Stores non-capture moves that caused beta cutoffs in sister nodes for priority ordering.' },
    { title: 'Zobrist Hashing & Transposition Table', complexity: 'O(1) lookup', file: 'src/engine/minimax.js', desc: '64-bit random XOR hash mapping board state to cached search results and depth bounds.' },
    { title: 'Quiescence Extension', complexity: 'Variable', file: 'src/engine/minimax.js', desc: 'Extends search at maximum depth for capture sequences to prevent horizon blunders.' }
  ];

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <h2 style={styles.title}>Kronos Engine Architecture & Technical Internals</h2>
        <p style={styles.sub}>Contributor documentation detailing search algorithms, evaluation heuristics, and file mappings.</p>
      </div>

      <div style={styles.grid}>
        {docs.map((d, idx) => (
          <div key={idx} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>{d.title}</span>
              <span style={styles.compBadge}>{d.complexity}</span>
            </div>
            <p style={styles.desc}>{d.desc}</p>
            <div style={styles.fileBox}>
              <FileCode size={13} color="#d4af37" />
              <code>{d.file}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  header: {
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)'
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--color-text-primary, #fffff0)',
    margin: 0
  },
  sub: {
    fontSize: '0.825rem',
    color: 'var(--color-text-secondary, #bdaea4)',
    margin: '0.2rem 0 0 0'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem'
  },
  card: {
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    justify: 'space-between'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.6rem'
  },
  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: 800,
    color: '#fffff0'
  },
  compBadge: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: '#34D399',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid rgba(52, 211, 153, 0.2)'
  },
  desc: {
    fontSize: '0.825rem',
    color: '#bdaea4',
    lineHeight: 1.4,
    marginBottom: '1rem'
  },
  fileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'var(--color-bg-base, #15100c)',
    padding: '0.5rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    color: '#d4af37',
    border: '1px solid var(--color-border-subtle, #34281e)'
  }
};
