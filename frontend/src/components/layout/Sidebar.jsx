import { NavLink } from 'react-router-dom'
import { menuItems } from '../../utils/menu'

function NavContent({ user, onNavigate }) {
  const items = menuItems.filter((m) => m.roles.includes(user.role))

  return (
    <>
      <div className="px-3 py-4 text-xl font-bold text-primary">Stockring</div>
      {items.map((m) => (
        <NavLink
          key={m.path}
          to={m.path}
          onClick={onNavigate}
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 ${isActive ? 'bg-primary font-semibold text-ink' : 'hover:bg-white/10'}`
          }
        >
          {m.label}
        </NavLink>
      ))}
      <div className="mt-auto px-3 text-xs opacity-70">Peran: {user.roleLabel}</div>
    </>
  )
}

export default function Sidebar({ user, open, onClose }) {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 bg-ink p-4 text-cream md:flex">
        <NavContent user={user} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={onClose}>
          <div className="absolute inset-0 bg-ink/50" />
          <aside
            className="relative flex h-full w-64 flex-col gap-1 bg-ink p-4 text-cream"
            onClick={(e) => e.stopPropagation()}
          >
            <NavContent user={user} onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  )
}