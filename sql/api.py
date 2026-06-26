import os
import random
import string
import sqlite3
import smtplib
import json
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from dotenv import load_dotenv

import bcrypt
import jwt
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

# Load environment variables from RAG/.env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "RAG", ".env"))

# Local imports
from sql.db_executor import execute_llm_query
from sql.schema_parser import create_tables_from_schema
from RAG.rag_engine import generate_sql, llm
from RAG.pdf_loader import rag_retriever

app = FastAPI(
    title="SQL RAG API",
    description="API for executing SQL queries on the ecommerce database",
    version="2.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT config
JWT_SECRET = os.environ.get("JWT_SECRET", "sql-rag-app-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24

# Gmail SMTP config (from env vars; fallback for backward compatibility)
SMTP_EMAIL = os.environ.get("SMTP_EMAIL", "sqlragapp@gmail.com")
SMTP_APP_PASSWORD = os.environ.get("SMTP_APP_PASSWORD", "")
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

security = HTTPBearer(auto_error=False)

DB_PATH = os.path.join(os.path.dirname(__file__), "ecommerce.db")


# ─── Helper: Get DB connection ────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ─── Helper: Generate OTP ─────────────────────────────────────────────────

def generate_otp(length=6):
    return "".join(random.choices(string.digits, k=length))


# ─── Helper: Send OTP via Gmail SMTP ──────────────────────────────────────

def send_otp_email(to_email: str, otp: str):
    subject = "Your SQLRagApp OTP Verification Code"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background: #0A0614; padding: 40px;">
        <div style="max-width: 480px; margin: 0 auto; background: linear-gradient(135deg, #1a1030, #0d0820); border-radius: 20px; padding: 40px; border: 1px solid rgba(124, 58, 237, 0.2);">
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.2)); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(124,58,237,0.3);">
                    <span style="font-size: 28px;">🗄️</span>
                </div>
                <h1 style="color: #fff; font-size: 20px; margin: 0; font-weight: 600;">SQLRagApp</h1>
                <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin: 6px 0 0 0;">Email Verification</p>
            </div>
            <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                Thank you for registering! Use the verification code below to complete your registration. This code expires in 10 minutes.
            </p>
            <div style="background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.15); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 36px; letter-spacing: 12px; font-weight: 700; color: #a78bfa; font-family: monospace;">{otp}</span>
            </div>
            <p style="color: rgba(255,255,255,0.3); font-size: 12px; text-align: center;">
                If you didn't request this code, please ignore this email.
            </p>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email
    msg.attach(MIMEText(body, "html"))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        # Strip spaces from app password (Gmail app passwords often include spaces for readability)
        clean_password = SMTP_APP_PASSWORD.replace(" ", "")
        server.login(SMTP_EMAIL, clean_password)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


# ─── Helper: JWT Token ────────────────────────────────────────────────────

def create_token(user_id: int, email: str):
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    payload = verify_token(credentials.credentials)
    return payload


# ─── Pydantic Models ──────────────────────────────────────────────────────

class QuestionRequest(BaseModel):
    question: str
    schema: str

class SQLRequest(BaseModel):
    query: str

class SchemaRequest(BaseModel):
    schema_name: str
    schema_content: str

class InsertRowRequest(BaseModel):
    table_name: str
    data: dict

class DeleteRowRequest(BaseModel):
    table_name: str
    row_id: str | int
    id_column: str

class RegisterRequest(BaseModel):
    email: str
    password: str

class EmailRequest(BaseModel):
    email: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class LoginRequest(BaseModel):
    email: str
    password: str


# ─── Home ──────────────────────────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "SQL RAG Backend Running v2.0"}


# ═══════════════════════════════════════════════════════════════════════════
#  AUTH ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/register")
def register(request: RegisterRequest):
    """Register a new user with email and password. Sends OTP for verification."""
    email = request.email.strip().lower()
    password = request.password

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    conn = get_db()
    cursor = conn.cursor()

    # Check if email already exists
    cursor.execute("SELECT id, is_verified FROM users WHERE email = ?", (email,))
    existing = cursor.fetchone()

    if existing:
        if existing["is_verified"]:
            conn.close()
            raise HTTPException(status_code=400, detail="Email already registered. Please log in.")
        else:
            # User exists but not verified — update password and resend OTP
            hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
            cursor.execute("UPDATE users SET password = ? WHERE email = ?", (hashed, email))
            conn.commit()
    else:
        # Create new user
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        cursor.execute(
            "INSERT INTO users (email, password, is_verified) VALUES (?, ?, 0)",
            (email, hashed),
        )
        conn.commit()

    conn.close()

    # Generate and send OTP
    otp = generate_otp()
    expires_at = (datetime.utcnow() + timedelta(minutes=10)).strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO otp_codes (email, otp, expires_at) VALUES (?, ?, ?)",
        (email, otp, expires_at),
    )
    conn.commit()
    conn.close()

    sent = send_otp_email(email, otp)

    if not sent:
        print("\n" + "="*80)
        print("  ⚠️  SMTP SEND FAILED! (DEVELOPMENT FALLBACK ACTIVE)")
        print(f"  Failed to send verification email to: {email}")
        print(f"  >>> YOUR VERIFICATION OTP CODE IS: {otp} <<<")
        print("  Please enter this code in the frontend UI to proceed.")
        print("="*80 + "\n")

    return {"message": "OTP sent to your email. Please verify to complete registration."}


@app.post("/resend-otp")
def resend_otp(request: EmailRequest):
    """Resend OTP to the user's email."""
    email = request.email.strip().lower()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, is_verified FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="Email not registered.")

    if user["is_verified"]:
        conn.close()
        raise HTTPException(status_code=400, detail="Email already verified. Please log in.")

    conn.close()

    # Generate and send new OTP
    otp = generate_otp()
    expires_at = (datetime.utcnow() + timedelta(minutes=10)).strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO otp_codes (email, otp, expires_at) VALUES (?, ?, ?)",
        (email, otp, expires_at),
    )
    conn.commit()
    conn.close()

    sent = send_otp_email(email, otp)

    if not sent:
        print("\n" + "="*80)
        print("  ⚠️  SMTP SEND FAILED! (DEVELOPMENT FALLBACK ACTIVE)")
        print(f"  Failed to resend verification email to: {email}")
        print(f"  >>> YOUR VERIFICATION OTP CODE IS: {otp} <<<")
        print("  Please enter this code in the frontend UI to proceed.")
        print("="*80 + "\n")

    return {"message": "OTP resent to your email."}


