import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'
import TugasCard from '../components/features/TugasCard'
import TugasForm from '../components/features/TugasForm'
import UpdateStatusForm from '../components/features/UpdateStatusForm'
import { getTugas, createTugas, updateStatusTugas } from '../services/tugasService'
import { parseError } from '../utils/apiError'

const KOLOM = ['Baru', 'Diproses', 'Selesai']
const JENIS_PERAN = { penataan: 'Penataan', pengiriman: 'Pengiriman' }

export default function TugasPage() {
  const { user } = useAuth()
  const [tugas, setTugas] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState({ message: '', error: false })
  const [filter, setFilter] = useState('Semua')

  useEffect(() => {
    let ignore = false
    getTugas()
      .then((data) => {
        if (!ignore) setTugas(data)
      })
      .catch((err) => {
        if (!ignore) setLoadError(parseError(err).message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const showToast = (message, error = false) => {
    setToast({ message, error })
    setTimeout(() => setToast({ message: '', error: false }), 2500)
  }

  const isPemilik = user.role === 'pemilik'
  const jenisPeran = JENIS_PERAN[user.role]
  const jenisAktif = jenisPeran ?? (filter === 'Semua' ? null : filter)
  const tampil = jenisAktif ? tugas.filter((t) => t.jenis === jenisAktif) : tugas

  // Error dari server dilempar ke form agar tampil di dalam popup.
  const handleSubmit = async (data) => {
    await updateStatusTugas(selected.id, data)
    setTugas(await getTugas())
    setSelected(null)
    showToast(`Status diperbarui menjadi ${data.status}`)
  }

  const handleCreate = async (data) => {
    await createTugas(data)
    setTugas(await getTugas())
    setShowForm(false)
    showToast('Tugas berhasil dibuat')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pengiriman &amp; Penataan</h1>
          <p className="text-sm opacity-70">Klik &quot;Perbarui Status&quot; pada kartu untuk mengubah progres tugas</p>
        </div>
        <div className="flex items-center gap-2">
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
          {isPemilik && <Button onClick={() => setShowForm(true)}>+ Tambah Tugas</Button>}
        </div>
      </div>

      {loading ? (
        <p className="opacity-70">Memuat data...</p>
      ) : loadError ? (
        <p className="text-red-600">{loadError}</p>
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
      {showForm && (
        <Modal title="Tambah Tugas" onClose={() => setShowForm(false)}>
          <TugasForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </Modal>
      )}
      <Toast message={toast.message} error={toast.error} />
    </div>
  )
}