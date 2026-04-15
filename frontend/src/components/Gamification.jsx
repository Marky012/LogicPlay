import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const RANKS = [
  { min: 0, max: 2, label: 'Novice', color: '#94a3b8', glow: 'rgba(148,163,184,0.4)' },
  { min: 3, max: 5, label: 'Apprentice', color: '#10b981', glow: 'rgba(16,185,129,0.4)' },
  { min: 6, max: 9, label: 'Engineer', color: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
  { min: 10, max: 14, label: 'Expert', color: '#8b5cf6', glow: 'rgba(139,92,246,0.4)' },
  { min: 15, max: 99, label: 'Master', color: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
];

const BADGE_ICONS = {
  'First Circuit': <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>,
  'Perfect Score': <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>,
  'Gates Master': <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  'Speed Demon': <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
};

const getRank = (level) => RANKS.find(r => level >= r.min && level <= r.max) || RANKS[0];

const Gamification = ({ points, level, badges, onXpGain }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const pointsToNextLevel = level * 100;
  const progressPercent = Math.min(100, Math.max(0, (points / pointsToNextLevel) * 100));
  const rank = getRank(level);

  // High contrast adjustments for Light Mode
  const rankColor = isLight ? `color-mix(in srgb, ${rank.color}, #000 30%)` : rank.color;
  const rankBg    = isLight ? `color-mix(in srgb, ${rank.color}, transparent 85%)` : `color-mix(in srgb, ${rank.color}, transparent 75%)`;
  const rankGlow  = isLight ? `0 0 10px color-mix(in srgb, ${rank.color}, transparent 60%)` : `0 0 14px ${rank.glow}`;

  const [xpPops, setXpPops] = useState([]);
  const prevPoints = useRef(points);

  /* Trigger +XP pop when points increase */
  useEffect(() => {
    const diff = points - prevPoints.current;
    if (diff > 0) {
      const id = Date.now();
      setXpPops(p => [...p, { id, diff }]);
      setTimeout(() => setXpPops(p => p.filter(x => x.id !== id)), 1500);
    }
    prevPoints.current = points;
  }, [points]);

  return (
    <div className="relative flex items-center gap-4 px-4 py-2.5 rounded-2xl shadow-xl transition-all duration-300"
      style={{ 
        background: 'var(--c-surface)', 
        border: '1.5px solid var(--c-border)', 
        backdropFilter: 'blur(12px)',
        boxShadow: isLight ? '0 10px 25px -5px rgba(0,0,0,0.08)' : '0 10px 40px -10px rgba(0,0,0,0.5)'
      }}>

      {/* ── XP Pop animations ── */}
      {xpPops.map(pop => (
        <div key={pop.id}
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-black pointer-events-none animate-xp-pop"
          style={{ color: 'var(--neon-green)', textShadow: '0 0 8px rgba(57,255,20,0.8)', zIndex: 99 }}>
          +{pop.diff} XP
        </div>
      ))}

      {/* ── Level badge ── */}
      <div className="flex flex-col items-center pr-3 border-r" style={{ borderColor: 'var(--c-border-dim)' }}>
        <div className="relative w-11 h-11 flex items-center justify-center rounded-xl font-black text-xl"
          style={{
            background: rankBg,
            border: `2px solid ${rankColor}`,
            boxShadow: rankGlow,
            color: rankColor,
          }}>
          <span className="text-[10px] tracking-tighter opacity-70 mr-0.5 font-bold">Lv</span>
          {level}
        </div>
        <span className="text-[9px] font-black mt-1.5 uppercase tracking-widest"
          style={{ color: rankColor }}>
          {rank.label}
        </span>
      </div>

      {/* ── XP bar ── */}
      <div className="flex flex-col w-28 gap-1.5">
        <div className="flex justify-between text-[11px] font-black italic">
          <span style={{ color: isLight ? 'var(--neon-green)' : 'var(--neon-green)' }}>{points} XP</span>
          <div className="relative group flex items-center gap-1">
            <span style={{ color: 'var(--c-text-muted)' }}>{pointsToNextLevel}</span>
            <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold cursor-help"
                 style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)', color: 'var(--c-text-muted)' }}>?</div>
            {/* XP Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 w-44 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[100] shadow-2xl backdrop-blur-md"
                 style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}>
              <div className="font-black text-[9px] uppercase tracking-widest mb-2 opacity-60 text-center">Rankings</div>
              <div className="flex flex-col gap-1.5 text-[10px] font-medium">
                {[['Novice','#94a3b8','0–2'],['Appr','#10b981','3–5'],['Eng','#3b82f6','6–9'],['Exp','#8b5cf6','10–14'],['Master','#f59e0b','15+']].map(([l,c,r]) => (
                  <div key={l} className="flex justify-between"><span style={{ color: c }}>{l}</span><span className="opacity-70">Lv {r}</span></div>
                ))}
              </div>
              <div className="absolute top-full right-1.5 -translate-y-1 w-2.5 h-2.5 rotate-45 border-b border-r"
                   style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }} />
            </div>
          </div>
        </div>
        <div className="xp-bar-track" style={{ background: isLight ? 'rgba(0,0,0,0.08)' : 'var(--c-border-dim)' }}>
          <div className="xp-bar-fill" style={{ 
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, var(--neon-green), var(--neon-blue))`,
            boxShadow: `0 0 10px color-mix(in srgb, var(--neon-green), transparent ${isLight ? '40%' : '20%'})`
          }} />
        </div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-right" style={{ color: 'var(--c-text-muted)' }}>to level {level + 1}</div>
      </div>

      {/* ── Badges ── */}
      <div className="flex gap-1.5 items-center pl-3 border-l" style={{ borderColor: 'var(--c-border-dim)' }}>
        {badges && badges.length > 0 ? (
          badges.slice(0, 4).map((badge, i) => (
            <div key={i}
              className="relative group w-7 h-7 rounded-lg flex items-center justify-center text-sm cursor-default transition-all duration-200 hover:scale-110 shadow-sm"
              style={{ 
                background: isLight ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.15)', 
                border: `1.5px solid ${isLight ? 'rgba(245,158,11,0.5)' : 'rgba(245,158,11,0.35)'}`,
                color: isLight ? 'rgba(210,120,0,1)' : '#f59e0b'
              }}
              title={badge}>
              {BADGE_ICONS[badge] || (
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              )}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-xl backdrop-blur-md"
                style={{ background: 'var(--c-surface)', border: `1.5px solid ${isLight ? 'rgba(245,158,11,0.5)' : 'rgba(245,158,11,0.4)'}`, color: isLight ? 'rgba(210,120,0,1)' : '#f59e0b' }}>
                {badge}
              </div>
            </div>
          ))
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 italic" style={{ color: 'var(--c-text-muted)' }}>No Badges</span>
        )}
        {badges && badges.length > 4 && (
          <span className="text-[10px] font-black text-slate-500 ml-1">+{badges.length - 4}</span>
        )}
      </div>
    </div>
  );
};

export default Gamification;
