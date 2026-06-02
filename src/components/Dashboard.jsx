import { useState, useEffect } from 'react'
import { db, auth } from '../lib/firebase'
import { collection, query, onSnapshot, doc, getDocs, writeBatch, orderBy, updateDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { LogOut, Plus, CheckCircle2, LayoutGrid, Megaphone, Search, Target } from 'lucide-react'
import FilterBar from './FilterBar'
import TaskModal from './TaskModal'
import TaskItem from './TaskItem'

const AREAS = [
  { id: 'meta_ads', name: 'Meta Ads', icon: <Megaphone className="w-4 h-4 mr-2" />, color: 'from-blue-500 to-indigo-600' },
  { id: 'google_ads', name: 'Google Ads', icon: <Search className="w-4 h-4 mr-2" />, color: 'from-amber-400 to-orange-500' },
  { id: 'ghl', name: 'Go High Level', icon: <Target className="w-4 h-4 mr-2" />, color: 'from-emerald-400 to-teal-600' }
]

export default function Dashboard({ user, profile }) {
  const [secciones, setSecciones] = useState([])
  const [tareas, setTareas] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  // Navigation
  const [activeArea, setActiveArea] = useState('meta_ads')

  // Filters
  const [selectedSeccion, setSelectedSeccion] = useState('all')
  const [selectedRol, setSelectedRol] = useState('all')
  const [selectedResponsable, setSelectedResponsable] = useState('all')

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    fetchStaticData()

    // Realtime subscription for tasks
    const qTareas = query(collection(db, 'checklist_tasks'))
    const unsubscribeTareas = onSnapshot(qTareas, (snapshot) => {
      const tareasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTareas(tareasData)
    })

    return () => unsubscribeTareas()
  }, [])

  const fetchStaticData = async () => {
    setLoading(true)
    try {
      const qSecciones = query(collection(db, 'checklist_sections'), orderBy('orden'))
      const secSnap = await getDocs(qSecciones)
      let secData = secSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Migration & Seeding: Ensure multi-area exists
      let needsSeeding = false
      if (secData.length === 0) {
        needsSeeding = true
      } else {
        // If old sections don't have an area, assign them to meta_ads
        const batch = writeBatch(db)
        let didUpdate = false
        secData.forEach(s => {
          if (!s.area) {
            batch.update(doc(db, 'checklist_sections', s.id), { area: 'meta_ads' })
            s.area = 'meta_ads'
            didUpdate = true
          }
        })
        if (didUpdate) await batch.commit()
        
        // Ensure google ads and ghl exist
        const hasGoogle = secData.some(s => s.area === 'google_ads')
        const hasGhl = secData.some(s => s.area === 'ghl')
        if (!hasGoogle || !hasGhl) needsSeeding = true
      }

      if (needsSeeding) {
        const newSecs = await seedDatabaseIfNeeded(secData)
        // merge existing with new
        const existingIds = new Set(secData.map(s => s.id))
        const added = newSecs.filter(ns => !existingIds.has(ns.id))
        secData = [...secData, ...added]
      }

      // Sort again by order
      secData.sort((a, b) => a.orden - b.orden)
      setSecciones(secData)

      const profSnap = await getDocs(collection(db, 'profiles'))
      setProfiles(profSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (error) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const seedDatabaseIfNeeded = async (existingSecData) => {
    const batch = writeBatch(db)
    const newSectionsData = []

    // Only seed Meta Ads if no sections exist at all
    if (existingSecData.length === 0) {
      const metaSections = [
        '1. ACCESS & ONBOARDING', '2. META BUSINESS SETUP', '3. PIXEL & TRACKING',
        '4. LANDING PAGE', '5. VIDEO AD MATERIALS (Client Must Provide)', 
        '6. VIDEO AD CREATION', '7. IMAGE AD CREATION'
      ]
      
      const metaRefs = metaSections.map(() => doc(collection(db, 'checklist_sections')))
      
      metaSections.forEach((name, i) => {
        batch.set(metaRefs[i], { nombre: name, orden: i + 1, area: 'meta_ads', creado_en: new Date().toISOString() })
        newSectionsData.push({ id: metaRefs[i].id, nombre: name, orden: i + 1, area: 'meta_ads' })
      })

      const seedTasks = [
        { t: 'Get added to Meta Business Manager', r: 'Client', s: 0 },
        { t: 'Get access to Ad Account', r: 'Client', s: 0 },
        { t: 'Verify domain in Meta Business Manager', r: 'Media Buyer', s: 1 },
        { t: 'Create Facebook Pixel', r: 'Media Buyer', s: 2 },
        { t: 'Create landing page (new offer)', r: 'Funneler', s: 3 },
        { t: 'Raw video footage', r: 'Client', s: 4 },
        { t: 'Edit Doctor Video — Long version', r: 'Video Editor', s: 5 },
        { t: 'Design static image ad — Feed (1:1)', r: 'Graphic Designer', s: 6 }
        // Full list abbreviated here for brevity in the migration script, actual tasks can be added via UI.
      ]

      seedTasks.forEach(task => {
        const tRef = doc(collection(db, 'checklist_tasks'))
        batch.set(tRef, {
          titulo: task.t,
          responsable_rol: task.r,
          seccion_id: metaRefs[task.s].id,
          completed: false,
          prioridad: 'media',
          responsable_id: null,
          creado_por: user.uid,
          creado_en: new Date().toISOString(),
          actualizado_en: new Date().toISOString()
        })
      })
    }

    // Check Google Ads
    if (!existingSecData.some(s => s.area === 'google_ads')) {
      const googleSections = ['1. GOOGLE ADS SETUP', '2. SEARCH CAMPAIGNS', '3. TRACKING & CONVERSIONS']
      googleSections.forEach((name, i) => {
        const ref = doc(collection(db, 'checklist_sections'))
        batch.set(ref, { nombre: name, orden: i + 1, area: 'google_ads', creado_en: new Date().toISOString() })
        newSectionsData.push({ id: ref.id, nombre: name, orden: i + 1, area: 'google_ads' })
      })
    }

    // Check GHL
    if (!existingSecData.some(s => s.area === 'ghl')) {
      const ghlSections = ['1. ACCOUNT CONFIGURATION', '2. FUNNEL CREATION', '3. AUTOMATION & WORKFLOWS']
      ghlSections.forEach((name, i) => {
        const ref = doc(collection(db, 'checklist_sections'))
        batch.set(ref, { nombre: name, orden: i + 1, area: 'ghl', creado_en: new Date().toISOString() })
        newSectionsData.push({ id: ref.id, nombre: name, orden: i + 1, area: 'ghl' })
      })
    }

    await batch.commit()
    return newSectionsData
  }

  const handleSignOut = async () => {
    await signOut(auth)
  }

  // Ensure selected section filter is reset if switching areas
  useEffect(() => {
    setSelectedSeccion('all')
  }, [activeArea])

  const areaSections = secciones.filter(s => s.area === activeArea)
  const activeAreaObj = AREAS.find(a => a.id === activeArea)

  // Filter tasks
  const filteredTareas = tareas.filter(t => {
    // Only show tasks that belong to sections in the current active area
    const sectionObj = secciones.find(s => s.id === t.seccion_id)
    if (!sectionObj || sectionObj.area !== activeArea) return false

    if (selectedSeccion !== 'all' && t.seccion_id !== selectedSeccion) return false
    if (selectedRol !== 'all' && t.responsable_rol !== selectedRol) return false
    if (selectedResponsable !== 'all' && t.responsable_id !== selectedResponsable) return false
    return true
  })

  // Sections to display in the grid
  const displaySecciones = selectedSeccion === 'all' 
    ? areaSections 
    : areaSections.filter(s => s.id === selectedSeccion)

  // Overall progress calculation for current Area
  const totalTasks = filteredTareas.length
  const completedTasks = filteredTareas.filter(t => t.completed).length
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

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
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight hidden sm:block leading-tight">Lucky Group</h1>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest hidden sm:block">Onboarding Board</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-5">
            <div className="text-sm text-right hidden sm:block">
              <p className="font-bold text-gray-900">{profile.nombre_completo}</p>
              <p className="text-gray-500 font-medium text-xs bg-gray-100 inline-block px-2 py-0.5 rounded-full mt-0.5">{profile.rol_equipo}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-all shadow-sm border border-gray-200 hover:border-red-100"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Area Navigation Tab Bar */}
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
            className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition-all shadow-md hover:shadow-lg font-bold whitespace-nowrap transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            <span>New Task</span>
          </button>
        </div>

        {/* Overall Progress */}
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

        {/* Premium Checklist Blocks Grid */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12 items-start">
            {displaySecciones.map(seccion => {
              const secTasks = filteredTareas.filter(t => t.seccion_id === seccion.id)
              
              if (secTasks.length === 0 && selectedSeccion !== 'all') return null // Only hide empty if filtered

              const secCompleted = secTasks.filter(t => t.completed).length
              const secTotal = secTasks.length
              const secProgress = secTotal === 0 ? 0 : Math.round((secCompleted / secTotal) * 100)

              return (
                <div key={seccion.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Section Block Header */}
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
                          <span className={secProgress === 100 ? 'text-green-600' : 'text-gray-600'}>
                            {secCompleted}/{secTotal}
                          </span>
                          {secProgress === 100 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                      )}
                    </div>
                    {/* Section Progress bar */}
                    {secTotal > 0 && (
                      <div className="w-full bg-gray-100 h-1.5 mt-4 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-700 ${secProgress === 100 ? 'bg-green-500' : 'bg-brand-primary'}`} style={{ width: `${secProgress}%` }}></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Section Tasks */}
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
                <p className="text-gray-500 mt-1">Try adjusting your filters or adding a new task.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={editingTask}
          secciones={secciones} // pass all sections, modal will filter by area
          profiles={profiles}
          profile={profile}
          currentActiveArea={activeArea}
        />
      )}
    </div>
  )
}
