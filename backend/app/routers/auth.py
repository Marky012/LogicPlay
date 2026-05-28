from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from .. import crud, schemas
from ..database import get_db
from ..services.emailer import generate_6_digit_code, send_verification_email

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/login", response_model=schemas.LoginResponse)
def login_user(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, data.username, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    if data.device_token and crud.verify_device_token(db, user.id, data.device_token):
        return schemas.LoginResponse(username=user.username, role=user.role, id=user.id, requires_verification=False)
    
    if not user.email:
        if data.device_token:
            crud.register_device_token(db, user.id, data.device_token)
        return schemas.LoginResponse(username=user.username, role=user.role, id=user.id, requires_verification=False)

    code = generate_6_digit_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    crud.create_verification_code(db, user.id, code, expires_at)
    send_verification_email(user.email, code)
    
    return schemas.LoginResponse(username=user.username, role=user.role, id=user.id, requires_verification=True)

@router.post("/verify")
def verify_device(data: schemas.VerifyDevice, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, data.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if crud.check_verification_code(db, user.id, data.code):
        crud.register_device_token(db, user.id, data.device_token)
        return {"success": True, "message": "Device verified"}
    else:
        raise HTTPException(status_code=400, detail="Invalid or expired code")

@router.put("/change-password")
def change_password(data: schemas.ChangePassword, db: Session = Depends(get_db)):
    success = crud.update_user_password(db, data)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid old password or user not found")
    return {"success": True, "message": "Password updated successfully"}

@router.post("/teacher/register", response_model=schemas.TeacherLoginResponse)
def register_teacher(data: schemas.TeacherRegister, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_username(db, data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    if data.email:
        existing_email = crud.get_user_by_email(db, data.email)
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")
            
    teacher = crud.create_teacher(db, data)
    return schemas.TeacherLoginResponse(username=teacher.username, role=teacher.role, id=teacher.id)

@router.post("/teacher/login", response_model=schemas.TeacherLoginResponse)
def login_teacher(data: schemas.TeacherLogin, db: Session = Depends(get_db)):
    return login_user(data, db)
