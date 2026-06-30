// Kronos Chess V2 — Main Application Shell
// Act as a hash-based router shell containing the global header, avatar menu, and command palette.

import React, { useState, useEffect, lazy, Suspense } from 'react';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import PlayPage from './pages/PlayPage';
import LocalPage from './pages/LocalPage';
import AnalysisPage from './pages/AnalysisPage';
import Puzzles from './components/Puzzles';
import Learn from './components/Learn';
import Profile from './components/Profile';
import CommandPalette from './components/CommandPalette';
import PositionEditor from './components/PositionEditor';
import AboutPage from './pages/AboutPage';
import { Volume2, Palette, LogOut, Settings, User, Command, Keyboard, Info, X, Menu } from 'lucide-react';

const ResearchLabPage = lazy(() => import('./pages/ResearchLabPage'));

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('kronos_v2_active_user'));
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');
  
  // App UI states
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [showCmdPalette, setShowCmdPalette] = useState(false);

  // Global settings state
  const [boardTheme, setBoardTheme] = useState(() => localStorage.getItem('kronos_v2_board_theme') || 'walnut');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Hash change listener
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Responsive state listeners
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const [isTablet, setIsTablet] = useState(() => window.innerWidth >= 640 && window.innerWidth <= 1024);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 640);
      setIsTablet(w >= 640 && w <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigate = (path) => {
    window.location.hash = `#${path}`;
  };

  const getActiveTabFromHash = () => {
    const hash = currentHash;
    if (hash === '#/' || hash === '') return 'dashboard';
    if (hash.startsWith('#/play')) return 'play';
    if (hash.startsWith('#/local')) return 'local';
    if (hash.startsWith('#/analysis')) return 'analysis';
    if (hash.startsWith('#/puzzles')) return 'puzzles';
    if (hash.startsWith('#/learn')) return 'learn';
    if (hash.startsWith('#/research')) return 'research';
    if (hash.startsWith('#/profile')) return 'profile';
    if (hash.startsWith('#/editor')) return 'editor';
    if (hash.startsWith('#/about')) return 'about';
    return 'dashboard';
  };

  const activeTab = getActiveTabFromHash();

  // Handle position editor starts
  const handlePlayPosition = (customFen, launchMode) => {
    const targetKey = launchMode === 'ai' ? 'kronos_v2_play_state' : 
                      (launchMode === 'local' ? 'kronos_v2_local_state' : 'kronos_v2_analysis_state');
    
    const initialState = {
      startFen: customFen,
      fen: customFen,
      gameHistory: [],
      gameStatus: 'active',
      winner: null,
      inCheck: false,
      modeSelected: launchMode === 'ai' ? 'ai' : (launchMode === 'local' ? 'local' : 'analysis'),
      playerColor: 'w',
      boardOrientation: 'white'
    };
    
    localStorage.setItem(targetKey, JSON.stringify(initialState));
    
    if (launchMode === 'ai') {
      navigate('/play');
    } else if (launchMode === 'local') {
      navigate('/local');
    } else {
      navigate('/analysis');
    }
  };

  // Handle global keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e || typeof e.key !== 'string') return;
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
      if (isInputFocused) return;

      const key = e.key.toLowerCase();

      // Command Palette (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && key === 'k') {
        e.preventDefault();
        setShowCmdPalette(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAuthSuccess = (user) => {
    localStorage.setItem('kronos_v2_active_user', user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('kronos_v2_active_user');
    setCurrentUser(null);
    setShowAvatarDropdown(false);
  };

  const updateTheme = (theme) => {
    localStorage.setItem('kronos_v2_board_theme', theme);
    setBoardTheme(theme);
  };

  if (!currentUser) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div style={styles.appContainer}>
      
      {/* HEADER NAVIGATION */}
      <header style={styles.header}>
        <div onClick={() => navigate('/')} style={{ ...styles.logoRow, cursor: 'pointer' }}>
          <div style={styles.logoText}>KRONOS CHESS</div>
        </div>

        {!(isMobile || isTablet) ? (
          <>
            {/* Tab links */}
            <nav style={styles.nav}>
              <button 
                onClick={() => navigate('/')}
                style={styles.navLink(activeTab === 'dashboard')}
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/play')}
                style={styles.navLink(activeTab === 'play')}
              >
                Play Engine
              </button>
              <button 
                onClick={() => navigate('/local')}
                style={styles.navLink(activeTab === 'local')}
              >
                Pass & Play
              </button>
              <button 
                onClick={() => navigate('/analysis')}
                style={styles.navLink(activeTab === 'analysis')}
              >
                Analysis
              </button>
              <button 
                onClick={() => navigate('/puzzles')}
                style={styles.navLink(activeTab === 'puzzles')}
              >
                Puzzles
              </button>
              <button 
                onClick={() => navigate('/learn')}
                style={styles.navLink(activeTab === 'learn')}
              >
                Learn
              </button>
              <button 
                onClick={() => navigate('/research')}
                style={styles.navLink(activeTab === 'research')}
              >
                Research Lab
              </button>
            </nav>

            {/* User control buttons */}
            <div style={styles.headerControls}>
              <button onClick={() => setShowCmdPalette(true)} style={styles.cmdPaletteBtn} title="Command Palette (Ctrl+K)">
                <Command size={14} />
              </button>
              
              <div style={styles.avatarWrapper}>
                <button 
                  onClick={() => setShowAvatarDropdown(!showAvatarDropdown)} 
                  style={styles.avatarBtn}
                >
                  {currentUser[0].toUpperCase()}
                </button>

                {/* Avatar Dropdown Settings */}
                {showAvatarDropdown && (
                  <div style={styles.dropdown} className="panel-card animate-fade-in">
                    <div style={styles.dropdownHeader}>
                      <div style={styles.dropUserRow}>
                        <div style={styles.dropAvatarMini}>{currentUser[0].toUpperCase()}</div>
                        <div>
                          <div style={styles.userLabel}>{currentUser}</div>
                        </div>
                      </div>
                    </div>

                    <div style={styles.dropdownList}>
                      <button
                        onClick={() => { navigate('/profile'); setShowAvatarDropdown(false); }}
                        style={styles.dropItem}
                      >
                        <User size={13} />
                        <span>Profile</span>
                      </button>

                      <div style={styles.dropdownDivider} />

                      {/* Board Theme */}
                      <div style={styles.nestedMenu}>
                        <div style={styles.nestedTitle}><Palette size={11} /> Board Theme</div>
                        <div style={styles.themeRow}>
                          <button onClick={() => updateTheme('walnut')} style={styles.themeBadge('walnut', boardTheme)}>Walnut</button>
                          <button onClick={() => updateTheme('green')} style={styles.themeBadge('green', boardTheme)}>Green</button>
                          <button onClick={() => updateTheme('slate')} style={styles.themeBadge('slate', boardTheme)}>Slate</button>
                        </div>
                      </div>

                      {/* Sound toggle */}
                      <button onClick={() => setSoundEnabled(!soundEnabled)} style={styles.dropItem}>
                        <Volume2 size={13} />
                        <span>Sounds</span>
                        <span style={styles.dropBadge(soundEnabled)}>{soundEnabled ? 'ON' : 'OFF'}</span>
                      </button>

                      {/* Keyboard shortcuts info */}
                      <button style={{ ...styles.dropItem, cursor: 'default' }} disabled>
                        <Keyboard size={13} />
                        <span style={{ flex: 1 }}>Shortcuts</span>
                        <span style={styles.shortcutHint}>N · F · E · ←→</span>
                      </button>

                      {/* About */}
                      <button 
                        onClick={() => { navigate('/about'); setShowAvatarDropdown(false); }} 
                        style={styles.dropItem}
                      >
                        <Info size={13} />
                        <span style={{ flex: 1 }}>About Kronos</span>
                      </button>

                      <div style={styles.dropdownDivider} />

                      <button onClick={handleLogout} style={{ ...styles.dropItem, color: '#f56565' }}>
                        <LogOut size={13} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={styles.headerControls}>
            <button onClick={() => setShowCmdPalette(true)} style={styles.cmdPaletteBtn} title="Command Palette (Ctrl+K)">
              <Command size={14} />
            </button>
            <button onClick={() => setIsDrawerOpen(true)} style={styles.hamburgerBtn} title="Menu">
              <Menu size={16} />
            </button>
          </div>
        )}
      </header>

      {/* MOBILE DRAWER */}
      {(isMobile || isTablet) && (
        <>
          <div 
            className={`mobile-drawer-overlay ${isDrawerOpen ? 'open' : ''}`} 
            onClick={() => setIsDrawerOpen(false)} 
          />
          <div className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`}>
            <div style={styles.drawerHeader}>
              <div style={styles.logoText}>KRONOS CHESS</div>
              <button onClick={() => setIsDrawerOpen(false)} style={styles.drawerCloseBtn}>
                <X size={18} />
              </button>
            </div>
            
            <div style={styles.dropdownDivider} />

            <div style={styles.drawerSection}>
              <div style={styles.drawerSectionTitle}>Navigation</div>
              <div style={styles.drawerList}>
                <button 
                  onClick={() => { navigate('/'); setIsDrawerOpen(false); }}
                  style={styles.drawerItem(activeTab === 'dashboard')}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => { navigate('/play'); setIsDrawerOpen(false); }}
                  style={styles.drawerItem(activeTab === 'play')}
                >
                  Play Engine
                </button>
                <button 
                  onClick={() => { navigate('/local'); setIsDrawerOpen(false); }}
                  style={styles.drawerItem(activeTab === 'local')}
                >
                  Pass & Play
                </button>
                <button 
                  onClick={() => { navigate('/analysis'); setIsDrawerOpen(false); }}
                  style={styles.drawerItem(activeTab === 'analysis')}
                >
                  Analysis
                </button>
                <button 
                  onClick={() => { navigate('/puzzles'); setIsDrawerOpen(false); }}
                  style={styles.drawerItem(activeTab === 'puzzles')}
                >
                  Puzzles
                </button>
                <button 
                  onClick={() => { navigate('/learn'); setIsDrawerOpen(false); }}
                  style={styles.drawerItem(activeTab === 'learn')}
                >
                  Learn
                </button>
                <button 
                  onClick={() => { navigate('/research'); setIsDrawerOpen(false); }}
                  style={styles.drawerItem(activeTab === 'research')}
                >
                  Research Lab
                </button>
              </div>
            </div>

            <div style={styles.dropdownDivider} />

            <div style={styles.drawerSection}>
              <div style={styles.drawerSectionTitle}>Profile & settings</div>
              
              <button 
                onClick={() => { navigate('/profile'); setIsDrawerOpen(false); }}
                style={styles.drawerActionBtn}
              >
                <User size={14} />
                <span>View Profile ({currentUser})</span>
              </button>

              <div style={styles.drawerDivider} />

              <div style={styles.nestedMenu}>
                <div style={styles.nestedTitle}><Palette size={11} /> Board Theme</div>
                <div style={styles.themeRow}>
                  <button onClick={() => updateTheme('walnut')} style={styles.themeBadge('walnut', boardTheme)}>Walnut</button>
                  <button onClick={() => updateTheme('green')} style={styles.themeBadge('green', boardTheme)}>Green</button>
                  <button onClick={() => updateTheme('slate')} style={styles.themeBadge('slate', boardTheme)}>Slate</button>
                </div>
              </div>

              <div style={styles.drawerDivider} />

              <button onClick={() => setSoundEnabled(!soundEnabled)} style={styles.drawerActionBtn}>
                <Volume2 size={14} />
                <span>Sounds</span>
                <span style={styles.dropBadge(soundEnabled)}>{soundEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <div style={{ ...styles.drawerActionBtn, cursor: 'default', opacity: 0.6 }} disabled>
                <Keyboard size={14} />
                <span>Shortcuts</span>
                <span style={styles.shortcutHint}>N · F · E · ←→</span>
              </div>

              <button 
                onClick={() => { navigate('/about'); setIsDrawerOpen(false); }} 
                style={styles.drawerActionBtn}
              >
                <Info size={14} />
                <span>About Kronos</span>
              </button>

              <div style={styles.dropdownDivider} />

              <button onClick={() => { handleLogout(); setIsDrawerOpen(false); }} style={{ ...styles.drawerActionBtn, color: '#f56565' }}>
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* MAIN CONTAINER LAYOUT */}
      <main style={styles.mainContent}>
        {activeTab === 'dashboard' && (
          <div style={styles.scrollPage} className="page-layout-wrapper">
            <Dashboard username={currentUser} navigate={navigate} />
          </div>
        )}
        
        {activeTab === 'play' && (
          <PlayPage 
            username={currentUser} 
            boardTheme={boardTheme} 
            soundEnabled={soundEnabled} 
          />
        )}

        {activeTab === 'local' && (
          <LocalPage 
            boardTheme={boardTheme} 
            soundEnabled={soundEnabled} 
          />
        )}

        {activeTab === 'analysis' && (
          <AnalysisPage 
            boardTheme={boardTheme} 
            soundEnabled={soundEnabled} 
          />
        )}

        {activeTab === 'puzzles' && (
          <div style={styles.scrollPage} className="page-layout-wrapper">
            <Puzzles 
              boardTheme={boardTheme}
              onBack={() => navigate('/')}
            />
          </div>
        )}

        {activeTab === 'learn' && (
          <div style={styles.scrollPage} className="page-layout-wrapper">
            <Learn />
          </div>
        )}

        {activeTab === 'research' && (
          <Suspense fallback={<div style={{ color: '#d4af37', padding: '2rem', textAlign: 'center' }}>Loading Research Workstation...</div>}>
            <ResearchLabPage onBack={() => navigate('/')} />
          </Suspense>
        )}

        {activeTab === 'profile' && (
          <div style={styles.scrollPage} className="page-layout-wrapper">
            <Profile username={currentUser} />
          </div>
        )}

        {activeTab === 'editor' && (
          <div style={styles.scrollPage} className="page-layout-wrapper">
            <PositionEditor
              boardTheme={boardTheme}
              onPlayPosition={handlePlayPosition}
            />
          </div>
        )}
        {activeTab === 'about' && (
          <div style={styles.scrollPage} className="page-layout-wrapper">
            <AboutPage onBack={() => navigate('/')} />
          </div>
        )}
      </main>

      {/* Global Command Palette overlay */}
      <CommandPalette
        isOpen={showCmdPalette}
        onClose={() => setShowCmdPalette(false)}
        setModeSelected={(mode) => navigate(mode === 'ai' ? '/play' : (mode === 'local' ? '/local' : (mode === 'analysis' ? '/analysis' : '/')))}
        resetGame={() => window.dispatchEvent(new CustomEvent('kronos_new_game'))}
        flipBoard={() => window.dispatchEvent(new CustomEvent('kronos_flip_board'))}
        setBoardTheme={updateTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onNavigate={(tab) => { navigate(tab === 'puzzles' ? '/puzzles' : (tab === 'learn' ? '/learn' : '/')); setShowCmdPalette(false); }}
      />
    </div>
  );
}

// Layout styling parameters
const styles = {
  appContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-bg-base)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-sans)',
    overflow: 'hidden',
  },
  header: {
    height: '56px',
    backgroundColor: 'var(--color-bg-surface)',
    borderBottom: '1px solid var(--color-border-subtle)',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    fontWeight: '850',
    color: 'var(--color-brand-primary)',
    letterSpacing: '0.04em',
  },
  logoV: {
    fontSize: '9px',
    padding: '2px 4px',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    color: 'var(--color-text-secondary)',
    borderRadius: '3px',
    fontWeight: '700',
  },
  nav: {
    display: 'flex',
    gap: '4px',
    height: '100%',
    alignItems: 'center',
  },
  navLink: (active) => ({
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: active ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderRadius: '4px',
  }),
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  hamburgerBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '12px',
  },
  drawerCloseBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text-dim)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '10px 0',
    width: '100%',
  },
  drawerSectionTitle: {
    fontSize: '9px',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: '700',
    marginBottom: '4px',
    textAlign: 'left',
  },
  drawerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
  },
  drawerItem: (active) => ({
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: '700',
    textAlign: 'left',
    color: active ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
    backgroundColor: active ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
    border: 'none',
    borderLeft: active ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s ease',
  }),
  drawerActionBtn: {
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    width: '100%',
  },
  drawerDivider: {
    height: '1px',
    backgroundColor: 'rgba(76, 61, 49, 0.2)',
    margin: '4px 0',
  },
  cmdPaletteBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-brand-primary)',
    color: '#1a130e',
    fontSize: '12px',
    fontWeight: '800',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
  dropdown: {
    position: 'absolute',
    top: '36px',
    right: 0,
    width: '248px',
    borderRadius: '8px',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-bright)',
    padding: '10px 0',
    zIndex: 1100,
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  },
  dropdownHeader: {
    padding: '8px 16px 12px 16px',
    borderBottom: '1px solid var(--color-border-subtle)',
    marginBottom: '4px',
  },
  dropUserRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  dropAvatarMini: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-brand-primary)',
    color: '#1a130e',
    fontSize: '13px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  statusLabel: {
    fontSize: '9px',
    color: '#48bb78',
    marginTop: '2px',
    fontWeight: '600',
  },
  dropdownList: {
    display: 'flex',
    flexDirection: 'column',
  },
  dropItem: {
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    width: '100%',
  },
  dropBadge: (active) => ({
    marginLeft: 'auto',
    fontSize: '9px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '3px',
    backgroundColor: active ? 'rgba(72,187,120,0.12)' : 'var(--color-bg-elevated)',
    border: `1px solid ${active ? 'rgba(72,187,120,0.3)' : 'var(--color-border-default)'}`,
    color: active ? '#68d391' : 'var(--color-text-dim)',
    letterSpacing: '0.04em',
    fontFamily: 'monospace',
  }),
  shortcutHint: {
    marginLeft: 'auto',
    fontSize: '9px',
    fontFamily: 'monospace',
    color: 'var(--color-text-dim)',
    letterSpacing: '0.02em',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: 'var(--color-border-subtle)',
    margin: '6px 0',
  },
  nestedMenu: {
    padding: '6px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  nestedTitle: {
    fontSize: '9px',
    color: 'var(--color-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  themeRow: {
    display: 'flex',
    gap: '4px',
  },
  themeBadge: (theme, current) => ({
    flex: 1,
    padding: '3px 0',
    fontSize: '8px',
    fontWeight: '800',
    textTransform: 'uppercase',
    backgroundColor: current === theme ? 'rgba(212, 175, 55, 0.15)' : 'var(--color-bg-elevated)',
    border: '1px solid',
    borderColor: current === theme ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
    color: current === theme ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
    borderRadius: '3px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s ease',
  }),
  mainContent: {
    flex: 1,
    display: 'flex',
    width: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  scrollPage: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--color-border-default) transparent',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  aboutCard: {
    width: '100%',
    maxWidth: '480px',
    borderRadius: '8px',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-bright)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    borderBottom: '1px solid var(--color-border-subtle)',
  },
  modalLogo: {
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    fontWeight: '850',
    color: 'var(--color-brand-primary)',
    letterSpacing: '0.04em',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-dim)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s ease',
  },
  modalBody: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  modalText: {
    fontSize: '12px',
    color: 'var(--color-text-primary)',
    lineHeight: '1.5',
  },
  featureBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    margin: '8px 0',
  },
  featureItem: {
    fontSize: '11px',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.4',
    paddingLeft: '10px',
    borderLeft: '2px solid var(--color-brand-primary)',
  }
};
