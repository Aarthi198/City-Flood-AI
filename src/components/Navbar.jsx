import { Bell, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function TopNavLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive ? 'bg-white/15 text-white' : 'text-white/90 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export function Navbar({ mode = 'user' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const home = mode === 'admin' ? '/admin' : '/user'

  return (
    <div className="sticky top-0 z-30 border-b border-blue-700/30 bg-gradient-to-r from-blue-700 to-blue-600">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to={home} className="flex items-center gap-2 text-white">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">CityFlood AI</div>
            <div className="text-[11px] text-white/80">Smart flood monitoring</div>
          </div>
        </Link>

        {mode === 'user' ? (
          <div className="hidden items-center gap-1 md:flex">
            <TopNavLink to="/user">Dashboard</TopNavLink>
            <TopNavLink to="/user/map">Flood Map</TopNavLink>
            <TopNavLink to="/user/alerts">Alerts</TopNavLink>
            <TopNavLink to="/user/report">Report</TopNavLink>
            <TopNavLink to="/user/safety">Safety</TopNavLink>
            <TopNavLink to="/user/profile">Profile</TopNavLink>
          </div>
        ) : (
          <div className="hidden items-center gap-1 md:flex">
            <TopNavLink to="/admin">Dashboard</TopNavLink>
            <TopNavLink to="/admin/drainage">Drainage</TopNavLink>
            <TopNavLink to="/admin/flood-data">Flood Data</TopNavLink>
            <TopNavLink to="/admin/reports">Reports</TopNavLink>
            <TopNavLink to="/admin/alerts">Alerts</TopNavLink>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Link
            to={mode === 'admin' ? '/admin/alerts' : '/user/alerts'}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/15"
            aria-label="Alerts"
          >
            <Bell className="h-5 w-5" />
          </Link>
          <div className="hidden items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-white md:flex">
            <UserCircle2 className="h-5 w-5" />
            <div className="max-w-[200px] truncate text-sm font-medium">
              {user?.name || user?.email || 'Account'}
            </div>
          </div>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/15"
            aria-label="Logout"
            type="button"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

