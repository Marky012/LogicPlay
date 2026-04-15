import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import ConfirmModal from './ConfirmModal';
import { useTheme } from '../context/ThemeContext';
import { triggerFeedback } from '../utils/feedback';

/* ── Gate SVG shapes ── */
const GateShape = ({ type, isActive, computedValue, label, isLight, showBinaryOutput }) => {
  const getGlowColor = () => {
    if (type === 'OUTPUT') return isActive ? 'rgba(57,255,20,0.9)' : 'rgba(100,100,100,0.3)';
    if (type === 'INPUT')  return isActive ? 'rgba(245,158,11,0.9)' : 'rgba(100,100,100,0.3)';
    return isActive ? 'rgba(0,212,255,0.7)' : 'rgba(100,100,100,0.3)';
  };

  const GATE_COLORS = {
    AND:    { stroke: '#3b82f6', fill: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
    OR:     { stroke: '#10b981', fill: 'rgba(16,185,129,0.15)', text: '#34d399' },
    NOT:    { stroke: '#bf5fff', fill: 'rgba(191,95,255,0.15)', text: '#d487ff' },
    NAND:   { stroke: '#00ffea', fill: 'rgba(0,255,234,0.1)',   text: '#00ffea' },
    NOR:    { stroke: '#ff6b2b', fill: 'rgba(255,107,43,0.15)', text: '#ff8c55' },
    XOR:    { stroke: '#b4ff00', fill: 'rgba(180,255,0,0.1)',   text: '#b4ff00' },
    XNOR:   { stroke: '#ff33cc', fill: 'rgba(255,51,204,0.1)',  text: '#ff66dd' },
    INPUT:  { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.15)', text: '#fcd34d' },
    OUTPUT: { stroke: '#ff3366', fill: 'rgba(255,51,102,0.15)', text: '#ff6688' },
  };

  const c = GATE_COLORS[type] || GATE_COLORS.AND;
  const glowColor = getGlowColor();

  if (type === 'INPUT') {
    return (
      <div className="relative flex flex-col items-center justify-center w-full h-full transition-all duration-200"
           style={{ filter: isActive ? `drop-shadow(0 0 8px ${glowColor})` : 'none' }}>
        {label && (
          <span className="absolute -top-6 text-[11px] font-extrabold tracking-widest pointer-events-none select-none"
                style={{ 
                  fontFamily: '"JetBrains Mono", monospace',
                  color: 'var(--neon-amber)',
                  textShadow: '0 0 10px rgba(245,158,11,0.5)',
                  opacity: 0.8
                }}>
            {label}
          </span>
        )}
        <div className="input-toggle w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-all duration-300 cursor-pointer"
             style={{
               background: isActive 
                 ? 'radial-gradient(circle, rgba(245,158,11,0.6), rgba(245,158,11,0.2))' 
                 : isLight ? 'var(--c-surface-3)' : 'rgba(40,40,60,0.8)',
               border: `2px solid ${isActive ? c.stroke : isLight ? 'var(--c-border)' : 'rgba(255,255,255,0.15)'}`,
               boxShadow: isActive ? `0 0 16px rgba(245,158,11,0.7), inset 0 0 10px rgba(245,158,11,0.2)` : 'none',
               color: isActive ? '#fff' : 'var(--c-text-muted)',
               fontFamily: '"JetBrains Mono", monospace'
             }}>
          {isActive ? '1' : '0'}
        </div>
      </div>
    );
  }

  if (type === 'OUTPUT') {
    if (showBinaryOutput) {
      return (
        <div className="relative flex items-center justify-center w-full h-full">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-all duration-300"
               style={{
                 background: isActive 
                   ? 'radial-gradient(circle, rgba(57,255,20,0.6), rgba(57,255,20,0.2))' 
                   : isLight ? 'var(--c-surface-3)' : 'rgba(40,40,60,0.8)',
                 border: `2px solid ${isActive ? '#39ff14' : isLight ? 'var(--c-border)' : 'rgba(255,255,255,0.15)'}`,
                 boxShadow: isActive ? `0 0 16px rgba(57,255,20,0.7), inset 0 0 10px rgba(57,255,20,0.2)` : 'none',
                 color: isActive ? '#fff' : 'var(--c-text-muted)',
                 fontFamily: '"JetBrains Mono", monospace'
               }}>
            {isActive ? '1' : '0'}
          </div>
        </div>
      );
    }
    return (
      <div className="relative flex items-center justify-center w-full h-full">
        <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
             style={{
               background: isActive 
                 ? 'radial-gradient(circle, rgba(57,255,20,0.7), rgba(57,255,20,0.15))' 
                 : isLight ? 'var(--c-surface-3)' : 'rgba(40,40,60,0.8)',
               border: `3px solid ${isActive ? '#39ff14' : isLight ? 'var(--c-border)' : 'rgba(255,255,255,0.1)'}`,
               boxShadow: isActive ? '0 0 20px rgba(57,255,20,0.8), inset 0 0 12px rgba(57,255,20,0.3)' : 'none',
             }}>
          {isActive && <div className="w-3 h-3 rounded-full animate-pulse-glow" style={{ background: '#39ff14', boxShadow: '0 0 8px #39ff14' }} />}
        </div>
      </div>
    );
  }

  /* Generic gate with neon label */
  return (
    <div className="flex items-center justify-center w-full h-full"
         style={{ filter: isActive ? `drop-shadow(0 0 6px ${c.stroke})` : 'none' }}>
      <span className="font-black text-sm tracking-tight select-none" style={{ color: isActive ? c.text : 'var(--c-text-muted)' }}>
        {type}
      </span>
    </div>
  );
};

const GATE_CONFIGS = {
  AND:    { border: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  w: 72, h: 52 },
  OR:     { border: '#10b981', bg: 'rgba(16,185,129,0.1)', w: 72, h: 52 },
  NOT:    { border: '#bf5fff', bg: 'rgba(191,95,255,0.1)', w: 66, h: 52 },
  NAND:   { border: '#00ffea', bg: 'rgba(0,255,234,0.08)', w: 72, h: 52 },
  NOR:    { border: '#ff6b2b', bg: 'rgba(255,107,43,0.1)', w: 72, h: 52 },
  XOR:    { border: '#b4ff00', bg: 'rgba(180,255,0,0.08)', w: 72, h: 52 },
  XNOR:   { border: '#ff33cc', bg: 'rgba(255,51,204,0.08)', w: 72, h: 52 },
  INPUT:  { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', w: 58, h: 52 },
  OUTPUT: { border: '#ff3366', bg: 'rgba(255,51,102,0.08)', w: 58, h: 52 },
};

const getPins = (type) => {
  switch (type) {
    case 'INPUT':  return { in: 0, out: 1 };
    case 'OUTPUT': return { in: 1, out: 0 };
    case 'NOT':    return { in: 1, out: 1 };
    default:       return { in: 2, out: 1 }; // AND, OR, NAND, NOR, XOR
  }
};

const Gate = ({ id, type, x, y, state, onPinClick, onToggleState, computedValue, onDelete, isReadOnly, label, showBinaryOutput }) => {
  const { isLight } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'GATE',
    item: { id, type },
    canDrag: () => !isReadOnly,
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }), [id, type, isReadOnly]);

  const cfg = GATE_CONFIGS[type] || GATE_CONFIGS.AND;
  const pins = getPins(type);

  const isActive = type === 'INPUT' ? state === 1 : computedValue === 1;

  const borderColor = isActive ? cfg.border : isLight ? 'var(--c-border)' : 'rgba(255,255,255,0.1)';
  const glowStr = isActive 
    ? `0 0 12px ${cfg.border}88, 0 0 4px ${cfg.border}44` 
    : isLight ? '0 2px 8px rgba(0,0,0,0.05)' : '0 2px 8px rgba(0,0,0,0.5)';

  return (
    <div ref={dragRef}
         className="absolute group gate-element transition-all duration-200 animate-scale-in"
         style={{
           left: x, top: y,
           width: cfg.w, height: cfg.h,
           opacity: isDragging ? 0.3 : 1,
           cursor: isReadOnly ? 'default' : 'grab',
         }}>

      {/* Gate body */}
      <div className="w-full h-full rounded-xl flex items-center justify-center transition-all duration-300"
           style={{
             background: cfg.bg,
             border: `1.5px solid ${borderColor}`,
             boxShadow: glowStr,
           }}
           onClick={type === 'INPUT' ? (e) => { 
             e.stopPropagation(); 
             triggerFeedback('click');
             onToggleState && onToggleState(id); 
           } : undefined}>
        <GateShape type={type} isActive={isActive} computedValue={computedValue} label={label} isLight={isLight} showBinaryOutput={showBinaryOutput} />
      </div>

      {/* Delete button — shows on hover */}
      {!isReadOnly && (
        <>
          <button
            className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-110"
            style={{ background: 'rgba(255,51,102,0.85)', color: '#fff', border: '1px solid rgba(255,51,102,0.5)', lineHeight: 1 }}
            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
          >
            ×
          </button>
          <ConfirmModal
            isOpen={showDeleteConfirm}
            title="Delete Gate?"
            message="This will also remove all connected wires."
            confirmLabel="Delete"
            danger
            onConfirm={() => {
              triggerFeedback('delete');
              onDelete && onDelete(id);
              setShowDeleteConfirm(false);
            }}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        </>
      )}

      {/* Input pins (left side) — always visible, only clickable when not read-only */}
      {pins.in > 0 && (
        <div className="absolute flex flex-col justify-around h-full py-1.5" style={{ left: -10, top: 0 }}>
          {Array.from({ length: pins.in }).map((_, i) => (
            <div key={`in-${i}`}
                  className={`w-3 h-3 rounded-full transition-all duration-150 ${!isReadOnly ? 'cursor-pointer hover:scale-150' : 'cursor-default'}`}
                  style={{
                    background: isLight ? 'var(--c-surface-3)' : 'rgba(30,40,60,0.9)',
                    border: isLight ? '1.5px solid var(--c-border)' : '1.5px solid rgba(0,212,255,0.4)',
                    boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.05)' : '0 0 4px rgba(0,212,255,0.2)',
                  }}
                 onClick={!isReadOnly ? (e) => { e.stopPropagation(); onPinClick(id, `in-${i}`, 'input'); } : undefined}
            />
          ))}
        </div>
      )}

      {/* Output pin (right side) — always visible, only clickable when not read-only */}
      {pins.out > 0 && (
        <div className="absolute flex flex-col justify-around h-full py-1.5" style={{ right: -10, top: 0 }}>
           <div className={`w-3 h-3 rounded-full transition-all duration-150 ${!isReadOnly ? 'cursor-pointer hover:scale-150' : 'cursor-default'}`}
                style={{
                  background: isActive ? cfg.border : isLight ? 'var(--c-surface-3)' : 'rgba(30,40,60,0.9)',
                  border: `1.5px solid ${isActive ? cfg.border : isLight ? 'var(--c-border)' : 'rgba(0,212,255,0.4)'}`,
                  boxShadow: isActive ? `0 0 6px ${cfg.border}` : isLight ? '0 1px 3px rgba(0,0,0,0.05)' : '0 0 4px rgba(0,212,255,0.2)',
                }}
               onClick={!isReadOnly ? (e) => { e.stopPropagation(); onPinClick(id, 'out-0', 'output'); } : undefined}
          />
        </div>
      )}
    </div>
  );
};

export default Gate;
