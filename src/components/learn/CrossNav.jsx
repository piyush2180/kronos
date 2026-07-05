import React from 'react';
import { Play, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CrossNav({ title = "Explore in Benchmark Workspace" }) {
  const navigateTo = (target) => {
    window.location.hash = `#/research?view=${target}`;
  };

  return (
    <div className="card-secondary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0.85rem 1.15rem', borderColor: 'rgba(139, 115, 85, 0.2)' }}>
      <div>
        <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#8D837A', textTransform: 'capitalize' }}>Workstation Shortcuts</span>
        <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#F4F1EA' }}>{title}</div>
      </div>
      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <button className="btn-ghost" style={{ fontSize: '0.75rem', color: '#B7AEA5' }} onClick={() => navigateTo('runner')}>
          <Play size={13} color="#8D837A" /> Run Benchmark
        </button>
        <button className="btn-ghost" style={{ fontSize: '0.75rem', color: '#B7AEA5' }} onClick={() => navigateTo('validation')}>
          <ShieldCheck size={13} color="#4BAF7A" /> Inspect Validation
        </button>
        <button className="btn-primary" style={{ fontSize: '0.75rem' }} onClick={() => navigateTo('dashboard')}>
          Open Workspace <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
