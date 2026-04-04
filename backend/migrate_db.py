from app.database import engine
from app import models
import sqlite3

# Create the new tables
models.Base.metadata.create_all(bind=engine)

print("Tables created.")

# Add classroom_id to assignments if it doesn't exist
try:
    conn = sqlite3.connect('sql_app.db')
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE assignments ADD COLUMN classroom_id INTEGER REFERENCES classrooms(id)")
    print("Added classroom_id to assignments table.")
    conn.commit()
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower():
        print("Column classroom_id already exists in assignments.")
    else:
        print(f"Error altering table: {e}")
finally:
    if 'conn' in locals():
        conn.close()

# For test.db just in case
try:
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE assignments ADD COLUMN classroom_id INTEGER REFERENCES classrooms(id)")
    print("Added classroom_id to assignments table.")
    conn.commit()
except sqlite3.OperationalError as e:
    pass
finally:
    if 'conn' in locals():
        conn.close()

print("Migration complete!")
