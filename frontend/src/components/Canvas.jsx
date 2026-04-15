import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import Gate from './Gate';
import ConfirmModal from './ConfirmModal';
import { useTheme } from '../context/ThemeContext';
import { triggerFeedback } from '../utils/feedback';
import p5 from 'p5';
import { sketch } from '../utils/animation';

/* ── Gate dimensions (must match Gate.jsx GATE_CONFIGS) ── */
const GATE_W = { AND:72, OR:72, NOT:66, NAND:72, NOR:72, XOR:72, XNOR:72, INPUT:58, OUTPUT:58 };
const GATE_H = 52; // all gates share the same height
const PIN_R  = 6;  // half of w-3 (12px) dot
const PIN_OFFSET = 10; // Gate uses left:-10 / right:-10

/**
 * Returns the canvas-relative center {x, y} of a gate pin.
 * pinId: 'out-0' | 'in-0' | 'in-1'
 */
const pinCenter = (gate, pinId) => {
  const w = GATE_W[gate.type] || 72;
  const pinCount = (gate.type === 'NOT' || gate.type === 'OUTPUT') ? 1
                 : (gate.type === 'INPUT') ? 0 : 2; // input-side count

  if (pinId === 'out-0') {
    // right: -PIN_OFFSET → right outer edge = gate.x + w + PIN_OFFSET
    // pin circle is PIN_R*2 wide, right-aligned → left edge = gate.x + w + PIN_OFFSET - PIN_R*2
    return { x: gate.x + w + PIN_OFFSET - PIN_R, y: gate.y + GATE_H / 2 };
  }

  // input pins — left: -PIN_OFFSET, stacked with justify-around + py-1.5 (6px)
  const idx    = parseInt(pinId.replace('in-', ''), 10);
  const padY   = 6; // py-1.5 ≈ 6px
  const usable = GATE_H - padY * 2;
  const n      = pinCount || 1;
  // justify-around: spacing = usable/(n), center of i-th = padY + spacing*(i+0.5)
  const spacing = usable / n;
  const cy      = gate.y + padY + spacing * (idx + 0.5);
  // left: -PIN_OFFSET → left outer edge = gate.x - PIN_OFFSET → center = gate.x - PIN_OFFSET + PIN_R
  return { x: gate.x - PIN_OFFSET + PIN_R, y: cy };
};

