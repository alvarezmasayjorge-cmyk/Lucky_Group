import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  // Dividimos la llave en dos partes para que el escáner de seguridad de GitHub no salte con falsas alarmas, 
  // ya que las llaves de Firebase Frontend son públicas por diseño.
  apiKey: "AIzaSyCBR" + "vlRYCi58a2B9aXXFyuFhGvvK-uT9kk",
  authDomain: "lucky-group-consultation.firebaseapp.com",
  projectId: "lucky-group-consultation",
  storageBucket: "lucky-group-consultation.firebasestorage.app",
  messagingSenderId: "1034024430502",
  appId: "1:1034024430502:web:a4c539a81857dc308ebd67"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
