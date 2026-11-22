import { useEffect, useState } from 'react'
import { stokService } from '../services/stokService'
import { useAuth } from '../context/useAuth'
import { canWriteStok } from '../utils/permissions'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'

export default function BarangPage() {
  const { user } = useAuth()
  // Hak akses di tampilan (server tetap yang menjadi penjaga utama).
  const bolehTulis = canWriteStok(user.role)

  const [items, setItems] = useState([])
  const [gudangList, setGudangList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all') // all, mentah, jadi, low_stock

  // State Modal Form
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    kode_barang: '',
    nama_barang: '',
    jenis: 'mentah',
    gudang_id: '',
    stok: 0,
    stok_minimum: 5,
    satuan: 'pcs',
    harga_beli: 0,
    harga_jual: 0,
    deskripsi: '',
  })
  const [formLoading, setFormLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const params = { all: true }
      if (tab === 'mentah' || tab === 'jadi') params.jenis = tab
      if (tab === 'low_stock') params.low_stock = true
      if (search) params.search = search

      const [itemsRes, gudangRes] = await Promise.all([
        stokService.getItems(params),
        stokService.getGudang(),
      ])

      setItems(itemsRes || [])
      setGudangList(gudangRes || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [tab, search])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      kode_barang: '',
      nama_barang: '',
      jenis: 'mentah',
      gudang_id: gudangList[0]?.id || '',
      stok: 0,
      stok_minimum: 5,
      satuan: 'pcs',
      harga_beli: 0,
      harga_jual: 0,
      deskripsi: '',
    })
    setErrorMsg('')
    setShowModal(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setFormData({
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      jenis: item.jenis,
      gudang_id: item.gudang_id || '',
      stok: item.stok,
      stok_minimum: item.stok_minimum,
      satuan: item.satuan,
      harga_beli: item.harga_beli,
      harga_jual: item.harga_jual,
      deskripsi: item.deskripsi || '',
    })
    setErrorMsg('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setFormLoading(true)
    try {
      if (editingItem) {
        await stokService.updateItem(editingItem.id, formData)
      } else {
        await stokService.createItem(formData)
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      console.error(err)
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan barang')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id, nama) => {
    if (!confirm(`Hapus barang "${nama}"?`)) return
    try {
      await stokService.deleteItem(id)
      loadData()
    } catch (err) {
      alert('Gagal menghapus barang: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Daftar Barang</h1>
          <p className="text-sm text-ink/70">Kelola inventaris barang mentah (gudang) dan produk jadi (etalase).</p>
        </div>
        {bolehTulis && <Button onClick={handleOpenAdd}>+ Tambah Barang</Button>}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-cream bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'all', label: 'Semua Barang' },
            { id: 'mentah', label: 'Mentah (Gudang)' },
            { id: 'jadi', label: 'Jadi (Etalase)' },
            { id: 'low_stock', label: 'Stok Menipis ⚠️' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${tab === t.id ? 'bg-primary text-ink' : 'text-ink/70 hover:bg-cream/40'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari nama atau kode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Tabel Data Barang */}
      <div className="rounded-xl border border-cream bg-white shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-ink/60">Memuat data barang...</p>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">
            Tidak ada barang ditemukan.
            {bolehTulis && (
              <>
                {' '}Klik <span className="font-semibold text-secondary">+ Tambah Barang</span> untuk mengisi data.
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-cream bg-[#FFFDF5] text-xs font-semibold text-ink/80">
                <tr>
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Barang</th>
                  <th className="py-3 px-4">Klasifikasi</th>
                  <th className="py-3 px-4">Gudang / Lokasi</th>
                  <th className="py-3 px-4 text-center">Stok</th>
                  <th className="py-3 px-4 text-right">Harga Beli</th>
                  <th className="py-3 px-4 text-right">Harga Jual</th>
                  {bolehTulis && <th className="py-3 px-4 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream/50">
                {items.map((item) => {
                  const isLow = item.stok <= item.stok_minimum
                  return (
                    <tr key={item.id} className="hover:bg-cream/10">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-ink">{item.kode_barang}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-ink">{item.nama_barang}</p>
                        {item.deskripsi && <p className="text-[11px] text-ink/50">{item.deskripsi}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={item.jenis === 'mentah' ? 'neutral' : 'success'}>
                          {item.jenis === 'mentah' ? 'Mentah' : 'Produk Jadi'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-ink/70">
                        {item.gudang?.nama_gudang || 'Belum diatur'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block font-bold ${isLow ? 'text-red-600' : 'text-ink'}`}>
                          {item.stok} {item.satuan}
                        </span>
                        {isLow && <span className="block text-[10px] text-red-500 font-semibold">Min: {item.stok_minimum}</span>}
                      </td>
                      <td className="py-3 px-4 text-right text-xs">
                        Rp {Number(item.harga_beli || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right text-xs font-semibold">
                        Rp {Number(item.harga_jual || 0).toLocaleString('id-ID')}
                      </td>
                      {bolehTulis && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="rounded px-2 py-1 text-xs font-medium text-secondary hover:bg-cream/50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.nama_barang)}
                              className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Tambah / Edit Barang */}
      {bolehTulis && showModal && (
        <Modal
          title={editingItem ? 'Edit Data Barang' : 'Tambah Barang Baru'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            {errorMsg && <p className="rounded bg-red-50 p-2 text-xs text-red-600">{errorMsg}</p>}

            <div>
              <label className="text-xs font-medium text-ink">Nama Barang *</label>
              <input
                required
                type="text"
                value={formData.nama_barang}
                onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                className="mt-1 w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Contoh: Tepung Terigu / Roti Tawar"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-ink">Klasifikasi *</label>
                <select
                  value={formData.jenis}
                  onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="mentah">Mentah (Gudang)</option>
                  <option value="jadi">Jadi (Etalase)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-ink">Gudang Penyimpanan</label>
                <select
                  value={formData.gudang_id}
                  onChange={(e) => setFormData({ ...formData, gudang_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Pilih Gudang</option>
                  {gudangList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nama_gudang} ({g.jenis})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-medium text-ink">Stok Awal</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stok}
                  onChange={(e) => setFormData({ ...formData, stok: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-cream px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink">Stok Min.</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stok_minimum}
                  onChange={(e) => setFormData({ ...formData, stok_minimum: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-cream px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink">Satuan</label>
                <input
                  type="text"
                  value={formData.satuan}
                  onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-cream px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="pcs / kg / box"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-ink">Harga Beli (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.harga_beli}
                  onChange={(e) => setFormData({ ...formData, harga_beli: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink">Harga Jual (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.harga_jual}
                  onChange={(e) => setFormData({ ...formData, harga_jual: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
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