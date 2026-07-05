// Kronos Chess V2 — Authentication & Access Controller
// Supports Registration, Login, Forgot Password, and Guest Mode with clean split layout.

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Loader } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  
  // Forms state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Status states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear errors on tab toggle
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
  }, [isSignUp, isForgot]);

  // Persistent session auto-login check
  useEffect(() => {
    const active = localStorage.getItem('kronos_v2_active_user');
    if (active) {
      onAuthSuccess(active);
    }
  }, [onAuthSuccess]);

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      try {
        const db = JSON.parse(localStorage.getItem('kronos_v2_active_user_db') || '{}');
        const legacyDb = JSON.parse(localStorage.getItem('kronos_v2_users') || '{}');
        const mergedDb = { ...legacyDb, ...db };
        let foundUser = null;

        const target = username.toLowerCase();
        Object.keys(mergedDb).forEach((uKey) => {
          if (uKey.toLowerCase() === target || mergedDb[uKey].email.toLowerCase() === target) {
            foundUser = mergedDb[uKey];
          }
        });

        if (foundUser && foundUser.password === password) {
          localStorage.setItem('kronos_v2_active_user', foundUser.username);
          onAuthSuccess(foundUser.username);
        } else {
          // If no users exist, allow default local log in for onboarding
          if (Object.keys(mergedDb).length === 0 && username === 'developer' && password === 'developer') {
            const defaultUser = { username: 'developer', email: 'developer@kronos.local', password: 'developer' };
            const newDb = { 'developer': defaultUser };
            localStorage.setItem('kronos_v2_active_user_db', JSON.stringify(newDb));
            localStorage.setItem('kronos_v2_active_user', 'developer');
            onAuthSuccess('developer');
          } else {
            setErrorMsg('Invalid credentials. Check your username/password.');
          }
        }
      } catch (err) {
        setErrorMsg('Authentication error. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }
    if (username.length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }
    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      try {
        const db = JSON.parse(localStorage.getItem('kronos_v2_active_user_db') || '{}');
        const legacyDb = JSON.parse(localStorage.getItem('kronos_v2_users') || '{}');
        const mergedDb = { ...legacyDb, ...db };

        if (mergedDb[username]) {
          setErrorMsg('Username is already taken.');
          setLoading(false);
          return;
        }
        
        let emailTaken = false;
        Object.keys(mergedDb).forEach((key) => {
          if (mergedDb[key].email.toLowerCase() === email.toLowerCase()) {
            emailTaken = true;
          }
        });

        if (emailTaken) {
          setErrorMsg('Email is already registered.');
          setLoading(false);
          return;
        }

        // Save new user
        mergedDb[username] = { username, email, password };
        localStorage.setItem('kronos_v2_active_user_db', JSON.stringify(mergedDb));
        localStorage.setItem('kronos_v2_users', JSON.stringify(mergedDb));

        // Create empty profile
        const profile = {
          gamesPlayed: 0, wins: 0, losses: 0, draws: 0,
          favoriteOpening: 'None yet', averageMoves: 0, history: []
        };
        localStorage.setItem(`kronos_v2_profile_${username}`, JSON.stringify(profile));

        setSuccessMsg('Account registered successfully! Redirecting...');
        
        setTimeout(() => {
          localStorage.setItem('kronos_v2_active_user', username);
          onAuthSuccess(username);
        }, 1000);

      } catch (err) {
        setErrorMsg('Failed to register user.');
      } finally {
        setLoading(false);
      }
    }, 900);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!email || !validateEmail(email)) {
      setErrorMsg('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      try {
        const db = JSON.parse(localStorage.getItem('kronos_v2_active_user_db') || '{}');
        const legacyDb = JSON.parse(localStorage.getItem('kronos_v2_users') || '{}');
        const mergedDb = { ...legacyDb, ...db };
        let userKey = null;

        Object.keys(mergedDb).forEach((uKey) => {
          if (mergedDb[uKey].email.toLowerCase() === email.toLowerCase()) {
            userKey = uKey;
          }
        });

        if (userKey) {
          setSuccessMsg(`A password reset link has been dispatched to ${email}.`);
          setTimeout(() => {
            setIsForgot(false);
            setSuccessMsg('');
          }, 2500);
        } else {
          setErrorMsg('No account found with this email address.');
        }
      } catch (err) {
        setErrorMsg('Error searching credentials.');
      } finally {
        setLoading(false);
      }
    }, 700);
  };

  const handleGuestMode = () => {
    localStorage.setItem('kronos_v2_active_user', 'Guest');
    const guestProfileKey = 'kronos_v2_profile_Guest';
    if (!localStorage.getItem(guestProfileKey)) {
      localStorage.setItem(guestProfileKey, JSON.stringify({
        gamesPlayed: 0, wins: 0, losses: 0, draws: 0,
        favoriteOpening: 'None yet', averageMoves: 0, history: []
      }));
    }
    onAuthSuccess('Guest');
  };

  return (
    <div style={styles.authContainer} className="animate-fade-in">
      
      {/* Left Panel: Branding & Subtle Grid Background */}
      <div style={styles.brandPanel} className="desktop-only">
        {/* Subtle grid background */}
        <svg style={styles.svgBackground} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect width="60" height="60" fill="none" />
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>

        <div style={styles.brandContent}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C89F3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px', marginBottom: '24px' }}>
            <circle cx="12" cy="6" r="3" fill="#C89F3D" />
            <path d="M12 9a5 5 0 0 0-5 5v3h10v-3a5 5 0 0 0-5-5z" fill="#C89F3D" />
            <rect x="5" y="19" width="14" height="2" rx="1" fill="#C89F3D" />
          </svg>
          <h1 style={styles.logoText}>KRONOS</h1>
          <p style={styles.tagline}>Professional Chess Engine Platform</p>
          
          <div style={styles.bulletList}>
            <div style={styles.bulletItem}>
              <span style={styles.bulletDot} />
              <span>Train against offline Web Worker threads.</span>
            </div>
            <div style={styles.bulletItem}>
              <span style={styles.bulletDot} />
              <span>Analyze variations with deep engine search.</span>
            </div>
            <div style={styles.bulletItem}>
              <span style={styles.bulletDot} />
              <span>Benchmark search engine performance.</span>
            </div>
            <div style={styles.bulletItem}>
              <span style={styles.bulletDot} />
              <span>Research opening theory tables interactively.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Center Login Form in Glass Card */}
      <div style={styles.formPanel}>
        <div style={styles.glassCard}>
          <div style={styles.formWidthWrapper}>
            
            {/* Mobile Branding Indicator */}
            <div style={styles.mobileLogoHeader} className="mobile-only">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C89F3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '40px', height: '40px', marginBottom: '12px', marginInline: 'auto', display: 'block' }}>
                <circle cx="12" cy="6" r="3" fill="#C89F3D" />
                <path d="M12 9a5 5 0 0 0-5 5v3h10v-3a5 5 0 0 0-5-5z" fill="#C89F3D" />
                <rect x="5" y="19" width="14" height="2" rx="1" fill="#C89F3D" />
              </svg>
              <div style={{ ...styles.logoText, fontSize: '1.85rem' }}>KRONOS</div>
              <div style={{ ...styles.tagline, fontSize: '14px', marginBottom: '16px' }}>Professional Chess Engine Platform</div>
            </div>

            {errorMsg && (
              <div style={styles.errorBanner}>
                <ShieldAlert size={14} />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div style={styles.successBanner}>
                <CheckCircle size={14} />
                <span>{successMsg}</span>
              </div>
            )}

            {isForgot ? (
              <form onSubmit={handleForgotPassword} style={styles.form}>
                <div>
                  <h2 style={styles.formTitle}>Recover Account</h2>
                  <p style={styles.formDesc}>Provide your email to receive recovery instructions.</p>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.inputField}
                    disabled={loading}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? <Loader size={16} className="animate-spin" /> : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsForgot(false)}
                  style={styles.backBtn}
                  disabled={loading}
                >
                  Back to Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={isSignUp ? handleSignUp : handleSignIn} style={styles.form}>
                <div>
                  <h2 style={styles.formTitle}>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
                  <p style={styles.formDesc}>Enter credentials below to enter the suite.</p>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>{isSignUp ? "Username" : "Username or Email"}</label>
                  <input
                    type="text"
                    placeholder={isSignUp ? "Choose username..." : "Enter username or email..."}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.inputField}
                    disabled={loading}
                    required
                  />
                </div>

                {isSignUp && (
                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel}>Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter email address..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={styles.inputField}
                      disabled={loading}
                      required
                    />
                  </div>
                )}

                <div style={styles.inputGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <label style={styles.inputLabel}>Password</label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => setIsForgot(true)}
                        style={styles.forgotBtn}
                        disabled={loading}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.inputField}
                    disabled={loading}
                    required
                  />
                </div>

                {isSignUp && (
                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel}>Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Verify password..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={styles.inputField}
                      disabled={loading}
                      required
                    />
                  </div>
                )}

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                  {loading ? <Loader size={16} className="animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
                </button>

                <div style={styles.switchText}>
                  <span>{isSignUp ? 'Already registered?' : 'New to Kronos?'}</span>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    style={styles.switchLink}
                    disabled={loading}
                  >
                    {isSignUp ? 'Sign In here' : 'Sign Up here'}
                  </button>
                </div>

                <div style={styles.divider}>
                  <div style={styles.dividerLine} />
                  <span style={styles.dividerText}>or</span>
                  <div style={styles.dividerLine} />
                </div>

                <button
                  type="button"
                  onClick={handleGuestMode}
                  className="btn-secondary"
                  style={styles.guestBtn}
                  disabled={loading}
                >
                  Continue as Guest
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

const styles = {
  authContainer: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: 'var(--color-bg-base)',
  },
  brandPanel: {
    flex: 1.2,
    backgroundColor: 'var(--color-bg-surface)',
    borderRight: '1px solid rgba(255, 255, 255, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '48px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  svgBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.03,
    pointerEvents: 'none',
  },
  brandContent: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoText: {
    fontSize: '3rem',
    fontWeight: '800',
    color: 'var(--color-brand-primary)',
    letterSpacing: '0.04em',
    marginBottom: '8px',
  },
  tagline: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    marginBottom: '32px',
  },
  bulletList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    alignItems: 'flex-start',
    textAlign: 'left',
    maxWidth: '340px',
  },
  bulletItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '15px',
    color: 'var(--color-text-secondary)',
  },
  bulletDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-brand-primary)',
    flexShrink: 0,
  },
  formPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    backgroundColor: 'var(--color-bg-base)',
  },
  glassCard: {
    width: '100%',
    maxWidth: '440px',
    padding: '40px',
    backgroundColor: 'rgba(33, 26, 21, 0.45)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
    display: 'flex',
    flexDirection: 'column',
  },
  formWidthWrapper: {
    width: '100%',
  },
  mobileLogoHeader: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    margin: '0 0 4px 0',
  },
  formDesc: {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    margin: '0 0 12px 0',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
    width: '100%',
  },
  inputLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
  },
  inputField: {
    width: '100%',
    height: '48px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    color: 'var(--color-text-primary)',
    padding: '0 16px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  forgotBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-brand-primary)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-secondary)',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'center',
    marginTop: '8px',
    textDecoration: 'underline',
    width: '100%',
  },
  switchText: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    marginTop: '4px',
  },
  switchLink: {
    background: 'none',
    border: 'none',
    color: 'var(--color-brand-primary)',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: '6px',
    textDecoration: 'underline',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    color: 'var(--color-text-dim)',
    margin: '4px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--color-border-subtle)',
  },
  dividerText: {
    fontSize: '11px',
    textTransform: 'uppercase',
  },
  guestBtn: {
    width: '100%',
    marginTop: '0px',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#fc8181',
    fontSize: '13px',
    lineHeight: '1.3',
    marginBottom: '12px',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(72, 187, 120, 0.08)',
    border: '1px solid rgba(72, 187, 120, 0.25)',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#68d391',
    fontSize: '13px',
    lineHeight: '1.3',
    marginBottom: '12px',
  },
};
