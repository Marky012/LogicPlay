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
