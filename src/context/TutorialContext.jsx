import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import TutorialModal from '../components/shared/TutorialModal'

const TutorialContext = createContext(null)

export function TutorialProvider({ children }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    const key = `hunch-tutorial-seen-${user.id}`
    if (!localStorage.getItem(key)) {
      setOpen(true)
      localStorage.setItem(key, '1')
    }
  }, [user])

  return (
    <TutorialContext.Provider value={{ openTutorial: () => setOpen(true) }}>
      {children}
      {open && <TutorialModal onClose={() => setOpen(false)} />}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  return useContext(TutorialContext)
}
