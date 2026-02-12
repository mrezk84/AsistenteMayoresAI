$(head -173 README.md.bak)

## 🚀 Despliegue

> **Instrucciones detalladas:** Ver [INSTRUCCIONES_DESPLIEGUE.md](INSTRUCCIONES_DESPLIEGUE.md)

### Backend en Render
1. Crear servicio web en [Render](https://render.com).
2. Conectar repositorio: \`mrezk84/AsistenteMayoresAI/asistente-backend\`
3. Configurar:
   - **Root Directory:** (vacío, usar raíz del submodule)
   - **Build Command:** \`pip install -r requirements.txt\`
   - **Start Command:** \`uvicorn main:app --host 0.0.0.0 --port $PORT\`
   - **Python Version:** \`3.11.7\` (importante: no usar 3.13 por ChromaDB)
4. Variables de entorno:
   - \`OPENAI_API_KEY=tu_clave\`
5. Deploy automático desde Git

### Frontend en Vercel
1. Crear proyecto en [Vercel](https://vercel.com).
2. Importar repositorio: \`mrezk84/AsistenteMayoresAI\`
3. Configurar:
   - **Root Directory:** \`asistente-frontend\`
   - **Build Command:** \`npm run build\`
   - **Output Directory:** \`dist\`
   - **Environment Variables:**
     - \`VITE_API_URL=https://tu-backend.onrender.com\`
4. Deploy automático desde Git

---
### 3. Gestionar Conversaciones
- Ve a "Historial" para ver todas tus conversaciones
- Haz clic en una para continuarla
- Elimina las que ya no necesites

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
