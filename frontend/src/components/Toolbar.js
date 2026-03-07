import React from 'react';
import { useDrag } from 'react-dnd';

const ToolbarGate = ({ type }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'NEW_GATE',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [type]);

  const gateColors = {
    AND: 'bg-blue-600 border-blue-800',
    OR: 'bg-green-600 border-green-800',
    NOT: 'bg-purple-600 border-purple-800',
  };

  return (
    <div
      ref={dragRef}
      className={`${gateColors[type]} border-2 rounded p-3 text-center text-white font-bold cursor-grab mb-3 hover:opacity-80 transition`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {type}
    </div>
  );
};

const Toolbar = () => {
  return (
    <div className="w-64 bg-surface rounded-lg shadow-lg p-4 flex flex-col gap-2">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Logic Gates</h2>
      <p className="text-gray-400 text-sm mb-4">Drag gates onto the canvas.</p>
      
      <ToolbarGate type="AND" />
      <ToolbarGate type="OR" />
      <ToolbarGate type="NOT" />
    </div>
  );
};

export default Toolbar;
