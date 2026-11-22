import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'
import DivisiForm from '../components/features/DivisiForm'
import StafForm from '../components/features/StafForm'
import StafTable from '../components/features/StafTable'
import { getDivisi, getStaf, createDivisi, createStaf, assignStaf } from '../services/divisiService'
import { parseError } from '../utils/apiError'

export default function DivisiStafPage() {
  const [divisi, setDivisi] = useState([])
  const [staf, setStaf] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [modal, setModal] = useState(null) // 'divisi' | 'staf' | null
  const [toast, setToast] = useState({ message: '', error: false })

  useEffect(() => {
    let ignore = false
    Promise.all([getDivisi(), getStaf()])
      .then(([d, s]) => {
        if (ignore) return
        setDivisi(d)
        setStaf(s)
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

  const reload = async () => {
    const [d, s] = await Promise.all([getDivisi(), getStaf()])
    setDivisi(d)
    setStaf(s)
  }

  // Error dari server sengaja dilempar ke form agar tampil di bawah field terkait.
  const handleCreateDivisi = async (data) => {
    await createDivisi(data)
    await reload()
    setModal(null)
    showToast('Divisi berhasil dibuat')
  }

  const handleCreateStaf = async (data) => {
    await createStaf(data)
    await reload()
    setModal(null)
    showToast('Staf berhasil ditambahkan')
  }

  const handleAssign = async (s, divisiId) => {
    try {
      await assignStaf(s.id, divisiId)
      await reload()
      const nama = divisi.find((d) => d.id === divisiId)?.nama
      showToast(`${s.nama} ditugaskan ke ${nama}`)
    } catch (err) {
      showToast(parseError(err).message, true)
    }
  }

  // Pemilik tidak punya divisi, jadi tidak ditampilkan di tabel penetapan tugas.
  const stafDivisi = staf.filter((s) => s.role !== 'pemilik')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Divisi &amp; Staf</h1>
          <p className="text-sm opacity-70">Atur divisi dan tugas staf</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setModal('staf')} disabled={loading || !!loadError}>+ Tambah Staf</Button>
          <Button onClick={() => setModal('divisi')} disabled={loading || !!loadError}>+ Buat Divisi</Button>
        </div>
      </div>

      {loading ? (
        <p className="opacity-70">Memuat data...</p>
      ) : loadError ? (
        <p className="text-red-600">{loadError}</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {divisi.map((d) => (
              <div key={d.id} className="rounded-xl border border-cream border-l-4 border-l-primary bg-white p-4">
                <h3 className="font-bold">{d.nama}</h3>
                <p className="min-h-[40px] text-sm opacity-70">{d.deskripsi}</p>
                <p className="mt-2 text-sm">
                  <b>{stafDivisi.filter((s) => s.divisi_id === d.id).length}</b> staf
                </p>
              </div>
            ))}
          </div>
          <StafTable staf={stafDivisi} divisi={divisi} onAssign={handleAssign} />
        </>
      )}

      {modal === 'divisi' && (
        <Modal title="Buat Divisi" onClose={() => setModal(null)}>
          <DivisiForm existingNames={divisi.map((d) => d.nama)} onSubmit={handleCreateDivisi} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'staf' && (
        <Modal title="Tambah Staf" onClose={() => setModal(null)}>
          <StafForm
            divisi={divisi}
            existingUsernames={staf.map((s) => s.username.toLowerCase())}
            onSubmit={handleCreateStaf}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
      <Toast message={toast.message} error={toast.error} />
    </div>
  )
}