import { Draggable } from '@hello-pangea/dnd'
import { Calendar, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { db } from '../lib/firebase'
import { doc, deleteDoc } from 'firebase/firestore'
import { useState } from 'react'

export default function TaskCard({ tarea, index, profiles, onEdit }) {
  const [showMenu, setShowMenu] = useState(false)

  const getPrioridadColor = (prioridad) => {
    switch(prioridad) {
      case 'alta': return 'text-red-600 bg-red-50 border-red-100'
      case 'media': return 'text-yellow-600 bg-yellow-50 border-yellow-100'
      case 'baja': return 'text-blue-600 bg-blue-50 border-blue-100'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const responsable = profiles.find(p => p.id === tarea.responsable_id)
  
  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      await deleteDoc(doc(db, 'tareas', tarea.id))
    }
    setShowMenu(false)
  }

  return (
    <Draggable draggableId={tarea.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 group hover:shadow-md transition-all ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-brand-primary/50' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-2 relative">
            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getPrioridadColor(tarea.prioridad)}`}>
              Prioridad {tarea.prioridad}
            </span>
            
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-6 bg-white border border-gray-200 shadow-lg rounded-md w-32 z-10 py-1">
                <button 
                  onClick={() => { onEdit(tarea); setShowMenu(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 className="w-3 h-3" /> Editar
                </button>
                <button 
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" /> Eliminar
                </button>
              </div>
            )}
          </div>

          <h4 className="font-semibold text-gray-900 leading-tight mb-2">{tarea.titulo}</h4>
          
          {tarea.descripcion && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{tarea.descripcion}</p>
          )}

          <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-gray-100">
            {/* Responsable Row */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-brand-dark bg-brand-light px-2 py-1 rounded-md">
                {tarea.responsable_rol || 'Sin Rol'}
              </span>
              {responsable && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                  <div className="w-4 h-4 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-[8px]">
                    {responsable.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[80px]" title={responsable.nombre_completo}>
                    {responsable.nombre_completo.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>
            
            {/* Date Row */}
            {tarea.fecha_limite && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(tarea.fecha_limite), "d MMM", { locale: es })}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
