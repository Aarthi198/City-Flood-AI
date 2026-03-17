import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProfileGate({ children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return null
  if (user?.role === 'USER' && user?.profile_completed === false && !loc.pathname.startsWith('/user/profile-setup')) {
    return <Navigate to="/user/profile-setup" replace />
  }
  return children
}

