from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
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
    ChatRequest, ChatResponse, MessageResponse,
    RegisterRequest, LoginRequest, LoginResponse, UserResponse,
    ChangePinRequest, ResetPinRequest, ResetPinAdminRequest
)
from auth import create_access_token, verify_token as verify_jwt_token, create_refresh_token

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
# AUTENTICACIÓN DE USUARIOS
# ============================================

def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[dict]:
    """Obtiene el usuario actual si hay token, None si no lo hay"""
    if not credentials:
        return None
    token = credentials.credentials
    payload = verify_jwt_token(token)
    return payload


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())) -> dict:
    """Obtiene el usuario actual (requiere token válido)"""
    token = credentials.credentials
    payload = verify_jwt_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )
    return payload


@app.post("/auth/register", response_model=UserResponse)
def register_user(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo usuario con un PIN de 4 dígitos.

    Para personas mayores, usamos:
    - username: Un código corto y fácil de recordar (ej: "MARIA01")
    - PIN: 4 dígitos numéricos (más fácil que contraseñas complejas)
    """
    # Validar que el PIN sea de 4 dígitos numéricos
    if not request.pin.isdigit() or len(request.pin) != 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El PIN debe ser exactamente 4 números"
        )

    # Verificar que el username no exista
    existing_user = db.query(User).filter(User.username == request.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este código de usuario ya existe. Por favor, elige otro."
        )

    # Crear el nuevo usuario
    new_user = User(
        username=request.username,
        full_name=request.full_name,
        pin_hash=User.hash_pin(request.pin),
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post("/auth/login", response_model=LoginResponse)
def login_user(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Inicia sesión con username y PIN.

    Para personas mayores, este sistema es más simple:
    - No necesitan recordar contraseñas complejas
    - El PIN es fácil de ingresar
    - Se bloquea temporalmente tras 5 intentos fallidos
    """
    # Buscar el usuario
    user = db.query(User).filter(User.username == request.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código o PIN incorrecto"
        )

    # Verificar si la cuenta está bloqueada
    if user.is_locked():
        if user.locked_until:
            minutes_left = int((user.locked_until - datetime.utcnow()).total_seconds() / 60) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Cuenta temporalmente bloqueada. Intenta en {minutes_left} minutos."
            )
        else:
            # Si no hay locked_until pero failed_attempts >= 5, establecer bloqueo
            from datetime import timedelta
            user.locked_until = datetime.utcnow() + timedelta(minutes=30)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Cuenta temporalmente bloqueada. Intenta en 30 minutos."
            )

    # Verificar el PIN
    if not user.verify_pin(request.pin):
        user.record_failed_attempt()
        db.commit()

        attempts_left = 5 - (user.failed_attempts or 0)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"PIN incorrecto. Te quedan {attempts_left} intentos."
        )

    # Resetear intentos fallidos y actualizar último login
    user.reset_failed_attempts()
    db.commit()

    # Crear token de acceso
    token_expires = 72 if request.remember_device else 24  # 72 horas si recordamos, 24 si no
    access_token = create_access_token(
        user_id=user.id,
        username=user.username,
        full_name=user.full_name,
        expires_hours=token_expires
    )

    # Crear refresh token si se seleccionó "recordar"
    refresh_token = None
    if request.remember_device:
        refresh_token = create_refresh_token(user.id)

    return LoginResponse(
        success=True,
        user_id=user.id,
        username=user.username,
        full_name=user.full_name,
        token=access_token,
        message=f"¡Hola {user.full_name}! Bienvenido de nuevo."
    )


@app.get("/auth/me", response_model=UserResponse)
def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtiene información del usuario autenticado"""
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return user


@app.post("/auth/logout")
def logout_user():
    """
    Cierra la sesión del usuario.
    En el frontend, simplemente se elimina el token almacenado.
    """
    return {"message": "Sesión cerrada correctamente"}


@app.post("/auth/change-pin")
def change_pin(
    request: ChangePinRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cambia el PIN del usuario.
    Requiere conocer el PIN actual por seguridad.
    """
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Verificar que el PIN actual sea correcto
    if not user.verify_pin(request.current_pin):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tu PIN actual es incorrecto"
        )

    # Validar el nuevo PIN
    if not request.new_pin.isdigit() or len(request.new_pin) != 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nuevo PIN debe ser 4 números"
        )

    # Actualizar el PIN
    user.pin_hash = User.hash_pin(request.new_pin)
    db.commit()

    return {"message": "PIN cambiado correctamente"}


@app.post("/auth/reset-pin-request")
def request_pin_reset(
    request: ResetPinRequest,
    db: Session = Depends(get_db)
):
    """
    Solicita resetear el PIN cuando se olvidó.
    Para personas mayores, esto genera un código que un familiar/admin puede usar.
    """
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        # No revelamos si el usuario existe por seguridad
        return {
            "message": "Si el código existe, contacta a tu familiar o administrador",
            "reset_code": f"RESET_{user.id if user else 'XXX'}_{uuid.uuid4().hex[:8].upper()}"
        }

    # Generar código de reset (en producción, esto se enviaría por email/SMS al familiar)
    reset_code = f"RESET_{user.id}_{uuid.uuid4().hex[:8].upper()}"

    return {
        "message": "Contacta a tu familiar o administrador con este código",
        "reset_code": reset_code,
        "user_full_name": user.full_name
    }


