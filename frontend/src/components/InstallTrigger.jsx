import React, { useState, useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { useTheme } from '../context/ThemeContext';

const IconBox = ({ isLight }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isLight ? 'var(--neon-blue)' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: isLight ? 'none' : 'drop-shadow(0 0 5px rgba(255,255,255,0.4))' }}>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="M3.27 6.96 12 12.01l8.73-5.05" />
    <path d="M12 22.08V12" />
  </svg>
);

const IconRefresh = ({ isLight }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isLight ? 'var(--neon-blue)' : 'white'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: isLight ? 'none' : 'drop-shadow(0 0 5px rgba(255,255,255,0.4))' }}>
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);

const IconDownload = ({ isLight }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: isLight ? 'none' : 'drop-shadow(0 0 5px rgba(255,255,255,0.4))' }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const InstallTrigger = ({ onInstallSuccess }) => {
  const { isLight } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isCaching, setIsCaching] = useState(false);
  const [isReadyForInstall, setIsReadyForInstall] = useState(false);
  const [cacheStatus, setCacheStatus] = useState('');

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    // Check if service worker is already active
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg && reg.active) {
          setIsReadyForInstall(true);
        }
      });
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (onInstallSuccess) onInstallSuccess();
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [onInstallSuccess]);

  const handlePrepareOffline = async () => {
    setIsCaching(true);
    setCacheStatus('Initializing secure link...');
    
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    
    try {
      const { 
        getChallenges, 
        getLeaderboard, 
        getAssignments, 
        getAssignmentsByTeacher,
        getUser, 
        getCircuits, 
        getStudentClassrooms, 
        getTeacherClassrooms 
      } = await import('../utils/api');
      
      await sleep(400);
      setCacheStatus('Synchronizing resources...');
      
      const username = localStorage.getItem('username');
      const role = localStorage.getItem('role');
      
      const fetchTasks = [
        getChallenges(),
        getLeaderboard(20),
        role === 'teacher' && username ? getAssignmentsByTeacher(username) : getAssignments(role === 'student' ? username : null)
      ];

      if (username) {
        fetchTasks.push(getUser(username));
        if (role === 'student') {
          fetchTasks.push(getCircuits(username));
          fetchTasks.push(getStudentClassrooms(username));
        } else if (role === 'teacher') {
          fetchTasks.push(getTeacherClassrooms(username));
        }
      }
      
      // Wrap fetching in a 5-second timeout so PWA install never hangs 
      // if the backend is physically unreachable from the phone
      const fetchPromise = Promise.allSettled(fetchTasks);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Pre-fetch timed out completely due to unreachable network')), 5000)
      );
      
      await Promise.race([fetchPromise, timeoutPromise]);
      
      await sleep(600);
      setCacheStatus('Optimizing local data...');
      await sleep(600);
      setCacheStatus('Verifying registration...');

    } catch (e) {
      console.warn('Pre-fetch completed with some warnings, proceeding to SW activation...', e);
    }

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.active) {
          try {
            await reg.update();
          } catch (e) {
            console.warn('Silent update failed', e);
          }
          setIsCaching(false);
          setIsReadyForInstall(true);
          setCacheStatus('Ready for Offline!');
          return;
        }
      }

      let isResolved = false;

      const finishRegistration = (statusMessage, stallMessage) => {
        if (isResolved) return;
        isResolved = true;
        setIsCaching(false);
        if (statusMessage) {
          setIsReadyForInstall(true);
          setCacheStatus(statusMessage);
        } else {
          setCacheStatus(stallMessage);
          // Briefly show the error before reverting to the default UI so the user can actually see it
          setTimeout(() => {
             if (!isReadyForInstall) setCacheStatus('');
          }, 4000);
        }
      };

      if (!('serviceWorker' in navigator)) {
         finishRegistration(null, 'Failed: HTTPS or Localhost required for Offline Mode.');
         return;
      }

      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.active) {
          try {
            await reg.update();
          } catch (e) {
            console.warn('Silent update failed', e);
          }
          finishRegistration('Ready for Offline!', null);
          return;
        }
      }

      registerSW({
        immediate: true,
        onOfflineReady() {
          finishRegistration('Ready for Offline!', null);
        },
        onRegisterError(err) {
          console.error('SW Error:', err);
          finishRegistration(null, 'Download stalled – try again.');
        }
      });

      setTimeout(() => {
        if (!isResolved) {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(reg => {
              if (reg) finishRegistration('Ready for Offline!', null);
              else finishRegistration(null, 'Download stalled – try again.');
            }).catch(() => {
              finishRegistration(null, 'Download stalled – try again.');
            });
          } else {
            finishRegistration(null, 'Download stalled – try again.');
          }
        }
      }, 7000);

    } catch (e) {
      console.error('registerSW crashed:', e);
      setIsCaching(false);
      setCacheStatus('Download stalled – try again.');
    }

  };
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (isInstalled) return null;

  return (
    <div className="relative z-20 animate-fade-in flex flex-col items-center gap-6">
      {/* 
          We show the "Download" flow if:
          - Not ready yet OR 
          - Caching is in progress 
      */}
      {(!isReadyForInstall || isCaching) ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: cacheStatus?.includes('Failed') || cacheStatus?.includes('stalled') ? '#ef4444' : 'var(--c-text)', opacity: isLight ? 1 : 0.8 }}>
              {isCaching ? 'Preparing Standalone Mode' : (cacheStatus?.includes('Failed') || cacheStatus?.includes('stalled') ? 'Download Failed' : (isReadyForInstall ? 'Resources Updated' : 'Ready for Offline Play?'))}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cacheStatus?.includes('Failed') || cacheStatus?.includes('stalled') ? '#ef4444' : (isLight ? 'var(--c-text-muted)' : 'var(--c-text-muted)') }}>
              {isCaching || (cacheStatus?.includes('Failed') || cacheStatus?.includes('stalled')) ? cacheStatus : 'Download components for zero-latency offline simulation.'}
            </p>
          </div>
          
          <button
            onClick={handlePrepareOffline}
            disabled={isCaching}
            className="group relative flex items-center gap-3 px-10 py-3.5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:scale-105 active:scale-95 shadow-glow-blue disabled:opacity-50 disabled:scale-100"
            style={{
              background: isLight ? 'rgba(2,132,199,0.1)' : 'linear-gradient(135deg, #00d4ff25, #00d4ff10)',
              border: isLight ? '1.5px solid rgba(2,132,199,0.4)' : '1.5px solid var(--neon-blue)',
              color: 'var(--neon-blue)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {isCaching ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" style={{ color: isLight ? 'var(--neon-blue)' : 'white' }}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span style={{ color: isLight ? 'var(--neon-blue)' : 'white' }}>Processing...</span>
              </>
            ) : (
              <>
                <span className="flex items-center justify-center">
                  {isReadyForInstall ? <IconRefresh isLight={isLight} /> : <IconBox isLight={isLight} />}
                </span>
                {isReadyForInstall ? 'Refresh Resources' : 'Download Resources'}
              </>
            )}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                 style={{ boxShadow: isLight ? '0 10px 20px rgba(2,132,199,0.2)' : '0 0 30px var(--neon-blue)' }} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center animate-bounce-in">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 justify-center" style={{ color: isLight ? 'var(--neon-green)' : 'var(--neon-green)' }}>
              <span className="text-base animate-pulse">✨</span> System Offline Ready
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>Install LogicPlay as a standalone desktop app.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleInstallClick}
              disabled={!deferredPrompt}
              className="group relative flex items-center gap-3 px-10 py-3.5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:scale-105 active:scale-95 shadow-glow-emerald disabled:opacity-30 disabled:grayscale disabled:scale-100"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                backdropFilter: 'blur(10px)'
              }}
            >
              <IconDownload isLight={isLight} />
              Install Standalone App
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                   style={{ boxShadow: '0 0 30px #10b981' }} />
            </button>
            
            <button 
              onClick={() => setIsReadyForInstall(false)}
              className="text-[10px] font-black uppercase tracking-widest hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                style={{ color: 'var(--c-text-muted)' }}
            >
              Sync Again
            </button>
          </div>
          
          {!deferredPrompt && (
            <div className="flex flex-col items-center mt-2 gap-1.5 animate-fade-in">
              <p className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg max-w-[280px] leading-relaxed">
                App is fully cached! To install to your home screen, use your browser's <strong className="text-amber-400">"Add to Home Screen"</strong> or <strong className="text-amber-400">"Install App"</strong> menu option.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstallTrigger;
