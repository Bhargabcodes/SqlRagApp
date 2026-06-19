from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")

llm = ChatGroq(
    groq_api_key=groq_api_key,
    model_name="openai/gpt-oss-120b",
    temperature=0.1,
    max_tokens=1024
)

SQL_PROMPT_TEMPLATE = """You are an expert SQL assistant. Your task is to generate a valid, executable SQL query based on the user's question, the provided database schema, and the retrieved SQL rules and templates.

=== DATABASE SCHEMA ===
{schema}

=== SQL SYNTAX REFERENCE & TEMPLATES (Retrieved Context) ===
{context}

=== STRICTOR SYSTEM GUIDELINES ===
- Only use tables, columns, and relationships defined in the DATABASE SCHEMA above.
- Do not invent column or table names.
- Strictly return SELECT queries only.
- Do not use markdown code fences.
- Return only raw SQL.
- Output ONLY the clean executable SQL block.

Question:
{question}

SQL Query:"""
def generate_sql(query, schema_input, retriever=None, llm_engine=None, top_k=4):
    print("GENERATE_SQL CALLED")
    context = "Use standard SQL syntax."

    formatted_prompt = SQL_PROMPT_TEMPLATE.format(
        schema=schema_input,
        context=context,
        question=query
    )

    response = llm.invoke([formatted_prompt])

    return response.content