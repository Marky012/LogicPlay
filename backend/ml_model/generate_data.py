import csv
import random
import os

from extract_features import extract_features

def generate_random_circuit():
    """Generates a mostly random but structurally valid circuit."""
    num_inputs = random.randint(2, 4)
    num_gates = random.randint(2, 6)
    
    gates = []
    
    # Add inputs
    for i in range(num_inputs):
        gates.append({
            "id": f"input_{i}",
            "type": "INPUT"
        })
        
    # Add middle gates
    gate_types = ["AND", "OR", "NOT"]
    for i in range(num_gates):
        gates.append({
            "id": f"gate_{i}",
            "type": random.choice(gate_types)
        })
        
    # Add output
    gates.append({
        "id": "output_0",
        "type": "OUTPUT"
    })
    
    wires = []
    wire_id = 0
    
    # Try to connect them up randomly (not necessarily logically correct)
    # We just need structural features for the ML model to learn from
    
    for gate in gates:
        if gate["type"] == "INPUT": continue
        
        expected_inputs = 1 if gate["type"] in ["NOT", "OUTPUT"] else 2
        
        # Pick random available gates as inputs to this gate
        possible_sources = [g for g in gates if g["id"] != gate["id"] and g["type"] != "OUTPUT"]
        
        sources = random.sample(possible_sources, min(expected_inputs, len(possible_sources)))
        
        for idx, src in enumerate(sources):
            wires.append({
                "id": f"wire_{wire_id}",
                "fromGateId": src["id"],
                "fromPin": "out-0",
                "toGateId": gate["id"],
                "toPin": f"in-{idx}"
            })
            wire_id += 1
            
    # Simple rule-based expected score to train the ML model on
    # A perfect circuit has fully connected paths from INPUT to OUTPUT
    # For synthetic data, we'll just score based on connections vs gates
    
    circuit_data = {"gates": gates, "wires": wires}
    
    if len(wires) == 0:
        score = 0
    elif len(wires) < len(gates) - 1:
        score = 40
    else:
        # Give a random high score for densely connected circuits 
        score = random.randint(70, 100)
        
    return circuit_data, score

def generate_dataset(filename="synthetic_circuits.csv", num_samples=1000):
    filepath = os.path.join(os.path.dirname(__file__), filename)
    print(f"Generating {num_samples} samples into {filepath}...")
    
    with open(filepath, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        
        # Write header
        writer.writerow([
            'gate_count', 'wire_count', 'and_count', 'or_count', 
            'not_count', 'input_count', 'output_count', 'complexity_flag', 'score'
        ])
        
        for _ in range(num_samples):
            circuit, score = generate_random_circuit()
            features = extract_features(circuit)
            row = features + [score]
            writer.writerow(row)
            
    print("Done!")

if __name__ == "__main__":
    generate_dataset()
