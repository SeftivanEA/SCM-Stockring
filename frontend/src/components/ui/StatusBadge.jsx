export function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();

  let styles = 'bg-gray-100 text-gray-700';
  let label = status || '-';

  if (s === 'aman') {
    styles = 'bg-green-100 text-green-800';
    label = 'Stok Aman';
  } else if (s === 'menipis') {
    styles = 'bg-[#F9E6A8] text-[#CC6F00] font-bold';
    label = 'Stok Menipis';
  } else if (s === 'habis') {
    styles = 'bg-red-100 text-red-700 font-bold';
    label = 'Stok Habis';
  }

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {label}
    </span>
  );
}

export function KindBadge({ kind }) {
  const isMasuk = String(kind || '').toLowerCase() === 'masuk';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isMasuk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {isMasuk ? 'Masuk' : 'Keluar'}
    </span>
  );
}
