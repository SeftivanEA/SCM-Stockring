import { NavLink } from 'react-router-dom'
import { menuItems } from '../../utils/menu'

export default function Sidebar({ user }) {
  const items = menuItems.filter((m) => m.roles.includes(user.role))

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 bg-ink p-4 text-cream md:flex">
      <div className="px-3 py-4 text-xl font-bold text-primary">Stockring</div>
      {items.map((m) => (
        <NavLink
          key={m.path}
          to={m.path}
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 ${isActive ? 'bg-primary font-semibold text-ink' : 'hover:bg-white/10'}`
          }
        >
          {m.label}
        </NavLink>
      ))}
      <div className="mt-auto px-3 text-xs opacity-70">Peran: {user.roleLabel}</div>
    </aside>
  )
}