@app.post("/auth/reset-pin-admin")
def reset_pin_admin(
    request: ResetPinAdminRequest,
    db: Session = Depends(get_db)
):
    """
    Permite a un administrador resetear el PIN de un usuario.
    Requiere una clave de administrador.
    """
    # Verificar la clave de administrador (en producción, usar variable de entorno)
    ADMIN_KEY = os.getenv("ADMIN_RESET_KEY", "admin-2024-reset")
    if request.admin_key != ADMIN_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Clave de administrador incorrecta"
        )

    # Buscar el usuario
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Validar el nuevo PIN
    if not request.new_pin.isdigit() or len(request.new_pin) != 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El PIN debe ser 4 números"
        )

    # Resetear PIN y desbloquear cuenta
    user.pin_hash = User.hash_pin(request.new_pin)
    user.failed_attempts = 0
    user.locked_until = None
    db.commit()

    return {
        "message": f"PIN de {user.full_name} reseteado correctamente",
        "username": user.username,
        "full_name": user.full_name
    }


@app.post("/auth/unlock")
def unlock_account(
    request: ResetPinRequest,  # Reutilizamos el modelo que tiene username
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Desbloquea la cuenta del usuario autenticado.
    Solo puede desbloquear su propia cuenta.
    """
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Desbloquear cuenta
    user.failed_attempts = 0
    user.locked_until = None
    db.commit()

    return {"message": "Cuenta desbloqueada. Ahora puedes intentar ingresar nuevamente"}


@app.get("/auth/check")
def check_auth(current_user: Optional[dict] = Depends(get_current_user_optional)):
    """Verifica si hay una sesión activa"""
    if current_user:
        return {
            "authenticated": True,
            "user_id": current_user.get("user_id"),
            "username": current_user.get("username"),
            "full_name": current_user.get("full_name")
        }
    return {"authenticated": False}


# ============================================
# ENDPOINTS ORIGINALES (Mantenidos por compatibilidad)
# ============================================

@app.post("/upload-pdf/")
async def upload_pdf(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Endpoint para subir PDF (asociado al usuario autenticado)"""
    contents = await file.read()
    text = extract_text_from_pdf(contents)

    # Guardar el PDF en la base de datos
    pdf_doc = PDFDocument(
        filename=file.filename,
        user_id=current_user["user_id"]
    )
    db: Session = Depends(get_db)
    db = SessionLocal()
    try:
        db.add(pdf_doc)
        db.commit()
    finally:
        db.close()

    store_text(text)
    return {"message": "Manual cargado con éxito."}


@app.post("/ask/")
async def ask_question(
    question: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """Endpoint para preguntar (sin historial)"""
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
def get_or_create_user(
    device_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtiene o crea un usuario por device_id (DEPRECATED - usar /auth/login)"""
    user = db.query(User).filter(User.device_id == device_id).first()
    if not user:
        user = User(device_id=device_id, username=f"guest_{device_id[:8]}")
        db.add(user)
        db.commit()
        db.refresh(user)
    return {"id": user.id, "device_id": user.device_id}


@app.get("/conversations/", response_model=list[ConversationResponse])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Lista todas las conversaciones del usuario autenticado"""
    query = db.query(Conversation).filter(Conversation.user_id == current_user["user_id"])
    return query.order_by(Conversation.updated_at.desc()).all()


@app.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtiene una conversación específica con sus mensajes"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user["user_id"]
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    return conversation


@app.post("/conversations/", response_model=ConversationResponse)
def create_conversation(
    conversation: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Crea una nueva conversación"""
    # Obtener user_id del JWT token
    uid = current_user.get("user_id") if current_user else None

    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debes iniciar sesión para crear una conversación"
        )

    new_conversation = Conversation(
        user_id=uid,
        pdf_id=conversation.pdf_id,
        title=conversation.title or "Nueva conversación"
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
    current_user: dict = Depends(get_current_user)
):
    """Actualiza el título de una conversación"""
    # Verificar que la conversación pertenezca al usuario
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user["user_id"]
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

    conversation.title = title
    db.commit()
    db.refresh(conversation)
    return conversation


@app.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Elimina una conversación y sus mensajes"""
    # Verificar que la conversación pertenezca al usuario
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user["user_id"]
    ).first()

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
    current_user: dict = Depends(get_current_user)
):
    """
    Endpoint de chat con soporte de historial.
    Genera una respuesta considerando el historial de la conversación.
    """
    # Obtener la conversación (verificar que pertenezca al usuario)
    conversation = db.query(Conversation).filter(
        Conversation.id == request.conversation_id,
        Conversation.user_id == current_user["user_id"]
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
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Sube un PDF y lo asocia al usuario autenticado.
    Retorna el PDF document ID para usar en conversaciones.
    """
    # Obtener user_id del JWT token
    uid = current_user["user_id"]

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
def get_user_pdfs(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Lista todos los PDFs de un usuario (solo puede ver sus propios PDFs)"""
    # Verificar que el user_id sea el del usuario autenticado
    if user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver PDFs de otros usuarios"
        )
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
