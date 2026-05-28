from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    if user.email:
        db_email = crud.get_user_by_email(db, email=user.email)
        if db_email:
            raise HTTPException(status_code=400, detail="Email already registered")
            
    return crud.create_user(db=db, user=user)

@router.get("/all", response_model=List[schemas.User])
def read_all_students(db: Session = Depends(get_db)):
    return crud.get_all_users(db)

@router.get("/leaderboard", response_model=List[schemas.User])
def get_leaderboard(limit: int = 20, db: Session = Depends(get_db)):
    """Returns top students sorted by XP (points descending)."""
    return (
        db.query(models.User)
        .filter(models.User.role == "student")
        .order_by(models.User.points.desc(), models.User.level.desc(), models.User.username.asc())
        .limit(limit)
        .all()
    )

@router.get("/{username}", response_model=schemas.User)
def read_user(username: str, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=username)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.get("/{username}/circuits", response_model=List[schemas.Circuit])
def read_user_circuits(username: str, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=username)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user.circuits

@router.delete("/{username}")
def delete_user(username: str, db: Session = Depends(get_db)):
    success = crud.delete_user(db, username=username)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted successfully"}
