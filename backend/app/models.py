from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=True)
    role = Column(String, default="student")               # "student" | "teacher"
    points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    badges = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    circuits = relationship("Circuit", back_populates="owner", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="teacher", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="student", cascade="all, delete-orphan")
    classrooms_taught = relationship("Classroom", back_populates="teacher", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")
    trusted_devices = relationship("TrustedDevice", back_populates="user", cascade="all, delete-orphan")
    verification_codes = relationship("VerificationCode", back_populates="user", cascade="all, delete-orphan")

class TrustedDevice(Base):
    __tablename__ = "trusted_devices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    device_token = Column(String, index=True) # Removed unique=True to allow shared devices
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="trusted_devices")

    # Ensure a user doesn't have duplicate entries for the same device
    from sqlalchemy import UniqueConstraint
    __table_args__ = (UniqueConstraint('user_id', 'device_token', name='_user_device_uc'),)

class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    code = Column(String, index=True)
    expires_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="verification_codes")


class Circuit(Base):
    __tablename__ = "circuits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    circuit_data = Column(JSON)
    score = Column(Integer, nullable=True)
    feedback = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="circuits")


class Badge(Base):
    __tablename__ = "badges"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    requirement_type = Column(String)
    requirement_value = Column(Integer)


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    target_gate = Column(String, nullable=True)
    gate_count = Column(Integer, nullable=True)
    points_reward = Column(Integer, default=50)
    created_at = Column(DateTime, default=datetime.utcnow)


class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    join_code = Column(String, unique=True, index=True)
    require_approval = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    teacher = relationship("User", back_populates="classrooms_taught")
    enrollments = relationship("Enrollment", back_populates="classroom", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="classroom", cascade="all, delete-orphan")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="CASCADE"))
    student_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="approved") # "pending" | "approved"
    joined_at = Column(DateTime, default=datetime.utcnow)

    classroom = relationship("Classroom", back_populates="enrollments")
    student = relationship("User", back_populates="enrollments")


class Assignment(Base):
    """Teacher-created assignment that students submit circuits to."""
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    target_gate = Column(String, nullable=True)       # Hint: AND, OR, XOR, …
    due_date = Column(DateTime, nullable=True)         # None = no deadline
    accept_late = Column(Boolean, default=True)        # Allow submissions past due date
    points_reward = Column(Integer, default=50)
    created_at = Column(DateTime, default=datetime.utcnow)

    teacher = relationship("User", back_populates="assignments")
    classroom = relationship("Classroom", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment", cascade="all, delete-orphan")


class Submission(Base):
    """A student's circuit submitted to an assignment."""
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    circuit_data = Column(JSON, nullable=False)
    auto_score = Column(Integer, nullable=True)
    teacher_score = Column(Integer, nullable=True)
    teacher_feedback = Column(String, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    is_late = Column(Boolean, default=False)
    status = Column(String, default="pending")         # "pending" | "graded"

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")

class DismissedAssignment(Base):
    __tablename__ = "dismissed_assignments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assignment_id = Column(Integer, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="dismissed_assignments")
    assignment = relationship("Assignment")

User.dismissed_assignments = relationship("DismissedAssignment", back_populates="user", cascade="all, delete-orphan")
