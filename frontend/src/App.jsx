import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import PlaceholderPage from './pages/PlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
        <Route path="/barang" element={<PlaceholderPage title="Daftar Barang" />} />
        <Route path="/gudang" element={<PlaceholderPage title="Gudang" />} />
        <Route path="/produk" element={<PlaceholderPage title="Produk & Penjualan" />} />
        <Route path="/transaksi" element={<PlaceholderPage title="Riwayat Transaksi" />} />
        <Route path="/tugas" element={<PlaceholderPage title="Pengiriman & Penataan" />} />
        <Route path="/divisi" element={<PlaceholderPage title="Divisi & Staf" />} />
      </Route>
    </Routes>
  )
}