import React, { useState, useRef } from 'react';
import { Search, Filter, Eye, Download, Trash2, Upload, FileText } from 'lucide-react';
import EmptyState from './EmptyState';
import { BenchmarkDataService } from '../../services/benchmarkService';

export default function ResearchArchive({ experiments = [], onInspect, onDelete, onImportJson }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCert, setFilterCert] = useState('ALL');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && onImportJson) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImportJson(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleExport = (exp) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(BenchmarkDataService.exportExperimentAsJson(exp));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${exp.id}_summary.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (experiments.length === 0) {
    return (
      <div style={styles.container}>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".json" 
          onChange={handleFileUpload} 
        />
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Research Archive Index</h2>
            <p style={styles.sub}>Empirical datasets loaded dynamically from benchmark artifact folders.</p>
          </div>
          <button style={styles.importBtn} onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} /> Import Benchmark Summary (JSON)
          </button>
        </div>
        <EmptyState title="No benchmark datasets available yet." message="Run a tournament benchmark or import a summary JSON artifact." />
      </div>
    );
  }

  const filtered = experiments.filter(exp => {
    const matchesSearch = exp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          exp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCert = filterCert === 'ALL' || exp.certification === filterCert;
    return matchesSearch && matchesCert;
  });

  return (
    <div style={styles.container} className="animate-fade-in">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".json" 
        onChange={handleFileUpload} 
      />
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Research Archive Index</h2>
          <p style={styles.sub}>Empirical datasets loaded dynamically from benchmark artifact folders.</p>
        </div>
        <button style={styles.importBtn} onClick={() => fileInputRef.current?.click()}>
          <Upload size={14} /> Import Benchmark Summary (JSON)
        </button>
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
                <td style={styles.tdHighlight}>{Number(exp.stats.scorePct).toFixed(1)}%</td>
                <td style={styles.td}>
                  <span style={styles.certBadge(exp.certification)}>{exp.certification}</span>
                </td>
                <td style={styles.td}>
                  <div style={styles.btnRow}>
                    <button style={styles.iconBtn} onClick={() => onInspect(exp)} title="Inspect Experiment">
                      <Eye size={14} color="#d4af37" />
                    </button>
                    <button style={styles.iconBtn} onClick={() => handleExport(exp)} title="Export Summary JSON">
                      <Download size={14} color="#34D399" />
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  importBtn: {
    backgroundColor: 'var(--color-bg-surface, #1e1712)',
    color: '#d4af37',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '5px',
    padding: '0.5rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
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
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border-subtle, #34281e)',
    borderRadius: '4px',
    padding: '0.4rem 0.6rem',
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
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border-subtle, #34281e)',
    borderRadius: '4px',
    padding: '0.4rem 0.6rem'
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
    borderTop: '1px solid var(--color-border-subtle, #34281e)',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)',
    overflow: 'hidden',
    marginTop: '0.5rem'
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
