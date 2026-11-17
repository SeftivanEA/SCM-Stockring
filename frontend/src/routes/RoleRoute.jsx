import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { menuItems } from '../utils/menu'

export default function RoleRoute() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  const item = menuItems.find((m) => pathname.startsWith(m.path))
  const allowed = !item || item.roles.includes(user.role)

  return allowed ? <Outlet /> : <Navigate to="/dashboard" replace />
}