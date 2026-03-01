import chromadb
import uuid


# Configurar el cliente de ChromaDB persistente
chroma_client = chromadb.PersistentClient(path="./chroma")

# Obtener o crear la colección (sin función de embeddings externa - usa la default local)
collection = chroma_client.get_or_create_collection(
    name="manuales"
)


def store_text(text: str) -> str:
    """
    Almacena texto en fragmentos en ChromaDB.
    Retorna un ID único para este documento.
    """
    # Dividir en chunks de 500 caracteres
    chunks = [text[i:i+500] for i in range(0, len(text), 500)]

    # Generar IDs únicos para cada chunk
    chunk_ids = [f"doc_{uuid.uuid4().hex[:8]}_chunk_{i}" for i in range(len(chunks))]

    # Agregar a la colección
    collection.add(
        documents=chunks,
        ids=chunk_ids
    )

    return chunk_ids[0] if chunk_ids else None


def get_relevant_chunks(query: str, n_results: int = 5) -> list[str]:
    """
    Busca fragmentos relevantes para una consulta.
    """
    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results
        )
        return results.get('documents', [[]])[0]
    except Exception as e:
        print(f"Error en búsqueda vectorial: {e}")
        return []


def clear_collection():
    """
    Limpia toda la colección (útil para testing)
    """
    try:
        # ChromaDB no tiene un método directo para limpiar
        # En su lugar, creamos una nueva colección con el mismo nombre
        global collection
        chroma_client.delete_collection(name="manuales")
        collection = chroma_client.create_collection(
            name="manuales"
        )
    except Exception as e:
        print(f"Error al limpiar colección: {e}")
