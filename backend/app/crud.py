from sqlalchemy.orm import Session
from . import models, schemas

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(username=user.username)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_circuits(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Circuit).offset(skip).limit(limit).all()

def get_circuit(db: Session, circuit_id: int):
    return db.query(models.Circuit).filter(models.Circuit.id == circuit_id).first()

def create_circuit(db: Session, circuit: schemas.CircuitCreate, user_id: int):
    # Depending on Pydantic version, model_dump() or dict() works. Support both.
    data = circuit.dict() if hasattr(circuit, 'dict') else circuit.model_dump()
    db_circuit = models.Circuit(**data, user_id=user_id)
    db.add(db_circuit)
    db.commit()
    db.refresh(db_circuit)
    return db_circuit
