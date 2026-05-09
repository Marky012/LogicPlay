import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NavBar from '../components/NavBar';
import CreateAssignmentModal from '../components/CreateAssignmentModal';
import EditAssignmentModal from '../components/EditAssignmentModal';
import SubmissionReviewModal from '../components/SubmissionReviewModal';
import Canvas from '../components/Canvas.jsx';
import Toolbar from '../components/Toolbar.jsx';
import TruthTable from '../components/TruthTable.jsx';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { validateCircuitConnections, evaluateCircuit } from '../utils/circuitLogic';
import { useToast } from '../components/ToastNotification';
import {
  getAssignmentsByTeacher,
  getSubmissionsByAssignment,
  deleteAssignment,
  getTeacherStudents,
  getTeacherClassrooms,
  createClassroom,
  getClassroomStudents,
  getClassroomEnrollments,
  updateClassroom,
  deleteClassroom,
  unenrollStudent,
  approveStudent,
  regenerateJoinCode,
  deleteUser,
  getLeaderboard,
} from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import TypeToConfirmModal from '../components/TypeToConfirmModal';
import ChangePasswordModal from '../components/ChangePasswordModal';

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

  let color = 'var(--neon-green)'; let label = formatDate(dueDate);
  if (diffMs < 0) {
    color = 'var(--neon-red)'; label = `Past due · ${formatDate(dueDate)}`;
  } else if (diffDays < 2) {
    color = 'var(--neon-amber)'; label = `Due soon · ${formatDate(dueDate)}`;
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
        background: 'var(--c-surface-2)',
        border: `1px solid ${isGraded ? 'var(--neon-green)' : 'var(--neon-amber)'}`,
        color: isGraded ? 'var(--neon-green)' : 'var(--neon-amber)',
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

const TABS = ['My Classes', 'Assignments', 'Submissions', 'Simulation', 'Analytics', 'Profile'];

const TAB_META = {
  'My Classes': {
    color: '#00d4ff',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  'Assignments': {
    color: '#00d4ff',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  'Submissions': {
    color: '#ffd700',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  'Analytics': {
    color: '#39ff14',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
  },
  'Simulation': {
    color: '#a78bfa',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  'Profile': {
    color: '#94a3b8',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
};

// ── Analytics sub-components ─────────────────────────────────────

const MiniStatCard = ({ label, value, color, sub }) => (
  <div className="flex flex-col gap-1 p-4 rounded-2xl" style={{ background: `${color}0d`, border: `1px solid ${color}28` }}>
    <span className="text-2xl font-black" style={{ color }}>{value}</span>
    <span className="text-[11px] font-bold" style={{ color: 'var(--c-text)' }}>{label}</span>
    {sub && <span className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>{sub}</span>}
  </div>
);

const ScoreBar = ({ label, pct, color, count }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] w-16 flex-shrink-0 text-right" style={{ color: 'var(--c-text-muted)' }}>{label}</span>
    <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--c-border-dim)' }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
    <span className="text-[10px] font-bold w-6 text-right" style={{ color: 'var(--c-text-muted)' }}>{count}</span>
  </div>
);

/* ── Stats Row ── */
const StatChip = ({ label, value, color }) => (
  <div className="flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-200"
    style={{
      background: 'var(--c-surface-2)',
      border: `1px solid color-mix(in srgb, ${color}, transparent 75%)`,
      boxShadow: `0 4px 12px color-mix(in srgb, ${color}, transparent 96%)`
    }}>
    <span className="text-base font-black" style={{ color }}>{value}</span>
    <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--c-text-muted)' }}>{label}</span>
  </div>
);

/* ── Animated Play/Stop Button ── */
const SimButton = ({ isPlaying, onClick }) => (
  <button onClick={onClick}
    className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
    style={{
      background: isPlaying
        ? 'linear-gradient(135deg, #7f1d1d, var(--neon-red))'
        : 'linear-gradient(135deg, #14532d, var(--neon-green))',
      border: `1.5px solid ${isPlaying ? 'color-mix(in srgb, var(--neon-red), transparent 50%)' : 'color-mix(in srgb, var(--neon-green), transparent 50%)'}`,
      boxShadow: isPlaying
        ? '0 0 20px color-mix(in srgb, var(--neon-red), transparent 70%)'
        : '0 0 20px color-mix(in srgb, var(--neon-green), transparent 70%)',
      color: '#fff',
    }}>
    {isPlaying ? (
      <>
        <span className="w-2.5 h-2.5 rounded-sm bg-white" />
        Stop Simulation
      </>
    ) : (
      <>
        <span className="text-lg">▶</span>
        Play Simulation
      </>
    )}
  </button>
);

// ── Main Component ───────────────────────────────────────────────

const TeacherDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { isLight } = useTheme();
  const navigate = useNavigate();
  const addToast = useToast();

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??';

  const [activeTab, setActiveTab] = useState('My Classes');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [creatingClass, setCreatingClass] = useState(false);
  const [classroomEnrollments, setClassroomEnrollments] = useState([]);

  const [showClassSettings, setShowClassSettings] = useState(false);
  const [showDeleteClass, setShowDeleteClass] = useState(false);
  const [editClassName, setEditClassName] = useState('');
  const [editRequireApproval, setEditRequireApproval] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [studentToApprove, setStudentToApprove] = useState(null);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  const [showKickConfirm, setShowKickConfirm] = useState(false);
  const [studentToKick, setStudentToKick] = useState(null);
  const [showDeleteAssignmentConfirm, setShowDeleteAssignmentConfirm] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // ── Simulation tab state ──
  const [simGates, setSimGates] = useState([]);
  const [simWires, setSimWires] = useState([]);
  const [simActiveWires, setSimActiveWires] = useState(null);
  const [simComputedValues, setSimComputedValues] = useState(null);
  const [simIsPlaying, setSimIsPlaying] = useState(false);
  const [simFeedback, setSimFeedback] = useState('');
  const [simResetView, setSimResetView] = useState(0);
  const [simActiveTab, setSimActiveTab] = useState('Controls');
  const simEvalRef = useRef(null);

  // ── Data fetchers ──
  const fetchClassrooms = useCallback(async (silent = false) => {
    if (!user?.username) return;
    if (!silent) setLoadingClassrooms(true);
    try {
      const data = await getTeacherClassrooms(user.username);
      setClassrooms(data);
    } catch (e) {
      if (!silent) addToast('error', 'Failed to load classes');
    } finally {
      if (!silent) setLoadingClassrooms(false);
    }
  }, [user?.username]);

  const fetchAssignments = useCallback(async (silent = false) => {
    if (!user?.username) return;
    if (!silent) setLoadingAssignments(true);
    try {
      const data = await getAssignmentsByTeacher(user.username);
      setAssignments(data);
    } catch (e) {
      if (!silent) addToast('error', 'Failed to load assignments');
    } finally {
      if (!silent) setLoadingAssignments(false);
    }
  }, [user?.username]);

  const fetchSubmissions = useCallback(async (assignmentId, silent = false) => {
    if (!silent) setLoadingSubmissions(true);
    try {
      const data = await getSubmissionsByAssignment(assignmentId);
      setSubmissions(data);
    } catch (e) {
      if (!silent) addToast('error', 'Failed to load submissions');
    } finally {
      if (!silent) setLoadingSubmissions(false);
    }
  }, []);

  const fetchStudents = useCallback(async (silent = false) => {
    if (!user?.username) return;
    if (!silent) setLoadingStudents(true);
    try {
      const data = await getTeacherStudents(user.username);
      setStudents(data);
    } catch (e) {
      /* non-fatal */
    } finally {
      if (!silent) setLoadingStudents(false);
    }
  }, [user?.username]);

  const fetchGlobalLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    try {
      const data = await getLeaderboard(20);
      setGlobalLeaderboard(data);
    } catch (e) {
      /* non-fatal */
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);
  useEffect(() => { fetchClassrooms(); }, [fetchClassrooms]);
  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { fetchGlobalLeaderboard(); }, [fetchGlobalLeaderboard]);

  // ── Background Polling for live updates ──
  useEffect(() => {
    const interval = setInterval(() => {
      // Background silent refresh
      fetchClassrooms(true);
      fetchStudents(true);
      fetchAssignments(true);
      if (selectedClassroom) {
        getClassroomEnrollments(selectedClassroom.id).then(data => {
          setClassroomEnrollments(data);
        }).catch(() => {});
      }
      if (selectedAssignment) {
        fetchSubmissions(selectedAssignment.id, true);
      }
    }, 20000); // 20 seconds
    return () => clearInterval(interval);
  }, [fetchClassrooms, fetchStudents, fetchAssignments, selectedClassroom, selectedAssignment, fetchSubmissions]);
  useEffect(() => {
    if (activeTab === 'Analytics') {
      fetchStudents();
      fetchGlobalLeaderboard();
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
        } catch (_) { }
        finally { setLoadingAnalytics(false); }
      };
      fetchAll();
    }
  }, [activeTab, fetchStudents, user?.username]);

  // ── Simulation Logic ──
  useEffect(() => {
    let interval;
    if (simIsPlaying) {
      const result = evaluateCircuit(simGates, simWires);
      setSimActiveWires(result.activeWires);
      setSimComputedValues(result.gateValues);

      interval = setInterval(() => {
        const res = evaluateCircuit(simGates, simWires);
        setSimActiveWires(res.activeWires);
        setSimComputedValues(res.gateValues);
      }, 100);
    } else {
      setSimActiveWires(null);
      setSimComputedValues(null);
    }
    return () => clearInterval(interval);
  }, [simIsPlaying, simGates, simWires]);

  const handleSimGateStateToggle = (gateId) => {
    setSimGates(prev => prev.map(g =>
      g.id === gateId && g.type === 'INPUT' ? { ...g, state: g.state === 1 ? 0 : 1 } : g
    ));
  };

  const handleSimStart = () => {
    setSimIsPlaying(true);
    addToast('info', 'Simulation running — toggle INPUT gates!');
  };

  const handleSimStop = () => {
    setSimIsPlaying(false);
    setSimActiveWires(null);
    setSimComputedValues(null);
    addToast('info', 'Simulation stopped.');
  };

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
      const [studentsData, enrollData] = await Promise.all([
        getClassroomStudents(cls.id),
        getClassroomEnrollments(cls.id)
      ]);
      setClassroomStudents(studentsData);
      setClassroomEnrollments(enrollData);
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

  // ── Classroom Actions ──
  const openClassSettings = () => {
    setEditClassName(selectedClassroom.name);
    setEditRequireApproval(selectedClassroom.require_approval || false);
    setShowClassSettings(true);
  };

  const saveClassSettings = async () => {
    try {
      const updated = await updateClassroom(selectedClassroom.id, {
        name: editClassName,
        require_approval: editRequireApproval
      });
      setSelectedClassroom(updated);
      setShowClassSettings(false);
      fetchClassrooms();
      addToast('success', 'Class settings saved');
    } catch (e) {
      addToast('error', 'Failed to update class');
    }
  };

  const handleDeleteClass = async () => {
    try {
      await deleteClassroom(selectedClassroom.id);
      setSelectedClassroom(null);
      setShowDeleteClass(false);
      fetchClassrooms();
      fetchAssignments(); // Refresh assignments to remove orphaned ones
      addToast('success', 'Class deleted permanently');
    } catch (e) {
      addToast('error', 'Failed to delete class');
    }
  };

  const handleKickStudent = async (student) => {
    setStudentToKick(student);
    setShowKickConfirm(true);
  };

  const confirmKickStudent = async () => {
    if (!studentToKick) return;
    try {
      await unenrollStudent(selectedClassroom.id, studentToKick.username);
      handleSelectClassroom(selectedClassroom);
      fetchClassrooms();
      addToast('success', `${studentToKick.username} removed.`);
    } catch (e) {
      addToast('error', 'Failed to remove student.');
    } finally {
      setShowKickConfirm(false);
      setStudentToKick(null);
    }
  };

  const handleApproveStudent = (student) => {
    setStudentToApprove(student);
    setShowApproveConfirm(true);
  };

  const confirmApproveStudent = async () => {
    if (!studentToApprove) return;
    try {
      await approveStudent(selectedClassroom.id, studentToApprove.username);
      handleSelectClassroom(selectedClassroom);
      addToast('success', `${studentToApprove.username} approved!`);
    } catch (e) {
      addToast('error', 'Failed to approve student.');
    } finally {
      setShowApproveConfirm(false);
      setStudentToApprove(null);
    }
  };

  const handleRegenerateCode = async () => {
    setIsRegenerating(true);
    try {
      const updated = await regenerateJoinCode(selectedClassroom.id);
      setSelectedClassroom(updated);
      fetchClassrooms();
      addToast('success', 'Join code rotated!');
    } catch (e) {
      addToast('error', 'Failed to rotate code.');
    } finally {
      setIsRegenerating(false);
      setShowRegenerateConfirm(false);
    }
  };


  const handleDeleteAssignment = async (assignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteAssignmentConfirm(true);
  };

  const confirmDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    try {
      await deleteAssignment(assignmentToDelete.id, user.username);
      addToast('success', 'Assignment deleted');
      fetchAssignments();
      if (selectedAssignment?.id === assignmentToDelete.id) {
        setSelectedAssignment(null);
        setActiveTab('Assignments');
      }
    } catch (e) {
      addToast('error', 'Failed to delete assignment');
    } finally {
      setShowDeleteAssignmentConfirm(false);
      setAssignmentToDelete(null);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteUser(user.username);
      setShowDeleteAccount(false);
      logout();
      navigate('/');
    } catch (e) {
      console.error(e);
      addToast('error', 'Failed to delete account. Please try again.');
    } finally {
      setDeletingAccount(false);
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
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{ 
            background: isLight 
              ? 'radial-gradient(circle, rgba(3,105,161,0.12), transparent)'
              : 'radial-gradient(circle, #0369a1, transparent)',
            opacity: isLight ? 0.5 : 0.06
          }} />
        {isLight && (
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[100px]" 
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08), transparent)', opacity: 0.6 }} />
        )}
      </div>

      <div className="z-10 relative"><NavBar profileData={{ points: 0, level: 1, badges: [] }} /></div>

      {/* Main Layout Container */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden z-10 relative">

        {/* ── Sidebar ── */}
        <aside className={`w-full ${isSidebarCollapsed ? 'md:w-20' : 'md:w-72'} transition-all duration-300 ease-in-out flex-shrink-0 flex flex-col pb-2 md:pb-0 overflow-y-auto hidden-scrollbar relative border-b md:border-b-0 md:border-r border-[color:var(--c-border-dim)]`}
          style={{ background: 'var(--c-surface-2)' }}>

          {/* Teacher Profile Card */}
          <div className={`hidden md:block ${isSidebarCollapsed ? 'px-2 pt-10 pb-4' : 'px-5 pt-7 pb-4'} relative transition-all duration-300`} style={{ borderBottom: '1px solid var(--c-border-dim)' }}>

            {/* Collapse Toggle */}
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`hidden md:flex items-center justify-center border transition-all duration-300 cursor-pointer shadow-lg w-6 h-6 rounded-full absolute ${isSidebarCollapsed ? 'top-3 right-1/2 translate-x-1/2' : 'top-3 right-3'} z-50 hover:scale-110`}
              style={{ background: 'var(--c-surface-2)', borderColor: 'var(--c-border)', color: 'var(--neon-blue)', boxShadow: '0 2px 8px rgba(0,212,255,0.2)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSidebarCollapsed ? 'rotate(180deg)' : 'rotate(0)' }} className="transition-transform duration-300">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {/* Decorative background accent */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.03] blur-2xl pointer-events-none"
              style={{ background: 'var(--c-accent)', transform: 'translate(30%, -30%)' }} />

            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-4'} mb-5 relative z-10 transition-all duration-300`}>
              <div className={`${isSidebarCollapsed ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-xl'} avatar-neon-purple !rounded-2xl transition-all duration-300 mx-auto`}
                title={isSidebarCollapsed ? user?.username : ''}>
                {initials}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0 animate-fade-in origin-left">
                  <p className="font-extrabold text-base truncate leading-tight mb-1" style={{ color: 'var(--c-text)' }}>
                    {user?.username}
                  </p>
                  <div className="inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full border border-blue-500/30 bg-blue-500/10">
                    <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse-glow" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80" style={{ color: 'var(--neon-blue)' }}>
                      Instructor
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className={`grid grid-cols-3 gap-2 relative z-10 ${isSidebarCollapsed ? 'hidden' : ''}`}>
              {[
                { label: 'Classes',  value: classrooms.length,       color: isLight ? '#0369a1' : '#00d4ff' },
                { label: 'Tasks',    value: assignments.length,       color: isLight ? '#0369a1' : '#00d4ff' },
                { label: 'Students', value: students.length || '0',   color: isLight ? '#15803d' : '#39ff14' },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center py-1.5 rounded-xl transition-all duration-300 hover:translate-y-[-2px] border"
                  style={{
                    background: isLight ? `color-mix(in srgb, ${s.color}, transparent 90%)` : 'var(--c-surface)',
                    borderColor: isLight ? `color-mix(in srgb, ${s.color}, transparent 65%)` : 'var(--c-border-dim)',
                    boxShadow: isLight ? `0 2px 8px color-mix(in srgb, ${s.color}, transparent 88%)` : '0 4px 6px -1px rgba(0,0,0,0.05)'
                  }}>
                  <span className="text-sm font-black leading-none" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-[7px] font-black uppercase tracking-widest mt-1 opacity-60" style={{ color: 'var(--c-text)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex md:flex-col gap-1 ${isSidebarCollapsed ? 'p-2 items-center' : 'p-3'} overflow-x-auto md:overflow-visible hidden-scrollbar transition-all duration-300`}
            style={{ WebkitOverflowScrolling: 'touch' }}>
            {TABS.map(tab => {
              const meta = TAB_META[tab];
              const isActive = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  title={isSidebarCollapsed ? tab : ''}
                  className={`group flex items-center ${isSidebarCollapsed ? 'justify-center w-12 h-12 p-0' : 'gap-3 px-3 py-3 w-full'} rounded-xl transition-all duration-200 text-left whitespace-nowrap relative overflow-hidden`}
                  style={{
                    background: isActive ? `${meta.color}15` : 'transparent',
                    border: isActive ? `1px solid ${meta.color}50` : '1px solid transparent',
                    boxShadow: isActive ? `0 0 15px ${meta.color}10` : 'none'
                  }}>
                  {/* Active bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                      style={{ background: meta.color, boxShadow: `0 0 12px ${meta.color}` }} />
                  )}
                  <span className="flex-shrink-0 transition-all duration-300"
                    style={{ 
                      color: isActive ? meta.color : 'var(--c-text-muted)', 
                      filter: isActive ? `drop-shadow(0 0 8px ${meta.color}cc)` : 'grayscale(0.4) opacity(0.7)' 
                    }}>
                    {meta.icon}
                  </span>
                  {!isSidebarCollapsed && (
                    <span className="text-sm font-bold transition-colors duration-200 flex-1 animate-fade-in"
                      style={{ color: isActive ? 'var(--c-text)' : 'var(--c-text-muted)' }}>
                      {tab}
                    </span>
                  )}
                  {!isSidebarCollapsed && tab === 'Submissions' && selectedAssignment && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] leading-none font-black flex-shrink-0 animate-fade-in"
                      style={{ background: 'var(--c-surface-2)', color: 'var(--neon-amber)', border: '1px solid var(--neon-amber)' }}>
                      {submissions.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto hidden md:flex flex-col gap-3 transition-all duration-300 p-4">
            {/* Mini Leaderboard Preview */}
            {!isSidebarCollapsed && globalLeaderboard.length > 0 && (
              <div className="mx-0 pb-1 rounded-2xl animate-fade-in" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border-dim)' }}>
                <div className="p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest mb-3 opacity-60" style={{ color: 'var(--neon-blue)' }}>Global Leaderboard</p>
                  <div className="flex flex-col gap-2.5">
                    {[...globalLeaderboard].slice(0, 3).map((s, i) => (
                      <div key={s.id} className="flex items-center gap-2">
                        <span className="text-sm flex-shrink-0">{['🥇', '🥈', '🥉'][i]}</span>
                        <span className="text-[11px] font-semibold flex-1 truncate" style={{ color: 'var(--c-text)' }}>{s.username}</span>
                        <span className="text-[11px] font-black flex-shrink-0" style={{ color: 'var(--neon-blue)' }}>{s.points || 0}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab('Analytics')} 
                          className="mt-3 text-[9px] font-black uppercase tracking-widest w-full text-center transition-colors hover:text-white flex items-center justify-center gap-1.5" 
                          style={{ color: 'rgba(0,212,255,0.4)' }}>
                    View Full Analytics
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowCreate(true)}
              title={isSidebarCollapsed ? 'New Assignment' : ''}
              className={`w-full ${isSidebarCollapsed ? 'h-12 py-0 rounded-[20px]' : 'py-3 rounded-xl gap-2'} font-bold text-sm flex items-center justify-center transition-all duration-200 hover:scale-[1.02] active:scale-95`}
              style={{
                background: isLight 
                  ? 'linear-gradient(135deg, #0369a1, #0ea5e9)'
                  : 'linear-gradient(135deg, #075985, #0ea5e9)',
                border: isLight ? '1px solid rgba(3,105,161,0.4)' : '1px solid rgba(0,212,255,0.3)',
                color: '#fff',
                boxShadow: isLight 
                  ? '0 4px 16px rgba(3,105,161,0.3)'
                  : '0 8px 24px -6px rgba(0,130,200,0.4)',
              }}
            >
              <svg width={isSidebarCollapsed ? "20" : "16"} height={isSidebarCollapsed ? "20" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {!isSidebarCollapsed && <span className="animate-fade-in whitespace-nowrap">New Assignment</span>}
            </button>
          </div>
        </aside>

        {/* Floating action button for mobile */}
        <div className="md:hidden fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowCreate(true)}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #075985, #0369a1)',
              border: '1px solid rgba(0,130,200,0.5)',
              color: '#fff',
              boxShadow: '0 8px 32px rgba(0,130,200,0.45)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* ── Content Area ── */}
        <main className="flex-1 overflow-y-auto hidden-scrollbar" style={{ background: 'transparent' }}>
          {/* Content header */}
          <div className="px-6 md:px-8 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--c-border-dim)' }}>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span style={{ color: TAB_META[activeTab].color, filter: `drop-shadow(0 0 6px ${TAB_META[activeTab].color})` }}>
                  {TAB_META[activeTab].icon}
                </span>
                <h2 className="text-lg font-black" style={{ color: 'var(--c-text)' }}>{activeTab}</h2>
              </div>
              <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                {activeTab === 'My Classes' && `${classrooms.length} class${classrooms.length !== 1 ? 'es' : ''} · click a class to view students`}
                {activeTab === 'Assignments' && `${assignments.length} total · click to view submissions`}
                {activeTab === 'Submissions' && (selectedAssignment ? `Reviewing: ${selectedAssignment.title}` : 'Select an assignment to review')}
                {activeTab === 'Analytics' && 'Performance overview · score distribution · leaderboard'}
                {activeTab === 'Simulation' && 'Build and simulate logic circuits — drag gates, connect pins, run simulation'}
                {activeTab === 'Profile' && 'Manage your instructor profile and account settings'}
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
                      className="px-4 py-2 text-sm border outline-none rounded-xl transition-colors"
                      style={{ background: 'var(--c-surface)', borderColor: 'rgba(0,130,200,0.3)', color: 'var(--c-text)' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(0,130,200,0.7)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,130,200,0.3)'}
                    />
                    <button
                      type="submit"
                      disabled={creatingClass || !newClassName.trim()}
                      className="px-5 py-2 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      style={{ background: 'linear-gradient(135deg, #075985, #0369a1)', boxShadow: '0 4px 12px rgba(0,130,200,0.2)' }}
                    >
                      {creatingClass ? 'Creating...' : '+ Create Class'}
                    </button>
                  </form>
                </div>

                {loadingClassrooms ? (
                  <div className="flex items-center justify-center py-20">
                    <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="var(--neon-blue)" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10" />
                    </svg>
                  </div>
                ) : classrooms.length === 0 ? (
                  <p className="text-slate-500 text-sm">You haven't created any classes yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classrooms.map(c => (
                      <div key={c.id} className="glass-panel p-5 rounded-2xl flex flex-col gap-3 group cursor-pointer hover:border-blue-500/50 transition-all duration-200"
                        onClick={() => handleSelectClassroom(c)}
                        style={{ border: selectedClassroom?.id === c.id ? '1px solid rgba(0,130,200,0.7)' : '1px solid rgba(0,130,200,0.2)' }}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-black text-lg" style={{ color: 'var(--c-text)' }}>{c.name}</h3>
                            <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>{c.student_count} student{c.student_count !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="text-center px-3 py-1.5 bg-blue-900/10 border border-blue-500/30 rounded-lg group/code">
                            <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>Join Code</p>
                            <div className="flex items-center justify-center gap-1.5">
                              <p className="text-sm font-mono font-bold" style={{ color: 'var(--neon-blue)' }}>{c.join_code}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(c.join_code);
                                  addToast('success', 'Join code copied!');
                                }}
                                className="p-1 rounded hover:bg-white/10 transition-colors"
                                title="Copy Join Code"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedClassroom && (
                  <div className="mt-8 pb-8 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-lg flex items-center gap-3 flex-wrap" style={{ color: 'var(--c-text)' }}>
                        <span><span style={{ color: 'var(--neon-blue)' }}>Students in</span> {selectedClassroom.name}</span>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-900/10 border border-blue-500/20 text-sm">
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Code:</span>
                          <span className="font-mono font-bold text-blue-400">{selectedClassroom.join_code}</span>
                          <div className="flex items-center gap-0.5 ml-1">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedClassroom.join_code);
                                addToast('success', 'Join code copied!');
                              }}
                              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                              title="Copy Join Code"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setShowRegenerateConfirm(true)}
                              className="p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-colors"
                              title="Regenerate Join Code"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6m12-4a9 9 0 0 1-15 6.7L3 16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </h3>
                      <button
                        onClick={openClassSettings}
                        className="px-3 py-1.5 text-xs font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 rounded-lg transition-colors flex items-center gap-2"
                        style={{ color: 'var(--c-text)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        Settings
                      </button>
                    </div>

                    {loadingStudents ? (
                      <p className="text-slate-500 text-sm">Loading students...</p>
                    ) : classroomStudents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 rounded-2xl"
                        style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)' }}>
                        <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>No students have joined this class yet.</p>
                        <p className="text-xs mt-1 flex items-center justify-center gap-2" style={{ color: 'var(--c-text-muted)' }}>
                          Share the join code <strong style={{ color: 'var(--neon-blue)' }} className="font-mono tracking-wider">{selectedClassroom.join_code}</strong> with them.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {classroomStudents.map((student, idx) => {
                          const enrollState = classroomEnrollments.find(e => e.student_id === student.id);
                          const isPending = enrollState?.status === 'pending';

                          return (
                            <div key={student.id} className="glass-panel px-5 py-4 rounded-xl flex items-center gap-4 border" style={{ borderColor: isPending ? 'rgba(255,165,0,0.3)' : 'var(--c-border-dim)' }}>
                              <div className="w-8 flex-shrink-0 text-center font-black text-sm" style={{ color: 'var(--c-text-muted)' }}>#{idx + 1}</div>
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs" style={{ background: 'var(--c-surface-2)', color: 'var(--neon-cyan)' }}>
                                {student.username?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 flex items-center gap-2">
                                <span className="font-bold text-sm" style={{ color: 'var(--c-text)' }}>{student.username}</span>
                                {isPending && (
                                  <span className="text-[9px] px-2 py-0.5 rounded-full uppercase font-black" style={{ background: 'rgba(255,165,0,0.1)', color: 'orange', border: '1px solid rgba(255,165,0,0.3)' }}>
                                    Pending
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <p className="font-black text-xs" style={{ color: 'var(--c-text)' }}>{student.points || 0}</p>
                                  <p className="text-[9px] uppercase" style={{ color: 'var(--c-text-muted)' }}>XP</p>
                                </div>
                                <div className="flex gap-1 border-l border-white/10 pl-4">
                                  {isPending && (
                                    <button onClick={() => handleApproveStudent(student)} className="p-1.5 rounded-lg hover:bg-green-500/20 text-green-500 transition-colors" title="Approve">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </button>
                                  )}
                                  <button onClick={() => handleKickStudent(student)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors" title={isPending ? "Reject" : "Kick"}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
                      <circle cx="12" cy="12" r="10" stroke="var(--neon-blue)" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10" />
                    </svg>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--neon-purple)" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="font-bold" style={{ color: 'var(--c-text)' }}>No Assignments Yet</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--c-text-muted)' }}>Create your first assignment to get started</p>
                    </div>
                    <button onClick={() => setShowCreate(true)}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #075985, #0369a1)', border: '1px solid rgba(0,130,200,0.4)' }}>
                      Create Assignment
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {assignments.map(a => (
                      <div key={a.id}
                        className="glass-panel p-5 rounded-2xl flex flex-col gap-3 animate-fade-in group cursor-pointer hover:scale-[1.01] transition-all duration-200"
                        style={{ border: '1px solid rgba(0,130,200,0.2)', boxShadow: '0 0 0 rgba(0,130,200,0)' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(0,130,200,0.12)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 rgba(0,130,200,0)'}
                        onClick={() => handleSelectAssignment(a)}>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-black leading-tight" style={{ color: 'var(--c-text)' }}>{a.title}</h3>
                          <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setEditTarget(a)}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                              title="Edit assignment">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--neon-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDeleteAssignment(a)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                              title="Delete assignment">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff3366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {a.description && <p className="text-xs leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{a.description}</p>}
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
                              style={{ background: 'rgba(0,130,200,0.08)', border: '1px solid rgba(0,130,200,0.35)', color: 'var(--neon-blue)' }}>
                              Class: {a.classroom_name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-2 mt-auto"
                          style={{ borderTop: '1px solid var(--c-border-dim)' }}>
                          <span className="text-xs text-slate-500">
                            <span className="font-bold" style={{ color: 'var(--c-text)' }}>{a.submission_count}</span> submission{a.submission_count !== 1 ? 's' : ''}
                          </span>
                          <span className="text-xs font-bold" style={{ color: 'var(--neon-purple)' }}>+{a.points_reward} XP</span>
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
                      className="text-xs font-bold px-6 py-2.5 text-white rounded-xl transition-all duration-200 hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #075985, #0369a1)', boxShadow: '0 4px 12px rgba(0,130,200,0.2)' }}>
                      ← Go to Assignments
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Assignment title bar */}
                    <div className="glass-panel px-5 py-4 rounded-2xl mb-4 flex items-center justify-between flex-wrap gap-3"
                      style={{ border: '1px solid rgba(0,130,200,0.25)' }}>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--neon-blue)' }}>Reviewing Submissions For</p>
                        <h2 className="text-lg font-black mt-0.5" style={{ color: 'var(--c-text)' }}>{selectedAssignment.title}</h2>
                        <DeadlineChip dueDate={selectedAssignment.due_date} acceptLate={selectedAssignment.accept_late} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditTarget(selectedAssignment)}
                          className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors hover:bg-white/10"
                          style={{ border: '1px solid rgba(0,130,200,0.3)', color: 'var(--neon-blue)' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit
                        </button>
                        <button onClick={() => { setSelectedAssignment(null); setActiveTab('Assignments'); }}
                          className="px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                          style={{ border: '1px solid var(--c-border-dim)', color: 'var(--c-text-muted)' }}>
                          ← Back
                        </button>
                      </div>
                    </div>

                    {loadingSubmissions ? (
                      <div className="flex items-center justify-center py-20">
                        <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="var(--neon-blue)" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10" />
                        </svg>
                      </div>
                    ) : submissions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--neon-blue)" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>No submissions yet for this assignment</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {submissions.map(sub => (
                          <div key={sub.id}
                            className="glass-panel px-5 py-4 rounded-2xl flex items-center gap-4 flex-wrap animate-fade-in"
                            style={{ border: `1px solid ${sub.is_late ? 'rgba(255,51,102,0.2)' : 'var(--c-border-dim)'}` }}>
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                              style={{ background: 'rgba(0,130,200,0.15)', color: 'var(--neon-blue)' }}>
                              {sub.student_username?.charAt(0).toUpperCase()}
                            </div>
                            {/* Student info */}
                            <div className="flex-1 min-w-[120px]">
                              <p className="font-bold text-sm" style={{ color: 'var(--c-text)' }}>{sub.student_username}</p>
                              <p className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>{formatDate(sub.submitted_at)}</p>
                              {sub.is_late && (
                                <span className="text-[10px] font-bold" style={{ color: '#ff3366' }}>⚠ Late</span>
                              )}
                            </div>
                            {/* Scores */}
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>Auto</span>
                              <ScoreChip score={sub.auto_score} />
                            </div>
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>Graded</span>
                              <ScoreChip score={sub.teacher_score} />
                            </div>
                            {/* Status */}
                            <StatusPill status={sub.status} />
                            {/* Action */}
                            <button
                              onClick={() => setReviewTarget(sub)}
                              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 hover:scale-105"
                              style={{
                                background: 'rgba(0,130,200,0.08)',
                                border: '1px solid rgba(0,130,200,0.45)',
                                color: 'var(--neon-blue)',
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
              const studentsForLeaderboard = globalLeaderboard.length > 0 ? globalLeaderboard : [];
              const maxPts = Math.max(...studentsForLeaderboard.map(s => s.points || 0), 1);

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
              const bucketColors = { '0–24': 'var(--neon-red)', '25–49': 'var(--neon-orange)', '50–74': 'var(--neon-amber)', '75–89': 'var(--neon-blue)', '90–100': 'var(--neon-green)' };
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
                        <circle cx="12" cy="12" r="10" stroke="var(--neon-blue)" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10" />
                      </svg>
                    </div>
                  ) : (
                    <>
                      {/* ── Overview stats ── */}
                      <section>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--neon-blue)' }}>Overview</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <MiniStatCard label="Students" value={students.length} color="var(--neon-blue)" sub="registered" />
                          <MiniStatCard label="Assignments" value={assignments.length} color="var(--neon-blue)" sub={`${assignments.filter(a => a.due_date && new Date(a.due_date) > new Date()).length} active`} />
                          <MiniStatCard label="Submissions" value={totalSubs} color="var(--neon-amber)" sub={`${gradedPct}% graded`} />
                          <MiniStatCard label="Avg Score" value={avgScore != null ? `${avgScore}` : '—'} color="var(--neon-green)" sub={avgScore != null ? 'out of 100' : 'no data yet'} />
                        </div>
                      </section>

                      {/* ── Charts row ── */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Score Distribution */}
                        <section className="glass-panel p-5 rounded-2xl" style={{ border: '1px solid var(--c-border-dim)' }}>
                          <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'var(--neon-blue)' }}>Score Distribution</p>
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
                        <section className="glass-panel p-5 rounded-2xl" style={{ border: '1px solid var(--c-border-dim)' }}>
                          <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'var(--neon-blue)' }}>Grading Progress</p>
                          {totalSubs === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-6">No submissions yet</p>
                          ) : (
                            <div className="flex flex-col items-center gap-4">
                              {/* SVG donut */}
                              <div className="relative w-32 h-32">
                                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--c-border-dim)" strokeWidth="4" />
                                  <circle cx="18" cy="18" r="14" fill="none"
                                    stroke="var(--neon-green)"
                                    strokeWidth="4"
                                    strokeDasharray={`${(gradedPct / 100) * 87.96} 87.96`}
                                    strokeLinecap="round"
                                  />
                                  <circle cx="18" cy="18" r="14" fill="none"
                                    stroke="var(--neon-amber)"
                                    strokeWidth="4"
                                    strokeDasharray={`${((totalSubs - gradedSubs) / totalSubs) * 87.96} 87.96`}
                                    strokeDashoffset={`-${(gradedPct / 100) * 87.96}`}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-2xl font-black" style={{ color: 'var(--c-text)' }}>{gradedPct}%</span>
                                  <span className="text-[9px]" style={{ color: 'var(--c-text-muted)' }}>graded</span>
                                </div>
                              </div>
                              <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--neon-green)' }} />
                                  <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Graded <strong style={{ color: 'var(--c-text)' }} className="ml-1">{gradedSubs}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--neon-amber)' }} />
                                  <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Pending <strong style={{ color: 'var(--c-text)' }} className="ml-1">{totalSubs - gradedSubs}</strong></span>
                                </div>
                              </div>
                            </div>
                          )}
                        </section>
                      </div>

                      {/* ── Results per assignment ── */}
                      <section>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--neon-blue)' }}>Assignment Results</p>
                        {assignmentResults.length === 0 ? (
                          <p className="text-slate-500 text-sm">No assignments yet</p>
                        ) : (
                          <div className="glass-panel rounded-2xl overflow-hidden" style={{ border: '1px solid var(--c-border-dim)' }}>
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--c-border-dim)', background: 'var(--c-surface-2)' }}>
                                  <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-wider">Assignment</th>
                                  <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-wider text-center">Submissions</th>
                                  <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-wider text-center">Graded</th>
                                  <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-wider text-center">Avg Score</th>
                                  <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-wider text-center">XP</th>
                                </tr>
                              </thead>
                              <tbody>
                                {assignmentResults.map((a, i) => {
                                  const score = a.avgScore;
                                  let color = 'var(--c-text-muted)';
                                  if (score >= 90) color = 'var(--neon-green)';
                                  else if (score >= 75) color = 'var(--neon-blue)';
                                  else if (score >= 50) color = 'var(--neon-amber)';
                                  else if (score != null) color = 'var(--neon-red)';
                                  return (
                                    <tr key={a.id}
                                      style={{ borderBottom: i < assignmentResults.length - 1 ? '1px solid var(--c-border-dim)' : 'none' }}
                                      className="hover:bg-white/[0.05] transition-colors cursor-pointer"
                                      onClick={() => { setSelectedAssignment(a); setActiveTab('Submissions'); fetchSubmissions(a.id); }}
                                    >
                                      <td className="px-4 py-3">
                                        <span className="font-bold" style={{ color: 'var(--c-text)' }}>{a.title}</span>
                                        {a.classroom_name && <span className="ml-2 text-[10px]" style={{ color: 'var(--c-text-muted)' }}>{a.classroom_name}</span>}
                                      </td>
                                      <td className="px-4 py-3 text-center font-bold" style={{ color: 'var(--c-text)' }}>{a.totalSubs}</td>
                                      <td className="px-4 py-3 text-center">
                                        <span className="font-bold" style={{ color: a.gradedCount === a.totalSubs && a.totalSubs > 0 ? 'var(--neon-green)' : 'var(--neon-amber)' }}>{a.gradedCount}</span>
                                        <span style={{ color: 'var(--c-text-muted)' }}>/{a.totalSubs}</span>
                                      </td>
                                      <td className="px-4 py-3 text-center font-black" style={{ color }}>
                                        {a.avgScore != null ? a.avgScore : '—'}
                                      </td>
                                      <td className="px-4 py-3 text-center font-bold" style={{ color: 'var(--neon-blue)' }}>+{a.points_reward}</td>
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
                        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--neon-blue)' }}>Global Leaderboard</p>
                        {loadingLeaderboard ? (
                          <div className="flex items-center justify-center py-12">
                            <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="var(--neon-blue)" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10" />
                            </svg>
                          </div>
                        ) : studentsForLeaderboard.length === 0 ? (
                          <p className="text-slate-500 text-sm">No students registered yet</p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {studentsForLeaderboard.map((student, idx) => {
                              const pct = Math.min(((student.points || 0) / maxPts) * 100, 100);
                              return (
                                <div key={student.id}
                                  className="glass-panel px-5 py-4 rounded-2xl flex items-center gap-4 animate-fade-in"
                                  style={{ border: idx < 3 ? `1px solid ${['rgba(255,215,0,0.3)', 'rgba(192,192,192,0.2)', 'rgba(205,127,50,0.2)'][idx]}` : '1px solid var(--c-border-dim)' }}>
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
                                      <span className="font-bold text-sm" style={{ color: 'var(--c-text)' }}>{student.username}</span>
                                      <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Lv.{student.level || 1}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-border-dim)' }}>
                                      <div className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #075985, var(--neon-blue))' }} />
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="font-black text-sm" style={{ color: 'var(--c-text)' }}>{student.points || 0}</p>
                                    <p className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>XP</p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="font-black text-sm" style={{ color: 'var(--c-text)' }}>{(student.badges || []).length}</p>
                                    <p className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>Badges</p>
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

            {/* ── Tab: Simulation ── */}
            {activeTab === 'Simulation' && (
              <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
                <div className="flex flex-col lg:flex-row h-full w-full relative gap-4 mb-10">
                  <Toolbar />
                  <div className="flex-1 flex flex-col relative" style={{ minHeight: '60dvh' }}>
                    <Canvas
                      gates={simGates} setGates={setSimGates}
                      wires={simWires} setWires={setSimWires}
                      onGateStateToggle={handleSimGateStateToggle}
                      activeWires={simActiveWires}
                      computedGateValues={simComputedValues}
                      resetViewTrigger={simResetView}
                    />
                  </div>
                  <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col pb-6 lg:pb-0 overflow-y-auto hidden-scrollbar z-20"
                    style={{ borderLeft: '1px solid var(--c-border-dim)' }}>
                    <div className="px-5 mb-4 border-b pb-2 flex gap-4" style={{ borderColor: 'var(--c-border-dim)' }}>
                      {['Controls', 'Truth Table', 'Circuit'].map(t => (
                        <button key={t} onClick={() => setSimActiveTab(t)}
                          className={`pb-2 text-xs font-black uppercase tracking-widest transition-colors relative`}
                          style={{ color: simActiveTab === t ? 'var(--neon-blue)' : 'var(--c-text-muted)' }}>
                          {t}
                          {simActiveTab === t && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] rounded-t-full shadow-[0_0_8px_var(--neon-blue)]"
                              style={{ background: 'var(--neon-blue)' }} />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 overflow-y-auto px-5">
                      {simActiveTab === 'Controls' && (
                        <div className="flex flex-col gap-5 animate-fade-in">
                          <div>
                            <SimButton isPlaying={simIsPlaying} onClick={simIsPlaying ? handleSimStop : handleSimStart} />
                          </div>
                          <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center border-dashed" style={{ borderColor: 'var(--c-border-dim)', background: 'transparent' }}>
                            <span className="text-2xl mb-1 mt-2">💡</span>
                            <p className="text-[11px] text-center mb-2" style={{ color: 'var(--c-text-muted)' }}>
                              Use this simulation to build and test logic circuits freely.
                            </p>
                          </div>
                          <button onClick={() => setShowClearConfirm(true)}
                            className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest mt-auto mb-2 transition-all hover:bg-red-500/20 active:scale-95"
                            style={{ background: 'rgba(255,51,102,0.1)', color: 'var(--neon-red)', border: '1px solid rgba(255,51,102,0.3)' }}>
                            Clear Board
                          </button>
                        </div>
                      )}
                      {simActiveTab === 'Truth Table' && (
                        <div className="animate-fade-in"><TruthTable gates={simGates} wires={simWires} /></div>
                      )}
                      {simActiveTab === 'Circuit' && (
                        <div className="animate-fade-in grid grid-cols-2 gap-2 mt-2">
                          <StatChip label="GATES" value={simGates.filter(g => g.type !== 'INPUT' && g.type !== 'OUTPUT').length} color="var(--neon-blue)" />
                          <StatChip label="WIRES" value={simWires.length} color="var(--neon-green)" />
                          <StatChip label="INPUTS" value={simGates.filter(g => g.type === 'INPUT').length} color="var(--neon-amber)" />
                          <StatChip label="OUTPUTS" value={simGates.filter(g => g.type === 'OUTPUT').length} color="var(--neon-red)" />
                        </div>
                      )}
                    </div>
                  </aside>
                </div>
              </DndProvider>
            )}
            
            {/* ── Tab: Profile ── */}
            {activeTab === 'Profile' && (
              <div className="flex flex-col gap-6 animate-fade-in max-w-2xl">
                {/* Identity Card */}
                <div className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6" 
                     style={{ border: '1px solid var(--c-border-dim)', background: 'var(--c-surface-2)' }}>
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black shadow-2xl"
                       style={{ background: 'linear-gradient(135deg, #0369a1, #0ea5e9)', color: '#fff', border: '2px solid var(--c-border)' }}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-black mb-1" style={{ color: 'var(--c-text)' }}>{user?.username}</h3>
                    <p className="text-slate-400 font-medium tracking-wide">LogicPlay Instructor</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" 
                         style={{ background: 'rgba(57,255,20,0.1)', color: '#39ff14', border: '1px solid rgba(57,255,20,0.2)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse" />
                      Active Access
                    </div>
                  </div>
                </div>

                {/* Account Settings / Administration */}
                <div className="glass-panel p-8 rounded-2xl flex flex-col gap-5" 
                     style={{ border: '1px solid var(--c-border-dim)' }}>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest mb-1" style={{ color: 'var(--neon-red)' }}>Administrative Actions</h4>
                    <p className="text-xs text-slate-500">Sensitive operations for your instructor account</p>
                  </div>
                  
                  <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-sm font-bold text-red-500">Delete Instructor Account</p>
                      <p className="text-[11px] text-slate-500 max-w-[300px] mt-0.5">Permanently remove all classes, assignments, and student data associated with you.</p>
                    </div>
                    <button 
                      onClick={() => setShowDeleteAccount(true)}
                      className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #ef4444, #7f1d1d)', boxShadow: '0 4px 15px rgba(239,68,68,0.2)' }}
                    >
                      Delete Account
                    </button>
                  </div>

                  <div className="p-5 rounded-xl border border-blue-500/20 bg-blue-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-sm font-bold text-blue-400">Security Settings</p>
                      <p className="text-[11px] text-slate-500 max-w-[300px] mt-0.5">Regularly updating your password ensures your instructor access remains secure.</p>
                    </div>
                    <button 
                      onClick={() => setShowChangePassword(true)}
                      className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', boxShadow: '0 4px 15px rgba(2,132,199,0.2)' }}
                    >
                      Update Password
                    </button>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Account created</span>
                    <span className="text-xs text-slate-500">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Info Card */}
                <div className="p-6 rounded-2xl flex items-start gap-4" style={{ background: 'rgba(0,212,255,0.03)', border: '1px dashed rgba(0,212,255,0.2)' }}>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-blue-400 mb-1">Teacher Privileges</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">As an instructor, you have full control over classrooms and student submissions. Remember that deleting your account is irreversible and clears all progress for students enrolled in your classes.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      {showClassSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 w-full max-w-sm rounded-[24px]" style={{ border: '1px solid var(--c-border)', background: 'var(--c-glass)' }}>
            <h3 className="text-lg font-black mb-4" style={{ color: 'var(--c-text)' }}>Classroom Settings</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold mb-1 block" style={{ color: 'var(--c-text-muted)' }}>Class Name</label>
                <input
                  type="text"
                  value={editClassName}
                  onChange={e => setEditClassName(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-200"
                  style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)', color: 'var(--c-text)' }}
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer group mt-2 p-3 rounded-xl border transition-all duration-200 hover:bg-white/5"
                     style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)' }}>
                <div className="relative inline-block w-10 min-w-[40px] mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-700 dark:border-slate-800 top-0.5 left-0.5 peer checked:bg-white checked:border-blue-500 checked:translate-x-[18px] transition-all" checked={editRequireApproval} onChange={e => setEditRequireApproval(e.target.checked)} />
                  <label className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-600 dark:bg-slate-700 cursor-pointer peer-checked:bg-blue-500 transition-colors"></label>
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight" style={{ color: 'var(--c-text)' }}>Require Approval</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--c-text-muted)' }}>Force students to be approved manually.</p>
                </div>
              </label>

              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => setShowClassSettings(false)} className="flex-1 py-3 text-xs font-bold rounded-xl border transition-colors"
                        style={{ background: 'var(--c-surface-2)', borderColor: 'var(--c-border-dim)', color: 'var(--c-text-muted)' }}>Cancel</button>
                <button onClick={saveClassSettings} className="flex-1 py-3 text-xs font-bold text-white rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-glow-blue" style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}>Save</button>
              </div>

              <div className="border-t border-white/10 mt-2 pt-4">
                <button
                  onClick={() => { setShowClassSettings(false); setShowDeleteClass(true); }}
                  className="w-full py-2.5 text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors"
                >
                  Delete Classroom Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteClass}
        title="Delete Classroom"
        message={`Are you absolutely sure you want to permanently delete "${selectedClassroom?.name}"? All assignments and student submissions will be lost.`}
        confirmLabel="Delete Classroom"
        onConfirm={handleDeleteClass}
        onCancel={() => setShowDeleteClass(false)}
        danger
      />

      <ConfirmModal
        isOpen={showKickConfirm}
        title="Remove Student"
        message={`Are you sure you want to remove ${studentToKick?.username} from this class?`}
        confirmLabel="Remove Student"
        onConfirm={confirmKickStudent}
        onCancel={() => setShowKickConfirm(false)}
        danger
      />

      <ConfirmModal
        isOpen={showDeleteAssignmentConfirm}
        title="Delete Assignment"
        message={`Delete "${assignmentToDelete?.title}"? All submissions associated with this assignment will be permanently lost.`}
        confirmLabel="Delete Assignment"
        onConfirm={confirmDeleteAssignment}
        onCancel={() => setShowDeleteAssignmentConfirm(false)}
        danger
      />

      <CreateAssignmentModal
        isOpen={showCreate}
        teacherUsername={user?.username}
        classrooms={classrooms}
        onCreated={() => { setShowCreate(false); fetchAssignments(); addToast('success', 'Assignment created!'); }}
        onCancel={() => setShowCreate(false)}
      />
      
      <TypeToConfirmModal
        isOpen={showDeleteAccount}
        title="Delete Teacher Account"
        message="This is a highly destructive action. Deleting your account will permanently remove all your classrooms, assignments, and student submissions. This cannot be undone."
        expectedText={user?.username || ''}
        confirmLabel={deletingAccount ? 'Deleting...' : 'Delete Account'}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteAccount(false)}
      />

      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear Simulation Board"
        message="Are you sure you want to clear the entire board? All gates and wires will be permanently removed."
        confirmLabel="Clear Everything"
        onConfirm={() => {
          setSimGates([]);
          setSimWires([]);
          setSimComputedValues(null);
          setSimActiveWires(null);
          setShowClearConfirm(false);
          addToast('info', 'Simulation board cleared');
        }}
        onCancel={() => setShowClearConfirm(false)}
        danger
      />

      <ConfirmModal
        isOpen={showApproveConfirm}
        title="Approve Student?"
        message={`Are you sure you want to approve ${studentToApprove?.username} for this classroom?`}
        confirmLabel="Approve"
        onConfirm={confirmApproveStudent}
        onCancel={() => setShowApproveConfirm(false)}
      />

      <ConfirmModal
        isOpen={showRegenerateConfirm}
        title="Regenerate Join Code?"
        message="The current join code will stop working immediately. Any students who haven't joined yet will need the new code."
        confirmLabel={isRegenerating ? "Regenerating..." : "Regenerate"}
        onConfirm={handleRegenerateCode}
        onCancel={() => setShowRegenerateConfirm(false)}
        danger
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
      <ChangePasswordModal 
        isOpen={showChangePassword} 
        onClose={() => setShowChangePassword(false)} 
        username={user?.username} 
      />
    </div>
  );
};

export default TeacherDashboard;
