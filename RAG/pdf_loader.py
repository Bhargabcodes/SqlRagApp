# %%

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from project root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

from langchain_community.document_loaders import PyPDFLoader, PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter


# %%
### Read all the pdf's inside the directory
def process_all_pdfs(pdf_directory):
    """Process all PDF files in a directory"""
    all_documents = []
    pdf_dir = Path(pdf_directory)
    
    # Find all PDF files recursively
    pdf_files = list(pdf_dir.glob("**/*.pdf"))
    
    print(f"Found {len(pdf_files)} PDF files to process")
    
    for pdf_file in pdf_files:
        print(f"\nProcessing: {pdf_file.name}")
        try:
            loader = PyPDFLoader(str(pdf_file))
            documents = loader.load()
            
            # Add source information to metadata
            for doc in documents:
                doc.metadata['source_file'] = pdf_file.name
                doc.metadata['file_type'] = 'pdf'
            
            all_documents.extend(documents)
            print(f"  ✓ Loaded {len(documents)} pages")
            
        except Exception as e:
            print(f"  ✗ Error: {e}")
    
    print(f"\nTotal documents loaded: {len(all_documents)}")
    return all_documents

# Process all PDFs in the data directory
# The PDFs are in D:\WEB DEV\SNBoseProject\RAG\data\pdfs
# The script is in D:\WEB DEV\SNBoseProject\RAG\pdf_loader.py
# So the relative path from RAG/ is 'data/pdfs'
all_pdf_documents = process_all_pdfs("RAG/data/pdfs")

# %%
### Text splitting get into chunks

