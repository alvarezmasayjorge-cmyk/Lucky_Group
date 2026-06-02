import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore'
import { X, LayoutTemplate } from 'lucide-react'
import { ROLES, AREAS } from '../lib/constants'

export default function TaskModal({ isOpen, onClose, task, secciones, profiles, profile, currentActiveArea, activeClientId }) {
  const [loading, setLoading] = useState(false)
  
  // States for form fields
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [area, setArea] = useState(currentActiveArea || 'meta_ads')
  const [seccionId, setSeccionId] = useState('')
  const [responsableRol, setResponsableRol] = useState('')
  const [responsableId, setResponsableId] = useState('')
  const [status, setStatus] = useState('pending')
  const [prioridad, setPrioridad] = useState('medium')
  const [fechaLimite, setFechaLimite] = useState('')

  useEffect(() => {
    if (task) {
      setTitulo(task.titulo || '')
      setDescripcion(task.descripcion || '')
      
      // Find the area of this task's section
      const taskSection = secciones.find(s => s.id === task.seccion_id)
      const taskArea = taskSection ? taskSection.area : currentActiveArea
      setArea(taskArea)
      setSeccionId(task.seccion_id || '')
      
      setResponsableRol(task.responsable_rol || '')
      setResponsableId(task.responsable_id || '')
      setStatus(task.status ?? (task.completed ? 'completed' : 'pending'))
      setPrioridad(task.prioridad || 'medium')
      setFechaLimite(task.fecha_limite ? task.fecha_limite.split('T')[0] : '')
    } else {
      setArea(currentActiveArea || 'meta_ads')
      const initialSections = secciones.filter(s => s.area === (currentActiveArea || 'meta_ads'))
      setSeccionId(initialSections.length > 0 ? initialSections[0].id : '')
      setStatus('pending')
    }
  }, [task, secciones, currentActiveArea])

  // Update section dropdown when area changes
  useEffect(() => {
    const areaSections = secciones.filter(s => s.area === area)
    if (!task || (task && task.seccion_id && !areaSections.find(s => s.id === task.seccion_id))) {
      setSeccionId(areaSections.length > 0 ? areaSections[0].id : '')
    }
  }, [area, secciones, task])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      titulo,
      descripcion,
      seccion_id: seccionId,
      responsable_rol: responsableRol || null,
      responsable_id: responsableId || null,
      status,
      completed: status === 'completed',
      prioridad,
      fecha_limite: fechaLimite || null,
      actualizado_en: new Date().toISOString()
    }

    try {
      if (task) {
        // Update
        const taskRef = doc(db, 'checklist_tasks', task.id)
        await updateDoc(taskRef, payload)
      } else {
        // Insert
        payload.creado_por = profile.id
        payload.creado_en = new Date().toISOString()
        payload.client_id = activeClientId // Bind task to client
        await addDoc(collection(db, 'checklist_tasks'), payload)
      }
      onClose()
    } catch (error) {
      console.error('Error saving task:', error.message)
      alert('There was an error saving the task.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const filteredSections = secciones.filter(s => s.area === area)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {task ? 'Edit Task' : 'New Task'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Task Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all bg-white shadow-sm font-medium"
                placeholder="e.g. Create landing page"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all bg-white shadow-sm resize-none"
                placeholder="Additional details..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Area */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Area</label>
                <select
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all bg-white shadow-sm font-medium text-gray-700"
                >
                  {AREAS.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Section <span className="text-red-500">*</span></label>
                <select
                  required
                  value={seccionId}
                  onChange={(e) => setSeccionId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all bg-white shadow-sm font-medium text-gray-700 disabled:opacity-50"
                  disabled={filteredSections.length === 0}
                >
                  {filteredSections.length === 0 ? (
                    <option value="" disabled>No sections available in this area</option>
                  ) : (
                    <>
                      <option value="" disabled>Select a section...</option>
                      {filteredSections.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                <select
                  required
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all bg-white shadow-sm font-medium text-gray-700"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority <span className="text-red-500">*</span></label>
                <select
                  required
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all bg-white shadow-sm font-medium text-gray-700"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Responsible Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Responsible Role</label>
                <select
                  value={responsableRol}
                  onChange={(e) => setResponsableRol(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all bg-white shadow-sm font-medium text-gray-700"
                >
                  <option value="">Any role</option>
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Assigned Person */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assigned Person</label>
                <select
                  value={responsableId}
                  onChange={(e) => setResponsableId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all bg-white shadow-sm font-medium text-gray-700"
                >
                  <option value="">Unassigned</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre_completo} ({p.rol_equipo})</option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={fechaLimite}
                  onChange={(e) => setFechaLimite(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all bg-white shadow-sm font-medium text-gray-700"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 bg-white flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 font-bold bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-form"
            disabled={loading || filteredSections.length === 0}
            className="px-6 py-2.5 text-white font-bold bg-brand-primary rounded-xl hover:bg-brand-dark transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-md"
          >
            {loading ? 'Saving...' : 'Save Task'}
          </button>
        </div>

      </div>
    </div>
  )
}
