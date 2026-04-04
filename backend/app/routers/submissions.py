from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db
from ..services.gamification import evaluate_circuit_score

router = APIRouter(
    prefix="/submissions",
    tags=["submissions"],
)


def _enrich_sub(sub: models.Submission, db: Session) -> schemas.SubmissionOut:
    student = crud.get_user(db, sub.student_id)
    assignment = crud.get_assignment(db, sub.assignment_id)
    return schemas.SubmissionOut(
        id=sub.id,
        assignment_id=sub.assignment_id,
        student_id=sub.student_id,
        student_username=student.username if student else None,
        assignment_title=assignment.title if assignment else None,
        circuit_data=sub.circuit_data,
        auto_score=sub.auto_score,
        teacher_score=sub.teacher_score,
        teacher_feedback=sub.teacher_feedback,
        submitted_at=sub.submitted_at,
        is_late=sub.is_late,
        status=sub.status,
    )


@router.post("/", response_model=schemas.SubmissionOut)
def submit_circuit(data: schemas.SubmissionCreate, db: Session = Depends(get_db)):
    # Validate student
    student = crud.get_user_by_username(db, data.student_username)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Validate assignment
    assignment = crud.get_assignment(db, data.assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Check late-submission policy
    from datetime import datetime
    if assignment.due_date and datetime.utcnow() > assignment.due_date and not assignment.accept_late:
        raise HTTPException(status_code=403, detail="This assignment is past the deadline and no longer accepting submissions")

    # Auto-score using circuit evaluation
    try:
        auto_score = evaluate_circuit_score(data.circuit_data)
    except Exception:
        auto_score = 0

    sub = crud.create_submission(db, data, auto_score)
    if not sub:
        raise HTTPException(status_code=400, detail="Could not create submission")
    return _enrich_sub(sub, db)


@router.get("/assignment/{assignment_id}", response_model=List[schemas.SubmissionOut])
def get_assignment_submissions(assignment_id: int, db: Session = Depends(get_db)):
    assignment = crud.get_assignment(db, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    subs = crud.get_submissions_by_assignment(db, assignment_id)
    return [_enrich_sub(s, db) for s in subs]


@router.get("/student/{username}", response_model=List[schemas.SubmissionOut])
def get_student_submissions(username: str, db: Session = Depends(get_db)):
    student = crud.get_user_by_username(db, username)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    subs = crud.get_submissions_by_student(db, student.id)
    return [_enrich_sub(s, db) for s in subs]


@router.patch("/{submission_id}/grade", response_model=schemas.SubmissionOut)
def grade_submission(
    submission_id: int,
    data: schemas.SubmissionGrade,
    db: Session = Depends(get_db),
):
    sub = crud.grade_submission(db, submission_id, data)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return _enrich_sub(sub, db)
