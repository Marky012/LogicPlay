import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PWAStatus = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-[9999] px-4 pointer-events-none">
            <div className="animate-bounce-in pointer-events-auto">
                <div className="glass-panel p-4 flex flex-col gap-3 min-w-[300px] shadow-2xl"
                 style={{ 
                    background: 'var(--c-surface)', 
                    border: '1px solid var(--neon-blue)',
                    boxShadow: '0 0 30px rgba(0,212,255,0.2)' 
                 }}>
                
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/10 text-xl border border-blue-500/20">
                        {offlineReady ? '✅' : '✨'}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--c-text)' }}>
                            {offlineReady ? 'Ready for Offline' : 'New Update Available'}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                            {offlineReady 
                                ? 'App is now cached and playable offline!' 
                                : 'A new version of LogicPlay is ready.'}
                        </p>
                    </div>
                    <button onClick={close} className="text-slate-500 hover:text-white transition-colors p-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {needRefresh && (
                    <button
                        onClick={() => updateServiceWorker(true)}
                        className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-lg shadow-glow-blue transition-transform hover:scale-[1.02] active:scale-95"
                    >
                        Update App Now
                    </button>
                )}

                {offlineReady && (
                    <button
                        onClick={close}
                        className="w-full py-2 bg-slate-800 text-slate-300 text-xs font-black uppercase tracking-[0.2em] rounded-lg transition-colors hover:bg-slate-700"
                    >
                        Awesome!
                    </button>
                )}
            </div>
        </div>
    </div>
    );
};

export default PWAStatus;
