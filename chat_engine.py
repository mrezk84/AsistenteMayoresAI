from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

# Inicializar el cliente de OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def ask_gpt(question: str, context_chunks: list) -> str:
    """
    Función original para preguntar sin historial (mantenida por compatibilidad)
    """
    context = "\n".join(context_chunks)
    prompt = f"""
Te paso un manual (o parte de él) y una pregunta. Contestá lo más claro y fácil posible, como para una persona mayor.

Manual:
{context}

Pregunta:
{question}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Lo siento, tuve un problema al procesar tu pregunta. Por favor, intenta de nuevo. (Error: {str(e)})"
