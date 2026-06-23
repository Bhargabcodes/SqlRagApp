import sqlite3
import re


def create_tables_from_schema(schema_text):
    conn = sqlite3.connect("ecommerce.db")
    cursor = conn.cursor()

    table_matches = re.findall(
        r'(\w+)\s*\((.*?)\)',
        schema_text,
        re.DOTALL
    )

    for table_name, columns_text in table_matches:

        columns = [
            col.strip()
            for col in columns_text.split(",")
            if col.strip()
        ]

        column_defs = ", ".join(columns)

        query = f"""
        CREATE TABLE IF NOT EXISTS {table_name}
        (
            {column_defs}
        )
        """

        print("CREATING:", table_name)
        print(query)

        cursor.execute(query)

    conn.commit()
    conn.close()