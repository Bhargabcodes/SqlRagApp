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

SQL_PROMPT_TEMPLATE = """You are an expert SQL assistant. Your task is to generate a valid, executable SQL query based on the user's question, the provided database schema, and the retrieved context.

=== DATABASE SCHEMA ===
{schema}

=== RETRIEVED CONTEXT ===
{context}

=== STRICTOR SYSTEM GUIDELINES ===
- CRITICAL: Use ONLY tables and columns defined in the DATABASE SCHEMA above.
- CRITICAL: Ignore any other table or column not present in the provided DATABASE SCHEMA.
- Strictly return SELECT queries only.
- Do not use markdown code fences.
- Return only raw SQL.
- Output ONLY the clean executable SQL block.

Question:
{question}

SQL Query:"""
def generate_sql(query, schema_input, retriever=None, llm_engine=None, top_k=4):
    print("GENERATE_SQL CALLED")
    
    # RAG: Retrieve context if retriever is provided
    context = "Use standard SQL syntax."
    if retriever:
        retrieved_docs = retriever.retrieve(query, top_k=top_k)
        if retrieved_docs:
            context = "\n".join([doc['content'] for doc in retrieved_docs])
            print(f"Retrieved {len(retrieved_docs)} documents for context.")
        else:
            print("No documents retrieved.")
    else:
        print("No retriever provided. Using default context.")

    formatted_prompt = SQL_PROMPT_TEMPLATE.format(
        schema=schema_input,
        context=context,
        question=query
    )

    response = llm.invoke([formatted_prompt])

    return response.content