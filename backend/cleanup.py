import sqlite3
for db in ['sql_app.db', 'test.db']:
    try:
        conn = sqlite3.connect(db)
        c = conn.cursor()
        c.execute("DELETE FROM submissions")
        c.execute("DELETE FROM assignments")
        conn.commit()
    except: pass
    finally:
        if 'conn' in locals(): conn.close()
print("Cleaned!")
