import { Filter, Search, EyeOff } from 'lucide-react'
import { ROLES } from '../lib/constants'

const selectClass = 'text-sm px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary outline-none bg-white text-gray-700 w-full sm:min-w-[130px] sm:w-auto'

export default function FilterBar({
  secciones,
  profiles,
  selectedSeccion,
  setSelectedSeccion,
  selectedRol,
  setSelectedRol,
  selectedResponsable,
  setSelectedResponsable,
  searchQuery,
  setSearchQuery,
  hideCompleted,
  setHideCompleted,
  roles = ROLES,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <div className="flex items-center text-gray-500 mr-1">
        <Filter className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium hidden sm:inline">Filters:</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks…"
          className="text-sm pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary outline-none bg-white text-gray-700 w-full sm:w-36"
        />
      </div>

      <select
        value={selectedSeccion}
        onChange={(e) => setSelectedSeccion(e.target.value)}
        className={selectClass}
      >
        <option value="all">All sections</option>
        {secciones.map(s => (
          <option key={s.id} value={s.id}>{s.nombre}</option>
        ))}
      </select>

      <select
        value={selectedRol}
        onChange={(e) => setSelectedRol(e.target.value)}
        className={selectClass}
      >
        <option value="all">All roles</option>
        {roles.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <select
        value={selectedResponsable}
        onChange={(e) => setSelectedResponsable(e.target.value)}
        className={selectClass}
      >
        <option value="all">Anyone</option>
        {profiles.map(p => (
          <option key={p.id} value={p.id}>{p.nombre_completo}</option>
        ))}
      </select>

      {/* Hide completed toggle */}
      <button
        onClick={() => setHideCompleted(!hideCompleted)}
        title={hideCompleted ? 'Show completed tasks' : 'Hide completed tasks'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-all ${
          hideCompleted
            ? 'bg-brand-primary text-white border-brand-primary'
            : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
        }`}
      >
        <EyeOff className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Hide done</span>
      </button>
    </div>
  )
}
