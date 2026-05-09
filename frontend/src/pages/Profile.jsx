import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUser, getCircuits, getSubmissionsByStudent, getStudentClassrooms, joinClassroom, deleteCircuit, getLeaderboard, renameCircuit, deleteUser, unenrollStudent, syncCircuitToCloud, deleteSubmission, resetDismissedAssignments } from '../utils/api';
import { deleteOfflineCircuit } from '../utils/offlineSync';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import SubmissionReviewModal from '../components/SubmissionReviewModal';
import ClassAssignmentsModal from '../components/ClassAssignmentsModal';
import ConfirmModal from '../components/ConfirmModal';
import RenameModal from '../components/RenameModal';
import TypeToConfirmModal from '../components/TypeToConfirmModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { triggerFeedback } from '../utils/feedback';

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
  <div className="flex flex-col items-center py-5 px-4 rounded-2xl transition-all duration-300 hover:scale-[1.03] group animate-fade-in"
       style={{ 
         background: 'var(--c-surface-2)', 
         border: `1px solid color-mix(in srgb, ${color}, transparent 60%)`,
         boxShadow: `0 10px 25px -5px color-mix(in srgb, ${color}, transparent 88%), 0 8px 10px -6px color-mix(in srgb, ${color}, transparent 92%)`
       }}>
    <div className="text-2xl mb-1 transition-transform duration-300 group-hover:scale-110" style={{ color }}>{icon}</div>
    <div className="text-3xl font-black" style={{ color }}>{value}</div>
    <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{label}</div>
  </div>
);


