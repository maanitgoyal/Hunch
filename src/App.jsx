import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthSplash } from './components/auth/AuthSplash'
import LoginScreen from './components/auth/LoginScreen'
import SignupScreen from './components/auth/SignupScreen'
import HomeScreen from './components/home/HomeScreen'
import GamesScreen from './components/home/GamesScreen'
import LandingPage from './components/home/LandingPage'
import GameDetail from './components/game/GameDetail'
import Leaderboard from './components/leaderboard/Leaderboard'
import MyBets from './components/bets/MyBets'
import LobbiesPage from './components/lobbies/LobbiesPage'
import FriendsPage from './components/friends/FriendsPage'
import MinigamesPage from './components/minigames/MinigamesPage'
import AdminPanel from './components/admin/AdminPanel'
import ProfilePage from './components/profile/ProfilePage'
import TopNav from './components/shared/TopNav'
import BottomNav from './components/shared/BottomNav'
import { TutorialProvider } from './context/TutorialContext'
import { useInactivityLogout } from './hooks/useInactivityLogout'
import { useCallback } from 'react'

function AnimatedBackground() {
  return (
    <>
      <div className="gradient-mesh" />
      <div className="grain" />
      <div className="page-sweep" />
    </>
  )
}

function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading)  return <AuthSplash />
  if (!user)    return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { profile } = useAuth()
  if (!profile?.is_admin) return <Navigate to="/" replace />
  return children
}

function RootRoute() {
  const { user, profile, loading } = useAuth()
  if (loading || (user && !profile)) return <AuthSplash />
  if (user && profile) return <AppLayout><HomeScreen /></AppLayout>
  return <LandingPage />
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="pt-16 pb-24 md:pb-8 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleInactivityLogout = useCallback(() => navigate('/login'), [navigate])
  useInactivityLogout(!!user, handleInactivityLogout)

  return (
    <Routes>
      <Route path="/login"  element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />
      <Route path="/" element={<RootRoute />} />
      <Route path="/games" element={
        <ProtectedRoute><AppLayout><GamesScreen /></AppLayout></ProtectedRoute>
      } />
      <Route path="/game/:id" element={
        <ProtectedRoute><AppLayout><GameDetail /></AppLayout></ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute><AppLayout><Leaderboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/bets" element={
        <ProtectedRoute><AppLayout><MyBets /></AppLayout></ProtectedRoute>
      } />
      <Route path="/lobbies" element={
        <ProtectedRoute><AppLayout><LobbiesPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/friends" element={
        <ProtectedRoute><AppLayout><FriendsPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/minigames" element={
        <ProtectedRoute><AppLayout><MinigamesPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <AdminRoute><AppLayout><AdminPanel /></AppLayout></AdminRoute>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TutorialProvider>
          <AnimatedBackground />
          <AppRoutes />
        </TutorialProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}
