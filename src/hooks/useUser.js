import { useAuth } from '../context/AuthContext'

export function useUser() {
  const { user, profile, loading, refreshProfile } = useAuth()
  return { user, profile, loading, refreshProfile }
}
