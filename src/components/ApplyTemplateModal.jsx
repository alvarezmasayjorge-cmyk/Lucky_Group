import { useState, useEffect } from 'react'
import { X, LayoutTemplate, Check } from 'lucide-react'
import { AREAS } from '../lib/constants'
import { TEMPLATE_SECTIONS, TEMPLATE_TASKS } from '../lib/templateTasks'

// Count how many standard tasks the template defines per area, so we can show
// the user what each area will add.
const TASKS_PER_AREA = AREAS.reduce((acc, area) => {
  const sectionNames = new Set(TEMPLATE_SECTIONS.filter(s => s.area === area.id).map(s => s.name))
  acc[area.id] = TEMPLATE_TASKS.filter(t => sectionNames.has(t.sectionName)).length
  return acc
}, {})

export default function ApplyTemplateModal({ isOpen, onClose, clientName, onConfirm }) {
  // Default-select the areas the user mentioned most: onboarding, meta, google, lsa, ghl.
  const [selected, setSelected] = useState({})
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (isOpen) {
      const init = {}
      AREAS.forEach(a => { init[a.id] = TASKS_PER_AREA[a.id] > 0 })
      setSelected(init)
      setConfirming(false)
      setLoading(false)
      setResult(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const selectedAreas = AREAS.filter(a => selected[a.id]).map(a => a.id)
  const totalTasks = selectedAreas.reduce((sum, id) => sum + (TASKS_PER_AREA[id] || 0), 0)
  const canSubmit = selectedAreas.length > 0 && totalTasks > 0 && !loading

  const toggle = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }))
    setConfirming(false)
  }

  const handleConfirm = async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      const res = await onConfirm(selectedAreas)
      setResult(res)
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
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Crear tareas estándar</h2>
              <p className="text-xs text-gray-500">{clientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 space-y-4">
          {result ? (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium border border-emerald-100">
              ✅ Se crearon <strong>{result.created}</strong> {result.created === 1 ? 'tarea' : 'tareas'}
              {result.sectionsCreated > 0 && <> y <strong>{result.sectionsCreated}</strong> {result.sectionsCreated === 1 ? 'sección nueva' : 'secciones nuevas'}</>}.
              {result.created === 0 && ' (Este cliente ya tenía todas las tareas estándar de esas áreas.)'}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                Elige las áreas que quieres crear con sus tareas estándar. Las tareas que el cliente ya tenga no se duplican.
              </p>
              <div className="space-y-2">
                {AREAS.map(area => {
                  const count = TASKS_PER_AREA[area.id] || 0
                  const disabled = count === 0
                  const isOn = selected[area.id]
                  return (
                    <button
                      key={area.id}
                      onClick={() => !disabled && toggle(area.id)}
                      disabled={disabled}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        disabled
                          ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                          : isOn
                          ? 'border-brand-primary bg-brand-light/50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border ${isOn ? 'bg-brand-primary border-brand-primary text-white' : 'border-gray-300 bg-white'}`}>
                        {isOn && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <span className="flex-1 font-semibold text-gray-800">{area.name}</span>
                      <span className="text-xs font-medium text-gray-400">{count} {count === 1 ? 'tarea' : 'tareas'}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          {result ? (
            <div className="flex justify-end">
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-black transition shadow-md">Listo</button>
            </div>
          ) : confirming ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-700">¿Crear {totalTasks} tareas en {clientName}?</p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setConfirming(false)} disabled={loading} className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition disabled:opacity-50">Cancelar</button>
                <button onClick={handleConfirm} disabled={!canSubmit} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-dark transition shadow-md disabled:opacity-50">
                  {loading ? 'Creando…' : 'Confirmar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-gray-500">{totalTasks} tareas en total</span>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
                <button onClick={() => setConfirming(true)} disabled={!canSubmit} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-black transition shadow-md disabled:opacity-50">
                  <LayoutTemplate className="w-4 h-4" />
                  Crear tareas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
