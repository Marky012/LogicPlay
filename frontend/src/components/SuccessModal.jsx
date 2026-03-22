import React, { useEffect, useState } from 'react';

const CONFETTI_COLORS = ['#39ff14','#00d4ff','#bf5fff','#f59e0b','#ff3366'];

const Confetto = ({ i }) => {
  const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
  const left  = `${10 + (i * 37) % 80}%`;
  const delay = `${(i * 0.07).toFixed(2)}s`;
  return (
    <div className="absolute top-0 pointer-events-none animate-confetti"
         style={{ left, width: 8, height: 8, borderRadius: i % 2 === 0 ? '50%' : '1px', background: color, animationDelay: delay, opacity: 0.85 }} />
  );
};

const SuccessModal = ({ isOpen, score, xpGained, badgeUnlocked, onNextChallenge, onKeepBuilding }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 50);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center"
         style={{ background: 'rgba(6,11,20,0.85)', backdropFilter: 'blur(8px)' }}>
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => <Confetto key={i} i={i} />)}
      </div>

      {/* Modal */}
      <div className={`glass-panel p-10 max-w-sm w-full mx-4 text-center transition-all duration-500 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
           style={{ border: '1px solid rgba(57,255,20,0.4)', boxShadow: '0 0 40px rgba(57,255,20,0.2)' }}>

        {/* Check icon */}
        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-5 animate-bounce-in"
             style={{ background: 'radial-gradient(circle, rgba(57,255,20,0.25), rgba(57,255,20,0.05))', border: '2px solid rgba(57,255,20,0.5)', boxShadow: '0 0 30px rgba(57,255,20,0.4)' }}>
          <span className="text-4xl">✓</span>
        </div>

        <h2 className="text-3xl font-black mb-1 text-gradient-neon glow-text-green">
          Circuit Complete!
        </h2>
        <p className="text-slate-400 mb-6 text-sm">All outputs are HIGH — perfect logic!</p>

        {/* Stats */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="flex flex-col items-center px-5 py-3 rounded-xl"
               style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.2)' }}>
            <span className="text-2xl font-black" style={{ color: 'var(--neon-green)' }}>+{xpGained ?? 50}</span>
            <span className="text-xs text-slate-500 mt-0.5">XP Earned</span>
          </div>
          <div className="flex flex-col items-center px-5 py-3 rounded-xl"
               style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <span className="text-2xl font-black" style={{ color: 'var(--neon-blue)' }}>{score ?? 100}</span>
            <span className="text-xs text-slate-500 mt-0.5">Score</span>
          </div>
        </div>

        {badgeUnlocked && (
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl mb-6 animate-scale-in"
               style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)' }}>
            <span className="text-lg">🏆</span>
            <span className="text-sm font-bold" style={{ color: 'var(--neon-amber)' }}>
              Badge Unlocked: <span className="text-white">{badgeUnlocked}</span>
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button onClick={onNextChallenge} className="btn-primary w-full py-3 text-base">
            Next Challenge →
          </button>
          <button onClick={onKeepBuilding} className="btn-ghost w-full py-2.5">
            Keep Building
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
