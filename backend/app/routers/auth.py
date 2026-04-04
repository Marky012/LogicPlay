from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/teacher/register", response_model=schemas.TeacherLoginResponse)
def register_teacher(data: schemas.TeacherRegister, db: Session = Depends(get_db)):
    existing = crud.get_user_by_username(db, data.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    teacher = crud.create_teacher(db, data)
    return schemas.TeacherLoginResponse(username=teacher.username, role=teacher.role, id=teacher.id)


@router.post("/teacher/login", response_model=schemas.TeacherLoginResponse)
def login_teacher(data: schemas.TeacherLogin, db: Session = Depends(get_db)):
    teacher = crud.authenticate_teacher(db, data.username, data.password)
    if not teacher:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return schemas.TeacherLoginResponse(username=teacher.username, role=teacher.role, id=teacher.id)
