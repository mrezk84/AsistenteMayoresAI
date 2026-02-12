# 🧓 Asistente para Personas Mayores

Asistente digital accesible que permite a personas mayores **cargar manuales en PDF** y hacer preguntas en lenguaje natural sobre su contenido. El sistema responde de forma clara y sencilla, con **soporte completo de voz** (entrada y salida).

## ✨ Características

### 🎯 Funcionalidades Principales
- **Chat con historial completo** - Las conversaciones se guardan y persisten
- **Entrada por voz** - Habla tus preguntas usando el micrófono
- **Salida de voz** - Las respuestas se leen en voz alta automáticamente
- **Subida de PDFs** - Carga manuales para consultar su contenido
- **Gestión de conversaciones** - Crea, edita y elimina conversaciones
- **Diseño accesible** - Fuentes grandes, alto contraste, botones grandes

### ♿ Accesibilidad
- Fuentes base de 18px para mejor legibilidad
- Alto contraste WCAG AA compliant
- Botones con mínimo táctil de 44px
- Navegación por teclado (Enter para enviar, Esc para cancelar)
- Indicadores de foco visibles
- Aria labels para lectores de pantalla

---

## 📐 Arquitectura

El sistema sigue una arquitectura **cliente-servidor**:

### Frontend (Cliente web)
- **React 18** con Vite
- **React Router** para navegación
- **TailwindCSS** para estilos
- **Web Speech API** para voz (entrada y salida)

### Backend (Servidor API)
- **FastAPI** (Python)
- **SQLAlchemy** con SQLite para persistencia
- **ChromaDB** para búsquedas semánticas
- **OpenAI GPT-4** para generar respuestas
- **PyMuPDF** para procesar PDFs

---

## 🛠️ Tecnologías

| Capa          | Tecnologías |
|---------------|-------------|
| **Frontend**  | React, Vite, React Router, TailwindCSS, Web Speech API |
| **Backend**   | FastAPI, SQLAlchemy, Uvicorn, Python-dotenv |
| **IA**        | OpenAI GPT-4, Embeddings |
| **Vector DB** | ChromaDB |
| **Base de Datos** | SQLite |
| **PDF**       | PyMuPDF |

---

## 🚀 Instalación y Desarrollo

### Requisitos Previos
- Node.js 18+
- Python 3.9+
- API Key de OpenAI

### Backend

```bash
cd asistente-backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env
echo "OPENAI_API_KEY=tu_clave_aqui" > .env

# Ejecutar servidor
uvicorn main:app --reload
```

El backend estará disponible en `http://localhost:8000`

### Frontend

```bash
cd asistente-frontend

# Instalar dependencias
npm install

# Crear archivo .env (opcional, por defecto apunta a localhost:8000)
echo "VITE_API_URL=http://localhost:8000" > .env

# Ejecutar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

---

## 📂 Estructura del Proyecto

```
AsistenteMayoresAI/
├── asistente-backend/          # API FastAPI
│   ├── main.py                 # Endpoints de la API
│   ├── database.py             # Configuración de BD
│   ├── models.py               # Modelos SQLAlchemy
│   ├── chat_engine.py          # Integración con OpenAI
│   ├── pdf_utils.py            # Procesamiento de PDFs
│   ├── vector_store.py         # ChromaDB embeddings
│   └── requirements.txt        # Dependencias Python
│
├── asistente-frontend/         # Aplicación React
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── PDFUploader.jsx
│   │   │   ├── VoiceControls.jsx
│   │   │   └── Layout.jsx
│   │   ├── hooks/             # Hooks personalizados
│   │   │   ├── useChat.js
│   │   │   ├── useSpeech.js
│   │   │   └── useLocalStorage.js
│   │   ├── pages/             # Páginas de la app
│   │   │   ├── ChatPage.jsx
│   │   │   ├── UploadPage.jsx
│   │   │   └── HistoryPage.jsx
│   │   ├── services/          # Cliente API
│   │   │   └── api.js
│   │   ├── utils/             # Utilidades
│   │   │   └── constants.js
│   │   ├── App.jsx            # Router principal
│   │   └── index.css          # Estilos globales
│   └── package.json
│
└── README.md
```

---

## 🔄 API Endpoints

### Endpoints Originales (Mantenidos por compatibilidad)
- `POST /upload-pdf/` - Subir PDF (sin usuario)
- `POST /ask/` - Pregunta sin historial

### Nuevos Endpoints con Base de Datos

#### Gestión de Conversaciones
- `GET /conversations/?device_id={id}` - Listar conversaciones
- `GET /conversations/{id}` - Obtener conversación con mensajes
- `POST /conversations/` - Crear nueva conversación
- `PUT /conversations/{id}` - Actualizar título
- `DELETE /conversations/{id}` - Eliminar conversación

#### Chat
- `POST /chat/` - Enviar mensaje con historial

#### PDFs
- `POST /pdfs/upload` - Subir PDF asociado a usuario
- `GET /pdfs/user/{user_id}` - Listar PDFs del usuario

#### Utilidades
- `GET /users/device/{device_id}` - Obtener o crear usuario
- `GET /health` - Health check

---

## 🚀 Despliegue

### Backend en Render
1. Crear servicio web en [Render](https://render.com)
2. Conectar repositorio, configurar carpeta `asistente-backend`
3. Variables de entorno:
   - `OPENAI_API_KEY=tu_clave`
4. Deploy automático desde git

### Frontend en Vercel
1. Crear proyecto en [Vercel](https://vercel.com)
2. Conectar repositorio, configurar carpeta `asistente-frontend`
3. Variables de entorno:
   - `VITE_API_URL=https://tu-backend.onrender.com`
4. Deploy automático desde git

---

## 🎨 Uso de la Aplicación

### 1. Subir un Manual
- Ve a la sección "Subir PDF"
- Arrastra o selecciona un archivo PDF
- Espera el procesamiento

### 2. Chatear
- Escribe tu pregunta en el campo de texto
- O presiona el botón del micrófono para hablar
- La respuesta aparecerá en el chat y se leerá en voz alta

### 3. Gestionar Conversaciones
- Ve a "Historial" para ver todas tus conversaciones
- Haz clic en una para continuarla
- Elimina las que ya no necesites

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
