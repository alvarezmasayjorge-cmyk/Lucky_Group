import { useState, useEffect } from 'react'
import { db, auth } from '../lib/firebase'
import { collection, query, onSnapshot, doc, updateDoc, getDocs, writeBatch, orderBy } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { DragDropContext } from '@hello-pangea/dnd'
import { LogOut, Plus } from 'lucide-react'
import SectionColumn from './SectionColumn'
import FilterBar from './FilterBar'
import TaskModal from './TaskModal'

const ESTADOS = [
  { id: 'pendiente', title: 'Pendiente' },
  { id: 'en_curso', title: 'En Curso' },
  { id: 'hecho', title: 'Hecho' }
]

export default function Dashboard({ user, profile }) {
  const [secciones, setSecciones] = useState([])
  const [tareas, setTareas] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [selectedSeccion, setSelectedSeccion] = useState('all')
  const [selectedRol, setSelectedRol] = useState('all')
  const [selectedResponsable, setSelectedResponsable] = useState('all')

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    fetchStaticData()

    // Realtime subscription for tasks
    const qTareas = query(collection(db, 'tareas'))
    const unsubscribeTareas = onSnapshot(qTareas, (snapshot) => {
      const tareasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTareas(tareasData)
    })

    return () => unsubscribeTareas()
  }, [])

  const fetchStaticData = async () => {
    setLoading(true)
    try {
      const qSecciones = query(collection(db, 'secciones'), orderBy('orden'))
      const secSnap = await getDocs(qSecciones)
      let secData = secSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Seed Database si está vacía
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

    const secRef1 = doc(collection(db, 'secciones'))
    const secRef2 = doc(collection(db, 'secciones'))
    const secRef3 = doc(collection(db, 'secciones'))

    batch.set(secRef1, { nombre: 'Meta Ads', orden: 1, creado_en: new Date().toISOString() })
    batch.set(secRef2, { nombre: 'Google Ads', orden: 2, creado_en: new Date().toISOString() })
    batch.set(secRef3, { nombre: 'GHL', orden: 3, creado_en: new Date().toISOString() })

    const tareasIniciales = [
      { titulo: 'Dar acceso a Meta Business Manager', descripcion: 'Acceso y Onboarding', responsable_rol: 'Cliente' },
      { titulo: 'Verificar dominio en Meta Business Manager', descripcion: 'Configuración', responsable_rol: 'Media Buyer' },
      { titulo: 'Crear Pixel de Facebook', descripcion: 'Tracking', responsable_rol: 'Media Buyer' },
      { titulo: 'Instalar Pixel en el sitio web', descripcion: 'Tracking', responsable_rol: 'Funneler' },
      { titulo: 'Crear landing page de la oferta', descripcion: 'Landing Page', responsable_rol: 'Funneler' },
      { titulo: 'Editar video del vocero', descripcion: 'Video', responsable_rol: 'Editor de Video' },
      { titulo: 'Diseñar imagen estática', descripcion: 'Imagen', responsable_rol: 'Diseñador Gráfico' },
    ]

    tareasIniciales.forEach(t => {
      const tRef = doc(collection(db, 'tareas'))
      batch.set(tRef, {
        ...t,
        seccion_id: secRef1.id,
        estado: 'pendiente',
        prioridad: 'media',
        responsable_id: null,
        creado_por: user.uid,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      })
    })

    await batch.commit()
    return [
      { id: secRef1.id, nombre: 'Meta Ads', orden: 1 },
      { id: secRef2.id, nombre: 'Google Ads', orden: 2 },
      { id: secRef3.id, nombre: 'GHL', orden: 3 }
    ]
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const newEstado = destination.droppableId

    // Optimistic update
    setTareas(current => current.map(t => 
      t.id === draggableId ? { ...t, estado: newEstado } : t
    ))

    try {
      const taskRef = doc(db, 'tareas', draggableId)
      await updateDoc(taskRef, { estado: newEstado, actualizado_en: new Date().toISOString() })
    } catch (err) {
      console.error('Error updating task status:', err.message)
      // Revert optimism
      setTareas(current => current.map(t => 
        t.id === draggableId ? { ...t, estado: source.droppableId } : t
      ))
    }
  }

  const handleSignOut = async () => {
    await signOut(auth)
  }

  // Filtrado de tareas
  const filteredTareas = tareas.filter(t => {
    if (selectedSeccion !== 'all' && t.seccion_id !== selectedSeccion) return false
    if (selectedRol !== 'all' && t.responsable_rol !== selectedRol) return false
    if (selectedResponsable !== 'all' && t.responsable_id !== selectedResponsable) return false
    return true
  })

  // Obtener la sección activa (o primera si es 'all') para el tablero
  const activeSeccionId = selectedSeccion === 'all' ? (secciones[0]?.id || null) : selectedSeccion
  const activeSeccion = secciones.find(s => s.id === activeSeccionId)

  const tareasToDisplay = filteredTareas.filter(t => t.seccion_id === activeSeccionId)

  // Progress calculation
  const totalTasks = tareasToDisplay.length
  const completedTasks = tareasToDisplay.filter(t => t.estado === 'hecho').length
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold">
              LC
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Lucky Consultation Group</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-right hidden sm:block">
              <p className="font-medium text-gray-900">{profile.nombre_completo}</p>
              <p className="text-gray-500">{profile.rol_equipo}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-500 hover:text-red-600 transition rounded-md hover:bg-red-50"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
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
            className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-dark transition shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea</span>
          </button>
        </div>

        {/* Section Context & Progress */}
        {activeSeccion && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{activeSeccion.nombre}</h2>
                <p className="text-sm text-gray-500">{totalTasks} tareas en total • {completedTasks} completadas</p>
              </div>
              <span className="text-brand-primary font-bold text-lg">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-brand-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {ESTADOS.map(estado => (
                <SectionColumn
                  key={estado.id}
                  estado={estado}
                  tareas={tareasToDisplay.filter(t => t.estado === estado.id)}
                  profiles={profiles}
                  onEdit={(task) => {
                    setEditingTask(task)
                    setIsModalOpen(true)
                  }}
                />
              ))}
            </div>
          </DragDropContext>
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
          currentSeccionId={activeSeccionId}
        />
      )}
    </div>
  )
}
