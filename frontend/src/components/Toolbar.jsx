import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { triggerFeedback } from '../utils/feedback';
import { useTheme } from '../context/ThemeContext';

/* ── SVG Logic Gate Symbols ─────────────────────────────── */
const GateSVG = ({ type, color, size = 36 }) => {
  const s = size;
  const h = s * 0.6;
  switch (type) {
    case 'AND':
      return (
        <svg width={s} height={h} viewBox="0 0 36 22" fill="none">
          <path d="M2 2 H16 Q34 2 34 11 Q34 20 16 20 H2 Z" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="7" x2="2" y2="7" stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="15" x2="2" y2="15" stroke={color} strokeWidth="1.5" />
          <line x1="34" y1="11" x2="36" y2="11" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'OR':
      return (
        <svg width={s} height={h} viewBox="0 0 36 22" fill="none">
          <path d="M2 2 Q8 11 2 20 Q14 20 22 20 Q34 20 34 11 Q34 2 22 2 Q14 2 2 2 Z" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="7" x2="6" y2="7" stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="15" x2="6" y2="15" stroke={color} strokeWidth="1.5" />
          <line x1="34" y1="11" x2="36" y2="11" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'NOT':
      return (
        <svg width={s} height={h} viewBox="0 0 36 22" fill="none">
          <path d="M2 2 L30 11 L2 20 Z" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
          <circle cx="32" cy="11" r="2.5" fill={`${color}44`} stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="11" x2="2" y2="11" stroke={color} strokeWidth="1.5" />
          <line x1="34.5" y1="11" x2="36" y2="11" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'NAND':
      return (
        <svg width={s} height={h} viewBox="0 0 36 22" fill="none">
          <path d="M2 2 H14 Q29 2 29 11 Q29 20 14 20 H2 Z" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
          <circle cx="32" cy="11" r="2.5" fill={`${color}44`} stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="7" x2="2" y2="7" stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="15" x2="2" y2="15" stroke={color} strokeWidth="1.5" />
          <line x1="34.5" y1="11" x2="36" y2="11" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'NOR':
      return (
        <svg width={s} height={h} viewBox="0 0 36 22" fill="none">
          <path d="M2 2 Q7 11 2 20 Q12 20 20 20 Q30 20 30 11 Q30 2 20 2 Q12 2 2 2 Z" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
          <circle cx="32.5" cy="11" r="2.5" fill={`${color}44`} stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="7" x2="5" y2="7" stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="15" x2="5" y2="15" stroke={color} strokeWidth="1.5" />
          <line x1="35" y1="11" x2="36" y2="11" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'XOR':
      return (
        <svg width={s} height={h} viewBox="0 0 36 22" fill="none">
          <path d="M6 2 Q12 11 6 20 Q16 20 24 20 Q36 20 36 11 Q36 2 24 2 Q16 2 6 2 Z" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
          <path d="M2 2 Q8 11 2 20" fill="none" stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="7" x2="5" y2="7" stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="15" x2="5" y2="15" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'XNOR':
      return (
        <svg width={s} height={h} viewBox="0 0 36 22" fill="none">
          <path d="M6 2 Q12 11 6 20 Q16 20 24 20 Q31 20 31 11 Q31 2 24 2 Q16 2 6 2 Z" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
          <path d="M2 2 Q8 11 2 20" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx="33.5" cy="11" r="2" fill={`${color}44`} stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="7" x2="5" y2="7" stroke={color} strokeWidth="1.5" />
          <line x1="0" y1="15" x2="5" y2="15" stroke={color} strokeWidth="1.5" />
          <line x1="35.5" y1="11" x2="36" y2="11" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'INPUT':
      return (
        <svg width={s * 0.7} height={h} viewBox="0 0 26 22" fill="none">
          <rect x="1" y="4" width="18" height="14" rx="7" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
          <circle cx="8" cy="11" r="4.5" fill={`${color}66`} />
          <line x1="19" y1="11" x2="26" y2="11" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'OUTPUT':
      return (
        <svg width={s * 0.6} height={h} viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="9" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
          <circle cx="11" cy="11" r="5" fill={`${color}55`} />
          <line x1="0" y1="11" x2="2" y2="11" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    default:
      return <span className="text-xs font-mono">{type}</span>;
  }
};

const GATE_CONFIGS = {
  INPUT:   { color: 'var(--neon-amber)',  label: 'Input',   hint: 'Toggle HIGH/LOW signal' },
  OUTPUT:  { color: 'var(--neon-red)',    label: 'Output',  hint: 'Lights up when signal is HIGH' },
  AND:     { color: 'var(--neon-blue)',   label: 'AND',     hint: 'Out=1 only if ALL inputs are 1' },
  OR:      { color: 'var(--neon-green)',  label: 'OR',      hint: 'Out=1 if ANY input is 1' },
  NOT:     { color: 'var(--neon-purple)', label: 'NOT',     hint: 'Inverts the input signal' },
  NAND:    { color: 'var(--neon-cyan)',   label: 'NAND',    hint: 'NOT AND – universal gate' },
  NOR:     { color: 'var(--neon-orange)', label: 'NOR',     hint: 'NOT OR – universal gate' },
  XOR:     { color: 'var(--neon-lime)',   label: 'XOR',     hint: 'Out=1 if inputs DIFFER' },
  XNOR:    { color: 'var(--neon-purple)', label: 'XNOR',   hint: 'Out=1 if inputs are SAME' },
};

/* resolved colours for use inside SVG / inline styles that can’t use var() */
const GATE_RESOLVED_DARK = {
  INPUT: '#f59e0b', OUTPUT: '#ff3366', AND: '#00d4ff', OR: '#39ff14',
  NOT: '#bf5fff',  NAND: '#00ffea',   NOR: '#ff6b2b', XOR: '#b4ff00', XNOR: '#bf5fff',
};
const GATE_RESOLVED_LIGHT = {
  INPUT: '#b45309', OUTPUT: '#be123c', AND: '#0369a1', OR: '#15803d',
  NOT: '#7c3aed',  NAND: '#0e7490',   NOR: '#c2410c', XOR: '#4d7c0f', XNOR: '#7c3aed',
};

/* ── Desktop card (unchanged look) ──────────────────────── */
const DesktopGateCard = ({ type, cfg }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'NEW_GATE',
    item: { type },
    collect: (m) => ({ isDragging: !!m.isDragging() }),
  }), [type]);

  const { isLight } = useTheme();
  const rc = isLight ? GATE_RESOLVED_LIGHT[type] : GATE_RESOLVED_DARK[type];

  return (
    <div ref={dragRef} className={`relative flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 border w-full group ${isDragging ? 'opacity-40 scale-95 shadow-none' : 'hover:scale-[1.01] hover:shadow-xl'}`}
         style={{
           background: isLight
             ? `color-mix(in srgb, ${rc}, white 88%)`
             : `color-mix(in srgb, ${rc}, var(--c-surface) 92%)`,
           borderColor: isLight
             ? `color-mix(in srgb, ${rc}, transparent 40%)`
             : `color-mix(in srgb, ${rc}, transparent 60%)`,
           boxShadow: isDragging ? 'none' : isLight
             ? `0 2px 8px color-mix(in srgb, ${rc}, transparent 82%)`
             : `0 4px 12px color-mix(in srgb, ${rc}, transparent 95%)`
         }}>
      <div className="flex-shrink-0 w-9 h-6 flex items-center justify-center">
        <GateSVG type={type} color={rc} />
      </div>
        <div className="flex flex-col min-w-0">
          <p className="font-black text-sm leading-none tracking-wide" style={{ color: rc }}>{cfg.label}</p>
        </div>
      <div className="ml-auto flex flex-col gap-0.5 opacity-30 group-hover:opacity-60">
        {[0, 1, 2].map(i => <div key={i} className="flex gap-0.5">{[0, 1].map(j => <div key={j} className="w-[3px] h-[3px] rounded-full bg-slate-400" />)}</div>)}
      </div>
      {/* Tooltip — above on desktop (to avoid canvas clipping) */}
      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-2 rounded-xl text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-2xl backdrop-blur-md"
        style={{ 
          background: 'var(--c-bg-glass)', 
          border: `1.5px solid ${rc}`, 
          color: rc,
          boxShadow: `0 10px 30px -5px color-mix(in srgb, ${rc}, transparent 80%)`
        }}>
        <div className="font-black uppercase tracking-widest text-[9px] mb-1 opacity-60 text-center">Logic Help</div>
        {cfg.hint}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1.5 w-2.5 h-2.5 rotate-45 border-b border-r"
          style={{ background: 'var(--c-bg-glass)', borderColor: rc }} />
      </div>
    </div>
  );
};


/* ── Mobile icon chip (tap-select) ──────────────────────── */
const MobileGateChip = ({ type, cfg, isSelected, onSelect }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'NEW_GATE',
    item: { type },
    collect: (m) => ({ isDragging: !!m.isDragging() }),
  }), [type]);

  return (
    <div
      ref={dragRef}
      className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl cursor-grab select-none transition-all duration-150 active:scale-95"
      style={{
        opacity: isDragging ? 0.4 : 1,
        background: isSelected ? `color-mix(in srgb, ${cfg.color}, var(--c-surface) 85%)` : 'var(--c-surface-2)',
        border: `1px solid ${isSelected ? cfg.color : 'var(--c-border-dim)'}`,
        boxShadow: isSelected ? `0 0 10px color-mix(in srgb, ${cfg.color}, transparent 70%)` : 'none',
      }}
      onClick={() => {
        triggerFeedback('click');
        onSelect(isSelected ? null : type);
      }}
    >
      <div className="w-8 h-5 flex items-center justify-center">
        <GateSVG type={type} color={cfg.color} size={28} />
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: isSelected ? cfg.color : 'var(--c-text-muted)' }}>
        {cfg.label}
      </span>
    </div>
  );
};

/* ── Separator label used only on desktop ── */
const SectionHeader = ({ label }) => (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-[1px]" style={{ background: 'var(--c-border-dim)' }} />
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--c-text-dim)' }}>{label}</span>
          <div className="flex-1 h-[1px]" style={{ background: 'var(--c-border-dim)' }} />
        </div>
);

