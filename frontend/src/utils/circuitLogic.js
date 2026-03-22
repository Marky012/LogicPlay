export const validateCircuitConnections = (gates, wires) => {
    let isValid = true;
    const errors = [];

    const outputs = gates.filter(g => g.type === 'OUTPUT');
    if (outputs.length === 0) {
        isValid = false;
        errors.push('Circuit must have at least one OUTPUT component.');
    }

    const inputs = gates.filter(g => g.type === 'INPUT');
    if (inputs.length === 0) {
        isValid = false;
        errors.push('Circuit must have at least one INPUT component.');
    }

    const logicGates = gates.filter(g => g.type !== 'INPUT' && g.type !== 'OUTPUT');
    if (logicGates.length === 0) {
        isValid = false;
        errors.push('Circuit must contain at least one logic gate.');
    }
  
    gates.forEach(gate => {
      if (gate.type === 'INPUT') return;
      
      const connectedInputs = wires.filter(w => w.toGateId === gate.id);
      const expectedInputs  = (gate.type === 'NOT' || gate.type === 'OUTPUT') ? 1 : 2;
  
      if (connectedInputs.length < expectedInputs) {
        isValid = false;
        errors.push(`${gate.type} gate is missing input connection(s).`);
      }
    });
  
    return { isValid, errors };
};

// Evaluate a single gate's output based on its inputs
export const evaluateGate = (type, inputs) => {
    if (inputs.includes(null) || inputs.includes(undefined)) return null;

    switch (type) {
        case 'AND':    return inputs.every(v => v === 1) ? 1 : 0;
        case 'OR':     return inputs.some(v => v === 1) ? 1 : 0;
        case 'NOT':    return inputs[0] === 1 ? 0 : 1;
        case 'NAND':   return inputs.every(v => v === 1) ? 0 : 1;
        case 'NOR':    return inputs.some(v => v === 1) ? 0 : 1;
        case 'XOR':    return inputs.reduce((a, b) => a ^ b) === 1 ? 1 : 0;
        case 'INPUT':  return inputs[0]; // pass-through state
        case 'OUTPUT': return inputs[0]; // display input
        default:       return null;
    }
};

// Evaluate the whole circuit from inputs to outputs
export const evaluateCircuit = (gates, wires) => {
    const gateValues = {};

    // Initialize INPUT gate values
    gates.forEach(g => {
        if (g.type === 'INPUT') {
            gateValues[g.id] = g.state || 0;
        }
    });

    let progress = true;
    let cycles   = 0;
    const MAX_CYCLES = Math.max(gates.length * 3, 10);

    while (progress && cycles < MAX_CYCLES) {
        progress = false;
        cycles++;

        gates.forEach(gate => {
            if (gate.type === 'INPUT') return;

            const incomingWires  = wires.filter(w => w.toGateId === gate.id);
            const expectedInputs = (gate.type === 'NOT' || gate.type === 'OUTPUT') ? 1 : 2;

            if (incomingWires.length >= expectedInputs) {
                // Sort by pin index (in-0 → slot 0, in-1 → slot 1) so gate
                // evaluation always receives inputs in the correct positional order.
                const sorted = [...incomingWires].sort((a, b) => {
                    const ia = parseInt((a.toPin || 'in-0').replace('in-', ''), 10);
                    const ib = parseInt((b.toPin || 'in-0').replace('in-', ''), 10);
                    return ia - ib;
                });
                const inputValues = sorted.slice(0, expectedInputs).map(w => gateValues[w.fromGateId]);

                if (!inputValues.includes(undefined) && !inputValues.includes(null)) {
                    const newValue = evaluateGate(gate.type, inputValues);
                    if (gateValues[gate.id] !== newValue) {
                        gateValues[gate.id] = newValue;
                        progress = true;
                    }
                }
            }
        });
    }

    const activeWires = wires.map(w => ({
        ...w,
        value: gateValues[w.fromGateId] !== undefined ? gateValues[w.fromGateId] : null,
    }));

    const outputs       = gates.filter(g => g.type === 'OUTPUT');
    const outputResults = outputs.map(o => ({
        id:    o.id,
        value: gateValues[o.id] !== undefined ? gateValues[o.id] : null,
    }));

    const score = outputs.length > 0 && outputResults.every(o => o.value === 1) ? 100 : 50;

    return {
        gateValues,
        activeWires,
        outputResults,
        score,
        feedback: 'Evaluated locally',
    };
};
