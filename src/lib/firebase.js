import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCQzp0I84TzzbTgWIXxRkvdwm57bdSl7Uk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lucky-group-consultation.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lucky-group-consultation",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lucky-group-consultation.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1034024430502",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1034024430502:web:a4c539a81857dc308ebd67",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Exponer en consola para debugging
if (typeof window !== 'undefined') {
  window.db = db
  window.firebaseUtils = { collection, getDocs, query, where }
}
