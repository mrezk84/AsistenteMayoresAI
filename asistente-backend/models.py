from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Optional
from database import Base


class User(Base):
    """Modelo de usuario"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    device_id = Column(String, unique=True, index=True)  # Para identificar dispositivos sin login
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")


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
