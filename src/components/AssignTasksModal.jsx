import { useState, useEffect, useMemo } from 'react'
import { X, UserCheck, Search } from 'lucide-react'
import { AREAS } from '../lib/constants'

// Bulk-assign: filter the full task list, tick the ones you want, pick a person.
// Works both globally and "within a client" by using the client filter.
export default function AssignTasksModal({ isOpen, onClose, profiles, clients, secciones, allTareas, defaultClientId = '', onConfirm }) {
  const [clientId, setClientId] = useState('')
  const [areaId, setAreaId] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [toId, setToId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setClientId(defaultClientId || '')
      setAreaId('all')
      setSearch('')
      setSelected(new Set())
      setToId('')
      setLoading(false)
    }
  }, [isOpen, defaultClientId])

  const sectionById = useMemo(() => {
    const m = {}
    secciones.forEach(s => { m[s.id] = s })
    return m
  }, [secciones])

  const clientById = useMemo(() => {
    const m = {}
    clients.forEach(c => { m[c.id] = c })
    return m
  }, [clients])

  const profileById = useMemo(() => {
    const m = {}
    profiles.forEach(p => { m[p.id] = p })
    return m
  }, [profiles])

  const filtered = useMemo(() => {
    if (!isOpen) return []
    const q = search.trim().toLowerCase()
    return allTareas.filter(t => {
      if (clientId && t.client_id !== clientId) return false
      if (areaId !== 'all') {
        const sec = sectionById[t.seccion_id]
        if (!sec || sec.area !== areaId) return false
      }
      if (q && !(t.titulo || '').toLowerCase().includes(q)) return false
      return true
    })
  }, [isOpen, allTareas, clientId, areaId, search, sectionById])

  if (!isOpen) return null

  const allVisibleSelected = filtered.length > 0 && filtered.every(t => selected.has(t.id))
  const canSubmit = selected.size > 0 && toId && !loading
  const toName = profileById[toId]?.nombre_completo || ''

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAllVisible = () => {
    setSelected(prev => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        filtered.forEach(t => next.delete(t.id))
      } else {
        filtered.forEach(t => next.add(t.id))
      }
      return next
    })
  }

  const handleConfirm = async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      await onConfirm(Array.from(selected), toId)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
              <UserCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Asignar tareas a una persona</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-2">
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white font-medium outline-none focus:ring-2 focus:ring-brand-primary/20">
            <option value="">Todos los clientes</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={areaId} onChange={e => setAreaId(e.target.value)} className="text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white font-medium outline-none focus:ring-2 focus:ring-brand-primary/20">
            <option value="all">Todas las áreas</option>
            {AREAS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <div className="relative flex-1 min-w-[140px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar tarea…" className="w-full text-sm pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-brand-primary/20" />
          </div>
        </div>

        {/* Select-all bar */}
        <div className="px-6 py-2 border-b border-gray-100 flex items-center justify-between bg-white">
          <button onClick={toggleAllVisible} disabled={filtered.length === 0} className="text-sm font-semibold text-brand-primary hover:underline disabled:opacity-40 disabled:no-underline">
            {allVisibleSelected ? 'Quitar selección' : `Seleccionar ${filtered.length}`}
          </button>
          <span className="text-sm font-medium text-gray-500">{selected.size} seleccionadas</span>
        </div>

        {/* Task list */}
        <div className="overflow-y-auto flex-1 bg-gray-50/30 divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400 font-medium">No hay tareas con estos filtros.</div>
          ) : (
            filtered.map(t => {
              const sec = sectionById[t.seccion_id]
              const client = clientById[t.client_id]
              const current = t.responsable_id ? profileById[t.responsable_id]?.nombre_completo : (t.responsable_rol || 'Sin asignar')
              const checked = selected.has(t.id)
              return (
                <label key={t.id} className={`flex items-start gap-3 px-6 py-3 cursor-pointer transition ${checked ? 'bg-brand-light/40' : 'hover:bg-white'}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggle(t.id)} className="w-4 h-4 mt-0.5 accent-brand-primary cursor-pointer flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">{t.titulo}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {client?.name || '—'} · {sec?.nombre || '—'} · <span className="text-gray-500">{current}</span>
                    </p>
                  </div>
                </label>
              )
            })
          )}
        </div>

        {/* Footer: assign */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-wrap items-center justify-end gap-2">
          <span className="text-sm font-medium text-gray-500 mr-auto">Asignar a:</span>
          <select value={toId} onChange={e => setToId(e.target.value)} className="text-sm px-3 py-2.5 border border-gray-300 rounded-xl bg-white font-medium outline-none focus:ring-2 focus:ring-brand-primary/20">
            <option value="">Selecciona persona…</option>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.nombre_completo}{p.rol_equipo ? ` (${p.rol_equipo})` : ''}</option>)}
          </select>
          <button onClick={handleConfirm} disabled={!canSubmit} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-black transition shadow-md disabled:opacity-50">
            <UserCheck className="w-4 h-4" />
            {loading ? 'Asignando…' : `Asignar ${selected.size > 0 ? `(${selected.size})` : ''}${toName ? ` a ${toName}` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
