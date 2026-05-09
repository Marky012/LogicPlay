import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ConfirmModal from './ConfirmModal';
import logo from '../assets/favicon.png';

/* Sun icon for light mode */
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

/* Moon icon for dark mode */
const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const DashboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const PlaygroundIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const NavBar = ({ profileData }) => {
  const { user, logout, isTeacher } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isLight = theme === 'light';

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check if running as PWA
    const mql = window.matchMedia('(display-mode: standalone)');
    const handleDisplayMode = (e) => setIsInstalled(e.matches);
    mql.addEventListener('change', handleDisplayMode);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      mql.removeEventListener('change', handleDisplayMode);
    };
  }, []);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  const studentLinks = [
    { to: '/playground', label: 'Playground', icon: <PlaygroundIcon /> },
    { to: '/profile',    label: 'Profile',    icon: <ProfileIcon /> },
  ];

  const teacherLinks = [
    { to: '/teacher', label: 'Dashboard', icon: <DashboardIcon /> },
  ];

  const navLinks = isTeacher ? teacherLinks : studentLinks;

  const navBg = isTeacher
    ? (isLight ? 'var(--c-surface)' : 'rgba(6,11,20,0.94)')
    : (isLight ? 'var(--c-surface)' : 'rgba(6,11,20,0.92)');

  const navBorderColor = isTeacher
    ? (isLight ? 'var(--c-border)' : 'rgba(0,130,200,0.2)')
    : (isLight ? 'var(--c-border)'  : 'rgba(0,212,255,0.1)');

  return (
    <>
      <header className="sticky top-0 z-[1000] flex items-center justify-between px-3 sm:px-5 py-2.5 border-b"
              style={{
                background: navBg,
                backdropFilter: 'blur(12px)',
                borderColor: navBorderColor,
                transition: 'background 0.3s ease, border-color 0.3s ease',
              }}>

        <div className="flex items-center gap-4 sm:gap-8">
          {/* ── Logo ── */}
          <Link to={isTeacher ? '/teacher' : '/playground'} className="flex items-center gap-2 group flex-shrink-0">
            <img
              src={logo}
              alt="LogicPlay Logo"
              className="h-9 sm:h-10 object-contain transition-transform duration-300 hover:scale-105"
              style={{ filter: isLight ? 'none' : (isTeacher ? 'drop-shadow(0 0 12px rgba(0,130,200,0.7))' : 'drop-shadow(0 0 12px rgba(0,212,255,0.6))') }}
            />
            <span className="inline-block text-lg sm:text-xl font-black tracking-tighter">
              <span className="text-gradient-blue">Logic</span>
              <span style={{ color: 'var(--c-text)' }}>Play</span>
            </span>
          </Link>

          {/* ── Teacher Nav links ── */}
          {isTeacher && (
            <nav className="hidden sm:flex items-center gap-1">
              {teacherLinks.map(({ to, label, icon }) => {
                const active = location.pathname === to;
                return (
                  <Link key={to} to={to}
                        className="flex items-center gap-2 px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200"
                        style={{
                          color: active ? 'var(--neon-blue)' : 'var(--c-text-muted)',
                          background: active ? 'rgba(0,130,200,0.12)' : 'transparent',
                          border: `1px solid ${active ? 'rgba(0,130,200,0.35)' : 'transparent'}`,
                        }}>
                    <span className="flex-shrink-0" style={{ opacity: active ? 1 : 0.7 }}>{icon}</span>
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* ── Right: User info + theme toggle + logout ── */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm ${isTeacher ? 'avatar-neon-purple' : 'avatar-neon-blue'}`}>
              {initials}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-black tracking-tight" style={{ color: 'var(--c-text)' }}>{user?.username}</span>
              {isTeacher && (
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse-glow" />
                   <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80" style={{ color: 'var(--neon-blue)' }}>Instructor</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection/PWA Status Badge */}
            <div className="hidden sm:flex mr-1">
              {isOffline ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-glow" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Offline</span>
                </div>
              ) : isInstalled ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10" title="App Cached & Installed">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">App Active</span>
                </div>
              ) : null}
            </div>

            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ 
                background: 'rgba(0, 212, 255, 0.05)', 
                border: '1.5px solid var(--c-border)', 
                color: 'var(--c-text)',
                backdropFilter: 'blur(8px)'
              }}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? <MoonIcon /> : <SunIcon />}
            </button>

            {/* Logout */}
            <button 
              onClick={() => setShowLogoutConfirm(true)} 
              className="btn-neon-red group !rounded-xl"
            >
              <span className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all"><LogoutIcon /></span>
              <span className="hidden xs:inline">LOGOUT</span>
            </button>
          </div>
        </div>
      </header>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Log out?"
        message={
          <>
            <p>
              {isTeacher 
                ? "You'll be signed out of the instructor portal." 
                : "You'll need to enter your username again to play."}
            </p>
            {isOffline && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 text-[11px] font-medium leading-normal animate-pulse-glow text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  <span className="uppercase tracking-[0.1em] font-black text-[9px]">Offline Warning</span>
                </div>
                You may experience an interrupted login while offline. The game may require an internet connection to log back in successfully.
              </div>
            )}
          </>
        }
        confirmLabel="Log out"
        cancelLabel="Stay"
        danger
        onConfirm={() => { setShowLogoutConfirm(false); logout(); }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default NavBar;
