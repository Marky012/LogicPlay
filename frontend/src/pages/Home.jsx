import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { register, unifiedLogin, verifyDevice } from '../utils/api';
import InstallTrigger from '../components/InstallTrigger';
import PWAHelpModal from '../components/PWAHelpModal';
import logo from '../assets/favicon.png';

/* ═══════════════════════════════════════════════════════════════
   ICON COMPONENTS
═══════════════════════════════════════════════════════════════ */
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

/* Monochromatic Feature Icons */
const IconBolt = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconTrophy = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 4H6v7a6 6 0 0 0 12 0V4Z" />
  </svg>
);
const IconPuzzle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19.4 15a2.4 2.4 0 0 1-2.1-3.6 2.4 2.4 0 0 1 2.1-3.6 1 1 0 0 0 1-1V5a2 2 0 0 0-2-2H16.4a1 1 0 0 0-1 1 2.4 2.4 0 0 1-3.6 2.1 2.4 2.4 0 0 1-3.6-2.1 1 1 0 0 0-1-1H5a2 2 0 0 0-2 2v2.4a1 1 0 0 0 1 1 2.4 2.4 0 0 1 2.1 3.6 2.4 2.4 0 0 1-2.1 3.6 1 1 0 0 0-1-1V19a2 2 0 0 0 2 2h2.4a1 1 0 0 0 1-1 2.4 2.4 0 0 1 3.6-2.1 2.4 2.4 0 0 1 3.6 2.1 1 1 0 0 0 1 1H19a2 2 0 0 0 2-2v-2.4a1 1 0 0 0-1-1Z" />
  </svg>
);
const IconSignal = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h.01" /><path d="M7 20v-4" /><path d="M12 20v-8" /><path d="M17 20V8" /><path d="M22 20V4" />
  </svg>
);
const IconBank = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" /><path d="M3 10h18" /><path d="M5 6l7-3 7 3" /><path d="M4 10v11" /><path d="M20 10v11" /><path d="M8 14v3" /><path d="M12 14v3" /><path d="M16 14v3" />
  </svg>
);
const IconTable = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);

