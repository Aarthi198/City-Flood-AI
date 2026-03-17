import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

import UserLayout from './pages/user/UserLayout'
import UserDashboard from './pages/user/Dashboard'
import FloodMap from './pages/user/FloodMap'
import UserAlerts from './pages/user/Alerts'
import Report from './pages/user/Report'
import Safety from './pages/user/Safety'
import ProfileSetup from './pages/user/ProfileSetup'
import Profile from './pages/user/Profile'

import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import Drainage from './pages/admin/Drainage'
import AdminReports from './pages/admin/Reports'
import AdminAlerts from './pages/admin/Alerts'
import { ProfileGate } from './components/ProfileGate'
import FloodData from './pages/admin/FloodData'

function RootRedirect() {
  const { user, isAuthed, loading } = useAuth()
  if (loading) return null
  if (!isAuthed) return <Navigate to="/login" replace />
  if (user?.role === 'USER' && user?.profile_completed === false) return <Navigate to="/user/profile-setup" replace />
  return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/user'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/user"
        element={
          <ProtectedRoute allow={['USER', 'ADMIN']}>
            <ProfileGate>
              <UserLayout />
            </ProfileGate>
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="map" element={<FloodMap />} />
        <Route path="alerts" element={<UserAlerts />} />
        <Route path="report" element={<Report />} />
        <Route path="safety" element={<Safety />} />
        <Route path="profile-setup" element={<ProfileSetup />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allow={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="drainage" element={<Drainage />} />
        <Route path="flood-data" element={<FloodData />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="alerts" element={<AdminAlerts />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
