import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const NavBar = ({ profileData }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  const navLinks = [
    { to: '/playground', label: '🔧 Playground' },
    { to: '/profile',    label: '👤 Profile' },
  ];

  return (
    <header className="relative z-20 flex items-center justify-between px-5 py-3 border-b"
            style={{ background: 'rgba(6,11,20,0.85)', backdropFilter: 'blur(12px)', borderColor: 'rgba(0,212,255,0.1)' }}>

      {/* ── Logo ── */}
      <Link to="/playground" className="flex items-center gap-2 group">
        <span className="text-xl select-none" style={{ textShadow: '0 0 12px rgba(0,212,255,0.8)' }}>⚡</span>
        <span className="text-lg font-black tracking-tight text-gradient-blue glow-text-blue">
          LogicPlay
        </span>
      </Link>

      {/* ── Nav links ── */}
      <nav className="hidden sm:flex items-center gap-1">
        {navLinks.map(({ to, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{
                    color: active ? 'var(--neon-blue)' : 'rgba(255,255,255,0.5)',
                    background: active ? 'rgba(0,212,255,0.1)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
                  }}>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ── Right: Gamification + User ── */}
      <div className="flex items-center gap-3">
        {/* XP badge from parent */}
        {profileData && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold"
               style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.25)', color: 'var(--neon-green)' }}>
            <span>⭐ Lv {profileData.level}</span>
            <span className="text-slate-500">|</span>
            <span>{profileData.points} XP</span>
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold select-none"
               style={{ background: 'linear-gradient(135deg, #0ea5e9, #bf5fff)', boxShadow: '0 0 10px rgba(0,212,255,0.4)' }}>
            {initials}
          </div>
          <span className="hidden sm:block text-sm text-slate-300 font-medium">
            {user?.username}
          </span>
        </div>

        {/* Logout */}
        <button onClick={logout} className="btn-ghost text-xs px-3 py-1.5">
          Logout
        </button>
      </div>
    </header>
  );
};

export default NavBar;
