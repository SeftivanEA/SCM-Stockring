import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'
import TugasCard from '../components/features/TugasCard'
import UpdateStatusForm from '../components/features/UpdateStatusForm'
import { getTugas, updateStatusTugas } from '../services/tugasService'

const KOLOM = ['Baru', 'Diproses', 'Selesai']
const JENIS_PERAN = { penataan: 'Penataan', pengiriman: 'Pengiriman' }

export default function TugasPage() {
  const { user } = useAuth()
  const [tugas, setTugas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')
  const [filter, setFilter] = useState('Semua')

  useEffect(() => {
    let ignore = false
    getTugas().then((data) => {
      if (ignore) return
      setTugas(data)
      setLoading(false)
    })
    return () => {
      ignore = true
    }
  }, [])

  // Staf hanya melihat jenis tugas divisinya. Pemilik melihat semua dan bisa menyaring.
  const jenisPeran = JENIS_PERAN[user.role]
  const jenisAktif = jenisPeran ?? (filter === 'Semua' ? null : filter)
  const tampil = jenisAktif ? tugas.filter((t) => t.jenis === jenisAktif) : tugas

  const handleSubmit = async (data) => {
    setTugas(await updateStatusTugas(selected.id, data))
    setSelected(null)
    setToast(`Status diperbarui menjadi ${data.status}`)
    setTimeout(() => setToast(''), 2200)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pengiriman &amp; Penataan</h1>
          <p className="text-sm opacity-70">Klik &quot;Perbarui Status&quot; pada kartu untuk mengubah progres tugas</p>
        </div>
        {!jenisPeran && (
          <select
            className="rounded-lg border border-cream bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>Semua</option>
            <option>Pengiriman</option>
            <option>Penataan</option>
          </select>
        )}
      </div>

      {loading ? (
        <p className="opacity-70">Memuat data...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {KOLOM.map((k) => {
            const items = tampil.filter((t) => t.status === k)
            return (
              <div key={k} className="space-y-3 rounded-xl bg-cream/60 p-3">
                <h3 className="px-1 font-semibold">
                  {k} <span className="opacity-60">({items.length})</span>
                </h3>
                {items.map((t) => (
                  <TugasCard key={t.id} tugas={t} onUpdate={setSelected} />
                ))}
                {items.length === 0 && <p className="px-1 text-sm opacity-50">Tidak ada tugas</p>}
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <Modal title="Perbarui Status" onClose={() => setSelected(null)}>
          <UpdateStatusForm tugas={selected} onSubmit={handleSubmit} onCancel={() => setSelected(null)} />
        </Modal>
      )}
      <Toast message={toast} />
    </div>
  )
}