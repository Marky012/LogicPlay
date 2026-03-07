import React, { useState, useContext } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AuthContext } from '../context/AuthContext';
import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';
import { validateCircuitConnections } from '../utils/circuitLogic';
import { saveCircuit } from '../utils/api';

const Playground = () => {
  const { user, logout } = useContext(AuthContext);
  const [gates, setGates] = useState([]);
  const [wires, setWires] = useState([]);
  const [feedback, setFeedback] = useState('');

  const handleGrade = () => {
     const validation = validateCircuitConnections(gates, wires);
     if (!validation.isValid) {
         setFeedback('Error: ' + validation.errors.join(' '));
     } else {
         setFeedback('Circuit structure is valid! (Logic evaluation coming in Phase 4)');
     }
  };

  const handleSave = async () => {
      try {
         const circuitData = {
            circuit_data: { gates, wires, name: "New Circuit" },
            score: 0,
            feedback: "Saved"
         };
         // We don't have user ID in context, mock it or use an endpoint change later.
         await saveCircuit(circuitData, 1);
         setFeedback('Circuit saved successfully!');
      } catch (e) {
         setFeedback('Failed to save circuit.');
      }
  };

  const clearCanvas = () => {
      setGates([]);
      setWires([]);
      setFeedback('');
  };

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col min-h-screen">
        <header className="bg-surface p-4 flex justify-between items-center shadow-md z-10">
          <h1 className="text-2xl font-bold text-primary">LogicPlay</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, <span className="font-semibold text-white">{user.username}</span></span>
            <button onClick={logout} className="btn-secondary text-sm">Logout</button>
          </div>
        </header>
        
        <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 bg-background">
          <Toolbar />
          
          <Canvas 
            gates={gates} 
            setGates={setGates} 
            wires={wires} 
            setWires={setWires} 
          />
          
          <div className="w-full md:w-80 bg-surface rounded-lg shadow-lg p-4 flex flex-col gap-4">
             <h2 className="text-xl font-bold border-b border-gray-700 pb-2">Properties & Controls</h2>
             
             <div className="flex flex-col gap-2 mb-4 text-sm bg-gray-800 p-3 rounded">
                <p>Gates: <span className="font-bold text-primary">{gates.length}</span></p>
                <p>Wires: <span className="font-bold text-secondary">{wires.length}</span></p>
             </div>

             <button onClick={handleGrade} className="btn-primary w-full py-3 text-lg shadow-lg hover:shadow-xl transition-all">
                Grade Circuit
             </button>
             
             <button onClick={handleSave} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors w-full">
                Save Circuit
             </button>

             <button onClick={clearCanvas} className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors w-full mt-auto">
                Clear Canvas
             </button>
             
             {feedback && (
                <div className="mt-4 p-3 bg-gray-700 border-l-4 border-yellow-500 rounded text-sm text-yellow-100">
                   {feedback}
                </div>
             )}
          </div>
        </main>
      </div>
    </DndProvider>
  );
};

export default Playground;
