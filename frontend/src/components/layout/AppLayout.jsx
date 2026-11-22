import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAuth } from '../../context/useAuth'

export default function AppLayout() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#FFF9E8] text-ink">
      <Sidebar user={user} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="min-w-0 flex-1">
        <Topbar user={user} onMenuClick={() => setMenuOpen(true)} />
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}