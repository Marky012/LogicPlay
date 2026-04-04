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
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <div
        className="glass-panel p-7 flex flex-col gap-5 w-full max-w-sm mx-4 animate-scale-in"
        style={{
          border: `1.5px solid ${danger ? 'rgba(255,51,102,0.4)' : 'rgba(0,212,255,0.3)'}`,
          boxShadow: danger
            ? '0 0 40px rgba(255,51,102,0.15)'
            : '0 0 40px rgba(0,212,255,0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center">
          <span className="text-4xl">{danger ? '⚠️' : '🤔'}</span>
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
          <p className="text-center text-sm text-slate-400 leading-relaxed">{message}</p>
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
