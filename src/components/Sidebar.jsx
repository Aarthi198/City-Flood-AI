import { LayoutDashboard, Droplet, ClipboardList, Bell, LogOut, Waves } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Item({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
          isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
        }`
      }
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="hidden h-[calc(100vh-0px)] w-64 flex-col border-r border-slate-200 bg-white p-4 md:flex">
      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-500">ADMIN</div>
        <div className="truncate text-sm font-semibold text-slate-900">{user?.email}</div>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <Item to="/admin" icon={LayoutDashboard} label="Dashboard" />
        <Item to="/admin/drainage" icon={Droplet} label="Drainage" />
        <Item to="/admin/flood-data" icon={Waves} label="Flood Data" />
        <Item to="/admin/reports" icon={ClipboardList} label="Reports" />
        <Item to="/admin/alerts" icon={Bell} label="Alerts" />
      </div>

      <button
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        onClick={() => {
          logout()
          navigate('/login')
        }}
        type="button"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  )
}

