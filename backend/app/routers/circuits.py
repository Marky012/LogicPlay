from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/circuits",
    tags=["circuits"],
)

@router.post("/", response_model=schemas.Circuit)
def create_circuit(circuit: schemas.CircuitCreate, user_id: int, db: Session = Depends(get_db)):
    return crud.create_circuit(db=db, circuit=circuit, user_id=user_id)

@router.get("/{circuit_id}", response_model=schemas.Circuit)
def read_circuit(circuit_id: int, db: Session = Depends(get_db)):
    db_circuit = crud.get_circuit(db, circuit_id=circuit_id)
    if db_circuit is None:
        raise HTTPException(status_code=404, detail="Circuit not found")
    return db_circuit

@router.post("/grade")
def grade_circuit(circuit_data: Dict[str, Any]):
    # Placeholder for ML grading logic
    return {"score": 0, "feedback": "Placeholder for ML backend"}
