from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import bcrypt
from . import models, schemas

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False


# ─────────────────────────── User ───────────────────────────────

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_all_users(db: Session):
    return db.query(models.User).filter(models.User.role == "student").all()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(username=user.username, role="student")
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, username: str):
    db_user = get_user_by_username(db, username)
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False


# ─────────────────────────── Teacher Auth ───────────────────────

def create_teacher(db: Session, data: schemas.TeacherRegister):
    hashed = get_password_hash(data.password)
    db_user = models.User(username=data.username, password_hash=hashed, role="teacher")
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_teacher(db: Session, username: str, password: str) -> Optional[models.User]:
    user = db.query(models.User).filter(
        models.User.username == username,
        models.User.role == "teacher"
    ).first()
    if user and user.password_hash and verify_password(password, user.password_hash):
        return user
    return None


# ─────────────────────────── Circuit ────────────────────────────

def get_circuits(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Circuit).offset(skip).limit(limit).all()

def get_circuit(db: Session, circuit_id: int):
    return db.query(models.Circuit).filter(models.Circuit.id == circuit_id).first()

def create_circuit(db: Session, circuit: schemas.CircuitCreate, user_id: int):
    data = circuit.dict() if hasattr(circuit, 'dict') else circuit.model_dump()
    db_circuit = models.Circuit(**data, user_id=user_id)
    db.add(db_circuit)
    db.commit()
    db.refresh(db_circuit)
    return db_circuit

def delete_circuit(db: Session, circuit_id: int):
    db_circuit = get_circuit(db, circuit_id)
    if db_circuit:
        db.delete(db_circuit)
        db.commit()
    return db_circuit

def update_circuit_name(db: Session, circuit_id: int, new_name: str):
    from sqlalchemy.orm.attributes import flag_modified
    db_circuit = get_circuit(db, circuit_id)
    if db_circuit and db_circuit.circuit_data:
        # Reconstruct or mutate dict safely
        new_data = dict(db_circuit.circuit_data)
        new_data['name'] = new_name
        db_circuit.circuit_data = new_data
        flag_modified(db_circuit, "circuit_data")
        db.commit()
        db.refresh(db_circuit)
    return db_circuit


# ─────────────────────────── Classrooms ────────────────────────
import random
import string

def generate_join_code(length=6):
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def create_classroom(db: Session, data: schemas.ClassroomCreate, teacher_id: int):
    # Ensure unique join code
    code = generate_join_code()
    while db.query(models.Classroom).filter(models.Classroom.join_code == code).first():
        code = generate_join_code()
        
    db_class = models.Classroom(
        name=data.name, 
        teacher_id=teacher_id, 
        join_code=code,
        require_approval=data.require_approval
    )
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

def get_classrooms_by_teacher(db: Session, teacher_id: int):
    return db.query(models.Classroom).filter(models.Classroom.teacher_id == teacher_id).all()

def get_classrooms_by_student(db: Session, student_id: int):
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.student_id == student_id).all()
    return [e.classroom for e in enrollments]

def get_classroom_by_join_code(db: Session, join_code: str):
    return db.query(models.Classroom).filter(models.Classroom.join_code == join_code).first()

def enroll_student(db: Session, classroom_id: int, student_id: int):
    existing = db.query(models.Enrollment).filter(
        models.Enrollment.classroom_id == classroom_id,
        models.Enrollment.student_id == student_id
    ).first()
    if existing:
        return existing
    db_enroll = models.Enrollment(classroom_id=classroom_id, student_id=student_id)
    # Check if we should enforce approval
    classroom = db.query(models.Classroom).filter(models.Classroom.id == classroom_id).first()
    if classroom and classroom.require_approval:
        db_enroll.status = "pending"
    else:
        db_enroll.status = "approved"

    db.add(db_enroll)
    db.commit()
    return db_enroll

def get_classroom_students(db: Session, classroom_id: int):
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.classroom_id == classroom_id).all()
    # It might be beneficial to return only approved students here or all, the api usually just wants all and the router filters, or router returns all. We'll return all so the teacher can see pending.
    return [e.student for e in enrollments]

def get_classroom_enrollments(db: Session, classroom_id: int):
    return db.query(models.Enrollment).filter(models.Enrollment.classroom_id == classroom_id).all()

