import React, { useState } from 'react';
import { Cpu, ArrowRight, Lock, Terminal, CheckCircle2 } from 'lucide-react';
import { colors, spacing, geometry, typography } from '../../theme/designTokens';

export default function AccessScreen({ onEnter }) {
  const [sessionToken, setSessionToken] = useState('local-maintainer-key');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuthenticate = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setErrorMsg('');

    // Pluggable local authentication logic:
    // Future expansion point: Invoke API request to verify invites/tokens or check GitHub session
    setTimeout(() => {
      setIsAuthenticating(false);
      if (!sessionToken.trim()) {
        setErrorMsg('Authentication token cannot be blank.');
      } else {
        // Callback grants access to parent layout
        onEnter();
      }
    }, 600);
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={{ ...styles.card, border: '1px solid var(--color-border-subtle)', boxShadow: 'none' }} className="panel-card">
        
        {/* Status indicator row */}
        <div style={styles.headerBadge}>
          <Lock size={12} color="var(--color-brand-primary)" />
          <span>Internal Tools Build</span>
        </div>
        
        <h1 style={styles.title}>Benchmark Workspace</h1>
        <p style={styles.subtitle}>
          Local build environment for engine calibration, search telemetry, and automated tournament runs.
        </p>

        {/* Workspace Telemetry Checklist */}
        <div style={styles.statusGrid}>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Environment Build</span>
            <span style={styles.statusValue}>Maintainer Build</span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Access Clearance</span>
            <span style={styles.statusValue}>Developer Role</span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Local Diagnostics</span>
            <span style={styles.statusValueSuccess}>
              <CheckCircle2 size={12} /> Connected
            </span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Benchmark Engine</span>
            <span style={styles.statusValue}>Kronos D6 Suite</span>
          </div>
        </div>

        {/* Pluggable Access Form */}
        <form onSubmit={handleAuthenticate} style={styles.authForm}>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Maintainer Session Token</label>
            <input 
              type="text" 
              value={sessionToken}
              onChange={(e) => setSessionToken(e.target.value)}
              placeholder="Enter local developer key..."
              style={styles.textInput}
              disabled={isAuthenticating}
            />
          </div>

          {errorMsg && (
            <div style={styles.errorText}>{errorMsg}</div>
          )}

          <div style={styles.buttonRow}>
            <button 
              type="submit" 
              style={styles.enterBtn} 
              disabled={isAuthenticating}
            >
              <span>{isAuthenticating ? 'Authenticating...' : 'Authenticate Local Session'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>

        <div style={styles.dividerRow}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine}></span>
        </div>

        <button 
          style={styles.oauthBtn} 
          onClick={() => alert("GitHub Authentication requires remote server deployment. Under local session rules, use the local session key instead.")}
          type="button"
        >
          <Cpu size={14} />
          <span>Sign in with GitHub (Invite List Only)</span>
        </button>

        <div style={styles.disclaimerBox}>
          <Terminal size={12} color="var(--color-text-dim)" />
          <span>Local sessions are logged to the benchmark workspace repository automatically.</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: 'var(--color-bg-base)'
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: 'var(--color-bg-surface)',
    borderRadius: '6px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  headerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(200, 159, 61, 0.08)',
    color: 'var(--color-brand-primary)',
    border: '1px solid rgba(200, 159, 61, 0.2)',
    borderRadius: '4px',
    padding: '4px 10px',
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    marginBottom: '16px'
  },
  title: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: 'var(--color-text-primary)',
    margin: '0 0 6px 0',
    fontFamily: 'var(--font-display)',
  },
  subtitle: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
    marginBottom: '20px',
    textAlign: 'center',
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    width: '100%',
    marginBottom: '20px'
  },
  statusItem: {
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  statusLabel: {
    fontSize: '0.65rem',
    color: 'var(--color-text-dim)',
    fontWeight: 600,
    marginBottom: '3px'
  },
  statusValue: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--color-text-secondary)'
  },
  statusValueSuccess: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--color-success)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  authForm: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    width: '100%'
  },
  inputLabel: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  textInput: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    color: 'var(--color-text-primary)',
    fontSize: '0.8rem',
    outline: 'none',
    transition: 'border-color 0.15s ease'
  },
  enterBtn: {
    width: '100%',
    backgroundColor: 'var(--color-brand-primary)',
    color: '#15100c',
    border: 'none',
    borderRadius: '4px',
    padding: '10px',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.15s ease'
  },
  oauthBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    padding: '8px 10px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.15s ease'
  },
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: '10px',
    margin: '12px 0'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--color-border-subtle)'
  },
  dividerText: {
    fontSize: '0.7rem',
    color: 'var(--color-text-dim)'
  },
  disclaimerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '4px',
    padding: '8px 12px',
    fontSize: '0.7rem',
    color: 'var(--color-text-dim)',
    textAlign: 'left',
    marginTop: '16px',
    width: '100%'
  },
  errorText: {
    fontSize: '0.72rem',
    color: 'var(--color-danger)',
    fontWeight: 600,
    textAlign: 'left'
  }
};
