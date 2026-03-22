import React from 'react';

const OfflineBanner = ({ isOffline }) => {
  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9990] flex items-center justify-center gap-2 py-1.5 text-xs font-bold"
         style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.9), rgba(255,107,43,0.9))', color: '#fff' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-glow" />
      Offline Mode — changes will sync when reconnected
    </div>
  );
};

export default OfflineBanner;
