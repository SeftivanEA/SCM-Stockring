import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import api from '../services/api'

const pickUser = (u) => ({
  id: u.id,
  username: u.username,
  nama: u.nama,
  role: u.role,
  roleLabel: u.roleLabel,
})

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved && localStorage.getItem('token') ? JSON.parse(saved) : null
  })

  // Saat halaman dibuka ulang, pastikan token masih berlaku dan segarkan data pengguna.
  useEffect(() => {
    if (!localStorage.getItem('token')) return
    api
      .get('/me')
      .then((res) => {
        const fresh = pickUser(res.data.user)
        setUser(fresh)
        localStorage.setItem('user', JSON.stringify(fresh))
      })
      .catch(() => {
        // 401 sudah ditangani di api.js
      })
  }, [])

  const login = async (username, password) => {
    try {
      const res = await api.post('/login', { username, password })
      const safe = pickUser(res.data.user)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(safe))
      setUser(safe)
      return { ok: true }
    } catch (err) {
      const data = err.response?.data
      const message = data?.errors?.username?.[0] || data?.message || 'Tidak dapat terhubung ke server'
      return { ok: false, message }
    }
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch {
      // tetap keluar di sisi frontend walaupun server tidak menjawab
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}