import sys
from firebase_admin import auth
from firebase import firebase_config # This ensures Firebase initializes using your existing config
from crud import create_user, UserAlreadyExists
from db import get_db

def make_admin(email: str):
    try:
        # 1. Fetch user from Firebase
        print(f"Looking up '{email}' in Firebase...")
        firebase_user = auth.get_user_by_email(email)
        firebase_uid = firebase_user.uid
        print(f"Found Firebase user UID: {firebase_uid}")
        
        # 2. Check if they exist in the SQLite DB
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, role FROM users WHERE firebase_uid = ?", (firebase_uid,))
        existing = cursor.fetchone()
        
        if existing:
            if existing["role"] == "Admin":
                print("User is already an Admin in the database.")
            else:
                print(f"User found with role '{existing['role']}'. Updating to Admin...")
                cursor.execute("UPDATE users SET role = 'Admin' WHERE firebase_uid = ?", (firebase_uid,))
                conn.commit()
                print("Successfully promoted to Admin! ✅")
        else:
            print("User not found in local database. Creating as Admin...")
            create_user(firebase_uid, email.split("@")[0], email, "Admin")
            print("Successfully created as Admin! ✅")
            
        conn.close()
            
    except auth.UserNotFoundError:
        print(f"❌ Error: No user found in Firebase with email '{email}'.")
        print("Please make sure you have signed up on the frontend first.")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    print("-" * 40)
    print("   AssetFlow Admin Creation Utility")
    print("-" * 40)
    
    email = input("Enter the email address you signed up with: ").strip()
    
    if email:
        print("-" * 40)
        make_admin(email)
        print("-" * 40)
    else:
        print("❌ Email is required.")
