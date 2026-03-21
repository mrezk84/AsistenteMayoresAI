from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database URL - por defecto usa SQLite local
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./asistente_mayores.db")

# Para PostgreSQL en Render, necesitamos agregar sslmode si no está presente
if DATABASE_URL.startswith("postgres") and "sslmode" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL + "?sslmode=require"

# Crear el engine con fallback a SQLite si PostgreSQL falla
try:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
        pool_pre_ping=True  # Verificar conexiones antes de usar
    )
    # Probar la conexión
    with engine.connect() as conn:
        pass
except Exception:
    # Si PostgreSQL falla (todavía no se creó en Render), usar SQLite
    print("⚠️ PostgreSQL no disponible aún, usando SQLite temporalmente")
    DATABASE_URL = "sqlite:///./asistente_mayores.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

# Session local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base declarativa para los modelos
Base = declarative_base()


# Dependencia para obtener la sesión de BD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Crear todas las tablas
def init_db():
    Base.metadata.create_all(bind=engine)
