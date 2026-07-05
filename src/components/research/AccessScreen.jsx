import React, { useState, useEffect } from 'react';
import { Cpu, ArrowRight, Lock, Terminal, CheckCircle2 } from 'lucide-react';

export default function AccessScreen({ onEnter }) {
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeUser, setActiveUser] = useState('Guest');
  const [correctPassword, setCorrectPassword] = useState('');

  // Retrieve active user and correct password from LocalStorage on mount
  useEffect(() => {
    try {
      const user = localStorage.getItem('kronos_v2_active_user') || 'Guest';
      setActiveUser(user);

      if (user === 'Guest') {
        // If guest, allow any password or a default
        setCorrectPassword('');
      } else {
        const db = JSON.parse(localStorage.getItem('kronos_v2_users') || '{}');
        const userDetails = db[user];
        if (userDetails) {
          setCorrectPassword(userDetails.password);
        }
      }
    } catch (e) {
      console.warn('Failed to retrieve user authentication details', e);
    }
  }, []);

  const handleAuthenticate = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsAuthenticating(false);
      // Verify against user password
      if (activeUser !== 'Guest' && password !== correctPassword) {
        setErrorMsg('Invalid password. Please enter the correct password for your account.');
      } else {
        onEnter();
      }
    }, 600);
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      
      {/* Left Panel: Branding Details */}
      <div style={styles.brandPanel} className="desktop-only">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C89F3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '56px', height: '56px', marginBottom: '20px' }}>
          <circle cx="12" cy="6" r="3" fill="#C89F3D" />
          <path d="M12 9a5 5 0 0 0-5 5v3h10v-3a5 5 0 0 0-5-5z" fill="#C89F3D" />
          <rect x="5" y="19" width="14" height="2" rx="1" fill="#C89F3D" />
        </svg>
        
        <h1 style={styles.title}>Benchmark Workspace</h1>
        <p style={styles.subtitle}>
          Local build environment for engine calibration, search telemetry, and automated tournament runs.
        </p>

        {/* Status Indicators */}
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
              Connected
            </span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Benchmark Engine</span>
            <span style={styles.statusValue}>Kronos D6 Suite</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Workspace Password Form */}
      <div style={styles.formPanel}>
        <div style={styles.formWidthWrapper}>
          
          {/* Mobile Branding Indicator */}
          <div style={styles.mobileLogoHeader} className="mobile-only">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C89F3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '40px', height: '40px', marginBottom: '12px', marginInline: 'auto', display: 'block' }}>
              <circle cx="12" cy="6" r="3" fill="#C89F3D" />
              <path d="M12 9a5 5 0 0 0-5 5v3h10v-3a5 5 0 0 0-5-5z" fill="#C89F3D" />
              <rect x="5" y="19" width="14" height="2" rx="1" fill="#C89F3D" />
            </svg>
            <div style={styles.logoText}>Benchmark Workspace</div>
            <div style={styles.logoSubtitle}>Workspace Lock</div>
          </div>

          <div style={styles.headerBadge}>
            <Lock size={12} color="var(--color-brand-primary)" />
            <span>Maintainer Session Authentication</span>
          </div>

          <form onSubmit={handleAuthenticate} style={styles.authForm}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>
                {activeUser === 'Guest' ? 'Guest Authentication' : `Password for ${activeUser}`}
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={activeUser === 'Guest' ? "Password (leave blank for Guest)..." : "Enter account password..."}
                className="input-field"
                style={{ width: '100%' }}
                disabled={isAuthenticating}
                required={activeUser !== 'Guest'}
              />
            </div>

            {errorMsg && (
              <div style={styles.errorText}>{errorMsg}</div>
            )}

            <button 
              type="submit" 
              className="btn-primary"
              style={{ width: '100%' }} 
              disabled={isAuthenticating}
            >
              <span>{isAuthenticating ? 'Unlocking Workspace...' : 'Authenticate Session'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <div style={styles.disclaimerBox}>
            <Terminal size={12} color="var(--color-text-dim)" />
            <span>Workstation session is authenticated locally against local storage credentials.</span>
          </div>
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
    backgroundColor: 'var(--color-bg-base)'
  },
  brandPanel: {
    flex: 1.2,
    backgroundColor: 'var(--color-bg-surface)',
    borderRight: '1px solid var(--color-border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    textAlign: 'center',
  },
  formPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    backgroundColor: 'var(--color-bg-base)'
  },
  formWidthWrapper: {
    width: '100%',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  mobileLogoHeader: {
    textAlign: 'center',
    marginBottom: '20px',
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
    alignSelf: 'flex-start'
  },
  title: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: 'var(--color-text-primary)',
    margin: '0 0 6px 0',
    fontFamily: 'var(--font-display)',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
    letterSpacing: '0.05em',
  },
  logoSubtitle: {
    fontSize: '11px',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginTop: '4px',
  },
  subtitle: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
    marginBottom: '24px',
    textAlign: 'center',
    maxWidth: '360px'
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    width: '100%',
    maxWidth: '360px',
    marginBottom: '20px'
  },
  statusItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
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
    backgroundColor: 'var(--color-bg-surface)',
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
  disclaimerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    padding: '8px 12px',
    fontSize: '0.7rem',
    color: 'var(--color-text-dim)',
    textAlign: 'left',
    width: '100%'
  },
  errorText: {
    fontSize: '0.72rem',
    color: 'var(--color-danger)',
    fontWeight: 600,
    textAlign: 'left'
  }
};
