from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from .. import crud, models, schemas
from ..database import get_db
from ml_model.predict import predict_score
from ..services.gamification import calculate_level, check_badges

router = APIRouter(
    prefix="/circuits",
    tags=["circuits"],
)

@router.post("/", response_model=schemas.Circuit)
def create_circuit(circuit: schemas.CircuitCreate, user_id: int, db: Session = Depends(get_db)):
    db_circuit = crud.create_circuit(db=db, circuit=circuit, user_id=user_id)
    db_user = crud.get_user(db, user_id=user_id)
    
    if db_user:
        # Gamification points
        points_earned = 5 # base
        if db_circuit.score and db_circuit.score >= 80:
            points_earned += 10
            
        # Add points based on complexity
        gates_count = 0
        if isinstance(circuit.circuit_data, dict):
            gates_count = len(circuit.circuit_data.get("gates", []))
        points_earned += gates_count
        
        db_user.points = (db_user.points or 0) + points_earned
        db_user.level = calculate_level(db_user.points)
        
        new_badges = check_badges(db_user, db_circuit)
        if new_badges:
            current_badges = list(db_user.badges) if db_user.badges else []
            current_badges.extend(new_badges)
            db_user.badges = list(dict.fromkeys(current_badges)) # Remove duplicates while preserving order
            
        db.commit()
    return db_circuit

@router.get("/{circuit_id}", response_model=schemas.Circuit)
def read_circuit(circuit_id: int, db: Session = Depends(get_db)):
    db_circuit = crud.get_circuit(db, circuit_id=circuit_id)
    if db_circuit is None:
        raise HTTPException(status_code=404, detail="Circuit not found")
    return db_circuit

@router.delete("/{circuit_id}", response_model=schemas.Circuit)
def delete_circuit(circuit_id: int, db: Session = Depends(get_db)):
    db_circuit = crud.delete_circuit(db, circuit_id=circuit_id)
    if db_circuit is None:
        raise HTTPException(status_code=404, detail="Circuit not found")
    return db_circuit

@router.put("/{circuit_id}/name", response_model=schemas.Circuit)
def update_circuit_name(circuit_id: int, payload: schemas.CircuitRename, db: Session = Depends(get_db)):
    db_circuit = crud.update_circuit_name(db, circuit_id=circuit_id, new_name=payload.name)
    if db_circuit is None:
        raise HTTPException(status_code=404, detail="Circuit not found")
    return db_circuit

@router.post("/grade")
def grade_circuit(circuit_data: Dict[str, Any]):
    try:
        # Extract circuit structure (React frontend sends nested circuit_data)
        data = circuit_data.get('circuit_data', circuit_data)
        result = predict_score(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
