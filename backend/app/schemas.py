from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime


# ─────────────────────────── Classrooms ────────────────────────────

class ClassroomBase(BaseModel):
    name: str

class ClassroomCreate(ClassroomBase):
    pass

class ClassroomOut(ClassroomBase):
    id: int
    teacher_id: int
    join_code: str
    created_at: datetime
    student_count: int = 0

    class Config:
        orm_mode = True
        from_attributes = True

class ClassroomJoin(BaseModel):
    join_code: str
    student_username: str

# ─────────────────────────── Circuit ────────────────────────────

class CircuitBase(BaseModel):
    circuit_data: Any
    score: Optional[int] = None
    feedback: Optional[str] = None

class CircuitCreate(CircuitBase):
    pass

class Circuit(CircuitBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True


# ─────────────────────────── User ───────────────────────────────

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    role: str
    points: int
    level: int
    badges: List[Any]
    created_at: datetime
    circuits: List[Circuit] = []

    class Config:
        orm_mode = True
        from_attributes = True


# ─────────────────────────── Teacher Auth ───────────────────────

class TeacherRegister(BaseModel):
    username: str
    password: str

class TeacherLogin(BaseModel):
    username: str
    password: str

class TeacherLoginResponse(BaseModel):
    username: str
    role: str
    id: int


# ─────────────────────────── Badge ──────────────────────────────

class Badge(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True


# ─────────────────────────── Challenge ──────────────────────────

class Challenge(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    points_reward: int

    class Config:
        orm_mode = True
        from_attributes = True


# ─────────────────────────── Assignment ─────────────────────────

class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_gate: Optional[str] = None
    due_date: Optional[datetime] = None
    accept_late: bool = True
    points_reward: int = 50
    classroom_id: int

class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_gate: Optional[str] = None
    due_date: Optional[datetime] = None
    accept_late: Optional[bool] = None
    points_reward: Optional[int] = None

class AssignmentOut(BaseModel):
    id: int
    teacher_id: int
    classroom_id: Optional[int] = None
    teacher_username: Optional[str] = None
    classroom_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    target_gate: Optional[str] = None
    due_date: Optional[datetime] = None
    accept_late: bool
    points_reward: int
    created_at: datetime
    submission_count: int = 0

    class Config:
        orm_mode = True
        from_attributes = True


# ─────────────────────────── Submission ─────────────────────────

class SubmissionCreate(BaseModel):
    assignment_id: int
    student_username: str
    circuit_data: Any

class SubmissionGrade(BaseModel):
    teacher_score: int
    teacher_feedback: Optional[str] = None

class SubmissionOut(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    student_username: Optional[str] = None
    assignment_title: Optional[str] = None
    circuit_data: Any
    auto_score: Optional[int] = None
    teacher_score: Optional[int] = None
    teacher_feedback: Optional[str] = None
    submitted_at: datetime
    is_late: bool
    status: str

    class Config:
        orm_mode = True
        from_attributes = True
