import chromadb
from chromadb.config import Settings
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
import os
from dotenv import load_dotenv

load_dotenv()

embedding_function = OpenAIEmbeddingFunction(api_key=os.getenv("OPENAI_API_KEY"))
chroma_client = chromadb.Client(Settings(chroma_db_impl="duckdb+parquet", persist_directory="./chroma"))

collection = chroma_client.get_or_create_collection(name="manuales", embedding_function=embedding_function)

def store_text(text: str):
    chunks = [text[i:i+500] for i in range(0, len(text), 500)]
    collection.add(documents=chunks, ids=[f"chunk_{i}" for i in range(len(chunks))])

def get_relevant_chunks(query: str):
    results = collection.query(query_texts=[query], n_results=5)
    return results['documents'][0]
