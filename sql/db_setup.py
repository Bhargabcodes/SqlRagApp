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
        price REAL,
        category TEXT,
        stock INTEGER
    )
    """
)

sample_data = [
    (101, "Laptop", 1200.00, "Electronics", 15),
    (102, "Smartphone", 800.00, "Electronics", 30),
    (103, "Desk Chair", 150.00, "Furniture", 8),
    (104, "Coffee Maker", 60.00, "Appliances", 25),
    (105, "Monitor", 300.00, "Electronics", 12),
]

cursor.executemany(
    "INSERT OR IGNORE INTO products VALUES (?, ?, ?, ?, ?)",
    sample_data
)

# Customers table
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY,
        name TEXT,
        email TEXT
    )
    """
)

customer_data = [
    (1, "Alice Johnson", "alice@example.com"),
    (2, "Bob Smith", "bob@example.com"),
    (3, "Charlie Brown", "charlie@example.com"),
    (4, "Diana Prince", "diana@example.com"),
    (5, "Eve Adams", "eve@example.com"),
]

cursor.executemany(
    "INSERT OR IGNORE INTO customers VALUES (?, ?, ?)",
    customer_data
)

# Orders table
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        total REAL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
    """
)

order_data = [
    (1, 1, 1200.00),
    (2, 1, 150.00),
    (3, 2, 800.00),
    (4, 3, 60.00),
    (5, 5, 300.00),
]

cursor.executemany(
    "INSERT OR IGNORE INTO orders VALUES (?, ?, ?)",
    order_data
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