def split_documents(documents,chunk_size=1000,chunk_overlap=200):
    """Split documents into smaller chunks for better RAG performance"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )
    split_docs = text_splitter.split_documents(documents)
    print(f"Split {len(documents)} documents into {len(split_docs)} chunks")
    
    # Show example of a chunk
    if split_docs:
        print(f"\nExample chunk:")
        print(f"Content: {split_docs[0].page_content[:200]}...")
        print(f"Metadata: {split_docs[0].metadata}")
    
    return split_docs

# %%
chunks=split_documents(all_pdf_documents)
chunks

# %%
import numpy as np
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import uuid
from typing import List, Dict, Any,Tuple
from sklearn.metrics.pairwise import cosine_similarity



# %%
class EmbeddingManager:
  def __init__(
    self,
    model_name: str = "all-MiniLM-L6-v2"):
    self.model_name = model_name
    self.model = None
    self._load_model()
  def _load_model(self):
    """Load the sentence transformer model."""
    try:
      print(f"Loading model: {self.model_name}...")
      self.model = SentenceTransformer(self.model_name)
      print(f"Model loaded successfully.Embedding dimension:{self.model.get_embedding_dimension()}")
    except Exception as e:
      print(f"Error loading model: {e}")
      raise
  def generate_embeddings(self, texts: List[str]) -> np.ndarray:
    """
    Generate embeddings for a list of texts

    Args:
        texts: List of text strings to embed

    Returns:
        numpy array of embeddings with shape (len(texts), embedding_dim)
    """

    if not self.model:
        raise ValueError("Model not loaded")

    print(f"Generating embeddings for {len(texts)} texts...")
    
    embeddings = self.model.encode(
        texts,
        show_progress_bar=True
    )

    print(f"Generated embeddings with shape: {embeddings.shape}")
    
    return embeddings
  ##initialize embedding manager
embedding_manager = EmbeddingManager()
EmbeddingManager

# %% [markdown]
# ### VectorStore

# %%
class VectorStore:
    """Manages document embeddings in a ChromaDB vector store"""

class VectorStore:
    def __init__(
        self,
        collection_name: str = "all_pdf_documents",
        persist_directory: str = "data/vector_store"
    ):
        """
        Initialize the vector store

        Args:
            collection_name: Name of the ChromaDB collection
            persist_directory: Directory to persist the vector store
        """

        self.collection_name = collection_name
        self.persist_directory = persist_directory
        self.client = None
        self.collection = None

        self._initialize_store()

    def _initialize_store(self):
        """Initialize ChromaDB client and collection"""

        try:
            # Create persistent ChromaDB client
            os.makedirs(self.persist_directory, exist_ok=True)

            self.client = chromadb.PersistentClient(
                path=self.persist_directory
            )

            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={
                    "description": "PDF document embeddings for RAG"
                }
            )

            print(
                f"Vector store initialized. Collection: "
                f"{self.collection_name}"
            )

            print(
                f"Existing documents in collection: "
                f"{self.collection.count()}"
            )

        except Exception as e:
            print(f"Error initializing vector store: {e}")
            raise

    def add_documents(
        self,
        documents: List[Any],
        embeddings: np.ndarray
    ):
        """
        Add documents and their embeddings to the vector store

        Args:
            documents: List of LangChain documents
            embeddings: Corresponding embeddings for the documents
        """

        if len(documents) != len(embeddings):
            raise ValueError(
                "Number of documents must match number of embeddings"
            )

        print(
            f"Adding {len(documents)} documents to vector store..."
        )

        # Prepare data for ChromaDB
        ids = []
        metadatas = []
        documents_text = []
        embeddings_list = []

        for i, (doc, embedding) in enumerate(
            zip(documents, embeddings)
        ):

            # Generate unique ID
            doc_id = f"doc_{uuid.uuid4().hex[:8]}_{i}"
            ids.append(doc_id)

            # Prepare metadata
            metadata = dict(doc.metadata)
            metadata["doc_index"] = i
            metadata["content_length"] = len(doc.page_content)

            metadatas.append(metadata)

            # Document content
            documents_text.append(doc.page_content)

            # Embedding
            embeddings_list.append(
                embedding.tolist()
            )

        # Add to collection
        try:
            self.collection.add(
                ids=ids,
                embeddings=embeddings_list,
                metadatas=metadatas,
                documents=documents_text
            )

            print(
                f"Successfully added "
                f"{len(documents)} documents to vector store"
            )

            print(
                f"Total documents in collection: "
                f"{self.collection.count()}"
            )

        except Exception as e:
            print(
                f"Error adding documents to vector store: {e}"
            )
            raise


vectorstore = VectorStore()

# %%
### convert the text to embeddings and store in vector database
texts=[doc.page_content for doc in chunks]
if texts:
    embeddings=embedding_manager.generate_embeddings(texts)
    vectorstore.add_documents(chunks,embeddings)
else:
    print("No documents to embed/add to vector store.")


# %% [markdown]
# ## Retriver pipeline from vectorstore

# %%
class RAGRetriever:
    """Handles query-based retrieval from the vector store"""
    
    def __init__(self, vector_store: VectorStore, embedding_manager: EmbeddingManager):
        """
        Initialize the retriever
        
        Args:
            vector_store: Vector store containing document embeddings
            embedding_manager: Manager for generating query embeddings
        """
        self.vector_store = vector_store
        self.embedding_manager = embedding_manager

    def retrieve(self, query: str, top_k: int = 5, score_threshold: float = 0.0) -> List[Dict[str, Any]]:
        """
        Retrieve relevant documents for a query
        
        Args:
            query: The search query
            top_k: Number of top results to return
            score_threshold: Minimum similarity score threshold
            
        Returns:
            List of dictionaries containing retrieved documents and metadata
        """
        print(f"Retrieving documents for query: '{query}'")
        print(f"Top K: {top_k}, Score threshold: {score_threshold}")
        
        # Generate query embedding
        query_embedding = self.embedding_manager.generate_embeddings([query])[0]
        
        # Search in vector store
        try:
            results = self.vector_store.collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=top_k
            )
            
            # Process results
            retrieved_docs = []
            
            if results['documents'] and results['documents'][0]:
                documents = results['documents'][0]
                metadatas = results['metadatas'][0]
                distances = results['distances'][0]
                ids = results['ids'][0]
                
                for i, (doc_id, document, metadata, distance) in enumerate(zip(ids, documents, metadatas, distances)):
                    # Convert distance to similarity score (ChromaDB uses cosine distance)
                    similarity_score = 1 - distance
                    
                    if similarity_score >= score_threshold:
                        retrieved_docs.append({
                            'id': doc_id,
                            'content': document,
                            'metadata': metadata,
                            'similarity_score': similarity_score,
                            'distance': distance,
                            'rank': i + 1
                        })
                
                print(f"Retrieved {len(retrieved_docs)} documents (after filtering)")
            else:
                print("No documents found")
            
            return retrieved_docs
            
        except Exception as e:
            print(f"Error during retrieval: {e}")
            return []

rag_retriever=RAGRetriever(vectorstore,embedding_manager)

# %%
rag_retriever.retrieve(" Data Definition Language (DDL)")

# %% [markdown]
# ### Integration VectorDB Context pipline with LLM output

# %%
# print(os.getenv("GROQ_API_KEY"))

# %%
### Simple RAG pipeline with Groq LLM
from langchain_groq import ChatGroq

### Initialize the Groq LLM (set your GROQ_API_KEY in environment)
groq_api_key = os.getenv("GROQ_API_KEY")

llm=ChatGroq(groq_api_key=groq_api_key,model_name="openai/gpt-oss-120b",temperature=0.1,max_tokens=1024)

## 2. Simple RAG function: retrieve context + generate response
def rag_simple(query, retriever, llm, top_k=3):
    ## 1. Retrieve the context from your vector store
    results = retriever.retrieve(query, top_k=top_k)
    context = "\n\n".join([doc['content'] for doc in results]) if results else ""
    if not context:
        return "No relevant context found to answer the question."
    
    ## 2. Generate the answer using GROQ LLM (f-string handles everything)
    prompt = f"""Use the following context to answer the question concisely.
    
        Context:
        {context}

        Question: {query}

        Answer:"""
    
    # FIX: Remove .format(...) completely and pass the completed prompt directly
    response = llm.invoke([prompt])
    return response.content
   

# %%
# Example Usage
answer = rag_simple(
    """child { id, name, score }
   emp { empId, name, salary, deptId }
   dept { deptId, deptName }
   What are the names of employees in the Finance department?
    
    """,
    rag_retriever,
    llm
)

print(answer)

# %%
# Copy and run this in a notebook cell:
answer_1 = rag_simple(
    """employees { emp_id, name, salary, dept_id, hire_date }
    departments { dept_id, dept_name }
    sales_transactions { transaction_id, emp_id, amount, sale_date }
    
    Question:
    Find the names of employees who generated a total sales amount in the year 2025 that is strictly higher than the average total sales generated by all individual employees within their same department during that same year. Output the employee name, department name, and their individual total sales.
    """,
    rag_retriever,
    llm
)

print(answer_1)

# %% [markdown]
# ### Enhanced RAG Pipeline Features

# %%
# def rag_advanced(
#     query,
#     retriever,
#     llm,
#     top_k=5,
#     min_score=0.2,
#     return_context=False
# ):

#     """
#     Enhanced RAG Pipeline
#     """

