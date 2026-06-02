import { useState, useEffect } from 'react'
import { db, auth } from '../lib/firebase'
import { collection, query, onSnapshot, doc, getDocs, writeBatch, orderBy } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { LogOut, Plus, CheckCircle2 } from 'lucide-react'
import FilterBar from './FilterBar'
import TaskModal from './TaskModal'
import TaskItem from './TaskItem'

export default function Dashboard({ user, profile }) {
  const [secciones, setSecciones] = useState([])
  const [tareas, setTareas] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

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

      // Seed Database if empty
      if (secData.length === 0) {
        secData = await seedDatabaseIfNeeded()
      }

      setSecciones(secData)

      const profSnap = await getDocs(collection(db, 'profiles'))
      setProfiles(profSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (error) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const seedDatabaseIfNeeded = async () => {
    console.log("Seeding database...")
    const batch = writeBatch(db)

    const sections = [
      '1. ACCESS & ONBOARDING',
      '2. META BUSINESS SETUP',
      '3. PIXEL & TRACKING',
      '4. LANDING PAGE',
      '5. VIDEO AD MATERIALS (Client Must Provide)',
      '6. VIDEO AD CREATION',
      '7. IMAGE AD CREATION'
    ]

    const secRefs = sections.map(() => doc(collection(db, 'checklist_sections')))
    
    sections.forEach((name, i) => {
      batch.set(secRefs[i], { nombre: name, orden: i + 1, creado_en: new Date().toISOString() })
    })

    const seedTasks = [
      // Section 1
      { t: 'Get added to Meta Business Manager', r: 'Client', s: 0 },
      { t: 'Get access to Ad Account', r: 'Client', s: 0 },
      { t: 'Get access to Facebook Page', r: 'Client', s: 0 },
      { t: 'Get access to Instagram Account', r: 'Client', s: 0 },
      { t: 'Get access to website backend (for Pixel install)', r: 'Client', s: 0 },
      { t: 'Get access to domain (for domain verification in Meta)', r: 'Client', s: 0 },
      { t: 'Receive brand kit (logo, colors, fonts)', r: 'Client', s: 0 },
      { t: 'Receive offer details & promotion info', r: 'Client', s: 0 },
      { t: 'Receive target audience info (age, gender, location, interests)', r: 'Client', s: 0 },
      { t: 'Receive budget & campaign goals', r: 'Client', s: 0 },
      // Section 2
      { t: 'Verify domain in Meta Business Manager', r: 'Media Buyer', s: 1 },
      { t: 'Create or connect Ad Account', r: 'Media Buyer', s: 1 },
      { t: 'Connect Facebook Page to Ad Account', r: 'Media Buyer', s: 1 },
      { t: 'Connect Instagram Account to Ad Account', r: 'Media Buyer', s: 1 },
      { t: 'Set up payment method on Ad Account', r: 'Media Buyer', s: 1 },
      { t: 'Assign correct roles/permissions to team members', r: 'Media Buyer', s: 1 },
      // Section 3
      { t: 'Create Facebook Pixel', r: 'Media Buyer', s: 2 },
      { t: 'Install Pixel on website (header code or via GTM)', r: 'Funneler', s: 2 },
      { t: 'Set up standard events (PageView, Lead, Purchase, CompleteRegistration)', r: 'Funneler', s: 2 },
      { t: 'Verify Pixel is firing correctly (Meta Pixel Helper)', r: 'Funneler', s: 2 },
      { t: 'Set up Conversions API (server-side tracking)', r: 'Funneler', s: 2 },
      { t: 'Define & configure UTM parameters for all URLs', r: 'Media Buyer', s: 2 },
      { t: 'Test all events in Meta Events Manager', r: 'Media Buyer', s: 2 },
      // Section 4
      { t: 'Create landing page (new offer)', r: 'Funneler', s: 3 },
      { t: 'Write headline & subheadline', r: 'Funneler', s: 3 },
      { t: 'Write body copy / offer details', r: 'Funneler', s: 3 },
      { t: 'Add CTA button with correct URL', r: 'Funneler', s: 3 },
      { t: 'Add form (name, email, phone)', r: 'Funneler', s: 3 },
      { t: 'Add client logo & branding', r: 'Funneler', s: 3 },
      { t: 'Add before/after photos or testimonials', r: 'Funneler', s: 3 },
      { t: 'Mobile optimization check', r: 'Funneler', s: 3 },
      { t: 'Page speed check', r: 'Funneler', s: 3 },
      { t: 'Set up Thank You / Confirmation page', r: 'Funneler', s: 3 },
      { t: 'Verify Pixel fires on Thank You page', r: 'Funneler', s: 3 },
      { t: 'Test form submission end-to-end', r: 'Funneler', s: 3 },
      { t: 'Add privacy policy link (Meta requirement)', r: 'Funneler', s: 3 },
      // Section 5
      { t: 'Raw video footage', r: 'Client', s: 4 },
      { t: 'Doctor/spokesperson video — Long version', r: 'Client', s: 4 },
      { t: 'Doctor/spokesperson video — Short version', r: 'Client', s: 4 },
      { t: 'UGC (User Generated Content) videos', r: 'Client', s: 4 },
      { t: 'B-roll footage', r: 'Client', s: 4 },
      { t: 'Before & after photos/videos', r: 'Client', s: 4 },
      { t: 'Client photos (high resolution)', r: 'Client', s: 4 },
      { t: 'Product or service photos', r: 'Client', s: 4 },
      { t: 'Voice recording / approved voiceover script', r: 'Client', s: 4 },
      { t: 'Logo file (PNG with transparent background)', r: 'Client', s: 4 },
      { t: 'Brand colors (hex codes) & fonts', r: 'Client', s: 4 },
      // Section 6
      { t: 'Edit Doctor Video — Long version', r: 'Video Editor', s: 5 },
      { t: 'Edit Doctor Video — Short version', r: 'Video Editor', s: 5 },
      { t: 'Edit UGC Videos', r: 'Video Editor', s: 5 },
      { t: 'Create Short-form videos (Reels-style)', r: 'Video Editor', s: 5 },
      { t: 'Add captions/subtitles to all videos', r: 'Video Editor', s: 5 },
      { t: 'Add logo & branding overlay', r: 'Video Editor', s: 5 },
      { t: 'Add CTA text overlay', r: 'Video Editor', s: 5 },
      { t: 'Export in correct formats & sizes (Feed: 1:1 / 4:5 — Stories/Reels: 9:16)', r: 'Video Editor', s: 5 },
      { t: 'Review & quality check all videos', r: 'Video Editor', s: 5 },
      // Section 7
      { t: 'Design static image ad — Feed (1:1)', r: 'Graphic Designer', s: 6 },
      { t: 'Design static image ad — Stories (9:16)', r: 'Graphic Designer', s: 6 },
      { t: 'Design carousel cards (if applicable)', r: 'Graphic Designer', s: 6 },
      { t: 'Add headline text overlay', r: 'Graphic Designer', s: 6 },
      { t: 'Add offer/CTA text', r: 'Graphic Designer', s: 6 },
      { t: 'Add logo & branding', r: 'Graphic Designer', s: 6 },
      { t: 'Review: no more than 20% text (Meta best practice)', r: 'Graphic Designer', s: 6 },
      { t: 'Export all files in correct sizes', r: 'Graphic Designer', s: 6 }
    ]

    seedTasks.forEach(task => {
      const tRef = doc(collection(db, 'checklist_tasks'))
      batch.set(tRef, {
        titulo: task.t,
        responsable_rol: task.r,
        seccion_id: secRefs[task.s].id,
        completed: false,
        prioridad: 'media',
        responsable_id: null,
        creado_por: user.uid,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      })
    })

    await batch.commit()
    return sections.map((name, i) => ({ id: secRefs[i].id, nombre: name, orden: i + 1 }))
  }

  const handleSignOut = async () => {
    await signOut(auth)
  }

  // Filter tasks
  const filteredTareas = tareas.filter(t => {
    if (selectedSeccion !== 'all' && t.seccion_id !== selectedSeccion) return false
    if (selectedRol !== 'all' && t.responsable_rol !== selectedRol) return false
    if (selectedResponsable !== 'all' && t.responsable_id !== selectedResponsable) return false
    return true
  })

  // Sections to display
  const displaySecciones = selectedSeccion === 'all' 
    ? secciones 
    : secciones.filter(s => s.id === selectedSeccion)

  // Overall progress calculation
  const totalTasks = filteredTareas.length
  const completedTasks = filteredTareas.filter(t => t.completed).length
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold">
              LC
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Team Task Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-right hidden sm:block">
              <p className="font-medium text-gray-900">{profile.nombre_completo}</p>
              <p className="text-gray-500">{profile.rol_equipo}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-500 hover:text-red-600 transition rounded-md hover:bg-red-50"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <FilterBar 
            secciones={secciones}
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
            className="flex items-center space-x-2 bg-brand-primary text-white px-5 py-2.5 rounded-lg hover:bg-brand-dark transition shadow-sm font-medium whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>

        {/* Overall Progress */}
        <div className="mb-8 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Project Progress</h2>
              <p className="text-sm text-gray-500 mt-1">{totalTasks} total tasks • {completedTasks} completed</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-brand-primary font-bold text-2xl leading-none">{progressPercent}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="bg-brand-primary h-3 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Checklist Board */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        ) : (
          <div className="space-y-8 pb-12">
            {displaySecciones.map(seccion => {
              const secTasks = filteredTareas.filter(t => t.seccion_id === seccion.id)
              
              if (secTasks.length === 0) return null

              const secCompleted = secTasks.filter(t => t.completed).length
              const secTotal = secTasks.length
              const secProgress = Math.round((secCompleted / secTotal) * 100)

              return (
                <div key={seccion.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Section Header */}
                  <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 text-lg">{seccion.nombre}</h3>
                    <div className="flex items-center space-x-3 text-sm font-medium text-gray-500">
                      <span>{secCompleted}/{secTotal}</span>
                      {secProgress === 100 && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    </div>
                  </div>
                  
                  {/* Section Tasks */}
                  <div className="divide-y divide-gray-100">
                    {secTasks.map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        profiles={profiles} 
                        onEdit={(t) => {
                          setEditingTask(t)
                          setIsModalOpen(true)
                        }} 
                      />
                    ))}
                  </div>
                </div>
              )
            })}
            
            {filteredTareas.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                <p className="text-gray-500">No tasks found matching these filters.</p>
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
          secciones={secciones}
          profiles={profiles}
          profile={profile}
        />
      )}
    </div>
  )
}
