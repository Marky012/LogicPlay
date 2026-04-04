import React, { useState, useContext, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { AuthContext } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import Canvas from '../components/Canvas.jsx';
import Toolbar from '../components/Toolbar.jsx';
import Gamification from '../components/Gamification.jsx';
import ChallengeList from '../components/ChallengeList.jsx';
import TruthTable from '../components/TruthTable.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import SaveCircuitModal from '../components/SaveCircuitModal.jsx';
import BottomSheet from '../components/BottomSheet.jsx';
import SubmitAssignmentModal from '../components/SubmitAssignmentModal.jsx';
import ReportCardModal from '../components/ReportCardModal.jsx';
import { useToast } from '../components/ToastNotification.jsx';
import { validateCircuitConnections, evaluateCircuit } from '../utils/circuitLogic';
import { saveCircuit, getUser, getCircuits } from '../utils/api';

/* ── Animated Play/Stop Button ── */
const SimButton = ({ isPlaying, onClick }) => (
  <button onClick={onClick}
          className="w-full py-3 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: isPlaying
              ? 'linear-gradient(135deg, #7f1d1d, #ff3366)'
              : 'linear-gradient(135deg, #14532d, #39ff14)',
            border: `1.5px solid ${isPlaying ? 'rgba(255,51,102,0.5)' : 'rgba(57,255,20,0.5)'}`,
            boxShadow: isPlaying
              ? '0 0 20px rgba(255,51,102,0.3)'
              : '0 0 20px rgba(57,255,20,0.3)',
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

/* ── Feedback Banner ── */
const FeedbackBanner = ({ feedback }) => {
  if (!feedback) return null;
  const isSuccess = feedback.toLowerCase().includes('success') || feedback.toLowerCase().includes('score: 100');
  const isError   = feedback.toLowerCase().includes('error');
  const color  = isSuccess ? 'var(--neon-green)' : isError ? 'var(--neon-red)' : 'var(--neon-blue)';
  const border = isSuccess ? 'rgba(57,255,20,0.3)' : isError ? 'rgba(255,51,102,0.3)' : 'rgba(0,212,255,0.3)';
  const bg     = isSuccess ? 'rgba(57,255,20,0.06)' : isError ? 'rgba(255,51,102,0.06)' : 'rgba(0,212,255,0.06)';

  return (
    <div className="px-3 py-2.5 rounded-xl text-xs font-medium leading-relaxed animate-slide-up"
         style={{ background: bg, border: `1px solid ${border}`, color }}>
      <span className="mr-1">{isSuccess ? '✓' : isError ? '⚠' : 'ℹ'}</span>
      {feedback}
    </div>
  );
};

/* ── Stats Row ── */
const StatChip = ({ label, value, color }) => (
  <div className="flex flex-col items-center px-3 py-2 rounded-lg"
       style={{ background: `${color}0f`, border: `1px solid ${color}25` }}>
    <span className="text-base font-black" style={{ color }}>{value}</span>
    <span className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</span>
  </div>
);

/* ── Right Sidebar Tabs ── */
const TABS = ['Controls', 'Truth Table', 'Circuit'];

const getCircuitHash = (g, w) => {
  const cleanGates = g.map(({ id, type, x, y }) => ({ id, type, x, y }));
  return JSON.stringify({ gates: cleanGates, wires: w });
};

const Playground = () => {
  const { user, isTeacher } = useContext(AuthContext);
  const location   = useLocation();
  const navigate   = useNavigate();
  const addToast   = useToast();
  const evalRef    = useRef(null);
  const lastSavedCircuitRef = useRef(null);

  const [gates, setGates]                     = useState([]);
  const [wires, setWires]                     = useState([]);
  const [activeWires, setActiveWires]         = useState(null);
  const [computedGateValues, setComputedGateValues] = useState(null);
  const [feedback, setFeedback]               = useState('');
  const [isPlaying, setIsPlaying]             = useState(false);
  const [activeTab, setActiveTab]             = useState('Controls');
  const [profileData, setProfileData]         = useState({ points: 0, level: 1, badges: [] });
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showSuccess, setShowSuccess]         = useState(false);
  const [grading, setGrading]                 = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [resetViewTrigger, setResetViewTrigger]   = useState(0);
  const [viewMode, setViewMode]                   = useState(false);
  const [showClearConfirm, setShowClearConfirm]   = useState(false);
  const [showSaveModal, setShowSaveModal]         = useState(false);
  const [savedCircuitCount, setSavedCircuitCount] = useState(0);
  const [showSubmitModal, setShowSubmitModal]     = useState(false);
  const [reportCardData, setReportCardData]       = useState(null);
  // Flag to skip the first gates/wires effect after a circuit load (prevents false unsaved-changes)
  const skipNextChangeRef = useRef(false);

  useEffect(() => {
    if (skipNextChangeRef.current) {
      skipNextChangeRef.current = false;
      return;
    }
    if (gates.length > 0 || wires.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [gates, wires]);

  const fetchProfile = async () => {
    if (user?.username) {
      try {
        const data = await getUser(user.username);
        setProfileData(data);
      } catch (e) { console.error(e); }
    }
  };

  const fetchCircuitCount = async () => {
    if (user?.username) {
      try {
        const circuits = await getCircuits(user.username);
        setSavedCircuitCount(Array.isArray(circuits) ? circuits.length : 0);
      } catch (e) { /* non-fatal */ }
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchCircuitCount();
    return () => clearInterval(evalRef.current);
  }, [user]);

  // Handle loading circuit from external source (like Profile)
  useEffect(() => {
    if (location.state?.loadCircuit) {
      const c = location.state.loadCircuit;
      if (c.circuit_data?.gates && c.circuit_data?.wires) {
        skipNextChangeRef.current = true; // prevent false unsaved-changes flag
        setGates(c.circuit_data.gates);
        setWires(c.circuit_data.wires);

        let title = c.circuit_data.name || `Circuit #${c.id}`;
        setSelectedChallenge({ title, id: 'custom_loaded' });
        setViewMode(true);
        setHasUnsavedChanges(false);
        lastSavedCircuitRef.current = getCircuitHash(c.circuit_data.gates, c.circuit_data.wires);

        addToast('success', `Loaded ${title} in View Mode`);

        // Safely clear location state to prevent reload crashing
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, navigate, location.pathname]);

  const startSimulation = () => {
    setIsPlaying(true);
    addToast('info', 'Simulation running — toggle INPUT gates!');
  };

  const stopSimulation = () => {
    setIsPlaying(false);
    setActiveWires(null);
    setComputedGateValues(null);
    addToast('info', 'Simulation stopped.');
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      const result = evaluateCircuit(gates, wires);
      setActiveWires(result.activeWires);
      setComputedGateValues(result.gateValues);
      
      interval = setInterval(() => {
        const res = evaluateCircuit(gates, wires);
        setActiveWires(res.activeWires);
        setComputedGateValues(res.gateValues);
      }, 100);
    } else {
      setActiveWires(null);
      setComputedGateValues(null);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gates, wires]);

  const handleGateStateToggle = (gateId) => {
    setGates(prev => prev.map(g =>
      g.id === gateId && g.type === 'INPUT' ? { ...g, state: g.state === 1 ? 0 : 1 } : g
    ));
  };

  const handleGrade = async () => {
    if (gates.length === 0) {
      addToast('error', 'Cannot grade an empty circuit!');
      return;
    }
    const validation = validateCircuitConnections(gates, wires);
    if (!validation.isValid) {
      setFeedback('Error: ' + validation.errors.join(' '));
      addToast('error', validation.errors[0]);
      return;
    }
    setGrading(true);
    await new Promise(r => setTimeout(r, 600)); // brief "grading" animation
    const evalResult = evaluateCircuit(gates, wires);
    setGrading(false);

    if (evalResult.score === 100) {
      setFeedback('Circuit complete! All outputs are HIGH — score: 100');
      addToast('xp', '+50 XP — perfect circuit!');
      setShowSuccess(true);
    } else {
      setFeedback(`Circuit graded. Local eval score: ${evalResult.score}. Not all outputs are HIGH.`);
      addToast('info', `Score: ${evalResult.score} — keep building!`);
    }
  };

  // Opens the naming modal; pre-flight validation happens here
  const handleSave = () => {
    if (gates.length === 0) { addToast('error', 'Nothing to save — add some gates first!'); return; }
    const validation = validateCircuitConnections(gates, wires);
    if (!validation.isValid) {
      addToast('error', `Cannot save: ${validation.errors[0]}`);
      return;
    }
    const currentHash = getCircuitHash(gates, wires);
    if (lastSavedCircuitRef.current === currentHash) {
      addToast('info', 'This exact circuit is already saved!');
      return;
    }
    setShowSaveModal(true);
  };

  // Actually persists — called by SaveCircuitModal with the chosen name
  const executeCircuitSave = async (circuitName) => {
    setShowSaveModal(false);
    try {
      const circuitData = {
        circuit_data: { gates, wires, name: circuitName },
        score: evaluateCircuit(gates, wires).score,
        feedback: 'Saved',
      };
      await saveCircuit(circuitData, profileData.id || 1);
      lastSavedCircuitRef.current = getCircuitHash(gates, wires);
      setSavedCircuitCount(prev => prev + 1);
      addToast('success', `"${circuitName}" saved! XP updated.`);
      fetchProfile();
      setHasUnsavedChanges(false);
    } catch (e) {
      addToast('error', 'Save failed. ' + (e.message || ''));
    }
  };

  const clearCanvas = () => {
    if (gates.length === 0 && wires.length === 0) {
      addToast('info', 'Nothing to clear — canvas is already empty!');
      return;
    }
    setGates([]); setWires([]); setActiveWires(null);
    setComputedGateValues(null); setFeedback('');
    if (isPlaying) stopSimulation();
    setResetViewTrigger(prev => prev + 1);
    lastSavedCircuitRef.current = null;
    skipNextChangeRef.current = true; // clearing is not an unsaved change
    setHasUnsavedChanges(false);
    addToast('info', 'Canvas cleared.');
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-slate-400">Please log in to play.</p>
    </div>
  );

  return (
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      <div className="flex flex-col min-h-screen" style={{ background: 'var(--c-bg)' }}>
        {/* ── NavBar ── */}
        <NavBar profileData={profileData} />

        {/* ── Gamification HUD ── */}
        <div className="px-2 sm:px-4 pt-1.5 sm:pt-3 pb-1 sm:pb-2 flex items-center justify-between flex-wrap gap-2"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <Gamification
            points={profileData.points || 0}
            level={profileData.level || 1}
            badges={profileData.badges || []}
          />
          {selectedChallenge && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm animate-slide-in-right"
                 style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <span style={{ color: 'var(--neon-blue)' }}>📋</span>
              <span className="text-white font-semibold text-xs">{selectedChallenge.title}</span>
              <button className="text-slate-600 hover:text-slate-300 text-xs ml-1" onClick={() => setSelectedChallenge(null)}>✕</button>
            </div>
          )}
        </div>

        {/* ── Main Layout ── */}
        <main className="flex-1 flex flex-col lg:flex-row p-2 lg:p-3 gap-2 lg:gap-3 overflow-auto lg:overflow-hidden">

          {/* Left: Toolbar only (hidden on mobile, shows on desktop) */}
          {!viewMode && (
            <div className="flex-shrink-0 relative z-50 w-full lg:w-[200px]">
              <Toolbar />
            </div>
          )}

          {/* Center: Canvas */}
          <Canvas
            gates={gates}
            setGates={setGates}
            wires={wires}
            setWires={setWires}
            onGateStateToggle={handleGateStateToggle}
            activeWires={activeWires}
            computedGateValues={computedGateValues}
            resetViewTrigger={resetViewTrigger}
            isReadOnly={viewMode}
          />

          {/* Right: Tabbed Panel + Challenge List — desktop only */}
          <div className="hidden lg:flex flex-col gap-3 flex-shrink-0 overflow-y-auto lg:w-[230px]" style={{ maxHeight: '100%' }}>
            {viewMode ? (
              <>
                {/* View Mode controls panel */}
                <div className="glass-panel p-4 flex flex-col gap-3 animate-fade-in" style={{ border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 24px rgba(0,212,255,0.08)' }}>
                  <div className="flex items-center gap-2">
                    <div>
                      <h3 className="text-xs font-black tracking-widest uppercase" style={{ color: 'var(--neon-blue)' }}>View Mode</h3>
                      <p className="text-[10px] text-slate-500 leading-tight">Editing is disabled</p>
                    </div>
                  </div>
                  <SimButton isPlaying={isPlaying} onClick={isPlaying ? stopSimulation : startSimulation} />
                  <button 
                    onClick={() => { setViewMode(false); setSelectedChallenge(null); }} 
                    className="btn-primary w-full py-2 text-xs font-bold uppercase tracking-widest shadow-glow-blue"
                  >
                    Close View Mode
                  </button>
                </div>

                <div className="section-divider" />

                {/* Circuit Name */}
                {selectedChallenge?.title && (
                  <div className="flex flex-col gap-0.5 animate-fade-in px-1 mb-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Circuit Name</p>
                    <span className="text-sm font-bold text-white truncate w-full" title={selectedChallenge.title}>
                      {selectedChallenge.title}
                    </span>
                  </div>
                )}
                {/* Truth Table — always visible in view mode */}
                <div className="flex flex-col gap-1.5 animate-fade-in">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Truth Table</p>
                  <div className="rounded-xl overflow-hidden"
                       style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <TruthTable gates={gates} wires={wires} />
                  </div>
                </div>

                {/* Circuit Stats — always visible in view mode */}
                <div className="flex flex-col gap-2 animate-fade-in">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Circuit Info</p>
                  <div className="grid grid-cols-2 gap-2">
                    <StatChip label="Gates"   value={gates.filter(g => g.type !== 'INPUT' && g.type !== 'OUTPUT').length} color="var(--neon-blue)" />
                    <StatChip label="Wires"   value={wires.length} color="var(--neon-green)" />
                    <StatChip label="Inputs"  value={gates.filter(g => g.type === 'INPUT').length}  color="var(--neon-amber)" />
                    <StatChip label="Outputs" value={gates.filter(g => g.type === 'OUTPUT').length} color="var(--neon-red)" />
                  </div>
                  {computedGateValues && gates.filter(g => g.type === 'OUTPUT').length > 0 && (
                    <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Output States</p>
                      {gates.filter(g => g.type === 'OUTPUT').map((g, i) => {
                        const val = computedGateValues[g.id];
                        return (
                          <div key={g.id} className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-400">Output {i + 1}</span>
                            <span className="font-black text-sm" style={{ color: val === 1 ? 'var(--neon-green)' : 'rgba(255,51,102,0.7)' }}>
                              {val === 1 ? 'HIGH' : val === 0 ? 'LOW' : '—'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Tab buttons */}
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {TABS.map(tab => (
                    <button key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200"
                            style={{
                              background: activeTab === tab ? 'rgba(0,212,255,0.15)' : 'transparent',
                              color: activeTab === tab ? 'var(--neon-blue)' : 'rgba(255,255,255,0.35)',
                              border: activeTab === tab ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent',
                            }}>
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Controls Tab */}
                {activeTab === 'Controls' && (
                  <div className="flex flex-col gap-3 animate-fade-in">
                    <SimButton isPlaying={isPlaying} onClick={isPlaying ? stopSimulation : startSimulation} />

                    <button onClick={handleGrade} disabled={grading || gates.length === 0}
                            className="btn-primary w-full py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            style={{ background: grading ? 'rgba(59,130,246,0.3)' : undefined }}>
                      {grading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/>
                          </svg>
                          Grading…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                          Grade Circuit
                        </span>
                      )}
                    </button>

                    <button onClick={handleSave} 
                            disabled={!hasUnsavedChanges || gates.length === 0}
                            className="btn-secondary w-full py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Save Circuit
                    </button>

                    {!isTeacher && (
                      <button onClick={() => {
                        if (gates.length === 0) { addToast('error', 'Build a circuit first before submitting!'); return; }
                        setShowSubmitModal(true);
                      }}
                        className="w-full py-2 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                        style={{
                          background: 'rgba(124,58,237,0.15)',
                          border: '1px solid rgba(124,58,237,0.35)',
                          color: '#a78bfa',
                        }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Submit to Assignment
                      </button>
                    )}

                    <button onClick={() => setShowClearConfirm(true)} className="btn-danger w-full py-2 text-sm flex items-center justify-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                      Clear Canvas
                    </button>

                    <FeedbackBanner feedback={feedback} />
                  </div>
                )}

                {/* Truth Table Tab */}
                {activeTab === 'Truth Table' && (
                  <div className="animate-fade-in rounded-xl overflow-hidden"
                       style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <TruthTable gates={gates} wires={wires} />
                  </div>
                )}

                {/* Circuit Stats Tab */}
                {activeTab === 'Circuit' && (
                  <div className="flex flex-col gap-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-2">
                      <StatChip label="Gates" value={gates.filter(g => g.type !== 'INPUT' && g.type !== 'OUTPUT').length} color="var(--neon-blue)" />
                      <StatChip label="Wires" value={wires.length} color="var(--neon-green)" />
                      <StatChip label="Inputs"  value={gates.filter(g=>g.type==='INPUT').length}  color="var(--neon-amber)" />
                      <StatChip label="Outputs" value={gates.filter(g=>g.type==='OUTPUT').length} color="var(--neon-red)" />
                    </div>

                    {computedGateValues && gates.filter(g=>g.type==='OUTPUT').length > 0 && (
                      <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Output States</p>
                        {gates.filter(g=>g.type==='OUTPUT').map((g,i) => {
                          const val = computedGateValues[g.id];
                          return (
                            <div key={g.id} className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-400">Output {i+1}</span>
                              <span className="font-black text-sm" style={{ color: val===1 ? 'var(--neon-green)' : 'rgba(255,51,102,0.7)' }}>
                                {val === 1 ? 'HIGH' : val === 0 ? 'LOW' : '—'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Challenges Section (below controls) ── */}
                <div className="section-divider" />
                <ChallengeList
                  onSelectChallenge={(c) => {
                    setSelectedChallenge(c);
                    addToast('info', `Challenge: ${c.title}`);
                  }}
                  selectedChallengeId={selectedChallenge?.id}
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Sheet (right panel) ── */}
      <BottomSheet
        label={viewMode ? 'View Mode' : activeTab}
        badge={
          isPlaying ? (
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--neon-green)', boxShadow: '0 0 6px var(--neon-green)' }} />
          ) : feedback ? (
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--neon-amber)' }} />
          ) : null
        }
      >
        {viewMode ? (
          <>
            <div className="glass-panel p-4 flex flex-col gap-3" style={{ border: '1px solid rgba(0,212,255,0.3)' }}>
              <div className="flex items-start justify-between w-full">
                <div className="flex items-center gap-2">
                  <div>
                    <h3 className="text-xs font-black tracking-widest uppercase" style={{ color: 'var(--neon-blue)' }}>View Mode</h3>
                    <p className="text-[10px] text-slate-500 leading-tight">Editing is disabled</p>
                  </div>
                </div>
                {selectedChallenge?.title && (
                  <div className="flex flex-col items-end gap-0.5 max-w-[45%]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Circuit Name</p>
                    <span className="text-sm font-bold text-white truncate w-full text-right" title={selectedChallenge.title}>
                      {selectedChallenge.title}
                    </span>
                  </div>
                )}
              </div>
              <SimButton isPlaying={isPlaying} onClick={isPlaying ? stopSimulation : startSimulation} />
              <button
                onClick={() => { setViewMode(false); setSelectedChallenge(null); }}
                className="btn-primary w-full py-2 text-xs font-bold uppercase tracking-widest shadow-glow-blue"
              >
                Close View Mode
              </button>
            </div>
            <div className="section-divider" />
            

            <div className="flex flex-col gap-1.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Truth Table</p>
              <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <TruthTable gates={gates} wires={wires} />
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Circuit Info</p>
              <div className="grid grid-cols-2 gap-2">
                <StatChip label="Gates"   value={gates.filter(g => g.type !== 'INPUT' && g.type !== 'OUTPUT').length} color="var(--neon-blue)" />
                <StatChip label="Wires"   value={wires.length} color="var(--neon-green)" />
                <StatChip label="Inputs"  value={gates.filter(g => g.type === 'INPUT').length}  color="var(--neon-amber)" />
                <StatChip label="Outputs" value={gates.filter(g => g.type === 'OUTPUT').length} color="var(--neon-red)" />
              </div>
              {computedGateValues && gates.filter(g => g.type === 'OUTPUT').length > 0 && (
                <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Output States</p>
                  {gates.filter(g => g.type === 'OUTPUT').map((g, i) => {
                    const val = computedGateValues[g.id];
                    return (
                      <div key={g.id} className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">Output {i + 1}</span>
                        <span className="font-black text-sm" style={{ color: val === 1 ? 'var(--neon-green)' : 'rgba(255,51,102,0.7)' }}>
                          {val === 1 ? 'HIGH' : val === 0 ? 'LOW' : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Tab buttons */}
            <div className="flex gap-1 p-1 rounded-xl mb-3" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {TABS.map(tab => (
                <button key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200"
                        style={{
                          background: activeTab === tab ? 'rgba(0,212,255,0.15)' : 'transparent',
                          color: activeTab === tab ? 'var(--neon-blue)' : 'rgba(255,255,255,0.35)',
                          border: activeTab === tab ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent',
                        }}>
                  {tab}
                </button>
              ))}
            </div>
            {activeTab === 'Controls' && (
              <div className="flex flex-col gap-3">
                <SimButton isPlaying={isPlaying} onClick={isPlaying ? stopSimulation : startSimulation} />
                <button onClick={handleGrade} disabled={grading || gates.length === 0}
                        className="btn-primary w-full py-2.5 text-sm disabled:opacity-50">
                  {grading ? 'Grading…' : '🎯 Grade Circuit'}
                </button>
                <button onClick={handleSave} disabled={!hasUnsavedChanges || gates.length === 0}
                        className="btn-secondary w-full py-2 text-sm disabled:opacity-50">
                  💾 Save Circuit
                </button>
                {!isTeacher && (
                  <button onClick={() => {
                    if (gates.length === 0) { addToast('error', 'Build a circuit first!'); return; }
                    setShowSubmitModal(true);
                  }}
                    className="w-full py-2 text-sm font-bold rounded-xl flex items-center justify-center gap-1.5"
                    style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', color: '#a78bfa' }}>
                    📤 Submit to Assignment
                  </button>
                )}
                <button onClick={() => setShowClearConfirm(true)} className="btn-danger w-full py-2 text-sm">
                  🗑 Clear Canvas
                </button>
                <FeedbackBanner feedback={feedback} />
              </div>
            )}
            {activeTab === 'Truth Table' && (
              <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <TruthTable gates={gates} wires={wires} />
              </div>
            )}
            {activeTab === 'Circuit' && (
              <div className="grid grid-cols-2 gap-2">
                <StatChip label="Gates"   value={gates.filter(g => g.type !== 'INPUT' && g.type !== 'OUTPUT').length} color="var(--neon-blue)" />
                <StatChip label="Wires"   value={wires.length} color="var(--neon-green)" />
                <StatChip label="Inputs"  value={gates.filter(g => g.type === 'INPUT').length}  color="var(--neon-amber)" />
                <StatChip label="Outputs" value={gates.filter(g => g.type === 'OUTPUT').length} color="var(--neon-red)" />
              </div>
            )}
            <div className="section-divider" />
            <ChallengeList
              onSelectChallenge={(c) => { setSelectedChallenge(c); addToast('info', `Challenge: ${c.title}`); }}
              selectedChallengeId={selectedChallenge?.id}
            />
          </>
        )}
      </BottomSheet>

      {/* ── Submit to Assignment Modal ── */}
      <SubmitAssignmentModal
        isOpen={showSubmitModal}
        studentUsername={user?.username}
        circuitData={{ gates, wires }}
        onSubmitted={({ assignmentTitle }) => {
          setShowSubmitModal(false);
          const score = evaluateCircuit(gates, wires).score || 0;
          setReportCardData({
            studentUsername: user?.username,
            assignmentTitle,
            score,
            gateCount: gates.filter(g => g.type !== 'INPUT' && g.type !== 'OUTPUT').length,
            wireCount: wires.length,
            timestamp: new Date().toLocaleTimeString()
          });
        }}
        onCancel={() => setShowSubmitModal(false)}
      />

      {/* ── Report Card Modal ── */}
      <ReportCardModal
        isOpen={!!reportCardData}
        data={reportCardData}
        onConfirm={() => setReportCardData(null)}
      />

      {/* ── Save Circuit Modal ── */}
      <SaveCircuitModal
        isOpen={showSaveModal}
        suggestedName={`My Circuit ${savedCircuitCount + 1}`}
        suggestions={[
          `My Circuit ${savedCircuitCount + 1}`,
          `Untitled ${savedCircuitCount + 1}`,
          ...(selectedChallenge?.title && selectedChallenge.id !== 'custom_loaded' ? [selectedChallenge.title] : []),
        ].filter((v, i, a) => a.indexOf(v) === i)}
        onSave={executeCircuitSave}
        onCancel={() => setShowSaveModal(false)}
      />

      {/* ── Clear Canvas Confirm ── */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear the canvas?"
        message="All gates and wires will be permanently removed."
        confirmLabel="Clear"
        danger
        onConfirm={() => { setShowClearConfirm(false); clearCanvas(); }}
        onCancel={() => setShowClearConfirm(false)}
      />

      {/* ── Success Modal ── */}
      <SuccessModal
        isOpen={showSuccess}
        score={100}
        xpGained={50}
        onNextChallenge={() => { setShowSuccess(false); setSelectedChallenge(null); clearCanvas(); }}
        onKeepBuilding={() => setShowSuccess(false)}
      />
    </DndProvider>
  );
};

export default Playground;
