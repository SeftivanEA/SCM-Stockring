import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'
import DivisiForm from '../components/features/DivisiForm'
import StafForm from '../components/features/StafForm'
import StafTable from '../components/features/StafTable'
import { getDivisi, getStaf, createDivisi, createStaf, assignStaf } from '../services/divisiService'

export default function DivisiStafPage() {
  const [divisi, setDivisi] = useState([])
  const [staf, setStaf] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'divisi' | 'staf' | null
  const [toast, setToast] = useState('')

  useEffect(() => {
    let ignore = false
    Promise.all([getDivisi(), getStaf()]).then(([d, s]) => {
      if (ignore) return
      setDivisi(d)
      setStaf(s)
      setLoading(false)
    })
    return () => {
      ignore = true
    }
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const handleCreateDivisi = async (data) => {
    setDivisi(await createDivisi(data))
    setModal(null)
    showToast('Divisi berhasil dibuat')
  }

  const handleCreateStaf = async (data) => {
    setStaf(await createStaf(data))
    setModal(null)
    showToast('Staf berhasil ditambahkan')
  }

  const handleAssign = async (s, namaDivisi) => {
    setStaf(await assignStaf(s.id, namaDivisi))
    showToast(`${s.nama} ditugaskan ke ${namaDivisi}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Divisi &amp; Staf</h1>
          <p className="text-sm opacity-70">Atur divisi dan tugas staf</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setModal('staf')}>+ Tambah Staf</Button>
          <Button onClick={() => setModal('divisi')}>+ Buat Divisi</Button>
        </div>
      </div>

      {loading ? (
        <p className="opacity-70">Memuat data...</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {divisi.map((d) => (
              <div key={d.id} className="rounded-xl border border-cream border-l-4 border-l-primary bg-white p-4">
                <h3 className="font-bold">{d.nama}</h3>
                <p className="min-h-[40px] text-sm opacity-70">{d.deskripsi}</p>
                <p className="mt-2 text-sm">
                  <b>{staf.filter((s) => s.divisi === d.nama).length}</b> staf
                </p>
              </div>
            ))}
          </div>
          <StafTable staf={staf} divisi={divisi} onAssign={handleAssign} />
        </>
      )}

      {modal === 'divisi' && (
        <Modal title="Buat Divisi" onClose={() => setModal(null)}>
          <DivisiForm
            existingNames={divisi.map((d) => d.nama)}
            onSubmit={handleCreateDivisi}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
      {modal === 'staf' && (
        <Modal title="Tambah Staf" onClose={() => setModal(null)}>
          <StafForm
            divisi={divisi}
            existingUsernames={staf.map((s) => s.username)}
            onSubmit={handleCreateStaf}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
      <Toast message={toast} />
    </div>
  )
}