let divisi = [
  { id: 1, nama: 'Pendataan', deskripsi: 'Mencatat barang masuk & verifikasi fisik' },
  { id: 2, nama: 'Penataan', deskripsi: 'Menata barang di etalase' },
  { id: 3, nama: 'Pengiriman', deskripsi: 'Memproses pengiriman barang' },
  { id: 4, nama: 'Audit', deskripsi: 'Memeriksa data stok (hanya baca)' },
]

let staf = [
  { id: 1, nama: 'Rina', username: 'rina', divisi: 'Pendataan' },
  { id: 2, nama: 'Dewi', username: 'dewi', divisi: 'Penataan' },
  { id: 3, nama: 'Andi', username: 'andi', divisi: 'Pengiriman' },
  { id: 4, nama: 'Sari', username: 'sari', divisi: 'Audit' },
]

// Meniru jeda jaringan supaya halaman sudah siap menangani loading.
const delay = (data) => new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), 200))

export const getDivisi = () => delay(divisi)
export const getStaf = () => delay(staf)

export const createDivisi = ({ nama, deskripsi }) => {
  divisi = [...divisi, { id: Date.now(), nama, deskripsi: deskripsi || '-' }]
  return delay(divisi)
}

export const createStaf = ({ nama, username, divisi: namaDivisi }) => {
  staf = [...staf, { id: Date.now(), nama, username, divisi: namaDivisi }]
  return delay(staf)
}

export const assignStaf = (id, namaDivisi) => {
  staf = staf.map((s) => (s.id === id ? { ...s, divisi: namaDivisi } : s))
  return delay(staf)
}