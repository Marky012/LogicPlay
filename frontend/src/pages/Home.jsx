import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { register, getUser } from '../utils/api';

/* Floating circuit node dots for background decoration */
const NODES = [
  { size: 4,  top: '12%', left: '8%',  delay: 0 },
  { size: 3,  top: '25%', left: '22%', delay: 0.6 },
  { size: 5,  top: '60%', left: '5%',  delay: 1.2 },
  { size: 3,  top: '78%', left: '18%', delay: 0.3 },
  { size: 4,  top: '15%', right: '10%', delay: 0.9 },
  { size: 3,  top: '40%', right: '6%',  delay: 1.5 },
  { size: 5,  top: '70%', right: '14%', delay: 0.7 },
  { size: 3,  top: '88%', right: '22%', delay: 0.2 },
];

const FEATURES = [
  { icon: '⚡', label: 'Live Simulation', desc: 'Watch signals flow in real-time' },
  { icon: '🏆', label: 'Earn XP & Badges', desc: 'Level up as you master logic' },
  { icon: '🧩', label: 'Challenges', desc: 'Guided puzzles from basics to advanced' },
];

const Home = () => {
  const [username, setUsername] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useContext(AuthContext);
  const navigate                = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError('');

    try {
      await getUser(username);
      login(username);
      navigate('/playground');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        try {
          await register(username);
          login(username);
          navigate('/playground');
        } catch {
          setError('Failed to create account. Please try again.');
        }
      } else {
        setError('Connection error – is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
         style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(0,212,255,0.07) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(191,95,255,0.07) 0%, transparent 60%), #060b14' }}>

      {/* ── Animated background nodes ── */}
      {NODES.map((n, i) => (
        <div key={i} className="circuit-dot pointer-events-none"
             style={{
               width: n.size, height: n.size,
               top: n.top, left: n.left, right: n.right,
               animationDelay: `${n.delay}s`,
             }} />
      ))}

      {/* ── Background SVG circuit lines ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" xmlns="http://www.w3.org/2000/svg">
        <line x1="8%" y1="12%" x2="22%" y2="25%"  stroke="#00d4ff" strokeWidth="1" />
        <line x1="22%" y1="25%" x2="5%"  y2="60%"  stroke="#00d4ff" strokeWidth="1" />
        <line x1="10%" y1="8%"  x2="90%" y2="92%"  stroke="#bf5fff" strokeWidth="0.5" strokeDasharray="6 6"/>
        <line x1="90%" y1="15%" x2="94%" y2="40%"  stroke="#00d4ff" strokeWidth="1" />
        <line x1="94%" y1="40%" x2="86%" y2="70%"  stroke="#00d4ff" strokeWidth="1" />
        <line x1="86%" y1="70%" x2="78%" y2="88%"  stroke="#00d4ff" strokeWidth="1" />
        <circle cx="22%" cy="25%" r="3" fill="#00d4ff" opacity="0.7" />
        <circle cx="94%" cy="40%" r="3" fill="#bf5fff" opacity="0.7" />
        <circle cx="5%"  cy="60%" r="3" fill="#39ff14" opacity="0.7" />
      </svg>

      {/* ── Main card ── */}
      <div className="glass-panel w-full max-w-md mx-4 p-8 animate-slide-up z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-float"
               style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(191,95,255,0.2))', border: '1px solid rgba(0,212,255,0.4)', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}>
            <span className="text-3xl select-none">⚡</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-gradient-blue glow-text-blue mb-6 pb-2">
            LogicPlay
          </h1>
          <p className="text-sm text-slate-400 font-medium tracking-widest uppercase">
            Digital Logic · Gamified
          </p>
        </div>

        {/* Tagline */}
        <p className="text-center text-slate-300 mb-6 text-base leading-relaxed">
          Build real circuits, see signals flow, and level up your logic skills — one gate at a time.
        </p>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {FEATURES.map((f) => (
            <div key={f.label}
                 className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-default"
                 style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: 'var(--neon-blue)' }}>
              <span>{f.icon}</span>
              {f.label}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                   style={{ background: 'rgba(13,26,45,0.95)', border: '1px solid rgba(0,212,255,0.3)' }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>

        <div className="section-divider" />

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 text-sm animate-scale-in"
               style={{ background: 'rgba(255,51,102,0.12)', border: '1px solid rgba(255,51,102,0.3)', color: '#ff8099' }}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="block mb-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="input-neon"
              placeholder="Enter your callsign…"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-shimmer w-full py-3.5 rounded-xl font-bold text-base text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-blue disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            style={{ backgroundSize: '200% auto' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/>
                </svg>
                Connecting…
              </span>
            ) : (
              'Start Playing →'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          No password needed — your username is your identity.
        </p>
      </div>

      {/* Version watermark */}
      <p className="absolute bottom-4 text-xs text-slate-700 z-10">LogicPlay v2.0 · PWA</p>
    </div>
  );
};

export default Home;
