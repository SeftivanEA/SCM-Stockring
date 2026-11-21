import { useEffect, useState } from 'react'
import { stokService } from '../services/stokService'
import { useAuth } from '../context/useAuth'
import { canJual, canWriteStok, formatTanggal } from '../utils/permissions'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'

export default function TransaksiPage() {
  const { user } = useAuth()
  // Hak akses di tampilan (server tetap yang menjadi penjaga utama).
  const bolehTulis = canWriteStok(user.role)
  const bolehJual = canJual(user.role)
  const tipeAwal = bolehJual ? 'keluar' : 'masuk'

  const [transaksis, setTransaksis] = useState([])
  const [itemList, setItemList] = useState([])
  const [loading, setLoading] = useState(true)
  const [tipeFilter, setTipeFilter] = useState('')
  const [search, setSearch] = useState('')

  // State Modal Form Transaksi Baru
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    tipe: tipeAwal,
    tanggal_transaksi: new Date().toISOString().split('T')[0],
    item_id: '',
    jumlah: 1,
    catatan: '',
  })
  const [formLoading, setFormLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const params = {}
      if (tipeFilter) params.tipe = tipeFilter
      if (search) params.search = search

      const [trxRes, itemsRes] = await Promise.all([
        stokService.getTransaksi(params),
        stokService.getItems({ all: true }),
      ])

      setTransaksis(trxRes?.data || [])
      setItemList(itemsRes || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [tipeFilter, search])

  const handleOpenAdd = () => {
    setFormData({
      tipe: 'keluar',
      tanggal_transaksi: new Date().toISOString().split('T')[0],
      item_id: itemList[0]?.id || '',
      jumlah: 1,
      catatan: '',
    })
    setErrorMsg('')
    setSuccessMsg('')
    setShowModal(true)
  }

  const selectedItem = itemList.find((i) => String(i.id) === String(formData.item_id))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setFormLoading(true)

    try {
      const payload = {
        tipe: formData.tipe,
        tanggal_transaksi: formData.tanggal_transaksi,
        catatan: formData.catatan,
        items: [
          {
            item_id: formData.item_id,
            jumlah: parseInt(formData.jumlah),
          },
        ],
      }

      const res = await stokService.createTransaksi(payload)
      setSuccessMsg(res.message || 'Transaksi berhasil dicatat!')
      setShowModal(false)
      loadData()
    } catch (err) {
      console.error(err)
      const msg =
        err.response?.data?.errors?.items?.[0] ||
        err.response?.data?.message ||
        'Gagal mencatat transaksi'
      setErrorMsg(msg)
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {bolehTulis ? 'Riwayat & Catat Transaksi' : 'Riwayat Transaksi'}
          </h1>
          <p className="text-sm text-ink/70">
            {bolehTulis
              ? 'Pencatatan barang masuk (restok) dan barang keluar (pemotongan stok otomatis).'
              : 'Riwayat barang masuk (restok) dan barang keluar.'}
          </p>
        </div>
        {bolehTulis && <Button onClick={handleOpenAdd}>+ Catat Transaksi Baru</Button>}
      </div>

      {successMsg && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          ✓ {successMsg}
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-cream bg-white p-3 shadow-sm">
        <div className="flex gap-1">
          {[
            { id: '', label: 'Semua Transaksi' },
            { id: 'masuk', label: 'Barang Masuk (Restok)' },
            { id: 'keluar', label: 'Barang Keluar (Penjualan)' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTipeFilter(t.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${tipeFilter === t.id ? 'bg-primary text-ink' : 'text-ink/70 hover:bg-cream/40'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari kode TRX atau catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Tabel Riwayat Transaksi */}
      <div className="rounded-xl border border-cream bg-white shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-ink/60">Memuat riwayat transaksi...</p>
        ) : transaksis.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">
            Belum ada transaksi tercatat.
            {bolehTulis && (
              <>
                {' '}Klik <span className="font-semibold text-secondary">+ Catat Transaksi Baru</span> untuk memulai.
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-cream bg-[#FFFDF5] text-xs font-semibold text-ink/80">
                <tr>
                  <th className="py-3 px-4">No. Transaksi</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Rincian Barang</th>
                  <th className="py-3 px-4 text-right">Total Nominal</th>
                  <th className="py-3 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream/50">
                {transaksis.map((trx) => (
                  <tr key={trx.id} className="hover:bg-cream/10">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-ink">
                      {trx.kode_transaksi}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={trx.tipe === 'masuk' ? 'success' : 'warning'}>
                        {trx.tipe === 'masuk' ? '↓ MASUK / RESTOK' : '↑ KELUAR / JUAL'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-ink/80">{formatTanggal(trx.tanggal_transaksi)}</td>
                    <td className="py-3 px-4">
                      <ul className="space-y-1">
                        {trx.details?.map((d) => (
                          <li key={d.id} className="text-xs">
                            <span className="font-semibold text-ink">{d.item?.nama_barang}</span>{' '}
                            <span className="text-ink/60">({d.jumlah} {d.item?.satuan})</span>
                            <span className="text-[11px] text-ink/50 ml-1">@ Rp {Number(d.harga_satuan || 0).toLocaleString('id-ID')}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-ink">
                      Rp {Number(trx.total_harga || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-xs text-ink/60 italic">
                      {trx.catatan || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Transaksi Baru */}
      {bolehTulis && showModal && (
        <Modal title="Catat Transaksi Mutasi Stok" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {errorMsg && (
              <div className="rounded bg-red-50 p-2.5 text-xs font-semibold text-red-700 border border-red-200">
                ⚠️ {errorMsg}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-ink">Jenis Transaksi *</label>
              <select
                value={formData.tipe}
                onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                className="mt-1 w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {bolehJual && <option value="keluar">Keluar / Penjualan (Memotong Stok Otomatis)</option>}
                <option value="masuk">Masuk / Pembelian / Restok (Menambah Stok)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-ink">Tanggal Transaksi *</label>
              <input
                required
                type="date"
                value={formData.tanggal_transaksi}
                onChange={(e) => setFormData({ ...formData, tanggal_transaksi: e.target.value })}
                className="mt-1 w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink">Pilih Barang *</label>
              <select
                required
                value={formData.item_id}
                onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                className="mt-1 w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Pilih barang...</option>
                {itemList.map((i) => (
                  <option key={i.id} value={i.id}>
                    [{i.kode_barang}] {i.nama_barang} (Stok Saat Ini: {i.stok} {i.satuan})
                  </option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <div className="rounded-lg bg-cream/30 p-2.5 text-xs text-ink/80 flex justify-between">
                <span>Stok tersedia: <strong>{selectedItem.stok} {selectedItem.satuan}</strong></span>
                <span>Harga: <strong>Rp {Number(formData.tipe === 'keluar' ? selectedItem.harga_jual : selectedItem.harga_beli).toLocaleString('id-ID')}</strong></span>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-ink">Jumlah Mutasi *</label>
              <input
                required
                type="number"
                min="1"
                value={formData.jumlah}
                onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                className="mt-1 w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink">Catatan Transaksi</label>
              <textarea
                rows="2"
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                className="mt-1 w-full rounded-lg border border-cream px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Misal: Penjualan toko fisik atau Pembelian dari Supplier X"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Memproses...' : 'Simpan Transaksi'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}