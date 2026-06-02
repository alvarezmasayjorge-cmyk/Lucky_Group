import { CheckCircle2, Circle, Edit2, Trash2 } from 'lucide-react'
import { db } from '../lib/firebase'
import { doc, deleteDoc, updateDoc } from 'firebase/firestore'

export default function TaskItem({ task, profiles, onEdit }) {
  const profile = profiles.find(p => p.id === task.responsable_id)

  const handleToggle = async () => {
    try {
      const taskRef = doc(db, 'checklist_tasks', task.id)
      await updateDoc(taskRef, { 
        completed: !task.completed, 
        actualizado_en: new Date().toISOString() 
      })
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteDoc(doc(db, 'checklist_tasks', task.id))
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }
  }

  return (
    <div className={`flex items-start justify-between p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors group ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start flex-1 min-w-0 pr-4">
        <button 
          onClick={handleToggle}
          className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-brand-primary transition-colors"
        >
          {task.completed ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>
        <div className="ml-4 flex-1 min-w-0">
          <p className={`text-sm font-medium text-gray-900 ${task.completed ? 'line-through text-gray-500' : ''}`}>
            {task.titulo}
          </p>
          <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {task.responsable_rol}
            </span>
            {profile && (
              <span className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-brand-light text-brand-primary flex items-center justify-center text-[10px] font-bold mr-1">
                  {profile.nombre_completo.charAt(0)}
                </span>
                {profile.nombre_completo}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 text-gray-400 hover:text-brand-primary rounded hover:bg-brand-light transition"
          title="Edit Task"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition"
          title="Delete Task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
