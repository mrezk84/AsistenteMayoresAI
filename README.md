# 🧓 Asistente para Personas Mayores – MVP

Este proyecto implementa un **asistente digital accesible** que permite a personas mayores **cargar manuales en PDF** y luego **hacer preguntas en lenguaje natural** sobre su contenido.  
El sistema responde en forma clara y sencilla, y puede **leer las respuestas en voz alta**.

---

## 📐 Arquitectura del Software

El sistema sigue una arquitectura **cliente-servidor** compuesta por:

- **Frontend (Cliente web)**  
  Aplicación React con Vite + TailwindCSS.  
  - Permite subir un PDF.  
  - Ofrece un chat accesible para preguntas.  
  - Muestra respuestas grandes y legibles.  
  - Integra un **lector de voz** con Web Speech API.  

- **Backend (Servidor API)**  
  API en **FastAPI (Python)**.  
  - Procesa PDFs y extrae su contenido.  
  - Genera embeddings con **OpenAI**.  
  - Indexa el contenido en **ChromaDB** (vector store).  
  - Responde preguntas usando GPT-4 con contexto del manual.  

- **Base de Datos Vectorial**  
  Se usa **ChromaDB (local con DuckDB+Parquet)** para almacenar los fragmentos de texto del PDF en forma de embeddings, facilitando búsquedas semánticas.  

---

## 🛠️ Tecnologías Utilizadas

| Capa          | Tecnologías |
|---------------|-------------|
| **Frontend**  | React, Vite, TailwindCSS, Web Speech API |
| **Backend**   | FastAPI, Uvicorn, Python-dotenv |
| **IA**        | OpenAI GPT-4, Embeddings (text-embedding-ada-002) |
| **Vector DB** | ChromaDB |
| **PDF**       | PyMuPDF |
| **Infra**     | Vercel (frontend), Render (backend) |

---

## 🔄 Flujo del Sistema

1. El usuario sube un **manual en PDF** desde el frontend.
2. El backend:
   - Extrae el texto del PDF con **PyMuPDF**.  
   - Lo divide en fragmentos y genera embeddings.  
   - Los guarda en **ChromaDB**.  
3. El usuario hace una **pregunta** en el chat.  
4. El backend:
   - Busca en ChromaDB los fragmentos más relevantes.  
   - Arma un **prompt contextualizado**.  
   - Consulta a **OpenAI GPT-4** para generar la respuesta.  
5. El frontend muestra la respuesta en texto grande y la **lee en voz alta**.  

---

## 📂 Estructura del Proyecto

### Backend (`asistente-backend/`)
```
├── main.py              # API principal
├── pdf_utils.py         # Extracción de texto de PDFs
├── vector_store.py      # Manejo de embeddings y búsquedas
├── chat_engine.py       # Integración con OpenAI GPT
├── requirements.txt     # Dependencias
├── .env.example         # Variables de entorno
└── README.md
```

### Frontend (`asistente-frontend/`)
```
├── index.html
├── vite.config.js
├── package.json
├── tailwind.config.js
├── src/
│   ├── App.jsx          # Interfaz principal
│   ├── index.css        # Estilos
│   └── components/      # (opcional para expansión)
└── README.md
```

---

## 🚀 Despliegue

### Backend en Render
1. Crear un nuevo servicio web en [Render](https://render.com).
2. Subir el código de `asistente-backend/`.
3. Configurar variable de entorno:  
   - `OPENAI_API_KEY=tu_clave_de_openai`
4. Deploy → API lista en `https://asistente-backend.onrender.com`.

### Frontend en Vercel
1. Crear un nuevo proyecto en [Vercel](https://vercel.com).
2. Subir el código de `asistente-frontend/`.
3. Configurar variable de entorno con la URL del backend:  
   - `VITE_API_URL=https://asistente-backend.onrender.com`
4. Deploy → Web lista en `https://asistente-frontend.vercel.app`.

---

## 🔮 Próximos pasos (mejoras futuras)

- **Autenticación de usuarios** (para que cada uno tenga sus manuales).  
- **Interfaz con íconos grandes y colores de alto contraste**.  
- **Soporte de voz completo** (preguntar también con micrófono).  
- **Modo familiar**: un contacto puede conectarse y guiar al usuario.  
- **Historial de preguntas y respuestas**.  
