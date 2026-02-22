from anthropic import Anthropic
import os
from dotenv import load_dotenv

load_dotenv()

# Inicializar el cliente de Anthropic Claude
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def ask_gpt(question: str, context_chunks: list) -> str:
    """
    Función para preguntar sin historial (mantenida por compatibilidad)
    Usa Claude 3.5 Sonnet para respuestas amables y claras.
    """
    context = "\n".join(context_chunks) if context_chunks else "No hay contexto adicional."

    # Construir el prompt para Claude
    system_prompt = """Eres un asistente amable y paciente diseñado especialmente para ayudar a personas mayores.

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

    user_message = f"""Tengo esta información de contexto:

{context}

Pregunta del usuario: {question}

Por favor, responde de forma clara y amable."""

    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",  # Claude 3.5 Sonnet
            max_tokens=1000,
            temperature=0.7,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )
        return response.content[0].text
    except Exception as e:
        return f"Lo siento, tuve un problema al procesar tu pregunta. Por favor, intenta de nuevo. Si el problema persiste, verifica que la API key esté configurada correctamente."
