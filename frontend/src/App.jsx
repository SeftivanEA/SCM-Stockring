import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import PlaceholderPage from './pages/PlaceholderPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import DivisiStafPage from './pages/DivisiStafPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<RoleRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
            <Route path="/barang" element={<PlaceholderPage title="Daftar Barang" />} />
            <Route path="/gudang" element={<PlaceholderPage title="Gudang" />} />
            <Route path="/produk" element={<PlaceholderPage title="Produk & Penjualan" />} />
            <Route path="/transaksi" element={<PlaceholderPage title="Riwayat Transaksi" />} />
            <Route path="/tugas" element={<PlaceholderPage title="Pengiriman & Penataan" />} />
            <Route path="/divisi" element={<DivisiStafPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}