const ALL_TYPES = ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];

/* ── Toolbar ─────────────────────────────────────────────── */
const Toolbar = () => {
  const [selected, setSelected] = useState(null);
  const selCfg = selected ? GATE_CONFIGS[selected] : null;
  const BASIC_TYPES = ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'];
  const ADVANCED_TYPES = ['NAND', 'NOR', 'XOR', 'XNOR'];

  return (
    <aside className="w-full lg:w-48 xl:w-56 h-full flex flex-col p-4 overflow-y-auto hidden-scrollbar"
           style={{ borderRight: '1px solid var(--c-border-dim)', background: 'transparent' }}>
      
      <div className="mb-6 flex items-center gap-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--neon-blue)' }}>Components</h2>
        {/* Help tooltip */}
        <div className="relative group ml-auto">
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center cursor-help text-[9px] font-black select-none transition-colors"
            style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border-dim)', color: 'var(--c-text-muted)' }}
          >
            ?
          </div>
          {/* Tooltip — appears below, aligned to the right edge */}
          <div
            className="absolute right-0 top-full mt-2 w-44 px-3 py-2 rounded-xl text-[10px] leading-relaxed font-medium
                       opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[9999] shadow-2xl"
            style={{
              background: 'var(--c-surface)',
              border: '1px solid var(--c-border)',
              color: 'var(--c-text-muted)',
              backdropFilter: 'blur(8px)',
            }}
          >
            💡 Drag gates to canvas. Click pins to wire them.
            {/* Arrow pointing up */}
            <div
              className="absolute bottom-full right-1.5 -translate-y-[-2px] w-2.5 h-2.5 rotate-45 border-t border-l"
              style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
            />
          </div>
        </div>
      </div>

      {/* ── MOBILE: 2-row chip grid + info strip ── */}
      <div className="lg:hidden flex flex-col gap-2.5">
        {/* Row 1: Basic */}
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black uppercase tracking-widest px-1 opacity-40">Basic</span>
          <div className="grid grid-cols-5 gap-1.5 px-0.5">
            {BASIC_TYPES.map(type => (
              <MobileGateChip
                key={type}
                type={type}
                cfg={GATE_CONFIGS[type]}
                isSelected={selected === type}
                onSelect={setSelected}
              />
            ))}
          </div>
        </div>

        {/* Row 2: Advanced */}
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black uppercase tracking-widest px-1 opacity-40">Advanced</span>
          <div className="grid grid-cols-4 gap-1.5 px-0.5">
            {ADVANCED_TYPES.map(type => (
              <MobileGateChip
                key={type}
                type={type}
                cfg={GATE_CONFIGS[type]}
                isSelected={selected === type}
                onSelect={setSelected}
              />
            ))}
          </div>
        </div>

        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: selCfg ? '72px' : '0px', opacity: selCfg ? 1 : 0 }}
        >
          {selCfg && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: `color-mix(in srgb, ${selCfg.color}, var(--c-surface) 90%)`, border: `1px solid ${selCfg.color}55` }}>
              <div className="w-9 h-6 flex-shrink-0 flex items-center justify-center">
                <GateSVG type={selected} color={selCfg.color} size={32} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black" style={{ color: selCfg.color }}>{selCfg.label}</span>
                <span className="text-[11px] text-slate-400 leading-snug">{selCfg.hint}</span>
              </div>
              <span className="text-[9px] text-slate-500 ml-auto flex-shrink-0">drag to canvas →</span>
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP: vertical card list ── */}
      <div className="hidden lg:flex flex-col gap-2">
        <SectionHeader label="I/O" />
        <DesktopGateCard type="INPUT" cfg={GATE_CONFIGS.INPUT} />
        <DesktopGateCard type="OUTPUT" cfg={GATE_CONFIGS.OUTPUT} />

        <SectionHeader label="Basic" />
        <DesktopGateCard type="AND" cfg={GATE_CONFIGS.AND} />
        <DesktopGateCard type="OR" cfg={GATE_CONFIGS.OR} />
        <DesktopGateCard type="NOT" cfg={GATE_CONFIGS.NOT} />

        <SectionHeader label="Advanced" />
        <DesktopGateCard type="NAND" cfg={GATE_CONFIGS.NAND} />
        <DesktopGateCard type="NOR" cfg={GATE_CONFIGS.NOR} />
        <DesktopGateCard type="XOR" cfg={GATE_CONFIGS.XOR} />
        <DesktopGateCard type="XNOR" cfg={GATE_CONFIGS.XNOR} />
      </div>


    </aside>
  );
};

export default Toolbar;
