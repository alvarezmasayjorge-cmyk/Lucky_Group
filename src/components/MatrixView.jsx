import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { CheckCircle2, X, ExternalLink, ChevronDown, LayoutGrid, Link2, Share2 } from 'lucide-react'
import { AREAS } from '../lib/constants'

const COL_MIN_W = 60

const AREA_FILTERS = [
  { id: 'all', label: 'All Areas' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'meta_ads', label: 'Meta Ads' },
  { id: 'google_ads', label: 'Google Ads' },
  { id: 'ghl', label: 'Go High Level' },
]

function getStatus(task) {
  return task.status ?? (task.completed ? 'completed' : 'pending')
}

function isBlocker(task) {
  if (getStatus(task) !== 'in_progress') return false
  const updated = task.actualizado_en || task.creado_en
  if (!updated) return false
  const days = (Date.now() - new Date(updated).getTime()) / 86400000
  return days > 7
}

// ── Status Cell ────────────────────────────────────────────────────────────────

const Cell = memo(function Cell({ task, isColHL, isRowHL, onHover, onLeave, onClick }) {
  if (!task) {
    return (
      <div
        style={{ flex: '1 1 0', minWidth: COL_MIN_W, height: 40, background: '#f9fafb', borderBottom: '1px solid #f3f4f6', borderRight: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span style={{ fontSize: 11, color: '#d1d5db', fontWeight: 600 }}>—</span>
      </div>
    )
  }

  const status = getStatus(task)
  const blocker = isBlocker(task)

  const bg = {
    completed: '#dcfce7',
    in_progress: '#fef3c7',
    pending: '#f3f4f6',
  }[status] || '#f3f4f6'

  const hlBg = isColHL || isRowHL ? 'rgba(59,130,246,0.06)' : ''

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        flex: '1 1 0', minWidth: COL_MIN_W, height: 40,
        background: hlBg || bg,
        borderBottom: '1px solid #f3f4f6',
        borderRight: '1px solid #f3f4f6',
        borderLeft: blocker ? '3px solid #ef4444' : undefined,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'filter 0.1s',
        position: 'relative',
      }}
      onMouseOver={e => { e.currentTarget.style.filter = 'brightness(0.93)' }}
      onMouseOut={e => { e.currentTarget.style.filter = '' }}
    >
      {status === 'completed' && (
        <CheckCircle2 style={{ width: 14, height: 14, color: '#16a34a' }} />
      )}
      {status === 'in_progress' && (
        <div style={{
          width: 9, height: 9, borderRadius: '50%', background: '#f59e0b',
          animation: 'pulse-amber 1.5s ease-in-out infinite',
        }} />
      )}
      {status === 'pending' && (
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#d1d5db' }} />
      )}
    </div>
  )
})

// ── Task Drawer ────────────────────────────────────────────────────────────────

