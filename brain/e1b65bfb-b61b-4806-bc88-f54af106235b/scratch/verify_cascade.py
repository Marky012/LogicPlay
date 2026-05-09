from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker
from backend.app.models import Base, Classroom, Assignment, User
from backend.app.database import engine, SessionLocal

# Re-enable foreign keys just in case the imported engine doesn't have the listener yet
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

db = SessionLocal()

try:
    # 1. Ensure we have a teacher
    teacher = db.query(User).filter(User.role == "teacher").first()
    if not teacher:
        teacher = User(username="test_teacher", role="teacher")
        db.add(teacher)
        db.commit()
    
    # 2. Create a classroom
    cls = Classroom(name="Orphan Verification Class", teacher_id=teacher.id, join_code="TEST11")
    db.add(cls)
    db.commit()
    cls_id = cls.id
    print(f"Created Classroom ID: {cls_id}")

    # 3. Create an assignment
    assign = Assignment(title="Orphan Verification Assign", teacher_id=teacher.id, classroom_id=cls_id, accept_late=True)
    db.add(assign)
    db.commit()
    assign_id = assign.id
    print(f"Created Assignment ID: {assign_id}")

    # 4. Verify they exist
    assert db.query(Classroom).filter(Classroom.id == cls_id).first() is not None
    assert db.query(Assignment).filter(Assignment.id == assign_id).first() is not None
    print("Verification: Both exist.")

    # 5. Delete the classroom
    db.delete(cls)
    db.commit()
    print(f"Deleted Classroom ID: {cls_id}")

    # 6. Verify assignment is gone (CASCADE check)
    orphaned_assign = db.query(Assignment).filter(Assignment.id == assign_id).first()
    if orphaned_assign is None:
        print("SUCCESS: Assignment was automatically deleted (CASCADE worked).")
    else:
        print("FAILURE: Assignment still exists!")
        # Clean up manually if failed
        db.delete(orphaned_assign)
        db.commit()

finally:
    db.close()
