import { useState, useEffect } from 'react'
import { db, auth } from '../lib/firebase'
import { collection, query, onSnapshot, getDocs, orderBy } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { LogOut, Plus, CheckCircle2, LayoutGrid, Megaphone, Search, Target, Users, ArrowLeft, BarChart3 } from 'lucide-react'
import FilterBar from './FilterBar'
import TaskModal from './TaskModal'
import TaskItem from './TaskItem'
import { runInitialMigrationAndSeed, createNewClientWithTemplate } from '../lib/migration'

const AREAS = [
  { id: 'meta_ads', name: 'Meta Ads', icon: <Megaphone className="w-4 h-4 mr-2" />, color: 'from-blue-500 to-indigo-600' },
  { id: 'google_ads', name: 'Google Ads', icon: <Search className="w-4 h-4 mr-2" />, color: 'from-amber-400 to-orange-500' },
  { id: 'ghl', name: 'Go High Level', icon: <Target className="w-4 h-4 mr-2" />, color: 'from-emerald-400 to-teal-600' }
]

export default function Dashboard({ user, profile }) {
  const [clients, setClients] = useState([])
  const [secciones, setSecciones] = useState([])
  const [allTareas, setAllTareas] = useState([]) // all tasks for all clients
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreatingClient, setIsCreatingClient] = useState(false)

  // Navigation
  const [activeClient, setActiveClient] = useState(null) // null = Master View
  const [activeArea, setActiveArea] = useState('meta_ads')

  // Filters (for Client View)
  const [selectedSeccion, setSelectedSeccion] = useState('all')
  const [selectedRol, setSelectedRol] = useState('all')
  const [selectedResponsable, setSelectedResponsable] = useState('all')

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    fetchStaticData()

    // Realtime subscriptions
    const qClients = query(collection(db, 'clients'), orderBy('creado_en', 'desc'))
    const unsubClients = onSnapshot(qClients, (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    const qTareas = query(collection(db, 'checklist_tasks'))
    const unsubTareas = onSnapshot(qTareas, (snap) => {
      setAllTareas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    return () => {
      unsubClients()
      unsubTareas()
    }
  }, [])

  const fetchStaticData = async () => {
    setLoading(true)
    try {
      // 1. Run Migration/Seeding
      await runInitialMigrationAndSeed(user.uid)

      // 2. Fetch Sections
      const qSecciones = query(collection(db, 'checklist_sections'), orderBy('orden'))
      const secSnap = await getDocs(qSecciones)
      setSecciones(secSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))

      // 3. Fetch Profiles
      const profSnap = await getDocs(collection(db, 'profiles'))
      setProfiles(profSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut(auth)
  }

  const handleAddClient = async () => {
    const name = window.prompt("Enter new client's name:")
    if (!name || name.trim() === '') return

    setIsCreatingClient(true)
    try {
      const newClient = await createNewClientWithTemplate(name.trim(), user.uid, secciones)
      setActiveClient(newClient) // auto switch to new client
    } catch (e) {
      console.error(e)
      alert("Error creating client")
    } finally {
      setIsCreatingClient(false)
    }
  }

  // --- RENDERING VIEWS ---

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

  // MASTER VIEW RENDERER
  if (!activeClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-brand-light selection:text-brand-primary">
        {/* Header */}
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
            <div className="flex items-center space-x-5">
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-all shadow-sm border border-gray-200"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center">
                <Users className="w-6 h-6 mr-2 text-brand-primary" />
                Active Clients
              </h2>
              <p className="text-gray-500 mt-1">Manage all client workspaces from this master sheet.</p>
            </div>
            <button 
              onClick={handleAddClient}
              disabled={isCreatingClient}
              className="flex items-center bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-black transition-all shadow-md hover:shadow-lg font-bold disabled:opacity-50"
            >
              <Plus className="w-5 h-5 mr-1" />
              {isCreatingClient ? 'Creating...' : 'New Client'}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-bold">Client Name</th>
                  <th className="px-6 py-4 font-bold text-center">Progress</th>
                  <th className="px-6 py-4 font-bold text-center">Tasks</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No clients found. Click "New Client" to start.</td>
                  </tr>
                )}
                {clients.map(client => {
                  const clientTasks = allTareas.filter(t => t.client_id === client.id)
                  const total = clientTasks.length
                  const completed = clientTasks.filter(t => t.completed).length
                  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)

                  return (
                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {client.name}
                      </td>
                      <td className="px-6 py-4 w-1/3">
                        <div className="flex items-center space-x-3">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-brand-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="text-sm font-bold text-gray-700 min-w-[3rem] text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          {completed} / {total}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setActiveClient(client)}
                          className="text-sm font-bold text-brand-primary hover:text-brand-dark hover:underline flex items-center justify-end w-full"
                        >
                          View Board <BarChart3 className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    )
  }

  // CLIENT VIEW RENDERER (Detailed Board)

  // Ensure selected section filter is reset if switching areas
  useEffect(() => {
    setSelectedSeccion('all')
  }, [activeArea, activeClient])

  const areaSections = secciones.filter(s => s.area === activeArea)
  const activeAreaObj = AREAS.find(a => a.id === activeArea)

  // Filter tasks specifically for this active client
  const clientTareas = allTareas.filter(t => t.client_id === activeClient.id)

  const filteredTareas = clientTareas.filter(t => {
    const sectionObj = secciones.find(s => s.id === t.seccion_id)
    if (!sectionObj || sectionObj.area !== activeArea) return false

    if (selectedSeccion !== 'all' && t.seccion_id !== selectedSeccion) return false
    if (selectedRol !== 'all' && t.responsable_rol !== selectedRol) return false
    if (selectedResponsable !== 'all' && t.responsable_id !== selectedResponsable) return false
    return true
  })

  const displaySecciones = selectedSeccion === 'all' 
    ? areaSections 
    : areaSections.filter(s => s.id === selectedSeccion)

  const totalTasks = filteredTareas.length
  const completedTasks = filteredTareas.filter(t => t.completed).length
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-brand-light selection:text-brand-primary">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveClient(null)}
              className="p-2 bg-gray-50 text-gray-500 hover:text-brand-primary rounded-lg border border-gray-200 shadow-sm transition-colors hover:border-brand-light"
              title="Back to Master Sheet"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-tight flex items-center">
                {activeClient.name}
              </h1>
              <p className="text-xs font-medium text-brand-primary uppercase tracking-widest">Client Workspace</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-5">
            <div className="text-sm text-right hidden sm:block">
              <p className="font-bold text-gray-900">{profile.nombre_completo}</p>
              <p className="text-gray-500 font-medium text-xs bg-gray-100 inline-block px-2 py-0.5 rounded-full mt-0.5">{profile.rol_equipo}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-all shadow-sm border border-gray-200"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Area Navigation */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 inline-flex space-x-1">
            {AREAS.map(area => (
              <button
                key={area.id}
                onClick={() => setActiveArea(area.id)}
                className={`flex items-center px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeArea === area.id 
                    ? `bg-gradient-to-r ${area.color} text-white shadow-md transform scale-[1.02]` 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                {area.icon}
                {area.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Actions */}
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
          />
          
          <button
            onClick={() => {
              setEditingTask(null)
              setIsModalOpen(true)
            }}
            className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition-all shadow-md hover:shadow-lg font-bold whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>New Task</span>
          </button>
        </div>

        {/* Progress Card */}
        <div className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${activeAreaObj.color}`}></div>
          <div className="flex justify-between items-end mb-4 pl-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">{activeAreaObj.name} Progress</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">{totalTasks} total tasks • {completedTasks} completed</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-gray-900 font-black text-3xl leading-none">{progressPercent}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 pl-4 overflow-hidden relative">
            <div 
              className={`h-4 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${activeAreaObj.color} relative`}
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12 items-start">
          {displaySecciones.map(seccion => {
            const secTasks = filteredTareas.filter(t => t.seccion_id === seccion.id)
            if (secTasks.length === 0 && selectedSeccion !== 'all') return null

            const secCompleted = secTasks.filter(t => t.completed).length
            const secTotal = secTasks.length
            const secProgress = secTotal === 0 ? 0 : Math.round((secCompleted / secTotal) * 100)

            return (
              <div key={seccion.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 w-1 h-full bg-gray-300 group-hover:bg-brand-primary transition-colors"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                        <LayoutGrid className="w-5 h-5 text-gray-400" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{seccion.nombre}</h3>
                    </div>
                    {secTotal > 0 && (
                      <div className="flex items-center space-x-2 text-sm font-bold bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                        <span className={secProgress === 100 ? 'text-green-600' : 'text-gray-600'}>{secCompleted}/{secTotal}</span>
                        {secProgress === 100 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      </div>
                    )}
                  </div>
                  {secTotal > 0 && (
                    <div className="w-full bg-gray-100 h-1.5 mt-4 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-700 ${secProgress === 100 ? 'bg-green-500' : 'bg-brand-primary'}`} style={{ width: `${secProgress}%` }}></div>
                    </div>
                  )}
                </div>
                
                <div className="divide-y divide-gray-100/80 bg-white">
                  {secTasks.length > 0 ? (
                    secTasks.map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        profiles={profiles} 
                        onEdit={(t) => {
                          setEditingTask(t)
                          setIsModalOpen(true)
                        }} 
                      />
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center bg-gray-50/30">
                      <p className="text-sm text-gray-400 font-medium">No tasks added to this section yet.</p>
                    </div>
                  )}
                </div>
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
      </main>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={editingTask}
          secciones={secciones}
          profiles={profiles}
          profile={profile}
          currentActiveArea={activeArea}
          activeClientId={activeClient.id}
        />
      )}
    </div>
  )
}
