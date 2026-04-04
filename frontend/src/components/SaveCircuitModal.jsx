import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * SaveCircuitModal — asks the user to name their circuit before saving.
 *
 * Props:
 *   isOpen         – bool
 *   suggestedName  – string, pre-filled value (e.g. "My Circuit 3")
 *   suggestions    – string[], quick-pick chips shown below the input
 *   onSave(name)   – called with the chosen name string
 *   onCancel       – called when dismissed
 */
const SaveCircuitModal = ({ isOpen, suggestedName = 'My Circuit 1', suggestions = [], onSave, onCancel }) => {
  const [name, setName] = useState(suggestedName);
  const inputRef = useRef(null);

  // Sync pre-fill whenever modal opens or suggestion changes
  useEffect(() => {
    if (isOpen) {
      setName(suggestedName);
      // Auto-focus + select-all so the user can immediately type
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 60);
    }
  }, [isOpen, suggestedName]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onCancel?.();
      if (e.key === 'Enter') handleSave();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, name]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave?.(trimmed);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(7px)' }}
      onClick={onCancel}
    >
      <div
        className="glass-panel p-7 flex flex-col gap-5 w-full max-w-sm mx-4 animate-scale-in"
        style={{
          border: '1.5px solid rgba(0,212,255,0.35)',
          boxShadow: '0 0 50px rgba(0,212,255,0.12), 0 20px 40px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon + heading */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--neon-blue)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </div>
          <h2
            className="text-center text-lg font-black tracking-wide"
            style={{ color: 'var(--neon-blue)' }}
          >
            Name Your Circuit
          </h2>
          <p className="text-center text-xs text-slate-500">
            Give it a memorable name before saving.
          </p>
        </div>

        {/* Text input */}
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={64}
            placeholder="e.g. My Circuit 1"
            className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white outline-none transition-all duration-200"
            style={{
              background: 'rgba(0,212,255,0.06)',
              border: '1.5px solid rgba(0,212,255,0.3)',
              caretColor: 'var(--neon-blue)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(0,212,255,0.7)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(0,212,255,0.3)')}
          />

          {/* Quick-pick suggestion chips */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setName(s)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-150 hover:scale-105"
                  style={{
                    background: name === s ? 'rgba(0,212,255,0.18)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${name === s ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: name === s ? 'var(--neon-blue)' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-ghost flex-1 py-2.5">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="btn-primary flex-1 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SaveCircuitModal;
