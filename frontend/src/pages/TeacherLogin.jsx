import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { teacherRegister, unifiedLogin, verifyDevice } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/favicon.png';

const IconMedal = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

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

const TeacherLogin = () => {
  const { user, loginTeacher } = useContext(AuthContext);
  const { isLight } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'teacher') navigate('/teacher');
      else navigate('/playground');
    }
  }, [user, navigate]);

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Verification states
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const { loginUnified, getDeviceToken } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }
    if (mode === 'register' && !email.trim()) {
      setError('Email is required.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'register') {
        await teacherRegister(username.trim(), email.trim(), password);
        // Fall through to login to trigger device tracking
      }
      
      const deviceToken = getDeviceToken();
      const loginData = await unifiedLogin(username.trim(), password, deviceToken);
      
      if (loginData.role !== 'teacher') {
        setError('Student account — use Student Portal.');
        return;
      }
      
      if (loginData.requires_verification) {
        setShowVerifyModal(true);
      } else {
        loginUnified(loginData.username, loginData.role, loginData.id);
        navigate('/teacher');
      }
    } catch (err) {
      setError(err?.response?.data?.detail || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyLoading(true); setError('');
    try {
      const deviceToken = getDeviceToken();
      await verifyDevice(username.trim(), verificationCode, deviceToken);
      setShowVerifyModal(false);
      // Brief delay to ensure database consistency on slower environments
      await new Promise(r => setTimeout(r, 50));
      const loginData = await unifiedLogin(username.trim(), password, deviceToken);
      loginUnified(loginData.username, loginData.role, loginData.id); 
      navigate('/teacher');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Invalid or expired verification code.');
    } finally { setVerifyLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
         style={{ background: 'var(--c-bg)' }}>
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px]"
             style={{
               background: isLight
                 ? 'radial-gradient(circle, rgba(3,105,161,0.1), transparent)'
                 : 'radial-gradient(circle, #0369a1, transparent)',
               opacity: isLight ? 0.6 : 0.10
             }} />
        {isLight && (
          <div className="absolute bottom-[-15%] right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
               style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08), transparent)', opacity: 0.7 }} />
        )}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="LogicPlay" className="h-20 object-contain" style={{
            filter: isLight
              ? 'drop-shadow(0 4px 12px rgba(3,105,161,0.25))'
              : 'drop-shadow(0 0 16px rgba(0,130,200,0.6))'
          }} />
        </div>

        {/* Card */}
        <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6"
             style={{
               border: isLight ? '1.5px solid rgba(3,105,161,0.22)' : '1px solid rgba(0,130,200,0.3)',
               boxShadow: isLight
                 ? '0 8px 40px rgba(3,105,161,0.12), 0 2px 8px rgba(0,0,0,0.04)'
                 : '0 0 40px rgba(0,130,200,0.12)'
             }}>

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
          {!showVerifyModal && (
            <div className="flex gap-1 p-1 rounded-xl" style={{
              background: isLight ? 'rgba(3,105,161,0.06)' : 'var(--c-surface-2)',
              border: isLight ? '1px solid rgba(3,105,161,0.18)' : '1px solid var(--c-border-dim)'
            }}>
              {['login', 'register'].map(m => (
                <button key={m} type="button" onClick={() => { setMode(m); setError(''); setSuccessMsg(''); }}
                        className="flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 capitalize"
                        style={{
                          background: mode === m
                            ? (isLight ? 'white' : 'var(--c-border-dim)')
                            : 'transparent',
                          color: mode === m ? (isLight ? '#0369a1' : 'var(--c-text)') : 'var(--c-text-muted)',
                          border: mode === m
                            ? (isLight ? '1px solid rgba(3,105,161,0.3)' : '1px solid rgba(0,130,200,0.4)')
                            : '1px solid transparent',
                          boxShadow: mode === m && isLight ? '0 2px 8px rgba(3,105,161,0.12)' : 'none'
                        }}>
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>
          )}

          {/* Form */}
          {!showVerifyModal ? (
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
                  background: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.04)',
                  border: isLight ? '1.5px solid rgba(3,105,161,0.25)' : '1px solid rgba(0,130,200,0.25)',
                  boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
                  color: 'var(--c-text)',
                }}
                onFocus={e => { e.target.style.border = isLight ? '1.5px solid rgba(3,105,161,0.7)' : '1px solid rgba(0,130,200,0.6)'; e.target.style.boxShadow = isLight ? '0 0 0 3px rgba(3,105,161,0.1)' : 'none'; }}
                onBlur={e => { e.target.style.border = isLight ? '1.5px solid rgba(3,105,161,0.25)' : '1px solid rgba(0,130,200,0.25)'; e.target.style.boxShadow = isLight ? '0 1px 4px rgba(0,0,0,0.04)' : 'none'; }}
              />
            </div>
            
            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>Email</label>
                <input
                  id="teacher-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. prof_smith@school.edu"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-transparent outline-none transition-all duration-200"
                  style={{
                    background: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.04)',
                    border: isLight ? '1.5px solid rgba(3,105,161,0.25)' : '1px solid rgba(0,130,200,0.25)',
                    boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
                    color: 'var(--c-text)',
                  }}
                  onFocus={e => { e.target.style.border = isLight ? '1.5px solid rgba(3,105,161,0.7)' : '1px solid rgba(0,130,200,0.6)'; e.target.style.boxShadow = isLight ? '0 0 0 3px rgba(3,105,161,0.1)' : 'none'; }}
                  onBlur={e => { e.target.style.border = isLight ? '1.5px solid rgba(3,105,161,0.25)' : '1px solid rgba(0,130,200,0.25)'; e.target.style.boxShadow = isLight ? '0 1px 4px rgba(0,0,0,0.04)' : 'none'; }}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>Password</label>
              <div className="relative">
                <input
                  id="teacher-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.04)',
                    border: isLight ? '1.5px solid rgba(3,105,161,0.25)' : '1px solid rgba(0,130,200,0.25)',
                    boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
                    color: 'var(--c-text)',
                  }}
                  onFocus={e => { e.target.style.border = isLight ? '1.5px solid rgba(3,105,161,0.7)' : '1px solid rgba(0,130,200,0.6)'; e.target.style.boxShadow = isLight ? '0 0 0 3px rgba(3,105,161,0.1)' : 'none'; }}
                  onBlur={e => { e.target.style.border = isLight ? '1.5px solid rgba(3,105,161,0.25)' : '1px solid rgba(0,130,200,0.25)'; e.target.style.boxShadow = isLight ? '0 1px 4px rgba(0,0,0,0.04)' : 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-200 text-muted-foreground"
                  style={{ color: 'var(--c-text-muted)' }}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>Confirm Password</label>
                <div className="relative">
                  <input
                    id="teacher-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.04)',
                      border: isLight ? '1.5px solid rgba(3,105,161,0.25)' : '1px solid rgba(0,130,200,0.25)',
                      boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
                      color: 'var(--c-text)',
                    }}
                    onFocus={e => { e.target.style.border = isLight ? '1.5px solid rgba(3,105,161,0.7)' : '1px solid rgba(0,130,200,0.6)'; e.target.style.boxShadow = isLight ? '0 0 0 3px rgba(3,105,161,0.1)' : 'none'; }}
                    onBlur={e => { e.target.style.border = isLight ? '1.5px solid rgba(3,105,161,0.25)' : '1px solid rgba(0,130,200,0.25)'; e.target.style.boxShadow = isLight ? '0 1px 4px rgba(0,0,0,0.04)' : 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-200"
                    style={{ color: 'var(--c-text-muted)' }}
                  >
                    {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="px-4 py-3 rounded-xl text-xs font-medium animate-slide-up"
                   style={{
                     background: isLight ? 'rgba(190,18,60,0.06)' : 'rgba(255,51,102,0.08)',
                     border: isLight ? '1px solid rgba(190,18,60,0.3)' : '1px solid rgba(255,51,102,0.3)',
                     color: isLight ? '#be123c' : '#ff3366'
                   }}>
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
              className="btn-neon-purple w-full"
            >
              {loading ? (
                <div className="flex items-center gap-2 uppercase tracking-widest">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{mode === 'login' ? 'Signing in…' : 'Creating account…'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="scale-75"><IconMedal /></span>
                  {mode === 'login' ? 'SIGN IN TO DASHBOARD' : 'CREATE TEACHER ACCOUNT'}
                </div>
              )}
            </button>
          </form>
          ) : (
            <form onSubmit={handleVerify} className="flex flex-col gap-4 animate-scale-in">
              <div className="px-4 py-3 rounded-lg text-sm text-center mb-2" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--c-text)' }}>
                We've sent a 6-digit code to your email. Please enter it below to verify this device.
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="verify-code" className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: 'var(--c-text-muted)' }}>
                  6-Digit Code
                </label>
                <input type="text" id="verify-code" className="w-full px-4 py-3 rounded-xl bg-transparent outline-none transition-all duration-200 text-center font-black tracking-[0.5em] text-xl" placeholder="••••••" maxLength="6"
                  value={verificationCode} onChange={e => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))} required autoFocus
                  style={{
                    background: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.04)',
                    border: isLight ? '1.5px solid rgba(3,105,161,0.25)' : '1px solid rgba(0,130,200,0.25)',
                    color: 'var(--c-text)',
                  }}
                  onFocus={e => { e.target.style.border = isLight ? '1.5px solid rgba(3,105,161,0.7)' : '1px solid rgba(0,130,200,0.6)'; }}
                  onBlur={e => { e.target.style.border = isLight ? '1.5px solid rgba(3,105,161,0.25)' : '1px solid rgba(0,130,200,0.25)'; }}
                />
              </div>
              
              {error && (
                <div className="px-4 py-3 rounded-xl text-xs font-medium animate-slide-up"
                     style={{
                       background: isLight ? 'rgba(190,18,60,0.06)' : 'rgba(255,51,102,0.08)',
                       border: isLight ? '1px solid rgba(190,18,60,0.3)' : '1px solid rgba(255,51,102,0.3)',
                       color: isLight ? '#be123c' : '#ff3366'
                     }}>
                  ⚠ {error}
                </div>
              )}

              <button type="submit" disabled={verifyLoading || verificationCode.length !== 6} className="btn-neon-amber w-full">
                {verifyLoading ? 'VERIFYING...' : 'VERIFY DEVICE'}
              </button>
              <button type="button" onClick={() => { setShowVerifyModal(false); setVerificationCode(''); }} className="text-xs font-bold mt-2 text-center" style={{ color: 'var(--c-text-muted)' }}>
                Cancel
              </button>
            </form>
          )}

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
