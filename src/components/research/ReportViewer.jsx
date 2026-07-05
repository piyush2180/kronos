import React from 'react';
import { FileText, Download } from 'lucide-react';

export default function ReportViewer({ title = "Experiment Markdown Report", content = "" }) {
  const handleDownload = () => {
    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(content);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, '_')}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <FileText size={16} color="#d4af37" />
          <h3 style={styles.title}>{title}</h3>
        </div>
        <button style={styles.downloadBtn} onClick={handleDownload}>
          <Download size={13} /> Download .md
        </button>
      </div>

      <div style={styles.markdownBox}>
        <pre style={styles.pre}>{content || '# No report content loaded.\n\nVerify that report.md exists in the target experiment directory.'}</pre>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'var(--color-bg-surface, #221a14)',
    border: '1px solid var(--color-border-default, #4c3d31)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--color-border-subtle, #34281e)'
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  title: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#fffff0',
    margin: 0
  },
  downloadBtn: {
    backgroundColor: 'var(--color-bg-base, #15100c)',
    color: '#bdaea4',
    border: '1px solid var(--color-border-subtle, #34281e)',
    padding: '0.35rem 0.7rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },
  markdownBox: {
    backgroundColor: 'var(--color-bg-base, #15100c)',
    padding: '1.25rem',
    borderRadius: '6px',
    border: '1px solid var(--color-border-subtle, #34281e)',
    overflowX: 'auto'
  },
  pre: {
    margin: 0,
    fontFamily: 'monospace',
    fontSize: '0.825rem',
    color: '#E2E8F0',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap'
  }
};
