import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import CreateAssignmentModal from '../components/CreateAssignmentModal';
import EditAssignmentModal from '../components/EditAssignmentModal';
import SubmissionReviewModal from '../components/SubmissionReviewModal';
import { useToast } from '../components/ToastNotification';
import {
  getAssignmentsByTeacher,
  getSubmissionsByAssignment,
  deleteAssignment,
  getAllStudents,
  getTeacherClassrooms,
  createClassroom,
  getClassroomStudents,
} from '../utils/api';

// ── Helpers ──────────────────────────────────────────────────────

const formatDate = (dt) => {
  if (!dt) return null;
  const d = new Date(dt);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const DeadlineChip = ({ dueDate, acceptLate }) => {
  if (!dueDate) return <span className="text-[10px] text-slate-500">No deadline</span>;
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due - now;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  let color = '#39ff14'; let label = formatDate(dueDate);
  if (diffMs < 0) {
    color = '#ff3366'; label = `Past due · ${formatDate(dueDate)}`;
  } else if (diffDays < 2) {
    color = '#ffd700'; label = `Due soon · ${formatDate(dueDate)}`;
  }
  return (
    <span className="text-[10px] font-semibold" style={{ color }}>
      {acceptLate && diffMs < 0 ? '⚠ ' : '📅 '}
      {label}
      {acceptLate && diffMs < 0 && <span className="text-slate-500 ml-1">(late ok)</span>}
    </span>
  );
};

const StatusPill = ({ status }) => {
  const isGraded = status === 'graded';
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
          style={{
            background: isGraded ? 'rgba(57,255,20,0.12)' : 'rgba(255,215,0,0.12)',
            border: `1px solid ${isGraded ? 'rgba(57,255,20,0.35)' : 'rgba(255,215,0,0.35)'}`,
            color: isGraded ? '#39ff14' : '#ffd700',
          }}>
      {isGraded ? '✓ Graded' : '⏳ Pending'}
    </span>
  );
};

const ScoreChip = ({ score, label }) => {
  if (score == null) return <span className="text-[10px] text-slate-600">—</span>;
  const color = score >= 80 ? '#39ff14' : score >= 50 ? '#ffd700' : '#ff3366';
  return (
    <span className="text-xs font-black" style={{ color }}>
      {score}<span className="text-[10px] text-slate-500 font-normal ml-0.5">/{label || 100}</span>
    </span>
  );
};

const TABS = ['My Classes', 'Assignments', 'Submissions', 'Analytics'];

