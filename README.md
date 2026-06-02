# Lucky Consultation Group - Gestor de Tareas

Un gestor de tareas colaborativo y en tiempo real construido con React, Vite, Tailwind CSS y Firebase.

## Requisitos Previos

- Node.js (v18 o superior)
- Cuenta en [Firebase](https://firebase.google.com)

## Configuración de Base de Datos (Firebase)

1. Crea un nuevo proyecto en Firebase Console.
2. Habilita **Authentication** y añade el método de inicio de sesión con **Email/Password**.
3. Habilita **Firestore Database** (crea la base de datos en modo prueba o modo producción, pero asegúrate de ajustar las reglas de seguridad).
   *Reglas básicas de seguridad sugeridas:*
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
4. Agrega una **Web App** en tu proyecto de Firebase para obtener las credenciales de conexión (`firebaseConfig`).

## Configuración Local

1. Renombra el archivo `.env.example` a `.env`.
2. Copia tus credenciales de la Web App de Firebase en las variables correspondientes dentro de `.env`.
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Datos Iniciales (Seed)
La aplicación generará automáticamente las secciones ("Meta Ads", "Google Ads", "GHL") y las tareas de ejemplo iniciales la primera vez que inicies sesión y entres al tablero vacío.

## Despliegue (Vercel)

Para desplegar en Vercel:
1. Sube el código a GitHub.
2. Importa el repositorio en Vercel.
3. Añade todas las variables de entorno de Firebase (`VITE_FIREBASE_API_KEY`, etc.) en la configuración del proyecto en Vercel.
4. Despliega.
