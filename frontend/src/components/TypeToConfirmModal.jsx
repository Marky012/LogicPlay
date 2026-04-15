import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { triggerFeedback } from '../utils/feedback';

const TypeToConfirmModal = ({
  isOpen,
  title = 'Delete Account',
  message,
  expectedText,
  confirmLabel = 'Delete Account',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState('');

  // Close on Escape & Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isMatch = inputValue === expectedText;

  const handleConfirm = () => {
    if (isMatch) {
      triggerFeedback('delete');
      onConfirm();
    } else {
      triggerFeedback('error');
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in"
      style={{ background: 'var(--c-overlay)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <div
        className="glass-panel p-7 flex flex-col gap-5 w-full max-w-sm mx-4 animate-scale-in"
        style={{
          border: '1.5px solid var(--neon-red)',
          background: 'var(--c-surface)',
          boxShadow: '0 0 40px rgba(255,51,102,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/30 shadow-[0_0_15px_rgba(255,51,102,0.4)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--neon-red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-lg font-black tracking-wide" style={{ color: 'var(--neon-red)' }}>
          {title}
        </h2>

        {/* Message */}
        <div className="text-sm leading-relaxed flex flex-col gap-2" style={{ color: 'var(--c-text-muted)' }}>
          {message}
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center mt-2 flex flex-col gap-2">
            <span>To verify, type <b>{expectedText}</b> below:</span>
            <input
              type="text"
              className="w-full bg-black/30 border border-red-500/30 rounded-lg px-3 py-2 text-center text-white outline-none focus:border-red-500 transition-colors font-mono"
              value={inputValue}
              onChange={(e) => {
                  setInputValue(e.target.value);
                  triggerFeedback('click');
              }}
              placeholder={expectedText}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-1">
          <button
            onClick={() => { triggerFeedback('click'); onCancel(); }}
            className="btn-ghost flex-1 py-2.5"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isMatch}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 text-white ${isMatch ? 'btn-danger' : 'bg-red-900/40 text-red-300/50 cursor-not-allowed border-red-900/50'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TypeToConfirmModal;
