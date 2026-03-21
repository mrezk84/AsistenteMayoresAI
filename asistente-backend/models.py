from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Optional
from database import Base
import hashlib
import secrets


class User(Base):
    """Modelo de usuario"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)  # Nombre completo para personalización
    pin_hash = Column(String)  # Hash del PIN (más seguro que guardar en plano)
    device_id = Column(String, index=True)  # Para identificar dispositivos sin login (no unique para permitir NULL)
    is_active = Column(Boolean, default=True)
    failed_attempts = Column(Integer, default=0)  # Para bloqueo temporal tras intentos fallidos
    locked_until = Column(DateTime, nullable=True)  # Bloqueo temporal
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")

    @staticmethod
    def hash_pin(pin: str) -> str:
        """Genera un hash seguro del PIN usando SHA-256 con salt"""
        salt = secrets.token_hex(16)
        return f"{salt}${hashlib.sha256(f"{pin}{salt}".encode()).hexdigest()}"

    def verify_pin(self, pin: str) -> bool:
        """Verifica si el PIN es correcto"""
        if not self.pin_hash:
            return False
        salt, hash_expected = self.pin_hash.split('$')
        hash_attempt = hashlib.sha256(f"{pin}{salt}".encode()).hexdigest()
        return secrets.compare_digest(hash_attempt, hash_expected)

    def is_locked(self) -> bool:
        """Verifica si la cuenta está bloqueada temporalmente"""
        if not self.locked_until:
            return False
        return datetime.utcnow() < self.locked_until

    def record_failed_attempt(self):
        """Registra un intento fallido y bloquea si hay demasiados"""
        self.failed_attempts = (self.failed_attempts or 0) + 1
        if self.failed_attempts >= 5:
            # Bloquear por 30 minutos
            from datetime import timedelta
            self.locked_until = datetime.utcnow() + timedelta(minutes=30)

    def reset_failed_attempts(self):
        """Resetea los intentos fallidos tras un login exitoso"""
        self.failed_attempts = 0
        self.locked_until = None
        self.last_login = datetime.utcnow()


class PDFDocument(Base):
    """Modelo para documentos PDF subidos"""
    __tablename__ = "pdf_documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relaciones
    conversations = relationship("Conversation", back_populates="pdf_document", cascade="all, delete-orphan")


class Conversation(Base):
    """Modelo de conversación"""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    pdf_id = Column(Integer, ForeignKey("pdf_documents.id"), nullable=True)
    title = Column(String, default="Nueva conversación")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    user = relationship("User", back_populates="conversations")
    pdf_document = relationship("PDFDocument", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.timestamp")


class Message(Base):
    """Modelo de mensaje dentro de una conversación"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    role = Column(String)  # "user" | "assistant" | "system"
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    conversation = relationship("Conversation", back_populates="messages")


# Schemas Pydantic para validación de requests
from pydantic import BaseModel


class MessageCreate(BaseModel):
    role: str
    content: str


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    title: Optional[str] = "Nueva conversación"
    pdf_id: Optional[int] = None


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[MessageResponse] = []

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    conversation_id: int
    question: str


class ChatResponse(BaseModel):
    answer: str
    conversation_id: int
    message_id: int


# ============================================
# Schemas para Autenticación
# ============================================

class RegisterRequest(BaseModel):
    """Request para registro de usuario"""
    username: str  # Código corto de 4-6 caracteres para identificar
    full_name: str  # Nombre completo
    pin: str  # PIN numérico de 4 dígitos


class LoginRequest(BaseModel):
    """Request para login"""
    username: str
    pin: str
    remember_device: bool = False


class LoginResponse(BaseModel):
    """Response de login exitoso"""
    success: bool
    user_id: int
    username: str
    full_name: str
    token: str  # JWT token para sesiones
    message: str


class UserResponse(BaseModel):
    """Respuesta con datos de usuario"""
    id: int
    username: str
    full_name: str
    created_at: datetime

    class Config:
        from_attributes = True
