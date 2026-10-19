let tugas = [
  { id: 101, jenis: 'Pengiriman', judul: 'Kirim 24 Roti Cokelat', detail: 'Tujuan: Toko Maju Jaya', status: 'Baru', log: '' },
  { id: 102, jenis: 'Pengiriman', judul: 'Kirim 10 Kue Keju', detail: 'Tujuan: Kafe Senja', status: 'Baru', log: '' },
  { id: 103, jenis: 'Penataan', judul: 'Tata 40 Roti Tawar', detail: 'Lokasi: Etalase rak 2', status: 'Diproses', log: '07 Okt 2026 · Mulai ditata' },
  { id: 104, jenis: 'Pengiriman', judul: 'Kirim 12 Brownies', detail: 'Tujuan: Bu Rini', status: 'Selesai', log: '06 Okt 2026 · Diterima Bu Rini' },
]

const delay = (data) => new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), 200))

const tanggal = () =>
  new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

export const getTugas = () => delay(tugas)

export const updateStatusTugas = (id, { status, penerima, catatan }) => {
  tugas = tugas.map((t) => {
    if (t.id !== id) return t
    const ket = status === 'Selesai' && penerima ? `Diterima ${penerima}` : status
    return { ...t, status, log: `${tanggal()} · ${ket}${catatan ? ' · ' + catatan : ''}` }
  })
  return delay(tugas)
}