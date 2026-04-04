from app.database import SessionLocal
from app.models import User
from app.crud import get_password_hash

def register_test_teacher(username, password):
    db = SessionLocal()
    existing = db.query(User).filter(User.username == username).first()
    if existing:
        print(f"User {username} already exists.")
        return
    
    hashed = get_password_hash(password)
    new_user = User(username=username, password_hash=hashed, role='teacher')
    db.add(new_user)
    db.commit()
    print(f"Teacher account '{username}' created successfully with password '{password}'!")

if __name__ == "__main__":
    register_test_teacher("admin_teacher", "LogicPlay2024!")
