import { Outlet } from 'react-router-dom'
import { Navbar } from '../../components/Navbar'

export default function UserLayout() {
  return (
    <div className="min-h-full">
      <Navbar mode="user" />
      <main className="min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>
    </div>
  )
}

