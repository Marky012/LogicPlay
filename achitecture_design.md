# LOGICPLAY: SYSTEM ARCHITECTURE DESIGN DOCUMENT
## Software Engineering 1 Course Project

================================================================================
1. ARCHITECTURE OVERVIEW
================================================================================

Pattern: Client-Server (3-Tier Architecture)
Style: RESTful API + Stateless Authentication

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PRESENTATION  │────▶│    LOGICAL      │────▶│    DATA         │
│      TIER       │     │     TIER        │     │     TIER        │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│  React (Vite)   │     │  FastAPI        │     │  PostgreSQL     │
│  Tailwind CSS   │     │  SQLAlchemy     │     │  (ENUM support) │
│  Canvas API     │     │  JWT Auth       │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │                        │
        └───────── HTTPS/JSON ────┘                        │
                              └────── SQLAlchemy ORM ──────┘

================================================================================
2. TECHNOLOGY STACK & JUSTIFICATION
================================================================================

| Component          | Technology          | Justification for SE Course                    |
|--------------------|---------------------|------------------------------------------------|
| Frontend Framework | React 18 + Vite     | Industry standard, fast HMR for circuit canvas|
| Styling            | Tailwind CSS        | Utility-first, rapid UI development           |
| Backend Framework  | FastAPI (Python 3.10+) | Async, automatic OpenAPI docs, type hints  |
| ORM                | SQLAlchemy 2.0      | Separation of concerns, migration support     |
| Database           | PostgreSQL 15       | Native ENUM support, ACID compliance          |
| Authentication     | JWT + bcrypt        | Stateless, secure password hashing            |
| API Protocol       | REST over HTTPS     | Industry standard for web services            |
| Data Format        | JSON                | Universal, lightweight                         |

================================================================================
3. DATA MODELS (FROM ERD)
================================================================================

Entity: User
-----------
| Field       | Type                    | Constraints              |
|-------------|-------------------------|--------------------------|
| id          | UUID                    | PRIMARY KEY, DEFAULT gen |
| email       | VARCHAR(255)            | UNIQUE, NOT NULL         |
| password_hash| VARCHAR(255)           | NOT NULL                 |
| role        | ENUM('student','teacher')| NOT NULL                 |
| full_name   | VARCHAR(100)            | NOT NULL                 |
| created_at  | TIMESTAMP               | DEFAULT NOW()            |
| updated_at  | TIMESTAMP               | AUTO-UPDATE              |

Entity: Classroom
----------------
| Field       | Type                    | Constraints              |
|-------------|-------------------------|--------------------------|
| id          | UUID                    | PRIMARY KEY              |
| name        | VARCHAR(100)            | NOT NULL                 |
| join_code   | VARCHAR(6)              | UNIQUE, NOT NULL         |
| teacher_id  | UUID                    | FOREIGN KEY → User(id)   |
| created_at  | TIMESTAMP               | DEFAULT NOW()            |

Entity: Enrollment (Junction Table)
------------------------------------
| Field       | Type                    | Constraints              |
|-------------|-------------------------|--------------------------|
| student_id  | UUID                    | FOREIGN KEY → User(id)   |
| classroom_id| UUID                    | FOREIGN KEY → Classroom(id)|
| enrolled_at | TIMESTAMP               | DEFAULT NOW()            |
| PRIMARY KEY (student_id, classroom_id)                               |

Entity: Assignment
------------------
| Field       | Type                    | Constraints              |
|-------------|-------------------------|--------------------------|
| id          | UUID                    | PRIMARY KEY              |
| classroom_id| UUID                    | FOREIGN KEY → Classroom(id)|
| title       | VARCHAR(200)            | NOT NULL                 |
| description | TEXT                    |                          |
| due_date    | TIMESTAMP               |                          |
| max_score   | INTEGER                 | DEFAULT 100              |

Entity: Submission
------------------
| Field       | Type                    | Constraints              |
|-------------|-------------------------|--------------------------|
| id          | UUID                    | PRIMARY KEY              |
| assignment_id| UUID                   | FOREIGN KEY → Assignment(id)|
| student_id  | UUID                    | FOREIGN KEY → User(id)   |
| circuit_json| JSONB                   | NOT NULL (PostgreSQL JSONB)|
| score       | INTEGER                 | 0-100 range              |
| submitted_at| TIMESTAMP               | DEFAULT NOW()            |
| feedback    | TEXT                    |                          |

