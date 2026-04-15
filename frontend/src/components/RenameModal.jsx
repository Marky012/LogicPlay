import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const RenameModal = ({
  isOpen,
  initialName = '',
  onConfirm,
  onCancel,
}) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName, isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { 
      if (e.key === 'Escape') onCancel?.(); 
      if (e.key === 'Enter' && name.trim()) onConfirm?.(name.trim());
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel, onConfirm, name]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in"
      style={{ background: 'var(--c-overlay)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <div
        className="glass-panel p-7 flex flex-col gap-5 w-full max-w-sm mx-4 animate-scale-in"
        style={{
          border: '1.5px solid var(--c-border)',
          background: 'var(--c-surface)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center">
          <span className="text-4xl text-sky-400">✏️</span>
        </div>

        {/* Title */}
        <h2 className="text-center text-lg font-black tracking-wide" style={{ color: 'var(--neon-blue)' }}>
          Rename Circuit
        </h2>

        {/* Input */}
        <div className="flex flex-col gap-1 w-full mt-2">
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Circuit Name..."
            className="w-full px-4 py-3 rounded-xl bg-transparent border outline-none transition-colors"
            style={{ 
              borderColor: 'var(--c-border-dim)', 
              color: 'var(--c-text)', 
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--neon-blue)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--c-border-dim)' }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-3">
          <button onClick={onCancel} className="btn-ghost flex-1 py-2.5">
            Cancel
          </button>
          <button
            onClick={() => { if(name.trim()) onConfirm(name.trim()); }}
            disabled={!name.trim()}
            className="btn-primary flex-1 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 text-white disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RenameModal;
