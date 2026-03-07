// Check if a circuit is fully connected (no empty inputs where required)
export const validateCircuitConnections = (gates, wires) => {
    let isValid = true;
    const errors = [];
  
    gates.forEach(gate => {
      if (gate.type === 'INPUT' || gate.type === 'OUTPUT') return;

      const connectedInputs = wires.filter(w => w.toGateId === gate.id);
      const expectedInputs = gate.type === 'NOT' ? 1 : 2;
  
      if (connectedInputs.length < expectedInputs) {
        isValid = false;
        errors.push(`${gate.type} gate is missing input connections.`);
      }
    });
  
    return { isValid, errors };
};

// Evaluate a single gate's output based on its inputs
export const evaluateGate = (type, inputs) => {
    // Inputs is an array of 0s and 1s
    if (inputs.includes(null) || inputs.includes(undefined)) return null;

    switch (type) {
        case 'AND': return inputs.every(val => val === 1) ? 1 : 0;
        case 'OR': return inputs.some(val => val === 1) ? 1 : 0;
        case 'NOT': return inputs[0] === 1 ? 0 : 1;
        case 'INPUT': return inputs[0]; // Input gates just pass their state
        case 'OUTPUT': return inputs[0]; // Output probes just display their input
        default: return null;
    }
};
  
// Evaluate the whole circuit from inputs to outputs
export const evaluateCircuit = (gates, wires) => {
    const gateValues = {}; // Store known output values of gates
    
    // Initialize INPUT gate values
    gates.forEach(g => {
        if (g.type === 'INPUT') {
            gateValues[g.id] = g.state || 0;
        }
    });

    let progress = true;
    let cycles = 0;
    const MAX_CYCLES = gates.length * 2; // Prevent infinite loops in cyclic circuits

    while (progress && cycles < MAX_CYCLES) {
        progress = false;
        cycles++;

        gates.forEach(gate => {
            // Skip if this gate already has a known output value that hasn't changed (optimization possible, but we'll re-eval for simplicity)
            if (gate.type === 'INPUT') return;

            // Find all wires going INTO this gate
            const incomingWires = wires.filter(w => w.toGateId === gate.id);
            const expectedInputs = gate.type === 'NOT' || gate.type === 'OUTPUT' ? 1 : 2;

            if (incomingWires.length === expectedInputs) {
                // Get the values from the gates those wires come from
                const inputValues = incomingWires.map(w => gateValues[w.fromGateId]);
                
                // If all inputs are known, evaluate this gate
                if (!inputValues.includes(undefined) && !inputValues.includes(null)) {
                    const newValue = evaluateGate(gate.type, inputValues);
                    if (gateValues[gate.id] !== newValue) {
                        gateValues[gate.id] = newValue;
                        progress = true; // We learned something new, keep iterating
                    }
                }
            }
        });
    }

    // Prepare active wires array for animation
    const activeWires = wires.map(w => ({
        ...w,
        value: gateValues[w.fromGateId]
    }));

    // Find OUTPUT probes to determine score/success
    const outputs = gates.filter(g => g.type === 'OUTPUT');
    const outputResults = outputs.map(o => ({
        id: o.id,
        value: gateValues[o.id] !== undefined ? gateValues[o.id] : null
    }));

    return { 
        gateValues,
        activeWires,
        outputResults,
        score: outputs.length > 0 && outputResults.every(o => o.value === 1) ? 100 : 50,
        feedback: "Evaluated locally based on rule logic" 
    };
};
