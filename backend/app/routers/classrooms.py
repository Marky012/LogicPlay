from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, crud
from ..database import get_db

router = APIRouter(
    prefix="/classrooms",
    tags=["classrooms"]
)

@router.post("/{teacher_username}", response_model=schemas.ClassroomOut)
def create_classroom(teacher_username: str, classroom: schemas.ClassroomCreate, db: Session = Depends(get_db)):
    teacher = crud.get_user_by_username(db, username=teacher_username)
    if not teacher or teacher.role != "teacher":
        raise HTTPException(status_code=404, detail="Teacher not found")
    return crud.create_classroom(db=db, data=classroom, teacher_id=teacher.id)

@router.get("/teacher/{teacher_username}", response_model=List[schemas.ClassroomOut])
def get_teacher_classrooms(teacher_username: str, db: Session = Depends(get_db)):
    teacher = crud.get_user_by_username(db, username=teacher_username)
    if not teacher or teacher.role != "teacher":
        raise HTTPException(status_code=404, detail="Teacher not found")
    classrooms = crud.get_classrooms_by_teacher(db, teacher_id=teacher.id)
    # manually append student counts
    result = []
    for c in classrooms:
        out = schemas.ClassroomOut.model_validate(c)
        out.student_count = len(c.enrollments)
        result.append(out)
    return result

@router.post("/join", response_model=schemas.ClassroomOut)
def join_classroom(data: schemas.ClassroomJoin, db: Session = Depends(get_db)):
    student = crud.get_user_by_username(db, username=data.student_username)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    classroom = crud.get_classroom_by_join_code(db, join_code=data.join_code.strip())
    if not classroom:
        raise HTTPException(status_code=404, detail="Invalid join code")
        
    crud.enroll_student(db, classroom_id=classroom.id, student_id=student.id)
    out = schemas.ClassroomOut.model_validate(classroom)
    out.student_count = len(classroom.enrollments)
    return out

@router.get("/student/{student_username}", response_model=List[schemas.ClassroomOut])
def get_student_classrooms(student_username: str, db: Session = Depends(get_db)):
    student = crud.get_user_by_username(db, username=student_username)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    classrooms = crud.get_classrooms_by_student(db, student_id=student.id)
    result = []
    for c in classrooms:
        out = schemas.ClassroomOut.model_validate(c)
        out.student_count = len(c.enrollments)
        result.append(out)
    return result

@router.get("/{classroom_id}/students", response_model=List[schemas.User])
def get_classroom_students(classroom_id: int, db: Session = Depends(get_db)):
    students = crud.get_classroom_students(db, classroom_id=classroom_id)
    return students
