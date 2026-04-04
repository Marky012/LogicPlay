import React, { useState } from 'react';
import { useDrag } from 'react-dnd';

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
  INPUT: { color: '#f59e0b', label: 'Input', hint: 'Toggle HIGH/LOW signal', border: 'rgba(245,158,11,0.4)', bg: 'rgba(245,158,11,0.08)' },
  OUTPUT: { color: '#ff3366', label: 'Output', hint: 'Lights up when signal is HIGH', border: 'rgba(255,51,102,0.4)', bg: 'rgba(255,51,102,0.08)' },
  AND: { color: '#3b82f6', label: 'AND', hint: 'Out=1 only if ALL inputs are 1', border: 'rgba(59,130,246,0.4)', bg: 'rgba(59,130,246,0.08)' },
  OR: { color: '#10b981', label: 'OR', hint: 'Out=1 if ANY input is 1', border: 'rgba(16,185,129,0.4)', bg: 'rgba(16,185,129,0.08)' },
  NOT: { color: '#bf5fff', label: 'NOT', hint: 'Inverts the input signal', border: 'rgba(191,95,255,0.4)', bg: 'rgba(191,95,255,0.08)' },
  NAND: { color: '#00ffea', label: 'NAND', hint: 'NOT AND – universal gate', border: 'rgba(0,255,234,0.4)', bg: 'rgba(0,255,234,0.08)' },
  NOR: { color: '#ff6b2b', label: 'NOR', hint: 'NOT OR – universal gate', border: 'rgba(255,107,43,0.4)', bg: 'rgba(255,107,43,0.08)' },
  XOR: { color: '#b4ff00', label: 'XOR', hint: 'Out=1 if inputs DIFFER', border: 'rgba(180,255,0,0.4)', bg: 'rgba(180,255,0,0.08)' },
};

/* ── Desktop card (unchanged look) ──────────────────────── */
const DesktopGateCard = ({ type, cfg }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'NEW_GATE',
    item: { type },
    collect: (m) => ({ isDragging: !!m.isDragging() }),
  }), [type]);

  return (
    <div ref={dragRef}
      className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-grab transition-all duration-200 hover:scale-[1.02] select-none"
      style={{
        opacity: isDragging ? 0.4 : 1,
        background: cfg.bg,
        border: `1px solid ${isDragging ? cfg.color : cfg.border}`,
        boxShadow: isDragging ? `0 0 12px ${cfg.border}` : 'none',
      }}>
      <div className="flex-shrink-0 w-9 h-6 flex items-center justify-center">
        <GateSVG type={type} color={cfg.color} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold truncate" style={{ color: cfg.color }}>{cfg.label}</span>
        <span className="text-[10px] text-slate-500 truncate">{type}</span>
      </div>
      <div className="ml-auto flex flex-col gap-0.5 opacity-30 group-hover:opacity-60">
        {[0, 1, 2].map(i => <div key={i} className="flex gap-0.5">{[0, 1].map(j => <div key={j} className="w-[3px] h-[3px] rounded-full bg-slate-400" />)}</div>)}
      </div>
      {/* Tooltip — right on desktop */}
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        style={{ background: 'rgba(13,26,45,0.97)', border: `1px solid ${cfg.border}`, color: cfg.color }}>
        {cfg.hint}
        <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 rotate-45 border-b border-l"
          style={{ background: 'rgba(13,26,45,0.97)', borderColor: cfg.border }} />
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
        background: isSelected ? cfg.bg : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isSelected ? cfg.color : 'rgba(255,255,255,0.06)'}`,
        boxShadow: isSelected ? `0 0 10px ${cfg.border}` : 'none',
      }}
      onClick={() => onSelect(isSelected ? null : type)}
    >
      <div className="w-8 h-5 flex items-center justify-center">
        <GateSVG type={type} color={cfg.color} size={28} />
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: isSelected ? cfg.color : 'rgba(255,255,255,0.4)' }}>
        {cfg.label}
      </span>
    </div>
  );
};

/* ── Separator label used only on desktop ── */
const SectionHeader = ({ label }) => (
  <div className="flex items-center gap-2 mt-4 mb-2">
    <div className="flex-1 h-px" style={{ background: 'rgba(0,212,255,0.15)' }} />
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
    <div className="flex-1 h-px" style={{ background: 'rgba(0,212,255,0.15)' }} />
  </div>
);

const ALL_TYPES = ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'];

/* ── Toolbar ─────────────────────────────────────────────── */
const Toolbar = () => {
  const [selected, setSelected] = useState(null);
  const selCfg = selected ? GATE_CONFIGS[selected] : null;

  return (
    <div className="w-full flex flex-col gap-1 flex-shrink-0 pr-1 pb-2 lg:pb-4">

      {/* ── MOBILE: 4-column chip grid + info strip ── */}
      <div className="lg:hidden flex flex-col gap-2">
        {/* 4×2 grid — no scrolling needed */}
        <div className="grid grid-cols-4 gap-1.5 px-0.5">
          {ALL_TYPES.map(type => (
            <MobileGateChip
              key={type}
              type={type}
              cfg={GATE_CONFIGS[type]}
              isSelected={selected === type}
              onSelect={setSelected}
            />
          ))}
        </div>

        {/* Info strip — appears when a chip is tapped */}
        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: selCfg ? '72px' : '0px', opacity: selCfg ? 1 : 0 }}
        >
          {selCfg && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: selCfg.bg, border: `1px solid ${selCfg.color}55` }}>
              <div className="w-9 h-6 flex-shrink-0 flex items-center justify-center">
                <GateSVG type={selected} color={selCfg.color} size={32} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black" style={{ color: selCfg.color }}>{selCfg.label} <span className="opacity-50 font-mono">({selected})</span></span>
                <span className="text-[11px] text-slate-400 leading-snug">{selCfg.hint}</span>
              </div>
              <span className="text-[9px] text-slate-500 ml-auto flex-shrink-0">drag to canvas →</span>
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP: vertical card list ── */}
      <div className="hidden lg:flex flex-col gap-2">
        <h2 className="text-xs font-black uppercase tracking-widest mb-1 flex-shrink-0" style={{ color: 'var(--neon-blue)' }}>
          Components
        </h2>

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

        <div className="mt-2 mx-1 px-3 py-2 rounded-lg text-[10px] text-slate-500 leading-relaxed"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
          💡 Drag gates to canvas. Click pins to wire them.
        </div>
      </div>

    </div>
  );
};

export default Toolbar;
