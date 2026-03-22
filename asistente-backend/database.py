from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import traceback

# Database URL - por defecto usa SQLite local
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./asistente_mayores.db")

print(f"🔗 DATABASE_URL detectada: {DATABASE_URL[:50]}..." if len(DATABASE_URL) > 50 else f"🔗 DATABASE_URL: {DATABASE_URL}")

# Para PostgreSQL en Render, necesitamos agregar sslmode si no está presente
if DATABASE_URL.startswith("postgres") and "sslmode" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL + "?sslmode=require"
    print(f"🔒 SSL agregado a la URL de PostgreSQL")

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

    if DATABASE_URL.startswith("postgres"):
        print("✅ Conectado a PostgreSQL exitosamente")
    else:
        print("✅ Usando SQLite (base de datos local)")

except Exception as e:
    # Si PostgreSQL falla, mostrar el error y usar SQLite
    print(f"❌ Error conectando a PostgreSQL: {str(e)}")
    print(f"📋 Traceback completo:\n{traceback.format_exc()}")
    print("⚠️ Usando SQLite temporalmente")
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
