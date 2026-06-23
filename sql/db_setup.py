import os
import sqlite3

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "ecommerce.db")
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Products table
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT,
        category TEXT,
        price REAL
    )
    """
)

sample_data = [
    (101, "Laptop", "Electronics", 1200.00),
    (102, "Smartphone", "Electronics", 800.00),
    (103, "Desk Chair", "Furniture", 150.00),
    (104, "Coffee Maker", "Appliances", 60.00),
    (105, "Monitor", "Electronics", 300.00),
]

cursor.executemany(
    "INSERT OR IGNORE INTO products VALUES (?, ?, ?, ?)",
    sample_data
)

# Users table
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_verified INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
)

# OTP codes table
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS otp_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        otp TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        used INTEGER DEFAULT 0
    )
    """
)

# Schemas table (with user_id for multi-user support)
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS schemas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        schema_name TEXT NOT NULL,
        schema_content TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """
)

conn.commit()
conn.close()

print("Database 'ecommerce.db' created and populated successfully!")
print("Users, OTP codes, and schemas tables created.")