# Instrucciones de Despliegue - AsistenteMayoresAI

## Despliegue Rápido con Vercel

### Paso 1: Desplegar Frontend en Vercel

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión con GitHub
2. Hacer clic en **"Add New Project"**
3. Importar el repositorio: `mrezk84/AsistenteMayoresAI`
4. Configurar:

   **Root Directory:**
   ```
   asistente-frontend
   ```

   **Environment Variables:**
   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://asistente-mayores-backend.onrender.com` |

5. Hacer clic en **"Deploy"**

### Paso 2: Desplegar Backend en Render

1. Ir a [render.com](https://render.com) e iniciar sesión con GitHub
2. Hacer clic en **"New +"** → **"Web Service"**
3. Conectar el repositorio: `mrezk84/AsistenteMayoresAI/asistente-backend`

4. Configurar:

   **Name:** `asistente-mayores-backend`

   **Root Directory:** (dejar vacío para usar la raíz)

   **Build Command:**
   ```bash
   pip install -r requirements.txt
   ```

   **Start Command:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

   **Environment Variables:**
   | Name | Value |
   |------|-------|
   | `ANTHROPIC_API_KEY` | `tu_clave_de_anthropic_aqui` |
   | `PYTHON_VERSION` | `3.11.7` |

5. Hacer clic en **"Create Web Service"**

## URLs del Despliegue

Una vez completado:

| Servicio | URL |
|----------|-----|
| Frontend | `https://tu-app.vercel.app` |
| Backend | `https://asistente-mayores-backend.onrender.com` |
| API Docs | `https://asistente-mayores-backend.onrender.com/docs` |

## Configuración Adicional

### Actualizar el Frontend

Después de que ambos servicios estén desplegados:

1. En Vercel, ir a **Settings** → **Environment Variables**
2. Actualizar `VITE_API_URL` con la URL real del backend
3. Hacer un nuevo deploy

### Actualizar Python en Render

Si hay problemas con ChromaDB:

1. En Render, ir a **Environment** tab
2. Agregar variable: `PYTHON_VERSION` = `3.11.7`
3. Redeploy el servicio

## Verificar el Despliegue

### Frontend
```bash
curl https://tu-app.vercel.app
```
Debe mostrar la aplicación.

### Backend
```bash
curl https://asistente-mayores-backend.onrender.com/health
```
Debe retornar: `{"status":"healthy","service":"Asistente Mayores API"}`

## Troubleshooting

### Error: "Cannot connect to backend"

- Verificar que `VITE_API_URL` esté correcta en Vercel
- Verificar que el backend esté corriendo en Render
- Verificar CORS en el backend

### Error: "ChromaDB not working"

- Usar Python 3.11 en lugar de 3.13
- Verificar que las dependencias estén instaladas

### Error: "OpenAI API key not found"

- Agregar `ANTHROPIC_API_KEY` en Render
- Recrear el servicio si la variable fue agregada después

## Alternativa: Otros Proveedores

### Railway
```bash
# Railway
railway up
```

### Fly.io
```bash
# Fly.io
fly launch
```

### PythonAnywhere
- Subir código manualmente
- Configurar Python 3.11
- Instalar dependencias
- Configurar web app
