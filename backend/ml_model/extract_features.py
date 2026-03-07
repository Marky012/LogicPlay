def extract_features(circuit_data):
    """
    Convert circuit JSON dict to a list of numerical features.
    Must match the exact order of features trained on in the ML model.
    """
    gates = circuit_data.get('gates', [])
    wires = circuit_data.get('wires', [])
    
    gate_count = len(gates)
    wire_count = len(wires)
    
    and_count = sum(1 for g in gates if g['type'] == 'AND')
    or_count = sum(1 for g in gates if g['type'] == 'OR')
    not_count = sum(1 for g in gates if g['type'] == 'NOT')
    input_count = sum(1 for g in gates if g['type'] == 'INPUT')
    output_count = sum(1 for g in gates if g['type'] == 'OUTPUT')
    
    complexity_flag = 1 if wire_count > gate_count else 0
    
    return [
        gate_count, 
        wire_count, 
        and_count, 
        or_count, 
        not_count, 
        input_count, 
        output_count, 
        complexity_flag
    ]
