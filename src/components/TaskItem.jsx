import { memo } from 'react'
import { CheckCircle2, Circle, Clock, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { db } from '../lib/firebase'
import { doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { ROLE_BADGE_STYLES, PRIORITY_CONFIG, STATUS_CONFIG } from '../lib/constants'

function StatusIcon({ status }) {
  if (status === 'completed') return <CheckCircle2 className="w-[22px] h-[22px] fill-green-50 text-green-500" />
  if (status === 'in_progress') return <Clock className="w-[22px] h-[22px] text-amber-400" />
  return <Circle className="w-[22px] h-[22px] text-gray-300 hover:text-amber-400" />
}

function TaskItem({ task, profiles, onEdit }) {
  const profile = profiles.find(p => p.id === task.responsable_id)
  const status = task.status ?? (task.completed ? 'completed' : 'pending')
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const priorityCfg = PRIORITY_CONFIG[task.prioridad] || PRIORITY_CONFIG.medium

  const isOverdue = task.fecha_limite && status !== 'completed'
    ? new Date(task.fecha_limite) < new Date()
    : false

  const handleCycleStatus = async () => {
    const next = statusCfg.next
    try {
      await updateDoc(doc(db, 'checklist_tasks', task.id), {
        status: next,
        completed: next === 'completed',
        actualizado_en: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteDoc(doc(db, 'checklist_tasks', task.id))
      } catch (err) {
        console.error('Error deleting task:', err)
      }
    }
  }

  const badgeStyle = ROLE_BADGE_STYLES[task.responsable_rol] || 'bg-gray-50 text-gray-700 border-gray-200'

  return (
    <div className={`flex items-start justify-between p-4 bg-white hover:bg-gray-50 transition-all duration-200 group border-b border-gray-100 last:border-b-0 ${statusCfg.rowOpacity}`}>
      <div className="flex items-start flex-1 min-w-0 pr-4">

        {/* Priority dot */}
        <span
          className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 ${priorityCfg.color}`}
          title={`${priorityCfg.label} priority`}
        />

        {/* Status toggle button — cycles pending → in_progress → completed */}
        <button
          onClick={handleCycleStatus}
          className="flex-shrink-0 mt-0.5 rounded-full transition-transform hover:scale-110 active:scale-95"
          aria-label={`Status: ${statusCfg.label}. Click to set ${STATUS_CONFIG[statusCfg.next].label}`}
          title={`Click to mark as ${STATUS_CONFIG[statusCfg.next].label}`}
        >
          <StatusIcon status={status} />
        </button>

        {/* Content */}
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-medium transition-colors ${status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {task.titulo}
            </p>
            {status === 'in_progress' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wide">
                In Progress
              </span>
            )}
          </div>

          <div className="flex items-center mt-2 space-x-2 text-xs text-gray-500 flex-wrap gap-y-1.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyle}`}>
              {task.responsable_rol || 'Unassigned'}
            </span>

            {profile?.nombre_completo && (
              <span className="flex items-center bg-gray-50 rounded-full pr-2.5 border border-gray-100 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-bold mr-1.5">
                  {profile.nombre_completo.charAt(0)}
                </span>
                <span className="font-medium text-gray-600 truncate max-w-[100px]">{profile.nombre_completo}</span>
              </span>
            )}

            {task.fecha_limite && (
              <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                {isOverdue && <AlertCircle className="w-3 h-3" />}
                {task.fecha_limite.split('T')[0]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 text-gray-400 hover:text-brand-primary rounded-lg hover:bg-brand-light transition-all shadow-sm bg-white border border-transparent hover:border-brand-light"
          aria-label="Edit task"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all shadow-sm bg-white border border-transparent hover:border-red-100"
          aria-label="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default memo(TaskItem)
