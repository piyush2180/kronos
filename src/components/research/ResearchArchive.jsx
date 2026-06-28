import React, { useState } from 'react';
import { Search, Filter, Eye, Download, Trash2, Copy, FileText } from 'lucide-react';
import EmptyState from './EmptyState';

export default function ResearchArchive({ experiments = [], onInspect, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCert, setFilterCert] = useState('ALL');

  if (experiments.length === 0) {
    return <EmptyState title="Research Archive Empty" message="No generated benchmark experiment packages found in benchmark/output/." />;
  }

  const filtered = experiments.filter(exp => {
    const matchesSearch = exp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          exp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCert = filterCert === 'ALL' || exp.certification === filterCert;
    return matchesSearch && matchesCert;
  });

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Research Archive Index</h2>
          <p style={styles.sub}>Empirical datasets loaded dynamically from benchmark artifact folders.</p>
        </div>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={14} color="#7a6a5f" />
          <input 
            type="text" 
            placeholder="Search experiments by name or ID..." 
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={styles.filterBox}>
          <Filter size={14} color="#7a6a5f" />
          <select 
            style={styles.select}
            value={filterCert}
            onChange={(e) => setFilterCert(e.target.value)}
          >
            <option value="ALL">All Certification Statuses</option>
            <option value="RESEARCH READY">RESEARCH READY Only</option>
            <option value="NOT VALID FOR PUBLICATION">NOT VALID Only</option>
          </select>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Package ID / Name</th>
              <th style={styles.th}>Engine Pair</th>
              <th style={styles.th}>Games</th>
              <th style={styles.th}>Depth</th>
              <th style={styles.th}>Score %</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((exp) => (
              <tr key={exp.id} style={styles.tr}>
                <td style={styles.tdBold}>
                  {exp.name}
                  <div style={styles.idCode}>{exp.id}</div>
                </td>
                <td style={styles.td}>{exp.engineA} vs {exp.engineB}</td>
                <td style={styles.td}>{exp.games}</td>
                <td style={styles.td}>D{exp.depth}</td>
                <td style={styles.tdHighlight}>{exp.stats.scorePct}%</td>
                <td style={styles.td}>
                  <span style={styles.certBadge(exp.certification)}>{exp.certification}</span>
                </td>
                <td style={styles.td}>
                  <div style={styles.btnRow}>
                    <button style={styles.iconBtn} onClick={() => onInspect(exp)} title="Inspect Experiment">
                      <Eye size={14} color="#d4af37" />
                    </button>
                    {onDelete && (
                      <button style={styles.iconBtn} onClick={() => onDelete(exp.id)} title="Delete Package">
                        <Trash2 size={14} color="#f56565" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
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
  toolbar: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'space-between'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    flex: 1
  },
  searchInput: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fffff0',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%'
  },
  filterBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem'
  },
  select: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#bdaea4',
    fontSize: '0.825rem',
    outline: 'none',
    cursor: 'pointer'
  },
  tableWrapper: {
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.825rem'
  },
  th: {
    backgroundColor: 'var(--color-bg-base, #15100c)',
    color: 'var(--color-text-dim, #7a6a5f)',
    padding: '0.75rem 1rem',
    fontWeight: 600,
    borderBottom: '1px solid var(--color-border-subtle, #34281e)'
  },
  tr: {
    borderBottom: '1px solid var(--color-border-subtle, #34281e)'
  },
  td: {
    padding: '0.85rem 1rem',
    color: '#bdaea4'
  },
  tdBold: {
    padding: '0.85rem 1rem',
    color: '#fffff0',
    fontWeight: 700
  },
  idCode: {
    fontSize: '0.7rem',
    color: '#7a6a5f',
    fontFamily: 'monospace',
    fontWeight: 400
  },
  tdHighlight: {
    padding: '0.85rem 1rem',
    color: '#34D399',
    fontWeight: 700
  },
  certBadge: (cert) => ({
    padding: '0.2rem 0.45rem',
    borderRadius: '4px',
    fontSize: '0.68rem',
    fontWeight: 700,
    backgroundColor: cert === 'RESEARCH READY' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    color: cert === 'RESEARCH READY' ? '#34D399' : '#FCA5A5'
  }),
  btnRow: {
    display: 'flex',
    gap: '0.4rem'
  },
  iconBtn: {
    backgroundColor: 'var(--color-bg-elevated, #2d231b)',
    border: '1px solid var(--color-border-subtle, #34281e)',
    borderRadius: '4px',
    padding: '0.35rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  }
};
