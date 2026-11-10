function pageNumbers(page, lastPage) {
    if (lastPage <= 7) return Array.from({ length: lastPage }, (_, i) => i + 1);
    const pages = new Set([1, lastPage, page - 1, page, page + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= lastPage).sort((a, b) => a - b);
    const result = [];
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) result.push('...');
        result.push(p);
    });
    return result;
}

export function Pagination({ page, lastPage, total, perPage, count, onChange }) {
    const from = total === 0 ? 0 : (page - 1) * perPage + 1;
    const to = total === 0 ? 0 : from + count - 1;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-[#4D2A00]/70">
            <span>{total === 0 ? 'Tidak ada data' : `Menampilkan ${from}–${to} dari ${total}`}</span>
            {lastPage > 1 && (
                <nav aria-label="Halaman" className="flex items-center gap-1">
                    {pageNumbers(page, lastPage).map((p, i) =>
                        p === '...' ? (
                            <span key={`gap-${i}`} className="px-1">
                                …
                            </span>
                        ) : (
                            <button
                                key={p}
                                type="button"
                                aria-current={p === page ? 'page' : undefined}
                                onClick={() => onChange(p)}
                                className={`h-7 min-w-7 rounded-md px-2 text-xs font-semibold transition-colors ${p === page
                                    ? 'bg-[#F2A900] text-[#4D2A00]'
                                    : 'text-[#4D2A00] hover:bg-[#F9E6A8]'
                                    }`}
                            >
                                {p}
                            </button>
                        ),
                    )}
                </nav>
            )}
        </div>
    );
}