#     # Retrieve documents
#     results = retriever.retrieve(
#         query,
#         top_k=top_k,
#         score_threshold=min_score
#     )

#     if not results:

#         return {
#             "answer": "No relevant context found.",
#             "sources": [],
#             "confidence": 0.0,
#             "context": ""
#         }

#     # Build context
#     context = "\n\n".join(
#         [doc["content"] for doc in results]
#     )

#     # Build sources
#     sources = []

#     for doc in results:

#         sources.append({
#             "source": doc["metadata"].get(
#                 "source_file",
#                 doc["metadata"].get("source", "unknown")
#             ),

#             "page": doc["metadata"].get(
#                 "page",
#                 "unknown"
#             ),

#             "score": round(
#                 doc["similarity_score"],
#                 4
#             ),

#             "preview": doc["content"][:200] + "..."
#         })

#     # Confidence
#     confidence = round(
#         max([
#             doc["similarity_score"]
#             for doc in results
#         ]),
#         4
#     )

#     # Prompt
#     prompt = f"""
# Use the following context to answer the question concisely.

# Context:
# {context}

# Question:
# {query}

# Answer:
# """

#     # LLM Response
#     response = llm.invoke(prompt)

#     # Handle string vs AIMessage
#     answer = (
#         response.content
#         if hasattr(response, "content")
#         else str(response)
#     )

#     # Final output
#     output = {
#         "answer": answer,
#         "sources": sources,
#         "confidence": confidence
#     }

