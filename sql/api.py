import os
import sqlite3
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "RAG")
    )
)

from db_executor import execute_llm_query
from rag_engine import generate_sql, llm
from schema_parser import create_tables_from_schema

app = FastAPI(
    title="SQL RAG API",
    description="API for executing SQL queries on the ecommerce database",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str
    schema: str


class SQLRequest(BaseModel):
    query: str


class SchemaRequest(BaseModel):
    schema_name: str
    schema_content: str


# Step 7 — Pydantic Request Model for inserting custom data rows
class InsertRowRequest(BaseModel):
    table_name: str
    data: dict


# --- New Request Model for Deleting Rows ---
class DeleteRowRequest(BaseModel):
    table_name: str
    row_id: str | int
    id_column: str


@app.get("/")
def home():
    return {"message": "SQL RAG Backend Running"}


@app.post("/execute")
def execute(request: SQLRequest):
    result = execute_llm_query(request.query)

    return {"query": request.query, "results": result}


# --- Modified Generate Endpoint ---
@app.post("/generate")
def generate(request: QuestionRequest):
    # Pass the schema cleanly into the SQL generator 
    sql = generate_sql(
        request.question,
        request.schema,
        retriever=None,
        llm_engine=llm,
        top_k=2,
    )

    return {"question": request.question, "sql": sql}


@app.post("/save-schema")
def save_schema(request: SchemaRequest):
    conn = sqlite3.connect("ecommerce.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO schemas 
        (schema_name, schema_content) 
        VALUES (?, ?)
        """,
        (request.schema_name, request.schema_content),
    )

    conn.commit()
    conn.close()

    create_tables_from_schema(request.schema_content)

    return {"message": "Schema saved successfully"}


# --- Step 1 — Modified Delete API Endpoint ---
@app.delete("/schema/{schema_id}")
def delete_schema(schema_id: int):
    conn = sqlite3.connect("ecommerce.db")
    cursor = conn.cursor()

    # Get schema content first
    cursor.execute(
        """
        SELECT schema_content 
        FROM schemas 
        WHERE id=?
        """,
        (schema_id,),
    )

    row = cursor.fetchone()

    if row:
        schema_content = row[0]

        tables = schema_content.split(")")

        for table in tables:
            table = table.strip()

            if not table:
                continue

            table_name = (
                table.split("(")[0].replace(",", "").strip()
            )

            try:
                cursor.execute(
                    f"DROP TABLE IF EXISTS {table_name}"
                )
            except:
                pass

    # Delete schema entry
    cursor.execute(
        "DELETE FROM schemas WHERE id=?", (schema_id,)
    )

    conn.commit()
    conn.close()

    return {"message": "Schema and tables deleted"}


# Step 7 — Dynamic SQL Row Insertion Endpoint
@app.post("/insert-row")
def insert_row(request: InsertRowRequest):
    conn = None

    try:
        conn = sqlite3.connect("ecommerce.db")
        cursor = conn.cursor()

        clean_columns = [
            col.split()[0]
            for col in request.data.keys()
        ]

        columns = ", ".join(clean_columns)

        placeholders = ", ".join(
            ["?" for _ in request.data]
        )

        values = list(request.data.values())

        query = f"""
        INSERT INTO {request.table_name}
        ({columns})
        VALUES
        ({placeholders})
        """

        print("TABLE:", request.table_name)
        print("VALUES:", values)

        cursor.execute(query, values)

        conn.commit()

        return {"message": "Row inserted successfully"}

    except Exception as e:
        return {"error": str(e)}

    finally:
        if conn:
            conn.close()

# --- New Endpoint: Dynamic Row Deletion ---
@app.post("/delete-row")
def delete_row(request: DeleteRowRequest):
    conn = sqlite3.connect("ecommerce.db")
    cursor = conn.cursor()

    # Clean the identifier columns to prevent targeting errors
    clean_id_column = request.id_column.split()[0]

    # Build the parameterized query securely
    query = f"""
    DELETE FROM {request.table_name}
    WHERE {clean_id_column} = ?
    """

    cursor.execute(query, (request.row_id,))
    
    conn.commit()
    conn.close()

    return {"message": "Row deleted successfully"}


@app.get("/tables")
def get_tables():
    conn = sqlite3.connect("ecommerce.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT name 
        FROM sqlite_master 
        WHERE type='table'
    """)

    rows = cursor.fetchall()

    conn.close()

    return [
        row[0]
        for row in rows
        if row[0] != "schemas"
        and not row[0].startswith("sqlite_")
    ]


@app.get("/schemas")
def get_schemas():
    conn = sqlite3.connect("ecommerce.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, schema_name, schema_content 
        FROM schemas
        """
    )

    rows = cursor.fetchall()

    conn.close()

    return [
        {
            "id": row[0],
            "schema_name": row[1],
            "schema_content": row[2],
        }
        for row in rows
    ]


@app.get("/table/{table_name}")
def get_table_data(table_name: str):
    conn = sqlite3.connect("ecommerce.db")
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute(
        f"SELECT * FROM {table_name} LIMIT 20"
    )

    rows = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return rows