const Canvas = ({ gates, setGates, wires, setWires, onGateStateToggle, activeWires, computedGateValues, resetViewTrigger, isReadOnly, showBinaryOutput }) => {
  const { theme } = useTheme();
  const canvasRef      = useRef(null);
  const p5ContainerRef = useRef(null);
  const sketchRef      = useRef(null);
  const [drawingWire, setDrawingWire] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [wireToDelete, setWireToDelete] = useState(null);
  const [showOutputToOutputModal, setShowOutputToOutputModal] = useState(false);
  const [showInputToInputModal, setShowInputToInputModal] = useState(false);
  const [showInputLimitModal, setShowInputLimitModal] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Keep live refs so event handlers always read current values (avoids stale closures)
  const scaleRef = useRef(scale);
  const panRef   = useRef(pan);
  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { panRef.current   = pan;   }, [pan]);

  useEffect(() => {
    if (resetViewTrigger > 0) {
      setScale(1);
      setPan({ x: 0, y: 0 });
    }
  }, [resetViewTrigger]);

  /* ── Zoom and Pan Handlers ── */
  const touchStateRef = useRef({
    isPinch: false,
    isTouchPan: false,
    initialPinchDist: 0,
    initialScale: 1,
    pinchCenter: { x: 0, y: 0 },
    initialPan: { x: 0, y: 0 },
    touchPanStart: { x: 0, y: 0 }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const currentScale = scaleRef.current;
      const currentPan   = panRef.current;
      const zoomSensitivity = 0.002;
      const delta    = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(0.2, currentScale + delta), 3);

      const rect   = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const ratio   = newScale / currentScale;
      const newPanX = mouseX - (mouseX - currentPan.x) * ratio;
      const newPanY = mouseY - (mouseY - currentPan.y) * ratio;

      setScale(newScale);
      setPan({ x: newPanX, y: newPanY });
    };

    const handleTouchStart = (e) => {
      // Only initiate pan/pinch from the canvas background, not from gate elements
      const isGateElement = e.target.closest && e.target.closest('.gate-element');
      const st = touchStateRef.current;

      if (e.touches.length === 2) {
        e.preventDefault();
        st.isPinch = true;
        st.isTouchPan = false;

        const t1 = e.touches[0];
        const t2 = e.touches[1];
        st.initialPinchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        st.initialScale = scaleRef.current;

        const rect = canvas.getBoundingClientRect();
        st.pinchCenter = {
          x: (t1.clientX + t2.clientX) / 2 - rect.left,
          y: (t1.clientY + t2.clientY) / 2 - rect.top,
        };
        st.initialPan = { ...panRef.current };
      } else if (e.touches.length === 1 && !isGateElement) {
        st.isTouchPan = true;
        const currentPan = panRef.current;
        st.touchPanStart = { x: e.touches[0].clientX - currentPan.x, y: e.touches[0].clientY - currentPan.y };
      }
    };

    const handleTouchMove = (e) => {
      const st = touchStateRef.current;
      if (st.isPinch && e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

        const zoomFactor = currentDist / st.initialPinchDist;
        const newScale   = Math.min(Math.max(0.2, st.initialScale * zoomFactor), 3);

        const ratio   = newScale / st.initialScale;
        const newPanX = st.pinchCenter.x - (st.pinchCenter.x - st.initialPan.x) * ratio;
        const newPanY = st.pinchCenter.y - (st.pinchCenter.y - st.initialPan.y) * ratio;

        setScale(newScale);
        setPan({ x: newPanX, y: newPanY });
      } else if (st.isTouchPan && e.touches.length === 1) {
        e.preventDefault();
        setPan({
          x: e.touches[0].clientX - st.touchPanStart.x,
          y: e.touches[0].clientY - st.touchPanStart.y,
        });
      }
    };

    const handleTouchEnd = (e) => {
      const st = touchStateRef.current;
      if (e.touches.length < 2) st.isPinch = false;
      if (e.touches.length === 0) st.isTouchPan = false;
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs once; reads live values via scaleRef/panRef

  const handleMouseDown = (e) => {
    // Only start panning when clicking the bare canvas background (not gates, pins, or buttons)
    const isInteractive = e.target.closest('button') ||
                          e.target.closest('.input-toggle') ||
                          e.target.closest('.gate-element') ||
                          e.target.closest('.wire-element');
    if (!isInteractive) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
    }
    if (drawingWire) {
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left - panRef.current.x) / scaleRef.current,
        y: (e.clientY - rect.top - panRef.current.y) / scaleRef.current,
      });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  /* ── Initialize p5 overlay ── */
  useEffect(() => {
    let p5Instance = new p5(sketch, p5ContainerRef.current);
    sketchRef.current = p5Instance;
    return () => p5Instance.remove();
  }, []);

  /* ── Update p5 wire data ── */
  useEffect(() => {
    if (sketchRef.current && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const physicalWires = (activeWires || wires).map(wire => {
        const fromGate = gates.find(g => g.id === wire.fromGateId);
        const toGate   = gates.find(g => g.id === wire.toGateId);
        if (!fromGate || !toGate) return null;
        const from = pinCenter(fromGate, wire.fromPin || 'out-0');
        const to   = pinCenter(toGate,   wire.toPin   || 'in-0');
        return { ...wire, x1: from.x, y1: from.y, x2: to.x, y2: to.y };
      }).filter(Boolean);

      sketchRef.current.updateData({
        wires: physicalWires,
        rect: { width: rect.width, height: rect.height },
        pan,
        scale,
        theme,
      });
    }
  }, [wires, gates, activeWires, pan, scale, theme]);

  /* ── Drop zone ── */
  const [, dropRef] = useDrop(() => ({
    accept: ['NEW_GATE', 'GATE'],
    canDrop: () => !isReadOnly,
    drop: (item, monitor) => {
      const offset    = monitor.getClientOffset();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = (offset.x - canvasRect.left - pan.x) / scale;
      const y = (offset.y - canvasRect.top - pan.y) / scale;
      const dragType = monitor.getItemType();

      if (dragType === 'NEW_GATE') {
        if (item.type === 'INPUT') {
          const inputCount = gates.filter(g => g.type === 'INPUT').length;
          if (inputCount >= 4) {
            triggerFeedback('error');
            setShowInputLimitModal(true);
            return;
          }
        }
        triggerFeedback('click');
        setGates(prev => [...prev, {
          id: `gate_${Date.now()}`,
          type: item.type,           // e.g. 'AND', 'INPUT', 'OUTPUT'…
          x: Math.max(10, x - 36),
          y: Math.max(10, y - 26),
          state: 0,
        }]);
      } else {
        // 'GATE' — move an existing gate
        setGates(prev => prev.map(g =>
          g.id === item.id ? { ...g, x: Math.max(10, x - 36), y: Math.max(10, y - 26) } : g
        ));
      }
    },
  }), [gates, pan, scale, isReadOnly]);

  /* ── Wire drawing ── */
  const handlePinClick = (gateId, pinId, pinType) => {
    if (!drawingWire) {
      setDrawingWire({ gateId, pinId, pinType });
    } else {
      // Prevent connecting a gate to itself
      if (drawingWire.gateId === gateId) {
        setDrawingWire(null);
        return;
      }

      // Both pins are outputs → show output-to-output warning modal
      if (drawingWire.pinType === 'output' && pinType === 'output') {
        triggerFeedback('error');
        setShowOutputToOutputModal(true);
        setDrawingWire(null);
        return;
      }

      // Both pins are inputs → show input-to-input error modal
      if (drawingWire.pinType === 'input' && pinType === 'input') {
        triggerFeedback('error');
        setShowInputToInputModal(true);
        setDrawingWire(null);
        return;
      }

      // Valid connection: one output → one input
      const fromPin = drawingWire.pinType === 'output' ? drawingWire : { gateId, pinId, pinType };
      const toPin   = drawingWire.pinType === 'input'  ? drawingWire : { gateId, pinId, pinType };

      // Toggle logic: if wire already exists, remove it; else add it.
      const existingWire = wires.find(w =>
        w.fromGateId === fromPin.gateId && w.fromPin === fromPin.pinId &&
        w.toGateId === toPin.gateId && w.toPin === toPin.pinId
      );

      if (existingWire) {
        triggerFeedback('delete');
        setWires(prev => prev.filter(w => w.id !== existingWire.id));
      } else {
        triggerFeedback('connect');
        setWires(prev => [...prev, {
          id: `wire_${Date.now()}`,
          fromGateId: fromPin.gateId, fromPin: fromPin.pinId,
          toGateId:   toPin.gateId,   toPin:   toPin.pinId,
        }]);
      }
      setDrawingWire(null);
    }
  };

  /* ── Delete gate ── */
  const handleDeleteGate = (gateId) => {
    setGates(prev => prev.filter(g => g.id !== gateId));
    setWires(prev => prev.filter(w => w.fromGateId !== gateId && w.toGateId !== gateId));
  };

  /* ── SVG wire render ── */
  const renderWires = () => wires.map(wire => {
    const fromGate = gates.find(g => g.id === wire.fromGateId);
    const toGate   = gates.find(g => g.id === wire.toGateId);
    if (!fromGate || !toGate) return null;

    const { x: x1, y: y1 } = pinCenter(fromGate, wire.fromPin || 'out-0');
    const { x: x2, y: y2 } = pinCenter(toGate,   wire.toPin   || 'in-0');

    /* Determine live value from activeWires or static wires */
    const liveWire = activeWires?.find(w => w.id === wire.id);
    const val = liveWire?.value ?? wire.value;

    const isHigh = val === 1;
    const isLow  = val === 0;
    const isLight = theme === 'light';
    const color  = isHigh ? '#39ff14' : isLow ? (isLight ? '#475569' : '#334eaa') : (isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)');
    const glow   = isHigh ? '0 0 6px #39ff14, 0 0 14px rgba(57,255,20,0.4)' : 'none';

    return (
      <g key={wire.id} className="cursor-pointer group/wire wire-element">
        {/* Hit-area (invisible thick path for easier clicking) */}
        <path
          d={`M ${x1} ${y1} C ${x1+50} ${y1}, ${x2-50} ${y2}, ${x2} ${y2}`}
          fill="transparent" stroke="transparent" strokeWidth="12"
          onClick={() => !isReadOnly && setWireToDelete(wire.id)}
        />
        {/* Visible wire */}
        <path
          d={`M ${x1} ${y1} C ${x1+50} ${y1}, ${x2-50} ${y2}, ${x2} ${y2}`}
          fill="transparent"
          stroke={color}
          strokeWidth={isHigh ? 2.5 : 1.5}
          style={{ filter: isHigh ? `drop-shadow(${glow})` : 'none', transition: 'stroke 0.3s, stroke-width 0.3s' }}
        />
      </g>
    );
  });

  return (
    <div
      ref={(node) => { dropRef(node); canvasRef.current = node; }}
      className="flex-1 canvas-grid rounded-2xl relative overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        minHeight: '600px',
        backgroundPosition: `${pan.x}px ${pan.y}px, ${pan.x}px ${pan.y}px, ${pan.x}px ${pan.y}px`,
        backgroundSize: `${112 * scale}px ${112 * scale}px, ${112 * scale}px ${112 * scale}px, ${28 * scale}px ${28 * scale}px`,
        border: drawingWire ? '2px solid var(--neon-blue)' : '2px solid var(--c-border)',
        boxShadow: drawingWire 
          ? '0 0 30px rgba(0,212,255,0.2) inset' 
          : '0 10px 40px -10px rgba(0,0,0,0.2) inset, 0 4px 6px -2px rgba(0,0,0,0.05)',
        cursor: drawingWire ? 'crosshair' : 'default',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* p5 animation overlay */}
      <div ref={p5ContainerRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" />

      {/* Wire SVG layer */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 overflow-visible">
        <g className="pointer-events-auto" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: '0 0' }}>
          {renderWires()}
          {/* Ongoing connection line */}
          {drawingWire && (() => {
            const gate = gates.find(g => g.id === drawingWire.gateId);
            if (!gate) return null;
            const start = pinCenter(gate, drawingWire.pinId);
            const isLight = theme === 'light';
            const color = isLight ? 'rgba(0,130,180,0.45)' : 'rgba(0,212,255,0.4)';
            return (
              <path
                d={`M ${start.x} ${start.y} C ${start.x + (drawingWire.pinType==='output'?50:-50)} ${start.y}, ${mousePos.x + (drawingWire.pinType==='output'?-50:50)} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            );
          })()}
        </g>
      </svg>

      {/* Gates */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-30"
           style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: '0 0' }}>
        <div className="pointer-events-auto w-full h-full relative">
          {gates.map(gate => {
            let label = null;
            if (gate.type === 'INPUT') {
              const inputGates = gates.filter(g => g.type === 'INPUT');
              const idx = inputGates.findIndex(g => g.id === gate.id);
              label = `I${idx + 1}`;
            }
            return (
              <Gate
                key={gate.id}
                {...gate}
                label={label}
                onPinClick={handlePinClick}
                onToggleState={onGateStateToggle}
                onDelete={handleDeleteGate}
                computedValue={computedGateValues ? computedGateValues[gate.id] : null}
                isReadOnly={isReadOnly}
                showBinaryOutput={showBinaryOutput}
              />
            );
          })}
        </div>
      </div>

      {/* Wire drawing indicator */}
      {drawingWire && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold z-50 animate-pulse-glow"
             style={{ background: 'var(--c-glass)', border: '1px solid rgba(0,212,255,0.5)', color: 'var(--neon-blue)' }}>
          <span className="w-2 h-2 rounded-full bg-[var(--neon-blue)] animate-pulse-glow" />
          Wiring mode — click another pin to connect
          <button className="ml-1 text-xs opacity-60 hover:opacity-100" onClick={() => setDrawingWire(null)}>✕</button>
        </div>
      )}

      {/* Empty state */}
      {gates.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <div className="text-5xl mb-3 opacity-20 animate-float">⚡</div>
          <p className="text-sm font-bold" style={{ color: 'var(--c-text-muted)' }}>Drag gates here to start building</p>
        </div>
      )}

      {/* Reset View Button */}
      <button
        className="absolute bottom-20 lg:bottom-4 right-4 flex items-center justify-center px-5 py-2.5 rounded-xl transition-all duration-200 z-50 group hover:-translate-y-0.5 hover:shadow-lg"
        style={{
          background: 'var(--c-surface)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--c-border)',
          boxShadow: '0 4px 12px var(--shadow-sm)',
          color: 'var(--neon-blue)',
          textShadow: '0 0 8px color-mix(in srgb, var(--neon-blue), transparent 70%)'
        }}
        onClick={(e) => { e.stopPropagation(); setScale(1); setPan({ x: 0, y: 0 }); }}
        title="Recenter the canvas to the default view"
      >
        <span className="text-xs font-black uppercase tracking-widest">Reset View</span>
      </button>

      {/* Wire Deletion Confirm Modal */}
      <ConfirmModal
        isOpen={!!wireToDelete}
        title="Delete Connection?"
        message="Are you sure you want to remove this wire?"
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          triggerFeedback('delete');
          setWires(prev => prev.filter(w => w.id !== wireToDelete));
          setWireToDelete(null);
        }}
        onCancel={() => setWireToDelete(null)}
      />

      {/* Output-to-Output Connection Warning */}
      <ConfirmModal
        isOpen={showOutputToOutputModal}
        title="Cannot Connect Outputs"
        message="You cannot connect an output pin directly to another output pin. Connect an output pin to an input pin of another gate instead."
        confirmLabel="Got it"
        hideCancel
        danger={false}
        onConfirm={() => { triggerFeedback('click'); setShowOutputToOutputModal(false); }}
        onCancel={() => { triggerFeedback('click'); setShowOutputToOutputModal(false); }}
      />

      {/* Input Limit Connection Error */}
      <ConfirmModal
        isOpen={showInputToInputModal}
        title="Cannot Connect Input to Input"
        message="You cannot connect an input pin to another input pin. Connect an output pin of a gate to this input pin instead."
        confirmLabel="Got it"
        hideCancel
        danger
        onConfirm={() => setShowInputToInputModal(false)}
        onCancel={() => setShowInputToInputModal(false)}
      />

      {/* Input Component Limit Modal */}
      <ConfirmModal
        isOpen={showInputLimitModal}
        title="Input Limit Reached"
        message="You can only have up to 4 input components (switches/buttons) in a single circuit. Please remove an existing input to add a new one."
        confirmLabel="Understood"
        hideCancel
        onConfirm={() => setShowInputLimitModal(false)}
        onCancel={() => setShowInputLimitModal(false)}
      />
    </div>
  );
};

export default Canvas;