const TAB_META = {
  'My Classes': {
    color: '#a78bfa',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  'Assignments': {
    color: '#00d4ff',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  'Submissions': {
    color: '#ffd700',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
  },
  'Analytics': {
    color: '#39ff14',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
};

// ── Analytics sub-components ─────────────────────────────────────

const MiniStatCard = ({ label, value, color, sub }) => (
  <div className="flex flex-col gap-1 p-4 rounded-2xl" style={{ background: `${color}0d`, border: `1px solid ${color}28` }}>
    <span className="text-2xl font-black" style={{ color }}>{value}</span>
    <span className="text-[11px] font-bold text-white">{label}</span>
    {sub && <span className="text-[10px] text-slate-500">{sub}</span>}
  </div>
);

const ScoreBar = ({ label, pct, color, count }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] text-slate-400 w-16 flex-shrink-0 text-right">{label}</span>
    <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
    <span className="text-[10px] font-bold text-slate-400 w-6 text-right">{count}</span>
  </div>
);

// ── Main Component ───────────────────────────────────────────────

const TeacherDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const addToast = useToast();

  const [activeTab, setActiveTab] = useState('My Classes');
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [classroomStudents, setClassroomStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [creatingClass, setCreatingClass] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  // ── Data fetchers ──
  const fetchClassrooms = useCallback(async () => {
    if (!user?.username) return;
    setLoadingClassrooms(true);
    try {
      const data = await getTeacherClassrooms(user.username);
      setClassrooms(data);
    } catch (e) {
      addToast('error', 'Failed to load classes');
    } finally {
      setLoadingClassrooms(false);
    }
  }, [user?.username]);

  const fetchAssignments = useCallback(async () => {
    if (!user?.username) return;
    setLoadingAssignments(true);
    try {
      const data = await getAssignmentsByTeacher(user.username);
      setAssignments(data);
    } catch (e) {
      addToast('error', 'Failed to load assignments');
    } finally {
      setLoadingAssignments(false);
    }
  }, [user?.username]);

  const fetchSubmissions = useCallback(async (assignmentId) => {
    setLoadingSubmissions(true);
    try {
      const data = await getSubmissionsByAssignment(assignmentId);
      setSubmissions(data);
    } catch (e) {
      addToast('error', 'Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (e) {
      /* non-fatal */
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);
  useEffect(() => { fetchClassrooms(); }, [fetchClassrooms]);
  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => {
    if (activeTab === 'Analytics') {
      fetchStudents();
      // Fetch all submissions for every assignment for analytics
      const fetchAll = async () => {
        setLoadingAnalytics(true);
        try {
          const data = await getAssignmentsByTeacher(user?.username);
          const subs = await Promise.all(
            (data || []).map(a =>
              getSubmissionsByAssignment(a.id).then(s => s.map(x => ({ ...x, assignment_title: a.title, max_score: 100 }))).catch(() => [])
            )
          );
          setAllSubmissions(subs.flat());
        } catch (_) {}
        finally { setLoadingAnalytics(false); }
      };
      fetchAll();
    }
  }, [activeTab, fetchStudents, user?.username]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setCreatingClass(true);
    try {
      await createClassroom(user.username, newClassName.trim());
      setNewClassName('');
      addToast('success', 'Class created!');
      fetchClassrooms();
    } catch (e) {
      addToast('error', 'Failed to create class');
    } finally {
      setCreatingClass(false);
    }
  };

  const handleSelectClassroom = async (cls) => {
    setSelectedClassroom(cls);
    setLoadingStudents(true);
    try {
      const data = await getClassroomStudents(cls.id);
      setClassroomStudents(data);
    } catch (e) {
      addToast('error', 'Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSelectAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setActiveTab('Submissions');
    fetchSubmissions(assignment.id);
  };

  const handleDeleteAssignment = async (assignment) => {
    if (!window.confirm(`Delete "${assignment.title}"? All submissions will be lost.`)) return;
    try {
      await deleteAssignment(assignment.id, user.username);
      addToast('success', 'Assignment deleted');
      fetchAssignments();
      if (selectedAssignment?.id === assignment.id) {
        setSelectedAssignment(null);
        setActiveTab('Assignments');
      }
    } catch (e) {
      addToast('error', 'Failed to delete assignment');
    }
  };

  const handleGraded = () => {
    if (selectedAssignment) fetchSubmissions(selectedAssignment.id);
    addToast('success', 'Grade saved!');
  };

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden" style={{ background: 'var(--c-bg)' }}>
      {/* Background accent */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[100px]"
             style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      </div>

      <div className="z-10 relative"><NavBar profileData={{ points: 0, level: 1, badges: [] }} /></div>

      {/* Main Layout Container */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden z-10 relative">
        
        {/* ── Sidebar ── */}
        <aside className="w-full md:w-72 flex-shrink-0 flex flex-col pb-2 md:pb-0 overflow-y-auto hidden-scrollbar"
               style={{ borderRight: '1px solid rgba(124,58,237,0.12)', background: 'linear-gradient(180deg, rgba(15,5,30,0.98) 0%, rgba(10,3,20,0.98) 100%)' }}>

          {/* Teacher Profile Card */}
          <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 select-none"
                   style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(167,139,250,0.2))', border: '1px solid rgba(124,58,237,0.5)', color: '#c4b5fd', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-sm truncate">{user?.username}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#39ff14', boxShadow: '0 0 6px #39ff14' }} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instructor</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Classes', value: classrooms.length, color: '#a78bfa' },
                { label: 'Tasks', value: assignments.length, color: '#00d4ff' },
                { label: 'Students', value: students.length || '—', color: '#39ff14' },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center py-2 rounded-xl" style={{ background: `${s.color}10`, border: `1px solid ${s.color}22` }}>
                  <span className="text-base font-black" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-tight mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex md:flex-col gap-1 p-3 overflow-x-auto md:overflow-visible hidden-scrollbar"
               style={{ WebkitOverflowScrolling: 'touch' }}>
            {TABS.map(tab => {
              const meta = TAB_META[tab];
              const isActive = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                        className="group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left whitespace-nowrap w-full relative overflow-hidden"
                        style={{
                          background: isActive ? `${meta.color}15` : 'transparent',
                          border: isActive ? `1px solid ${meta.color}35` : '1px solid transparent',
                        }}>
                  {/* Active bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                         style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
                  )}
                  <span className="flex-shrink-0 transition-all duration-200"
                        style={{ color: isActive ? meta.color : 'rgba(255,255,255,0.3)', filter: isActive ? `drop-shadow(0 0 6px ${meta.color})` : 'none' }}>
                    {meta.icon}
                  </span>
                  <span className="text-sm font-bold transition-colors duration-200 flex-1"
                        style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                    {tab}
                  </span>
                  {tab === 'Submissions' && selectedAssignment && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] leading-none font-black flex-shrink-0"
                          style={{ background: 'rgba(255,215,0,0.2)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)' }}>
                      {submissions.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mini Leaderboard Preview (desktop only) */}
          {students.length > 0 && (
            <div className="hidden md:block px-4 py-4 mx-3 mb-3 rounded-2xl" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: '#00d4ff' }}>Top Students</p>
              <div className="flex flex-col gap-2">
                {[...students].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 3).map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className="text-sm flex-shrink-0">{['🥇','🥈','🥉'][i]}</span>
                    <span className="text-xs text-slate-300 font-semibold flex-1 truncate">{s.username}</span>
                    <span className="text-xs font-black flex-shrink-0" style={{ color: '#00d4ff' }}>{s.points || 0}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveTab('Analytics')} className="mt-3 text-[9px] font-black uppercase tracking-widest w-full text-center transition-colors hover:text-white" style={{ color: 'rgba(0,212,255,0.5)' }}>View Full Analytics →</button>
            </div>
          )}

          {/* New Assignment Button */}
          <div className="mt-auto p-4 hidden md:block">
            <button
              onClick={() => setShowCreate(true)}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
                border: '1px solid rgba(124,58,237,0.5)',
                color: '#fff',
                boxShadow: '0 0 24px rgba(124,58,237,0.3)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Assignment
            </button>
          </div>
        </aside>

        {/* Floating action button for mobile */}
        <div className="md:hidden fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowCreate(true)}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
              border: '1px solid rgba(124,58,237,0.5)',
              color: '#fff',
              boxShadow: '0 8px 32px rgba(124,58,237,0.45)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* ── Content Area ── */}
        <main className="flex-1 overflow-y-auto hidden-scrollbar" style={{ background: 'rgba(6,11,20,0.7)' }}>
          {/* Content header */}
          <div className="px-6 md:px-8 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span style={{ color: TAB_META[activeTab].color, filter: `drop-shadow(0 0 6px ${TAB_META[activeTab].color})` }}>
                  {TAB_META[activeTab].icon}
                </span>
                <h2 className="text-lg font-black text-white">{activeTab}</h2>
              </div>
              <p className="text-xs text-slate-500">
                {activeTab === 'My Classes' && `${classrooms.length} class${classrooms.length !== 1 ? 'es' : ''} · click a class to view students`}
                {activeTab === 'Assignments' && `${assignments.length} total · click to view submissions`}
                {activeTab === 'Submissions' && (selectedAssignment ? `Reviewing: ${selectedAssignment.title}` : 'Select an assignment to review')}
                {activeTab === 'Analytics' && 'Performance overview · score distribution · leaderboard'}
              </p>
            </div>
          </div>
          <div className="px-6 md:px-8 pt-6 pb-24 md:pb-10">

      {/* ── Tab: My Classes ── */}
      {activeTab === 'My Classes' && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <form onSubmit={handleCreateClass} className="flex gap-2">
              <input
                type="text"
                placeholder="New class name..."
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                className="px-4 py-2 text-sm bg-black/30 border border-purple-500/30 rounded-xl outline-none focus:border-purple-500/70 text-white"
              />
              <button 
                type="submit" 
                disabled={creatingClass || !newClassName.trim()}
                className="px-4 py-2 text-sm font-bold bg-purple-600/20 border border-purple-500/50 text-purple-400 rounded-xl hover:bg-purple-600/40 transition-colors disabled:opacity-50"
              >
                {creatingClass ? 'Creating...' : '+ Create Class'}
              </button>
            </form>
          </div>
          
          {loadingClassrooms ? (
            <div className="flex items-center justify-center py-20">
               <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
                 <circle cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/>
               </svg>
            </div>
          ) : classrooms.length === 0 ? (
            <p className="text-slate-500 text-sm">You haven't created any classes yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classrooms.map(c => (
                <div key={c.id} className="glass-panel p-5 rounded-2xl flex flex-col gap-3 group cursor-pointer hover:border-purple-500/50 transition-all duration-200"
                     onClick={() => handleSelectClassroom(c)}
                     style={{ border: selectedClassroom?.id === c.id ? '1px solid rgba(124,58,237,0.7)' : '1px solid rgba(124,58,237,0.2)' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-white text-lg">{c.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{c.student_count} student{c.student_count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-center px-3 py-1.5 bg-purple-900/30 border border-purple-500/30 rounded-lg">
                      <p className="text-[9px] uppercase tracking-widest text-slate-400">Join Code</p>
                      <p className="text-sm font-mono font-bold text-purple-300">{c.join_code}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedClassroom && (
            <div className="mt-8 pb-8 animate-fade-in">
              <h3 className="font-black text-white text-lg mb-4 flex items-center gap-2">
                <span className="text-purple-400">Students in</span> {selectedClassroom.name}
              </h3>
              {loadingStudents ? (
                <p className="text-slate-500 text-sm">Loading students...</p>
              ) : classroomStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-black/10 rounded-2xl border border-white/5">
                  <p className="text-slate-400 text-sm">No students have joined this class yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Share the join code <strong className="text-purple-300 font-mono">{selectedClassroom.join_code}</strong> with them.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {classroomStudents.map((student, idx) => (
                    <div key={student.id} className="glass-panel px-5 py-4 rounded-xl flex items-center gap-4 border border-white/5">
                      <div className="w-8 flex-shrink-0 text-center font-black text-slate-500 text-sm">#{idx + 1}</div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs bg-cyan-900/30 text-cyan-400">
                        {student.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-white text-sm">{student.username}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-white text-xs">{student.points || 0}</p>
                        <p className="text-[9px] text-slate-500 uppercase">XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Assignments ── */}
      {activeTab === 'Assignments' && (
        <div>
          {loadingAssignments ? (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/>
              </svg>
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                   style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-white font-bold">No Assignments Yet</p>
                <p className="text-sm text-slate-500 mt-1">Create your first assignment to get started</p>
              </div>
              <button onClick={() => setShowCreate(true)}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)', border: '1px solid rgba(124,58,237,0.4)' }}>
                Create Assignment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {assignments.map(a => (
                <div key={a.id}
                     className="glass-panel p-5 rounded-2xl flex flex-col gap-3 animate-fade-in group cursor-pointer hover:scale-[1.01] transition-all duration-200"
                     style={{ border: '1px solid rgba(124,58,237,0.2)', boxShadow: '0 0 0 rgba(124,58,237,0)' }}
                     onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.12)'}
                     onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 rgba(124,58,237,0)'}
                     onClick={() => handleSelectAssignment(a)}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-white leading-tight">{a.title}</h3>
                    <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setEditTarget(a)}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                              title="Edit assignment">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button onClick={() => handleDeleteAssignment(a)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                              title="Delete assignment">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff3366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  {a.description && <p className="text-xs text-slate-400 leading-relaxed">{a.description}</p>}
                  <div className="flex flex-wrap gap-2 items-center">
                    <DeadlineChip dueDate={a.due_date} acceptLate={a.accept_late} />
                    {a.target_gate && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: 'var(--neon-blue)' }}>
                        {a.target_gate}
                      </span>
                    )}
                    {a.classroom_name && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd' }}>
                        Class: {a.classroom_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-auto"
                       style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xs text-slate-500">
                      <span className="text-white font-bold">{a.submission_count}</span> submission{a.submission_count !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs font-bold" style={{ color: '#a78bfa' }}>+{a.points_reward} XP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Submissions ── */}
      {activeTab === 'Submissions' && (
        <div>
          {!selectedAssignment ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <p className="text-slate-400 text-sm">Select an assignment from the Assignments tab to view submissions</p>
              <button onClick={() => setActiveTab('Assignments')}
                      className="text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                      style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}>
                ← Go to Assignments
              </button>
            </div>
          ) : (
            <>
              {/* Assignment title bar */}
              <div className="glass-panel px-5 py-4 rounded-2xl mb-4 flex items-center justify-between flex-wrap gap-3"
                   style={{ border: '1px solid rgba(124,58,237,0.25)' }}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#a78bfa' }}>Reviewing Submissions For</p>
                  <h2 className="text-lg font-black text-white mt-0.5">{selectedAssignment.title}</h2>
                  <DeadlineChip dueDate={selectedAssignment.due_date} acceptLate={selectedAssignment.accept_late} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditTarget(selectedAssignment)}
                          className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors hover:bg-white/10"
                          style={{ border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                  <button onClick={() => { setSelectedAssignment(null); setActiveTab('Assignments'); }}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                          style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    ← Back
                  </button>
                </div>
              </div>

              {loadingSubmissions ? (
                <div className="flex items-center justify-center py-20">
                  <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/>
                  </svg>
                </div>
              ) : submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                       style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p className="text-slate-400 text-sm">No submissions yet for this assignment</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {submissions.map(sub => (
                    <div key={sub.id}
                         className="glass-panel px-5 py-4 rounded-2xl flex items-center gap-4 flex-wrap animate-fade-in"
                         style={{ border: `1px solid ${sub.is_late ? 'rgba(255,51,102,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                           style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>
                        {sub.student_username?.charAt(0).toUpperCase()}
                      </div>
                      {/* Student info */}
                      <div className="flex-1 min-w-[120px]">
                        <p className="font-bold text-white text-sm">{sub.student_username}</p>
                        <p className="text-[10px] text-slate-500">{formatDate(sub.submitted_at)}</p>
                        {sub.is_late && (
                          <span className="text-[10px] font-bold" style={{ color: '#ff3366' }}>⚠ Late</span>
                        )}
                      </div>
                      {/* Scores */}
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest">Auto</span>
                        <ScoreChip score={sub.auto_score} />
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest">Graded</span>
                        <ScoreChip score={sub.teacher_score} />
                      </div>
                      {/* Status */}
                      <StatusPill status={sub.status} />
                      {/* Action */}
                      <button
                        onClick={() => setReviewTarget(sub)}
                        className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 hover:scale-105"
                        style={{
                          background: 'rgba(124,58,237,0.15)',
                          border: '1px solid rgba(124,58,237,0.35)',
                          color: '#a78bfa',
                        }}
                      >
                        {sub.status === 'graded' ? 'View' : 'Review & Grade'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Tab: Analytics ── */}
      {activeTab === 'Analytics' && (() => {
        const sortedStudents = [...students].sort((a, b) => (b.points || 0) - (a.points || 0));
        const maxPts = Math.max(...sortedStudents.map(s => s.points || 0), 1);

        // Score buckets for distribution chart
        const buckets = { '0–24': 0, '25–49': 0, '50–74': 0, '75–89': 0, '90–100': 0 };
        allSubmissions.forEach(s => {
          const sc = s.teacher_score ?? s.auto_score;
          if (sc == null) return;
          if (sc < 25) buckets['0–24']++;
          else if (sc < 50) buckets['25–49']++;
          else if (sc < 75) buckets['50–74']++;
          else if (sc < 90) buckets['75–89']++;
          else buckets['90–100']++;
        });
        const bucketColors = { '0–24': '#ff3366', '25–49': '#f97316', '50–74': '#ffd700', '75–89': '#00d4ff', '90–100': '#39ff14' };
        const maxBucket = Math.max(...Object.values(buckets), 1);

        // Per-assignment results
        const assignmentResults = assignments.map(a => {
          const subs = allSubmissions.filter(s => s.assignment_id === a.id);
          const graded = subs.filter(s => s.status === 'graded');
          const scores = graded.map(s => s.teacher_score ?? s.auto_score).filter(x => x != null);
          const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
          return { ...a, totalSubs: subs.length, gradedCount: graded.length, avgScore: avg };
        });

        const totalSubs = allSubmissions.length;
        const gradedSubs = allSubmissions.filter(s => s.status === 'graded').length;
        const gradedPct = totalSubs ? Math.round((gradedSubs / totalSubs) * 100) : 0;
        const allScores = allSubmissions.map(s => s.teacher_score ?? s.auto_score).filter(x => x != null);
        const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;

        return (
          <div className="flex-1 px-4 sm:px-8 pb-10 flex flex-col gap-8">
            {loadingAnalytics ? (
              <div className="flex items-center justify-center py-20">
                <svg className="animate-spin w-7 h-7" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/>
                </svg>
              </div>
            ) : (
              <>
                {/* ── Overview stats ── */}
                <section>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#a78bfa' }}>Overview</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MiniStatCard label="Students" value={students.length} color="#00d4ff" sub="registered" />
                    <MiniStatCard label="Assignments" value={assignments.length} color="#a78bfa" sub={`${assignments.filter(a => a.due_date && new Date(a.due_date) > new Date()).length} active`} />
                    <MiniStatCard label="Submissions" value={totalSubs} color="#ffd700" sub={`${gradedPct}% graded`} />
                    <MiniStatCard label="Avg Score" value={avgScore != null ? `${avgScore}` : '—'} color="#39ff14" sub={avgScore != null ? 'out of 100' : 'no data yet'} />
                  </div>
                </section>

                {/* ── Charts row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Score Distribution */}
                  <section className="glass-panel p-5 rounded-2xl" style={{ border: '1px solid rgba(124,58,237,0.18)' }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#a78bfa' }}>Score Distribution</p>
                    {totalSubs === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-6">No submissions yet</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {Object.entries(buckets).map(([range, count]) => (
                          <ScoreBar
                            key={range}
                            label={range}
                            pct={Math.round((count / maxBucket) * 100)}
                            color={bucketColors[range]}
                            count={count}
                          />
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Graded vs Pending donut */}
                  <section className="glass-panel p-5 rounded-2xl" style={{ border: '1px solid rgba(124,58,237,0.18)' }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#a78bfa' }}>Grading Progress</p>
                    {totalSubs === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-6">No submissions yet</p>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        {/* SVG donut */}
                        <div className="relative w-32 h-32">
                          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                            <circle cx="18" cy="18" r="14" fill="none"
                              stroke="#39ff14"
                              strokeWidth="4"
                              strokeDasharray={`${(gradedPct / 100) * 87.96} 87.96`}
                              strokeLinecap="round"
                            />
                            <circle cx="18" cy="18" r="14" fill="none"
                              stroke="#ffd700"
                              strokeWidth="4"
                              strokeDasharray={`${((totalSubs - gradedSubs) / totalSubs) * 87.96} 87.96`}
                              strokeDashoffset={`-${(gradedPct / 100) * 87.96}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-white">{gradedPct}%</span>
                            <span className="text-[9px] text-slate-500">graded</span>
                          </div>
                        </div>
                        <div className="flex gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#39ff14' }} />
                            <span className="text-xs text-slate-400">Graded <strong className="text-white ml-1">{gradedSubs}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ffd700' }} />
                            <span className="text-xs text-slate-400">Pending <strong className="text-white ml-1">{totalSubs - gradedSubs}</strong></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                </div>

                {/* ── Results per assignment ── */}
                <section>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#a78bfa' }}>Assignment Results</p>
                  {assignmentResults.length === 0 ? (
                    <p className="text-slate-500 text-sm">No assignments yet</p>
                  ) : (
                    <div className="glass-panel rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(124,58,237,0.18)' }}>
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                            <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-wider">Assignment</th>
                            <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-wider text-center">Submissions</th>
                            <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-wider text-center">Graded</th>
                            <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-wider text-center">Avg Score</th>
                            <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-wider text-center">XP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignmentResults.map((a, i) => {
                            const scoreColor = a.avgScore == null ? '#64748b' : a.avgScore >= 80 ? '#39ff14' : a.avgScore >= 50 ? '#ffd700' : '#ff3366';
                            return (
                              <tr key={a.id}
                                style={{ borderBottom: i < assignmentResults.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                                className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                                onClick={() => { setSelectedAssignment(a); setActiveTab('Submissions'); fetchSubmissions(a.id); }}
                              >
                                <td className="px-4 py-3">
                                  <span className="font-bold text-white">{a.title}</span>
                                  {a.classroom_name && <span className="ml-2 text-[10px] text-slate-500">{a.classroom_name}</span>}
                                </td>
                                <td className="px-4 py-3 text-center font-bold text-white">{a.totalSubs}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="font-bold" style={{ color: a.gradedCount === a.totalSubs && a.totalSubs > 0 ? '#39ff14' : '#ffd700' }}>{a.gradedCount}</span>
                                  <span className="text-slate-500">/{a.totalSubs}</span>
                                </td>
                                <td className="px-4 py-3 text-center font-black" style={{ color: scoreColor }}>
                                  {a.avgScore != null ? a.avgScore : '—'}
                                </td>
                                <td className="px-4 py-3 text-center font-bold" style={{ color: '#a78bfa' }}>+{a.points_reward}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {/* ── Leaderboard ── */}
                <section>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#00d4ff' }}>Leaderboard</p>
                  {loadingStudents ? (
                    <div className="flex items-center justify-center py-12">
                      <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/>
                      </svg>
                    </div>
                  ) : sortedStudents.length === 0 ? (
                    <p className="text-slate-500 text-sm">No students registered yet</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {sortedStudents.map((student, idx) => {
                        const pct = Math.min(((student.points || 0) / maxPts) * 100, 100);
                        return (
                          <div key={student.id}
                               className="glass-panel px-5 py-4 rounded-2xl flex items-center gap-4 animate-fade-in"
                               style={{ border: idx < 3 ? `1px solid ${['rgba(255,215,0,0.3)','rgba(192,192,192,0.2)','rgba(205,127,50,0.2)'][idx]}` : '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="w-8 flex-shrink-0 text-center">
                              {idx === 0 ? <span className="text-lg">🥇</span>
                                : idx === 1 ? <span className="text-lg">🥈</span>
                                : idx === 2 ? <span className="text-lg">🥉</span>
                                : <span className="text-sm font-black text-slate-500">#{idx + 1}</span>}
                            </div>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                                 style={{ background: 'rgba(0,212,255,0.12)', color: 'var(--neon-blue)' }}>
                              {student.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-[100px]">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-white text-sm">{student.username}</span>
                                <span className="text-xs text-slate-400">Lv.{student.level || 1}</span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                                <div className="h-full rounded-full transition-all duration-500"
                                     style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--neon-blue), #7c3aed)' }} />
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-black text-white text-sm">{student.points || 0}</p>
                              <p className="text-[10px] text-slate-500">XP</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-black text-white text-sm">{(student.badges || []).length}</p>
                              <p className="text-[10px] text-slate-500">Badges</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        );
      })()}
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      <CreateAssignmentModal
        isOpen={showCreate}
        teacherUsername={user?.username}
        classrooms={classrooms}
        onCreated={() => { setShowCreate(false); fetchAssignments(); addToast('success', 'Assignment created!'); }}
        onCancel={() => setShowCreate(false)}
      />
      {editTarget && (
        <EditAssignmentModal
          isOpen
          assignment={editTarget}
          teacherUsername={user?.username}
          onUpdated={() => {
            setEditTarget(null);
            fetchAssignments();
            if (selectedAssignment?.id === editTarget.id) fetchSubmissions(editTarget.id);
            addToast('success', 'Assignment updated!');
          }}
          onCancel={() => setEditTarget(null)}
        />
      )}
      {reviewTarget && (
        <SubmissionReviewModal
          isOpen
          submission={reviewTarget}
          onGraded={() => { setReviewTarget(null); handleGraded(); }}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
