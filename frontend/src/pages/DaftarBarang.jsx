import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageHeader';
import { Pagination } from '../components/Pagination';
import { EmptyState, ErrorState, LoadingState, Notice } from '../components/StateMessage';
import { StatusBadge } from '../components/StatusBadge';
import { PAGE_SIZE, STATUS_FILTER_OPTIONS } from '../constants';
import { useFetch, usePermissions } from '../hooks';
import { stokApi } from '../services/stokApi';
import { ui } from '../ui';
import { formatQty, formatRupiah, resolveStatus } from '../utils';

const TABS = [
    { value: 'semua', label: 'Semua' },
    { value: 'mentah', label: 'Barang Mentah' },
    { value: 'jadi', label: 'Produk Jadi' },
];

export default function ItemListPage() {
    const [params, setParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { canEdit } = usePermissions();

    const tab = TABS.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'semua';
    const status = params.get('status') ?? '';
    const q = params.get('q') ?? '';
    const page = Math.max(1, Number(params.get('page')) || 1);

    const [search, setSearch] = useState(q);
    const [notice, setNotice] = useState(location.state?.notice ?? null);
    const [toDelete, setToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    // Hapus state notifikasi dari history supaya tidak muncul lagi saat refresh.
    useEffect(() => {
        if (location.state?.notice) navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }, [location, navigate]);

    // Ubah parameter URL. Nilai kosong / default dihapus agar URL tetap bersih.
    function update(next) {
        const p = new URLSearchParams(params);
        Object.entries(next).forEach(([key, value]) => {
            const isDefault = value === '' || value == null || (key === 'tab' && value === 'semua') || (key === 'page' && value === 1);
            if (isDefault) p.delete(key);
            else p.set(key, String(value));
        });
        setParams(p);
    }

    // Pencarian: tunggu 300ms setelah berhenti mengetik.
    useEffect(() => {
        if (search === q) return undefined;
        const timer = setTimeout(() => update({ q: search.trim(), page: 1 }), 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // Sinkronkan kotak pencarian bila URL berubah dari luar (mis. tombol Reset).
    useEffect(() => setSearch(q), [q]);

    const { data, loading, error, reload } = useFetch(
        () => stokApi.listItems({ type: tab === 'semua' ? '' : tab, status, search: q, page, perPage: PAGE_SIZE }),
        [tab, status, q, page],
    );

    const rows = data?.data ?? [];
    const meta = data?.meta;

    async function confirmDelete() {
        setDeleting(true);
        setDeleteError(null);
        try {
            await stokApi.deleteItem(toDelete.id);
            const name = toDelete.name;
            setToDelete(null);
            setNotice(`"${name}" berhasil dihapus.`);
            // Bila yang dihapus adalah satu-satunya baris di halaman ini, mundur satu halaman.
            if (rows.length === 1 && page > 1) update({ page: page - 1 });
            else reload();
        } catch (err) {
            setDeleteError(err.message);
        } finally {
            setDeleting(false);
        }
    }

    const addTo = `/barang/tambah${tab === 'semua' ? '' : `?tipe=${tab}`}`;

    return (
        <div className={ui.page}>
            <PageHeader
                title="Daftar Barang"
                subtitle="Kelola barang mentah (gudang) dan produk jadi (etalase)"
                actions={
                    canEdit && (
                        <Link to={addTo} className={ui.btnPrimary}>
                            + Tambah Barang
                        </Link>
                    )
                }
            />

            {notice && <Notice onClose={() => setNotice(null)}>{notice}</Notice>}

            <div className={ui.card}>
                <div role="tablist" aria-label="Jenis barang" className="flex gap-5 border-b border-[#F9E6A8] px-4 pt-3">
                    {TABS.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            role="tab"
                            aria-selected={tab === t.value}
                            onClick={() => update({ tab: t.value, page: 1 })}
                            className={`-mb-px border-b-2 pb-2 text-sm transition-colors ${tab === t.value
                                    ? 'border-[#F2A900] font-bold text-[#4D2A00]'
                                    : 'border-transparent text-[#4D2A00]/60 hover:text-[#4D2A00]'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 p-4">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari nama barang..."
                        aria-label="Cari nama barang"
                        className={`${ui.input} sm:max-w-xs`}
                    />
                    <select
                        value={status}
                        onChange={(event) => update({ status: event.target.value, page: 1 })}
                        aria-label="Filter status stok"
                        className={`${ui.input} sm:w-44`}
                    >
                        {STATUS_FILTER_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className={ui.btnOutline}
                        onClick={() => {
                            setSearch('');
                            setParams({});
                        }}
                    >
                        Reset
                    </button>
                </div>

                {error && !data ? (
                    <ErrorState error={error} onRetry={reload} />
                ) : loading && !data ? (
                    <LoadingState />
                ) : (
                    <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`}>
                        <table className="w-full min-w-[720px] border-collapse">
                            <thead>
                                <tr>
                                    {['ID', 'Nama Item', 'Tipe', 'Lokasi', 'Stok', 'Harga Jual', 'Status'].map((h) => (
                                        <th key={h} scope="col" className={ui.th}>
                                            {h}
                                        </th>
                                    ))}
                                    {canEdit && (
                                        <th scope="col" className={`${ui.th} text-right`}>
                                            Aksi
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((item) => (
                                    <tr key={item.id} className="border-t border-[#F9E6A8]/60">
                                        <td className={ui.td}>{item.id}</td>
                                        <td className={`${ui.td} font-semibold`}>{item.name}</td>
                                        <td className={ui.td}>{item.type === 'mentah' ? 'Barang Mentah' : 'Produk Jadi'}</td>
                                        <td className={ui.td}>{item.location}</td>
                                        <td className={ui.td}>{formatQty(item.quantity, item.unit)}</td>
                                        <td className={ui.td}>{item.type === 'jadi' ? formatRupiah(item.price) : '-'}</td>
                                        <td className={ui.td}>
                                            <StatusBadge status={resolveStatus(item)} />
                                        </td>
                                        {canEdit && (
                                            <td className={`${ui.td} text-right`}>
                                                <Link to={`/barang/${item.id}/edit`} className={ui.btnText}>
                                                    Edit
                                                </Link>
                                                <span className="px-1 text-[#4D2A00]/40">-</span>
                                                <button
                                                    type="button"
                                                    className="text-sm font-medium text-red-600 hover:underline"
                                                    onClick={() => {
                                                        setDeleteError(null);
                                                        setToDelete(item);
                                                    }}
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {rows.length === 0 && <EmptyState text="Tidak ada barang yang cocok dengan filter." />}
                    </div>
                )}

                {meta && (
                    <Pagination
                        page={meta.page}
                        lastPage={meta.lastPage}
                        total={meta.total}
                        perPage={meta.perPage}
                        count={rows.length}
                        onChange={(p) => update({ page: p })}
                    />
                )}
            </div>

            <ConfirmDialog
                open={Boolean(toDelete)}
                title={`Hapus "${toDelete?.name}"?`}
                message={deleteError ?? 'Data barang akan dihapus permanen dan tidak bisa dikembalikan.'}
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />
        </div>
    );
}