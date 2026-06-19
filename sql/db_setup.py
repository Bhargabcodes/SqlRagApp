import sqlite3

conn = sqlite3.connect("ecommerce.db")
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

# Schemas table
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS schemas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        schema_name TEXT NOT NULL,
        schema_content TEXT NOT NULL
    )
    """
)

conn.commit()
conn.close()

print("Database 'ecommerce.db' created and populated successfully!")
print("Schemas table created.")