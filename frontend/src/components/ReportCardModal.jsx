import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

const StatPill = ({ label, value, color }) => (
  <div className="flex flex-col items-center py-2 px-3 rounded-xl transition-all"
       style={{ background: `${color}15`, border: `1px solid ${color}35`, boxShadow: `inset 0 0 10px ${color}10` }}>
    <span className="text-xl font-black leading-none mb-1" style={{ color, textShadow: `0 0 10px ${color}66` }}>
      {value}
    </span>
    <span className="text-[9px] uppercase tracking-widest text-slate-400">{label}</span>
  </div>
);

const ReportCardModal = ({ isOpen, data, onConfirm, isTeacherView = false }) => {
  if (!isOpen || !data) return null;

  const {
    studentUsername,
    assignmentTitle,
    score,
    gateCount,
    wireCount,
    timestamp
  } = data;

  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // 2x resolution for crispness
        useCORS: true
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `LogicPlay_${studentUsername || 'Report'}_${assignmentTitle?.replace(/\s+/g, '_') || 'Freeplay'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Determine styling based on score
  const isPerfect = score >= 100;
  const isPassing = score >= 60 && score < 100;
  
  const themeColor = isPerfect ? 'var(--neon-green)' : isPassing ? 'var(--neon-amber)' : 'var(--neon-red)';
  const themeGlow  = isPerfect ? 'rgba(57,255,20,0.2)' : isPassing ? 'rgba(255,215,0,0.2)' : 'rgba(255,51,102,0.2)';
  const bgGradient = isPerfect 
    ? 'linear-gradient(135deg, rgba(57,255,20,0.15), var(--c-surface))' 
    : isPassing 
    ? 'linear-gradient(135deg, rgba(255,215,0,0.15), var(--c-surface))'
    : 'linear-gradient(135deg, rgba(255,51,102,0.15), var(--c-surface))';

  const statusText = isPerfect ? 'MISSION ACCOMPLISHED' : isPassing ? 'MISSION CLEARED' : 'MISSION FAILED';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
         style={{ background: 'var(--c-bg-glass)', backdropFilter: 'blur(8px)' }}>
      <div 
        ref={cardRef}
        className="w-full max-w-md rounded-3xl p-1 animate-scale-up relative overflow-hidden"
        style={{ background: themeColor, boxShadow: `0 8px 32px ${themeGlow}` }}>
        
        {/* Inner Card */}
        <div className="rounded-[22px] flex flex-col relative overflow-hidden" style={{ background: bgGradient }}>
          
          {/* Header Banner */}
          <div className="py-6 px-6 relative flex flex-col items-center justify-center text-center overflow-hidden"
               style={{ borderBottom: `1px solid ${themeColor}44` }}>
            {/* Sparkle effects for perfect score */}
            {isPerfect && (
              <div className="absolute inset-0 opacity-20 pointer-events-none"
                   style={{ background: `radial-gradient(circle at 50% 50%, ${themeColor} 0%, transparent 70%)` }} />
            )}
            
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: themeColor, textShadow: `0 0 8px ${themeColor}aa` }}>
              {statusText}
            </p>
            <h2 className="text-3xl font-black leading-tight" style={{ color: 'var(--c-text)' }}>
              {score}<span className="text-lg" style={{ color: 'var(--c-text-muted)' }}>/100</span>
            </h2>
          </div>

          {/* Content Body */}
          <div className="p-6 md:p-8 flex flex-col gap-6">
            
            {/* Context Info */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)' }}>
                <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--c-text-muted)' }}>Operative</span>
                <span className="font-bold text-sm" style={{ color: 'var(--c-text)' }}>{studentUsername || 'Unknown Node'}</span>
              </div>
              
              <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)' }}>
                <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--c-text-muted)' }}>Target Directive</span>
                <span className="font-bold text-sm max-w-[60%] text-right truncate" style={{ color: 'var(--c-text)' }} title={assignmentTitle || 'Freeplay'}>
                  {assignmentTitle || 'Freeplay Sector'}
                </span>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <StatPill label="Logic Gates" value={gateCount ?? 0} color="var(--neon-blue)" />
              <StatPill label="Connections" value={wireCount ?? 0} color="var(--neon-blue)" />
            </div>

            <div className="text-center mt-2">
              <p className="text-[9px] text-slate-500 tracking-widest uppercase">
                {isTeacherView ? 'Evaluated At' : 'Timestamp'} • {timestamp || new Date().toLocaleTimeString()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={onConfirm}
                className="w-full py-3.5 rounded-xl font-black text-sm text-black transition-all hover:scale-[1.02] active:scale-95 shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest"
                style={{ background: themeColor, boxShadow: `0 0 20px ${themeGlow}` }}
              >
                {isTeacherView ? 'Close Report' : 'Acknowledge'}
              </button>

              {!isTeacherView && (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full py-3 rounded-xl font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest border"
                  style={{ background: 'var(--c-surface-2)', borderColor: 'var(--c-border-dim)', color: 'var(--c-text)' }}
                >
                  {downloading ? (
                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/></svg> Exporting...</>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download Image
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCardModal;
