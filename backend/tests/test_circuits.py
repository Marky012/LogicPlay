import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Note: Depends on test_users.py establishing 'testuser' if using shared DB
# For isolation, tests should ideally create their own records,
# but for this MVP, we'll configure a generic test.

def test_grade_valid_circuit():
    circuit_data = {
        "circuit_data": {
            "gates": [
                {"id": "in1", "type": "INPUT"},
                {"id": "in2", "type": "INPUT"},
                {"id": "g1", "type": "AND"},
                {"id": "out1", "type": "OUTPUT"}
            ],
            "wires": [
                {"fromGateId": "in1", "toGateId": "g1"},
                {"fromGateId": "in2", "toGateId": "g1"},
                {"fromGateId": "g1", "toGateId": "out1"}
            ]
        }
    }
    
    response = client.post(
        "/circuits/grade",
        json=circuit_data
    )
    assert response.status_code == 200
    assert "score" in response.json()
    assert "feedback" in response.json()
    assert response.json()["score"] > 0

def test_save_circuit():
    # In a real test, create a user first and mock the user_id dependency
    # Since sqlite allows foreign key violations by default unless PRAGMA foreign_keys=ON is explicitly set in engine config
    # We might be able to save referencing user_id=1.
    
    circuit_data = {
        "circuit_data": {
            "name": "Test Circuit",
            "gates": [],
            "wires": []
        },
        "score": 0,
        "feedback": "Test"
    }

    response = client.post(
        "/circuits/?user_id=1",
        json=circuit_data
    )
    
    assert response.status_code == 200
    assert response.json()["score"] == 0
    assert "id" in response.json()
