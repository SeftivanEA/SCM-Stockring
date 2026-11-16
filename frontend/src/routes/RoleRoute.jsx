import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { menuItems } from '../utils/menu'

export default function RoleRoute() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  const item = menuItems.find((m) => pathname.startsWith(m.path))
  const allowed = !item || item.roles.includes(user.role)
  if (allowed) return <Outlet />

  // Arahkan ke menu pertama yang boleh dibuka perannya.
  const fallback = menuItems.find((m) => m.roles.includes(user.role))
  if (fallback && fallback.path !== pathname) return <Navigate to={fallback.path} replace />

  return <p className="opacity-70">Akun Anda belum memiliki akses ke menu mana pun. Hubungi Pemilik.</p>
}