================================================================================
4. ROLE-BASED ACCESS CONTROL (RBAC)
================================================================================

Role Definition: ENUM('student', 'teacher')

Permission Matrix:
┌─────────────────────────────┬─────────────┬─────────────┐
│ Endpoint                    │ Student     │ Teacher     │
├─────────────────────────────┼─────────────┼─────────────┤
│ POST /auth/login            │ ✅          │ ✅          │
│ GET /user/profile           │ ✅ (own)    │ ✅ (own)    │
│ GET /classroom/{id}         │ ✅ (enrolled)│ ✅ (owned)  │
│ POST /classroom             │ ❌          │ ✅          │
│ POST /assignment            │ ❌          │ ✅          │
│ GET /submission             │ ✅ (own)    │ ✅ (all)    │
│ POST /submission/circuit    │ ✅          │ ❌          │
│ POST /submission/grade      │ ❌          │ ✅          │
│ DELETE /classroom/{id}      │ ❌          │ ✅ (owned)  │
│ GET /analytics/classroom    │ ❌          │ ✅          │
└─────────────────────────────┴─────────────┴─────────────┘

Implementation Strategy (FastAPI Dependency Injection):
--------------------------------------------------------
def require_role(required_role: str):
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return dependency

# Usage example:
@router.post("/classroom", dependencies=[Depends(require_role("teacher"))])
async def create_classroom(...):
    pass

================================================================================
5. API ENDPOINTS (RESTful Contract)
================================================================================

Base URL: https://api.logicplay.com/v1

Authentication (Public):
------------------------
POST   /auth/register        - Create new account (role required in body)
POST   /auth/login           - Returns JWT access token
POST   /auth/refresh         - Refresh expired token

Users (Authenticated):
----------------------
GET    /users/me             - Get current user profile
PUT    /users/me             - Update profile
GET    /users/me/submissions - Get student's own submissions

Classrooms (Role-Dependent):
----------------------------
GET    /classrooms           - List classrooms (student: enrolled, teacher: owned)
POST   /classrooms           - [TEACHER] Create new classroom
GET    /classrooms/{id}      - Get classroom details
PUT    /classrooms/{id}      - [TEACHER] Update classroom
DELETE /classrooms/{id}      - [TEACHER] Delete classroom
POST   /classrooms/{id}/join - [STUDENT] Join via join_code

Assignments (Role-Dependent):
-----------------------------
GET    /classrooms/{id}/assignments     - List assignments
POST   /classrooms/{id}/assignments     - [TEACHER] Create assignment
GET    /assignments/{id}                - Get assignment details
PUT    /assignments/{id}                - [TEACHER] Update assignment
DELETE /assignments/{id}                - [TEACHER] Delete assignment

Submissions (Role-Dependent):
-----------------------------
POST   /assignments/{id}/submit         - [STUDENT] Submit circuit JSON
GET    /assignments/{id}/submissions    - [TEACHER] List all submissions
GET    /submissions/{id}                - Get submission (own or any if teacher)
POST   /submissions/{id}/grade          - [TEACHER] Add score & feedback

Circuit Validation:
-------------------
POST   /circuits/validate     - Validate circuit JSON without saving (both roles)
POST   /circuits/simulate     - Run simulation and return output (both roles)

Request/Response Examples:
--------------------------
POST /assignments/{id}/submit
Request Body:
{
  "circuit_json": {
    "nodes": [
      {"id": "n1", "type": "AND", "inputs": ["A", "B"]},
      {"id": "n2", "type": "NOT", "inputs": ["n1"]}
    ],
    "wires": [["A", "n1"], ["B", "n1"], ["n1", "n2"]]
  }
}
Response (200 OK):
{
  "submission_id": "550e8400-e29b-41d4-a716-446655440000",
  "score": null,
  "status": "submitted",
  "submitted_at": "2026-04-06T10:30:00Z"
}

================================================================================
6. SEQUENCE DIAGRAM (Student Submits Circuit)
================================================================================

