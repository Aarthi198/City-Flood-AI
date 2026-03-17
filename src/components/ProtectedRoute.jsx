import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ allow, children }) {
  const { isAuthed, user, loading } = useAuth()
  if (loading) return null
  if (!isAuthed) return <Navigate to="/login" replace />
  if (allow && !allow.includes(user?.role)) return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/user'} replace />
  return children
}

