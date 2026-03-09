# 🤖 Asistente para Personas Mayores

> Un asistente virtual con inteligencia artificial diseñado para hacer la tecnología más accesible y amigable para personas mayores.

---

## ✨ ¿Qué hace esta aplicación?

Este asistente de chat permite a personas mayores **hacer preguntas en lenguaje natural** y recibir respuestas claras, simples y empáticas. Utiliza **Google Gemini 2.5 Flash** con búsqueda en tiempo real para brindar información actualizada.

### 🎯 Funcionalidades principales

| Función | Descripción |
|---------|-------------|
| 💬 **Chat inteligente** | Conversaciones naturales con IA empática y paciente |
| 🔍 **Búsqueda en tiempo real** | Respuestas actualizadas gracias a Google Search |
| 📄 **Subida de PDFs** | Sube manuales o documentos y hacé preguntas sobre ellos |
| 🎙️ **Entrada por voz** | Hablá en vez de escribir (Web Speech API) |
| 🔊 **Respuestas en voz alta** | El asistente puede leer sus respuestas |
| 📱 **Diseño responsive** | Funciona en celulares, tablets y computadoras |

---

## 🏗️ Arquitectura

```
┌─────────────────┐         ┌─────────────────────┐
│   Frontend      │  HTTP   │     Backend          │
│   React + Vite  │ ◄─────► │   FastAPI + Python   │
│   (GitHub Pages)│         │     (Render)         │
└─────────────────┘         └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │   Google Gemini AI   │
                            │   + Google Search    │
                            └─────────────────────┘
```

---

## 🚀 Cómo ejecutar localmente

### Requisitos previos
- **Python 3.12+**
- **Node.js 18+**
- Una [API Key de Google Gemini](https://aistudio.google.com/apikey) (gratis)

### 1. Backend

```bash
cd asistente-backend
python -m venv venv
source venv/bin/activate        # En Mac/Linux
pip install -r requirements.txt
```

Crear el archivo `.env`:
```env
GEMINI_API_KEY=tu_clave_de_gemini_aqui
API_SECRET_TOKEN=asistente-mayores-token-2024
```

Iniciar el servidor:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd asistente-frontend
npm install
```

Crear el archivo `.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_API_TOKEN=asistente-mayores-token-2024
```

Iniciar la app:
```bash
npm run dev
```

Abrir **http://localhost:3000** en tu navegador. ¡Listo! 🎉

---

## 🌐 Deploy en producción

| Servicio | Plataforma | URL |
|----------|------------|-----|
| Frontend | GitHub Pages | `https://mrezk84.github.io/AsistenteMayoresAI/` |
| Backend  | Render (Free) | `https://asistente-mayores-backend.onrender.com` |

El deploy es **automático**: cada push a `main` ejecuta el workflow de GitHub Actions que publica el frontend.

---

## 🛠️ Tecnologías utilizadas

### Frontend
- ⚛️ React 18
- ⚡ Vite
- 🎨 Tailwind CSS
- 🗣️ Web Speech API (voz)

### Backend
- 🐍 FastAPI
- 🧠 Google Gemini 2.5 Flash
- 🔎 Google Search Grounding
- 📊 SQLAlchemy + SQLite
- 📦 ChromaDB (búsqueda vectorial)
- 📄 PyMuPDF (procesamiento de PDFs)

---

## 📁 Estructura del proyecto

```
AsistenteMayoresAI/
├── asistente-frontend/          # Aplicación React
│   ├── src/
│   │   ├── components/          # Componentes UI
│   │   ├── hooks/               # Custom hooks
│   │   ├── pages/               # Páginas
│   │   └── services/            # Llamadas a API
│   └── package.json
├── asistente-backend/           # API FastAPI
│   ├── main.py                  # Endpoints y lógica principal
│   ├── chat_engine.py           # Motor de chat con Gemini
│   ├── vector_store.py          # Búsqueda vectorial (ChromaDB)
│   ├── pdf_utils.py             # Procesamiento de PDFs
│   ├── models.py                # Modelos de base de datos
│   └── requirements.txt
├── .github/workflows/           # CI/CD con GitHub Actions
├── render.yaml                  # Configuración de Render
└── README.md
```

---

## 👤 Autor

**Marcos Rezk** — [@mrezk84](https://github.com/mrezk84)

---

<p align="center">
  Hecho con ❤️ para hacer la tecnología más accesible
</p>
