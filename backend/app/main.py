from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from . import models
from .database import engine
from .routers import users, circuits, challenges, auth, assignments, submissions, classrooms

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LogicPlay API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(circuits.router)
app.include_router(challenges.router)
app.include_router(auth.router)
app.include_router(classrooms.router)
app.include_router(assignments.router)
app.include_router(submissions.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to LogicPlay API"}
