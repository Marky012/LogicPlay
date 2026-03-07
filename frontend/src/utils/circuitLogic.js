// Checks if a circuit is fully connected
export const validateCircuitConnections = (gates, wires) => {
    let isValid = true;
    const errors = [];
  
    gates.forEach(gate => {
      // Logic for checking if gate inputs/outputs are connected
      const connectedInputs = wires.filter(w => w.toGateId === gate.id);
      const connectedOutputs = wires.filter(w => w.fromGateId === gate.id);
  
      const expectedInputs = gate.type === 'NOT' ? 1 : 2;
  
      if (connectedInputs.length < expectedInputs) {
        isValid = false;
        errors.push(`${gate.type} gate ${gate.id} is missing input connections.`);
      }
    }); // Output connection strictly isn't always required (it might be the final output probe later)
  
    return { isValid, errors };
  };
  
  export const evaluateCircuit = (gates, wires) => {
    // Placeholder evaluation
    return { score: 0, feedback: "Evaluation logic in Phase 4" };
  };
