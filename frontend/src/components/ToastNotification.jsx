import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

/* ============================================================
   Toast Context — use useToast() in any component
   ============================================================ */
const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const ICONS = {
  xp:    { icon: '⚡', color: 'var(--neon-green)',  border: 'rgba(57,255,20,0.35)',   bg: 'rgba(57,255,20,0.08)' },
  badge: { icon: '🏆', color: 'var(--neon-amber)',  border: 'rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.08)' },
  error: { icon: '✗',  color: 'var(--neon-red)',    border: 'rgba(255,51,102,0.35)',  bg: 'rgba(255,51,102,0.08)' },
  info:  { icon: 'ℹ',  color: 'var(--neon-blue)',   border: 'rgba(0,212,255,0.35)',   bg: 'rgba(0,212,255,0.08)' },
  success:{ icon: '✓', color: 'var(--neon-green)',  border: 'rgba(57,255,20,0.35)',   bg: 'rgba(57,255,20,0.08)' },
};

const ToastItem = ({ id, type, message, onRemove }) => {
  const style = ICONS[type] || ICONS.info;

  useEffect(() => {
    const t = setTimeout(() => onRemove(id), 3200);
    return () => clearTimeout(t);
  }, [id, onRemove]);

  return (
    <div className="toast-enter flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl min-w-[260px] max-w-[320px] cursor-pointer"
         style={{ background: `rgba(13,26,45,0.95)`, border: `1px solid ${style.border}`, backdropFilter: 'blur(12px)' }}
         onClick={() => onRemove(id)}>
      <div className="text-lg leading-none mt-0.5" style={{ color: style.color, filter: `drop-shadow(0 0 6px ${style.color})` }}>
        {style.icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold leading-snug" style={{ color: style.color }}>
          {message}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">Click to dismiss</p>
      </div>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden">
        <div className="h-full rounded-b-xl" style={{ background: style.color, width: '100%', animation: 'barFill 3.2s linear reverse forwards' }} />
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, type, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto relative">
            <ToastItem {...t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
