export function EmptyState({ text = 'Tidak ada data.' }) {
  return (
    <div className="py-12 text-center text-sm text-[#4D2A00]/60">
      <p>{text}</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#F9E6A8] border-t-[#CC6F00]" />
      <p className="mt-3 text-xs text-[#4D2A00]/70">Memuat data...</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const message = error?.message || (typeof error === 'string' ? error : 'Terjadi kesalahan.');
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm font-medium text-red-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-ink hover:bg-secondary hover:text-white"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}

export function Notice({ children, onClose }) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
      <div>{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-lg leading-none font-bold text-green-700 hover:text-green-900"
          aria-label="Tutup"
        >
          &times;
        </button>
      )}
    </div>
  );
}
