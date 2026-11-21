import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import DivisiStafPage from './pages/DivisiStafPage'
import TugasPage from './pages/TugasPage'
import DashboardPage from './pages/DashboardPage'
import BarangPage from './pages/BarangPage'
import GudangPage from './pages/GudangPage'
import TransaksiPage from './pages/TransaksiPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<RoleRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/barang" element={<BarangPage />} />
            <Route path="/gudang" element={<GudangPage />} />
            <Route path="/produk" element={<BarangPage />} />
            <Route path="/transaksi" element={<TransaksiPage />} />
            <Route path="/tugas" element={<TugasPage />} />
            <Route path="/divisi" element={<DivisiStafPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
