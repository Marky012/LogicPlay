import React from 'react';
import { useDrag } from 'react-dnd';

const Gate = ({ id, type, x, y, onPinClick }) => {
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
  };

  const getPins = () => {
    switch (type) {
      case 'NOT':
        return { in: 1, out: 1 };
      default:
        return { in: 2, out: 1 };
    }
  };

  const pins = getPins();

  return (
    <div
      ref={dragRef}
      className={`absolute shadow-lg rounded-md border-2 ${gateColors[type]} flex items-center justify-center`}
      style={{
        left: x,
        top: y,
        width: 80,
        height: 50,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
      }}
    >
      <span className="text-white font-bold select-none">{type}</span>

      {/* Input Pins */}
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

      {/* Output Pin */}
      <div className="absolute -right-3 flex flex-col justify-around h-full py-1">
        <div
          className="w-3 h-3 bg-gray-300 rounded-full cursor-pointer hover:bg-yellow-400 border border-gray-600"
          onClick={(e) => {
            e.stopPropagation();
            onPinClick(id, 'out-0', 'output');
          }}
        />
      </div>
    </div>
  );
};

export default Gate;
