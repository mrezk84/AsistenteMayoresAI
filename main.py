from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from pdf_utils import extract_text_from_pdf
# Intentar importar ChromaDB, si falla usar versión simplificada
try:
    from vector_store import store_text, get_relevant_chunks
    CHROMADB_AVAILABLE = True
except ImportError:
    from vector_store_simple import store_text, get_relevant_chunks
    CHROMADB_AVAILABLE = False
    print("⚠️ ChromaDB no disponible, usando almacenamiento simplificado en memoria")
from chat_engine import ask_gpt
from database import get_db, init_db
from models import (
    User, PDFDocument, Conversation, Message,
    ConversationCreate, ConversationResponse,
    ChatRequest, ChatResponse, MessageResponse
)

app = FastAPI(title="Asistente para Personas Mayores API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Evento de startup - inicializar BD
@app.on_event("startup")
async def startup_event():
    init_db()


# ============================================
# ENDPOINTS ORIGINALES (Mantenidos por compatibilidad)
# ============================================

@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    """Endpoint original para subir PDF (sin asociar a usuario)"""
    contents = await file.read()
    text = extract_text_from_pdf(contents)
    store_text(text)
    return {"message": "Manual cargado con éxito."}


@app.post("/ask/")
async def ask_question(question: str = Form(...)):
    """Endpoint original para preguntar (sin historial)"""
    relevant_chunks = get_relevant_chunks(question)
    answer = ask_gpt(question, relevant_chunks)
    return {"answer": answer}


# ============================================
# NUEVOS ENDPOINTS CON BASE DE DATOS
# ============================================

# ============================================
# Gestión de Sesiones/Conversaciones
# ============================================

@app.get("/users/device/{device_id}", response_model=None)
def get_or_create_user(device_id: str, db: Session = Depends(get_db)):
    """Obtiene o crea un usuario por device_id"""
    user = db.query(User).filter(User.device_id == device_id).first()
    if not user:
        user = User(device_id=device_id, username=f"guest_{device_id[:8]}")
        db.add(user)
        db.commit()
        db.refresh(user)
    return {"id": user.id, "device_id": user.device_id}


@app.get("/conversations/", response_model=list[ConversationResponse])
def get_conversations(
    user_id: Optional[int] = None,
    device_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lista todas las conversaciones de un usuario"""
    query = db.query(Conversation)

    if user_id:
        query = query.filter(Conversation.user_id == user_id)
    elif device_id:
        user = db.query(User).filter(User.device_id == device_id).first()
        if user:
            query = query.filter(Conversation.user_id == user.id)
        else:
            return []

    return query.order_by(Conversation.updated_at.desc()).all()


@app.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: int, db: Session = Depends(get_db)):
    """Obtiene una conversación específica con sus mensajes"""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    return conversation


@app.post("/conversations/", response_model=ConversationResponse)
def create_conversation(
    conversation: ConversationCreate,
    user_id: Optional[int] = None,
    device_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Crea una nueva conversación"""
    # Determinar user_id
    uid = user_id
    if not uid and device_id:
        user = db.query(User).filter(User.device_id == device_id).first()
        if user:
            uid = user.id
        else:
            user = User(device_id=device_id, username=f"guest_{device_id[:8]}")
            db.add(user)
            db.commit()
            db.refresh(user)
            uid = user.id

    if not uid:
        raise HTTPException(status_code=400, detail="Se requiere user_id o device_id")

    new_conversation = Conversation(
        user_id=uid,
        pdf_id=conversation.pdf_id,
        title=conversation.title
    )
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)
    return new_conversation


@app.put("/conversations/{conversation_id}", response_model=ConversationResponse)
def update_conversation_title(
    conversation_id: int,
    title: str = Form(...),
    db: Session = Depends(get_db)
):
    """Actualiza el título de una conversación"""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

    conversation.title = title
    db.commit()
    db.refresh(conversation)
    return conversation


@app.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: int, db: Session = Depends(get_db)):
    """Elimina una conversación y sus mensajes"""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

    db.delete(conversation)
    db.commit()
    return {"message": "Conversación eliminada"}


# ============================================
# Chat con Historial
# ============================================

