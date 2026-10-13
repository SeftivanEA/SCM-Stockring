import { useState } from 'react'
import { AuthContext } from './AuthContext'

// Sementara: pengguna palsu. Nanti diganti panggilan API (Sanctum).
const dummyUsers = [
  { username: 'budi', password: 'password', nama: 'Budi', role: 'pemilik', roleLabel: 'Pemilik' },
  { username: 'rina', password: 'password', nama: 'Rina', role: 'pendataan', roleLabel: 'Staf Pendataan' },
  { username: 'dewi', password: 'password', nama: 'Dewi', role: 'penataan', roleLabel: 'Staf Penataan' },
  { username: 'andi', password: 'password', nama: 'Andi', role: 'pengiriman', roleLabel: 'Staf Pengiriman' },
  { username: 'sari', password: 'password', nama: 'Sari', role: 'audit', roleLabel: 'Staf Audit' },
]

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (username, password) => {
    const found = dummyUsers.find((u) => u.username === username && u.password === password)
    if (!found) return false
    const safe = { username: found.username, nama: found.nama, role: found.role, roleLabel: found.roleLabel }
    setUser(safe)
    localStorage.setItem('user', JSON.stringify(safe))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}