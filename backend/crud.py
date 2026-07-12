import sqlite3
from db import get_db

class UserAlreadyExists(Exception):
    pass

def create_user(firebase_uid, name, email, role):
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users(firebase_uid, name, email, role)
            VALUES (?, ?, ?, ?)
        """, (firebase_uid, name, email, role))
        conn.commit()
    except sqlite3.IntegrityError as e:
        raise UserAlreadyExists("User with this email or Firebase UID already exists.") from e
    finally:
        conn.close()


def get_all_users():
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users")
        users = [dict(row) for row in cursor.fetchall()]
        return users
    finally:
        conn.close()