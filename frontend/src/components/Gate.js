import React from 'react';
import { useDrag } from 'react-dnd';

const Gate = ({ id, type, x, y, state, onPinClick, onToggleState, computedValue }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'GATE',
    item: { id, type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [id, type]);

  const gateColors = {
    AND: 'bg-blue-600 border-blue-800',
    OR: 'bg-green-600 border-green-800',
    NOT: 'bg-purple-600 border-purple-800',
    INPUT: 'bg-yellow-600 border-yellow-800',
    OUTPUT: 'bg-red-600 border-red-800',
  };

  const getPins = () => {
    switch (type) {
      case 'INPUT': return { in: 0, out: 1 };
      case 'OUTPUT': return { in: 1, out: 0 };
      case 'NOT': return { in: 1, out: 1 };
      default: return { in: 2, out: 1 }; // AND, OR
    }
  };

  const pins = getPins();

  // Render specific UI based on type
  const renderContent = () => {
    if (type === 'INPUT') {
        const isActive = state === 1;
        return (
            <div 
                className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-colors ${isActive ? 'bg-green-400 border-green-200' : 'bg-gray-700 border-gray-500'}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleState && onToggleState(id);
                }}
            >
                <span className="block text-center text-xs mt-1.5 font-bold text-white selection:bg-transparent">{isActive ? '1' : '0'}</span>
            </div>
        );
    }
    
    if (type === 'OUTPUT') {
        const isActive = computedValue === 1;
        return (
            <div className={`w-10 h-10 rounded-full border-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors ${isActive ? 'bg-red-500 border-red-300 shadow-red-500' : 'bg-gray-800 border-gray-600'}`}>
            </div>
        );
    }

    return <span className="text-white font-bold select-none">{type}</span>;
  };

  return (
    <div
      ref={dragRef}
      className={`absolute shadow-lg rounded-md border-2 ${gateColors[type]} flex items-center justify-center`}
      style={{
        left: x,
        top: y,
        width: type === 'INPUT' || type === 'OUTPUT' ? 60 : 80,
        height: 50,
        opacity: isDragging ? 0.5 : 1,
        cursor: type === 'INPUT' ? 'pointer' : 'grab',
      }}
    >
      {renderContent()}

      {/* Input Pins */}
      {pins.in > 0 && (
          <div className="absolute -left-3 flex flex-col justify-around h-full py-1">
            {Array.from({ length: pins.in }).map((_, i) => (
              <div
                key={`in-${i}`}
                className="w-3 h-3 bg-gray-300 rounded-full cursor-pointer hover:bg-yellow-400 border border-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onPinClick(id, `in-${i}`, 'input');
                }}
              />
            ))}
          </div>
      )}

      {/* Output Pin */}
      {pins.out > 0 && (
          <div className="absolute -right-3 flex flex-col justify-around h-full py-1">
            <div
              className="w-3 h-3 bg-gray-300 rounded-full cursor-pointer hover:bg-yellow-400 border border-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                onPinClick(id, 'out-0', 'output');
              }}
            />
          </div>
      )}
    </div>
  );
};

export default Gate;