const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate       = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [circuits, setCircuits]       = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [classes, setClasses]         = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [circuitToDelete, setCircuitToDelete] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [viewingClass, setViewingClass] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [subsOpen, setSubsOpen]       = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [classToLeave, setClassToLeave] = useState(null);
  const [leavingClass, setLeavingClass] = useState(false);
  const [syncingIds, setSyncingIds] = useState(new Set());
  const [showJoinConfirm, setShowJoinConfirm] = useState(false);
  const [showAlreadyJoined, setShowAlreadyJoined] = useState(false);
  const [alreadyJoinedClass, setAlreadyJoinedClass] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteUser(user.username);
      setShowDeleteAccount(false);
      logout();
      navigate('/');
    } catch (e) {
      console.error(e);
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleJoinClass = (e) => {
    e.preventDefault();
    const codeToJoin = joinCode.trim().toUpperCase();
    if (!codeToJoin) return;
    
    const alreadyJoined = classes.find(c => c.join_code === codeToJoin);
    if (alreadyJoined) {
      triggerFeedback('error');
      setAlreadyJoinedClass(alreadyJoined.name);
      setShowAlreadyJoined(true);
      return;
    }

    triggerFeedback('click');
    setShowJoinConfirm(true);
  };

  const confirmJoinClass = async () => {
    setJoining(true);
    setJoinError('');
    try {
      await joinClassroom(joinCode.trim(), user.username);
      setJoinCode('');
      // Refresh all user data (including enrollment status)
      await fetchData();
      triggerFeedback('success');
    } catch (err) {
      triggerFeedback('error');
      const detail = err.response?.data?.detail || 'Failed to join class. Check code.';
      setJoinError(detail);
    } finally {
      setJoining(false);
      setShowJoinConfirm(true); // Close the modal
      setShowJoinConfirm(false); 
    }
  };

  const handleLeaveClass = async () => {
    if (!classToLeave) return;
    setLeavingClass(true);
    try {
      await unenrollStudent(classToLeave.id, user.username);
      await fetchData();
      setClassToLeave(null);
      triggerFeedback('delete');
    } catch (e) {
      console.error(e);
      alert('Failed to leave class.');
    } finally {
      setLeavingClass(false);
    }
  };


  const handleDeleteCircuit = async () => {
    if (!circuitToDelete) return;
    setDeleting(true);
    try {
      if (circuitToDelete.is_offline_only) {
        await deleteOfflineCircuit(circuitToDelete.id);
      } else {
        await deleteCircuit(circuitToDelete.id);
      }
      // Refresh circuits list
      setCircuits(prev => prev.filter(c => c.id !== circuitToDelete.id));
      setCircuitToDelete(null);
      triggerFeedback('delete');
    } catch (err) {
      console.error('Failed to delete circuit:', err);
      alert('Failed to delete circuit. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSubmission = async (subId) => {
    if (!window.confirm("Permanently delete this submission? This cannot be undone.")) return;
    try {
      await deleteSubmission(subId, user.username);
      setSubmissions(prev => prev.filter(s => s.id !== subId));
      triggerFeedback('delete');
    } catch (e) {
      console.error(e);
      alert('Failed to delete submission.');
    }
  };

  const handleSyncToCloud = async (circuit) => {
    if (!navigator.onLine) {
      alert("You need to be online to sync to cloud!");
      return;
    }
    
    setSyncingIds(prev => new Set(prev).add(circuit.id));
    try {
      const synced = await syncCircuitToCloud(circuit, profileData.id);
      // Remove from local DB
      await deleteOfflineCircuit(circuit.id);
      // Update local state: swap local for remote or just refresh
      setCircuits(prev => prev.map(c => c.id === circuit.id ? synced : c));
      triggerFeedback('success');
    } catch (err) {
      console.error('Failed to sync circuit:', err);
      alert('Failed to sync to cloud. The name might already exist on your online account.');
    } finally {
      setSyncingIds(prev => {
        const next = new Set(prev);
        next.delete(circuit.id);
        return next;
      });
    }
  };

  const handleSyncAll = async () => {
    const localOnes = circuits.filter(c => c.is_offline_only);
    if (localOnes.length === 0) return;
    
    triggerFeedback('global');
    for (const c of localOnes) {
      await handleSyncToCloud(c);
    }
  };


  const [fetchError, setFetchError] = useState(null);

  const handleRenameCircuit = async (newName) => {
    if (!renameTarget) return;
    try {
      const updated = await renameCircuit(renameTarget.id, newName);
      setCircuits(circuits.map(c => 
        c.id === updated.id ? updated : c
      ));
      setRenameTarget(null);
    } catch (e) {
      console.error('Failed to rename circuit', e);
      alert('Failed to rename circuit.');
    }
  };


  const fetchData = React.useCallback(async () => {
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
        // Fetch leaderboard
        try {
          const lbData = await getLeaderboard(20);
          setLeaderboard(Array.isArray(lbData) ? lbData : []);
        } catch (_) {}
      } catch (e) {
        console.error(e);
        setFetchError(e.message || String(e));
      } finally { 
        setLoading(false); 
      }
    } else {
      // If no user yet, but called, we must eventually stop loading
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      <div className="flex-1 flex items-center justify-center flex-col">
        <p className="text-slate-500">Could not load profile.</p>
        {fetchError && <p className="text-red-500 text-xs mt-2">Error: {fetchError}</p>}
      </div>
    </div>
  );

  const rank = getRank(profileData.level || 1);
  const pointsToNext = (profileData.level || 1) * 100;
  const progressPct = Math.min(100, ((profileData.points || 0) / pointsToNext) * 100);
  const initials = user.username.slice(0, 2).toUpperCase();
  const allBadges = ['First Circuit', 'Perfect Score', 'Gates Master', 'Speed Demon'];

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden" style={{ background: 'var(--c-bg)' }}>
      <NavBar profileData={profileData} />

      {/* ══════════════════════════════════════════════════
          MOBILE / TABLET  — stacked scrollable layout
          (hidden on lg+)
         ══════════════════════════════════════════════════ */}
      <div className="lg:hidden flex-1 overflow-y-auto hidden-scrollbar w-full">
        <div className="max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
          {/* Back button */}
          <button 
            onClick={() => navigate('/playground')}
            className="self-start flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] transition-all duration-200 hover:translate-x-[-4px]"
            style={{ color: 'var(--c-text-muted)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Playground</span>
          </button>

        {/* Hero banner */}
        <div className="glass-panel p-6 flex flex-col sm:flex-row items-center gap-5 animate-slide-up shadow-2xl"
             style={{ 
               background: 'var(--c-surface)', 
               border: `1px solid color-mix(in srgb, ${rank.color}, transparent 80%)`, 
               boxShadow: `0 20px 50px -12px color-mix(in srgb, ${rank.color}, transparent 95%)` 
             }}>
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black select-none transition-all duration-300 avatar-neon-blue"
                 style={{
                   borderColor: rank.color,
                   boxShadow: `0 0 20px color-mix(in srgb, ${rank.color}, transparent 60%)`,
                   background: `linear-gradient(135deg, color-mix(in srgb, ${rank.color}, transparent 80%), color-mix(in srgb, ${rank.color}, transparent 90%))`
                 }}>
              {initials}
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-[9px] font-black tracking-[0.15em] uppercase shadow-lg border border-white/20 whitespace-nowrap"
                 style={{ background: rank.color, color: '#fff' }}>
              {rank.label}
            </div>
          </div>
          <div className="flex flex-col flex-1 w-full">
            <h1 className="text-2xl font-black mb-0.5" style={{ color: 'var(--c-text)' }}>{user.username}</h1>
            <p className="text-sm text-slate-400 mb-3">Level {profileData.level} · {rank.label}</p>
            <div className="flex gap-2 mb-3">
              <button 
                onClick={() => setShowChangePassword(true)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 border border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                Change Password
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-semibold">
                <span style={{ color: 'var(--neon-green)' }}>{profileData.points} XP</span>
                <div className="flex items-center gap-1 relative group">
                  <span className="text-slate-500">{pointsToNext} XP to Lv {(profileData.level || 1) + 1}</span>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold cursor-help"
                       style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)', color: 'var(--c-text-muted)' }}>?</div>
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[60] shadow-2xl"
                       style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text)', backdropFilter: 'blur(12px)' }}>
                    <div className="font-black text-[9px] uppercase tracking-widest mb-2 opacity-60 text-center">Rank Requirements</div>
                    <div className="absolute top-full right-2 -translate-y-1.5 w-2.5 h-2.5 rotate-45 border-b border-r"
                         style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }} />
                    <div className="flex flex-col gap-1.5 text-[10px] font-medium">
                      {[['Novice','#94a3b8','0–2'],['Apprentice','#10b981','3–5'],['Engineer','#3b82f6','6–9'],['Expert','#8b5cf6','10–14'],['Master','#f59e0b','15+']].map(([l,c,r]) => (
                        <div key={l} className="flex justify-between"><span style={{ color: c }}>{l}</span><span className="opacity-70">Lv {r}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="xp-bar-track"><div className="xp-bar-fill" style={{ width: `${progressPct}%` }} /></div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Level"   value={profileData.level || 1}          color="var(--neon-blue)"   icon={<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>} />
          <StatCard label="XP"      value={profileData.points || 0}         color="var(--neon-green)"  icon={<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>} />
          <StatCard label="Badges"  value={profileData.badges?.length || 0} color="var(--neon-amber)"  icon={<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>} />
          <StatCard label="Classes" value={classes.length}                  color="var(--neon-cyan)"   icon={<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
        </div>

        {/* My Classes */}
        <MobileClassesPanel classes={classes} joinCode={joinCode} setJoinCode={setJoinCode}
          joining={joining} joinError={joinError} handleJoinClass={handleJoinClass} />

        {/* Badges */}
        <MobileBadgesPanel allBadges={allBadges} profileData={profileData} />

        {/* Delete Account */}
        <div className="glass-panel p-5 shadow-xl flex flex-col items-center justify-center gap-3" style={{ border: '1px solid rgba(255,51,102,0.2)' }}>
          <button 
            onClick={() => { triggerFeedback('click'); setShowDeleteAccount(true); }}
            className="w-full btn-danger py-2 text-sm font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,51,102,0.3)] transition-all duration-300 hover:scale-105"
          >
            Delete Account
          </button>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest text-center">Irreversible Action</span>
        </div>

        {/* Leaderboard */}
        <LeaderboardPanel leaderboard={leaderboard} currentUsername={user.username} />

        {/* Saved Circuits */}
        <MobileCircuitsPanel 
          circuits={circuits} 
          navigate={navigate} 
          setCircuitToDelete={setCircuitToDelete} 
          setRenameTarget={setRenameTarget}
          handleSyncAll={handleSyncAll}
          handleSyncToCloud={handleSyncToCloud}
          syncingIds={syncingIds}
        />

        {/* Submissions */}
        <MobileSubmissionsPanel 
          submissions={submissions} 
          subsOpen={subsOpen} 
          setSubsOpen={setSubsOpen}
          handleDeleteSubmission={handleDeleteSubmission}
        />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          DESKTOP  — full-height two-column dashboard
          (hidden below lg)
         ══════════════════════════════════════════════════ */}
      <main className="hidden lg:flex flex-1 overflow-hidden">

        {/* ── Left sidebar: identity + stats + badges ── */}
        <aside className="flex-shrink-0 w-80 xl:w-96 flex flex-col gap-4 p-5 overflow-y-auto"
               style={{ borderRight: '1px solid var(--c-border-dim)' }}>
          {/* Back button */}
          <button 
            onClick={() => navigate('/playground')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200 hover:translate-x-[-4px] mb-2"
            style={{ color: 'var(--c-text-muted)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Playground</span>
          </button>

          {/* Hero card */}
          <div className="glass-panel p-6 flex flex-col items-center gap-4 animate-fade-in text-center"
               style={{ border: `1px solid ${rank.color}33`, boxShadow: `0 12px 40px -12px color-mix(in srgb, ${rank.color}, transparent 80%)` }}>
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black select-none transition-all duration-300 avatar-neon-blue"
                   style={{
                     borderColor: rank.color,
                     boxShadow: `0 0 32px color-mix(in srgb, ${rank.color}, transparent 60%), 0 8px 16px -4px color-mix(in srgb, ${rank.color}, transparent 50%)`,
                     background: `linear-gradient(135deg, color-mix(in srgb, ${rank.color}, transparent 80%), color-mix(in srgb, ${rank.color}, transparent 90%))`
                   }}>
                {initials}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase shadow-xl whitespace-nowrap border border-white/20"
                   style={{ background: rank.color, color: '#fff' }}>
                {rank.label}
              </div>
            </div>

            {/* Name & level */}
            <div className="mt-2 flex flex-col items-center gap-1">
              <h1 className="text-2xl font-black" style={{ color: 'var(--c-text)' }}>{user.username}</h1>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-1">Level {profileData.level} · {rank.label}</p>
              <button 
                onClick={() => setShowChangePassword(true)}
                className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 mb-2"
              >
                Update Password
              </button>
            </div>

            {/* XP Bar */}
            <div className="w-full flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span style={{ color: 'var(--neon-green)' }}>{profileData.points} XP</span>
                <div className="flex items-center gap-1 relative group">
                  <span className="text-slate-500">{pointsToNext} XP → Lv {(profileData.level || 1) + 1}</span>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold cursor-help"
                       style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)', color: 'var(--c-text-muted)' }}>?</div>
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-2xl"
                       style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}>
                    <div className="font-black text-[9px] uppercase tracking-widest mb-2 opacity-60 text-center">Rank Requirements</div>
                    <div className="absolute top-full right-2 -translate-y-1.5 w-2.5 h-2.5 rotate-45 border-b border-r"
                         style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }} />
                    <div className="flex flex-col gap-1.5 text-[10px] font-medium">
                      {[['Novice','#94a3b8','0–2'],['Apprentice','#10b981','3–5'],['Engineer','#3b82f6','6–9'],['Expert','#8b5cf6','10–14'],['Master','#f59e0b','15+']].map(([l,c,r]) => (
                        <div key={l} className="flex justify-between"><span style={{ color: c }}>{l}</span><span className="opacity-70">Lv {r}</span></div>
                      ))}
                      <div className="mt-1 pt-1 opacity-50 text-[9px] text-center" style={{ borderTop: '1px solid var(--c-border-dim)' }}>1 Lv = 100 XP</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="xp-bar-track"><div className="xp-bar-fill" style={{ width: `${progressPct}%` }} /></div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            <StatCard label="Level"   value={profileData.level || 1}          color="var(--neon-blue)"  icon={<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>} />
            <StatCard label="XP"      value={profileData.points || 0}         color="var(--neon-green)" icon={<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>} />
            <StatCard label="Badges"  value={profileData.badges?.length || 0} color="var(--neon-amber)" icon={<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>} />
            <StatCard label="Classes" value={classes.length}                  color="var(--neon-cyan)"  icon={<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
          </div>

          {/* Badges */}
          <div className="glass-panel p-5 animate-fade-in flex flex-col gap-3">
            <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--neon-amber)' }}>
              <svg width="1.1em" height="1.1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              Badges
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {allBadges.map(badge => {
                const earned = profileData.badges?.includes(badge);
                return (
                  <div key={badge}
                       className="relative flex flex-col items-center gap-1 p-2.5 rounded-xl cursor-default transition-all duration-200"
                       style={{
                         background: earned ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)',
                         border: `1px solid ${earned ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.06)'}`,
                         filter: earned ? 'none' : 'grayscale(1)',
                         opacity: earned ? 1 : 0.4,
                       }}>
                    <span className="text-xl">{earned ? (BADGE_ICONS[badge] || '🏆') : '?'}</span>
                    <span className="text-[8px] text-center text-slate-500 leading-tight">{badge.replace(/_/g, ' ')}</span>
                    {earned && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-[8px]"
                           style={{ background: 'var(--neon-green)', color: '#000' }}>✓</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Delete Account (Desktop) */}
          <div className="mt-auto glass-panel p-5 animate-fade-in flex flex-col items-center justify-center gap-2 border-red-500/20" style={{ border: '1px solid rgba(255,51,102,0.2)' }}>
            <button 
              onClick={() => { triggerFeedback('click'); setShowDeleteAccount(true); }}
              className="w-full btn-danger py-2.5 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,51,102,0.3)] transition-all duration-300 hover:scale-105"
            >
              Delete Account
            </button>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Irreversible Action</span>
          </div>

          {/* Reset Dismissed Assignments (Desktop) */}
          <div className="glass-panel p-5 animate-fade-in flex flex-col items-center justify-center gap-2" style={{ border: '1px solid var(--c-border-dim)' }}>
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--c-text-muted)' }}>Preferences</h3>
            <button 
              onClick={async () => {
                if (window.confirm("Show all previously hidden assignments?")) {
                  try {
                    await resetDismissedAssignments(user.username);
                    triggerFeedback('success');
                    await fetchData(); // Refresh data without reload
                  } catch (e) { alert("Failed to reset assignments"); }
                }
              }}
              className="w-full py-2.5 text-[10px] font-black rounded-xl transition-all duration-200 hover:bg-white/5 uppercase tracking-wider"
              style={{ border: '1px solid var(--c-border-dim)', color: 'var(--c-text-muted)' }}
            >
              Reset Hidden Assignments
            </button>
          </div>
        </aside>

        {/* ── Right panel: classes + circuits + submissions + leaderboard ── */}
        <section className="flex-1 flex flex-col gap-4 p-5 overflow-y-auto min-w-0">

          {/* My Classes */}
          <div className="glass-panel p-5 animate-fade-in flex-shrink-0">
            <div className="flex items-center mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: '#0ea5e9' }}>
                <svg width="1.1em" height="1.1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                My Classes
              </h2>
              {/* Tooltip Icon */}
              <div className="relative group ml-auto">
                <div className="w-4 h-4 rounded-full flex items-center justify-center cursor-help text-[9px] font-black select-none transition-colors"
                     style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)', color: 'var(--c-text-muted)' }}>
                  i
                </div>
                <div className="absolute right-0 top-full mt-2 w-64 px-4 py-3 rounded-xl text-[11px] leading-relaxed font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[9999] shadow-2xl"
                     style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text)', backdropFilter: 'blur(8px)' }}>
                  <b style={{ color: 'var(--neon-blue)' }}>About Classes</b><br/>
                  Enroll using a 6-letter Join Code provided by your teacher. Once enrolled, you can complete and submit custom assignments directly to their dashboard!
                  <div className="absolute bottom-full right-1.5 -translate-y-[1px] w-2.5 h-2.5 rotate-45 border-t border-l"
                       style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <form onSubmit={handleJoinClass} className="flex gap-2">
                <input type="text" placeholder="Enter Join Code..." value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  className="flex-1 max-w-[200px] px-4 py-2 text-sm rounded-xl outline-none transition-all duration-200 uppercase font-mono"
                  style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)', color: 'var(--c-text)' }}
                  maxLength={6} />
                <button type="submit" disabled={joining || !joinCode.trim()}
                  className="px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 disabled:opacity-50"
                  style={{ background: 'color-mix(in srgb, var(--neon-blue), transparent 85%)', border: '1px solid color-mix(in srgb, var(--neon-blue), transparent 60%)', color: 'var(--neon-blue)' }}>
                  {joining ? '...' : 'Join'}
                </button>
              </form>
              {joinError && <p className="text-xs text-red-400">{joinError}</p>}
              {classes.length === 0 ? (
                <p className="text-slate-500 text-sm">You are not enrolled in any classes yet.</p>
              ) : (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                  {classes.map(c => {
                    const enrollState = profileData?.enrollments?.find(e => e.classroom_id === c.id);
                    const isPending = enrollState && enrollState.status === 'pending';

                    return (
                      <div key={c.id} 
                           onClick={(e) => {
                             if (e.target.closest('.leave-btn')) return;
                             setViewingClass(c);
                           }}
                           className="p-4 rounded-xl flex flex-col gap-2 transition-all duration-200 hover:scale-[1.02] cursor-pointer group relative"
                           style={{ background: 'var(--c-surface-2)', border: isPending ? '1px solid rgba(255,165,0,0.3)' : '1px solid var(--c-border-dim)' }}>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-sm" style={{ color: 'var(--c-text)' }}>{c.name}</span>
                          <button 
                            onClick={() => setClassToLeave(c)}
                            title="Leave Class"
                            className="leave-btn opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          {isPending ? (
                            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,165,0,0.1)', color: 'orange' }}>
                              Pending Teacher Approval
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Enrolled</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <LeaderboardPanel leaderboard={leaderboard} currentUsername={user.username} />

          {/* Saved Circuits */}
          <div className="glass-panel p-5 animate-fade-in flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--neon-blue)' }}>
                <svg width="1.1em" height="1.1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                Saved Circuits
                {circuits.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black"
                        style={{ background: 'rgba(0,212,255,0.12)', color: 'var(--neon-blue)', border: '1px solid rgba(0,212,255,0.25)' }}>
                    {circuits.length}
                  </span>
                )}
              </h2>
              <div className="flex gap-2">
                {circuits.some(c => c.is_offline_only) && navigator.onLine && (
                  <button onClick={handleSyncAll} className="btn-ghost text-[10px] py-1.5 px-3 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
                    ☁️ Sync All
                  </button>
                )}
                <Link to="/playground" className="btn-primary text-xs py-1.5 px-3">+ New Circuit</Link>
              </div>
            </div>
            {circuits.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2 flex justify-center opacity-20"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
                <p className="text-slate-600 text-sm italic">No circuits saved yet — start building!</p>
                <Link to="/playground" className="btn-ghost mt-3 text-xs inline-flex">Go to Playground →</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {circuits.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors hover:bg-white/5"
                       style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)' }}>
                    <div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{c.circuit_data?.name || `Circuit #${c.id}`}</span>
                      {c.is_offline_only && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ml-2"
                              style={{ background: 'rgba(255,165,0,0.1)', color: 'orange', border: '1px solid rgba(255,165,0,0.2)' }}>
                          Local Only
                        </span>
                      )}
                      <span className="text-xs text-slate-600 ml-3">{new Date(c.created_at || c.saved_at).toLocaleDateString()}</span>
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
                      <button onClick={() => navigate('/playground', { state: { loadCircuit: c } })}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
                        style={{ border: '1px solid rgba(0,212,255,0.3)', color: 'var(--neon-blue)' }}>
                        Load
                      </button>
                      <button onClick={() => setRenameTarget(c)}
                        className="text-xs font-bold p-1.5 rounded-lg transition-all duration-200 hover:bg-sky-500/10 group/edit"
                        style={{ border: '1px solid var(--c-border-dim)' }} title="Rename Circuit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                             className="text-slate-500 group-hover/edit:text-sky-500 transition-colors">
                          <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                      {c.is_offline_only && navigator.onLine && (
                        <button 
                          onClick={() => handleSyncToCloud(c)}
                          disabled={syncingIds.has(c.id)}
                          className="text-xs font-bold p-1.5 rounded-lg transition-all duration-200 hover:bg-emerald-500/10 group/sync"
                          style={{ border: '1px solid var(--c-border-dim)' }} title="Sync to Cloud"
                        >
                          {syncingIds.has(c.id) ? (
                            <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
                          ) : (
                            <span className="text-emerald-500 group-hover/sync:scale-110 transition-transform">☁️</span>
                          )}
                        </button>
                      )}
                      <button onClick={() => setCircuitToDelete(c)}
                        className="text-xs font-bold p-1.5 rounded-lg transition-all duration-200 hover:bg-red-500/10 group/del"
                        style={{ border: '1px solid var(--c-border-dim)' }} title="Delete Circuit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                             className="text-slate-500 group-hover/del:text-red-500 transition-colors">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Submissions */}
          <div className="glass-panel p-5 animate-fade-in flex-shrink-0">
            <button onClick={() => setSubsOpen(o => !o)} className="w-full flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--neon-blue)' }}>
                <svg width="1.1em" height="1.1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                My Submissions
                {submissions.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black"
                        style={{ background: 'rgba(0,212,255,0.12)', color: 'var(--neon-blue)', border: '1px solid rgba(0,212,255,0.25)' }}>
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
                <div className="text-center py-6">
                  <p className="text-slate-600 text-sm italic">No submissions yet — submit a circuit from the Playground!</p>
                  <Link to="/playground" className="btn-ghost mt-3 text-xs inline-flex">Go to Playground →</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {submissions.map(sub => {
                    const isGraded = sub.status === 'graded';
                    const isNew = isGraded && sub.teacher_score != null;
                    return <SubmissionCard key={sub.id} sub={sub} isNew={isNew} onDelete={handleDeleteSubmission} />;
                  })}
                </div>
              )
            )}
          </div>

        </section>
      </main>

      <ConfirmModal
        isOpen={!!circuitToDelete}
        title="Delete Circuit"
        message={`Are you sure you want to delete "${circuitToDelete?.circuit_data?.name || `Circuit #${circuitToDelete?.id}`}"?`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDeleteCircuit}
        onCancel={() => setCircuitToDelete(null)}
        danger={true}
      />
      <ConfirmModal
        isOpen={!!classToLeave}
        title="Leave Classroom"
        message={`Are you sure you want to completely unenroll from "${classToLeave?.name}"? You will lose access to assignments and will not be able to submit circuits until you rejoin.`}
        confirmLabel={leavingClass ? 'Leaving...' : 'Leave Class'}
        onConfirm={handleLeaveClass}
        onCancel={() => setClassToLeave(null)}
        danger={true}
      />
      <ChangePasswordModal 
        isOpen={showChangePassword} 
        onClose={() => setShowChangePassword(false)} 
        username={user.username} 
      />
      <ClassAssignmentsModal
        isOpen={!!viewingClass}
        classData={viewingClass}
        studentUsername={user?.username}
        onCancel={() => setViewingClass(null)}
      />
      <RenameModal
        isOpen={!!renameTarget}
        initialName={renameTarget?.circuit_data?.name || `Circuit #${renameTarget?.id || ''}`}
        onConfirm={handleRenameCircuit}
        onCancel={() => setRenameTarget(null)}
      />
      <TypeToConfirmModal
        isOpen={showDeleteAccount}
        title="Delete Account"
        message="Are you completely sure? This will permanently delete your account, all your saved circuits, and your class enrollments. This action cannot be undone."
        expectedText={user.username}
        confirmLabel={deletingAccount ? 'Deleting...' : 'Delete Account'}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteAccount(false)}
      />
      <ConfirmModal
        isOpen={showJoinConfirm}
        title="Join Classroom?"
        message={`Are you sure you want to join the classroom with code "${joinCode}"?`}
        confirmLabel={joining ? 'Joining...' : 'Join Class'}
        onConfirm={confirmJoinClass}
        onCancel={() => setShowJoinConfirm(false)}
      />
      <ConfirmModal
        isOpen={showAlreadyJoined}
        title="Already Enrolled"
        message={`You are already enrolled in "${alreadyJoinedClass}".`}
        confirmLabel="OK"
        onConfirm={() => { setShowAlreadyJoined(false); setJoinCode(''); }}
        onCancel={() => { setShowAlreadyJoined(false); setJoinCode(''); }}
        hideCancel={true}
      />
    </div>
  );
};

// ── Submission Card ──────────────────────────────────────────────
const SubmissionCard = ({ sub, isNew, onDelete }) => {
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
           background: 'var(--c-surface-2)',
           border: `1px solid ${isNew ? 'var(--neon-purple)' : 'var(--c-border-dim)'}`,
           boxShadow: isNew ? '0 0 16px rgba(124,58,237,0.1)' : 'none',
         }}>
      {/* Card header — always visible */}
      <div className="flex items-center gap-1 pr-2">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex-1 flex items-center gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
        >
          {/* Status dot */}
          <div className="w-2 h-2 rounded-full flex-shrink-0"
               style={{ background: isGraded ? '#39ff14' : '#ffd700', boxShadow: isGraded ? '0 0 6px #39ff14' : 'none' }} />

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: 'var(--c-text)' }}>{sub.assignment_title || `Assignment #${sub.assignment_id}`}</p>
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

        {/* Delete Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(sub.id); }}
          className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-colors"
          title="Delete Submission"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>

      {/* Expandable feedback */}
      {open && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-3 animate-fade-in"
             style={{ borderTop: '1px solid var(--c-border-dim)' }}>
          {isGraded ? (
            <>
              {sub.teacher_score != null && (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Teacher Score</span>
                    <span className="font-black" style={{ color: scoreColor }}>{sub.teacher_score}/100</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--c-surface-3)' }}>
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


// ── Mobile-only panel helpers ─────────────────────────────────────
const MobileClassesPanel = ({ classes, joinCode, setJoinCode, joining, joinError, handleJoinClass }) => (
  <div className="glass-panel p-5 shadow-xl">
    <div className="flex items-center mb-4">
      <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: '#0ea5e9' }}>
        <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        My Classes
      </h2>
      {/* Tooltip Icon */}
      <div className="relative group ml-auto z-[9999]">
        <div className="w-4 h-4 rounded-full flex items-center justify-center cursor-help text-[9px] font-black select-none transition-colors"
             style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)', color: 'var(--c-text-muted)' }}>
          i
        </div>
        <div className="absolute right-0 top-full mt-2 w-64 px-4 py-3 rounded-xl text-[11px] leading-relaxed font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-2xl"
             style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text)', backdropFilter: 'blur(8px)' }}>
          <b style={{ color: 'var(--neon-blue)' }}>About Classes</b><br/>
          Enroll using a 6-letter Join Code provided by your teacher. Once enrolled, you can complete and submit custom assignments directly to their dashboard!
          <div className="absolute bottom-full right-1.5 -translate-y-[1px] w-2.5 h-2.5 rotate-45 border-t border-l"
               style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }} />
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-3">
      {/* Search/Join form */}
      <form onSubmit={handleJoinClass} className="flex gap-2">
        <input type="text" placeholder="Enter Join Code..." value={joinCode}
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
          className="flex-1 max-w-[200px] px-4 py-2 text-sm rounded-xl outline-none uppercase font-mono"
          style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)', color: 'var(--c-text)' }}
          maxLength={6} />
        <button type="submit" disabled={joining || !joinCode.trim()}
          className="px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 disabled:opacity-50"
          style={{ background: 'color-mix(in srgb, var(--neon-blue), transparent 85%)', border: '1px solid color-mix(in srgb, var(--neon-blue), transparent 60%)', color: 'var(--neon-blue)' }}>
          {joining ? '...' : 'Join'}
        </button>
      </form>
      
      {/* Mobile Reset (Preferences) */}
      <div className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1" style={{ color: 'var(--c-text-muted)' }}>Preferences</p>
          <p className="text-[10px] text-slate-500">Restore all hidden assignments</p>
        </div>
        <button 
          onClick={async () => {
            if (window.confirm("Show all previously hidden assignments?")) {
              try {
                await resetDismissedAssignments(profileData.username);
                triggerFeedback('success');
                window.location.reload(); // Refresh to see changes
              } catch (e) { alert("Failed to reset assignments"); }
            }
          }}
          className="px-3 py-1.5 text-[9px] font-black rounded-lg border border-slate-600/30 text-slate-400 hover:bg-white/5 active:scale-95 transition-all"
        >
          RESET
        </button>
      </div>

      {joinError && <p className="text-xs text-red-400">{joinError}</p>}
      {classes.length === 0 ? (
        <p className="text-slate-500 text-sm">You are not enrolled in any classes yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {classes.map(c => (
            <div key={c.id} 
                 onClick={(e) => {
                   if (e.target.closest('.leave-btn')) return;
                   setViewingClass(c);
                 }}
                 className="p-4 rounded-xl flex flex-col gap-1 transition-all group cursor-pointer"
                 style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)' }}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm" style={{ color: 'var(--c-text)' }}>{c.name}</span>
                <button 
                  onClick={() => setClassToLeave(c)}
                  className="leave-btn p-1.5 rounded-lg bg-red-500/10 text-red-500"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              </div>
              <span className="text-xs text-slate-400">Enrolled</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const MobileBadgesPanel = ({ allBadges, profileData }) => {
  const BADGE_ICONS_LOCAL = {
    'First Circuit': <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>,
    'Perfect Score': <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
    'Gates Master':  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    'Speed Demon':   <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  };
  return (
    <div className="glass-panel p-5 shadow-xl">
      <h2 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--neon-amber)' }}>
        <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
        Badges
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {allBadges.map(badge => {
          const earned = profileData.badges?.includes(badge);
          return (
            <div key={badge} className="relative flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-default"
                 style={{ 
                   background: earned ? 'rgba(245,158,11,0.1)' : 'var(--c-surface-2)', 
                   border: `1px solid ${earned ? 'rgba(245,158,11,0.35)' : 'var(--c-border-dim)'}`, 
                   filter: earned ? 'none' : 'grayscale(1)', 
                   opacity: earned ? 1 : 0.4 
                 }}>
              <span className="text-2xl">{earned ? (BADGE_ICONS_LOCAL[badge] || '🏆') : '?'}</span>
              <span className="text-[9px] text-center text-slate-500 leading-tight">{badge.replace(/_/g, ' ')}</span>
              {earned && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-[8px]" style={{ background: 'var(--neon-green)', color: '#000' }}>✓</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MobileCircuitsPanel = ({ 
  circuits, navigate, setCircuitToDelete, setRenameTarget, 
  handleSyncAll, handleSyncToCloud, syncingIds 
}) => (
  <div className="glass-panel p-5 shadow-xl">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--neon-blue)' }}>
        <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        Saved Circuits
      </h2>
      <div className="flex gap-2">
        {circuits.some(c => c.is_offline_only) && navigator.onLine && (
          <button onClick={handleSyncAll} className="btn-ghost text-[9px] py-1.5 px-2.5 border-emerald-500/30 text-emerald-500">
            ☁️ Sync
          </button>
        )}
        <Link to="/playground" className="btn-primary text-[10px] py-1.5 px-2.5">+ New</Link>
      </div>
    </div>
    {circuits.length === 0 ? (
      <div className="text-center py-6">
        <p className="text-slate-600 text-sm italic">No circuits saved yet — start building!</p>
        <Link to="/playground" className="btn-ghost mt-3 text-xs inline-flex">Go to Playground →</Link>
      </div>
    ) : (
      <div className="flex flex-col gap-2">
        {circuits.map(c => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
               style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)' }}>
            <div>
              <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{c.circuit_data?.name || `Circuit #${c.id}`}</span>
              {c.is_offline_only && (
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ml-2"
                      style={{ background: 'rgba(255,165,0,0.1)', color: 'orange', border: '1px solid rgba(255,165,0,0.2)' }}>
                  Local Only
                </span>
              )}
              <span className="text-xs text-slate-600 ml-3">{new Date(c.created_at || c.saved_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ color: c.score >= 100 ? 'var(--neon-green)' : 'var(--neon-amber)', background: c.score >= 100 ? 'rgba(57,255,20,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${c.score >= 100 ? 'rgba(57,255,20,0.25)' : 'rgba(245,158,11,0.25)'}` }}>
                {c.score >= 100 ? '✓ ' : ''}{c.score || 'N/A'}
              </span>
              <button onClick={() => navigate('/playground', { state: { loadCircuit: c } })}
                className="text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/10"
                style={{ border: '1px solid rgba(0,212,255,0.3)', color: 'var(--neon-blue)' }}>Load</button>
              {c.is_offline_only && navigator.onLine && (
                <button 
                  onClick={() => handleSyncToCloud(c)}
                  disabled={syncingIds.has(c.id)}
                  className="p-1.5 rounded-lg border border-emerald-500/30 text-emerald-500 text-xs"
                >
                  {syncingIds.has(c.id) ? (
                    <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
                  ) : '☁️'}
                </button>
              )}
              <button onClick={() => setCircuitToDelete(c)}
                className="text-xs font-bold p-1.5 rounded-lg hover:bg-red-500/10 group/del"
                style={{ border: '1px solid var(--c-border-dim)' }} title="Delete Circuit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover/del:text-red-500 transition-colors">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const MobileSubmissionsPanel = ({ 
  submissions, subsOpen, setSubsOpen, handleDeleteSubmission 
}) => (
  <div className="glass-panel p-5 shadow-xl">
    <button onClick={() => setSubsOpen(o => !o)} className="w-full flex items-center justify-between mb-4">
      <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--neon-blue)' }}>
        <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        My Submissions
        {submissions.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black"
                style={{ background: 'rgba(0,212,255,0.12)', color: 'var(--neon-blue)', border: '1px solid rgba(0,212,255,0.25)' }}>
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
        <div className="text-center py-6">
          <p className="text-slate-600 text-sm italic">No submissions yet — submit a circuit from the Playground!</p>
          <Link to="/playground" className="btn-ghost mt-3 text-xs inline-flex">Go to Playground →</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {submissions.map(sub => {
            const isGraded = sub.status === 'graded';
            const isNew = isGraded && sub.teacher_score != null;
            return <SubmissionCard key={sub.id} sub={sub} isNew={isNew} onDelete={handleDeleteSubmission} />;
          })}
        </div>
      )
    )}
  </div>
);

// ── Leaderboard Panel (shared by mobile + desktop) ────────────────
const MEDAL_LABELS = ['🥇', '🥈', '🥉'];

const LeaderboardPanel = ({ leaderboard, currentUsername }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!leaderboard || leaderboard.length === 0) return null;

  const topXP = leaderboard[0]?.points || 1;
  const playerIdx = leaderboard.findIndex(p => p.username === currentUsername);
  
  const displayedPlayers = isExpanded 
    ? leaderboard 
    : (() => {
        const top3 = leaderboard.slice(0, 3);
        if (playerIdx >= 3) {
          // Add dummy rank property or just pass the full object
          return [...top3, leaderboard[playerIdx]];
        }
        return top3;
      })();

  return (
    <div className="glass-panel p-5 animate-fade-in flex-shrink-0">
      {/* Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 group/lb"
      >
        <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors group-hover/lb:text-white" style={{ color: 'var(--neon-amber)' }}>
          <svg width="1.1em" height="1.1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Leaderboard
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">
            {isExpanded ? `Top ${leaderboard.length}` : (playerIdx >= 3 ? "Top 3 + You" : "Top 3")}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" 
               className="text-slate-500 transition-transform duration-200"
               style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      <div className="flex flex-col gap-1.5">
        {displayedPlayers.map((player) => {
          // Find original index for rank number
          const originalIdx = leaderboard.findIndex(p => p.id === player.id);
          const isMe = player.username === currentUsername;
          const barPct = Math.max(6, Math.round((player.points / topXP) * 100));
          const rank = getRank(player.level || 1);
          const medal = originalIdx < 3 ? MEDAL_LABELS[originalIdx] : null;

          return (
            <div
              key={player.id}
              className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200"
              style={{
                background: isMe
                  ? 'linear-gradient(90deg, rgba(0,212,255,0.1), rgba(0,212,255,0.04))'
                  : originalIdx === 0
                  ? 'linear-gradient(90deg, rgba(255,215,0,0.07), transparent)'
                  : 'var(--c-surface-2)',
                border: isMe
                  ? '1px solid rgba(0,212,255,0.3)'
                  : originalIdx === 0
                  ? '1px solid rgba(255,215,0,0.2)'
                  : '1px solid var(--c-border-dim)',
                boxShadow: isMe ? '0 0 12px rgba(0,212,255,0.08)' : 'none',
              }}
            >
              {/* Rank number / medal */}
              <div className="w-6 text-center flex-shrink-0">
                {medal ? (
                  <span className="text-base leading-none">{medal}</span>
                ) : (
                  <span className="text-[11px] font-black" style={{ color: 'var(--c-text-muted)' }}>#{originalIdx + 1}</span>
                )}
              </div>

              {/* Avatar initial */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0"
                style={{
                  background: `${rank.color}22`,
                  border: `1.5px solid ${rank.color}55`,
                  color: rank.color,
                }}
              >
                {player.username.slice(0, 2).toUpperCase()}
              </div>

              {/* Name + XP bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className="text-xs font-bold truncate"
                    style={{ color: isMe ? 'var(--neon-blue)' : 'var(--c-text)' }}
                  >
                    {player.username}{isMe && ' (You)'}
                  </span>
                  <span className="text-[10px] font-black ml-2 flex-shrink-0" style={{ color: 'var(--neon-green)' }}>
                    {player.points} XP
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--c-surface-3)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${barPct}%`,
                      background: originalIdx === 0
                        ? 'linear-gradient(90deg, #f59e0b, #ffd700)'
                        : isMe
                        ? 'linear-gradient(90deg, #0ea5e9, #00d4ff)'
                        : `linear-gradient(90deg, ${rank.color}88, ${rank.color}44)`,
                      boxShadow: isMe ? '0 0 6px rgba(0,212,255,0.5)' : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Level badge */}
              <div
                className="flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black"
                style={{
                  background: `${rank.color}18`,
                  border: `1px solid ${rank.color}40`,
                  color: rank.color,
                }}
              >
                Lv {player.level}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Profile;

