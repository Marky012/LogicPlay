from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

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

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    points: int
    level: int
    badges: List[Any]
    created_at: datetime
    circuits: List[Circuit] = []

    class Config:
        orm_mode = True
        from_attributes = True

class Badge(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    
    class Config:
        orm_mode = True
        from_attributes = True

class Challenge(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    points_reward: int
    
    class Config:
        orm_mode = True
        from_attributes = True

