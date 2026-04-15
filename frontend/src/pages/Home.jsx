import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { register, getUser } from '../utils/api';
import logo from '../assets/L0g1cPLAYicon001.png';

/* ─── SVG Icon Components (white/monochromatic) ────────────────── */
const IconZap = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconTrophy = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 21 12 21 16 21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <path d="M7 4H4a1 1 0 0 0-1 1v3a4 4 0 0 0 4 4" />
    <path d="M17 4h3a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4" />
    <path d="M7 4a5 5 0 0 0 5 9 5 5 0 0 0 5-9H7z" />
  </svg>
);
const IconPuzzle = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-3.408 0l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 2c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.017z" />
  </svg>
);
const IconGlobe = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconTable = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="9" x2="9" y2="21" />
  </svg>
);
const IconUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconCpu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);
const IconArrowUp = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

/* ─── Static data ──────────────────────────────────────────────── */
const FEATURES = [
  {
    Icon: IconZap,
    title: 'Live Simulation',
    desc: 'Build circuits and watch electrical signals flow in real-time. Every gate reacts instantly as you drag and connect.',
    color: 'var(--neon-blue)',
    glow: 'rgba(0,212,255,0.15)',
  },
  {
    Icon: IconTrophy,
    title: 'Earn XP & Badges',
    desc: 'Gain experience points for every circuit you save. Level up, climb the leaderboard, and unlock achievement badges.',
    color: 'var(--neon-amber)',
    glow: 'rgba(245,158,11,0.15)',
  },
  {
    Icon: IconPuzzle,
    title: 'Logic Challenges',
    desc: 'Tackle guided puzzles from basic AND/OR gates all the way to advanced XOR and XNOR combinations.',
    color: 'var(--neon-purple)',
    glow: 'rgba(191,95,255,0.15)',
  },
  {
    Icon: IconGlobe,
    title: 'Play Anywhere',
    desc: 'LogicPlay is a PWA — install it on any device and even play offline. No app store required.',
    color: 'var(--neon-green)',
    glow: 'rgba(57,255,20,0.15)',
  },
  {
    Icon: IconUsers,
    title: 'Classroom Ready',
    desc: 'Teachers can create classes, assign circuits, review submissions, and track student progress in one place.',
    color: 'var(--neon-cyan)',
    glow: 'rgba(0,255,234,0.15)',
  },
  {
    Icon: IconTable,
    title: 'Truth Tables',
    desc: 'Auto-generated truth tables for every circuit. Understand the logic behind your gates at a glance.',
    color: 'var(--neon-red)',
    glow: 'rgba(255,51,102,0.15)',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Enter Your Callsign',
    desc: 'No password needed. Just type a unique username and you are in immediately.',
    Icon: IconUser,
  },
  {
    num: '02',
    title: 'Build Your Circuit',
    desc: 'Drag gates onto the canvas, wire them together, and flip switches to see signals flow live.',
    Icon: IconCpu,
  },
  {
    num: '03',
    title: 'Level Up & Compete',
    desc: 'Save your circuit to earn XP, unlock badges, and challenge classmates on the live leaderboard.',
    Icon: IconArrowUp,
  },
];

const GATE_NODES = [
  { size: 5, top: '10%', left: '6%', delay: 0, color: 'var(--neon-blue)' },
  { size: 3, top: '22%', left: '15%', delay: 0.6, color: 'var(--neon-purple)' },
  { size: 4, top: '55%', left: '4%', delay: 1.2, color: 'var(--neon-green)' },
  { size: 3, top: '80%', left: '12%', delay: 0.4, color: 'var(--neon-blue)' },
  { size: 5, top: '8%', right: '8%', delay: 0.9, color: 'var(--neon-purple)' },
  { size: 3, top: '35%', right: '5%', delay: 1.5, color: 'var(--neon-green)' },
  { size: 4, top: '65%', right: '10%', delay: 0.7, color: 'var(--neon-blue)' },
  { size: 3, top: '85%', right: '18%', delay: 0.2, color: 'var(--neon-amber)' },
  { size: 6, top: '45%', left: '2%', delay: 1.8, color: 'var(--neon-cyan)' },
  { size: 3, top: '30%', right: '20%', delay: 1.1, color: 'var(--neon-red)' },
];

