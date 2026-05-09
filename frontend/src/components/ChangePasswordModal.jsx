import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { changePassword } from '../utils/api';
import { triggerFeedback } from '../utils/feedback';

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const ChangePasswordModal = ({ isOpen, onClose, username }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await changePassword(username, oldPassword, newPassword);
      setSuccess(true);
      triggerFeedback('success');
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password.');
      triggerFeedback('error');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in px-4" style={{ background: 'var(--c-overlay)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="glass-panel p-6 flex flex-col gap-4 w-full max-w-sm animate-scale-in" style={{ background: 'var(--c-surface)', border: '1.5px solid var(--c-border-dim)' }} onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-black tracking-wide text-center" style={{ color: 'var(--neon-blue)' }}>Update Password</h2>
        
        {success ? (
          <div className="py-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--neon-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="font-bold" style={{ color: 'var(--neon-green)' }}>Password updated!</p>
            <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>Closing window...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="text-xs p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 animate-slide-up">⚠ {error}</div>}
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-60">Current Password</label>
              <div className="relative">
                <input type={showOld ? "text" : "password"} className="input-neon w-full pr-10" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-40 hover:opacity-100 transition-opacity">
                  {showOld ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-60">New Password</label>
              <div className="relative">
                <input type={showNew ? "text" : "password"} className="input-neon w-full pr-10" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-40 hover:opacity-100 transition-opacity">
                  {showNew ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest px-1 opacity-60">Confirm New Password</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} className="input-neon w-full pr-10" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-40 hover:opacity-100 transition-opacity">
                  {showConfirm ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5">Cancel</button>
              <button type="submit" disabled={loading} className="btn-neon-blue flex-1 py-2.5">
                {loading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ChangePasswordModal;
