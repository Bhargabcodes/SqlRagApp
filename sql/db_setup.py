import sqlite3

# This creates a real file named 'ecommerce.db' in your current folder
connection = sqlite3.connect("ecommerce.db")
cursor = connection.cursor()

# Create the table structure
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

# Insert data safely
cursor.executemany("INSERT OR IGNORE INTO products VALUES (?, ?, ?, ?)", sample_data)

connection.commit()
connection.close()
print("Database 'ecommerce.db' created and populated successfully!")