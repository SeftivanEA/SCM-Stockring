
import { useEffect, useState } from 'react';

// Import komponen
import { Pagination } from '../components/ui/Pagination';
import { Badge } from '../components/ui/Badge';

// Import kebutuhan project
import { PAGE_SIZE } from '../constants';
import { useFetch } from '../hooks';
import { stokApi } from '../services/stokApi';
import { ui } from '../ui';
import { formatDate, formatNumber, formatQty } from '../utils';

// Pilihan jenis transaksi
const KIND_OPTIONS = [
    { value: '', label: 'Semua jenis' },
    { value: 'masuk', label: 'Masuk' },
    { value: 'keluar', label: 'Keluar' },
];

// Komponen Page Header
function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-[#4D2A00]">
                    {title}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    {subtitle}
                </p>
            </div>

            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}

// Komponen Status Badge
function KindBadge({ kind }) {
    const isMasuk = kind?.toLowerCase() === 'masuk';

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isMasuk
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
                }`}
        >
            {isMasuk ? 'Masuk' : 'Keluar'}
        </span>
    );
}

// Komponen Empty State
function EmptyState({ text }) {
    return (
        <div className="py-10 text-center">
            <p className="text-sm text-gray-500">{text}</p>
        </div>
    );
}

// Komponen Loading State
function LoadingState() {
    return (
        <div className="py-10 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#F9E6A8] border-t-[#8B5E34]" />
            <p className="text-sm text-gray-500">
                Memuat data transaksi...
            </p>
        </div>
    );
}

// Komponen Error State
function ErrorState({ error, onRetry }) {
    return (
        <div className="py-10 text-center">
            <p className="mb-3 text-sm text-red-600">
                Gagal memuat data: {error?.message || String(error)}
            </p>

            <button
                type="button"
                onClick={onRetry}
                className="rounded-lg bg-[#8B5E34] px-4 py-2 text-sm text-white hover:bg-[#704522]"
            >
                Coba Lagi
            </button>
        </div>
    );
}

// Membuat cell CSV aman untuk Excel
const csvCell = (value) =>
    `"${String(value ?? '').replaceAll('"', '""')}"`;