@app.post("/chat/", response_model=ChatResponse)
async def chat_with_history(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Endpoint de chat con soporte de historial.
    Genera una respuesta considerando el historial de la conversación.
    """
    # Obtener la conversación
    conversation = db.query(Conversation).filter(
        Conversation.id == request.conversation_id
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

    # Guardar el mensaje del usuario
    user_message = Message(
        conversation_id=request.conversation_id,
        role="user",
        content=request.question
    )
    db.add(user_message)

    # Obtener historial de mensajes para contexto
    messages = db.query(Message).filter(
        Message.conversation_id == request.conversation_id
    ).order_by(Message.timestamp).all()

    # Construir el historial para el chat engine
    history = [{"role": m.role, "content": m.content} for m in messages]

    # Obtener chunks relevantes del PDF si está asociado
    relevant_chunks = []
    if conversation.pdf_id:
        relevant_chunks = get_relevant_chunks(request.question)

    # Generar respuesta usando el historial
    answer = ask_gpt_with_history(request.question, history, relevant_chunks)

    # Guardar la respuesta del asistente
    assistant_message = Message(
        conversation_id=request.conversation_id,
        role="assistant",
        content=answer
    )
    db.add(assistant_message)

    # Actualizar timestamp de la conversación
    conversation.updated_at = conversation.updated_at  # Trigger onupdate

    db.commit()
    db.refresh(assistant_message)

    return ChatResponse(
        answer=answer,
        conversation_id=request.conversation_id,
        message_id=assistant_message.id
    )


# ============================================
# PDF con asociación a usuario
# ============================================

@app.post("/pdfs/upload")
async def upload_pdf_with_user(
    file: UploadFile = File(...),
    user_id: Optional[int] = None,
    device_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Sube un PDF y lo asocia a un usuario.
    Retorna el PDF document ID para usar en conversaciones.
    """
    # Determinar user_id
    uid = user_id
    if not uid and device_id:
        user = db.query(User).filter(User.device_id == device_id).first()
        if user:
            uid = user.id
        else:
            user = User(device_id=device_id, username=f"guest_{device_id[:8]}")
            db.add(user)
            db.commit()
            db.refresh(user)
            uid = user.id

    if not uid:
        raise HTTPException(status_code=400, detail="Se requiere user_id o device_id")

    # Procesar PDF
    contents = await file.read()
    text = extract_text_from_pdf(contents)
    store_text(text)

    # Guardar registro del PDF
    pdf_doc = PDFDocument(
        filename=file.filename,
        user_id=uid
    )
    db.add(pdf_doc)
    db.commit()
    db.refresh(pdf_doc)

    return {
        "message": "PDF cargado con éxito",
        "pdf_id": pdf_doc.id,
        "filename": pdf_doc.filename
    }


@app.get("/pdfs/user/{user_id}")
def get_user_pdfs(user_id: int, db: Session = Depends(get_db)):
    """Lista todos los PDFs de un usuario"""
    pdfs = db.query(PDFDocument).filter(PDFDocument.user_id == user_id).all()
    return [{"id": p.id, "filename": p.filename, "uploaded_at": p.uploaded_at} for p in pdfs]


# ============================================
# Nueva función de chat con historial
# ============================================

def ask_gpt_with_history(question: str, history: list[dict], context_chunks: list[str]) -> str:
    """
    Genera una respuesta considerando el historial de conversación.
    """
    from openai import OpenAI
    import os
    from dotenv import load_dotenv

    load_dotenv()
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    # Construir messages para la API
    messages = [
        {
            "role": "system",
            "content": "Eres un asistente amable y paciente para personas mayores. "
                      "Respondé de forma clara, simple y respetuosa. Usá lenguaje sencillo "
                      "y evitá términos técnicos. Si hay contexto de un manual, usalo para responder."
        }
    ]

    # Agregar contexto del PDF si existe
    if context_chunks:
        context = "\n".join(context_chunks)
        messages.append({
            "role": "system",
            "content": f"Contexto relevante del manual:\n{context}"
        })

    # Agregar historial de conversación
    for msg in history:
        if msg["role"] in ["user", "assistant"]:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })

    # La pregunta actual ya está en el historial como último mensaje del usuario
    # Pero si el historial está vacío o solo tiene la pregunta actual:
    if len(history) == 0 or (len(history) == 1 and history[0]["role"] == "user"):
        messages.append({"role": "user", "content": question})

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Lo siento, tuve un problema al procesar tu pregunta. Por favor, intenta de nuevo. (Error: {str(e)})"


# ============================================
# Health check
# ============================================

@app.get("/health")
def health_check():
    """Endpoint de health check"""
    return {"status": "healthy", "service": "Asistente Mayores API"}
