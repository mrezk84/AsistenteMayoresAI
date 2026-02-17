# Instrucciones de Despliegue - AsistenteMayoresAI

## Despliegue Automático (GitHub Actions + Vercel)

Este repositorio incluye el workflow `.github/workflows/vercel-deploy.yml` para desplegar el frontend automáticamente en Vercel cuando hay cambios en `main`.

### 1) Configurar secretos en GitHub

En GitHub ve a **Settings → Secrets and variables → Actions** y agrega:

| Secret | Descripción |
|---|---|
| `VERCEL_TOKEN` | Token personal de Vercel |
| `VERCEL_ORG_ID` | ID de organización/equipo de Vercel |
| `VERCEL_PROJECT_ID` | ID del proyecto de Vercel |

### 2) URL del workflow de GitHub Actions

Una vez hecho push a `main`, puedes ver la ejecución aquí:

```text
https://github.com/<usuario>/<repositorio>/actions/workflows/vercel-deploy.yml
```

Ejemplo para este repo:

```text
https://github.com/mrezk84/AsistenteMayoresAI/actions/workflows/vercel-deploy.yml
```

### 3) URL pública de Vercel

Cuando el workflow termina correctamente:

- En el **Job Summary** aparece la URL de producción.
- También queda disponible en el panel de Vercel en **Deployments**.

Formato típico:

```text
https://<tu-proyecto>.vercel.app
```

---

## Despliegue Manual con Vercel

### Paso 1: Desplegar Frontend en Vercel

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión con GitHub.
2. Hacer clic en **"Add New Project"**.
3. Importar el repositorio: `mrezk84/AsistenteMayoresAI`.
4. Configurar:

   **Root Directory:**
   ```
   asistente-frontend
   ```

   **Environment Variables:**
   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://asistente-mayores-backend.onrender.com` |

5. Hacer clic en **"Deploy"**.

### Paso 2: Desplegar Backend en Render

1. Ir a [render.com](https://render.com) e iniciar sesión con GitHub.
2. Hacer clic en **"New +"** → **"Web Service"**.
3. Conectar el repositorio: `mrezk84/AsistenteMayoresAI/asistente-backend`.

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
   | `OPENAI_API_KEY` | `tu_clave_de_openai_aqui` |
   | `PYTHON_VERSION` | `3.11.7` |

5. Hacer clic en **"Create Web Service"**.

## URLs del Despliegue

Una vez completado:

| Servicio | URL |
|----------|-----|
| Frontend | `https://tu-app.vercel.app` |
| Backend | `https://asistente-mayores-backend.onrender.com` |
| API Docs | `https://asistente-mayores-backend.onrender.com/docs` |

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
Debe retornar: `{"status":"healthy","service":"Asistente Mayores API"}`.
