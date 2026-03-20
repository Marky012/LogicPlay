import { evaluateCircuit } from './src/utils/circuitLogic.js';

console.log("Running Frontend Logic Tests...");

const testCircuit = () => {
    const gates = [
        { id: "in1", type: "INPUT", position: { x: 0, y: 0 }, value: 1 },
        { id: "in2", type: "INPUT", position: { x: 0, y: 0 }, value: 0 },
        { id: "and1", type: "AND", position: { x: 0, y: 0 } },
        { id: "out1", type: "OUTPUT", position: { x: 0, y: 0 } }
    ];
    
    const wires = [
        { fromGateId: "in1", toGateId: "and1" },
        { fromGateId: "in2", toGateId: "and1" },
        { fromGateId: "and1", toGateId: "out1" }
    ];

    const result = evaluateCircuit(gates, wires);
    
    if (result.gateValues["out1"] !== 0) {
        console.error("❌ Test Failed: AND gate with 1 and 0 should output 0");
        process.exit(1);
    }
    
    // Change input
    gates[1].value = 1;
    const result2 = evaluateCircuit(gates, wires);
    if (result2.gateValues["out1"] !== 1) {
        console.error("❌ Test Failed: AND gate with 1 and 1 should output 1");
        process.exit(1);
    }
    
    console.log("✅ Circuit Evaluation Tests Passed!");
};

testCircuit();
