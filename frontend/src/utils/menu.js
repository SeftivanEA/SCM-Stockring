export const menuItems = [
  { label: 'Dashboard', path: '/dashboard', roles: ['pemilik', 'pendataan', 'penataan', 'pengiriman', 'audit'] },
  { label: 'Daftar Barang', path: '/barang', roles: ['pemilik', 'pendataan', 'audit'] },
  { label: 'Gudang', path: '/gudang', roles: ['pemilik', 'audit'] },
  { label: 'Produk & Penjualan', path: '/produk', roles: ['pemilik'] },
  { label: 'Riwayat Transaksi', path: '/transaksi', roles: ['pemilik', 'pendataan', 'audit'] },
  { label: 'Pengiriman & Penataan', path: '/tugas', roles: ['pemilik', 'penataan', 'pengiriman'] },
  { label: 'Divisi & Staf', path: '/divisi', roles: ['pemilik'] },
]