import os
import joblib

from .extract_features import extract_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

# Load model once when the module is imported
try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
    else:
        model = None
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

def get_feedback(score):
    if score >= 90:
        return "Excellent circuit architecture! Very efficient."
    elif score >= 70:
        return "Good job. The logic works but could be optimized."
    elif score >= 50:
        return "Fair attempt. Review your connections to ensure all requirements are met."
    else:
        return "Keep trying. The current structure is missing key components or connections."

def rule_based_fallback(circuit_data):
    features = extract_features(circuit_data)
    # gates, wires, and, or, not, in, out, complex
    g_count, w_count, _, _, _, i_count, o_count, _ = features
    
    if g_count == 0: return 0
    if w_count == 0 and g_count > 0: return 10
    if i_count == 0 or o_count == 0: return 20 
    if w_count < g_count - 1: return 40
    return 60

def predict_score(circuit_data):
    if model:
        try:
            features = extract_features(circuit_data)
            # Reshape features for a single sample prediction
            prediction = model.predict([features])[0]
            score = max(0, min(100, int(prediction))) # Clamp between 0-100
            
            return {
                "score": score,
                "feedback": get_feedback(score),
                "method": "ML"
            }
        except Exception as e:
            print(f"Error during ML prediction: {e}")
            # Fall through to rule-based
    
    # Fallback if model not loaded or error occurred
    score = rule_based_fallback(circuit_data)
    return {
        "score": score,
        "feedback": get_feedback(score),
        "method": "Rule-based Fallback"
    }
