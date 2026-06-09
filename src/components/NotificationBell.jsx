import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'

function getDateSlice(fechaLimite) {
  if (!fechaLimite) return null
  return fechaLimite.split('T')[0]
}

export default function NotificationBell({ allTareas, clients, secciones, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const overdue = []
  const dueToday = []
  const dueTomorrow = []

  for (const task of allTareas) {
    const status = task.status ?? (task.completed ? 'completed' : 'pending')
    if (status === 'completed' || !task.fecha_limite) continue
    const d = getDateSlice(task.fecha_limite)
    if (d < todayStr) overdue.push(task)
    else if (d === todayStr) dueToday.push(task)
    else if (d === tomorrowStr) dueTomorrow.push(task)
  }

  const total = overdue.length + dueToday.length + dueTomorrow.length

  const clientMap = Object.fromEntries((clients || []).map(c => [c.id, c]))
  const sectionMap = Object.fromEntries((secciones || []).map(s => [s.id, s]))

  const TaskRow = ({ task }) => {
    const client = clientMap[task.client_id]
    const section = sectionMap[task.seccion_id]
    return (
      <button
        onClick={() => {
          if (client) onNavigate(client, task, section)
          setIsOpen(false)
        }}
        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
      >
        <p className="text-sm font-semibold text-gray-900 truncate">{task.titulo}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {client?.name} · {task.fecha_limite?.split('T')[0]}
        </p>
      </button>
    )
  }

  const Section = ({ label, tasks, color, dot }) => {
    if (tasks.length === 0) return null
    return (
      <div>
        <div className={`px-4 py-2 flex items-center gap-2 ${color} border-b border-gray-100`}>
          <span className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`} />
          <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
          <span className="ml-auto text-xs font-bold">{tasks.length}</span>
        </div>
        {tasks.map(t => <TaskRow key={t.id} task={t} />)}
      </div>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(v => !v)}
        className="relative p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {total > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-gray-900">Task Alerts</h3>
            {total > 0 && (
              <span className="text-xs text-gray-400">{total} task{total !== 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {total === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">All clear!</p>
                <p className="text-xs text-gray-400">No tasks due soon.</p>
              </div>
            ) : (
              <>
                <Section label="Overdue" tasks={overdue} color="bg-red-50 text-red-700" dot="bg-red-500" />
                <Section label="Due Today" tasks={dueToday} color="bg-amber-50 text-amber-700" dot="bg-amber-400" />
                <Section label="Due Tomorrow" tasks={dueTomorrow} color="bg-blue-50 text-blue-700" dot="bg-blue-400" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
