import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUser, getCircuits, getSubmissionsByStudent, getStudentClassrooms, joinClassroom } from '../utils/api';
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
  'First Circuit': <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>,
  'Perfect Score': <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  'Gates Master':  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  'Speed Demon':   <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
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
  const [submissions, setSubmissions] = useState([]);
  const [classes, setClasses]         = useState([]);
  const [joinCode, setJoinCode]       = useState('');
  const [joining, setJoining]         = useState(false);
  const [joinError, setJoinError]     = useState('');
  const [loading, setLoading]         = useState(true);
  const [subsOpen, setSubsOpen]       = useState(true);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true); setJoinError('');
    try {
      const cls = await joinClassroom(joinCode.trim(), user.username);
      setClasses(prev => [...prev.filter(c => c.id !== cls.id), cls]);
      setJoinCode('');
    } catch (e) {
      setJoinError(e?.response?.data?.detail || 'Invalid join code');
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.username) {
        try {
          const data     = await getUser(user.username);
          const circData = await getCircuits(user.username);
          setProfileData(data);
          setCircuits(circData);
          // Fetch submissions (non-fatal if missing)
          try {
            const subData = await getSubmissionsByStudent(user.username);
            setSubmissions(Array.isArray(subData) ? subData : []);
          } catch (_) {}
          
          // Fetch classes
          try {
            const clsData = await getStudentClassrooms(user.username);
            setClasses(Array.isArray(clsData) ? clsData : []);
          } catch (_) {}
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
          <StatCard label="Level"    value={profileData.level || 1}          color="var(--neon-blue)"   icon={<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>} />
          <StatCard label="XP"       value={profileData.points || 0}         color="var(--neon-green)"  icon={<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>} />
          <StatCard label="Badges"   value={profileData.badges?.length || 0} color="var(--neon-amber)"  icon={<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>} />
          <StatCard label="Classes"  value={classes.length}                  color="#0ea5e9" icon={<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>} />
        </div>

        {/* ── My Classes ── */}
        <div className="glass-panel p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: '#0ea5e9' }}>
            <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            My Classes
          </h2>
          
          <div className="flex flex-col gap-4">
            <form onSubmit={handleJoinClass} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Join Code..."
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                className="flex-1 max-w-[200px] px-4 py-2 text-sm bg-black/30 border border-[#0ea5e9]/30 rounded-xl outline-none focus:border-[#0ea5e9]/70 text-white font-mono uppercase"
                maxLength={6}
              />
              <button 
                type="submit" 
                disabled={joining || !joinCode.trim()}
                className="px-4 py-2 text-sm font-bold bg-[#0ea5e9]/20 border border-[#0ea5e9]/50 text-[#0ea5e9] rounded-xl hover:bg-[#0ea5e9]/40 transition-colors disabled:opacity-50"
              >
                {joining ? '...' : 'Join'}
              </button>
            </form>
            {joinError && <p className="text-xs text-red-400">{joinError}</p>}
            
            {classes.length === 0 ? (
              <p className="text-slate-500 text-sm mt-2">You are not enrolled in any classes yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                {classes.map(c => (
                  <div key={c.id} className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col gap-1">
                    <span className="font-bold text-white text-sm">{c.name}</span>
                    <span className="text-xs text-slate-400">Enrolled</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Badges gallery ── */}
        <div className="glass-panel p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--neon-amber)' }}>
            <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            Badges
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
                  <span className="text-2xl">{earned ? (BADGE_ICONS[badge] || <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>) : '?'}</span>
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
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--neon-purple)' }}>
              <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              Saved Circuits
            </h2>
            <Link to="/playground" className="btn-primary text-xs py-1.5 px-3">
              + New Circuit
            </Link>
          </div>

          {circuits.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2 flex justify-center opacity-20"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
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
        {/* ── My Submissions ── */}
        <div className="glass-panel p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={() => setSubsOpen(o => !o)}
            className="w-full flex items-center justify-between mb-4 group"
          >
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: '#a78bfa' }}>
              <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              My Submissions
              {submissions.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black"
                      style={{ background: 'rgba(124,58,237,0.18)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}>
                  {submissions.length}
                </span>
              )}
            </h2>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 className="text-slate-500 transition-transform duration-200"
                 style={{ transform: subsOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {subsOpen && (
            submissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600 text-sm italic">No submissions yet — submit a circuit from the Playground!</p>
                <Link to="/playground" className="btn-ghost mt-3 text-xs inline-flex">Go to Playground →</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {submissions.map(sub => {
                  const isGraded = sub.status === 'graded';
                  const isNew = isGraded && sub.teacher_score != null;
                  return (
                    <SubmissionCard key={sub.id} sub={sub} isNew={isNew} />
                  );
                })}
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
};

// ── Submission Card ──────────────────────────────────────────────
const SubmissionCard = ({ sub, isNew }) => {
  const [open, setOpen] = useState(false);
  const isGraded = sub.status === 'graded';
  const scoreColor = sub.teacher_score >= 80 ? '#39ff14' : sub.teacher_score >= 50 ? '#ffd700' : '#ff3366';

  const formatDate = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="rounded-xl overflow-hidden transition-all duration-200"
         style={{
           border: `1px solid ${isNew ? 'rgba(124,58,237,0.45)' : 'rgba(255,255,255,0.07)'}`,
           boxShadow: isNew ? '0 0 16px rgba(124,58,237,0.1)' : 'none',
         }}>
      {/* Card header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
      >
        {/* Status dot */}
        <div className="w-2 h-2 rounded-full flex-shrink-0"
             style={{ background: isGraded ? '#39ff14' : '#ffd700', boxShadow: isGraded ? '0 0 6px #39ff14' : 'none' }} />

        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{sub.assignment_title || `Assignment #${sub.assignment_id}`}</p>
          <p className="text-[10px] text-slate-500">
            Submitted {formatDate(sub.submitted_at)}
            {sub.is_late && <span className="text-red-400 ml-2">⚠ Late</span>}
          </p>
        </div>

        {/* Scores */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {sub.auto_score != null && (
            <div className="text-center">
              <p className="text-[9px] text-slate-500 uppercase">Auto</p>
              <p className="text-xs font-black" style={{ color: 'var(--neon-blue)' }}>{sub.auto_score}</p>
            </div>
          )}
          {isGraded && sub.teacher_score != null ? (
            <div className="text-center">
              <p className="text-[9px] text-slate-500 uppercase">Grade</p>
              <p className="text-xs font-black" style={{ color: scoreColor }}>{sub.teacher_score}</p>
            </div>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(255,215,0,0.1)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.25)' }}>
              Pending
            </span>
          )}

          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
               className="text-slate-500 transition-transform duration-200"
               style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {/* Expandable feedback */}
      {open && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-3 animate-fade-in"
             style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {isGraded ? (
            <>
              {sub.teacher_score != null && (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Teacher Score</span>
                    <span className="font-black" style={{ color: scoreColor }}>{sub.teacher_score}/100</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                         style={{ width: `${sub.teacher_score}%`, background: scoreColor, boxShadow: `0 0 8px ${scoreColor}66` }} />
                  </div>
                </div>
              )}
              {sub.teacher_feedback && (
                <div className="p-3 rounded-xl" style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: '#a78bfa' }}>Teacher Feedback</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{sub.teacher_feedback}</p>
                </div>
              )}
              {!sub.teacher_feedback && (
                <p className="text-xs text-slate-500 italic">No written feedback provided.</p>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-400">⏳ Awaiting teacher review</p>
              <p className="text-xs text-slate-600 mt-1">Your teacher will grade this submission soon</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
