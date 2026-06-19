# ⚠️ Alerta de Seguridad

## API Key Expuesta en GitHub

Una Google API Key de Firebase fue expuesta en el repositorio GitHub el **19 de Junio 2026**.

**API Key expuesta:** `AIzaSyCBRvlRYCi58a2B9aXXFyuFhGvvK-uT9kk` (REVOCADA)

### ¿Qué hacer ahora?

#### 1. Regenerar la API Key en Google Cloud
1. Ve a: https://console.cloud.google.com/
2. Selecciona el proyecto: `lucky-group-consultation`
3. Ve a: **APIs & Services** → **Credentials**
4. Elimina la clave expuesta
5. Crea una nueva API Key para aplicaciones web

#### 2. Actualizar el archivo .env local
```bash
# Archivo: .env (solo local, NUNCA en Git)
VITE_FIREBASE_API_KEY=<tu_nueva_clave>
VITE_FIREBASE_AUTH_DOMAIN=lucky-group-consultation.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lucky-group-consultation
VITE_FIREBASE_STORAGE_BUCKET=lucky-group-consultation.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1034024430502
VITE_FIREBASE_APP_ID=1:1034024430502:web:a4c539a81857dc308ebd67
```

#### 3. Verificar .gitignore
El archivo `.env` está en `.gitignore` y no debería sincronizarse a Git.

### ✅ Buenas prácticas

- ✅ Las credenciales sensibles van en `.env` (local, no en Git)
- ✅ Usa `.env.example` como plantilla sin valores reales
- ✅ Regenera las claves si fueron expuestas
- ✅ Usa Secrets en CI/CD (GitHub Actions, etc.)
- ✅ Nunca hardcodees credenciales en scripts que subes a Git

### 📝 Nota

El archivo `update-tasks.html` aún contiene la clave antigua marcada como TODO. Actualízalo después de regenerar la clave en Google Cloud.
