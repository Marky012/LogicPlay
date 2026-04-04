from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db

router = APIRouter(
    prefix="/assignments",
    tags=["assignments"],
)


def _enrich(assignment: models.Assignment, db: Session) -> schemas.AssignmentOut:
    teacher = crud.get_user(db, assignment.teacher_id)
    count = len(assignment.submissions) if assignment.submissions else 0
    classroom_name = assignment.classroom.name if assignment.classroom else None
    return schemas.AssignmentOut(
        id=assignment.id,
        teacher_id=assignment.teacher_id,
        classroom_id=assignment.classroom_id,
        teacher_username=teacher.username if teacher else None,
        classroom_name=classroom_name,
        title=assignment.title,
        description=assignment.description,
        target_gate=assignment.target_gate,
        due_date=assignment.due_date,
        accept_late=assignment.accept_late,
        points_reward=assignment.points_reward,
        created_at=assignment.created_at,
        submission_count=count,
    )


@router.post("/", response_model=schemas.AssignmentOut)
def create_assignment(
    data: schemas.AssignmentCreate,
    teacher_username: str,
    db: Session = Depends(get_db),
):
    teacher = crud.get_user_by_username(db, teacher_username)
    if not teacher or teacher.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create assignments")
    assignment = crud.create_assignment(db, data, teacher.id)
    return _enrich(assignment, db)


@router.get("/", response_model=List[schemas.AssignmentOut])
def list_assignments(db: Session = Depends(get_db)):
    assignments = crud.get_assignments(db)
    return [_enrich(a, db) for a in assignments]


@router.get("/teacher/{username}", response_model=List[schemas.AssignmentOut])
def list_teacher_assignments(username: str, db: Session = Depends(get_db)):
    teacher = crud.get_user_by_username(db, username)
    if not teacher or teacher.role != "teacher":
        raise HTTPException(status_code=404, detail="Teacher not found")
    assignments = crud.get_assignments_by_teacher(db, teacher.id)
    return [_enrich(a, db) for a in assignments]


@router.get("/student/{username}", response_model=List[schemas.AssignmentOut])
def list_student_assignments(username: str, db: Session = Depends(get_db)):
    student = crud.get_user_by_username(db, username)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    class_ids = [e.classroom_id for e in student.enrollments]
    # We optionally include ones with no classroom_id (global) or just strictly enrolled classes
    assignments = db.query(models.Assignment).filter(
        (models.Assignment.classroom_id.in_(class_ids)) | (models.Assignment.classroom_id == None)
    ).order_by(models.Assignment.created_at.desc()).all()
    return [_enrich(a, db) for a in assignments]


@router.get("/{assignment_id}", response_model=schemas.AssignmentOut)
def get_assignment(assignment_id: int, db: Session = Depends(get_db)):
    assignment = crud.get_assignment(db, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return _enrich(assignment, db)


@router.patch("/{assignment_id}", response_model=schemas.AssignmentOut)
def update_assignment(
    assignment_id: int,
    data: schemas.AssignmentUpdate,
    teacher_username: str,
    db: Session = Depends(get_db),
):
    assignment = crud.get_assignment(db, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    teacher = crud.get_user_by_username(db, teacher_username)
    if not teacher or assignment.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this assignment")
    updated = crud.update_assignment(db, assignment_id, data)
    return _enrich(updated, db)


@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    teacher_username: str,
    db: Session = Depends(get_db),
):
    assignment = crud.get_assignment(db, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    teacher = crud.get_user_by_username(db, teacher_username)
    if not teacher or assignment.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this assignment")
    crud.delete_assignment(db, assignment_id)
    return {"detail": "Assignment deleted"}
