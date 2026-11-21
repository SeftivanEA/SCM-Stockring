import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import PlaceholderPage from './pages/PlaceholderPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import DivisiStafPage from './pages/DivisiStafPage'
import TugasPage from './pages/TugasPage'
import Dashboard from './pages/Dashboard'
import DaftarBarang from './pages/DaftarBarang'
import Gudang from './pages/Gudang'
import GudangForm from './pages/GudangForm'
import RiwayatTransaksi from './pages/RiwayatTransaksi'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<RoleRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/barang" element={<DaftarBarang />} />
            <Route path="/barang/tambah" element={<PlaceholderPage title="Tambah Barang" />} />
            <Route path="/barang/:id/edit" element={<PlaceholderPage title="Edit Barang" />} />
            <Route path="/gudang" element={<Gudang />} />
            <Route path="/gudang/tambah" element={<GudangForm />} />
            <Route path="/produk" element={<PlaceholderPage title="Produk & Penjualan" />} />
            <Route path="/transaksi" element={<RiwayatTransaksi />} />
            <Route path="/tugas" element={<TugasPage />} />
            <Route path="/divisi" element={<DivisiStafPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