Student     Frontend(React)      Backend(FastAPI)      PostgreSQL
   │              │                     │                  │
   │─Draw circuit─▶│                     │                  │
   │              │─POST /submit────────▶│                  │
   │              │  (JWT in header)     │                  │
   │              │                      │─SELECT role─────▶│
   │              │                      │  FROM users      │
   │              │                      │◀─role='student'─ │
   │              │                      │                  │
   │              │                      │─Validate JSON────│
   │              │                      │ & run simulation │
   │              │                      │                  │
   │              │                      │─INSERT INTO─────▶│
   │              │                      │  submissions     │
   │              │                      │◀─OK──────────────│
   │              │◀─201 Created────────│                  │
   │◀─Show success│                      │                  │
   │              │                      │                  │

================================================================================
7. NON-FUNCTIONAL REQUIREMENTS
================================================================================

Performance:
------------
- Circuit validation response time: < 500ms (95th percentile)
- Concurrent user support: Minimum 50 simultaneous users
- Database query optimization: Index on foreign keys and join_code

Security:
---------
- Passwords: bcrypt hashed (cost factor = 12)
- JWT expiry: Access token = 1 hour, Refresh token = 7 days
- HTTPS only (TLS 1.2+ in production)
- SQL injection prevention: SQLAlchemy ORM (parameterized queries)
- CORS: Restrict to frontend origin only
- Rate limiting: 100 requests per minute per user

Data Integrity:
---------------
- ENUM('student','teacher') enforced at database level (PostgreSQL)
- Foreign key constraints with CASCADE where appropriate
- Circuit JSON validated against Pydantic schema before storage
- Submission score range: 0-100 (CHECK constraint)

Availability:
-------------
- Uptime target: 99.5% (for course project duration)
- Graceful error handling with appropriate HTTP status codes

Scalability (Future Consideration):
-----------------------------------
- Stateless backend allows horizontal scaling
- PostgreSQL connection pooling (default: 20 connections)
- Cache layer (Redis) for frequently accessed classrooms

================================================================================
8. DATABASE SCHEMA (PostgreSQL DDL Excerpt)
================================================================================

-- ENUM type definition (matches ERD)
CREATE TYPE user_role AS ENUM ('student', 'teacher');

-- Users table with native ENUM
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Submissions table with JSONB (better than JSON for querying)
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    circuit_json JSONB NOT NULL,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    submitted_at TIMESTAMP DEFAULT NOW(),
    feedback TEXT
);

-- Index for performance
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_classroom_join_code ON classrooms(join_code);

================================================================================
9. TESTING STRATEGY
================================================================================

Unit Tests (Pytest for FastAPI):
--------------------------------
- Test each API endpoint in isolation
- Mock database layer for speed
- Target: 90% code coverage
- Example test cases:
  * test_student_cannot_create_classroom()
  * test_teacher_can_grade_submission()
  * test_invalid_circuit_json_returns_400()

Integration Tests (Testcontainers + PostgreSQL):
------------------------------------------------
- Spin up real PostgreSQL container per test run
- Test full request → database → response flow
- Verify ENUM constraints actually reject invalid roles

End-to-End Tests (Playwright):
------------------------------
- Test complete user journey:
  1. Teacher creates classroom
  2. Student joins via code
  3. Student submits circuit
  4. Teacher grades submission
  5. Student sees grade

Test Data Fixtures:
------------------
- Predefined circuits (valid AND gate, invalid open wire, etc.)
- Sample users (2 students, 2 teachers)

================================================================================
10. DEPLOYMENT ARCHITECTURE (Development vs Production)
================================================================================

Development Environment:
------------------------
- Frontend: Vite dev server on http://localhost:5173
- Backend: Uvicorn on http://localhost:8000
- Database: PostgreSQL running in Docker container
- Environment variables in .env file

Production Environment (Recommended):
-------------------------------------
- Frontend: Built static files served by Nginx
- Backend: Gunicorn + Uvicorn workers (4 workers)
- Database: Managed PostgreSQL (AWS RDS / Neon.tech)
- Reverse Proxy: Nginx or Caddy (handles SSL termination)
- Containerization: Docker Compose (see below)

Docker Compose Configuration (docker-compose.yml):
--------------------------------------------------
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: logicplay
      POSTGRES_USER: logicplay_user
      POSTGRES_PASSWORD: secure_password_here
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://logicplay_user:secure_password_here@db:5432/logicplay
      SECRET_KEY: your_jwt_secret_key
    depends_on:
      - db
    ports:
      - "8000:8000"
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data: