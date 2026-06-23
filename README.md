# SQL Rag App

A full-stack **Text-to-SQL** application that lets you describe what you want in plain English and get executable SQL queries — backed by AI, user authentication, and an interactive UI.

![Tech Stack](https://img.shields.io/badge/stack-FastAPI_%7C_React_%7C_SQLite_%7C_Groq-7C3AED)

---

## Architecture

The project is organized into three main modules:

```
SqlRagApp/
├── RAG/              # Python Text-to-SQL engine (LangChain + Groq + ChromaDB)
├── sql/              # FastAPI backend (auth, schema management, query execution)
├── frontend/         # React + Vite web application
└── data/             # Persistent data (ChromaDB vector store)
```

### RAG Engine (`RAG/`)

A deterministic Text-to-SQL pipeline that separates database schema injection from vector-based syntax retrieval:

- **Dynamic Schema Injection** — Your database layout (tables, columns, keys) is injected directly into the LLM prompt, so you can swap schemas without re-embedding.
- **RAG-Based Syntax Retrieval** — Complex SQL patterns (joins, window functions, etc.) are embedded from PDF manuals and matched against user intent.
- **Groq LLM** — Uses `openai/gpt-oss-120b` for fast, low-latency SQL generation.
- **ChromaDB** — Vector store for embeddings, backed by SQLite.
- **Sentence Transformers** — `all-MiniLM-L6-v2` (384-dim) for local embedding.

### SQL Backend (`sql/`)

A FastAPI server (`http://127.0.0.1:8000`) that provides:

- **User Authentication** — Email/password registration with OTP verification via Gmail SMTP.
- **JWT Sessions** — 24-hour token-based auth.
- **Schema Management** — Save, load, and delete custom database schemas. Each schema auto-creates the corresponding SQLite tables.
- **Query Execution** — Execute raw SQL or AI-generated queries against the SQLite database.
- **Data Management** — Insert and delete rows in custom tables.
- **SQL Generation** — Convert natural language questions into SQL via the RAG engine.

### Frontend (`frontend/`)

A React 19 + Vite single-page application with a dark glass-morphism UI featuring:

- **Login / Registration** — OTP-based email verification flow.
- **Schema Manager** — Create, save, and browse database schemas.
- **Data Manager** — Browse tables, insert and delete rows interactively.
- **AI Text-to-SQL** — Ask questions in English and generate SQL.
- **SQL Editor** — Write, edit, and execute SQL queries with a code editor.
- **Results Panel** — View query results in a styled table with loading and error states.
- **Animated Background** — Three.js-powered color bends, gradient orbs, and glass effects.

---

## Tech Stack

| Layer        | Technology                                                      |
|-------------|-----------------------------------------------------------------|
| **Runtime** | Python 3.12, Node.js                                            |
| **Backend** | FastAPI, LangChain, LangChain-Groq, SQLAlchemy, Pandas          |
| **Frontend**| React 19, Vite 8, Tailwind CSS v4, GSAP, Three.js              |
| **Database**| SQLite (via SQLAlchemy / LangChain)                             |
| **Vector DB**| ChromaDB with sentence-transformers                             |
| **LLM**     | Groq API (`openai/gpt-oss-120b`)                                |
| **Auth**    | bcrypt + JWT + OTP email verification (Gmail SMTP)              |
| **Package** | `uv` (Python), npm/pnpm (Node)                                  |

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- [uv](https://github.com/astral-sh/uv) (recommended) or pip
- A [Groq API key](https://console.groq.com)

### 1. Clone & Set Up the RAG Engine

```bash
cd RAG
uv sync          # or: pip install -r requirements.txt
```

Create a `.env` file in the `RAG/` directory:

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 2. Set Up the SQL Backend

```bash
cd sql
uv sync          # or: pip install -r requirements.txt
```

Initialize the database:

```bash
python db_setup.py
```

This creates `ecommerce.db` with sample `products`, `users`, `otp_codes`, and `schemas` tables.

Start the FastAPI server:

```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://127.0.0.1:8000`.

### 3. Set Up the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## API Endpoints

### Authentication

| Method | Endpoint        | Description                          |
|--------|----------------|--------------------------------------|
| POST   | `/register`    | Register with email & password       |
| POST   | `/resend-otp`  | Resend OTP verification code         |
| POST   | `/verify-otp`  | Verify OTP and activate account      |
| POST   | `/login`       | Login with email & password          |
| GET    | `/me`          | Get current user from JWT token      |

### Schemas

| Method | Endpoint          | Description                        |
|--------|------------------|------------------------------------|
| GET    | `/schemas`       | List all saved schemas (user-scoped) |
| POST   | `/save-schema`   | Save a new schema & create tables  |
| DELETE | `/schema/{id}`   | Delete a schema and its tables     |

### Query & Data

| Method | Endpoint          | Description                           |
|--------|------------------|---------------------------------------|
| POST   | `/execute`       | Execute a raw SQL query               |
| POST   | `/generate`      | Convert natural language to SQL       |
| POST   | `/insert-row`    | Insert a row into a table             |
| POST   | `/delete-row`    | Delete a row from a table             |
| GET    | `/tables`        | List all database tables              |
| GET    | `/table/{name}`  | Get data from a specific table        |

---

## Example Usage

**1. Register an account** — Enter your email and password. An OTP is sent to your email.

**2. Verify your email** — Enter the 6-digit code from your inbox.

**3. Select a data source** — Use the default e-commerce database or add a custom schema:

```
Students(student_id INTEGER PRIMARY KEY, name TEXT, age INTEGER)
Courses(course_id INTEGER PRIMARY KEY, course_name TEXT, credits INTEGER)
```

**4. Ask in English:**

> *"Find the most expensive product"*

**5. SQL is generated:**

```sql
SELECT * FROM products ORDER BY price DESC LIMIT 1;
```

**6. Execute** — Click "Run Query" to see the results.

---

## Project Structure

```
SqlRagApp/
├── RAG/
│   ├── rag_engine.py          # SQL generation logic
│   ├── pdf_loader.py          # PDF ingestion for syntax references
│   ├── main.py                # Entry point
│   ├── test_groq.py           # Groq API tests
│   ├── notebook/
│   │   ├── pdf_loader.ipynb   # Interactive PDF ingestion notebook
│   │   └── document.ipynb     # Document exploration notebook
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── uv.lock
├── sql/
│   ├── api.py                 # FastAPI application (all endpoints)
│   ├── app.py                 # Interactive SQL terminal
│   ├── db_setup.py            # Database initialization
│   ├── db_executor.py         # SQL execution via LangChain
│   ├── schema_parser.py       # Schema-to-SQL table creation
│   └── __init__.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main application component
│   │   ├── main.jsx           # React entry point
│   │   ├── index.css          # Global styles + Tailwind
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state management
│   │   └── components/
│   │       ├── Header.jsx       # App header with user info
│   │       ├── Sidebar.jsx      # Schema explorer sidebar
│   │       ├── LoginPage.jsx    # Login/register/OTP flow
│   │       ├── SchemaManager.jsx  # Schema CRUD
│   │       ├── DataManager.jsx    # Table data viewer/editor
│   │       ├── QuestionInput.jsx  # Natural language input
│   │       ├── QueryEditor.jsx    # SQL code editor
│   │       ├── ResultsPanel.jsx   # Query results table
│   │       ├── LoadingSpinner.jsx  # Loading indicator
│   │       ├── ColorBends.jsx     # Three.js animated background
│   │       └── GradualBlur.jsx    # Edge blur effect
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── data/
│   └── vector_store/          # ChromaDB persistent storage
└── README.md
```

---

## License

This project is licensed under the MIT License — see the [`RAG/LICENSE`](RAG/LICENSE) file for details.
