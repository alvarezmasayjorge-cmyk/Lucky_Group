import { Filter } from 'lucide-react'

const ROLES = ['Client', 'Media Buyer', 'Funneler', 'Video Editor', 'Graphic Designer']

export default function FilterBar({ 
  secciones, 
  profiles, 
  selectedSeccion, 
  setSelectedSeccion,
  selectedRol,
  setSelectedRol,
  selectedResponsable,
  setSelectedResponsable
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center text-gray-500 mr-2">
        <Filter className="w-5 h-5 mr-1" />
        <span className="text-sm font-medium hidden sm:inline">Filters:</span>
      </div>

      <select
        value={selectedSeccion}
        onChange={(e) => setSelectedSeccion(e.target.value)}
        className="text-sm px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary outline-none bg-white text-gray-700 min-w-[140px]"
      >
        <option value="all">All sections</option>
        {secciones.map(s => (
          <option key={s.id} value={s.id}>{s.nombre}</option>
        ))}
      </select>

      <select
        value={selectedRol}
        onChange={(e) => setSelectedRol(e.target.value)}
        className="text-sm px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary outline-none bg-white text-gray-700 min-w-[140px]"
      >
        <option value="all">All roles</option>
        {ROLES.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <select
        value={selectedResponsable}
        onChange={(e) => setSelectedResponsable(e.target.value)}
        className="text-sm px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary outline-none bg-white text-gray-700 min-w-[140px]"
      >
        <option value="all">Anyone</option>
        {profiles.map(p => (
          <option key={p.id} value={p.id}>{p.nombre_completo}</option>
        ))}
      </select>
    </div>
  )
}
