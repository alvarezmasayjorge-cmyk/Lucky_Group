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

  // Role Badge Styling Map
  const getRoleBadgeStyle = (role) => {
    switch(role) {
      case 'Client': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Media Buyer': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'Funneler': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Video Editor': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Graphic Designer': return 'bg-rose-50 text-rose-700 border-rose-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className={`flex items-start justify-between p-4 bg-white hover:bg-gray-50 transition-all duration-200 group border-b border-gray-100 last:border-b-0 ${task.completed ? 'opacity-60 grayscale-[0.3]' : ''}`}>
      <div className="flex items-start flex-1 min-w-0 pr-4">
        
        {/* Custom Checkbox */}
        <button 
          onClick={handleToggle}
          className={`flex-shrink-0 mt-0.5 rounded-full transition-transform hover:scale-110 active:scale-95 ${task.completed ? 'text-green-500 shadow-sm' : 'text-gray-300 hover:text-brand-primary'}`}
        >
          {task.completed ? (
            <CheckCircle2 className="w-[22px] h-[22px] fill-green-50" />
          ) : (
            <Circle className="w-[22px] h-[22px]" />
          )}
        </button>
        
        {/* Content */}
        <div className="ml-4 flex-1 min-w-0">
          <p className={`text-sm font-medium transition-colors ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {task.titulo}
          </p>
          
          <div className="flex items-center mt-2 space-x-3 text-xs text-gray-500 flex-wrap gap-y-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadgeStyle(task.responsable_rol)}`}>
              {task.responsable_rol || 'Unassigned Role'}
            </span>
            
            {profile && profile.nombre_completo && (
              <span className="flex items-center bg-gray-50 rounded-full pr-2.5 border border-gray-100 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-bold mr-1.5 shadow-inner">
                  {profile.nombre_completo.charAt(0)}
                </span>
                <span className="font-medium text-gray-600 truncate max-w-[100px]">{profile.nombre_completo}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 text-gray-400 hover:text-brand-primary rounded-lg hover:bg-brand-light transition-all shadow-sm bg-white border border-transparent hover:border-brand-light"
          title="Edit Task"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all shadow-sm bg-white border border-transparent hover:border-red-100"
          title="Delete Task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
