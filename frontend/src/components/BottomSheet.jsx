import React, { useState, useRef, useEffect } from 'react';

/**
 * BottomSheet — Mobile slide-up drawer with 3 snap states.
 *
 * Props:
 *   label       – string shown in the handle chip
 *   badge       – optional ReactNode (e.g. a dot) overlaid on handle
 *   children    – drawer body content
 */
const SNAPS = {
  closed: 'closed',
  half:   'half',
  full:   'full',
};

// Heights from bottom (CSS bottom value is 0, so we translate upward)
const snapTranslate = (snap, sheetHeight) => {
  switch (snap) {
    case SNAPS.closed: return sheetHeight - 52;   // only handle visible (52px)
    case SNAPS.half:   return sheetHeight * 0.50; // 50% visible
    case SNAPS.full:   return 20;                  // nearly full screen (20px gap at top)
    default:           return sheetHeight - 52;
  }
};

const cycleSnap = (current) => {
  if (current === SNAPS.closed) return SNAPS.half;
  if (current === SNAPS.half)   return SNAPS.full;
  return SNAPS.closed;
};

const BottomSheet = ({ label = 'Controls', badge, children }) => {
  const [snap, setSnap]           = useState(SNAPS.closed);
  const [dragY, setDragY]         = useState(null); // null = not dragging
  const [sheetH, setSheetH]       = useState(window.innerHeight * 0.92);
  const sheetRef  = useRef(null);
  const dragStart = useRef(null); // { clientY, translateY }

  // Recalculate sheet height on resize
  useEffect(() => {
    const onResize = () => setSheetH(window.innerHeight * 0.92);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const currentTranslate = dragY !== null ? dragY : snapTranslate(snap, sheetH);
  const isOpen = snap !== SNAPS.closed || dragY !== null;

  /* ── Touch handlers ── */
  const onTouchStart = (e) => {
    const t = e.touches[0];
    dragStart.current = { clientY: t.clientY, translateY: currentTranslate };
  };

  const onTouchMove = (e) => {
    if (!dragStart.current) return;
    const delta = dragStart.current.clientY - e.touches[0].clientY;
    const newY  = Math.max(20, Math.min(sheetH - 52, dragStart.current.translateY - delta));
    setDragY(newY);
  };

  const onTouchEnd = () => {
    if (!dragStart.current) return;
    const finalY = dragY ?? snapTranslate(snap, sheetH);
    // Snap to nearest
    const snaps = {
      [SNAPS.closed]: snapTranslate(SNAPS.closed, sheetH),
      [SNAPS.half]:   snapTranslate(SNAPS.half, sheetH),
      [SNAPS.full]:   snapTranslate(SNAPS.full, sheetH),
    };
    let nearest = SNAPS.closed;
    let minDist = Infinity;
    for (const [s, y] of Object.entries(snaps)) {
      const d = Math.abs(finalY - y);
      if (d < minDist) { minDist = d; nearest = s; }
    }
    setSnap(nearest);
    setDragY(null);
    dragStart.current = null;
  };

  /* ── Mouse handlers (desktop fallback) ── */
  const onMouseDown = (e) => {
    dragStart.current = { clientY: e.clientY, translateY: currentTranslate };
    const onMove = (ev) => {
      const delta = dragStart.current.clientY - ev.clientY;
      const newY  = Math.max(20, Math.min(sheetH - 52, dragStart.current.translateY - delta));
      setDragY(newY);
    };
    const onUp = () => {
      onTouchEnd();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleTap = () => {
    setDragY(null);
    setSnap(prev => cycleSnap(prev));
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[200] lg:hidden"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
          onClick={() => setSnap(SNAPS.closed)}
        />
      )}

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-[300] lg:hidden flex flex-col"
        style={{
          height: `${sheetH}px`,
          transform: `translateY(${currentTranslate}px)`,
          transition: dragY !== null ? 'none' : 'transform 0.38s cubic-bezier(0.32,0.72,0,1)',
          background: 'rgba(8,16,30,0.97)',
          borderRadius: '22px 22px 0 0',
          border: '1px solid rgba(0,212,255,0.2)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.6), 0 -1px 0 rgba(0,212,255,0.15)',
        }}
      >
        {/* ── Handle ── */}
        <div
          className="flex flex-col items-center pt-3 pb-2 cursor-grab select-none flex-shrink-0"
          onClick={handleTap}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          style={{ touchAction: 'none' }}
        >
          {/* Pill */}
          <div
            className="w-10 h-1.5 rounded-full mb-2.5"
            style={{ background: 'rgba(0,212,255,0.35)' }}
          />

          {/* Label chip */}
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.25)',
                color: 'var(--neon-blue)',
              }}
            >
              {label}
            </span>
            {badge && badge}
            {/* Arrow hint */}
            <span
              className="text-slate-600 text-xs transition-transform duration-300"
              style={{
                transform: snap === SNAPS.full ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              ↑
            </span>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-2">
          {children}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
