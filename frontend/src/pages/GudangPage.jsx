import { useEffect, useState } from 'react'
import { stokService } from '../services/stokService'
import { useAuth } from '../context/useAuth'
import { canWriteGudang } from '../utils/permissions'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'

export default function GudangPage() {
  const { user } = useAuth()
  // Hak akses di tampilan (server tetap yang menjadi penjaga utama).
  const bolehTulis = canWriteGudang(user.role)

  const [gudangList, setGudangList] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingGudang, setEditingGudang] = useState(null)
  const [formData, setFormData] = useState({
    nama_gudang: '',
    lokasi: '',
    jenis: 'utama',
    keterangan: '',
  })
  const [formLoading, setFormLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await stokService.getGudang()
      setGudangList(res || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenAdd = () => {
    setEditingGudang(null)
    setFormData({
      nama_gudang: '',
      lokasi: '',
      jenis: 'utama',
      keterangan: '',
    })
    setErrorMsg('')
    setShowModal(true)
  }

  const handleOpenEdit = (gudang) => {
    setEditingGudang(gudang)
    setFormData({
      nama_gudang: gudang.nama_gudang,
      lokasi: gudang.lokasi || '',
      jenis: gudang.jenis || 'utama',
      keterangan: gudang.keterangan || '',
    })
    setErrorMsg('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setFormLoading(true)
    try {
      if (editingGudang) {
        await stokService.updateGudang(editingGudang.id, formData)
      } else {
        await stokService.createGudang(formData)
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      console.error(err)
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan gudang')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id, nama) => {
    if (!confirm(`Hapus gudang "${nama}"?`)) return
    try {
      await stokService.deleteGudang(id)
      loadData()
    } catch (err) {
      alert('Gagal menghapus gudang: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Kelola Gudang &amp; Etalase</h1>
          <p className="text-sm text-ink/70">Daftar lokasi penyimpanan bahan baku, produksi, dan display toko.</p>
        </div>
        {bolehTulis && <Button onClick={handleOpenAdd}>+ Tambah Gudang</Button>}
      </div>

      {/* Grid Kartu Gudang */}
      {loading ? (
        <p className="p-8 text-center text-sm text-ink/60">Memuat data gudang...</p>
      ) : gudangList.length === 0 ? (
        <div className="rounded-xl border border-cream bg-white p-8 text-center text-sm text-ink/60">
          Belum ada gudang terdaftar.
          {bolehTulis && (
            <>
              {' '}Klik <span className="font-semibold text-secondary">+ Tambah Gudang</span> untuk membuat baru.
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gudangList.map((g) => (
            <div key={g.id} className="rounded-xl border border-cream bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-ink">{g.nama_gudang}</h3>
                  <Badge variant={g.jenis === 'etalase' ? 'success' : g.jenis === 'produksi' ? 'warning' : 'neutral'}>
                    {g.jenis.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-ink/70">
                  <strong className="text-ink">Lokasi:</strong> {g.lokasi || 'Tidak ada catatan lokasi'}
                </p>
                {g.keterangan && (
                  <p className="mt-2 text-xs text-ink/60 italic bg-cream/20 p-2 rounded">
                    "{g.keterangan}"
                  </p>
                )}
                <div className="mt-4 pt-3 border-t border-cream/50 flex items-center justify-between text-xs">
                  <span className="text-ink/60">Varian Barang:</span>
                  <span className="font-bold text-ink text-sm">{g.items_count ?? 0} jenis barang</span>
                </div>
              </div>

              {bolehTulis && (
                <div className="mt-4 pt-3 border-t border-cream/50 flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(g)}
                    className="rounded px-2.5 py-1 text-xs font-semibold text-secondary hover:bg-cream/40"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(g.id, g.nama_gudang)}
                    className="rounded px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah / Edit Gudang */}
      {bolehTulis && showModal && (
        <Modal
          title={editingGudang ? 'Edit Gudang' : 'Tambah Gudang Baru'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            {errorMsg && <p className="rounded bg-red-50 p-2 text-xs text-red-600">{errorMsg}</p>}

            <div>
              <label className="text-xs font-medium text-ink">Nama Gudang *</label>
              <input
                required
                type="text"
                value={formData.nama_gudang}
                onChange={(e) => setFormData({ ...formData, nama_gudang: e.target.value })}
                className="mt-1 w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Contoh: Gudang Bahan Baku Sayap Barat"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink">Lokasi</label>
              <input
                type="text"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                className="mt-1 w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Contoh: Gedung A Lantai 1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink">Jenis Gudang *</label>
              <select
                value={formData.jenis}
                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                className="mt-1 w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="utama">Utama (Penyimpanan Mentah)</option>
                <option value="produksi">Produksi (Transit / Olahan)</option>
                <option value="etalase">Etalase (Display Toko)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-ink">Keterangan Tambahan</label>
              <textarea
                rows="2"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                className="mt-1 w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Catatan kapasitas atau fasilitas gudang..."
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}