from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

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

# ============================================
# Autenticación por Bearer Token
# ============================================
security = HTTPBearer()
API_SECRET_TOKEN = os.getenv("API_SECRET_TOKEN", "asistente-mayores-token-2024")


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verifica que el token Bearer sea válido."""
    if credentials.credentials != API_SECRET_TOKEN:
        raise HTTPException(status_code=401, detail="Token inválido")
    return credentials.credentials


# Evento de startup - inicializar BD
@app.on_event("startup")
async def startup_event():
    init_db()


# ============================================
# ENDPOINTS ORIGINALES (Mantenidos por compatibilidad)
# ============================================

@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...), token: str = Depends(verify_token)):
    """Endpoint original para subir PDF (sin asociar a usuario)"""
    contents = await file.read()
    text = extract_text_from_pdf(contents)
    store_text(text)
    return {"message": "Manual cargado con éxito."}


@app.post("/ask/")
async def ask_question(question: str = Form(...), token: str = Depends(verify_token)):
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
def get_or_create_user(device_id: str, db: Session = Depends(get_db), token: str = Depends(verify_token)):
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
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
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
def get_conversation(conversation_id: int, db: Session = Depends(get_db), token: str = Depends(verify_token)):
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
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
):
    """Crea una nueva conversación"""
    # Determinar user_id
    uid = user_id
    if not uid and device_id:
        user = db.query(User).filter(User.device_id == device_id).first()
        if user:
            uid = user.id
        else:
            user = User(device_id=device_id, username=f"guest_{device_id}")
            db.add(user)
            try:
                db.commit()
                db.refresh(user)
            except Exception:
                db.rollback()
                # Si el usuario ya existe con otro device_id con el mismo nombre, usar timestamp
                import time
                user = User(device_id=device_id, username=f"guest_{int(time.time())}")
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
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
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
def delete_conversation(conversation_id: int, db: Session = Depends(get_db), token: str = Depends(verify_token)):
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
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
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
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
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
def get_user_pdfs(user_id: int, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    """Lista todos los PDFs de un usuario"""
    pdfs = db.query(PDFDocument).filter(PDFDocument.user_id == user_id).all()
    return [{"id": p.id, "filename": p.filename, "uploaded_at": p.uploaded_at} for p in pdfs]


# ============================================
# Nueva función de chat con historial (usando Google Gemini)
# ============================================

def ask_gpt_with_history(question: str, history: list[dict], context_chunks: list[str]) -> str:
    """
    Genera una respuesta considerando el historial de conversación usando Google Gemini.
    """
    from google import genai
    from datetime import datetime, timezone, timedelta

    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    # Fecha actual en horario de Uruguay (UTC-3)
    tz_uruguay = timezone(timedelta(hours=-3))
    ahora = datetime.now(tz_uruguay)
    dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
             "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    fecha_actual = f"{dias[ahora.weekday()]} {ahora.day} de {meses[ahora.month - 1]} de {ahora.year}, {ahora.strftime('%H:%M')} (horario de Uruguay)"

    # System prompt optimizado para personas mayores
    system_prompt = f"""Eres un asistente amable y paciente diseñado especialmente para ayudar a personas mayores.

FECHA Y HORA ACTUAL: {fecha_actual}

INSTRUCCIONES IMPORTANTES:
- Responde de forma clara, simple y respetuosa
- Usa lenguaje sencillo y evita términos técnicos
- Si explicas algo complejo, usa analogías cotidianas
- Sé paciente y empático en todo momento
- Las respuestas deben ser breves pero completas
- Usa oraciones cortas y fáciles de entender
- Puedes usar emojis ocasionales para hacer el texto más amigable (👋, 👍, ✅, etc.)
- Si no entiendes la pregunta, pide amablemente que la repitan
- SIEMPRE usa la herramienta de búsqueda de Google para preguntas sobre datos actuales, personas, eventos o cualquier información factual
- SIEMPRE prioriza los resultados de búsqueda de Google por sobre tu entrenamiento o el historial de conversación
- NUNCA respondas con información desactualizada si puedes buscar la respuesta actual

Tu objetivo es hacer que la tecnología sea accesible y menos intimidante."""

    # Construir el mensaje del usuario con contexto e historial
    user_content_parts = [system_prompt + "\n\n"]

    # Agregar contexto del PDF si existe
    if context_chunks:
        context = "\n".join(context_chunks)
        user_content_parts.append(f"""CONTEXTO DEL MANUAL:
{context}

---

Responde a la pregunta usando esta información cuando sea relevante.""")

    # Agregar historial de conversación reciente
    if history:
        user_content_parts.append("\nHISTORIAL DE LA CONVERSACIÓN:")
        for msg in history[-6:]:
            role_label = "Usuario" if msg["role"] == "user" else "Asistente"
            user_content_parts.append(f"\n{role_label}: {msg['content']}")

    # Agregar la pregunta actual
    user_content_parts.append(f"\nPREGUNTA ACTUAL: {question}")

    try:
        from google.genai.types import Tool, GoogleSearch

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents="\n".join(user_content_parts),
            config={
                "tools": [Tool(google_search=GoogleSearch())],
            }
        )
        return response.text
    except Exception as e:
        print(f"❌ Error en Gemini API: {type(e).__name__}: {e}")
        return "Lo siento, tuve un problema al procesar tu pregunta. Por favor, intenta de nuevo."


# ============================================
# Health check
# ============================================

@app.get("/health")
def health_check():
    """Endpoint de health check"""
    return {"status": "healthy", "service": "Asistente Mayores API"}
