import { useState, useEffect, useCallback, useMemo } from 'react'
import { db, auth } from '../lib/firebase'
import { collection, query, onSnapshot, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { LogOut, Plus, CheckCircle2, LayoutGrid, Megaphone, Search, Target, Globe, Users, ArrowLeft, BarChart3, ChevronDown, Clock, Wallet, Grid3x3, Settings } from 'lucide-react'
import FilterBar from './FilterBar'
import TaskModal from './TaskModal'
import TaskItem from './TaskItem'
import NewClientModal from './NewClientModal'
import MatrixView from './MatrixView'
import BudgetsView from './BudgetsView'
import ServicesView from './ServicesView'
import NotificationBell from './NotificationBell'
import ProfileModal from './ProfileModal'
import { runInitialMigrationAndSeed, createNewClientWithTemplate, runPatchV1, runResetToUserTasks, runPatchV4, runPatchV5, runPatchV6, runPatchV7, runPatchV8, runPatchV9, runPatchV10, runPatchV11, runPatchV12 } from '../lib/migration'
import { AREAS } from '../lib/constants'

const AREAS_WITH_ICONS = [
  { ...AREAS[0], icon: <Megaphone className="w-4 h-4 mr-2" /> },
  { ...AREAS[1], icon: <Search className="w-4 h-4 mr-2" /> },
  { ...AREAS[2], icon: <Globe className="w-4 h-4 mr-2" /> },
  { ...AREAS[3], icon: <Target className="w-4 h-4 mr-2" /> },
]

export default function Dashboard({ user, profile }) {
  const [clients, setClients] = useState([])
  const [secciones, setSecciones] = useState([])
  const [allTareas, setAllTareas] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCreatingClient, setIsCreatingClient] = useState(false)
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [clientError, setClientError] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Navigation
  const [activeClient, setActiveClient] = useState(null)
  const [activeArea, setActiveArea] = useState('meta_ads')
  const [activeView, setActiveView] = useState('board') // 'board' | 'team'
  const [masterView, setMasterView] = useState('table') // 'table' | 'matrix'

  // Filters
  const [selectedSeccion, setSelectedSeccion] = useState('all')
  const [selectedRol, setSelectedRol] = useState('all')
  const [selectedResponsable, setSelectedResponsable] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [hideCompleted, setHideCompleted] = useState(false)

  // Collapsed sections (board view) — true = expanded, undefined/false = collapsed
  const [collapsedSections, setCollapsedSections] = useState({})
  const toggleSection = useCallback((sectionId) => {
    setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }, [])

  // Collapsed role cards (team view) — same convention
  const [collapsedRoles, setCollapsedRoles] = useState({})
  const toggleRole = useCallback((role) => {
    setCollapsedRoles(prev => ({ ...prev, [role]: !prev[role] }))
  }, [])

  const expandAll = useCallback(() => {
    setCollapsedSections(prev => {
      const next = {}
      Object.keys(prev).forEach(k => { next[k] = true })
      return next
    })
  }, [])

  // Highlight task (from matrix → board navigation or URL deep link)
  const [highlightTaskId, setHighlightTaskId] = useState(null)
  const [pendingDeepLink, setPendingDeepLink] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('task')
  })

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // Reset all filters when switching areas or clients
  useEffect(() => {
    setSelectedSeccion('all')
    setSelectedRol('all')
    setSelectedResponsable('all')
    setSearchQuery('')
    setCollapsedSections({})
    if (!activeClient) setActiveView('board')
  }, [activeArea, activeClient])

  // Deep link: navigate to task from URL ?task=ID
  useEffect(() => {
    if (!pendingDeepLink || loading || clients.length === 0 || allTareas.length === 0 || secciones.length === 0) return
    const task = allTareas.find(t => t.id === pendingDeepLink)
    if (!task) { setPendingDeepLink(null); return }
    const client = clients.find(c => c.id === task.client_id)
    const section = secciones.find(s => s.id === task.seccion_id)
    if (client) setActiveClient(client)
    if (section) setActiveArea(section.area)
    setHighlightTaskId(task.id)
    setPendingDeepLink(null)
    window.history.replaceState({}, '', window.location.pathname)
  }, [pendingDeepLink, loading, clients, allTareas, secciones])

  // Scroll to and highlight task
  useEffect(() => {
    if (!highlightTaskId) return
    const task = allTareas.find(t => t.id === highlightTaskId)
    if (task) {
      setCollapsedSections(prev => ({ ...prev, [task.seccion_id]: true }))
    }
    const timer = setTimeout(() => {
      const el = document.getElementById(`task-${highlightTaskId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 400)
    const clear = setTimeout(() => setHighlightTaskId(null), 2500)
    return () => { clearTimeout(timer); clearTimeout(clear) }
  }, [highlightTaskId, allTareas])

  useEffect(() => {
    const fetchStaticData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Patches must run sequentially — concurrent execution caused v3 to delete
        // tasks that v4 was simultaneously creating, leaving new clients with no tasks.
        await runInitialMigrationAndSeed(user.uid)
        await runPatchV1(user.uid)
        await runResetToUserTasks(user.uid)
        await runPatchV4(user.uid)
        await runPatchV5(user.uid)
        await runPatchV6(user.uid)
        await runPatchV7(user.uid)
        await runPatchV8(user.uid)
        await runPatchV9(user.uid)
        await runPatchV10(user.uid)
        await runPatchV11(user.uid)
        await runPatchV12(user.uid)

        const profSnap = await getDocs(collection(db, 'profiles'))
        setProfiles(profSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }

    fetchStaticData()

    const qClients = query(collection(db, 'clients'), orderBy('creado_en', 'desc'))
    const unsubClients = onSnapshot(qClients, (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (err) => console.error('Clients listener error:', err))

    const qTareas = query(collection(db, 'checklist_tasks'))
    const unsubTareas = onSnapshot(qTareas, (snap) => {
      setAllTareas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (err) => console.error('Tasks listener error:', err))

    const qSecciones = query(collection(db, 'checklist_sections'), orderBy('orden'))
    const unsubSecciones = onSnapshot(qSecciones, (snap) => {
      setSecciones(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (err) => console.error('Sections listener error:', err))

    return () => {
      unsubClients()
      unsubTareas()
      unsubSecciones()
    }
  }, [user.uid])

  const handleSignOut = useCallback(async () => {
    await signOut(auth)
  }, [])

  const handleCreateClient = useCallback(async (name) => {
    setIsCreatingClient(true)
    setClientError('')
    try {
      const newClient = await createNewClientWithTemplate(name, user.uid, secciones)
      setShowNewClientModal(false)
      setActiveClient(newClient)
    } catch (e) {
      console.error(e)
      setClientError('Error creating client. Please try again.')
    } finally {
      setIsCreatingClient(false)
    }
  }, [user.uid, secciones])

  const handleSaveBudget = useCallback(async (clientId, fields) => {
    try {
      await updateDoc(doc(db, 'clients', clientId), {
        ...fields,
        actualizado_en: new Date().toISOString(),
      })
    } catch (e) {
      console.error('Error saving budget:', e)
    }
  }, [])

  const handleToggleService = useCallback(async (clientId, platformId, currentValue) => {
    try {
      await updateDoc(doc(db, 'clients', clientId), {
        [`services.${platformId}`]: !currentValue,
        actualizado_en: new Date().toISOString(),
      })
    } catch (e) {
      console.error('Error toggling service:', e)
    }
  }, [])

  const handleNavigateToTask = useCallback((client, task, section) => {
    setActiveClient(client)
    setActiveArea(section?.area || 'meta_ads')
    setHighlightTaskId(task.id)
    setActiveView('board')
  }, [])

  const handleProfileUpdated = useCallback(async () => {
    setShowProfileModal(false)
    // Reload profile data
    const profSnap = await getDocs(collection(db, 'profiles'))
    setProfiles(profSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  }, [])

  const handleOpenEdit = useCallback((task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }, [])

  const handleOpenNew = useCallback(() => {
    setEditingTask(null)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingTask(null)
  }, [])

  // --- DERIVED DATA ---

  // Per-client task stats for master view (memoized)
  const getTaskStatus = (t) => t.status ?? (t.completed ? 'completed' : 'pending')

  const sectionIdSet = useMemo(() => new Set(secciones.map(s => s.id)), [secciones])

  const clientStats = useMemo(() => {
    const map = {}
    for (const t of allTareas) {
      // Only count tasks that belong to an existing section (orphaned tasks are invisible in boards)
      if (!sectionIdSet.has(t.seccion_id)) continue
      if (!map[t.client_id]) map[t.client_id] = { total: 0, completed: 0 }
      map[t.client_id].total++
      if (getTaskStatus(t) === 'completed') map[t.client_id].completed++
    }
    return map
  }, [allTareas, sectionIdSet])

  // Client view data (memoized)
  const areaSections = useMemo(
    () => secciones.filter(s => s.area === activeArea),
    [secciones, activeArea]
  )

  const clientTareas = useMemo(
    () => allTareas.filter(t => t.client_id === activeClient?.id),
    [allTareas, activeClient]
  )

  const filteredTareas = useMemo(() => {
    const lowerSearch = searchQuery.toLowerCase().trim()
    return clientTareas.filter(t => {
      const sectionObj = secciones.find(s => s.id === t.seccion_id)
      if (!sectionObj || sectionObj.area !== activeArea) return false
      if (selectedSeccion !== 'all' && t.seccion_id !== selectedSeccion) return false
      if (selectedRol !== 'all' && t.responsable_rol !== selectedRol) return false
      if (selectedResponsable !== 'all' && t.responsable_id !== selectedResponsable) return false
      if (hideCompleted && getTaskStatus(t) === 'completed') return false
      if (lowerSearch && !t.titulo.toLowerCase().includes(lowerSearch)) return false
      return true
    })
  }, [clientTareas, secciones, activeArea, selectedSeccion, selectedRol, selectedResponsable, hideCompleted, searchQuery])

  const displaySecciones = useMemo(
    () => selectedSeccion === 'all' ? areaSections : areaSections.filter(s => s.id === selectedSeccion),
    [areaSections, selectedSeccion]
  )

  const totalTasks = filteredTareas.length
  const completedTasks = filteredTareas.filter(t => getTaskStatus(t) === 'completed').length
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
  const activeAreaObj = AREAS_WITH_ICONS.find(a => a.id === activeArea) || AREAS_WITH_ICONS[0]

  // --- RENDER ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-dark transition"
        >
          Reload
        </button>
      </div>
    )
  }

  // MASTER VIEW
  if (!activeClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-brand-light selection:text-brand-primary">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-dark rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg">
                LC
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-tight">Master Dashboard</h1>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Agency Overview</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowProfileModal(true)}
                className="hidden sm:flex flex-col items-end text-right px-3 py-1 rounded-lg hover:bg-gray-100 transition"
              >
                <p className="text-sm font-semibold text-gray-900">{profile.nombre_completo}</p>
                <p className="text-xs text-gray-500">{profile.rol_equipo}</p>
              </button>
              <NotificationBell
                allTareas={allTareas}
                clients={clients}
                secciones={secciones}
                onNavigate={handleNavigateToTask}
              />
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-all shadow-sm border border-gray-200"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center">
                <Users className="w-6 h-6 mr-2 text-brand-primary" />
                Active Clients
              </h2>
              <p className="text-gray-500 mt-1">Manage all client workspaces from this master sheet.</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setMasterView('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${masterView === 'table' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Table
                </button>
                <button
                  onClick={() => setMasterView('matrix')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${masterView === 'matrix' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Matrix
                </button>
                <button
                  onClick={() => setMasterView('budgets')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${masterView === 'budgets' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Budgets
                </button>
                <button
                  onClick={() => setMasterView('services')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${masterView === 'services' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid3x3 className="w-3.5 h-3.5" />
                  Services
                </button>
              </div>
              <button
                onClick={() => setShowNewClientModal(true)}
                disabled={isCreatingClient}
                className="flex items-center bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-black transition-all shadow-md hover:shadow-lg font-bold disabled:opacity-50"
              >
                <Plus className="w-5 h-5 mr-1" />
                New Client
              </button>
            </div>
          </div>

          {masterView === 'matrix' ? (
            <MatrixView
              clients={clients}
              allTareas={allTareas}
              secciones={secciones}
              profile={profile}
              onOpenClient={(client, taskId, area) => {
                setActiveClient(client)
                setMasterView('table')
                if (area) setActiveArea(area)
                if (taskId) setHighlightTaskId(taskId)
              }}
            />
          ) : masterView === 'budgets' ? (
            <BudgetsView clients={clients} onSaveBudget={handleSaveBudget} />
          ) : masterView === 'services' ? (
            <ServicesView clients={clients} onToggleService={handleToggleService} />
          ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-bold">Client Name</th>
                  <th className="px-6 py-4 font-bold text-center">Progress</th>
                  <th className="px-6 py-4 font-bold text-center">Tasks</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-10 h-10 text-gray-200" />
                        <p className="text-gray-500 font-medium">No clients yet.</p>
                        <p className="text-gray-400 text-sm">Click "New Client" to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clients.map(client => {
                    const stats = clientStats[client.id] || { total: 0, completed: 0 }
                    const pct = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100)

                    return (
                      <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-gray-900">{client.name}</td>
                        <td className="px-6 py-4 w-1/3">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-brand-primary h-2 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-700 min-w-[3rem] text-right">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                            {stats.completed} / {stats.total}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setActiveClient(client)}
                            className="text-sm font-bold text-brand-primary hover:text-brand-dark hover:underline flex items-center justify-end w-full"
                          >
                            View Board
                            <BarChart3 className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
            </div>
          </div>
          )}
        </main>

        <NewClientModal
          isOpen={showNewClientModal}
          onClose={() => { setShowNewClientModal(false); setClientError('') }}
          onConfirm={handleCreateClient}
          isLoading={isCreatingClient}
          errorMessage={clientError}
        />
        <ProfileModal
          profile={profile}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      </div>
    )
  }

  // CLIENT BOARD VIEW
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-brand-light selection:text-brand-primary">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveClient(null)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-600 hover:text-brand-primary rounded-lg border border-gray-200 shadow-sm transition-colors hover:border-brand-light text-sm font-medium"
              title="Back to Master Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">All Clients</span>
            </button>
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-tight">{activeClient.name}</h1>
              <p className="text-xs font-medium text-brand-primary uppercase tracking-widest">Client Workspace</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowProfileModal(true)}
              className="hidden sm:flex flex-col items-end px-3 py-1 rounded-lg hover:bg-gray-100 transition"
            >
              <p className="text-sm font-bold text-gray-900">{profile.nombre_completo}</p>
              <p className="text-gray-500 font-medium text-xs">{profile.rol_equipo}</p>
            </button>
            <NotificationBell
              allTareas={allTareas}
              clients={clients}
              secciones={secciones}
              onNavigate={handleNavigateToTask}
            />
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-all shadow-sm border border-gray-200"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Navigation tabs */}
        <div className="mb-8 flex flex-col sm:flex-row justify-center items-center gap-3">
          {/* Area tabs */}
          <div className={`bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 inline-flex space-x-1 ${activeView === 'team' ? 'opacity-40 pointer-events-none' : ''}`}>
            {AREAS_WITH_ICONS.map(area => (
              <button
                key={area.id}
                onClick={() => { setActiveArea(area.id); setActiveView('board') }}
                className={`flex items-center px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeView === 'board' && activeArea === area.id
                    ? `bg-gradient-to-r ${area.color} text-white shadow-md scale-[1.02]`
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                {area.icon}
                {area.name}
              </button>
            ))}
          </div>

          {/* Team view toggle */}
          <button
            onClick={() => setActiveView(v => v === 'team' ? 'board' : 'team')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold border transition-all shadow-sm ${
              activeView === 'team'
                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            <Users className="w-4 h-4" />
            Team View
          </button>
        </div>

        {/* ── TEAM VIEW ── */}
        {activeView === 'team' && (() => {
          const ROLES_ORDER = ['Video Editor/Meta Specialist', 'Google Specialist', 'GoHighLevel Specialist', 'Project Manager', 'CEO']
          // Use ALL tasks across all clients
          const inProgressAll = allTareas.filter(t => getTaskStatus(t) === 'in_progress')
          const pendingAll    = allTareas.filter(t => getTaskStatus(t) === 'pending')

          const openTask = (task) => {
            const taskClient = clients.find(c => c.id === task.client_id)
            if (taskClient) {
              const sec = secciones.find(s => s.id === task.seccion_id)
              setActiveClient(taskClient)
              setActiveArea(sec?.area || 'meta_ads')
              setActiveView('board')
              setEditingTask(task)
              setIsModalOpen(true)
            }
          }

          const TaskRow = ({ task, isInProgress }) => {
            const sec    = secciones.find(s => s.id === task.seccion_id)
            const area   = AREAS.find(a => a.id === sec?.area)
            const client = clients.find(c => c.id === task.client_id)
            return (
              <button
                onClick={() => openTask(task)}
                className={`w-full text-left px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors group ${isInProgress ? 'bg-amber-50/40 hover:bg-amber-50' : ''}`}
              >
                {isInProgress
                  ? <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  : <div className="w-4 h-4 flex-shrink-0 mt-0.5 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-gray-300" /></div>
                }
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium leading-snug ${isInProgress ? 'text-gray-800' : 'text-gray-600'}`}>{task.titulo}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {client && (
                      <span className="text-[11px] font-bold text-brand-primary bg-brand-light px-1.5 py-0.5 rounded">
                        {client.name}
                      </span>
                    )}
                    {area && (
                      <span className="text-[11px] text-gray-400">{area.name} · {sec?.nombre}</span>
                    )}
                  </div>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-primary rotate-180 flex-shrink-0 mt-1 transition-colors" />
              </button>
            )
          }

          return (
            <div className="pb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {ROLES_ORDER.map(role => {
                  const inProg  = inProgressAll.filter(t => t.responsable_rol === role)
                  const pending = pendingAll.filter(t => t.responsable_rol === role)
                  if (inProg.length === 0 && pending.length === 0) return null

                  return (
                    <div key={role} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <button
                        onClick={() => toggleRole(role)}
                        className="w-full text-left px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-gray-900">{role}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {inProg.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                              {inProg.length} in progress
                            </span>
                          )}
                          {pending.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500">
                              {pending.length} pending
                            </span>
                          )}
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${collapsedRoles[role] ? '' : '-rotate-90'}`} />
                        </div>
                      </button>

                      {collapsedRoles[role] && (
                        <div className="divide-y divide-gray-100">
                          {inProg.map(t => <TaskRow key={t.id} task={t} isInProgress />)}
                          {pending.map(t => <TaskRow key={t.id} task={t} isInProgress={false} />)}
                        </div>
                      )}
                    </div>
                  )
                })}

                {inProgressAll.length === 0 && pendingAll.length === 0 && (
                  <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
                    <p className="font-bold text-gray-900">All tasks completed!</p>
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {/* ── BOARD VIEW ── */}
        {activeView === 'board' && <>

        {/* Filters + Add Task */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <FilterBar
            secciones={areaSections}
            profiles={profiles}
            selectedSeccion={selectedSeccion}
            setSelectedSeccion={setSelectedSeccion}
            selectedRol={selectedRol}
            setSelectedRol={setSelectedRol}
            selectedResponsable={selectedResponsable}
            setSelectedResponsable={setSelectedResponsable}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            hideCompleted={hideCompleted}
            setHideCompleted={setHideCompleted}
          />

          <button
            onClick={handleOpenNew}
            className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition-all shadow-md hover:shadow-lg font-bold whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>New Task</span>
          </button>
        </div>

        {/* Progress Card */}
        <div className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${activeAreaObj.color}`} />
          <div className="flex justify-between items-end mb-4 pl-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">{activeAreaObj.name} Progress</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">
                {totalTasks} task{totalTasks !== 1 ? 's' : ''} • {completedTasks} completed
                {hideCompleted && completedTasks > 0 && <span className="ml-1 text-brand-primary">({completedTasks} hidden)</span>}
              </p>
            </div>
            <span className="text-gray-900 font-black text-3xl leading-none">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 pl-4 overflow-hidden relative">
            <div
              className={`h-4 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${activeAreaObj.color} relative`}
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12 items-start">
          {displaySecciones.map(seccion => {
            const secTasks = filteredTareas.filter(t => t.seccion_id === seccion.id)
            if (secTasks.length === 0 && selectedSeccion !== 'all') return null

            // Count against unfiltered section tasks to show real progress
            const rawSecTasks = clientTareas.filter(t => {
              const s = secciones.find(sx => sx.id === t.seccion_id)
              return s?.id === seccion.id
            })
            const secCompleted = rawSecTasks.filter(t => getTaskStatus(t) === 'completed').length
            const secTotal = rawSecTasks.length
            const secProgress = secTotal === 0 ? 0 : Math.round((secCompleted / secTotal) * 100)

            return (
              <div key={seccion.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Section Header — clickeable para contraer/expandir */}
                <button
                  onClick={() => toggleSection(seccion.id)}
                  className="w-full text-left bg-gray-50/50 px-6 py-5 border-b border-gray-100 relative overflow-hidden group"
                >
                  <div className="absolute left-0 top-0 w-1 h-full bg-gray-300 group-hover:bg-brand-primary transition-colors" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                        <LayoutGrid className="w-5 h-5 text-gray-400" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{seccion.nombre}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      {secTotal > 0 && (
                        <div className="flex items-center space-x-2 text-sm font-bold bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                          <span className={secProgress === 100 ? 'text-green-600' : 'text-gray-600'}>{secCompleted}/{secTotal}</span>
                          {secProgress === 100 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                      )}
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${collapsedSections[seccion.id] ? '' : '-rotate-90'}`}
                      />
                    </div>
                  </div>
                  {secTotal > 0 && collapsedSections[seccion.id] && (
                    <div className="w-full bg-gray-100 h-1.5 mt-4 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${secProgress === 100 ? 'bg-green-500' : 'bg-brand-primary'}`}
                        style={{ width: `${secProgress}%` }}
                      />
                    </div>
                  )}
                </button>

                {collapsedSections[seccion.id] && (
                  <div className="divide-y divide-gray-100/80 bg-white">
                    {secTasks.length > 0 ? (
                      secTasks.map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          profiles={profiles}
                          onEdit={handleOpenEdit}
                          isHighlighted={task.id === highlightTaskId}
                          clientName={activeClient?.name}
                        />
                      ))
                    ) : (
                      <div className="px-6 py-8 text-center bg-gray-50/30">
                        <p className="text-sm text-gray-400 font-medium">
                          {searchQuery || hideCompleted || selectedRol !== 'all' || selectedResponsable !== 'all'
                            ? 'No tasks match the current filters.'
                            : 'No tasks added to this section yet.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {displaySecciones.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No sections found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filters.</p>
            </div>
          )}
        </div>
        </> /* end board view */}
      </main>

      {isModalOpen && activeClient && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          task={editingTask}
          secciones={secciones}
          profiles={profiles}
          profile={profile}
          currentActiveArea={activeArea}
          activeClientId={activeClient.id}
        />
      )}

      <ProfileModal
        profile={profile}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  )
}
