from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime


# ─────────────────────────── Classrooms ────────────────────────────

class EnrollmentOut(BaseModel):
    id: int
    classroom_id: int
    student_id: int
    status: str

    class Config:
        from_attributes = True

class ClassroomBase(BaseModel):
    name: str
    require_approval: bool = False

class ClassroomCreate(ClassroomBase):
    pass

class ClassroomUpdate(BaseModel):
    name: Optional[str] = None
    require_approval: Optional[bool] = None

class ClassroomOut(ClassroomBase):
    id: int
    teacher_id: int
    join_code: str
    created_at: datetime
    student_count: int = 0

    class Config:
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

class CircuitRename(BaseModel):
    name: str

class Circuit(CircuitBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ─────────────────────────── Auth & Users ───────────────────────

class User(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    role: str
    points: int
    level: int
    badges: List[Any]
    created_at: datetime
    circuits: List[Circuit] = []
    enrollments: List[EnrollmentOut] = []

    class Config:
        from_attributes = True

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str
    device_token: Optional[str] = None

class VerifyDevice(BaseModel):
    username: str
    code: str
    device_token: str

class ChangePassword(BaseModel):
    username: str
    old_password: str
    new_password: str

class LoginResponse(BaseModel):
    username: str
    role: str
    id: int
    requires_verification: bool = False

# Legacy schemas (kept temporarily or mapped)
class UserCreate(UserRegister):
    pass

class TeacherRegister(UserRegister):
    pass

class TeacherLogin(UserLogin):
    pass

class TeacherLoginResponse(LoginResponse):
    pass


# ─────────────────────────── Badge ──────────────────────────────

class Badge(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


# ─────────────────────────── Challenge ──────────────────────────

class Challenge(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    points_reward: int

    class Config:
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
    has_submitted: bool = False

    class Config:
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
        from_attributes = True
