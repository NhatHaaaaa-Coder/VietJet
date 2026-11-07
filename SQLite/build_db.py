import sqlite3
import os
import sys

# Đảm bảo in UTF-8 trên Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

db_path = os.path.join(os.path.dirname(__file__), 'vietjet.db')
sql_path = os.path.join(os.path.dirname(__file__), 'init_db.sql')

print(f"Reading SQL script from: {sql_path}")
with open(sql_path, 'r', encoding='utf-8') as f:
    sql_script = f.read()

print(f"Connecting to database: {db_path}")
if os.path.exists(db_path):
    os.remove(db_path)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.executescript(sql_script)
conn.commit()

print("\n--- KET QUA KHOI TAO CO SO DU LIEU SQLITE ---")
tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';").fetchall()
for t in tables:
    count = cursor.execute(f"SELECT count(*) FROM {t[0]}").fetchone()[0]
    print(f"  [Bang] {t[0]:<12} : {count:>2} ban ghi")

conn.close()
print(f"\nCo so du lieu SQLite da san sang tai: {db_path}")

