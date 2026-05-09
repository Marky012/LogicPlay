from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, crud
from ..database import get_db

router = APIRouter(
    prefix="/classrooms",
    tags=["classrooms"]
)

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

@router.get("/teacher/{teacher_username}/students", response_model=List[schemas.User])
def get_teacher_students(teacher_username: str, db: Session = Depends(get_db)):
    teacher = crud.get_user_by_username(db, username=teacher_username)
    if not teacher or teacher.role != "teacher":
        raise HTTPException(status_code=404, detail="Teacher not found")
    classrooms = crud.get_classrooms_by_teacher(db, teacher_id=teacher.id)
    students_map = {}
    for c in classrooms:
        for e in c.enrollments:
            if e.status == "approved":
                student = e.student
                if student.id not in students_map:
                    students_map[student.id] = student
    return list(students_map.values())

@router.put("/{classroom_id}", response_model=schemas.ClassroomOut)
def update_classroom(classroom_id: int, data: schemas.ClassroomUpdate, db: Session = Depends(get_db)):
    updated = crud.update_classroom(db, classroom_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Classroom not found")
    out = schemas.ClassroomOut.model_validate(updated)
    out.student_count = len(updated.enrollments)
    return out

@router.delete("/{classroom_id}")
def delete_classroom(classroom_id: int, db: Session = Depends(get_db)):
    if not crud.delete_classroom(db, classroom_id):
        raise HTTPException(status_code=404, detail="Classroom not found")
    return {"detail": "Deleted successfully"}

@router.get("/{classroom_id}/enrollments", response_model=List[schemas.EnrollmentOut])
def get_classroom_enrollments(classroom_id: int, db: Session = Depends(get_db)):
    return crud.get_classroom_enrollments(db, classroom_id)

@router.delete("/{classroom_id}/students/{student_username}")
def remove_student_from_class(classroom_id: int, student_username: str, db: Session = Depends(get_db)):
    student = crud.get_user_by_username(db, username=student_username)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not crud.remove_student_from_class(db, classroom_id, student.id):
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"detail": "Removed successfully"}

@router.put("/{classroom_id}/enrollments/{student_username}/approve")
def approve_student_enrollment(classroom_id: int, student_username: str, db: Session = Depends(get_db)):
    student = crud.get_user_by_username(db, username=student_username)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not crud.approve_student_enrollment(db, classroom_id, student.id):
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"detail": "Approved successfully"}

@router.post("/{classroom_id}/regenerate-code", response_model=schemas.ClassroomOut)
def regenerate_join_code(classroom_id: int, db: Session = Depends(get_db)):
    updated = crud.regenerate_classroom_join_code(db, classroom_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Classroom not found")
    out = schemas.ClassroomOut.model_validate(updated)
    out.student_count = len(updated.enrollments)
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
