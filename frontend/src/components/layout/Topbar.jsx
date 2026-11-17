import { useAuth } from '../../context/useAuth'
import Button from '../ui/Button'

export default function Topbar({ user, onMenuClick }) {
  const { logout } = useAuth()

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-cream bg-white px-4 py-3 md:px-8">
      <button
        type="button"
        aria-label="Buka menu"
        className="rounded-lg px-3 py-2 text-xl hover:bg-cream md:hidden"
        onClick={onMenuClick}
      >
        ☰
      </button>

      <div className="ml-auto flex items-center gap-3">
        <button className="relative rounded-lg px-3 py-2 hover:bg-cream">
          🔔
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-secondary" />
        </button>
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary font-bold text-white">
            {user.nama[0]}
          </div>
          <div className="hidden text-sm leading-tight sm:block">
            <b>{user.nama}</b>
            <br />
            <span className="opacity-70">{user.roleLabel}</span>
          </div>
        </div>
        <Button variant="outline" onClick={logout}>Keluar</Button>
      </div>
    </header>
  )
}