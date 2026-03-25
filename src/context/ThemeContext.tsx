import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ThemeContextType {
  theme: string
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('hunch-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('hunch-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
