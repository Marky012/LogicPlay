from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/challenges",
    tags=["challenges"],
)

@router.get("/", response_model=List[schemas.Challenge])
def read_challenges(db: Session = Depends(get_db)):
    challenges = db.query(models.Challenge).all()
    if not challenges:
        # Create some default challenges if none exist
        c1 = models.Challenge(title="First Steps", description="Save your first circuit.", points_reward=20)
        c2 = models.Challenge(title="Logic Master", description="Build a circuit with a perfect score.", points_reward=50)
        c3 = models.Challenge(title="Complex Wiring", description="Use at least 10 gates in a single circuit.", points_reward=100)
        db.add_all([c1, c2, c3])
        db.commit()
        challenges = db.query(models.Challenge).all()
    return challenges
