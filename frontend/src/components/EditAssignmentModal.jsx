import React, { useState, useEffect } from 'react';
import { updateAssignment } from '../utils/api';

const GATE_OPTIONS = ['', 'AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR', 'Buffer'];

const inputCls = {
  background: 'var(--c-surface-2)',
  border: '1px solid var(--neon-blue)',
  color: 'var(--c-text)',
};

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>{label}</label>
    {children}
  </div>
);

const toLocalDatetime = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  // Format: YYYY-MM-DDTHH:mm
  return d.toISOString().slice(0, 16);
};

const EditAssignmentModal = ({ isOpen, assignment, teacherUsername, onUpdated, onCancel }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    target_gate: '',
    due_date: '',
    accept_late: true,
    points_reward: 50,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (assignment) {
      setForm({
        title: assignment.title || '',
        description: assignment.description || '',
        target_gate: assignment.target_gate || '',
        due_date: toLocalDatetime(assignment.due_date),
        accept_late: assignment.accept_late ?? true,
        points_reward: assignment.points_reward ?? 50,
      });
    }
  }, [assignment]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    
    if (form.due_date) {
      const now = new Date();
      const due = new Date(form.due_date);
      if (due < now) {
        setError('Due date cannot be in the past.');
        return;
      }
    }

    setLoading(true); setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        target_gate: form.target_gate || null,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        accept_late: form.accept_late,
        points_reward: Number(form.points_reward),
      };
      await updateAssignment(assignment.id, payload, teacherUsername);
      onUpdated();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to update assignment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ background: 'var(--c-bg-glass)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-panel w-full max-w-md md:max-w-xl rounded-2xl p-6 flex flex-col gap-5 animate-slide-up"
           style={{ border: '1px solid var(--c-border-dim)', background: 'var(--c-surface)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black" style={{ color: 'var(--c-text)' }}>Edit Assignment</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>Changes apply immediately</p>
          </div>
          <button onClick={onCancel} className="transition-colors p-1" style={{ color: 'var(--c-text-muted)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Title *">
            <input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                   style={inputCls} value={form.title}
                   onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                   onFocus={e => e.target.style.borderColor = 'rgba(0,130,200,0.7)'}
                   onBlur={e => e.target.style.borderColor = 'rgba(0,130,200,0.25)'} />
          </Field>

          <Field label="Description">
            <textarea className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
                      style={inputCls} rows={3} value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = 'rgba(0,130,200,0.7)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,130,200,0.25)'} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Target Gate">
              <select className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ ...inputCls, background: 'var(--c-surface-2)' }}
                      value={form.target_gate}
                      onChange={e => setForm(f => ({ ...f, target_gate: e.target.value }))}>
                {GATE_OPTIONS.map(g => <option key={g} value={g}>{g || '— None —'}</option>)}
              </select>
            </Field>
            <Field label="Points Reward">
              <input type="number" min={0} max={500}
                     className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                     style={inputCls} value={form.points_reward}
                     onChange={e => setForm(f => ({ ...f, points_reward: e.target.value }))}
                     onFocus={e => e.target.style.borderColor = 'rgba(0,130,200,0.7)'}
                     onBlur={e => e.target.style.borderColor = 'rgba(0,130,200,0.25)'} />
            </Field>
          </div>

          <Field label="Due Date">
            <div className="flex gap-2 items-center">
              <input type="datetime-local"
                     className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                     style={{ ...inputCls }}
                     value={form.due_date}
                     onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                     onFocus={e => e.target.style.borderColor = 'rgba(0,130,200,0.7)'}
                     onBlur={e => e.target.style.borderColor = 'rgba(0,130,200,0.25)'} />
              {form.due_date && new Date(form.due_date) < new Date() && (
                <p className="text-[10px] font-bold mt-1" style={{ color: 'var(--neon-red)' }}>
                  ⚠ This date is in the past!
                </p>
              )}
              {form.due_date && (
                <button type="button" onClick={() => setForm(f => ({ ...f, due_date: '' }))}
                        className="text-xs hover:text-red-400 transition-colors px-2 py-1 rounded-lg"
                        style={{ border: '1px solid var(--c-border-dim)', color: 'var(--c-text-muted)' }}>
                  Clear
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-600">You can change or remove the deadline at any time</p>
          </Field>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={form.accept_late}
                     onChange={e => setForm(f => ({ ...f, accept_late: e.target.checked }))} />
              <div className="w-10 h-5 rounded-full transition-colors duration-200"
                    style={{ background: form.accept_late ? 'var(--neon-blue)' : 'var(--c-border-dim)', boxShadow: form.accept_late ? '0 0 10px rgba(0,212,255,0.3)' : 'none' }}>
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                     style={{ transform: form.accept_late ? 'translateX(20px)' : 'translateX(0)', boxShadow: '0 0 4px rgba(0,0,0,0.3)' }} />
              </div>
            </div>
            <span className="text-sm font-bold" style={{ color: form.accept_late ? 'var(--neon-blue)' : 'var(--c-text-muted)' }}>
              Accept late submissions
            </span>
          </label>

          {error && (
            <div className="px-4 py-2.5 rounded-xl text-xs" style={{ background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.3)', color: '#ff3366' }}>
              ⚠ {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancel}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors"
                    style={{ border: '1px solid var(--c-border-dim)', color: 'var(--c-text-muted)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #075985, #0369a1)', border: '1px solid rgba(0,130,200,0.5)', boxShadow: '0 0 16px rgba(0,130,200,0.3)' }}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAssignmentModal;
