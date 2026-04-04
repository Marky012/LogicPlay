import React, { useState, useEffect } from 'react';
import { getAssignments, submitCircuit } from '../utils/api';

const formatDate = (dt) => {
  if (!dt) return null;
  const d = new Date(dt);
  const now = new Date();
  const isLate = d < now;
  return { text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), isLate };
};

const SubmitAssignmentModal = ({ isOpen, studentUsername, circuitData, onSubmitted, onCancel }) => {
  const [assignments, setAssignments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFetching(true);
    setSelected(null); setError(''); setSuccess(false);
    getAssignments(studentUsername)
      .then(data => setAssignments(data))
      .catch(() => setError('Failed to load assignments'))
      .finally(() => setFetching(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true); setError('');
    try {
      await submitCircuit({
        assignmentId: selected.id,
        studentUsername: studentUsername,
        circuitData: circuitData,
      });
      setSuccess(true);
      setTimeout(() => { onSubmitted({ assignmentTitle: selected.title }); }, 500);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)' }}>
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 flex flex-col gap-5 animate-slide-up"
           style={{ border: '1px solid rgba(124,58,237,0.35)', boxShadow: '0 0 48px rgba(124,58,237,0.18)' }}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">Submit to Assignment</h2>
            <p className="text-xs text-slate-500 mt-0.5">Choose which assignment to submit your circuit to</p>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
                 style={{ background: 'rgba(57,255,20,0.12)', border: '2px solid rgba(57,255,20,0.4)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <p className="font-black text-white text-lg">Submitted!</p>
            <p className="text-sm text-slate-400">Your circuit has been sent to your teacher</p>
          </div>
        ) : fetching ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/>
            </svg>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm">No assignments available right now</p>
            <p className="text-xs text-slate-600 mt-1">Your teacher hasn't posted any assignments yet</p>
          </div>
        ) : (
          <>
            {/* Assignment list */}
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {assignments.map(a => {
                const due = formatDate(a.due_date);
                const isSelected = selected?.id === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className="text-left p-4 rounded-xl transition-all duration-200"
                    style={{
                      background: isSelected ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: isSelected ? '0 0 12px rgba(124,58,237,0.15)' : 'none',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-white text-sm leading-tight">{a.title}</p>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                             style={{ background: '#7c3aed' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    {a.description && <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{a.description}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] font-bold" style={{ color: '#a78bfa' }}>By {a.teacher_username}</span>
                      {a.classroom_name && (
                        <span className="text-[10px] font-bold" style={{ color: '#0ea5e9' }}>{a.classroom_name}</span>
                      )}
                      {due && (
                        <span className="text-[10px] font-bold" style={{ color: due.isLate ? '#ff3366' : '#39ff14' }}>
                          {due.isLate ? '⚠ Was due ' : '📅 Due '}{due.text}
                          {due.isLate && a.accept_late && <span className="text-slate-500"> (late ok)</span>}
                        </span>
                      )}
                      <span className="text-[10px] font-bold" style={{ color: '#ffd700' }}>+{a.points_reward} XP</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Late warning */}
            {selected && formatDate(selected.due_date)?.isLate && (
              <div className="px-4 py-3 rounded-xl flex items-start gap-2"
                   style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.25)' }}>
                <span style={{ color: '#ffd700' }}>⚠</span>
                <p className="text-xs" style={{ color: '#ffd700' }}>
                  This assignment is past its due date.{' '}
                  {selected.accept_late
                    ? 'Late submissions are accepted but will be marked as late.'
                    : 'Late submissions are not accepted for this assignment.'}
                </p>
              </div>
            )}

            {error && (
              <div className="px-4 py-2.5 rounded-xl text-xs" style={{ background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.3)', color: '#ff3366' }}>
                ⚠ {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={onCancel}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-colors"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selected || loading || (selected && formatDate(selected.due_date)?.isLate && !selected.accept_late)}
                className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)', border: '1px solid rgba(124,58,237,0.5)', boxShadow: '0 0 16px rgba(124,58,237,0.3)' }}
              >
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/></svg> Submitting…</>
                ) : 'Submit Circuit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubmitAssignmentModal;
