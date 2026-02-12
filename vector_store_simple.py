import os
from dotenv import load_dotenv

load_dotenv()


# Almacenamiento simple en memoria para ChromaDB (solo para pruebas)
_simple_storage = {}


def store_text(text: str) -> str:
    """
    Almacena texto en memoria (versión simplificada).
    Retorna un ID único.
    """
    import uuid
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    _simple_storage[doc_id] = text
    return doc_id


def get_relevant_chunks(query: str, n_results: int = 5) -> list:
    """
    Busca fragmentos relevantes (versión simplificada - busca por palabras clave).
    """
    chunks = []
    query_words = set(query.lower().split())

    for doc_id, text in _simple_storage.items():
        # Dividir en chunks
        text_chunks = [text[i:i+500] for i in range(0, len(text), 500)]
        for chunk in text_chunks:
            chunk_lower = chunk.lower()
            # Contar cuántas palabras de la query aparecen en el chunk
            matches = sum(1 for word in query_words if word in chunk_lower)
            if matches > 0:
                chunks.append((chunk, matches))

    # Ordenar por coincidencias y retornar los top n
    chunks.sort(key=lambda x: x[1], reverse=True)
    return [chunk[0] for chunk in chunks[:n_results]]


def clear_collection():
    """Limpia el almacenamiento."""
    global _simple_storage
    _simple_storage = {}
