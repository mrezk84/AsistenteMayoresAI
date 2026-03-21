"""
Módulo de autenticación con JWT tokens
Proporciona funciones para crear y verificar tokens de sesión
"""
import jwt
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv
import os

load_dotenv()

# Clave secreta para firmar tokens (debe estar en .env)
JWT_SECRET = os.getenv("JWT_SECRET", "asistente-mayores-jwt-secret-2024")
JWT_ALGORITHM = "HS256"


def create_access_token(user_id: int, username: str, full_name: str, expires_hours: int = 24) -> str:
    """
    Crea un token JWT de acceso

    Args:
        user_id: ID del usuario
        username: Nombre de usuario
        full_name: Nombre completo
        expires_hours: Horas hasta que expire (default 24)

    Returns:
        Token JWT codificado
    """
    expire = datetime.utcnow() + timedelta(hours=expires_hours)

    payload = {
        "user_id": user_id,
        "username": username,
        "full_name": full_name,
        "exp": expire,
        "iat": datetime.utcnow()
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def verify_token(token: str) -> Optional[dict]:
    """
    Verifica un token JWT y retorna el payload si es válido

    Args:
        token: Token JWT a verificar

    Returns:
        Payload del token si es válido, None si es inválido
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        # Token expirado
        return None
    except jwt.InvalidTokenError:
        # Token inválido
        return None


def create_refresh_token(user_id: int) -> str:
    """
    Crea un token de refresco que dura más tiempo (30 días)
    Útil para la opción "recordar dispositivo"
    """
    expire = datetime.utcnow() + timedelta(days=30)

    payload = {
        "user_id": user_id,
        "type": "refresh",
        "exp": expire,
        "iat": datetime.utcnow()
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token
