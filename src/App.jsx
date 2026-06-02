import { useState, useEffect } from 'react'
import { auth, db } from './lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import Auth from './components/Auth'
import ProfileSetup from './components/ProfileSetup'
import Dashboard from './components/Dashboard'
import { Loader2 } from 'lucide-react'

function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        await fetchProfile(currentUser.uid)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const docRef = doc(db, 'profiles', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        setProfile(docSnap.data())
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  // Si el usuario está autenticado pero no tiene perfil en Firestore
  if (user && !profile) {
    return <ProfileSetup user={user} onProfileUpdated={() => fetchProfile(user.uid)} />
  }

  return <Dashboard user={user} profile={profile} />
}

export default App
