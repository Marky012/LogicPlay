# LogicPlay: Gamified Digital Logic Learning Platform

A gamified Progressive Web App for digital logic education, featuring:
- Drag-and-drop circuit builder
- Real-time signal flow animation
- ML-powered auto-grading
- Gamification (Points, Levels, Badges)
- Offline support (PWA)

## Tech Stack
- **Backend:** FastAPI, SQLite, scikit-learn
- **Frontend:** React, Vite, Tailwind CSS, p5.js, Workbox

## Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or source venv/bin/activate # Unix
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
