"""
Lightweight RAG retriever for the SQL RAG app.

Opens the existing ChromaDB vector store (data/vector_store) and provides
query-based retrieval of SQL syntax references.

Intentionally does NOT run the PDF ingestion pipeline at import time --
that lives in pdf_loader.py, which is a Jupyter-style script that executes
document loading, splitting, and embedding on every import.
"""

import os

from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

import chromadb
from sentence_transformers import SentenceTransformer

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PERSIST_DIRECTORY = os.path.join(PROJECT_ROOT, "data", "vector_store")
COLLECTION_NAME = "all_pdf_documents"
MODEL_NAME = "all-MiniLM-L6-v2"


class EmbeddingManager:
    """Generates embeddings using a local sentence-transformers model."""

    def __init__(self, model_name: str = MODEL_NAME):
        self.model = SentenceTransformer(model_name)

    def embed(self, texts):
        return self.model.encode(texts)


class Retriever:
    """Handles query-based retrieval from the persistent vector store."""

    def __init__(self):
        os.makedirs(PERSIST_DIRECTORY, exist_ok=True)
        self.client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"description": "PDF document embeddings for RAG"},
        )
        self.embedding_manager = EmbeddingManager()

    def retrieve(self, query: str, top_k: int = 5, score_threshold: float = 0.0):
        """
        Retrieve relevant documents for a query.

        Args:
            query: The search query
            top_k: Number of top results to return
            score_threshold: Minimum similarity score threshold

        Returns:
            List of dicts with id, content, metadata, similarity_score, distance
        """
        try:
            query_embedding = self.embedding_manager.embed([query])[0]
            results = self.collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=top_k,
            )
        except Exception as e:
            print(f"[retriever] retrieval failed: {e}")
            return []

        retrieved_docs = []
        if results.get("documents") and results["documents"][0]:
            for doc_id, document, metadata, distance in zip(
                results["ids"][0],
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0],
            ):
                # Convert distance to similarity score (ChromaDB uses cosine distance)
                similarity_score = 1 - distance
                if similarity_score >= score_threshold:
                    retrieved_docs.append(
                        {
                            "id": doc_id,
                            "content": document,
                            "metadata": metadata,
                            "similarity_score": similarity_score,
                            "distance": distance,
                        }
                    )
        return retrieved_docs


rag_retriever = Retriever()
