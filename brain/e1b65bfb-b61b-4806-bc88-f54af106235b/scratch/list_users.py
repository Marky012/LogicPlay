import sqlite3

conn = sqlite3.connect('d:/LogicPlay/backend/sql_app.db')
cursor = conn.cursor()

cursor.execute("SELECT id, username, role FROM users")
users = cursor.fetchall()
for u in users:
    print(u)

conn.close()
