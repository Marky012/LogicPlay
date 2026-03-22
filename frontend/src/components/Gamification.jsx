import React, { useState, useEffect, useRef } from 'react';

const RANKS = [
  { min: 0,    max: 2,  label: 'Novice',     color: '#94a3b8', glow: 'rgba(148,163,184,0.4)' },
  { min: 3,    max: 5,  label: 'Apprentice', color: '#10b981', glow: 'rgba(16,185,129,0.4)' },
  { min: 6,    max: 9,  label: 'Engineer',   color: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
  { min: 10,   max: 14, label: 'Expert',     color: '#8b5cf6', glow: 'rgba(139,92,246,0.4)' },
  { min: 15,   max: 99, label: 'Master',     color: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
];

const BADGE_ICONS = {
  'First Circuit': '🔵',
  'Perfect Score': '💯',
  'Gates Master':  '🌟',
  'Speed Demon':   '⚡',
};

const getRank = (level) => RANKS.find(r => level >= r.min && level <= r.max) || RANKS[0];

const Gamification = ({ points, level, badges, onXpGain }) => {
  const pointsToNextLevel = level * 100;
  const progressPercent = Math.min(100, Math.max(0, (points / pointsToNextLevel) * 100));
  const rank = getRank(level);

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
    <div className="relative flex items-center gap-4 px-5 py-2.5 rounded-2xl"
         style={{ background: 'rgba(13,26,45,0.8)', border: '1px solid rgba(0,212,255,0.15)', backdropFilter: 'blur(8px)' }}>

      {/* ── XP Pop animations ── */}
      {xpPops.map(pop => (
        <div key={pop.id}
             className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-black pointer-events-none animate-xp-pop"
             style={{ color: 'var(--neon-green)', textShadow: '0 0 8px rgba(57,255,20,0.8)', zIndex: 99 }}>
          +{pop.diff} XP
        </div>
      ))}

      {/* ── Level badge ── */}
      <div className="flex flex-col items-center">
        <div className="relative w-12 h-12 flex items-center justify-center rounded-xl font-black text-xl"
             style={{
               background: `linear-gradient(135deg, ${rank.color}22, ${rank.color}44)`,
               border: `2px solid ${rank.color}`,
               boxShadow: `0 0 14px ${rank.glow}`,
               color: rank.color,
             }}>
          <span className="text-[10px] tracking-tighter opacity-70 mr-0.5 font-bold">Lv</span>
          {level}
        </div>
        <span className="text-[9px] font-bold mt-1 uppercase tracking-widest"
              style={{ color: rank.color }}>
          {rank.label}
        </span>
      </div>

      {/* ── XP bar ── */}
      <div className="flex flex-col w-32 gap-1">
        <div className="flex justify-between text-[11px] font-semibold">
          <span style={{ color: 'var(--neon-green)' }}>{points} XP</span>
          <span className="text-slate-500">{pointsToNextLevel}</span>
        </div>
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="text-[10px] text-slate-500">to level {level + 1}</div>
      </div>

      {/* ── Badges ── */}
      <div className="flex gap-1.5 items-center">
        {badges && badges.length > 0 ? (
          badges.slice(0, 4).map((badge, i) => (
            <div key={i}
                 className="relative group w-7 h-7 rounded-lg flex items-center justify-center text-sm cursor-default"
                 style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)' }}
                 title={badge}>
              {BADGE_ICONS[badge] || '🏅'}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                   style={{ background: 'rgba(13,26,45,0.95)', border: '1px solid rgba(245,158,11,0.3)' }}>
                {badge}
              </div>
            </div>
          ))
        ) : (
          <span className="text-xs text-slate-600 italic">No badges</span>
        )}
        {badges && badges.length > 4 && (
          <span className="text-xs text-slate-500 font-semibold ml-1">+{badges.length - 4}</span>
        )}
      </div>
    </div>
  );
};

export default Gamification;
