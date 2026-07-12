from db import get_db

conn = get_db()
cursor = conn.cursor()

# Department
cursor.execute("""
INSERT INTO departments(name)
VALUES ('IT')
""")

# Asset Category
cursor.execute("""
INSERT INTO asset_categories(name)
VALUES ('Laptop')
""")

# Asset Manager
cursor.execute("""
INSERT INTO users(firebase_uid,name,email,role,department_id)
VALUES
('uid1','Manager','manager@test.com','AssetManager',1)
""")

# Employee 1
cursor.execute("""
INSERT INTO users(firebase_uid,name,email,role,department_id)
VALUES
('uid2','Priya','priya@test.com','Employee',1)
""")

# Employee 2
cursor.execute("""
INSERT INTO users(firebase_uid,name,email,role,department_id)
VALUES
('uid3','Raj','raj@test.com','Employee',1)
""")

conn.commit()
conn.close()

print("Dummy data inserted successfully!")