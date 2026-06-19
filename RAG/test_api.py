from fastapi import FastAPI
from pydantic import BaseModel

from rag_engine import generate_sql, llm

app = FastAPI()

class QueryRequest(BaseModel):
    question: str

@app.get("/")
def home():
    return {"message": "Text-to-SQL API Running"}

@app.post("/generate")
def generate(request: QueryRequest):

    schema = """
    products { id, name, category, price }
    """

    sql = generate_sql(
        request.question,
        schema,
        retriever=None,  # temporary
        llm_engine=llm,
        top_k=2
    )

    return {
        "question": request.question,
        "sql": sql
    }