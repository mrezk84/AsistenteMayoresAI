from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configurar Google Gemini (SDK nuevo)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# System prompt optimizado para personas mayores
SYSTEM_PROMPT = """Eres un asistente amable y paciente diseñado especialmente para ayudar a personas mayores.

INSTRUCCIONES IMPORTANTES:
- Responde de forma clara, simple y respetuosa
- Usa lenguaje sencillo y evita términos técnicos
- Si explicas algo complejo, usa analogías cotidianas
- Sé paciente y empático en todo momento
- Las respuestas deben ser breves pero completas
- Usa oraciones cortas y fáciles de entender
- Puedes usar emojis ocasionales para hacer el texto más amigable (👋, 👍, ✅, etc.)
- Si no entiendes la pregunta, pide amablemente que la repitan

Tu objetivo es hacer que la tecnología sea accesible y menos intimidante."""


def ask_gpt(question: str, context_chunks: list) -> str:
    """
    Función para preguntar sin historial (mantenida por compatibilidad).
    Usa Google Gemini para respuestas amables y claras.
    """
    context = "\n".join(context_chunks) if context_chunks else "No hay contexto adicional."

    user_message = f"""{SYSTEM_PROMPT}

Tengo esta información de contexto:

{context}

Pregunta del usuario: {question}

Por favor, responde de forma clara y amable."""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_message
        )
        return response.text
    except Exception as e:
        print(f"❌ Error en Gemini API: {type(e).__name__}: {e}")
        return "Lo siento, tuve un problema al procesar tu pregunta. Por favor, intenta de nuevo."
