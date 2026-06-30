// Kronos Chess V2 — Authentication & Access Controller
// Supports Registration, Login, Forgot Password, and Guest Mode.

import React, { useState, useEffect } from 'react';
import { Lock, Mail, User, ShieldAlert, CheckCircle, Loader } from 'lucide-react';

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

    // Simulate database lookup from LocalStorage
    setTimeout(() => {
      try {
        const db = JSON.parse(localStorage.getItem('kronos_v2_users') || '{}');
        let foundUser = null;

        // Try looking up by username or email
        const target = username.toLowerCase();
        Object.keys(db).forEach((uKey) => {
          if (uKey.toLowerCase() === target || db[uKey].email.toLowerCase() === target) {
            foundUser = db[uKey];
          }
        });

        if (foundUser && foundUser.password === password) {
          localStorage.setItem('kronos_v2_active_user', foundUser.username);
          onAuthSuccess(foundUser.username);
        } else {
          setErrorMsg('Invalid credentials. Check your username/password.');
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
        const db = JSON.parse(localStorage.getItem('kronos_v2_users') || '{}');

        // Check duplicates
        if (db[username]) {
          setErrorMsg('Username is already taken.');
          setLoading(false);
          return;
        }
        
        let emailTaken = false;
        Object.keys(db).forEach((key) => {
          if (db[key].email.toLowerCase() === email.toLowerCase()) {
            emailTaken = true;
          }
        });

        if (emailTaken) {
          setErrorMsg('Email is already registered.');
          setLoading(false);
          return;
        }

        // Save new user
        db[username] = { username, email, password };
        localStorage.setItem('kronos_v2_users', JSON.stringify(db));

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
        const db = JSON.parse(localStorage.getItem('kronos_v2_users') || '{}');
        let userKey = null;

        Object.keys(db).forEach((uKey) => {
          if (db[uKey].email.toLowerCase() === email.toLowerCase()) {
            userKey = uKey;
          }
        });

        if (userKey) {
          // Mock password reset: reset to a generic one or show success message
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
    // Ensure profile exists for guest
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
      <div style={styles.authCard} className="panel-card">
        
        {/* Title / Logo */}
        <div style={styles.logoHeader}>
          <div style={styles.logoText}>KRONOS CHESS</div>
          <div style={styles.logoSubtitle}>V2 Platform Rebuild</div>
        </div>

        {/* Success/Error displays */}
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

        {/* FORGOT PASSWORD FORM */}
        {isForgot ? (
          <form onSubmit={handleForgotPassword} style={styles.form}>
            <div style={styles.formTitle}>Recover Account</div>
            <div style={styles.formDesc}>Provide your email to receive recovery instructions.</div>

            <div style={styles.inputWrapper}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.inputField}
                disabled={loading}
                required
              />
            </div>

            <button type="submit" style={styles.submitBtn} className="btn-gold" disabled={loading}>
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
          /* SIGN IN & SIGN UP FORMS */
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} style={styles.form}>
            <div style={styles.formTitle}>{isSignUp ? 'Create Account' : 'Sign In'}</div>

            {/* Username field */}
            <div style={styles.inputWrapper}>
              <User size={16} style={styles.inputIcon} />
              <input
                type="text"
                placeholder={isSignUp ? "Username" : "Username or Email"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.inputField}
                disabled={loading}
                required
              />
            </div>

            {/* Email field (Sign up only) */}
            {isSignUp && (
              <div style={styles.inputWrapper}>
                <Mail size={16} style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.inputField}
                  disabled={loading}
                  required
                />
              </div>
            )}

            {/* Password field */}
            <div style={styles.inputWrapper}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.inputField}
                disabled={loading}
                required
              />
            </div>

            {/* Password confirm field (Sign up only) */}
            {isSignUp && (
              <div style={styles.inputWrapper}>
                <Lock size={16} style={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.inputField}
                  disabled={loading}
                  required
                />
              </div>
            )}

            {/* Forgot password trigger */}
            {!isSignUp && (
              <div style={styles.forgotContainer}>
                <button
                  type="button"
                  onClick={() => setIsForgot(true)}
                  style={styles.forgotBtn}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button type="submit" style={styles.submitBtn} className="btn-gold" disabled={loading}>
              {loading ? <Loader size={16} className="animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>

            {/* Toggle tabs */}
            <div style={styles.switchTabs}>
              <span>{isSignUp ? 'Already registered?' : 'New to Kronos?'}</span>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                style={styles.switchBtn}
                disabled={loading}
              >
                {isSignUp ? 'Sign In here' : 'Sign Up here'}
              </button>
            </div>

            {/* Divider */}
            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <div style={styles.dividerLine} />
            </div>

            {/* Guest mode */}
            <button
              type="button"
              onClick={handleGuestMode}
              style={styles.guestBtn}
              className="btn-bronze"
              disabled={loading}
            >
              Continue as Guest
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Cohesive Walnut design object styling rules
const styles = {
  authContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: 'var(--color-bg-base)',
    padding: '20px',
  },
  authCard: {
    width: '100%',
    maxWidth: '400px',
    padding: '35px 30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  logoHeader: {
    textAlign: 'center',
    marginBottom: '5px',
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
    marginTop: '2px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  formDesc: {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.4',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--color-text-dim)',
  },
  inputField: {
    width: '100%',
    padding: '11px 12px 11px 38px',
    backgroundColor: 'var(--color-bg-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    color: 'var(--color-text-primary)',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  forgotContainer: {
    textAlign: 'right',
    marginTop: '-5px',
  },
  forgotBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-secondary)',
    fontSize: '11px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-secondary)',
    fontSize: '12px',
    cursor: 'pointer',
    textAlign: 'center',
    marginTop: '5px',
    textDecoration: 'underline',
  },
  switchTabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '5px',
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    marginTop: '5px',
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-brand-primary)',
    fontWeight: '700',
    cursor: 'pointer',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: 'var(--color-text-dim)',
    margin: '5px 0',
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
    padding: '12px',
    fontSize: '13px',
    fontWeight: '600',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    padding: '10px 12px',
    borderRadius: '4px',
    color: '#fc8181',
    fontSize: '12px',
    lineHeight: '1.3',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(72, 187, 120, 0.08)',
    border: '1px solid rgba(72, 187, 120, 0.25)',
    padding: '10px 12px',
    borderRadius: '4px',
    color: '#68d391',
    fontSize: '12px',
    lineHeight: '1.3',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  }
};
