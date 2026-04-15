import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable neon-styled confirmation modal.
 *
 * Props:
 *   isOpen      – bool, controls visibility
 *   title       – string, modal heading
 *   message     – string or ReactNode, body text
 *   confirmLabel – string (default: 'Confirm')
 *   cancelLabel  – string (default: 'Cancel')
 *   onConfirm   – () => void
 *   onCancel    – () => void
 *   danger      – bool, makes confirm button red (default false)
 */
const ConfirmModal = ({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
  hideCancel = false,
}) => {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

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
          border: `1.5px solid ${danger ? 'var(--neon-red)' : 'var(--c-border-dim)'}`,
          background: 'var(--c-surface)',
          boxShadow: danger
            ? '0 0 40px rgba(255,51,102,0.15)'
            : '0 8px 32px rgba(0,0,0,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center">
          {danger ? (
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--neon-red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500/10 border border-blue-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--neon-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
          )}
        </div>

        {/* Title */}
        <h2
          className="text-center text-lg font-black tracking-wide"
          style={{ color: danger ? 'var(--neon-red)' : 'var(--neon-blue)' }}
        >
          {title}
        </h2>

        {/* Message */}
        {message && (
          <p className="text-center text-sm leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{message}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-1">
          {!hideCancel && (
            <button
              onClick={onCancel}
              className="btn-ghost flex-1 py-2.5"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 text-white ${danger ? 'btn-danger' : 'btn-primary'
              }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
