import { Outlet } from 'react-router-dom'
import { Navbar } from '../../components/Navbar'
import { Sidebar } from '../../components/Sidebar'

export default function AdminLayout() {
  return (
    <div className="min-h-full">
      <Navbar mode="admin" />
      <div className="mx-auto flex max-w-6xl">
        <Sidebar />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

