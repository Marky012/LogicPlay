import React from 'react';
import { useTheme } from '../context/ThemeContext';

const IconSmartphone = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);

const IconLaptop = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 16V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

const IconBox = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const PWAHelpModal = ({ isOpen, onClose }) => {
  const { isLight } = useTheme();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 overflow-y-auto bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Backdrop overlay for closing */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative glass-panel w-full max-w-2xl overflow-hidden animate-slide-up shadow-[0_0_100px_rgba(0,130,180,0.1)]"
           style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
        
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-white/5" style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-glow-blue bg-blue-500/10 border border-blue-500/20" style={{ color: 'var(--neon-blue)' }}>
              <IconSmartphone />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest leading-none" style={{ color: 'var(--c-text)' }}>LogicPlay Guide</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Standalone & Offline Installation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8 flex flex-col gap-8 max-h-[70vh] overflow-y-auto">
          
          {/* Prerequisite Section */}
          <div className="flex gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 items-center">
            <div className="flex-shrink-0 text-blue-400">
              <IconBox />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-0.5">Step 0: Prepare Resources</h3>
              <p className="text-[11px] text-slate-400 font-medium">Click the <span className="text-blue-400 font-bold">"Download Resources"</span> button on the landing page first. This fetches everything needed to simulate circuits offline.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Desktop Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></span> Desktop (Chrome / Edge)
              </h3>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center text-sm font-black border border-white/10" style={{ color: 'var(--c-text)' }}>1</div>
                <p className="text-[11px] leading-relaxed font-medium" style={{ color: 'var(--c-text-muted)' }}>After preparing resources, look at the right side of your <span className="font-bold" style={{ color: 'var(--c-text)' }}>Address Bar</span>.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center text-sm font-black border border-white/10" style={{ color: 'var(--c-text)' }}>2</div>
                <p className="text-[11px] leading-relaxed font-medium" style={{ color: 'var(--c-text-muted)' }}>Click the <span className="font-bold" style={{ color: 'var(--c-text)' }}>Install Icon</span> (a small computer/plus icon) and select "Install".</p>
              </div>
              <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2">
                <div className="text-slate-400">
                  <IconLaptop />
                </div>
                <span className="text-[9px] uppercase font-bold text-slate-500">Standalone App Created</span>
              </div>
            </div>

            {/* Mobile Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Mobile (Android / iOS)
              </h3>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center text-sm font-black border border-white/10" style={{ color: 'var(--c-text)' }}>1</div>
                <p className="text-[11px] leading-relaxed font-medium" style={{ color: 'var(--c-text-muted)' }}>On Android: Tap the <span className="font-bold" style={{ color: 'var(--c-text)' }}>Menu (⋮)</span> and select <span className="font-bold" style={{ color: 'var(--c-text)' }}>"Install App"</span>.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center text-sm font-black border border-white/10" style={{ color: 'var(--c-text)' }}>2</div>
                <p className="text-[11px] leading-relaxed font-medium" style={{ color: 'var(--c-text-muted)' }}>On iOS (Safari): Tap the <span className="font-bold" style={{ color: 'var(--c-text)' }}>Share Icon</span> and select <span className="font-bold" style={{ color: 'var(--c-text)' }}>"Add to Home Screen"</span>.</p>
              </div>
              <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2">
                <div className="text-slate-400">
                  <IconSmartphone />
                </div>
                <span className="text-[9px] uppercase font-bold text-slate-500">Native-like Experience</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2 mb-2">
              <span className="text-sm">✓</span> Why Install?
            </h3>
            <ul className="grid grid-cols-2 gap-3">
              <li className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span> 0% Latency Offline
              </li>
              <li className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span> Fullscreen Immersive
              </li>
              <li className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span> Instant Push Updates
              </li>
              <li className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span> persistent saves
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 flex items-center justify-center border-t border-white/5" style={{ background: isLight ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)' }}>
          <button onClick={onClose} className="btn-primary px-10 py-2.5 text-xs font-black uppercase tracking-widest"> Got it, let's play!</button>
        </div>
      </div>
    </div>
  );
};

export default PWAHelpModal;
