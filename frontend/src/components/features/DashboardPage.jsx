import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessage';
import { KindBadge, StatusBadge } from '../components/StatusBadge';
import { useFetch, usePermissions } from '../hooks';
import { stokApi } from '../services/stokApi';
import { ui } from '../ui';
import { formatDate, formatNumber, formatQty, resolveStatus } from '../utils';

function StatCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-xl border-l-4 border-[#F2A900] p-4 shadow-sm ${
        highlight ? 'bg-[#F9E6A8]' : 'border-y border-r border-y-[#F9E6A8] border-r-[#F9E6A8] bg-white'
      }`}
    >
      <p className="text-xs text-[#4D2A00]/70">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#4D2A00]">{formatNumber(value)}</p>
    </div>
  );
}

// Grafik batang sederhana tanpa library tambahan.
function InOutChart({ data }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.in, d.out]));
  const summary = data.map((d) => `${d.label}: masuk ${d.in}, keluar ${d.out}`).join('; ');

  return (
    <div role="img" aria-label={`Grafik barang masuk dan keluar 7 hari. ${summary}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#4D2A00]">Barang Masuk vs Keluar (7 hari)</h2>
        <div className="flex items-center gap-3 text-xs text-[#4D2A00]/70">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-[#F2A900]" /> Masuk
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-[#4D2A00]" /> Keluar
          </span>
        </div>
      </div>
      <div className="flex h-44 items-end gap-2 sm:gap-4" aria-hidden="true">
        {data.map((d) => (
          <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div className="w-3 rounded-t bg-[#F2A900] sm:w-5" style={{ height: `${(d.in / max) * 100}%` }} title={`Masuk: ${d.in}`} />
              <div className="w-3 rounded-t bg-[#4D2A00] sm:w-5" style={{ height: `${(d.out / max) * 100}%` }} title={`Keluar: ${d.out}`} />
            </div>
            <span className="text-[10px] text-[#4D2A00]/60">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error, reload } = useFetch(() => stokApi.getDashboard(), []);
  const { canEdit, canAccess } = usePermissions();
  // Tautan hanya ditampilkan bila peran ini boleh membuka halaman tujuannya,
  // supaya klik tidak memantul balik ke Dashboard.
  const canOpenItems = canAccess('/barang');
  const canOpenTransactions = canAccess('/transaksi');

  return (
    <div className={ui.page}>
      <PageHeader
        title="Dashboard"
        subtitle="Ringkasan stok gudang & etalase"
        actions={
          canEdit && (
            <>
              <Link to="/transaksi" className={ui.btnOutline}>
                Catat Barang Keluar
              </Link>
              <Link to="/barang/tambah" className={ui.btnPrimary}>
                + Tambah Pembelian
              </Link>
            </>
          )
        }
      />

      {error && !data ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading && !data ? (
        <LoadingState />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Total Item" value={data.summary.total_items} />
            <StatCard label="Stok Gudang (Mentah)" value={data.summary.raw_stock} />
            <StatCard label="Stok Etalase (Jadi)" value={data.summary.finished_stock} />
            <StatCard label="Stok Menipis" value={data.summary.low_stock} highlight />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className={`${ui.card} p-4 lg:col-span-2`}>
              <InOutChart data={data.chart} />
            </section>

            <section className={`${ui.card} p-4`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#4D2A00]">Perlu Restok</h2>
                {canOpenItems && (
                  <Link to="/barang?status=menipis" className="text-xs font-semibold text-[#CC6F00] hover:underline">
                    Lihat semua
                  </Link>
                )}
              </div>
              {data.restock.length === 0 ? (
                <EmptyState text="Semua stok aman." />
              ) : (
                <ul className="divide-y divide-[#F9E6A8]">
                  {data.restock.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-2 py-2">
                      <div>
                        <p className="text-sm font-semibold text-[#4D2A00]">{item.name}</p>
                        <p className="text-[11px] text-[#4D2A00]/60">{item.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={resolveStatus(item)} />
                        <span className="text-sm font-bold text-[#4D2A00]">{formatQty(item.quantity, item.unit)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className={ui.card}>
            <div className="flex items-center justify-between px-4 pt-4">
              <h2 className="text-sm font-bold text-[#4D2A00]">Transaksi Terbaru</h2>
              {canOpenTransactions && (
                <Link to="/transaksi" className="text-xs font-semibold text-[#CC6F00] hover:underline">
                  Riwayat lengkap →
                </Link>
              )}
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse">
                <thead>
                  <tr>
                    {['ID', 'Tanggal', 'Item', 'Jenis', 'Jumlah'].map((h) => (
                      <th key={h} scope="col" className={ui.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((trx) => (
                    <tr key={trx.id} className="border-t border-[#F9E6A8]/60">
                      <td className={`${ui.td} font-semibold`}>{trx.id}</td>
                      <td className={ui.td}>{formatDate(trx.date)}</td>
                      <td className={ui.td}>{trx.item_name}</td>
                      <td className={ui.td}>
                        <KindBadge kind={trx.kind} />
                      </td>
                      <td className={ui.td}>{formatQty(trx.quantity, trx.unit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.recent.length === 0 && <EmptyState text="Belum ada transaksi." />}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