def update_classroom(db: Session, classroom_id: int, data: schemas.ClassroomUpdate):
    db_class = db.query(models.Classroom).filter(models.Classroom.id == classroom_id).first()
    if not db_class: return None
    if data.name is not None:
        db_class.name = data.name
    if data.require_approval is not None:
        db_class.require_approval = data.require_approval
    db.commit()
    db.refresh(db_class)
    return db_class

def delete_classroom(db: Session, classroom_id: int):
    db_class = db.query(models.Classroom).filter(models.Classroom.id == classroom_id).first()
    if db_class:
        db.delete(db_class)
        db.commit()
        return True
    return False

def remove_student_from_class(db: Session, classroom_id: int, student_id: int):
    enroll = db.query(models.Enrollment).filter(
        models.Enrollment.classroom_id == classroom_id,
        models.Enrollment.student_id == student_id
    ).first()
    if enroll:
        db.delete(enroll)
        db.commit()
        return True
    return False

def approve_student_enrollment(db: Session, classroom_id: int, student_id: int):
    enroll = db.query(models.Enrollment).filter(
        models.Enrollment.classroom_id == classroom_id,
        models.Enrollment.student_id == student_id
    ).first()
    if enroll:
        enroll.status = "approved"
        db.commit()
        return True
    return False

# ─────────────────────────── Assignment ─────────────────────────

def create_assignment(db: Session, data: schemas.AssignmentCreate, teacher_id: int):
    db_assign = models.Assignment(
        teacher_id=teacher_id,
        classroom_id=data.classroom_id,
        title=data.title,
        description=data.description,
        target_gate=data.target_gate,
        due_date=data.due_date,
        accept_late=data.accept_late,
        points_reward=data.points_reward,
    )
    db.add(db_assign)
    db.commit()
    db.refresh(db_assign)
    return db_assign

def get_assignments(db: Session):
    return db.query(models.Assignment).order_by(models.Assignment.created_at.desc()).all()

def get_assignments_by_teacher(db: Session, teacher_id: int):
    return db.query(models.Assignment).filter(
        models.Assignment.teacher_id == teacher_id
    ).order_by(models.Assignment.created_at.desc()).all()

def get_assignment(db: Session, assignment_id: int):
    return db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()

def update_assignment(db: Session, assignment_id: int, data: schemas.AssignmentUpdate):
    db_assign = get_assignment(db, assignment_id)
    if not db_assign:
        return None
    update_data = data.dict(exclude_unset=True) if hasattr(data, 'dict') else data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_assign, field, value)
    db.commit()
    db.refresh(db_assign)
    return db_assign

def delete_assignment(db: Session, assignment_id: int):
    db_assign = get_assignment(db, assignment_id)
    if db_assign:
        db.delete(db_assign)
        db.commit()
    return db_assign


# ─────────────────────────── Submission ─────────────────────────

def create_submission(db: Session, data: schemas.SubmissionCreate, auto_score: int):
    student = get_user_by_username(db, data.student_username)
    if not student:
        return None
    assignment = get_assignment(db, data.assignment_id)
    if not assignment:
        return None

    # Check if late
    is_late = False
    if assignment.due_date and datetime.utcnow() > assignment.due_date:
        is_late = True

    db_sub = models.Submission(
        assignment_id=data.assignment_id,
        student_id=student.id,
        circuit_data=data.circuit_data,
        auto_score=auto_score,
        is_late=is_late,
        status="pending",
    )
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub

def get_submissions_by_assignment(db: Session, assignment_id: int):
    return db.query(models.Submission).filter(
        models.Submission.assignment_id == assignment_id
    ).order_by(models.Submission.submitted_at.desc()).all()

def get_submissions_by_student(db: Session, student_id: int):
    return db.query(models.Submission).filter(
        models.Submission.student_id == student_id
    ).order_by(models.Submission.submitted_at.desc()).all()

def grade_submission(db: Session, submission_id: int, data: schemas.SubmissionGrade):
    db_sub = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not db_sub:
        return None
    db_sub.teacher_score = data.teacher_score
    db_sub.teacher_feedback = data.teacher_feedback
    db_sub.status = "graded"
    db.commit()
    db.refresh(db_sub)
    return db_sub
