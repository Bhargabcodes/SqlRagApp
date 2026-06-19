import sqlite3


def create_tables_from_schema(schema_text):
    conn = sqlite3.connect("ecommerce.db")
    cursor = conn.cursor()

    tables = schema_text.split("),")

    for table in tables:
        table = table.strip().replace(")", "")

        table_name = table.split("(")[0].strip()

        columns_part = table.split("(")[1]

        columns = [
            col.strip()
            for col in columns_part.split(",")
        ]

        # --- Updated Block ---
        # Refactored to map direct raw column configurations
        column_defs = ", ".join(columns)

        query = f"""
        CREATE TABLE IF NOT EXISTS {table_name}
        (
            {column_defs}
        )
        """

        cursor.execute(query)

    conn.commit()
    conn.close()