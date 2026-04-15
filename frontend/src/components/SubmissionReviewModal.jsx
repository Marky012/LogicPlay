import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import Canvas from './Canvas';
import TruthTable from './TruthTable';
import { gradeSubmission } from '../utils/api';

const ScoreBar = ({ score, max = 100 }) => {
  if (score == null) return null;
  const pct = Math.min((score / max) * 100, 100);
  const color = score >= 90 ? 'var(--neon-green)' : score >= 75 ? 'var(--neon-blue)' : score >= 50 ? 'var(--neon-amber)' : 'var(--neon-red)';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: 'var(--c-text-muted)' }}>Score</span>
        <span className="font-black" style={{ color }}>{score}<span style={{ color: 'var(--c-text-muted)' }}>/{max}</span></span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--c-border-dim)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}66` }} />
      </div>
    </div>
  );
};

const SubmissionReviewModal = ({ isOpen, submission, onGraded, onClose }) => {
  const [score, setScore] = useState(submission?.teacher_score ?? '');
  const [feedback, setFeedback] = useState(submission?.teacher_feedback ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !submission) return null;

  const gates = submission.circuit_data?.gates || [];
  const wires = submission.circuit_data?.wires || [];

  const handleGrade = async () => {
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      setError('Score must be between 0 and 100.');
      return;
    }
    setSaving(true); setError('');
    try {
      await gradeSubmission(submission.id, { teacherScore: numScore, teacherFeedback: feedback.trim() || null });
      onGraded();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to save grade.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const isPerfect = submission?.auto_score >= 100;
  const isPassing = submission?.auto_score >= 60 && submission?.auto_score < 100;
  const themeColor = isPerfect ? 'var(--neon-green)' : isPassing ? 'var(--neon-amber)' : 'var(--neon-red)';
  const scoreText = isPerfect ? 'MISSION ACCOMPLISHED' : isPassing ? 'MISSION CLEARED' : 'MISSION FAILED';

  return (
    <div className="fixed inset-0 z-[9999] flex items-stretch"
         style={{ background: 'var(--c-bg-glass)', backdropFilter: 'blur(12px)' }}>
      {/* Left: Circuit Canvas */}
      <div className="flex-1 flex flex-col" style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
             style={{ borderBottom: '1px solid var(--c-border-dim)', background: 'var(--c-surface)' }}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--neon-blue)' }}>Circuit Submission</p>
            <h2 className="text-sm font-black" style={{ color: 'var(--c-text)' }}>{submission.student_username}</h2>
          </div>
          <div className="flex items-center gap-3">
            {submission.is_late && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,51,102,0.15)', border: '1px solid rgba(255,51,102,0.35)', color: '#ff3366' }}>
                ⚠ Late Submission
              </span>
            )}
            <button onClick={onClose} className="transition-colors p-1" style={{ color: 'var(--c-text-muted)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
            <Canvas
              gates={gates}
              setGates={() => {}}
              wires={wires}
              setWires={() => {}}
              onGateStateToggle={() => {}}
              activeWires={null}
              computedGateValues={null}
              resetViewTrigger={0}
              isReadOnly={true}
            />
          </DndProvider>
        </div>
      </div>

      {/* Right: Info + Grading Panel (Report Card Style) */}
      <div className="w-[320px] flex-shrink-0 flex flex-col overflow-y-auto relative"
           style={{ background: 'var(--c-surface)', borderLeft: '1px solid var(--c-border-dim)' }}>
        
        {/* Glossy Report Header */}
        <div className="py-6 px-5 flex flex-col items-center justify-center text-center relative"
             style={{ borderBottom: `1px solid var(--c-border-dim)`, background: `var(--c-surface-2)` }}>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: themeColor }}>
            {scoreText}
          </p>
          <h2 className="text-3xl font-black leading-tight" style={{ color: 'var(--c-text)' }}>
            {submission.auto_score ?? '?'}<span className="text-base" style={{ color: 'var(--c-text-muted)' }}>/100</span>
          </h2>
          <p className="text-[10px] mt-2" style={{ color: 'var(--c-text-muted)' }}>AUTO-EVALUATION</p>
        </div>

        <div className="p-5 flex flex-col gap-6">

          {/* Context Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)' }}>
              <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: 'var(--c-text-muted)' }}>Operative</span>
              <span className="font-bold text-xs" style={{ color: 'var(--c-text)' }}>{submission.student_username}</span>
            </div>
            
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)' }}>
              <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: 'var(--c-text-muted)' }}>Directive</span>
              <span className="font-bold text-xs max-w-[60%] text-right truncate" style={{ color: 'var(--c-text)' }} title={submission.assignment_title}>
                {submission.assignment_title}
              </span>
            </div>

            <div className="text-center mt-1">
              <span className="text-[9px]" style={{ color: 'var(--c-text-muted)' }}>Submitted {formatDate(submission.submitted_at)}</span>
            </div>
          </div>

          {/* Circuit stats */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Circuit Stats</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Logic Gates', value: gates.filter(g => g.type !== 'INPUT' && g.type !== 'OUTPUT').length, color: 'var(--neon-blue)' },
                { label: 'Wires', value: wires.length, color: 'var(--neon-green)' },
                { label: 'Inputs', value: gates.filter(g => g.type === 'INPUT').length, color: 'var(--neon-amber)' },
                { label: 'Outputs', value: gates.filter(g => g.type === 'OUTPUT').length, color: 'var(--neon-red)' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col items-center py-2 rounded-xl"
                     style={{ background: 'var(--c-surface-2)', border: `1px solid ${color}33` }}>
                  <span className="text-base font-black leading-none mb-1" style={{ color }}>{value}</span>
                  <span className="text-[8px] uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Truth Table */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--c-text-muted)' }}>Truth Table</p>
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)' }}>
              <TruthTable gates={gates} wires={wires} />
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--c-border-dim)' }} />

          {/* Teacher Grading Override */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--neon-blue)' }}>Teacher Grade</p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>Score (0–100)</label>
              <input
                id="teacher-score-input"
                type="number" min={0} max={100}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all font-black"
                style={{ background: 'var(--c-surface-2)', border: '1px solid var(--neon-blue)', color: 'var(--c-text)' }}
                value={score}
                onChange={e => setScore(e.target.value)}
                placeholder="e.g. 85"
                onFocus={e => e.target.style.borderColor = 'rgba(0,130,200,0.7)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,130,200,0.25)'}
              />
              {score !== '' && !isNaN(Number(score)) && <ScoreBar score={Number(score)} />}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>Feedback (optional)</label>
              <textarea
                id="teacher-feedback-input"
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
                style={{ background: 'var(--c-surface-2)', border: '1px solid var(--neon-blue)', color: 'var(--c-text)' }}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Great work! Consider also trying…"
                onFocus={e => e.target.style.borderColor = 'rgba(0,130,200,0.7)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,130,200,0.25)'}
              />
            </div>

            {error && (
              <div className="px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.3)', color: '#ff3366' }}>
                ⚠ {error}
              </div>
            )}

            <button
              id="save-grade-btn"
              onClick={handleGrade}
              disabled={saving || score === ''}
              className="w-full py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #075985, #0369a1)',
                border: '1px solid rgba(0,130,200,0.5)',
                boxShadow: '0 0 20px rgba(0,130,200,0.3)',
              }}
            >
              {saving ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/></svg> Saving…</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Save Grade
                </>
              )}
            </button>

            {submission.status === 'graded' && (
              <p className="text-[10px] text-center" style={{ color: 'var(--neon-green)' }}>✓ Already graded — saving will update</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionReviewModal;
