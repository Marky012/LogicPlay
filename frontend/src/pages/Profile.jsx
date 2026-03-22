import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUser, getCircuits } from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

const RANKS = [
  { min: 0,  max: 2,  label: 'Novice',     color: '#94a3b8' },
  { min: 3,  max: 5,  label: 'Apprentice', color: '#10b981' },
  { min: 6,  max: 9,  label: 'Engineer',   color: '#3b82f6' },
  { min: 10, max: 14, label: 'Expert',     color: '#8b5cf6' },
  { min: 15, max: 99, label: 'Master',     color: '#f59e0b' },
];

const getRank = (level) => RANKS.find(r => level >= r.min && level <= r.max) || RANKS[0];

const BADGE_ICONS = {
  'First Circuit': '🔵', 'Perfect Score': '💯',
  'Gates Master': '🌟', 'Speed Demon': '⚡',
};

const StatCard = ({ label, value, color, icon }) => (
  <div className="flex flex-col items-center py-5 px-4 rounded-2xl transition-all duration-200 hover:scale-[1.03]"
       style={{ background: `${color}08`, border: `1px solid ${color}22` }}>
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-3xl font-black" style={{ color }}>{value}</div>
    <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{label}</div>
  </div>
);


const Profile = () => {
  const { user }       = useContext(AuthContext);
  const navigate       = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [circuits, setCircuits]       = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.username) {
        try {
          const data     = await getUser(user.username);
          const circData = await getCircuits(user.username);
          setProfileData(data);
          setCircuits(circData);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--c-bg)' }}>
      <NavBar />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--neon-blue)" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/>
          </svg>
          <span className="text-slate-500 text-sm">Loading profile…</span>
        </div>
      </div>
    </div>
  );

  if (!user || !profileData) return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--c-bg)' }}>
      <NavBar />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500">Could not load profile.</p>
      </div>
    </div>
  );

  const rank = getRank(profileData.level || 1);
  const pointsToNext = (profileData.level || 1) * 100;
  const progressPct = Math.min(100, ((profileData.points || 0) / pointsToNext) * 100);
  const initials = user.username.slice(0, 2).toUpperCase();
  const allBadges = ['First Circuit', 'Perfect Score', 'Gates Master', 'Speed Demon'];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--c-bg)' }}>
      <NavBar profileData={profileData} />

      <div className="max-w-4xl mx-auto w-full px-6 py-8 flex flex-col gap-8">

        {/* ── Hero banner ── */}
        <div className="glass-panel p-8 flex flex-col sm:flex-row items-center gap-6 animate-slide-up"
             style={{ border: `1px solid ${rank.color}22` }}>
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black select-none"
                 style={{
                   background: `linear-gradient(135deg, ${rank.color}30, ${rank.color}10)`,
                   border: `2px solid ${rank.color}`,
                   boxShadow: `0 0 24px ${rank.color}55`,
                   color: rank.color,
                 }}>
              {initials}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-black"
                 style={{ background: rank.color, color: '#000' }}>
              {rank.label}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col flex-1 w-full">
            <h1 className="text-3xl font-black text-white mb-0.5">{user.username}</h1>
            <p className="text-sm text-slate-400 mb-4">Level {profileData.level} · {rank.label}</p>

            {/* XP Bar */}
            <div className="flex flex-col gap-1 mb-1">
              <div className="flex justify-between text-xs font-semibold">
                <span style={{ color: 'var(--neon-green)' }}>{profileData.points} XP</span>
                <span className="text-slate-500">{pointsToNext} XP to Lv {(profileData.level || 1) + 1}</span>
              </div>
              <div className="xp-bar-track">
                <div className="xp-bar-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <StatCard label="Level"    value={profileData.level || 1}          color="var(--neon-blue)"   icon="⭐" />
          <StatCard label="XP"       value={profileData.points || 0}         color="var(--neon-green)"  icon="⚡" />
          <StatCard label="Badges"   value={profileData.badges?.length || 0} color="var(--neon-amber)"  icon="🏆" />
          <StatCard label="Circuits" value={circuits.length}                  color="var(--neon-purple)" icon="🔧" />
        </div>

        {/* ── Badges gallery ── */}
        <div className="glass-panel p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: 'var(--neon-amber)' }}>
            🏆 Badges
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {allBadges.map(badge => {
              const earned = profileData.badges?.includes(badge);
              return (
                <div key={badge}
                     className="relative group flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-default transition-all duration-200"
                     style={{
                       background: earned ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)',
                       border: `1px solid ${earned ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.06)'}`,
                       filter: earned ? 'none' : 'grayscale(1)',
                       opacity: earned ? 1 : 0.4,
                     }}>
                  <span className="text-2xl">{earned ? (BADGE_ICONS[badge] || '🏅') : '?'}</span>
                  <span className="text-[9px] text-center text-slate-500 leading-tight">{badge.replace(/_/g, ' ')}</span>
                  {earned && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-[8px]"
                         style={{ background: 'var(--neon-green)', color: '#000' }}>✓</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Saved Circuits ── */}
        <div className="glass-panel p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--neon-purple)' }}>
              🔧 Saved Circuits
            </h2>
            <Link to="/playground" className="btn-primary text-xs py-1.5 px-3">
              + New Circuit
            </Link>
          </div>

          {circuits.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2 opacity-20">⚡</div>
              <p className="text-slate-600 text-sm italic">No circuits saved yet — start building!</p>
              <Link to="/playground" className="btn-ghost mt-3 text-xs inline-flex">Go to Playground →</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {circuits.map(c => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                     style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <span className="text-sm font-semibold text-white">{c.circuit_data?.name || `Circuit #${c.id}`}</span>
                    <span className="text-xs text-slate-600 ml-3">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-full"
                          style={{
                            color: c.score >= 100 ? 'var(--neon-green)' : 'var(--neon-amber)',
                            background: c.score >= 100 ? 'rgba(57,255,20,0.1)' : 'rgba(245,158,11,0.1)',
                            border: `1px solid ${c.score >= 100 ? 'rgba(57,255,20,0.25)' : 'rgba(245,158,11,0.25)'}`,
                          }}>
                      {c.score >= 100 ? '✓ ' : ''}{c.score || 'N/A'}
                    </span>
                    <button 
                      onClick={() => navigate('/playground', { state: { loadCircuit: c } })} 
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
                      style={{ border: '1px solid rgba(0,212,255,0.3)', color: 'var(--neon-blue)' }}
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
