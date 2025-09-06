import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def ask_gpt(question: str, context_chunks: list) -> str:
    context = "\n".join(context_chunks)
    prompt = f"""
Te paso un manual (o parte de él) y una pregunta. Contestá lo más claro y fácil posible, como para una persona mayor.

Manual:
{context}

Pregunta:
{question}
"""

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message["content"]
