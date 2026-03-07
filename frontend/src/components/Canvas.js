import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import Gate from './Gate';
import p5 from 'p5';
import { sketch } from '../utils/animation';

const Canvas = ({ gates, setGates, wires, setWires, onGateStateToggle, activeWires, computedGateValues }) => {
  const canvasRef = useRef(null);
  const p5ContainerRef = useRef(null);
  const sketchRef = useRef(null);
  const [drawingWire, setDrawingWire] = useState(null);

  // Initialize p5
  useEffect(() => {
     let p5Instance = new p5(sketch, p5ContainerRef.current);
     sketchRef.current = p5Instance;
     
     return () => {
        p5Instance.remove();
     };
  }, []);

  // Update p5 data when wires array or gates change
  useEffect(() => {
     if (sketchRef.current && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        
        // Map active wires to physical coordinates
        const physicalWires = (activeWires || wires).map(wire => {
           const fromGate = gates.find(g => g.id === wire.fromGateId);
           const toGate = gates.find(g => g.id === wire.toGateId);
           
           if (!fromGate || !toGate) return null;

           return {
               ...wire,
               x1: fromGate.x + (fromGate.type === 'INPUT' || fromGate.type === 'OUTPUT' ? 60 : 80),
               y1: fromGate.y + 25,
               x2: toGate.x,
               y2: toGate.y + 25,
           };
        }).filter(w => w !== null);

        sketchRef.current.updateData({
            wires: physicalWires,
            rect: { width: rect.width, height: rect.height }
        });
     }
  }, [wires, gates, activeWires]);

  const [, dropRef] = useDrop(() => ({
    accept: ['NEW_GATE', 'GATE'],
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      const x = offset.x - canvasRect.left;
      const y = offset.y - canvasRect.top;

      if (item.type === 'NEW_GATE') {
        const newGate = {
          id: `gate_${Date.now()}`,
          type: item.type, // BUG: item.item.type in a real implementation probably, but useDrag passes `item: { type }` correctly
          x,
          y
        };
        // Fix for react-dnd passing format depending on how we structured the drag item
        const gateType = item.type === 'NEW_GATE' ? item.item?.type || item.type : item.type;
        
        if (item.type === 'NEW_GATE') {
           setGates(prev => [...prev, { id: `gate_${Date.now()}`, type: item.type === 'NEW_GATE' ? item.item?.type || (item.id ? '' : item.type) : item.type, x, y }]);
           // The structure passed from Toolbar is { type } not { item: { type } }
        }
      } else {
        // Move existing gate
        setGates(prev => prev.map(g => 
          g.id === item.id ? { ...g, x, y } : g
        ));
      }
    },
  }), [gates]);

  // Handle pin clicks for wiring
  const handlePinClick = (gateId, pinId, pinType) => {
    if (!drawingWire) {
      setDrawingWire({ gateId, pinId, pinType });
    } else {
      // Complete the wire if types are different (input to output or output to input)
      if (drawingWire.pinType !== pinType && drawingWire.gateId !== gateId) {
        const fromPin = drawingWire.pinType === 'output' ? drawingWire : { gateId, pinId, pinType };
        const toPin = drawingWire.pinType === 'input' ? drawingWire : { gateId, pinId, pinType };
        
        const newWire = {
          id: `wire_${Date.now()}`,
          fromGateId: fromPin.gateId,
          fromPin: fromPin.pinId,
          toGateId: toPin.gateId,
          toPin: toPin.pinId
        };
        
        setWires(prev => [...prev, newWire]);
      }
      setDrawingWire(null);
    }
  };

  // Render SVG lines for wires
  const renderWires = () => {
     return wires.map(wire => {
        // Highly simplified coordinate calculation for prototype
        const fromGate = gates.find(g => g.id === wire.fromGateId);
        const toGate = gates.find(g => g.id === wire.toGateId);
        
        if (!fromGate || !toGate) return null;

        // Base off rough button placements in Gate.js
        const x1 = fromGate.x + 80;
        const y1 = fromGate.y + 25;
        const x2 = toGate.x;
        const y2 = toGate.y + 25;

        const wireColor = wire.value === 1 ? 'red' : wire.value === 0 ? 'blue' : 'white';

        return (
          <path
            key={wire.id}
            d={`M ${x1} ${y1} C ${x1 + 40} ${y1}, ${x2 - 40} ${y2}, ${x2} ${y2}`}
            fill="transparent"
            stroke={wireColor}
            strokeWidth="3"
            className="cursor-pointer hover:stroke-yellow-400"
            onClick={() => setWires(prev => prev.filter(w => w.id !== wire.id))} // Click to delete
          />
        );
     });
  };

  return (
    <div 
      ref={(node) => {
        dropRef(node);
        canvasRef.current = node;
      }}
      className="flex-1 bg-gray-900 rounded-lg shadow-inner border-2 border-gray-700 relative overflow-hidden"
      style={{ minHeight: '600px' }}
    >
      <div ref={p5ContainerRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" />
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
         {renderWires()}
      </svg>
      {gates.map(gate => (
        <Gate 
          key={gate.id} 
          {...gate} 
          onPinClick={handlePinClick} 
          onToggleState={onGateStateToggle}
          computedValue={computedGateValues ? computedGateValues[gate.id] : null}
        />
      ))}
      {drawingWire && (
         <div className="absolute top-4 left-4 bg-yellow-600 text-white px-3 py-1 rounded shadow-lg text-sm rounded-full z-50">
            Drawing wire from {drawingWire.gateId}... Click another pin to connect.
         </div>
      )}
    </div>
  );
};

export default Canvas;
