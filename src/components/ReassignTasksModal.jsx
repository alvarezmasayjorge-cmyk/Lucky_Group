import { useState, useEffect } from 'react'
import { X, ArrowRightLeft, Users } from 'lucide-react'

export default function ReassignTasksModal({ isOpen, onClose, profiles, allTareas, onConfirm }) {
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  // Reset local state whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setFromId('')
      setToId('')
      setConfirming(false)
      setLoading(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const count = fromId ? allTareas.filter(t => t.responsable_id === fromId).length : 0
  const sameSelected = fromId && toId && fromId === toId
  const canSubmit = fromId && toId && !sameSelected && count > 0 && !loading

  const fromName = profiles.find(p => p.id === fromId)?.nombre_completo || ''
  const toName = profiles.find(p => p.id === toId)?.nombre_completo || ''

  const handleConfirm = async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      await onConfirm(fromId, toId)
      onClose()
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Transferir tareas
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 space-y-6">
          <p className="text-sm text-gray-500">
            Reasigna todas las tareas de un compañero a otro de una sola vez.
          </p>

          {/* From */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">De (origen)</label>
            <select
              value={fromId}
              onChange={(e) => { setFromId(e.target.value); setConfirming(false) }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all bg-white shadow-sm font-medium"
            >
              <option value="">Selecciona una persona…</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.nombre_completo}{p.rol_equipo ? ` (${p.rol_equipo})` : ''}</option>
              ))}
            </select>
          </div>

          {/* To */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">A (destino)</label>
            <select
              value={toId}
              onChange={(e) => { setToId(e.target.value); setConfirming(false) }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all bg-white shadow-sm font-medium"
            >
              <option value="">Selecciona una persona…</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.nombre_completo}{p.rol_equipo ? ` (${p.rol_equipo})` : ''}</option>
              ))}
            </select>
          </div>

          {/* Live feedback */}
          {sameSelected ? (
            <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-sm font-medium border border-amber-100">
              El origen y el destino no pueden ser la misma persona.
            </div>
          ) : fromId ? (
            <div className="flex items-center gap-2 bg-brand-light/60 text-gray-700 p-3 rounded-xl text-sm font-medium border border-gray-100">
              <Users className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <span>
                Se transferirán <strong>{count}</strong> {count === 1 ? 'tarea' : 'tareas'}
                {toName ? <> de <strong>{fromName}</strong> a <strong>{toName}</strong></> : <> de <strong>{fromName}</strong></>}.
              </span>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          {confirming ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-700">
                ¿Confirmas transferir {count} {count === 1 ? 'tarea' : 'tareas'} a {toName}?
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setConfirming(false)}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!canSubmit}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-dark transition shadow-md disabled:opacity-50"
                >
                  {loading ? 'Transfiriendo…' : 'Confirmar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => setConfirming(true)}
                disabled={!canSubmit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-black transition shadow-md disabled:opacity-50"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Transferir tareas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