const IconUser = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconGear = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.72V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconChart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const IconPlug = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v5"/><path d="M9 2v5"/><path d="M6 7h12a2 2 0 0 1 2 2v2a8 8 0 0 1-16 0V9a2 2 0 0 1 2-2z"/><path d="M12 19v3"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   GATE SVG COMPONENTS (Decorative)
═══════════════════════════════════════════════════════════════ */
const IconEye = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const GateAND = ({ color = '#00d4ff', size = 60, opacity = 0.15 }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 60 42" fill="none" opacity={opacity}>
    <path d="M8 4 L30 4 Q52 4 52 21 Q52 38 30 38 L8 38 Z" stroke={color} strokeWidth="2" fill="none"/>
    <line x1="0" y1="12" x2="8" y2="12" stroke={color} strokeWidth="2"/>
    <line x1="0" y1="30" x2="8" y2="30" stroke={color} strokeWidth="2"/>
    <line x1="52" y1="21" x2="60" y2="21" stroke={color} strokeWidth="2"/>
  </svg>
);
const GateOR = ({ color = '#bf5fff', size = 60, opacity = 0.15 }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 60 42" fill="none" opacity={opacity}>
    <path d="M8 4 Q20 4 36 21 Q20 38 8 38 Q18 21 8 4 Z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M8 4 Q40 4 52 21 Q40 38 8 38" stroke={color} strokeWidth="2" fill="none"/>
    <line x1="0" y1="12" x2="14" y2="12" stroke={color} strokeWidth="2"/>
    <line x1="0" y1="30" x2="14" y2="30" stroke={color} strokeWidth="2"/>
    <line x1="52" y1="21" x2="60" y2="21" stroke={color} strokeWidth="2"/>
  </svg>
);
const GateNOT = ({ color = '#39ff14', size = 50, opacity = 0.15 }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 50 35" fill="none" opacity={opacity}>
    <path d="M5 2 L40 17.5 L5 33 Z" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="44" cy="17.5" r="4" stroke={color} strokeWidth="2" fill="none"/>
    <line x1="0" y1="17.5" x2="5" y2="17.5" stroke={color} strokeWidth="2"/>
    <line x1="48" y1="17.5" x2="50" y2="17.5" stroke={color} strokeWidth="2"/>
  </svg>
);
const GateXOR = ({ color = '#f59e0b', size = 65, opacity = 0.15 }) => (
  <svg width={size} height={size * 0.65} viewBox="0 0 65 42" fill="none" opacity={opacity}>
    <path d="M12 4 Q24 4 40 21 Q24 38 12 38 Q22 21 12 4 Z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M12 4 Q44 4 56 21 Q44 38 12 38" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M5 4 Q15 21 5 38" stroke={color} strokeWidth="2" fill="none"/>
    <line x1="0" y1="12" x2="17" y2="12" stroke={color} strokeWidth="2"/>
    <line x1="0" y1="30" x2="17" y2="30" stroke={color} strokeWidth="2"/>
    <line x1="56" y1="21" x2="65" y2="21" stroke={color} strokeWidth="2"/>
  </svg>
);
const GateNAND = ({ color = '#ff3366', size = 60, opacity = 0.15 }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 65 42" fill="none" opacity={opacity}>
    <path d="M8 4 L30 4 Q52 4 52 21 Q52 38 30 38 L8 38 Z" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="56" cy="21" r="4" stroke={color} strokeWidth="2" fill="none"/>
    <line x1="0" y1="12" x2="8" y2="12" stroke={color} strokeWidth="2"/>
    <line x1="0" y1="30" x2="8" y2="30" stroke={color} strokeWidth="2"/>
    <line x1="60" y1="21" x2="65" y2="21" stroke={color} strokeWidth="2"/>
  </svg>
);
const GateNOR = ({ color = '#00ffea', size = 60, opacity = 0.15 }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 65 42" fill="none" opacity={opacity}>
    <path d="M8 4 Q20 4 36 21 Q20 38 8 38 Q18 21 8 4 Z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M8 4 Q40 4 52 21 Q40 38 8 38" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="56" cy="21" r="4" stroke={color} strokeWidth="2" fill="none"/>
    <line x1="0" y1="12" x2="14" y2="12" stroke={color} strokeWidth="2"/>
    <line x1="0" y1="30" x2="14" y2="30" stroke={color} strokeWidth="2"/>
    <line x1="60" y1="21" x2="65" y2="21" stroke={color} strokeWidth="2"/>
  </svg>
);
const GateXNOR = ({ color = '#b4ff00', size = 65, opacity = 0.15 }) => (
  <svg width={size} height={size * 0.65} viewBox="0 0 70 42" fill="none" opacity={opacity}>
    <path d="M12 4 Q24 4 40 21 Q24 38 12 38 Q22 21 12 4 Z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M12 4 Q44 4 56 21 Q44 38 12 38" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M5 4 Q15 21 5 38" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="60" cy="21" r="4" stroke={color} strokeWidth="2" fill="none"/>
    <line x1="0" y1="12" x2="17" y2="12" stroke={color} strokeWidth="2"/>
    <line x1="0" y1="30" x2="17" y2="30" stroke={color} strokeWidth="2"/>
    <line x1="64" y1="21" x2="70" y2="21" stroke={color} strokeWidth="2"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   BINARY RAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
function BinaryRain() {
  const { isLight } = useTheme();
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const cols = Math.floor(canvas.width / 20);
    const drops = Array(cols).fill(1);
    const chars = '01';
    let frame;
    const draw = () => {
      ctx.fillStyle = isLight ? 'rgba(240,244,250,0.05)' : 'rgba(6,11,20,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '12px JetBrains Mono, monospace';
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const alpha = Math.random() * 0.4 + 0.05;
        ctx.fillStyle = isLight ? `rgba(3,105,161,${alpha * 0.3})` : `rgba(0,212,255,${alpha})`;
        ctx.fillText(char, i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      frame = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLight]);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: isLight ? 0.15 : 0.3 }} />;
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED CIRCUIT LINES (Hero Background)
═══════════════════════════════════════════════════════════════ */
function CircuitBoard() {
  const { isLight } = useTheme();
  const cBlue = isLight ? '#0284c7' : '#00d4ff';
  const cGreen = isLight ? '#16a34a' : '#39ff14';
  const cPurple = isLight ? '#9333ea' : '#bf5fff';
  const cAmber = isLight ? '#d97706' : '#f59e0b';

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: isLight ? 0.18 : 0.12 }}>
      <defs>
        <filter id="glow-blue"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-green"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <style>{`
          @keyframes signal-flow {
            0% { stroke-dashoffset: 1000; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 0; }
          }
          @keyframes signal-flow-rev {
            0% { stroke-dashoffset: -1000; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 0; }
          }
          .sig { stroke-dasharray: 1000; animation: signal-flow 4s linear infinite; }
          .sig2 { stroke-dasharray: 1000; animation: signal-flow 6s linear infinite 1.5s; }
          .sig3 { stroke-dasharray: 1000; animation: signal-flow 5s linear infinite 3s; }
          .sig4 { stroke-dasharray: 1000; animation: signal-flow-rev 4.5s linear infinite 0.8s; }
        `}</style>
      </defs>
      {/* Circuit traces */}
      <path d="M 0 150 H 200 V 80 H 400 V 200 H 600 V 100 H 800 V 250 H 2400" stroke={cBlue} strokeWidth="1.5" fill="none" filter="url(#glow-blue)" className="sig"/>
      <path d="M 0 400 H 150 V 300 H 350 V 450 H 550 V 350 H 750 V 500 H 2400" stroke={cGreen} strokeWidth="1.5" fill="none" filter="url(#glow-green)" className="sig2"/>
      <path d="M 2400 200 H 900 V 350 H 700 V 150 H 500 V 280 H 300 V 120 H 0" stroke={cPurple} strokeWidth="1" fill="none" className="sig4"/>
      <path d="M 0 600 H 250 V 500 H 450 V 620 H 650 V 480 H 850 V 600 H 2400" stroke={cAmber} strokeWidth="1" fill="none" className="sig3"/>
      {/* Junction dots */}
      {[[200,80],[400,200],[600,100],[150,300],[350,450],[550,350],[900,350],[700,150]].map(([x,y],i) => (
        <circle key={i} cx={`${x}px`} cy={`${y}px`} r="3" fill={cBlue} opacity="0.6" filter="url(#glow-blue)"/>
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LIVE CIRCUIT & TRUTH TABLE PREVIEW (Synchronized)
═══════════════════════════════════════════════════════════════ */
function LiveCircuitPreview() {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 4), 1200);
    return () => clearInterval(t);
  }, []);

  // Sync state correctly to index: 00, 01, 10, 11
  const aOn = step === 2 || step === 3;
  const bOn = step === 1 || step === 3;
  const outOn = aOn && bOn;

  return (
    <>
      <MiniCircuitDemo aOn={aOn} bOn={bOn} outOn={outOn} />
      <div className="mt-2 flex justify-center gap-3">
        <TruthTablePreview activeRow={step} />
      </div>
    </>
  );
}

function TruthTablePreview({ activeRow }) {
  const { isLight } = useTheme();
  const rows = [
    { a: 0, b: 0, out: 0 }, { a: 0, b: 1, out: 0 },
    { a: 1, b: 0, out: 0 }, { a: 1, b: 1, out: 1 },
  ];
  const tBlue = isLight ? '#0369a1' : '#00d4ff';
  const tGreen = isLight ? '#15803d' : '#39ff14';
  const tRed   = isLight ? '#be123c' : '#ff3366';
  return (
    <div className="rounded-xl overflow-hidden border" style={{
      background: isLight ? 'rgba(240,248,255,0.9)' : 'rgba(0,0,0,0.4)',
      borderColor: isLight ? 'rgba(3,105,161,0.25)' : 'rgba(0,212,255,0.2)'
    }}>
      <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-2" style={{
        background: isLight ? 'rgba(3,105,161,0.08)' : 'rgba(0,212,255,0.1)',
        color: tBlue,
        borderBottom: isLight ? '1px solid rgba(3,105,161,0.15)' : '1px solid rgba(0,212,255,0.2)'
      }}>
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"/>
        AND Gate · Truth Table
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ borderBottom: isLight ? '1px solid rgba(3,105,161,0.1)' : '1px solid rgba(255,255,255,0.06)' }}>
            {['A', 'B', 'OUT'].map(h => (
              <th key={h} className="py-1.5 px-3 text-[10px] font-black uppercase tracking-widest text-center"
                style={{ color: isLight ? 'rgba(12,26,46,0.4)' : 'rgba(255,255,255,0.35)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="transition-all duration-300" style={{
              background: i === activeRow
                ? (isLight ? 'rgba(3,105,161,0.08)' : 'rgba(0,212,255,0.12)')
                : 'transparent',
              borderBottom: isLight ? '1px solid rgba(3,105,161,0.07)' : '1px solid rgba(255,255,255,0.04)',
            }}>
              {[row.a, row.b, row.out].map((val, j) => (
                <td key={j} className="py-2 px-3 text-center font-black" style={{
                  color: j === 2 ? (val ? tGreen : tRed) : (val ? tBlue : (isLight ? 'rgba(12,26,46,0.3)' : 'rgba(255,255,255,0.35)')),
                  fontFamily: 'JetBrains Mono, monospace',
                  textShadow: j === 2 && i === activeRow && !isLight ? `0 0 12px ${val ? '#39ff14' : '#ff3366'}` : 'none',
                }}>
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MiniCircuitDemo({ aOn, bOn, outOn }) {
  const wireColor = (on) => on ? '#39ff14' : 'rgba(255,255,255,0.15)';
  const glow = (on) => on ? '0 0 8px #39ff14' : 'none';
  return (
    <div className="relative select-none" style={{ width: 260, height: 140 }}>
      <svg width="260" height="140" viewBox="0 0 260 140">
        {/* Input A wire */}
        <line x1="10" y1="45" x2="80" y2="45" stroke={wireColor(aOn)} strokeWidth="2.5" style={{ filter: aOn ? 'drop-shadow(0 0 4px #39ff14)' : 'none' }}/>
        {/* Input B wire */}
        <line x1="10" y1="95" x2="80" y2="95" stroke={wireColor(bOn)} strokeWidth="2.5" style={{ filter: bOn ? 'drop-shadow(0 0 4px #39ff14)' : 'none' }}/>
        {/* AND Gate */}
        <path d="M80 30 L110 30 Q140 30 140 70 Q140 110 110 110 L80 110 Z" fill="rgba(0,212,255,0.08)" stroke={outOn ? '#00d4ff' : 'rgba(0,212,255,0.3)'} strokeWidth="2" style={{ filter: outOn ? 'drop-shadow(0 0 6px #00d4ff)' : 'none' }}/>
        <text x="110" y="74" textAnchor="middle" fill={outOn ? '#00d4ff' : 'rgba(255,255,255,0.3)'} fontSize="9" fontWeight="900" fontFamily="monospace">AND</text>
        {/* Output wire */}
        <line x1="140" y1="70" x2="220" y2="70" stroke={wireColor(outOn)} strokeWidth="2.5" style={{ filter: outOn ? 'drop-shadow(0 0 4px #39ff14)' : 'none' }}/>
        {/* Input nodes */}
        <circle cx="10" cy="45" r="7" fill={aOn ? '#39ff14' : 'rgba(255,255,255,0.1)'} stroke={aOn ? '#39ff14' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" style={{ filter: glow(aOn) }}/>
        <circle cx="10" cy="95" r="7" fill={bOn ? '#39ff14' : 'rgba(255,255,255,0.1)'} stroke={bOn ? '#39ff14' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" style={{ filter: glow(bOn) }}/>
        {/* Output node */}
        <circle cx="220" cy="70" r="10" fill={outOn ? 'rgba(57,255,20,0.2)' : 'rgba(255,51,102,0.1)'} stroke={outOn ? '#39ff14' : '#ff3366'} strokeWidth="2" style={{ filter: outOn ? '0 0 12px #39ff14' : 'none' }}/>
        <text x="220" y="74" textAnchor="middle" fill={outOn ? '#39ff14' : '#ff3366'} fontSize="9" fontWeight="900" fontFamily="monospace">{outOn ? '1' : '0'}</text>
        {/* Labels */}
        <text x="10" y="30" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace" fontWeight="700">A</text>
        <text x="10" y="115" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace" fontWeight="700">B</text>
        <text x="220" y="92" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace" fontWeight="700">OUT</text>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLOATING GATE DECORATIONS
═══════════════════════════════════════════════════════════════ */
function FloatingGates() {
  const { isLight } = useTheme();
  const gates = [
    { Gate: GateAND,  color: isLight ? '#0369a1' : '#00d4ff', top: '8%',  left:  '3%',  size: 70, delay: 0,   rot: -15 },
    { Gate: GateOR,   color: isLight ? '#7c3aed' : '#bf5fff', top: '25%', right: '4%',  size: 55, delay: 1,   rot: 10  },
    { Gate: GateNOT,  color: isLight ? '#15803d' : '#39ff14', top: '65%', left:  '2%',  size: 50, delay: 2,   rot: 5   },
    { Gate: GateXOR,  color: isLight ? '#b45309' : '#f59e0b', top: '75%', right: '3%',  size: 65, delay: 0.5, rot: -8  },
    { Gate: GateAND,  color: isLight ? '#7c3aed' : '#bf5fff', top: '45%', left:  '94%', size: 45, delay: 1.5, rot: 20  },
    { Gate: GateOR,   color: isLight ? '#0369a1' : '#00d4ff', top: '88%', left:  '12%', size: 40, delay: 0.8, rot: -5  },
  ];
  return (
    <>
      {gates.map(({ Gate, color, size, delay, rot, ...pos }, i) => (
        <div key={i} className="absolute pointer-events-none animate-float" style={{
          ...pos,
          transform: `rotate(${rot}deg)`,
          animationDelay: `${delay}s`,
          opacity: isLight ? 0.30 : 0.18,
        }}>
          <Gate color={color} size={size} opacity={1}/>
        </div>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INTERSECTION OBSERVER HOOK
═══════════════════════════════════════════════════════════════ */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ═══════════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════════ */
function LandingNav({ onHelpClick, isOffline }) {
  const { isLight, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <header className="fixed top-0 left-0 w-full z-[100] transition-all duration-500 pointer-events-none" style={{
      background: scrolled ? (isLight ? 'rgba(240,248,255,0.92)' : 'rgba(6,11,20,0.85)') : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? `1px solid ${isLight ? 'rgba(3,105,161,0.18)' : 'var(--c-border-dim)'}` : '1px solid transparent',
      boxShadow: scrolled && isLight ? '0 2px 16px rgba(3,105,161,0.08)' : 'none',
    }}>
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={logo} alt="LogicPlay" className="h-8 w-8 object-contain group-hover:scale-110 transition-transform duration-300"/>
          <span className="text-xl font-black hidden xs:inline" style={{ color: 'var(--c-text)' }}>
            <span className="text-gradient-blue">Logic</span>Play
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" 
            style={{ 
              background: isOffline ? 'rgba(255,107,43,0.12)' : 'rgba(0,212,255,0.12)', 
              color: isOffline ? 'var(--neon-amber)' : 'var(--neon-blue)', 
              border: isOffline ? '1px solid rgba(255,107,43,0.2)' : '1px solid rgba(0,212,255,0.2)' 
            }}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-orange-500' : 'bg-green-400 animate-pulse'}`} />
            {isOffline ? 'Offline' : 'Live'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {[
            { icon: '?', title: 'Installation Guide', onClick: onHelpClick },
          ].map((btn, i) => (
            <button key={i} onClick={btn.onClick} title={btn.title}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ background: 'var(--c-surface-2)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)' }}>
              <span className="text-sm font-black">{btn.icon}</span>
            </button>
          ))}
          <button onClick={toggleTheme} title={isLight ? 'Dark Mode' : 'Light Mode'}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ background: 'var(--c-surface-2)', border: '1.5px solid var(--c-border)', color: 'var(--c-text)' }}>
            {isLight ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO SECTION
═══════════════════════════════════════════════════════════════ */
function HeroSection({ onPlayClick }) {
  const { isLight } = useTheme();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 2000);
    return () => clearInterval(t);
  }, []);
  const signals = ['01001100', '01001111', '01000111', '01001001', '01000011'];
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-10 overflow-hidden">
      {/* Layered backgrounds */}
      <BinaryRain />
      <CircuitBoard />
      <FloatingGates />
      {/* Central glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{ width: 700, height: 700, background: isLight ? 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 65%)', borderRadius: '50%' }}/>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-5xl w-full">
        {/* Binary ticker */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-full" style={{
            background: isLight ? 'rgba(21,128,61,0.08)' : 'rgba(57,255,20,0.1)',
            color: isLight ? '#15803d' : '#39ff14',
            border: isLight ? '1px solid rgba(21,128,61,0.25)' : '1px solid rgba(57,255,20,0.25)',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block mr-2" />
            {signals[tick % signals.length]}
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--neon-blue)', opacity: 0.7 }}>PWA · Digital Logic</span>
        </div>

        {/* Logo + Title + Subtitle arranged side by side on desktop */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 w-full justify-center mb-8">
          {/* Left: Text */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="animate-float mb-6">
              <img src={logo} alt="LogicPlay Logo" className="w-36 h-36 sm:w-44 sm:h-44 lg:hidden mx-auto object-contain"
                style={{ filter: isLight ? 'none' : 'drop-shadow(0 0 40px rgba(0,212,255,0.9)) drop-shadow(0 0 80px rgba(0,212,255,0.3))' }}/>
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-4 leading-none">
              <span className="text-gradient-blue">Logic</span>
              <span style={{ color: 'var(--c-text)' }}>Play</span>
            </h1>
            <p className="text-xl sm:text-2xl font-black mb-3 text-gradient-neon tracking-wide">Build. Simulate. Conquer.</p>
            <p className="text-sm sm:text-base leading-relaxed mb-8 max-w-md" style={{ color: 'var(--c-text-muted)' }}>
              Drag gates. Wire circuits. Watch signals flow. Earn XP. The ultimate gamified digital logic simulator in your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button id="hero-play-btn" onClick={onPlayClick}
                className="btn-neon-blue group !px-12 !py-4"
              >
                <div className="flex items-center gap-2">
                  <span className="scale-90 group-hover:animate-pulse-glow"><IconBolt /></span>
                  <span>START PLAYING →</span>
                </div>
              </button>
              <Link to="/teacher-login"
                className="btn-neon-purple group !px-8 !py-4"
              >
                INSTRUCTOR PORTAL
              </Link>
            </div>
          </div>

          {/* Right: Logo + Live Circuit Demo */}
          <div className="hidden lg:flex flex-col items-center gap-5">
            <img src={logo} alt="LogicPlay Logo" className="w-48 h-48 object-contain animate-float"
              style={{ filter: isLight ? 'none' : 'drop-shadow(0 0 50px rgba(0,212,255,1)) drop-shadow(0 0 100px rgba(0,212,255,0.4))' }}/>
            {/* Live circuit card */}
            <div className="rounded-2xl p-4" style={{
              background: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(13,26,45,0.8)',
              border: isLight ? '1px solid rgba(3,105,161,0.2)' : '1px solid rgba(0,212,255,0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: isLight ? '0 4px 20px rgba(3,105,161,0.1)' : 'none'
            }}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 text-center" style={{ color: 'var(--neon-blue)' }}>Live Simulation</p>
              <LiveCircuitPreview />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 sm:gap-10 mb-10">
          {[
            { val: '7+', label: 'Gate Types', color: 'var(--neon-blue)' },
            { val: 'Live', label: 'Simulation', color: 'var(--neon-green)' },
            { val: 'XP', label: 'Gamified', color: 'var(--neon-amber)' },
            { val: 'PWA', label: 'Installable', color: 'var(--neon-purple)' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-xl sm:text-2xl font-black" style={{ color: s.color, textShadow: `0 0 20px ${s.color}40` }}>{s.val}</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* PWA Download */}
        <div className="py-6 border-y w-full flex flex-col items-center" style={{ borderColor: 'var(--c-border-dim)' }}>
          <InstallTrigger />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GATE SHOWCASE SECTION
═══════════════════════════════════════════════════════════════ */
function GateShowcaseSection() {
  const { ref, visible } = useReveal();
  const { isLight } = useTheme();
  const gates = [
    { name: 'AND', desc: 'Output HIGH only when ALL inputs are HIGH', color: '#00d4ff', Gate: GateAND, truth: [[0,0,0],[0,1,0],[1,0,0],[1,1,1]] },
    { name: 'OR', desc: 'Output HIGH when at least ONE input is HIGH', color: '#bf5fff', Gate: GateOR, truth: [[0,0,0],[0,1,1],[1,0,1],[1,1,1]] },
    { name: 'NOT', desc: 'Inverts the input — the fundamental inverter', color: '#39ff14', Gate: GateNOT, truth: [[0,1],[1,0]] },
    { name: 'XOR', desc: 'Output HIGH when inputs are DIFFERENT', color: '#f59e0b', Gate: GateXOR, truth: [[0,0,0],[0,1,1],[1,0,1],[1,1,0]] },
    { name: 'NAND', desc: 'AND with inverted output — universal gate', color: '#ff3366', Gate: GateNAND, truth: [[0,0,1],[0,1,1],[1,0,1],[1,1,0]] },
    { name: 'NOR', desc: 'OR with inverted output — universal gate', color: '#00ffea', Gate: GateNOR, truth: [[0,0,1],[0,1,0],[1,0,0],[1,1,0]] },
    { name: 'XNOR', desc: 'XOR inverted — HIGH when inputs MATCH', color: '#b4ff00', Gate: GateXNOR, truth: [[0,0,1],[0,1,0],[1,0,0],[1,1,1]] },
  ];
  return (
    <section ref={ref} className="relative py-20 px-4 overflow-hidden" style={{ borderTop: '1px solid var(--c-border-dim)' }}>
      <CircuitBoard />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4"
            style={{
              background: isLight ? 'rgba(3,105,161,0.08)' : 'rgba(0,212,255,0.1)',
              border: isLight ? '1px solid rgba(3,105,161,0.25)' : '1px solid rgba(0,212,255,0.2)',
              color: 'var(--neon-blue)'
            }}>
            <span className="scale-75"><IconBolt /></span> Logic Gates
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-3">
            Master the <span className="text-gradient-blue">building blocks</span>
          </h2>
          <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: 'var(--c-text-muted)' }}>
            Every digital circuit — from a simple switch to a CPU — is built from these 7 gate types. Learn them all in LogicPlay.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {gates.map((g, i) => {
            // Use darker variants in light mode for visibility
            const displayColor = isLight ? {
              '#00d4ff': '#0369a1', '#bf5fff': '#7c3aed', '#39ff14': '#15803d',
              '#f59e0b': '#b45309', '#ff3366': '#be123c', '#00ffea': '#0e7490',
              '#b4ff00': '#4d7c0f',
            }[g.color] ?? g.color : g.color;
            const outHigh  = isLight ? '#15803d' : '#39ff14';
            const outLow   = isLight ? '#be123c' : '#ff3366';
            const inputHigh = isLight ? displayColor : g.color;
            const inputLow  = isLight ? 'rgba(12,26,46,0.25)' : 'rgba(255,255,255,0.25)';
            return (
            <div key={g.name}
              className={`group relative p-4 rounded-2xl cursor-default hover:scale-[1.03] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{
                transitionDelay: `${i * 60}ms`,
                background: isLight ? 'rgba(255,255,255,0.88)' : 'rgba(13,26,45,0.6)',
                border: isLight ? `1.5px solid ${displayColor}40` : `1px solid ${g.color}22`,
                backdropFilter: 'blur(10px)',
                boxShadow: isLight ? `0 2px 12px color-mix(in srgb, ${displayColor}, transparent 85%)` : 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = isLight ? `0 6px 24px color-mix(in srgb, ${displayColor}, transparent 70%)` : `0 0 30px ${g.color}18`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = isLight ? `0 2px 12px color-mix(in srgb, ${displayColor}, transparent 85%)` : 'none'}>
              {/* Gate SVG */}
              <div className="mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
                <g.Gate color={displayColor} size={50} opacity={1} />
              </div>
              <h3 className="text-base font-black tracking-wider mb-1" style={{ color: displayColor }}>{g.name}</h3>
              <p className="text-[10px] leading-relaxed mb-3" style={{ color: 'var(--c-text-muted)' }}>{g.desc}</p>
              {/* Mini truth table */}
              <div className="rounded-lg overflow-hidden" style={{
                background: isLight ? 'rgba(240,248,255,0.8)' : 'rgba(0,0,0,0.25)',
                border: isLight ? `1px solid ${displayColor}25` : '1px solid rgba(255,255,255,0.06)'
              }}>
                <table className="w-full">
                  <tbody>
                    {g.truth.map((row, ri) => (
                      <tr key={ri} style={{ borderBottom: ri < g.truth.length - 1 ? (isLight ? `1px solid rgba(12,26,46,0.06)` : '1px solid rgba(255,255,255,0.04)') : 'none' }}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="py-0.5 text-center text-[10px] font-black"
                            style={{
                              color: ci === row.length - 1 ? (cell ? outHigh : outLow) : (cell ? inputHigh : inputLow),
                              fontFamily: 'JetBrains Mono, monospace',
                            }}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )})}
          {/* "More" card */}
          <div className={`group relative p-4 rounded-2xl cursor-default flex flex-col items-center justify-center transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ 
              transitionDelay: `${7 * 60}ms`, 
              background: isLight ? 'rgba(3,105,161,0.05)' : 'rgba(0,212,255,0.05)', 
              border: isLight ? '1px dashed rgba(3,105,161,0.3)' : '1px dashed rgba(0,212,255,0.2)', 
              minHeight: 160 
            }}>
            <div className="mb-2 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: isLight ? '#0369a1' : 'inherit' }}>
              <IconPlug />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-center" style={{ color: isLight ? '#0369a1' : 'var(--neon-blue)' }}>INPUT &amp; OUTPUT</p>
            <p className="text-[10px] mt-1 text-center" style={{ color: 'var(--c-text-muted)' }}>+ Switches, LEDs &amp; more in the playground</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════════════════════ */
function HowItWorksSection() {
  const { ref, visible } = useReveal();
  const { isLight } = useTheme();
  const steps = [
    { num: '01', icon: <IconUser />, title: 'Enter Your Callsign', desc: 'No password. Just a unique username and you\'re in instantly.', color: 'var(--neon-blue)', detail: 'Accounts are created in seconds. No email, no verification — just play.' },
    { num: '02', icon: <IconGear />, title: 'Build Your Circuit', desc: 'Drag gates onto the canvas, wire them together, flip INPUT switches.', color: 'var(--neon-green)', detail: 'Full touch support. Works on desktop, tablet, and mobile.' },
    { num: '03', icon: <IconChart />, title: 'Verify with Truth Tables', desc: 'Auto-generated truth tables update live as you build.', color: 'var(--neon-amber)', detail: 'Instantly see if your logic matches the expected output.' },
    { num: '04', icon: <IconTrophy />, title: 'Level Up & Compete', desc: 'Save circuits to earn XP, unlock badges, climb the leaderboard.', color: 'var(--neon-purple)', detail: 'Challenge classmates. Teachers can track every submission.' },
  ];
  return (
    <section ref={ref} className="relative py-20 px-4 overflow-hidden" style={{ background: 'var(--c-bg)', borderTop: '1px solid var(--c-border-dim)' }}>
      {/* Background pattern */}
      <div className={`absolute inset-0 ${isLight ? 'opacity-[0.05]' : 'opacity-[0.02]'} pointer-events-none`} style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 27px, ${isLight ? 'rgba(3,105,161,0.2)' : 'rgba(0,212,255,0.5)'} 27px, ${isLight ? 'rgba(3,105,161,0.2)' : 'rgba(0,212,255,0.5)'} 28px), repeating-linear-gradient(90deg, transparent, transparent 27px, ${isLight ? 'rgba(3,105,161,0.2)' : 'rgba(0,212,255,0.5)'} 27px, ${isLight ? 'rgba(3,105,161,0.2)' : 'rgba(0,212,255,0.5)'} 28px)`,
      }}/>
      <div className="max-w-5xl mx-auto relative z-10">
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4"
            style={{ background: 'rgba(191,95,255,0.1)', border: '1px solid rgba(191,95,255,0.2)', color: 'var(--neon-purple)' }}>
            ✦ How It Works
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-3">
            From zero to <span className="text-gradient-purple">circuit master</span>
          </h2>
          <p className="text-sm sm:text-base" style={{ color: 'var(--c-text-muted)' }}>No tutorials to skip. No friction. Just pure logic.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div key={s.num}
              className={`relative p-5 rounded-2xl group hover:scale-[1.02] transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 120}ms`, background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(13,26,45,0.7)', border: `1px solid ${s.color}20`, backdropFilter: 'blur(10px)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 40px ${s.color}15`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              {/* Step number badge */}
              <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: s.color, color: isLight ? '#fff' : '#000' }}>{s.num}</div>
              {/* Connector line */}
              {i < 3 && <div className="hidden lg:block absolute -right-5 top-1/2 -translate-y-1/2 text-lg z-10" style={{ color: s.color, opacity: 0.4 }}>→</div>}
              <div className="text-3xl mb-4">{s.icon}</div>
              <h3 className="font-black text-sm mb-2" style={{ color: s.color }}>{s.title}</h3>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--c-text-muted)' }}>{s.desc}</p>
              <p className="text-[10px] leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: 'var(--c-text-dim)' }}>{s.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURES SECTION
═══════════════════════════════════════════════════════════════ */
function FeaturesSection() {
  const { ref, visible } = useReveal();
  const { isLight } = useTheme();
  const features = [
    { icon: <IconBolt />, title: 'Live Simulation', desc: 'Real-time signal propagation. Every gate reacts in under 100ms. Watch HIGH/LOW states cascade through your circuit instantly.', color: 'var(--neon-blue)', glow: 'rgba(0,212,255,0.15)', tag: 'Core' },
    { icon: <IconTrophy />, title: 'Earn XP & Badges', desc: 'Save circuits → gain XP → level up → unlock exclusive badges. Climb the global and classroom leaderboards.', color: 'var(--neon-amber)', glow: 'rgba(245,158,11,0.15)', tag: 'Gamified' },
    { icon: <IconPuzzle />, title: 'Logic Challenges', desc: 'Guided puzzles from basic AND/OR gates to advanced XOR combinational logic. New challenges unlock as you level up.', color: 'var(--neon-purple)', glow: 'rgba(191,95,255,0.15)', tag: 'Learn' },
    { icon: <IconSignal />, title: 'Play Anywhere', desc: 'Full PWA support — install on any device, play fully offline. Your circuits sync automatically when you reconnect.', color: 'var(--neon-green)', glow: 'rgba(57,255,20,0.15)', tag: 'PWA' },
    { icon: <IconBank />, title: 'Classroom Ready', desc: 'Teachers create classes, assign circuits, review truth-table submissions, and track each student\'s logic mastery in real time.', color: 'var(--neon-cyan)', glow: 'rgba(0,255,234,0.15)', tag: 'Education' },
    { icon: <IconTable />, title: 'Truth Tables', desc: 'Auto-generated truth tables for every circuit. Instantly verify your AND, OR, XOR logic against all input combinations.', color: 'var(--neon-red)', glow: 'rgba(255,51,102,0.15)', tag: 'Analysis' },
  ];
  return (
    <section ref={ref} id="features" className="relative py-20 px-4 overflow-hidden" style={{ borderTop: '1px solid var(--c-border-dim)' }}>
      <CircuitBoard />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4"
            style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.2)', color: 'var(--neon-green)' }}>
            ✦ Features
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-3">
            Everything to <span className="text-gradient-neon">master logic</span>
          </h2>
          <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: 'var(--c-text-muted)' }}>
            From real-time simulation to gamified classroom tools — LogicPlay has every tool you need.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={f.title}
              className={`group relative p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300 cursor-default ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{
                transitionDelay: `${i * 80}ms`,
                background: isLight ? 'rgba(255,255,255,0.75)' : 'var(--c-glass)',
                border: `1px solid ${f.glow.replace('0.15', '0.2')}`,
                backdropFilter: 'blur(12px)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 40px ${f.glow}`; e.currentTarget.style.borderColor = f.glow.replace('0.2', '0.4'); }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = f.glow.replace('0.15', '0.2'); }}>
              {/* Tag */}
              <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: `${f.glow}`, color: f.color, border: `1px solid ${f.color}30` }}>{f.tag}</span>
              <div className="text-3xl mb-4" style={{ filter: `drop-shadow(0 0 8px ${f.color}60)` }}>{f.icon}</div>
              <h3 className="font-black text-base mb-2" style={{ color: f.color }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{f.desc}</p>
              {/* Bottom glow line */}
              <div className="absolute bottom-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${f.color}, transparent)` }}/>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LEADERBOARD TEASER
═══════════════════════════════════════════════════════════════ */
function LeaderboardTeaser() {
  const { ref, visible } = useReveal();
  const { isLight } = useTheme();
  const mockPlayers = [
    { rank: 1, name: 'Circuit_Wizard', xp: 4250, level: 12, badge: '🥇' },
    { rank: 2, name: 'LogicMaster99', xp: 3890, level: 11, badge: '🥈' },
    { rank: 3, name: 'GateBuilder_X', xp: 3120, level: 9, badge: '🥉' },
    { rank: 4, name: 'you?', xp: '???', level: '?', badge: '⚡', isYou: true },
  ];
  return (
    <section ref={ref} className="relative py-20 px-4 overflow-hidden" style={{ background: 'var(--c-bg)', borderTop: '1px solid var(--c-border-dim)' }}>
      {/* Background pattern */}
      <div className={`absolute inset-0 ${isLight ? 'opacity-[0.05]' : 'opacity-[0.02]'} pointer-events-none`} style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 27px, ${isLight ? 'rgba(3,105,161,0.2)' : 'rgba(0,212,255,0.5)'} 27px, ${isLight ? 'rgba(3,105,161,0.2)' : 'rgba(0,212,255,0.5)'} 28px), repeating-linear-gradient(90deg, transparent, transparent 27px, ${isLight ? 'rgba(3,105,161,0.2)' : 'rgba(0,212,255,0.5)'} 27px, ${isLight ? 'rgba(3,105,161,0.2)' : 'rgba(0,212,255,0.5)'} 28px)`,
      }}/>
      <div className="max-w-4xl mx-auto relative z-10">
        <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} flex flex-col lg:flex-row items-center gap-12`}>
          {/* Left text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--neon-amber)' }}>
              <span className="scale-75"><IconTrophy /></span> Leaderboard
            </div>
            <h2 className="text-3xl sm:text-5xl font-black mb-4">
              Prove you're the <span className="text-gradient-blue">smartest circuit</span>
            </h2>
            <p className="text-sm sm:text-base mb-6" style={{ color: 'var(--c-text-muted)' }}>
              Every saved circuit earns XP. Every XP pushes you up the ranks. There are no shortcuts — only better logic.
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'XP per circuit save', val: '+50 XP' },
                { label: 'Max level', val: 'Unlimited' },
                { label: 'Leaderboard type', val: 'Global + Class' },
              ].map(s => (
                <div key={s.label} className="px-4 py-2 rounded-xl text-center" style={{ background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(13,26,45,0.6)', border: '1px solid var(--c-border-dim)' }}>
                  <div className="text-xs font-black" style={{ color: 'var(--neon-amber)' }}>{s.val}</div>
                  <div className="text-[9px] uppercase tracking-widest font-bold mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Right: mock leaderboard */}
          <div className="flex-shrink-0 w-full lg:w-72">
            <div className="rounded-2xl overflow-hidden" style={{ background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(13,26,45,0.8)', border: '1px solid rgba(245,158,11,0.2)', backdropFilter: 'blur(12px)' }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.15)' }}>
                <span className="scale-75"><IconTrophy /></span>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--neon-amber)' }}>Global Top Players</span>
              </div>
              {mockPlayers.map((p, i) => (
                <div key={p.name} className="px-4 py-3 flex items-center gap-3 transition-colors duration-200 hover:bg-white/5"
                  style={{ borderBottom: i < mockPlayers.length - 1 ? '1px solid var(--c-border-dim)' : 'none', background: p.isYou ? 'rgba(0,212,255,0.05)' : 'transparent' }}>
                  <span className="text-lg w-7 text-center">{p.badge}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate" style={{ color: p.isYou ? 'var(--neon-blue)' : 'var(--c-text)', fontStyle: p.isYou ? 'italic' : 'normal' }}>{p.name}</p>
                    <p className="text-[9px] font-bold" style={{ color: 'var(--c-text-muted)' }}>Level {p.level}</p>
                  </div>
                  <span className="text-xs font-black" style={{ color: p.isYou ? 'var(--neon-blue)' : 'var(--neon-amber)', fontFamily: 'JetBrains Mono' }}>{typeof p.xp === 'number' ? p.xp.toLocaleString() : p.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN SECTION
═══════════════════════════════════════════════════════════════ */
function LoginSection({ loginRef }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Verification states
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  
  const { loginUnified, getDeviceToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isLight } = useTheme();
  const { ref: revealRef, visible } = useReveal();

  const setRef = (el) => {
    revealRef.current = el;
    if (loginRef) loginRef.current = el;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const trimmedUser = username.trim();
    if (!trimmedUser || !password) return;
    
    if (isRegistering && !email.trim()) {
      setError('Email is required for registration.');
      return;
    }
    
    setLoading(true); setError('');
    try {
      if (isRegistering) {
        await register(trimmedUser, email.trim(), password);
        // After successful register, fall through to login to trigger device token saving
      }
      
      const deviceToken = getDeviceToken();
      const loginData = await unifiedLogin(trimmedUser, password, deviceToken);
      
      if (loginData.role === 'teacher') { 
        setError('Teacher account — use Instructor Portal.'); 
        return; 
      }
      
      if (loginData.requires_verification) {
        setShowVerifyModal(true);
      } else {
        loginUnified(loginData.username, loginData.role, loginData.id); 
        navigate('/playground');
      }
    } catch (err) {
      if (err.response?.status === 400 && isRegistering) {
        setError(err.response?.data?.detail || 'Registration failed.');
      } else if (err.response?.status === 401) {
        setError('Invalid username or password.');
      } else { 
        setError(err.response?.data?.detail || 'Connection error – is the backend running?'); 
      }
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyLoading(true); setError('');
    try {
      const deviceToken = getDeviceToken();
      await verifyDevice(username.trim(), verificationCode, deviceToken);
      setShowVerifyModal(false);
      // Brief delay to ensure database consistency
      await new Promise(r => setTimeout(r, 50));
      // On success, we need to log them in. Re-run unifiedLogin now that device is trusted
      const loginData = await unifiedLogin(username.trim(), password, deviceToken);
      loginUnified(loginData.username, loginData.role, loginData.id); 
      navigate('/playground');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Invalid or expired verification code.');
    } finally { setVerifyLoading(false); }
  };

  return (
    <section ref={setRef} id="play-now" className="relative py-24 px-4 overflow-hidden" style={{ borderTop: '1px solid var(--c-border-dim)' }}>
      <CircuitBoard />
      {/* Background circuit glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{ width: 600, height: 600, background: isLight ? 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', borderRadius: '50%' }}/>
      </div>
      <div className="relative max-w-md mx-auto z-10">
        <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: 'var(--neon-blue)' }}>
              <span className="scale-75"><IconBolt /></span> Ready to play?
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-2">
              Jump <span className="text-gradient-blue">right in</span>
            </h2>
            <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
              {isRegistering ? 'Create your student account to save your progress.' : 'Log in to your student account.'}
            </p>
          </div>
          <div className="glass-panel p-8" style={{ border: '1px solid var(--c-border)' }}>
            <div className="flex justify-center mb-6">
              <img src={logo} alt="LogicPlay" className="w-28 h-28 object-contain animate-float"
                style={{ filter: isLight ? 'none' : 'drop-shadow(0 0 20px rgba(0,212,255,0.8))' }}/>
            </div>
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-5 text-sm animate-scale-in"
                style={{ background: 'rgba(255,51,102,0.12)', border: '1px solid rgba(255,51,102,0.3)', color: '#ff8099' }}>
                <span>⚠</span> {error}
              </div>
            )}
            
            {!showVerifyModal ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4" id="student-login-form">
                <div>
                  <label htmlFor="login-username" className="block mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>
                    Username
                  </label>
                  <input type="text" id="login-username" className="input-neon" placeholder="Enter your username…"
                    value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required/>
                </div>
                
                {isRegistering && (
                  <div>
                    <label htmlFor="login-email" className="block mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>
                      Email
                    </label>
                    <input type="email" id="login-email" className="input-neon" placeholder="Enter your email…"
                      value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required={isRegistering}/>
                  </div>
                )}

                <div>
                  <label htmlFor="login-password" className="block mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>
                    Password
                  </label>
                  <div className="relative group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="login-password" 
                      className="input-neon w-full pr-12" 
                      placeholder="Enter your password…"
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      autoComplete={isRegistering ? "new-password" : "current-password"} 
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-200"
                      style={{ color: 'var(--c-text-muted)', hover: { color: 'var(--neon-blue)' } }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                </div>

                <button type="submit" id="login-submit-btn" disabled={loading}
                  className="btn-neon-blue w-full !py-4"
                >
                  {loading ? (
                    <div className="flex items-center gap-2 uppercase tracking-widest">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Connecting…</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="scale-75"><IconBolt /></span> {isRegistering ? 'CREATE ACCOUNT' : 'LOGIN'} →
                    </div>
                  )}
                </button>
                
                <p className="text-center text-xs mt-2" style={{ color: 'var(--c-text-muted)' }}>
                  {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                  <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="font-bold hover:underline" style={{ color: 'var(--neon-blue)' }}>
                    {isRegistering ? 'Log In' : 'Sign Up'}
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="flex flex-col gap-4 animate-scale-in">
                <div className="px-4 py-3 rounded-lg text-sm text-center mb-2" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--c-text)' }}>
                  We've sent a 6-digit code to your email. Please enter it below to verify this device.
                </div>
                <div>
                  <label htmlFor="verify-code" className="block mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>
                    6-Digit Code
                  </label>
                  <input type="text" id="verify-code" className="input-neon text-center font-black tracking-[0.5em] text-xl" placeholder="••••••" maxLength="6"
                    value={verificationCode} onChange={e => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))} required autoFocus/>
                </div>
                <button type="submit" disabled={verifyLoading || verificationCode.length !== 6} className="btn-neon-amber w-full !py-4">
                  {verifyLoading ? 'VERIFYING...' : 'VERIFY DEVICE'}
                </button>
                <button type="button" onClick={() => { setShowVerifyModal(false); setVerificationCode(''); }} className="text-xs font-bold mt-2" style={{ color: 'var(--c-text-muted)' }}>
                  Cancel
                </button>
              </form>
            )}

            <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--c-border-dim)' }}>
              <Link to="/teacher-login" id="instructor-portal-link"
                className="btn-neon-purple w-full !py-3"
              >
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  <span>INSTRUCTOR PORTAL</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════ */
function Footer() {
  const { isLight } = useTheme();
  return (
    <footer className="py-10 px-4" style={{ borderTop: '1px solid var(--c-border-dim)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="LogicPlay" className="h-7 object-contain" style={{ filter: isLight ? 'none' : 'drop-shadow(0 0 6px rgba(0,212,255,0.5))' }}/>
            <span className="text-sm font-bold" style={{ color: 'var(--c-text-muted)' }}>LogicPlay</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--c-surface-2)', color: 'var(--neon-blue)', border: '1px solid var(--c-border)' }}>PWA</span>
          </div>
          <div className="flex items-center gap-4">
            {[
              { color: 'var(--neon-blue)', label: 'AND' },
              { color: 'var(--neon-purple)', label: 'OR' },
              { color: 'var(--neon-green)', label: 'NOT' },
              { color: 'var(--neon-amber)', label: 'XOR' },
            ].map(g => (
              <span key={g.label} className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded" style={{ color: g.color, background: `${g.color}12`, border: `1px solid ${g.color}25` }}>{g.label}</span>
            ))}
          </div>
          <Link to="/teacher-login" className="text-xs font-semibold hover:underline" style={{ color: 'var(--neon-purple)' }}>Instructor Portal</Link>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-6" style={{ borderTop: '1px solid var(--c-border-dim)' }}>
          <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Built for learners. Build. Simulate. Conquer.</p>
          <p className="text-[10px] font-mono" style={{ color: 'var(--c-text-dim)' }}>0x4C6F676963506C6179 // LogicPlay v2.0</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN HOME COMPONENT
═══════════════════════════════════════════════════════════════ */
const Home = ({ isOffline }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const loginRef = useRef(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (user && !location.state?.preparing) {
      if (user.role === 'teacher') navigate('/teacher');
      else navigate('/playground');
    }
  }, [user, navigate, location.state]);

  const scrollToLogin = () => {
    loginRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => loginRef.current?.querySelector('input')?.focus(), 600);
  };

  return (
    <div className="relative" style={{ background: 'var(--c-bg)' }}>
      <LandingNav onHelpClick={() => setIsHelpOpen(true)} isOffline={isOffline} />
      <HeroSection onPlayClick={user ? () => navigate('/playground') : scrollToLogin} />
      <GateShowcaseSection />
      <HowItWorksSection />
      <FeaturesSection />
      <LeaderboardTeaser />
      <LoginSection loginRef={loginRef} />
      <Footer />
      <PWAHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default Home;