function TaskDrawer({ item, onClose, onOpenClient }) {
  const [saving, setSaving] = useState(false)
  const [localStatus, setLocalStatus] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (item) setLocalStatus(getStatus(item.task))
  }, [item])

  if (!item) return null

  const status = localStatus || getStatus(item.task)

  const handleStatusChange = async (newStatus) => {
    setLocalStatus(newStatus)
    setSaving(true)
    try {
      await updateDoc(doc(db, 'checklist_tasks', item.task.id), {
        status: newStatus,
        completed: newStatus === 'completed',
        actualizado_en: new Date().toISOString(),
      })
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const statusColors = {
    pending: { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' },
    in_progress: { bg: '#fef3c7', text: '#d97706', border: '#fde68a' },
    completed: { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 400, backdropFilter: 'blur(1px)' }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(320px, 92vw)',
        background: 'white', borderLeft: '1px solid #e5e7eb',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
        zIndex: 500, display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.22s ease-out',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 20px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
              {item.section.nombre}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.35 }}>
              {item.task.titulo}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ padding: 6, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
          >
            <X style={{ width: 16, height: 16, color: '#6b7280' }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* Client */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Client
            </label>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{item.client.name}</div>
          </div>

          {/* Blocker warning */}
          {isBlocker(item.task) && (
            <div style={{ marginBottom: 20, padding: '10px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#be123c' }}>Blocker — in progress for over 7 days</span>
            </div>
          )}

          {/* Status */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Status
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['pending', 'in_progress', 'completed'].map(s => {
                const labels = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' }
                const c = statusColors[s]
                const isActive = s === status
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={saving}
                    style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      border: `1.5px solid ${isActive ? c.border : '#e5e7eb'}`,
                      background: isActive ? c.bg : 'white',
                      color: isActive ? c.text : '#9ca3af',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {labels[s]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          {item.task.descripcion && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Description
              </label>
              <div style={{ fontSize: 13, color: '#374151', fontWeight: 400, lineHeight: 1.5 }}>
                {item.task.descripcion}
              </div>
            </div>
          )}

          {/* Responsible Role */}
          {item.task.responsable_rol && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Assigned Role
              </label>
              <span style={{
                display: 'inline-block', padding: '4px 10px', borderRadius: 20,
                fontSize: 12, fontWeight: 600,
                background: { 'Video Editor/Meta Specialist': '#faf5ff', 'Google Specialist': '#eff6ff', 'GoHighLevel Specialist': '#ecfdf5', 'Project Manager': '#eef2ff', 'Executive Assistant': '#fffbeb', 'CEO': '#fff1f2' }[item.task.responsable_rol] || '#f3f4f6',
                color: { 'Video Editor/Meta Specialist': '#7e22ce', 'Google Specialist': '#1d4ed8', 'GoHighLevel Specialist': '#047857', 'Project Manager': '#4338ca', 'Executive Assistant': '#b45309', 'CEO': '#be123c' }[item.task.responsable_rol] || '#374151',
                border: '1px solid',
                borderColor: { 'Video Editor/Meta Specialist': '#e9d5ff', 'Google Specialist': '#bfdbfe', 'GoHighLevel Specialist': '#a7f3d0', 'Project Manager': '#c7d2fe', 'Executive Assistant': '#fde68a', 'CEO': '#fecdd3' }[item.task.responsable_rol] || '#e5e7eb',
              }}>
                {item.task.responsable_rol}
              </span>
            </div>
          )}

          {/* Priority */}
          {item.task.prioridad && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Priority
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: { high: '#ef4444', medium: '#f59e0b', low: '#d1d5db' }[item.task.prioridad] || '#d1d5db',
                }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>
                  {item.task.prioridad}
                </span>
              </div>
            </div>
          )}

          {/* Due Date */}
          {item.task.fecha_limite && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Due Date
              </label>
              <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                {item.task.fecha_limite.split('T')[0]}
              </div>
            </div>
          )}

          {/* Area */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Area
            </label>
            <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
              {AREAS.find(a => a.id === item.section.area)?.name || item.section.area}
            </div>
          </div>

          {/* Delivery Link */}
          {item.task.delivery_link && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Delivery Link
              </label>
              <a
                href={item.task.delivery_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 600, color: '#2E7D32',
                  textDecoration: 'none', wordBreak: 'break-all',
                }}
              >
                <Link2 style={{ width: 13, height: 13, flexShrink: 0 }} />
                {item.task.delivery_link}
              </a>
            </div>
          )}

          {/* Last Updated */}
          {item.task.actualizado_en && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Last Updated
              </label>
              <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>
                {new Date(item.task.actualizado_en).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={async () => {
              const url = `${window.location.origin}${window.location.pathname}?task=${item.task.id}`
              const text = `📋 ${item.task.titulo} — ${item.client.name}`
              if (navigator.share) {
                try { await navigator.share({ title: item.task.titulo, text, url }) } catch {}
              } else {
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }
            }}
            style={{
              width: '100%', padding: '11px', borderRadius: 10,
              background: '#2563eb', color: 'white',
              fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}
          >
            <Share2 style={{ width: 14, height: 14 }} />
            {copied ? 'Copied to clipboard!' : 'Share Task'}
          </button>
          <button
            onClick={() => { onOpenClient(item.client, item.task.id, item.section.area); onClose() }}
            style={{
              width: '100%', padding: '11px', borderRadius: 10,
              background: '#2E7D32', color: 'white',
              fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}
          >
            <ExternalLink style={{ width: 14, height: 14 }} />
            Open Full Board
          </button>
        </div>
      </div>
    </>
  )
}

// ── Tooltip ────────────────────────────────────────────────────────────────────

function Tooltip({ text, x, y }) {
  if (!text) return null
  return (
    <div style={{
      position: 'fixed', left: x + 14, top: y - 8,
      background: '#1f2937', color: 'white',
      padding: '6px 10px', borderRadius: 6,
      fontSize: 11, fontWeight: 500, lineHeight: 1.6,
      zIndex: 1000, pointerEvents: 'none', maxWidth: 200,
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      whiteSpace: 'pre-line',
    }}>
      {text}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function MatrixView({ clients, allTareas, secciones, onOpenClient }) {
  const [areaFilter, setAreaFilter] = useState('all')
  const [highlightCol, setHighlightCol] = useState(null)
  const [highlightRow, setHighlightRow] = useState(null)
  const [collapsed, setCollapsed] = useState({})
  const [drawerItem, setDrawerItem] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const [progressLoaded, setProgressLoaded] = useState(false)

  const processColRef = useRef(null)
  const cellsBodyRef = useRef(null)
  const clientsHeaderRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setProgressLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  const visibleSections = useMemo(
    () => secciones.filter(s => areaFilter === 'all' || s.area === areaFilter),
    [secciones, areaFilter]
  )

  // When "all areas" is selected, interleave area-header markers between groups
  const sectionItems = useMemo(() => {
    if (areaFilter !== 'all') return visibleSections.map(s => ({ type: 'section', sec: s }))
    const items = []
    for (const area of AREAS) {
      const group = visibleSections.filter(s => s.area === area.id)
      if (group.length === 0) continue
      items.push({ type: 'area-header', area })
      group.forEach(s => items.push({ type: 'section', sec: s }))
    }
    return items
  }, [visibleSections, areaFilter])

  // taskMap[clientId][sectionId] = [tasks...]
  const taskMap = useMemo(() => {
    const map = {}
    for (const t of allTareas) {
      if (!map[t.client_id]) map[t.client_id] = {}
      if (!map[t.client_id][t.seccion_id]) map[t.client_id][t.seccion_id] = []
      map[t.client_id][t.seccion_id].push(t)
    }
    return map
  }, [allTareas])

  // For each client × section → first matching task (one task per row, per section)
  // Actually sections have multiple tasks — we show one row per task title across clients
  // Build: sectionTaskNames[sectionId] = [taskTitulo, ...]
  const sectionTasks = useMemo(() => {
    const map = {}
    for (const sec of visibleSections) {
      const titlesSet = new Set()
      const titlesArr = []
      for (const client of clients) {
        const tasks = taskMap[client.id]?.[sec.id] || []
        for (const t of tasks) {
          if (!titlesSet.has(t.titulo)) {
            titlesSet.add(t.titulo)
            titlesArr.push(t.titulo)
          }
        }
      }
      map[sec.id] = titlesArr
    }
    return map
  }, [visibleSections, clients, taskMap])

  // clientProgress[clientId] = pct
  const clientProgress = useMemo(() => {
    const map = {}
    for (const client of clients) {
      let total = 0, done = 0
      for (const t of allTareas) {
        if (t.client_id !== client.id) continue
        total++
        if (getStatus(t) === 'completed') done++
      }
      map[client.id] = total === 0 ? 0 : Math.round((done / total) * 100)
    }
    return map
  }, [clients, allTareas])

  const avgPct = clients.length === 0 ? 0 : Math.round(
    clients.reduce((a, c) => a + (clientProgress[c.id] || 0), 0) / clients.length
  )

  const blockerCount = useMemo(
    () => allTareas.filter(isBlocker).length,
    [allTareas]
  )

  // Sync scrolls
  const handleCellsScroll = useCallback((e) => {
    if (processColRef.current) processColRef.current.scrollTop = e.target.scrollTop
    if (clientsHeaderRef.current) clientsHeaderRef.current.scrollLeft = e.target.scrollLeft
  }, [])
  const handleHeaderScroll = useCallback((e) => {
    if (cellsBodyRef.current) cellsBodyRef.current.scrollLeft = e.target.scrollLeft
  }, [])
  const handleProcessScroll = useCallback((e) => {
    if (cellsBodyRef.current) cellsBodyRef.current.scrollTop = e.target.scrollTop
  }, [])

  const handleCellClick = (client, section, titulo) => {
    const task = (taskMap[client.id]?.[section.id] || []).find(t => t.titulo === titulo)
    if (!task) return
    setDrawerItem({ client, task, section })
  }

  const handleCellHover = (e, client, section, titulo) => {
    const task = (taskMap[client.id]?.[section.id] || []).find(t => t.titulo === titulo)
    if (!task) return
    const status = getStatus(task)
    const statusLabel = { completed: '✅ Completado', in_progress: '🟡 En Progreso', pending: '⬜ Pendiente' }[status] || '—'
    const blocker = isBlocker(task)
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({
      x: rect.left, y: rect.top,
      text: `${client.name}\n${titulo}\n${statusLabel}${blocker ? '\n⚠️ Blocker' : ''}`,
    })
  }

  const toggleCollapse = (secId) => {
    setCollapsed(prev => ({ ...prev, [secId]: !prev[secId] }))
  }


  const ROW_H = 40
  const SECTION_H = 36
  const AREA_HEADER_H = 30

  const AREA_COLORS = { onboarding: '#0891b2', meta_ads: '#1d4ed8', google_ads: '#d97706', ghl: '#059669' }
  const HEADER_H = window.innerWidth < 640 ? 150 : 180
  const PROCESS_COL_W = window.innerWidth < 640 ? 140 : 220

  return (
    <>
      <style>{`
        @keyframes pulse-amber {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.82); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .matrix-scroll { -webkit-overflow-scrolling: touch; touch-action: pan-x pan-y; overscroll-behavior: contain; }
        .matrix-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .matrix-scroll::-webkit-scrollbar-track { background: #f9fafb; }
        .matrix-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
      `}</style>

      {/* ── Top controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        {/* Area filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {AREA_FILTERS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setAreaFilter(opt.id)}
              style={{
                padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${areaFilter === opt.id ? '#2E7D32' : '#e5e7eb'}`,
                background: areaFilter === opt.id ? '#2E7D32' : 'white',
                color: areaFilter === opt.id ? 'white' : '#6b7280',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
          <span><span style={{ color: '#111827' }}>{clients.length}</span> clients</span>
          <span><span style={{ color: '#111827' }}>{avgPct}%</span> avg</span>
          {blockerCount > 0 && <span style={{ color: '#ef4444' }}>{blockerCount} blocker{blockerCount > 1 ? 's' : ''}</span>}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#dcfce7', border: '1px solid #bbf7d0', display: 'inline-block' }} /> Done
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#fef3c7', border: '1px solid #fde68a', display: 'inline-block' }} /> In Progress
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'inline-block' }} /> Pending
            </span>
          </div>
        </div>
      </div>

      {/* ── Matrix ── */}
      <div style={{
        background: 'white', borderRadius: 16, border: '1px solid #e5e7eb',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: `${PROCESS_COL_W}px 1fr`,
        gridTemplateRows: `${HEADER_H}px 1fr`,
        height: 'calc(100vh - 220px)',
      }}>

        {/* Corner */}
        <div style={{
          background: 'white', borderBottom: '2px solid #e5e7eb', borderRight: '2px solid #e5e7eb',
          display: 'flex', alignItems: 'flex-end', padding: '10px 14px', zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <LayoutGrid style={{ width: 14, height: 14, color: '#9ca3af' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Process / Client →
            </span>
          </div>
        </div>

        {/* Client headers */}
        <div
          ref={clientsHeaderRef}
          className="matrix-scroll"
          onScroll={handleHeaderScroll}
          style={{ overflowX: 'hidden', overflowY: 'hidden', borderBottom: '2px solid #e5e7eb' }}
        >
          <div style={{ display: 'flex', height: HEADER_H, alignItems: 'stretch', minWidth: clients.length * COL_MIN_W }}>
            {clients.map(client => {
              const pct = clientProgress[client.id] || 0
              const isHL = highlightCol === client.id
              return (
                <div
                  key={client.id}
                  onClick={() => setHighlightCol(isHL ? null : client.id)}
                  title={client.name}
                  style={{
                    flex: '1 1 0', minWidth: COL_MIN_W, height: HEADER_H,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                    paddingBottom: 8, borderRight: '1px solid #e5e7eb',
                    cursor: 'pointer', position: 'relative',
                    background: isHL ? '#dbeafe' : 'white',
                    transition: 'background 0.12s',
                  }}
                >
                  <span style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    fontSize: 11, fontWeight: 700, color: isHL ? '#1d4ed8' : '#374151',
                    whiteSpace: 'nowrap',
                    position: 'absolute', top: 8, left: '50%', transform: 'rotate(180deg) translateX(50%)',
                    maxHeight: HEADER_H - 36, overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {client.name}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', marginBottom: 4 }}>
                    {pct}%
                  </span>
                  <div style={{ width: '80%', maxWidth: 36, height: 4, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', background: '#2E7D32', borderRadius: 2,
                      width: progressLoaded ? `${pct}%` : 0,
                      transition: 'width 0.8s ease-out',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Process column (sticky left) */}
        <div
          ref={processColRef}
          className="matrix-scroll"
          onScroll={handleProcessScroll}
          style={{ overflowY: 'auto', overflowX: 'hidden', borderRight: '2px solid #e5e7eb' }}
        >
          {sectionItems.map(item => {
            if (item.type === 'area-header') {
              return (
                <div key={`area-${item.area.id}`} style={{
                  height: AREA_HEADER_H, display: 'flex', alignItems: 'center',
                  padding: '0 12px', gap: 6,
                  background: AREA_COLORS[item.area.id],
                  borderBottom: '2px solid rgba(0,0,0,0.15)',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {item.area.name}
                  </span>
                </div>
              )
            }

            const sec = item.sec
            const isOpen = collapsed[sec.id] !== true
            const tasks = sectionTasks[sec.id] || []
            return (
              <div key={sec.id}>
                {/* Section header */}
                <div
                  style={{
                    background: '#1e3a5f', color: 'white',
                    height: SECTION_H, display: 'flex', alignItems: 'center',
                    padding: '0 8px 0 12px', gap: 6,
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                    userSelect: 'none',
                  }}
                >
                  <div
                    onClick={() => toggleCollapse(sec.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, cursor: 'pointer', overflow: 'hidden' }}
                  >
                    <ChevronDown style={{
                      width: 12, height: 12, flexShrink: 0,
                      transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                    }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sec.nombre}</span>
                  </div>
                </div>

                {/* Task rows */}
                {isOpen && tasks.map((titulo, idx) => {
                  const isHL = highlightRow === `${sec.id}-${titulo}`
                  return (
                    <div
                      key={titulo}
                      onClick={() => setHighlightRow(isHL ? null : `${sec.id}-${titulo}`)}
                      style={{
                        height: ROW_H, display: 'flex', alignItems: 'center',
                        padding: '0 12px',
                        borderBottom: '1px solid #f3f4f6',
                        fontSize: 12, fontWeight: 500, color: '#374151',
                        background: isHL ? '#dbeafe' : idx % 2 === 1 ? '#fafafa' : 'white',
                        cursor: 'pointer', whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        transition: 'background 0.1s',
                        maxWidth: PROCESS_COL_W,
                      }}
                      title={titulo}
                      onMouseOver={e => { if (!isHL) e.currentTarget.style.background = '#f0fdf4' }}
                      onMouseOut={e => { if (!isHL) e.currentTarget.style.background = idx % 2 === 1 ? '#fafafa' : 'white' }}
                    >
                      {titulo}
                    </div>
                  )
                })}
              </div>
            )
          })}

        </div>

        {/* Cell grid */}
        <div
          ref={cellsBodyRef}
          className="matrix-scroll"
          onScroll={handleCellsScroll}
          onMouseLeave={() => setTooltip(null)}
          style={{ overflowX: 'auto', overflowY: 'auto', willChange: 'scroll-position' }}
        >
          <div style={{ minWidth: clients.length * COL_MIN_W }}>
            {sectionItems.map(item => {
              if (item.type === 'area-header') {
                return (
                  <div key={`area-${item.area.id}`} style={{
                    display: 'flex', height: AREA_HEADER_H,
                    background: AREA_COLORS[item.area.id],
                    minWidth: clients.length * COL_MIN_W,
                    borderBottom: '2px solid rgba(0,0,0,0.15)',
                  }}>
                    {clients.map(client => (
                      <div key={client.id} style={{ flex: '1 1 0', minWidth: COL_MIN_W, borderRight: '1px solid rgba(0,0,0,0.1)' }} />
                    ))}
                  </div>
                )
              }

              const sec = item.sec
              const isOpen = collapsed[sec.id] !== true
              const tasks = sectionTasks[sec.id] || []
              return (
                <div key={sec.id}>
                  {/* Section header placeholder row */}
                  <div style={{ display: 'flex', height: SECTION_H, background: '#1e3a5f', minWidth: clients.length * COL_MIN_W }}>
                    {clients.map(client => (
                      <div key={client.id} style={{ flex: '1 1 0', minWidth: COL_MIN_W, borderRight: '1px solid #16304f' }} />
                    ))}
                  </div>

                  {/* Task cells */}
                  {isOpen && tasks.map((titulo, idx) => {
                    const rowKey = `${sec.id}-${titulo}`
                    const isRowHL = highlightRow === rowKey
                    return (
                      <div key={titulo} style={{ display: 'flex', background: isRowHL ? '#dbeafe' : idx % 2 === 1 ? '#fafafa' : 'white' }}>
                        {clients.map(client => {
                          const task = (taskMap[client.id]?.[sec.id] || []).find(t => t.titulo === titulo)
                          return (
                            <Cell
                              key={client.id}
                              task={task || null}
                              isColHL={highlightCol === client.id}
                              isRowHL={isRowHL}
                              onHover={(e) => handleCellHover(e, client, sec, titulo)}
                              onLeave={() => setTooltip(null)}
                              onClick={() => handleCellClick(client, sec, titulo)}
                            />
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Tooltip */}
      {tooltip && <Tooltip text={tooltip.text} x={tooltip.x} y={tooltip.y} />}

      {/* Drawer */}
      {drawerItem && (
        <TaskDrawer
          item={drawerItem}
          onClose={() => setDrawerItem(null)}
          onOpenClient={onOpenClient}
        />
      )}
    </>
  )
}
