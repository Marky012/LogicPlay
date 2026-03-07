import React, { useState, useContext, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AuthContext } from '../context/AuthContext';
import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';
import { validateCircuitConnections, evaluateCircuit } from '../utils/circuitLogic';
import { saveCircuit } from '../utils/api';

const Playground = () => {
  const { user, logout } = useContext(AuthContext);
  const [gates, setGates] = useState([]);
  const [wires, setWires] = useState([]);
  const [activeWires, setActiveWires] = useState(null);
  const [computedGateValues, setComputedGateValues] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const evalIntervalRef = useRef(null);

  const startSimulation = () => {
    setIsPlaying(true);
    setFeedback('Simulation running...');
    
    // Evaluate logic constraints roughly 10x per sec
    evalIntervalRef.current = setInterval(() => {
        // Evaluate logic tree
        const result = evaluateCircuit(gates, wires);
        setActiveWires(result.activeWires);
        setComputedGateValues(result.gateValues);
    }, 100);
  };

  const stopSimulation = () => {
    setIsPlaying(false);
    clearInterval(evalIntervalRef.current);
    setActiveWires(null);
    setComputedGateValues(null);
    setFeedback('Simulation stopped.');
  };

  // Cleanup on unmount
  useEffect(() => {
      return () => clearInterval(evalIntervalRef.current);
  }, []);

  const handleGateStateToggle = (gateId) => {
     setGates(prev => prev.map(g => {
         if (g.id === gateId && g.type === 'INPUT') {
             return { ...g, state: g.state === 1 ? 0 : 1 };
         }
         return g;
     }));
  };

  const handleGrade = () => {
     const validation = validateCircuitConnections(gates, wires);
     if (!validation.isValid) {
         setFeedback('Error: ' + validation.errors.join(' '));
         return;
     } 
     
     const evalResult = evaluateCircuit(gates, wires);
     if (evalResult.score === 100) {
         setFeedback('Circuit successfully evaluated to HIGH output(s)! Score: 100');
     } else {
         setFeedback(`Circuit is correct structurally. Note: Output is not HIGH. Local Eval Score: ${evalResult.score}`);
     }
  };

  const handleSave = async () => {
      try {
         const circuitData = {
            circuit_data: { gates, wires, name: "New Circuit" },
            score: evaluateCircuit(gates, wires).score,
            feedback: "Saved"
         };
         // Mock user_id as 1, assuming first registered user for now without JWT payload details
         await saveCircuit(circuitData, 1);
         setFeedback('Circuit saved successfully!');
      } catch (e) {
         setFeedback('Failed to save circuit. ' + (e.message || ''));
      }
  };

  const clearCanvas = () => {
      setGates([]);
      setWires([]);
      setActiveWires(null);
      setComputedGateValues(null);
      setFeedback('');
      if (isPlaying) stopSimulation();
  };

  if (!user) {
    return <div className="p-8 text-white">Please log in to play.</div>;
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
            onGateStateToggle={handleGateStateToggle}
            activeWires={activeWires}
            computedGateValues={computedGateValues}
          />
          
          <div className="w-full md:w-80 bg-surface rounded-lg shadow-lg p-4 flex flex-col gap-4">
             <h2 className="text-xl font-bold border-b border-gray-700 pb-2">Properties & Controls</h2>
             
             <div className="flex flex-col gap-2 mb-4 text-sm bg-gray-800 p-3 rounded">
                <p>Gates: <span className="font-bold text-primary">{gates.length}</span></p>
                <p>Wires: <span className="font-bold text-secondary">{wires.length}</span></p>
             </div>

             <div className="flex gap-2">
                 <button 
                    onClick={isPlaying ? stopSimulation : startSimulation} 
                    className={`flex-1 font-bold py-2 px-4 rounded transition-colors ${isPlaying ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                 >
                    {isPlaying ? 'Stop Sim' : 'Play Sim'}
                 </button>
             </div>

             <button onClick={handleGrade} className="btn-primary w-full py-3 text-lg shadow-lg hover:shadow-xl transition-all">
                Grade Circuit (Local)
             </button>
             
             <button onClick={handleSave} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors w-full">
                Save Circuit
             </button>

             <button onClick={clearCanvas} className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors w-full mt-auto">
                Clear Canvas
             </button>
             
             {feedback && (
                <div className="mt-4 p-3 bg-gray-700 border-l-4 border-yellow-500 rounded text-sm text-yellow-100 break-words">
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
