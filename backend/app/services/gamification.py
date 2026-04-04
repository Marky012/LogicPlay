import math
from .. import models

def calculate_level(points: int):
    return math.floor(points / 100) + 1

def check_badges(user: models.User, circuit: models.Circuit):
    """
    Evaluates a user and their newly saved circuit to determine if any new badges are earned.
    Returns a list of badge names that the user has newly earned.
    """
    earned_new = []
    
    # Safely get current user badges
    current_badges = user.badges if user.badges else []
    
    # Check "First Circuit"
    if "First Circuit" not in current_badges:
        earned_new.append("First Circuit")
        
    # Check "Perfect Score"
    if circuit.score == 100 and "Perfect Score" not in current_badges:
        earned_new.append("Perfect Score")
        
    # Check "Gates Master" (e.g. at least 10 gates)
    gates = circuit.circuit_data.get("gates", []) if circuit.circuit_data else []
    if len(gates) >= 10 and "Gates Master" not in current_badges:
        earned_new.append("Gates Master")
        
    # Check "Speed Demon" - could look at time deltas, but mock based on wire logic density
    wires = circuit.circuit_data.get("wires", []) if circuit.circuit_data else []
    if len(gates) > 5 and len(wires) > 5 and circuit.score > 80 and "Speed Demon" not in current_badges:
        earned_new.append("Speed Demon")
        
    return earned_new


def evaluate_circuit_score(circuit_data: dict) -> int:
    """
    Simple auto-scorer for a submitted circuit.
    Returns a score 0-100 based on structural heuristics.
    """
    if not circuit_data or not isinstance(circuit_data, dict):
        return 0
    gates = circuit_data.get("gates", [])
    wires = circuit_data.get("wires", [])
    outputs = [g for g in gates if isinstance(g, dict) and g.get("type") == "OUTPUT"]
    inputs  = [g for g in gates if isinstance(g, dict) and g.get("type") == "INPUT"]
    logic   = [g for g in gates if isinstance(g, dict) and g.get("type") not in ("INPUT", "OUTPUT")]

    if not gates or not outputs:
        return 0
    if not inputs or not logic:
        return 20
    if not wires:
        return 10

    # Connectivity ratio: wires vs max possible
    max_wires = len(gates) * 2
    connectivity = min(len(wires) / max_wires, 1.0) if max_wires > 0 else 0

    # Complexity bonus
    complexity = min(len(logic) / 5, 1.0)

    score = int(40 + connectivity * 40 + complexity * 20)
    return min(score, 100)
