import React from 'react';
import { useDrag } from 'react-dnd';

const ToolbarGate = ({ type, label }) => {
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
    INPUT: 'bg-yellow-600 border-yellow-800',
    OUTPUT: 'bg-red-600 border-red-800',
  };

  return (
    <div
      ref={dragRef}
      className={`${gateColors[type]} border-2 rounded p-3 text-center text-white font-bold cursor-grab mb-3 hover:opacity-80 transition`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {label || type}
    </div>
  );
};

const Toolbar = () => {
  return (
    <div className="w-64 bg-surface rounded-lg shadow-lg p-4 flex flex-col gap-2 overflow-y-auto">
      <h2 className="text-xl font-bold mb-2 border-b border-gray-700 pb-2">I/O</h2>
      <ToolbarGate type="INPUT" label="Input Switch" />
      <ToolbarGate type="OUTPUT" label="Output Probe" />

      <h2 className="text-xl font-bold mt-2 mb-2 border-b border-gray-700 pb-2">Logic Gates</h2>
      <ToolbarGate type="AND" />
      <ToolbarGate type="OR" />
      <ToolbarGate type="NOT" />
    </div>
  );
};

export default Toolbar;
