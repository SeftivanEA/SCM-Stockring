import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { stokService } from '../services/stokService'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await stokService.getDashboard()
      setData(res)
    } catch (err) {
      console.error(err)
      setError('Gagal memuat data dashboard dari backend. Pastikan server Laravel aktif.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-ink/70">Memuat data stok & ringkasan...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-700">{error}</p>
        <Button onClick={loadData} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    )
  }

  const { cards, low_stock_items = [], recent_transactions = [] } = data || {}

  return (
    <div className="space-y-6">
      {/* Header Dashboard */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard Stok</h1>
          <p className="text-sm text-ink/70">Ringkasan stok barang mentah, produk jadi, dan mutasi barang.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/barang">
            <Button variant="outline" className="text-sm">+ Kelola Barang</Button>
          </Link>
          <Link to="/transaksi">
            <Button variant="primary" className="text-sm">+ Catat Transaksi</Button>
          </Link>
        </div>
      </div>

      {/* 4 Kartu Statistik */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-cream bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-ink/60">Total Item Terdaftar</p>
          <p className="mt-1 text-3xl font-bold text-ink">{cards?.total_items ?? 0}</p>
          <span className="mt-2 inline-block text-[11px] text-ink/50">Di seluruh gudang &amp; etalase</span>
        </div>

        <div className="rounded-xl border border-cream bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-ink/60">Barang Mentah (Gudang)</p>
          <p className="mt-1 text-3xl font-bold text-secondary">{cards?.total_barang_mentah ?? 0}</p>
          <span className="mt-2 inline-block text-[11px] text-ink/50">Bahan baku produksi</span>
        </div>

        <div className="rounded-xl border border-cream bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-ink/60">Produk Jadi (Etalase)</p>
          <p className="mt-1 text-3xl font-bold text-green-700">{cards?.total_barang_jadi ?? 0}</p>
          <span className="mt-2 inline-block text-[11px] text-ink/50">Siap dijual ke konsumen</span>
        </div>

        <div className="rounded-xl border-l-4 border-l-red-500 border-cream bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-red-700">Stok Menipis / Kritis</p>
          <p className="mt-1 text-3xl font-bold text-red-600">{cards?.low_stock_count ?? 0}</p>
          <span className="mt-2 inline-block text-[11px] text-red-500 font-semibold">Perlu segera direstok</span>
        </div>
      </div>

      {/* Bagian Bawah: Stok Kritis & Transaksi Terbaru */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kolom 1: Peringatan Stok Menipis */}
        <div className="rounded-xl border border-cream bg-white p-5 shadow-sm lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-ink">Perlu Restok Segera</h2>
            <Link to="/barang" className="text-xs font-semibold text-secondary hover:underline">
              Lihat Semua
            </Link>
          </div>

          {low_stock_items.length === 0 ? (
            <div className="rounded-lg bg-green-50 p-4 text-center text-sm text-green-700">
              Semua stok berada di atas batas aman!
            </div>
          ) : (
            <div className="divide-y divide-cream/60">
              {low_stock_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.nama_barang}</p>
                    <p className="text-xs text-ink/60">{item.gudang?.nama_gudang || 'Tanpa Gudang'}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="danger">
                      Sisa: {item.stok} {item.satuan}
                    </Badge>
                    <p className="mt-0.5 text-[10px] text-ink/50">Min: {item.stok_minimum}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom 2: Riwayat Transaksi Terbaru */}
        <div className="rounded-xl border border-cream bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-ink">Mutasi Transaksi Terbaru</h2>
            <Link to="/transaksi" className="text-xs font-semibold text-secondary hover:underline">
              Riwayat Lengkap &rarr;
            </Link>
          </div>

          {recent_transactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink/50">Belum ada transaksi tercatat.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-cream bg-[#FFFDF5] text-xs font-semibold text-ink/70">
                    <th className="py-2.5 px-3">Kode TRX</th>
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Item Terlibat</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream/50">
                  {recent_transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-cream/10">
                      <td className="py-2.5 px-3 font-mono text-xs font-semibold">{trx.kode_transaksi}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={trx.tipe === 'masuk' ? 'success' : 'warning'}>
                          {trx.tipe === 'masuk' ? '↓ Masuk' : '↑ Keluar'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-ink/80">{trx.tanggal_transaksi}</td>
                      <td className="py-2.5 px-3 text-xs">
                        {trx.details?.map((d) => `${d.item?.nama_barang} (${d.jumlah})`).join(', ') || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-ink">
                        Rp {Number(trx.total_harga || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

