import { useState, useEffect } from 'react'
import { X, Users, Briefcase, Plus, Trash2, Lock } from 'lucide-react'
import { db } from '../lib/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { saveCustomRoles } from '../lib/migration'

// Manage the team: people (profiles) and positions (roles).
// Built-in roles can't be deleted; custom ones (e.g. "Media Buyer") are stored
// in Firestore via saveCustomRoles.
export default function TeamModal({ isOpen, onClose, profiles, allTareas, builtinRoles, customRoles, onChanged }) {
  const [tab, setTab] = useState('people')
  const [error, setError] = useState('')

  // People form
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  // Roles
  const [localCustom, setLocalCustom] = useState([])
  const [newRoleName, setNewRoleName] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTab('people')
      setError('')
      setNewName('')
      setNewRole('')
      setDeletingId(null)
      setLocalCustom(customRoles || [])
      setNewRoleName('')
    }
  }, [isOpen, customRoles])

  if (!isOpen) return null

  const allRoles = [...builtinRoles, ...localCustom]

  const taskCountFor = (profileId) => allTareas.filter(t => t.responsable_id === profileId).length

  // ── People actions ──
  const handleAddPerson = async () => {
    if (!newName.trim()) return
    setError('')
    try {
      await addDoc(collection(db, 'profiles'), {
        nombre_completo: newName.trim(),
        rol_equipo: newRole || '',
        actualizado_en: new Date().toISOString(),
      })
      setNewName('')
      setNewRole('')
      onChanged()
    } catch (err) { setError(err.message) }
  }

  const handleChangeRole = async (profileId, rol) => {
    setError('')
    try {
      await updateDoc(doc(db, 'profiles', profileId), { rol_equipo: rol, actualizado_en: new Date().toISOString() })
      onChanged()
    } catch (err) { setError(err.message) }
  }

  const handleDeletePerson = async (profileId) => {
    setError('')
    try {
      await deleteDoc(doc(db, 'profiles', profileId))
      setDeletingId(null)
      onChanged()
    } catch (err) { setError(err.message) }
  }

  // ── Role actions ──
  const persistRoles = async (roles) => {
    setLocalCustom(roles)
    try {
      await saveCustomRoles(roles)
      onChanged()
    } catch (err) { setError(err.message) }
  }

  const handleAddRole = async () => {
    const name = newRoleName.trim()
    if (!name) return
    if (allRoles.some(r => r.toLowerCase() === name.toLowerCase())) {
      setError('Ese puesto ya existe.')
      return
    }
    setError('')
    setNewRoleName('')
    await persistRoles([...localCustom, name])
  }

  const handleDeleteRole = async (name) => {
    setError('')
    await persistRoles(localCustom.filter(r => r !== name))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Equipo</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex items-center gap-2 bg-white">
          <button onClick={() => setTab('people')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition ${tab === 'people' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
            <Users className="w-4 h-4" /> Personas
          </button>
          <button onClick={() => setTab('roles')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition ${tab === 'roles' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
            <Briefcase className="w-4 h-4" /> Puestos
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">{error}</div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 space-y-4">
          {tab === 'people' ? (
            <>
              {/* Add person */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Agregar persona</p>
                <div className="flex flex-wrap gap-2">
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre (ej. Karla)" className="flex-1 min-w-[140px] text-sm px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20" />
                  <select value={newRole} onChange={e => setNewRole(e.target.value)} className="text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-brand-primary/20">
                    <option value="">Puesto…</option>
                    {allRoles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button onClick={handleAddPerson} disabled={!newName.trim()} className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold text-white bg-brand-primary hover:bg-brand-dark transition disabled:opacity-50">
                    <Plus className="w-4 h-4" /> Agregar
                  </button>
                </div>
              </div>

              {/* People list */}
              <div className="space-y-2">
                {profiles.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No hay personas todavía.</p>}
                {profiles.map(p => {
                  const count = taskCountFor(p.id)
                  return (
                    <div key={p.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800 truncate">{p.nombre_completo}</p>
                        <p className="text-xs text-gray-400">{count} {count === 1 ? 'tarea asignada' : 'tareas asignadas'}</p>
                      </div>
                      <select value={p.rol_equipo || ''} onChange={e => handleChangeRole(p.id, e.target.value)} className="text-sm px-2 py-1.5 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-brand-primary/20 max-w-[180px]">
                        <option value="">Sin puesto</option>
                        {allRoles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      {deletingId === p.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDeletePerson(p.id)} className="text-xs font-bold text-white bg-red-500 rounded-lg px-2.5 py-1.5 hover:bg-red-600">Borrar</button>
                          <button onClick={() => setDeletingId(null)} className="text-xs font-bold text-gray-500 px-2 py-1.5 hover:bg-gray-100 rounded-lg">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeletingId(p.id)} title={count > 0 ? 'Esta persona tiene tareas asignadas' : 'Borrar'} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              {/* Add role */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Agregar puesto</p>
                <div className="flex gap-2">
                  <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleAddRole() }} placeholder="ej. Media Buyer, Editor" className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20" />
                  <button onClick={handleAddRole} disabled={!newRoleName.trim()} className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold text-white bg-brand-primary hover:bg-brand-dark transition disabled:opacity-50">
                    <Plus className="w-4 h-4" /> Agregar
                  </button>
                </div>
              </div>

              {/* Roles list */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Puestos fijos</p>
                {builtinRoles.map(r => (
                  <div key={r} className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <span className="flex-1 text-sm font-medium text-gray-700">{r}</span>
                    <Lock className="w-3.5 h-3.5 text-gray-300" />
                  </div>
                ))}
                {localCustom.length > 0 && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Puestos personalizados</p>}
                {localCustom.map(r => (
                  <div key={r} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <span className="flex-1 text-sm font-bold text-gray-800">{r}</span>
                    <button onClick={() => handleDeleteRole(r)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-black transition shadow-md">Cerrar</button>
        </div>
      </div>
    </div>
  )
}
