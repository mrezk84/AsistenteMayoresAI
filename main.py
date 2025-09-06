from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pdf_utils import extract_text_from_pdf
from vector_store import store_text, get_relevant_chunks
from chat_engine import ask_gpt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    contents = await file.read()
    text = extract_text_from_pdf(contents)
    store_text(text)
    return {"message": "Manual cargado con éxito."}

@app.post("/ask/")
async def ask_question(question: str = Form(...)):
    relevant_chunks = get_relevant_chunks(question)
    answer = ask_gpt(question, relevant_chunks)
    return {"answer": answer}
