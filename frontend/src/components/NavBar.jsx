import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import logo from '../assets/L0g1cPLAYicon001.png';

const NavBar = ({ profileData }) => {
  const { user, logout, isTeacher } = useContext(AuthContext);
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  const studentLinks = [
    { to: '/playground', label: '🔧 Playground' },
    { to: '/profile',    label: '👤 Profile' },
  ];

  const teacherLinks = [
    { to: '/teacher', label: '📋 Dashboard' },
  ];

  const navLinks = isTeacher ? teacherLinks : studentLinks;

  return (
    <>
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-5 py-2.5 border-b"
              style={{
                background: isTeacher ? 'rgba(15,8,30,0.94)' : 'rgba(6,11,20,0.92)',
                backdropFilter: 'blur(12px)',
                borderColor: isTeacher ? 'rgba(124,58,237,0.2)' : 'rgba(0,212,255,0.1)',
              }}>

        {/* ── Logo ── */}
        <Link to={isTeacher ? '/teacher' : '/playground'} className="flex items-center gap-1.5 group flex-shrink-0">
          <img
            src={logo}
            alt="LogicPlay Logo"
            className="h-8 sm:h-10 object-contain transition-transform duration-300 hover:scale-105"
            style={{ filter: isTeacher ? 'drop-shadow(0 0 12px rgba(124,58,237,0.7))' : 'drop-shadow(0 0 12px rgba(0,212,255,0.6))' }}
          />
        </Link>

        {/* ── Nav links ── */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                    className="flex items-center gap-1 px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200"
                    style={{
                      color: active ? (isTeacher ? '#a78bfa' : 'var(--neon-blue)') : 'rgba(255,255,255,0.5)',
                      background: active ? (isTeacher ? 'rgba(124,58,237,0.12)' : 'rgba(0,212,255,0.1)') : 'transparent',
                      border: `1px solid ${active ? (isTeacher ? 'rgba(124,58,237,0.35)' : 'rgba(0,212,255,0.3)') : 'transparent'}`,
                    }}>
                <span>{label.split(' ')[0]}</span>
                <span className="hidden sm:inline">{label.split(' ').slice(1).join(' ')}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Right: User info + role badge ── */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold select-none"
                 style={{
                   background: isTeacher
                     ? 'linear-gradient(135deg, #5b21b6, #7c3aed)'
                     : 'linear-gradient(135deg, #0ea5e9, #bf5fff)',
                   boxShadow: isTeacher ? '0 0 10px rgba(124,58,237,0.5)' : '0 0 10px rgba(0,212,255,0.4)',
                 }}>
              {initials}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm text-slate-300 font-medium max-w-[80px] truncate">{user?.username}</span>
              {isTeacher && (
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#a78bfa' }}>Instructor</span>
              )}
            </div>
          </div>

          {/* Logout */}
          <button onClick={() => setShowLogoutConfirm(true)} className="btn-ghost text-xs px-2 sm:px-3 py-1.5">
            Logout
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
