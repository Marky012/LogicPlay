from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=True)          # Only set for teachers
    role = Column(String, default="student")               # "student" | "teacher"
    points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    badges = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    circuits = relationship("Circuit", back_populates="owner")
    assignments = relationship("Assignment", back_populates="teacher")
    submissions = relationship("Submission", back_populates="student")
    classrooms_taught = relationship("Classroom", back_populates="teacher")
    enrollments = relationship("Enrollment", back_populates="student")


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
    created_at = Column(DateTime, default=datetime.utcnow)

    teacher = relationship("User", back_populates="classrooms_taught")
    enrollments = relationship("Enrollment", back_populates="classroom", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="classroom")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    joined_at = Column(DateTime, default=datetime.utcnow)

    classroom = relationship("Classroom", back_populates="enrollments")
    student = relationship("User", back_populates="enrollments")


class Assignment(Base):
    """Teacher-created assignment that students submit circuits to."""
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=True)
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
