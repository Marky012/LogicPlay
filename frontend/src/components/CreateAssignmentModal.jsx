import React, { useState } from 'react';
import { createAssignment } from '../utils/api';

const GATE_OPTIONS = ['', 'AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR', 'Buffer'];

const inputCls = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(124,58,237,0.25)',
  color: '#fff',
};

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
    {children}
  </div>
);

const CreateAssignmentModal = ({ isOpen, teacherUsername, classrooms, onCreated, onCancel }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    target_gate: '',
    due_date: '',
    accept_late: true,
    points_reward: 50,
    classroom_id: classrooms?.length > 0 ? classrooms[0].id : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        target_gate: form.target_gate || null,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        accept_late: form.accept_late,
        points_reward: Number(form.points_reward),
        classroom_id: Number(form.classroom_id),
      };
      await createAssignment(payload, teacherUsername);
      // reset
      setForm({ title: '', description: '', target_gate: '', due_date: '', accept_late: true, points_reward: 50, classroom_id: classrooms?.length > 0 ? classrooms[0].id : '' });
      onCreated();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to create assignment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 flex flex-col gap-5 animate-slide-up"
           style={{ border: '1px solid rgba(124,58,237,0.35)', boxShadow: '0 0 48px rgba(124,58,237,0.18)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">New Assignment</h2>
            <p className="text-xs text-slate-500 mt-0.5">Students will see this in their Playground</p>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Class">
            <select className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ ...inputCls, background: 'rgba(0,0,0,0.3)' }}
                    value={form.classroom_id}
                    onChange={e => setForm(f => ({ ...f, classroom_id: e.target.value }))}
                    disabled={!classrooms || classrooms.length === 0}>
              {!classrooms || classrooms.length === 0 ? (
                <option value="">No classes available (Create one first)</option>
              ) : (
                classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
              )}
            </select>
          </Field>

          <Field label="Title *">
            <input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                   style={inputCls} value={form.title}
                   onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                   placeholder="e.g. Build a Half Adder"
                   onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.7)'}
                   onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.25)'} />
          </Field>

          <Field label="Description">
            <textarea className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
                      style={inputCls} rows={3} value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Instructions or hints for students…"
                      onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.7)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.25)'} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Target Gate (optional)">
              <select className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ ...inputCls, background: 'rgba(0,0,0,0.3)' }}
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
                     onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.7)'}
                     onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.25)'} />
            </Field>
          </div>

          <Field label="Due Date (optional)">
            <input type="datetime-local"
                   className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                   style={{ ...inputCls, colorScheme: 'dark' }}
                   value={form.due_date}
                   onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                   onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.7)'}
                   onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.25)'} />
          </Field>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={form.accept_late}
                     onChange={e => setForm(f => ({ ...f, accept_late: e.target.checked }))} />
              <div className="w-10 h-5 rounded-full transition-colors duration-200"
                   style={{ background: form.accept_late ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)' }}>
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                     style={{ transform: form.accept_late ? 'translateX(20px)' : 'translateX(0)' }} />
              </div>
            </div>
            <span className="text-sm text-slate-300">Accept late submissions</span>
          </label>

          {error && (
            <div className="px-4 py-2.5 rounded-xl text-xs" style={{ background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.3)', color: '#ff3366' }}>
              ⚠ {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancel}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !form.classroom_id}
                    className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)', border: '1px solid rgba(124,58,237,0.5)', boxShadow: '0 0 16px rgba(124,58,237,0.3)' }}>
              {loading ? 'Creating…' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;
