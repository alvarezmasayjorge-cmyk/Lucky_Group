import { Droppable } from '@hello-pangea/dnd'
import TaskCard from './TaskCard'

export default function SectionColumn({ estado, tareas, profiles, onEdit }) {
  // Styles depending on state
  const getHeaderColor = (estadoId) => {
    switch(estadoId) {
      case 'pendiente': return 'border-yellow-400 bg-yellow-50'
      case 'en_curso': return 'border-blue-400 bg-blue-50'
      case 'hecho': return 'border-brand-primary bg-brand-light'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getBadgeColor = (estadoId) => {
    switch(estadoId) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800'
      case 'en_curso': return 'bg-blue-100 text-blue-800'
      case 'hecho': return 'bg-brand-primary text-white'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex flex-col bg-gray-100/50 rounded-xl border border-gray-200 shadow-sm h-full max-h-[calc(100vh-14rem)]">
      <div className={`p-4 rounded-t-xl border-t-4 ${getHeaderColor(estado.id)} flex justify-between items-center`}>
        <h3 className="font-bold text-gray-800">{estado.title}</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getBadgeColor(estado.id)}`}>
          {tareas.length}
        </span>
      </div>
      
      <Droppable droppableId={estado.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-4 overflow-y-auto min-h-[150px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-gray-100' : ''
            }`}
          >
            {tareas.map((tarea, index) => (
              <TaskCard 
                key={tarea.id} 
                tarea={tarea} 
                index={index} 
                profiles={profiles}
                onEdit={onEdit} 
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
