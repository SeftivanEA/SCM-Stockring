import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import Button from '../components/ui/Button'

const inputClass =
  'mt-1 w-full rounded-lg border border-cream bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = (e) => {
    e.preventDefault()
    if (login(username.trim(), password)) navigate('/dashboard')
    else setError('Username atau password salah')
  }

  return (
    <div className="grid min-h-screen bg-[#FFF9E8] text-ink md:grid-cols-5">
      <div className="flex flex-col justify-center bg-ink p-10 text-cream md:col-span-2">
        <div className="text-4xl font-bold text-primary">Stockring</div>
        <p className="mt-3 opacity-80">Manajemen stok gudang &amp; etalase dalam satu tempat.</p>
      </div>
      <div className="grid place-items-center p-6 md:col-span-3">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-xl border border-cream bg-white p-8">
          <h1 className="text-xl font-bold">Masuk</h1>
          <div>
            <label className="text-sm font-medium">Username</label>
            <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">Masuk</Button>
        </form>
      </div>
    </div>
  )
}