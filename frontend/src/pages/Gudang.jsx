import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/StateMessage';
import { WAREHOUSE_WARNING_PERCENT } from '../constants';
import { useFetch, usePermissions } from '../hooks';
import { stokApi } from '../services/stokApi';
import { ui } from '../ui';
import { formatNumber } from '../utils';

function WarehouseCard({ warehouse }) {
  const percent = warehouse.capacity > 0 ? Math.min(100, Math.round((warehouse.used / warehouse.capacity) * 100)) : 0;
  const warning = percent >= WAREHOUSE_WARNING_PERCENT;

  return (
    <article className={`${ui.card} p-4`}>
      <h2 className="text-sm font-bold text-[#4D2A00]">{warehouse.name}</h2>
      <p className="text-xs text-[#4D2A00]/60">{warehouse.category}</p>
      <div
        role="progressbar"
        aria-label={`Kapasitas ${warehouse.name} terpakai`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#F9E6A8]"
      >
        <div className={`h-full rounded-full ${warning ? 'bg-[#CC6F00]' : 'bg-[#F2A900]'}`} style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-[#4D2A00]">
        Terpakai <strong>{percent}%</strong> · {formatNumber(warehouse.used)}/{formatNumber(warehouse.capacity)} {warehouse.unit}
      </p>
      {warehouse.note && <p className="mt-1 text-xs text-[#4D2A00]/60">{warehouse.note}</p>}
    </article>
  );
}

export default function WarehousePage() {
  const { data, loading, error, reload } = useFetch(() => stokApi.listWarehouses(), []);
  const { canManageWarehouse } = usePermissions();

  return (
    <div className={ui.page}>
      <PageHeader
        title="Gudang"
        subtitle="Lokasi penyimpanan barang mentah"
        actions={
          canManageWarehouse && (
            <Link to="/gudang/tambah" className={ui.btnPrimary}>
              + Tambah Gudang
            </Link>
          )
        }
      />

      {error && !data ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading && !data ? (
        <LoadingState />
      ) : data.length === 0 ? (
        <EmptyState text="Belum ada gudang. Klik Tambah Gudang untuk membuat yang pertama." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((warehouse) => (
            <WarehouseCard key={warehouse.id} warehouse={warehouse} />
          ))}
        </div>
      )}
    </div>
  );
}