// Fungsi ekspor CSV
function downloadCsv(rows) {
    const header = [
        'ID',
        'Tanggal',
        'Item',
        'Jenis',
        'Jumlah',
        'Satuan',
        'Lokasi',
        'Dicatat Oleh',
    ];

    const lines = rows.map((t) => [
        t.id,
        t.date,
        t.item_name,
        t.kind,
        t.quantity,
        t.unit,
        t.location,
        t.recorded_by,
    ]);

    const csv =
        '\uFEFF' +
        [header, ...lines]
            .map((line) => line.map(csvCell).join(','))
            .join('\r\n');

    const blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'riwayat-transaksi.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

// HALAMAN RIWAYAT TRANSAKSI
export default function TransactionHistoryPage() {
    const [filters, setFilters] = useState({
        from: '',
        to: '',
        kind: '',
        search: '',
    });

    const [query, setQuery] = useState(filters);
    const [page, setPage] = useState(1);

    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState(null);

    // Debounce filter 300ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setQuery(filters);
            setPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [filters]);

    // Mengambil data transaksi
    const {
        data,
        loading,
        error,
        reload,
    } = useFetch(
        () =>
            stokApi.listTransactions({
                ...query,
                page,
                perPage: PAGE_SIZE,
            }),
        [query, page],
    );

    const rows = data?.data ?? [];
    const meta = data?.meta;

    // Validasi tanggal
    const dateRangeInvalid = Boolean(
        filters.from &&
        filters.to &&
        filters.from > filters.to
    );

    // Mengubah filter
    const setFilter = (field) => (event) => {
        setFilters((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    // Ekspor semua transaksi
    async function handleExport() {
        setExporting(true);
        setExportError(null);

        try {
            const all = await stokApi.listTransactions({
                ...query,
                page: 1,
                perPage: 10000,
            });

            downloadCsv(all.data ?? []);
        } catch (err) {
            setExportError(
                err.message || 'Terjadi kesalahan saat ekspor.'
            );
        } finally {
            setExporting(false);
        }
    }

    return (
        <div className={ui.page}>

            {/* HEADER */}
            <PageHeader
                title="Riwayat Transaksi"
                subtitle="Semua pergerakan barang masuk dan keluar"
                actions={
                    <button
                        type="button"
                        className={ui.btnOutline}
                        onClick={handleExport}
                        disabled={exporting || !data}
                    >
                        {exporting
                            ? 'Mengekspor...'
                            : 'Ekspor Laporan'}
                    </button>
                }
            />

            {/* ERROR EKSPOR */}
            {exportError && (
                <p
                    role="alert"
                    className="mb-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700"
                >
                    Ekspor gagal: {exportError}
                </p>
            )}

            {/* RINGKASAN TRANSAKSI */}
            {data?.summary && (
                <div className="mb-4 flex flex-wrap gap-2 text-xs text-[#4D2A00]">

                    <span className="rounded-full bg-[#F9E6A8] px-3 py-1">
                        Total Masuk:{' '}
                        <strong>
                            {formatNumber(data.summary.total_in)} unit
                        </strong>
                    </span>

                    <span className="rounded-full bg-[#F9E6A8] px-3 py-1">
                        Total Keluar:{' '}
                        <strong>
                            {formatNumber(data.summary.total_out)} unit
                        </strong>
                    </span>

                </div>
            )}

            {/* CARD UTAMA */}
            <div className={ui.card}>

                {/* FILTER */}
                <div className="flex flex-wrap items-center gap-2 p-4">

                    <input
                        type="date"
                        value={filters.from}
                        max={filters.to || undefined}
                        onChange={setFilter('from')}
                        aria-label="Dari tanggal"
                        className={`${ui.input} sm:w-40`}
                    />

                    <input
                        type="date"
                        value={filters.to}
                        min={filters.from || undefined}
                        onChange={setFilter('to')}
                        aria-label="Sampai tanggal"
                        className={`${ui.input} sm:w-40`}
                    />

                    <select
                        value={filters.kind}
                        onChange={setFilter('kind')}
                        aria-label="Filter jenis transaksi"
                        className={`${ui.input} sm:w-40`}
                    >
                        {KIND_OPTIONS.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <input
                        type="search"
                        value={filters.search}
                        onChange={setFilter('search')}
                        placeholder="Cari item..."
                        aria-label="Cari item"
                        className={`${ui.input} sm:max-w-xs`}
                    />

                </div>

                {/* VALIDASI TANGGAL */}
                {dateRangeInvalid && (
                    <p
                        role="alert"
                        className="px-4 pb-3 text-xs text-red-600"
                    >
                        Tanggal awal tidak boleh melewati tanggal akhir.
                    </p>
                )}

                {/* ERROR API */}
                {error && !data ? (
                    <ErrorState
                        error={error}
                        onRetry={reload}
                    />
                ) : loading && !data ? (
                    <LoadingState />
                ) : (

                    /* TABEL TRANSAKSI */
                    <div
                        className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''
                            }`}
                    >

                        <table className="w-full min-w-[720px] border-collapse">

                            <thead>
                                <tr>
                                    {[
                                        'ID',
                                        'Tanggal',
                                        'Item',
                                        'Jenis',
                                        'Jumlah',
                                        'Lokasi',
                                        'Dicatat Oleh',
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            scope="col"
                                            className={ui.th}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map((trx) => (
                                    <tr
                                        key={trx.id}
                                        className="border-t border-[#F9E6A8]/60"
                                    >
                                        <td className={`${ui.td} font-semibold`}>
                                            {trx.id}
                                        </td>

                                        <td className={ui.td}>
                                            {formatDate(trx.date)}
                                        </td>

                                        <td className={ui.td}>
                                            {trx.item_name}
                                        </td>

                                        <td className={ui.td}>
                                            <KindBadge kind={trx.kind} />
                                        </td>

                                        <td className={ui.td}>
                                            {formatQty(
                                                trx.quantity,
                                                trx.unit
                                            )}
                                        </td>

                                        <td className={ui.td}>
                                            {trx.location}
                                        </td>

                                        <td className={ui.td}>
                                            {trx.recorded_by}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>

                        {/* DATA KOSONG */}
                        {rows.length === 0 && (
                            <EmptyState
                                text="Tidak ada transaksi yang cocok dengan filter."
                            />
                        )}

                    </div>
                )}

                {/* PAGINATION */}
                {meta && (
                    <Pagination
                        page={meta.page}
                        lastPage={meta.lastPage}
                        total={meta.total}
                        perPage={meta.perPage}
                        count={rows.length}
                        onChange={setPage}
                    />
                )}

            </div>
        </div>
    );
}