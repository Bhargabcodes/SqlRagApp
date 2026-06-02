# Deterministic Text-to-SQL RAG Pipeline (`SqlRagApp`)

A production-grade, highly deterministic Text-to-SQL system powered by **LangChain**, **ChromaDB**, and the **Groq LLM API**.

Unlike naive Text-to-SQL applications that force complex database tables into vector spaces, this architecture treats them separately:

1. **Dynamic Local Schema Injection:** Your database layout (tables, columns, keys) is injected directly into the LLM context envelope in a compact format, allowing you to swap active schema environments on the fly without changing vector embeddings.
2. **RAG-Based Syntax Reference Retrieval:** The system embeds complex, technical query design patterns (such as multi-table joining conditions, window partition groupings, and gaps-and-islands logic) from specialized PDF manuals. The pipeline matches user intent to the absolute best structural blueprints before generating pure, production-ready SQL statements.

---

## 🛠️ Tech Stack & Core Foundations

* **Runtime:** Python 3.12
* **Package Management:** [Astral `uv](https://www.google.com/search?q=%5Bhttps://github.com/astral-sh/uv%5D(https://github.com/astral-sh/uv))` (blazing fast virtual environments and lockfile tracking)
* **LLM Orchestration:** `langchain-groq`
* **Vector Database Engine:** `chromadb`
* **Local Embedding Models:** `sentence-transformers` (`all-MiniLM-L6-v2` generating 384-dimensional dense vectors)

---

## 📂 Project Directory Architecture

```text
SNBOSEPROJECT/
├── .env                         # Local secret tokens (GROQ_API_KEY)
├── .gitignore                   # Safety block to prevent leaking credentials/DBs
├── pyproject.toml               # Modern tool dependency management definitions
├── uv.lock                      # Astral dependency resolution state file
├── main.py                      # Unifed runtime script
├── data/
│   ├── pdfs/                    # Reference documentation source matrix (SQL Guides)
│   └── vector_store/            # Persistent SQLite ChromaDB embedding database
└── notebook/
    └── pdf_loader.ipynb         # Interactive research and pipeline sandbox notebook

```

---

## 🚀 Getting Started

### 1. Clone & Synchronize the Workspace

Ensure you have `uv` installed, then synchronize your package matrix:

```bash
# Initialize and sync your virtual environment instantly
uv sync

```

### 2. Configure Environment Variables

Create a `.env` file in the project root path and append your API credential:

```env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here

```

### 3. Load and Ingest Documents

Place your target dialect manual or design guide PDFs (e.g., `SQL_Complete_Guide_Clean.pdf`) into the `data/pdfs/` folder. Then, execute your ingestion steps inside `notebook/pdf_loader.ipynb` to chunk your pages and generate the embedding collection.

---

## 💡 Production Blueprint & Prompt Design

The core engineering block leverages isolated string compilation patterns to safely use compact custom formats without triggering Python engine template parsing issues:

```python
SQL_PROMPT_TEMPLATE = """You are an expert SQL assistant. Your task is to generate a valid, executable SQL query based on the user's question, the provided database schema, and the retrieved SQL rules and templates.

=== DATABASE SCHEMA ===
{schema}

=== SQL SYNTAX REFERENCE & TEMPLATES (Retrieved Context) ===
{context}

=== STRICTOR SYSTEM GUIDELINES ===
- Only use tables, columns, and relationships defined in the DATABASE SCHEMA above.
- Do not invent column or table names under any circumstance.
- Align your query design with the retrieved SQL SYNTAX REFERENCE templates.
- Strictly return SELECT queries only. Never write DDL or destructive statements.
- Output ONLY the clean executable SQL block. Do not write markdown conversational text.

---
Question: {question}
SQL Query:"""

```

---

## 📊 Evaluation & Verification Outputs

The model translates complex questions into highly optimized, index-friendly window functions and SARGable expressions matching your technical guides:

### Test Scenario: Advanced Category Window Aggregations

**Dynamic Input Schema Provided:**

```text
students { student_id, student_name, class_id }
exam_scores { score_id, student_id, course_name, score_achieved }

```

**Natural Language Question Asked:**

> *"For each distinct class_id, find the students who achieved the top 2 highest unique exam scores across all courses combined. If there are ties in scores, preserve the ties without skipping ranking positions. Display the class_id, student_name, and their total score, sorted by class_id ascending and score descending."*

**Deterministic Output Generated:**

```sql
SELECT
    sub.class_id,
    sub.student_name,
    sub.total_score
FROM (
    SELECT
        s.student_id,
        s.student_name,
        s.class_id,
        SUM(e.score_achieved) AS total_score,
        DENSE_RANK() OVER (PARTITION BY s.class_id ORDER BY SUM(e.score_achieved) DESC) AS rnk
    FROM students s
    JOIN exam_scores e ON s.student_id = e.student_id
    GROUP BY s.student_id, s.student_name, s.class_id
) sub
WHERE sub.rnk <= 2
ORDER BY sub.class_id ASC, sub.total_score DESC;

```

---

## 🔒 Security & Safe Version Tracking

This repository has **GitHub Push Protection** safeguards actively enforced.

* Sensitive runtime environment constants (`.env`) and cache points are blocked at the baseline using target paths inside `.gitignore`.
* All notebook cellular outputs containing evaluation string values are wiped completely before deployment tracking commits to keep the pipeline clean and fully secure.
