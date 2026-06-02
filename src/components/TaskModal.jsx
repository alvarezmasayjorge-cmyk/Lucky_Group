import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore'
import { X } from 'lucide-react'

const ROLES = ['Cliente', 'Media Buyer', 'Funneler', 'Editor de Video', 'Diseñador Gráfico']

export default function TaskModal({ isOpen, onClose, task, secciones, profiles, profile, currentSeccionId }) {
  const [loading, setLoading] = useState(false)
  
  // States for form fields
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [seccionId, setSeccionId] = useState(currentSeccionId || secciones[0]?.id || '')
  const [responsableRol, setResponsableRol] = useState('')
  const [responsableId, setResponsableId] = useState('')
  const [estado, setEstado] = useState('pendiente')
  const [prioridad, setPrioridad] = useState('media')
  const [fechaLimite, setFechaLimite] = useState('')

  useEffect(() => {
    if (task) {
      setTitulo(task.titulo || '')
      setDescripcion(task.descripcion || '')
      setSeccionId(task.seccion_id || '')
      setResponsableRol(task.responsable_rol || '')
      setResponsableId(task.responsable_id || '')
      setEstado(task.estado || 'pendiente')
      setPrioridad(task.prioridad || 'media')
      setFechaLimite(task.fecha_limite ? task.fecha_limite.split('T')[0] : '')
    } else {
      setSeccionId(currentSeccionId || secciones[0]?.id || '')
    }
  }, [task, currentSeccionId, secciones])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      titulo,
      descripcion,
      seccion_id: seccionId,
      responsable_rol: responsableRol || null,
      responsable_id: responsableId || null,
      estado,
      prioridad,
      fecha_limite: fechaLimite || null,
      actualizado_en: new Date().toISOString()
    }

    try {
      if (task) {
        // Update
        const taskRef = doc(db, 'tareas', task.id)
        await updateDoc(taskRef, payload)
      } else {
        // Insert
        payload.creado_por = profile.id
        payload.creado_en = new Date().toISOString()
        await addDoc(collection(db, 'tareas'), payload)
      }
      onClose()
    } catch (error) {
      console.error('Error saving task:', error.message)
      alert('Hubo un error al guardar la tarea.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            {task ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título de la tarea *</label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary outline-none"
                placeholder="Ej. Revisar copys para campaña"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary outline-none"
                placeholder="Detalles adicionales..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sección *</label>
                <select
                  required
                  value={seccionId}
                  onChange={(e) => setSeccionId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary outline-none bg-white"
                >
                  <option value="" disabled>Selecciona una sección...</option>
                  {secciones.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select
                  required
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary outline-none bg-white"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_curso">En Curso</option>
                  <option value="hecho">Hecho</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol Responsable</label>
                <select
                  value={responsableRol}
                  onChange={(e) => setResponsableRol(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary outline-none bg-white"
                >
                  <option value="">Cualquier rol</option>
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Persona Asignada</label>
                <select
                  value={responsableId}
                  onChange={(e) => setResponsableId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary outline-none bg-white"
                >
                  <option value="">Sin asignar</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre_completo} ({p.rol_equipo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad *</label>
                <select
                  required
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary outline-none bg-white"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite</label>
                <input
                  type="date"
                  value={fechaLimite}
                  onChange={(e) => setFechaLimite(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="task-form"
            disabled={loading}
            className="px-4 py-2 text-white bg-brand-primary rounded-md hover:bg-brand-dark transition disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Tarea'}
          </button>
        </div>

      </div>
    </div>
  )
}
