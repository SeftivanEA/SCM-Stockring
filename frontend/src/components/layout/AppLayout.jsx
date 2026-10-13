import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

// Sementara: pengguna palsu. Nanti diganti dari AuthContext.
const dummyUser = { nama: 'Budi', role: 'pemilik', roleLabel: 'Pemilik' }

export default function AppLayout() {
  const user = dummyUser

  return (
    <div className="flex min-h-screen bg-[#FFF9E8] text-ink">
      <Sidebar user={user} />
      <div className="min-w-0 flex-1">
        <Topbar user={user} />
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}