/* ─── Intersection Observer hook (fade-in on scroll) ─────────── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Sub-components ────────────────────────────────────────────── */

function BackgroundCanvas() {
  return (
    <>
      {/* Animated neon dots */}
      {GATE_NODES.map((n, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none animate-pulse-glow"
          style={{
            width: n.size, height: n.size,
            top: n.top, left: n.left, right: n.right,
            background: n.color,
            boxShadow: `0 0 8px ${n.color}`,
            animationDelay: `${n.delay}s`,
          }}
        />
      ))}
      {/* SVG circuit lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" xmlns="http://www.w3.org/2000/svg">
        <line x1="6%"  y1="10%" x2="15%" y2="22%"  stroke="#00d4ff" strokeWidth="1" />
        <line x1="15%" y1="22%" x2="4%"  y2="55%"  stroke="#00d4ff" strokeWidth="1" />
        <line x1="4%"  y1="55%" x2="12%" y2="80%"  stroke="#39ff14" strokeWidth="1" />
        <line x1="8%"  y1="8%"  x2="5%"  y2="35%"  stroke="#bf5fff" strokeWidth="1" />
        <line x1="5%"  y1="35%" x2="10%" y2="65%"  stroke="#bf5fff" strokeWidth="1" />
        <line x1="10%" y1="65%" x2="18%" y2="85%"  stroke="#00d4ff" strokeWidth="1" />
        <line x1="6%"  y1="10%" x2="94%" y2="90%"  stroke="#bf5fff" strokeWidth="0.5" strokeDasharray="8 8" />
        <circle cx="15%" cy="22%" r="3" fill="#00d4ff" opacity="0.8" />
        <circle cx="5%"  cy="35%" r="3" fill="#bf5fff" opacity="0.8" />
        <circle cx="4%"  cy="55%" r="3" fill="#39ff14" opacity="0.8" />
        <circle cx="10%" cy="65%" r="3" fill="#00d4ff" opacity="0.8" />
      </svg>
      {/* Radial glow orbs */}
      <div className="absolute pointer-events-none" style={{
        top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />
      <div className="absolute pointer-events-none" style={{
        top: '60%', left: '20%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(191,95,255,0.05) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />
    </>
  );
}

function LandingNav() {
  const { isLight, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 w-full z-[100] px-4 py-3 sm:px-6 sm:py-4 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Left: Logo/Logo text */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={logo} alt="LogicPlay" className="h-7 w-7 object-contain drop-shadow-glow-blue" />
          <span className="text-xl font-black hidden xs:inline" style={{ color: 'var(--c-text)' }}>
            <span className="text-gradient-blue">Logic</span>Play
          </span>
        </div>

        {/* Right: Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 glass-panel"
          style={{
            background: 'var(--c-surface-2)',
            border: '1.5px solid var(--c-border)',
            color: 'var(--c-text)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {isLight ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  );
}

function HeroSection({ onPlayClick }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-16 overflow-hidden">
      <BackgroundCanvas />

      {/* Badge */}
      <div className="animate-slide-up relative z-10 mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
        style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: 'var(--neon-blue)' }}>
        <span className="animate-pulse-glow inline-block w-2 h-2 rounded-full bg-neon-green" />
        PWA · Digital Logic Simulator
      </div>

      {/* Logo */}
      <div className="relative z-10 animate-float mb-6">
        <img
          src={logo}
          alt="LogicPlay Logo"
          className="w-28 h-28 sm:w-36 sm:h-36 mx-auto object-contain"
          style={{ filter: 'drop-shadow(0 0 32px rgba(0,212,255,0.8)) drop-shadow(0 0 60px rgba(0,212,255,0.3))' }}
        />
      </div>

      {/* Headline */}
      <h1 className="relative z-10 animate-slide-up text-4xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-4"
        style={{ animationDelay: '0.1s' }}>
        <span className="text-gradient-blue">Logic</span>
        <span style={{ color: 'var(--c-text)' }}>Play</span>
      </h1>

      <p className="relative z-10 animate-slide-up text-lg sm:text-xl font-medium mb-3 text-gradient-neon"
        style={{ animationDelay: '0.2s' }}>
        Build. Simulate. Conquer.
      </p>

      <p className="relative z-10 animate-slide-up max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-10"
        style={{ color: 'var(--c-text-muted)', animationDelay: '0.3s' }}>
        The gamified digital logic simulator where you drag gates, watch circuits come alive,
        earn XP, and compete with your class — all in your browser.
      </p>

      {/* CTA Buttons */}
      <div className="relative z-10 animate-slide-up flex flex-col sm:flex-row gap-3 mb-12" style={{ animationDelay: '0.4s' }}>
        <button
          id="hero-play-btn"
          onClick={onPlayClick}
          className="btn-shimmer px-8 py-4 rounded-2xl font-black text-base text-white tracking-wide hover:scale-105 transition-transform duration-300"
          style={{ boxShadow: '0 0 24px rgba(0,212,255,0.4)' }}
        >
          Start Playing →
        </button>
        <Link
          to="/teacher-login"
          className="px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
          style={{
            background: 'var(--c-surface-2)',
            border: '1px solid rgba(191,95,255,0.3)',
            color: 'var(--neon-purple)',
          }}
        >
          Instructor Portal
        </Link>
      </div>

      {/* Stats row */}
      <div className="relative z-10 animate-fade-in flex items-center gap-6 sm:gap-10" style={{ animationDelay: '0.6s' }}>
        {[
          { val: '7+', label: 'Gate Types' },
          { val: 'Live', label: 'Simulation' },
          { val: 'PWA', label: 'Installable' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-xl sm:text-2xl font-black text-gradient-blue">{s.val}</div>
            <div className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce">
        <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>Scroll</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-muted)" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { ref, visible } = useReveal();
  return (
    <section ref={ref} id="features" className="relative py-20 px-4">
      <div className="max-w-5xl mx-auto">

        <div className={`text-center mb-12 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.2)', color: 'var(--neon-green)' }}>
            ✦ Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-3">
            Everything you need to <span className="text-gradient-neon">master logic</span>
          </h2>
          <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: 'var(--c-text-muted)' }}>
            From real-time simulation to gamified learning — LogicPlay has it all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`glass-panel p-6 group hover:scale-[1.03] transition-all duration-300 cursor-default
                ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{
                transitionDelay: `${i * 80}ms`,
                borderColor: visible ? f.glow.replace('0.15', '0.25') : 'transparent',
              }}
            >
              <div className="w-10 h-10 mb-4 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform duration-200"
                style={{ background: 'var(--c-surface-3)', border: '1px solid var(--c-border)' }}>
                <f.Icon />
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: f.color }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { ref, visible } = useReveal();
  return (
    <section ref={ref} id="how-it-works" className="relative py-20 px-4" style={{ background: 'var(--c-surface-2)', borderTop: '1px solid var(--c-border-dim)', borderBottom: '1px solid var(--c-border-dim)' }}>
      <div className="max-w-4xl mx-auto">

        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(191,95,255,0.08)', border: '1px solid rgba(191,95,255,0.2)', color: 'var(--neon-purple)' }}>
            ✦ How it works
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-3">
            Up and running in <span className="text-gradient-purple">3 steps</span>
          </h2>
          <p className="text-sm sm:text-base" style={{ color: 'var(--c-text-muted)' }}>No sign-up friction. No tutorials to skip. Just play.</p>
        </div>

        {/* Steps */}
        <div className="flex flex-col sm:flex-row gap-8 items-start justify-center">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div
                className={`flex-1 flex flex-col items-center text-center transition-all duration-700
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Icon circle */}
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                    style={{
                      background: 'var(--c-surface-2)',
                      border: '1px solid rgba(0,212,255,0.2)',
                      boxShadow: '0 0 20px rgba(0,212,255,0.1)',
                    }}>
                    <s.Icon />
                  </div>
                  {/* Step number badge */}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: 'var(--neon-blue)', color: '#000' }}>
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: 'var(--c-text)' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed max-w-[200px]" style={{ color: 'var(--c-text-muted)' }}>{s.desc}</p>
              </div>

              {/* Arrow connector (between steps, not after last) */}
              {i < STEPS.length - 1 && (
                <div className="hidden sm:flex items-center pt-8 text-2xl" style={{ color: 'var(--neon-blue)', opacity: 0.4 }}>
                  →
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

function LoginSection({ loginRef }) {
  const [username, setUsername] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useContext(AuthContext);
  const navigate                = useNavigate();
  const { ref: revealRef, visible } = useReveal();

  // Merge the two refs
  const setRef = (el) => {
    revealRef.current = el;
    if (loginRef) loginRef.current = el;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const userData = await getUser(trimmed);
      if (userData.role === 'teacher') {
        setError('This is a teacher account. Please use the Instructor Portal.');
        return;
      }
      login(trimmed);
      navigate('/playground');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        try {
          await register(trimmed);
          login(trimmed);
          navigate('/playground');
        } catch {
          setError('Failed to create account. Please try again.');
        }
      } else {
        setError('Connection error – is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={setRef} id="play-now" className="relative py-24 px-4">
      {/* Glow backdrop */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <div className="relative max-w-md mx-auto z-10">
        <div
          className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: 'var(--neon-blue)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Ready to play logic?
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-2">
              Jump <span className="text-gradient-blue">right in</span>
            </h2>
            <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
              Enter a username to log in or create your account instantly — no password required.
            </p>
          </div>

          {/* Login card */}
          <div className="glass-panel p-8" style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img
                src={logo}
                alt="LogicPlay"
                className="w-16 h-16 object-contain animate-float"
                style={{ filter: 'drop-shadow(0 0 14px rgba(0,212,255,0.7))' }}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-5 text-sm animate-scale-in"
                style={{ background: 'rgba(255,51,102,0.12)', border: '1px solid rgba(255,51,102,0.3)', color: '#ff8099' }}>
                <span>⚠</span> {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-4" id="student-login-form">
              <div>
                <label htmlFor="login-username" className="block mb-2 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--c-text-muted)' }}>
                  Username / Callsign
                </label>
                <input
                  type="text"
                  id="login-username"
                  className="input-neon"
                  placeholder="Enter your callsign…"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>

              <button
                type="submit"
                id="login-submit-btn"
                disabled={loading}
                className="btn-shimmer w-full py-3.5 rounded-xl font-black text-base text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10" />
                    </svg>
                    Connecting…
                  </span>
                ) : 'Start Playing →'}
              </button>
            </form>

            <p className="text-center text-xs mt-5" style={{ color: 'var(--c-text-muted)' }}>
              No password needed — your username is your identity.
            </p>

            <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--c-border-dim)' }}>
              <Link
                to="/teacher-login"
                id="instructor-portal-link"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'var(--c-surface-2)',
                  border: '1px solid rgba(191,95,255,0.25)',
                  color: 'var(--neon-purple)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Instructor Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-8 px-4 text-center" style={{ borderTop: '1px solid var(--c-border-dim)' }}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <img src={logo} alt="LogicPlay" className="h-6 object-contain" style={{ filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.5))' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--c-text-muted)' }}>LogicPlay</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
            style={{ background: 'rgba(0,212,255,0.08)', color: 'var(--neon-blue)', border: '1px solid rgba(0,212,255,0.2)' }}>
            v2.0 · PWA
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
          Built for learners. Powered by FastAPI + React.
        </p>
        <Link to="/teacher-login" className="text-xs font-semibold hover:underline" style={{ color: 'var(--neon-purple)' }}>
          Instructor Portal
        </Link>
      </div>
    </footer>
  );
}

/* ─── Main Page Component ───────────────────────────────────────── */
const Home = () => {
  const { user }    = useContext(AuthContext);
  const navigate    = useNavigate();
  const loginRef    = useRef(null);

  // Redirect already-logged-in users
  useEffect(() => {
    if (user) {
      if (user.role === 'teacher') navigate('/teacher');
      else navigate('/playground');
    }
  }, [user, navigate]);

  const scrollToLogin = () => {
    loginRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Small delay so input is visible then focus it
    setTimeout(() => {
      loginRef.current?.querySelector('input')?.focus();
    }, 600);
  };

  return (
    <div className="relative" style={{ background: 'var(--c-bg)' }}>
      <LandingNav />
      <HeroSection onPlayClick={scrollToLogin} />
      <FeaturesSection />
      <HowItWorksSection />
      <LoginSection loginRef={loginRef} />
      <Footer />
    </div>
  );
};

export default Home;