@app.post("/verify-otp")
def verify_otp(request: VerifyOTPRequest):
    """Verify the OTP code and activate the user account."""
    email = request.email.strip().lower()

    conn = get_db()
    cursor = conn.cursor()

    # Get latest unused OTP for this email
    cursor.execute(
        """SELECT id, otp, expires_at FROM otp_codes
           WHERE email = ? AND used = 0
           ORDER BY id DESC LIMIT 1""",
        (email,),
    )
    record = cursor.fetchone()

    if not record:
        conn.close()
        raise HTTPException(status_code=400, detail="No OTP found. Please request a new one.")

    # Check expiry
    expires_at = datetime.strptime(record["expires_at"], "%Y-%m-%d %H:%M:%S")
    if datetime.utcnow() > expires_at:
        conn.close()
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    # Check OTP
    if record["otp"] != request.otp:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid OTP code.")

    # Mark OTP as used
    cursor.execute("UPDATE otp_codes SET used = 1 WHERE id = ?", (record["id"],))

    # Mark user as verified
    cursor.execute("UPDATE users SET is_verified = 1 WHERE email = ?", (email,))
    conn.commit()

    # Get user for token
    cursor.execute("SELECT id, email FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    # Generate JWT token
    token = create_token(user["id"], user["email"])

    return {
        "message": "Account verified successfully!",
        "token": token,
        "user": {"id": user["id"], "email": user["email"]},
    }


@app.post("/login")
def login(request: LoginRequest):
    """Login with email and password. Returns JWT token."""
    email = request.email.strip().lower()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, email, password, is_verified FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Check password
    if not bcrypt.checkpw(request.password.encode("utf-8"), user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Check if verified
    if not user["is_verified"]:
        raise HTTPException(status_code=401, detail="Email not verified. Please verify your OTP first.")

    # Generate JWT token
    token = create_token(user["id"], user["email"])

    return {
        "message": "Login successful!",
        "token": token,
        "user": {"id": user["id"], "email": user["email"]},
    }


@app.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info from JWT token."""
    return {
        "user": {
            "id": current_user["user_id"],
            "email": current_user["email"],
        }
    }


# ═══════════════════════════════════════════════════════════════════════════
#  SCHEMA ENDPOINTS (User-specific)
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/schemas")
def get_schemas(current_user: dict = Depends(get_current_user)):
    """Get all schemas for the current user."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """SELECT id, schema_name, schema_content
           FROM schemas
           WHERE user_id = ?
           ORDER BY id DESC""",
        (current_user["user_id"],),
    )

    rows = cursor.fetchall()
    conn.close()

    return [
        {"id": row["id"], "schema_name": row["schema_name"], "schema_content": row["schema_content"]}
        for row in rows
    ]


@app.post("/save-schema")
def save_schema(request: SchemaRequest, current_user: dict = Depends(get_current_user)):
    """Save a new schema for the current user."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """INSERT INTO schemas (schema_name, schema_content, user_id)
           VALUES (?, ?, ?)""",
        (request.schema_name, request.schema_content, current_user["user_id"]),
    )

    conn.commit()
    conn.close()

    create_tables_from_schema(request.schema_content)

    return {"message": "Schema saved successfully"}


@app.delete("/schema/{schema_id}")
def delete_schema(schema_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a schema owned by the current user."""
    conn = get_db()
    cursor = conn.cursor()

    # Verify ownership
    cursor.execute(
        "SELECT schema_content, user_id FROM schemas WHERE id = ?",
        (schema_id,),
    )
    schema = cursor.fetchone()

    if not schema:
        conn.close()
        raise HTTPException(status_code=404, detail="Schema not found.")

    if schema["user_id"] != current_user["user_id"]:
        conn.close()
        raise HTTPException(status_code=403, detail="You don't have permission to delete this schema.")

    schema_content = schema["schema_content"]

    # Drop associated tables
    tables = schema_content.split(")")
    for table in tables:
        table = table.strip()
        if not table:
            continue
        table_name = table.split("(")[0].replace(",", "").strip()
        try:
            cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
        except:
            pass

    cursor.execute("DELETE FROM schemas WHERE id = ?", (schema_id,))
    conn.commit()
    conn.close()

    return {"message": "Schema and tables deleted"}


# ═══════════════════════════════════════════════════════════════════════════
#  QUERY / DATA ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/execute")
def execute(request: SQLRequest):
    """Execute a raw SQL query."""
    result = execute_llm_query(request.query)
    return {"query": request.query, "results": result}


@app.post("/generate")
def generate(request: QuestionRequest):
    """Generate SQL from natural language."""
    # Lazy import to allow server to start without GROQ_API_KEY
    from RAG.rag_engine import generate_sql, llm
    sql = generate_sql(
        request.question,
        request.schema,
        retriever=rag_retriever,
        llm_engine=llm,
        top_k=2,
    )
    return {"question": request.question, "sql": sql}


@app.post("/insert-row")
def insert_row(request: InsertRowRequest):
    """Insert a row into a table."""
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        clean_columns = [col.split()[0] for col in request.data.keys()]
        columns = ", ".join(clean_columns)
        placeholders = ", ".join(["?" for _ in request.data])
        values = list(request.data.values())

        query = f"INSERT INTO {request.table_name} ({columns}) VALUES ({placeholders})"
        cursor.execute(query, values)
        conn.commit()

        return {"message": "Row inserted successfully"}
    except Exception as e:
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


@app.post("/delete-row")
def delete_row(request: DeleteRowRequest):
    """Delete a row from a table."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    clean_id_column = request.id_column.split()[0]
    query = f"DELETE FROM {request.table_name} WHERE {clean_id_column} = ?"
    cursor.execute(query, (request.row_id,))

    conn.commit()
    conn.close()

    return {"message": "Row deleted successfully"}


@app.get("/tables")
def get_tables():
    """Get all table names in the database."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    rows = cursor.fetchall()
    conn.close()

    return [row["name"] for row in rows if row["name"] != "schemas" and not row["name"].startswith("sqlite_")]


@app.get("/table/{table_name}")
def get_table_data(table_name: str):
    """Get data from a specific table."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute(f"SELECT * FROM {table_name} LIMIT 20")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return rows
