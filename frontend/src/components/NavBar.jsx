import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ConfirmModal from './ConfirmModal';
import logo from '../assets/L0g1cPLAYicon001.png';

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
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-5 py-2.5 border-b"
              style={{
                background: navBg,
                backdropFilter: 'blur(12px)',
                borderColor: navBorderColor,
                transition: 'background 0.3s ease, border-color 0.3s ease',
              }}>

        {/* ── Logo ── */}
        <Link to={isTeacher ? '/teacher' : '/playground'} className="flex items-center gap-1.5 group flex-shrink-0">
          <img
            src={logo}
            alt="LogicPlay Logo"
            className="h-8 sm:h-10 object-contain transition-transform duration-300 hover:scale-105"
            style={{ filter: isTeacher ? 'drop-shadow(0 0 12px rgba(0,130,200,0.7))' : 'drop-shadow(0 0 12px rgba(0,212,255,0.6))' }}
          />
        </Link>

        {/* ── Nav links ── */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                    className="flex items-center gap-2 px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200"
                    style={{
                      color: active ? (isTeacher ? 'var(--neon-blue)' : 'var(--neon-blue)') : 'var(--c-text-muted)',
                      background: active ? (isTeacher ? 'rgba(0,130,200,0.12)' : 'rgba(0,212,255,0.1)') : 'transparent',
                      border: `1px solid ${active ? (isTeacher ? 'rgba(0,130,200,0.35)' : 'rgba(0,212,255,0.3)') : 'transparent'}`,
                    }}>
                <span className="flex-shrink-0" style={{ opacity: active ? 1 : 0.7 }}>{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Right: User info + theme toggle + logout ── */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold select-none text-white"
                 style={{
                   background: isTeacher
                     ? 'linear-gradient(135deg, #075985, #0369a1)'
                     : 'linear-gradient(135deg, #0ea5e9, #bf5fff)',
                   boxShadow: isTeacher ? '0 0 10px rgba(0,130,200,0.5)' : '0 0 10px rgba(0,212,255,0.4)',
                 }}>
              {initials}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-medium max-w-[80px] truncate" style={{ color: 'var(--c-text)' }}>{user?.username}</span>
              {isTeacher && (
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--neon-blue)' }}>Instructor</span>
              )}
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="btn-theme-toggle"
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? <MoonIcon /> : <SunIcon />}
          </button>

          {/* Logout */}
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 group"
            style={{
              background: isLight ? 'rgba(239,68,68,0.05)' : 'rgba(255,51,102,0.05)',
              border: isLight ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,51,102,0.15)',
              color: isLight ? '#dc2626' : 'var(--neon-red)',
            }}
          >
            <span className="opacity-70 group-hover:opacity-100 transition-opacity"><LogoutIcon /></span>
            <span className="hidden xs:inline">Logout</span>
          </button>
        </div>
      </header>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Log out?"
        message={isTeacher ? "You'll be signed out of the instructor portal." : "You'll need to enter your username again to play."}
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
