import { useState } from 'react'
import { db } from '../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

const ROLES = [
  'Cliente',
  'Media Buyer',
  'Funneler',
  'Editor de Video',
  'Diseñador Gráfico'
]

export default function ProfileSetup({ user, onProfileUpdated }) {
  const [loading, setLoading] = useState(false)
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState('')
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await setDoc(doc(db, 'profiles', user.uid), {
        id: user.uid,
        nombre_completo: nombre,
        rol_equipo: rol,
        creado_en: new Date().toISOString()
      })
      onProfileUpdated()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-brand-dark mb-6 text-center">Completa tu Perfil</h2>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Para colaborar en el equipo de Lucky Consultation Group, necesitamos saber quién eres.
        </p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol en el Equipo</label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition bg-white"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="" disabled>Selecciona tu rol...</option>
              {ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-dark transition disabled:opacity-50 mt-4"
          >
            {loading ? 'Guardando...' : 'Entrar al Tablero'}
          </button>
        </form>
      </div>
    </div>
  )
}