#     if return_context:
#         output["context"] = context

#     return output

# %%
# result = rag_advanced(
#     "Explain rules",
#     rag_retriever,
#     llm,
#     top_k=3,
#     min_score=0.1,
#     return_context=True
# )

# print("\nANSWER:\n")
# print(result["answer"])

# print("\nCONFIDENCE:\n")
# print(result["confidence"])

# print("\nSOURCES:\n")

# for i, src in enumerate(result["sources"], 1):

#     print(f"\nSource {i}")
#     print(f"File: {src['source']}")
#     print(f"Page: {src['page']}")
#     print(f"Score: {src['score']}")
#     print(f"Preview: {src['preview']}")

# print("\nCONTEXT PREVIEW:\n")
# print(result["context"][:500])

# %%
# ---------------------------------------------------------------------
# 1. Environment & Path Configurations
# ---------------------------------------------------------------------
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    print("[-] Error: GROQ_API_KEY not found in your environment setup.")
    sys.exit(1)

# Initialize your Groq Model Engine
llm = ChatGroq(
    groq_api_key=groq_api_key,
    model_name="openai/gpt-oss-120b", 
    temperature=0.1,
    max_tokens=1024
)

# ---------------------------------------------------------------------
# 2. Text-to-SQL Reference Prompt Template
# ---------------------------------------------------------------------
SQL_PROMPT_TEMPLATE = """You are an expert SQL assistant. Your task is to generate a valid, executable SQL query based on the user's question, the provided database schema, and the retrieved SQL rules and templates.

=== DATABASE SCHEMA ===
{schema}

=== SQL SYNTAX REFERENCE & TEMPLATES (Retrieved Context) ===
{context}

=== STRICTOR SYSTEM GUIDELINES ===
- Only use tables, columns, and relationships defined in the DATABASE SCHEMA above.
- Do not invent column or table names under any circumstance. If something is unclear, write a SQL comment inside the code.
- Align your query design with the retrieved SQL SYNTAX REFERENCE templates (e.g. JOIN structures, Window functions, aggregate functions).
- Strictly return SELECT queries only. Never write DELETE, INSERT, UPDATE, DROP, or DDL statements.
- Prefer table aliases matching table prefixes (e.g. `e` for employees, `d` for departments).
- All date evaluations must follow 'YYYY-MM-DD' format.
- Output ONLY the clean executable SQL block. Do not write markdown conversational text.

---

Question:
{question}

SQL Query:"""

# ---------------------------------------------------------------------
# 3. Text-to-SQL Execution Core Logic
# ---------------------------------------------------------------------
def generate_sql(query, schema_input, retriever, llm_engine, top_k=4):
    """
    Leverages your operational custom retriever from Cell 79 
    to fetch syntax context and generate clean SQL blocks.
    """
    # Uses your native .retrieve() method which returns dictionary records perfectly
    results = retriever.retrieve(query, top_k=top_k)
    
    context = "\n\n".join([doc['content'] for doc in results]) if results else "Use basic SQL standard styles."
        
    formatted_prompt = SQL_PROMPT_TEMPLATE.format(
        schema=schema_input,
        context=context,
        question=query
    )
    
    response = llm_engine.invoke([formatted_prompt])
    return response.content

# ---------------------------------------------------------------------
# 4. Runtime Validation Test
# ---------------------------------------------------------------------
print("\n[+] System successfully tied to your active 204 document database collection.")
print("--- [System Initialization Completed] ---")

my_active_schema = """
students { student_id, student_name, class_id }
    exam_scores { score_id, student_id, course_name, score_achieved }
"""

question = """For each distinct class_id, find the students who achieved the top 2 highest unique exam scores across all courses combined. If there are     ties in scores, preserve the ties without skipping ranking positions. Display the class_id, student_name, and their total score, sorted by class_id ascending and score descending.
        """
print(f"\n[?] Question: '{question}'")

# Passing 'rag_retriever' from Cell 79 seamlessly
sql_query = generate_sql(question, my_active_schema, rag_retriever, llm, top_k=2)

print("\nGenerated SQL:")
print("-" * 50)
print(sql_query)
print("-" * 50)


