import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { teacherLogin, teacherRegister } from '../utils/api';
import logo from '../assets/L0g1cPLAYicon001.png';

const TeacherLogin = () => {
  const { user, loginTeacher } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'teacher') navigate('/teacher');
      else navigate('/playground');
    }
  }, [user, navigate]);

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await teacherLogin(username.trim(), password);
        loginTeacher(data.username, data.id);
        navigate('/teacher');
      } else {
        await teacherRegister(username.trim(), password);
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setSuccessMsg('Account created successfully. Please sign in.');
      }
    } catch (err) {
      setError(err?.response?.data?.detail || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
         style={{ background: 'var(--c-bg)' }}>
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[120px]"
             style={{ background: 'radial-gradient(circle, #0369a1, transparent)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="LogicPlay" className="h-14 object-contain drop-shadow-[0_0_16px_rgba(0,130,200,0.6)]" />
        </div>

        {/* Card */}
        <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6"
             style={{ border: '1px solid rgba(0,130,200,0.3)', boxShadow: '0 0 40px rgba(0,130,200,0.12)' }}>

          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
                 style={{ background: 'var(--c-surface-2)', border: '1px solid var(--neon-blue)', color: 'var(--neon-blue)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              INSTRUCTOR PORTAL
            </div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--c-text)' }}>
              {mode === 'login' ? 'Teacher Sign In' : 'Create Teacher Account'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--c-text-muted)' }}>
              {mode === 'login' ? 'Access your teaching dashboard' : 'Register to start creating assignments'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)' }}>
            {['login', 'register'].map(m => (
              <button key={m} type="button" onClick={() => { setMode(m); setError(''); setSuccessMsg(''); }}
                      className="flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 capitalize"
                      style={{
                        background: mode === m ? 'var(--c-border-dim)' : 'transparent',
                        color: mode === m ? 'var(--c-text)' : 'var(--c-text-muted)',
                        border: mode === m ? '1px solid rgba(0,130,200,0.4)' : '1px solid transparent',
                      }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>Username</label>
              <input
                id="teacher-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. prof_smith"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl text-sm bg-transparent outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,130,200,0.25)',
                  boxShadow: 'none',
                  color: 'var(--c-text)',
                }}
                onFocus={e => e.target.style.border = '1px solid rgba(0,130,200,0.6)'}
                onBlur={e => e.target.style.border = '1px solid rgba(0,130,200,0.25)'}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>Password</label>
              <input
                id="teacher-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,130,200,0.25)',
                  color: 'var(--c-text)',
                }}
                onFocus={e => e.target.style.border = '1px solid rgba(0,130,200,0.6)'}
                onBlur={e => e.target.style.border = '1px solid rgba(0,130,200,0.25)'}
              />
            </div>

            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>Confirm Password</label>
                <input
                  id="teacher-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(0,130,200,0.25)',
                    color: 'var(--c-text)',
                  }}
                  onFocus={e => e.target.style.border = '1px solid rgba(0,130,200,0.6)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(0,130,200,0.25)'}
                />
              </div>
            )}

            {error && (
              <div className="px-4 py-3 rounded-xl text-xs font-medium animate-slide-up"
                   style={{ background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.3)', color: '#ff3366' }}>
                ⚠ {error}
              </div>
            )}

            {successMsg && (
              <div className="px-4 py-3 rounded-xl text-xs font-medium animate-slide-up bg-opacity-20 bg-green-600 border border-green-500 text-green-400">
                ✓ {successMsg}
              </div>
            )}

            <button
              id="teacher-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-black text-sm text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #075985, #0369a1)',
                border: '1px solid rgba(0,130,200,0.5)',
                boxShadow: '0 0 24px rgba(0,130,200,0.3)',
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/>
                  </svg>
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </>
              ) : (
                mode === 'login' ? 'Sign In to Dashboard' : 'Create Teacher Account'
              )}
            </button>
          </form>

          {/* Back to student login */}
          <div className="text-center">
            <Link to="/" className="text-xs transition-colors duration-200" style={{ color: 'var(--c-text-muted)' }}>
              ← Back to Student Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
