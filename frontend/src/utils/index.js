export { menuItems } from './menu';

export function formatNumber(val) {
  if (val == null || val === '') return '0';
  return new Intl.NumberFormat('id-ID').format(Number(val));
}

export function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatQty(qty, unit) {
  const formatted = formatNumber(qty);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatRupiah(val) {
  if (val == null || val === '') return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(val));
}

export function resolveStatus(item) {
  if (!item) return 'aman';
  if (item.status) return item.status;
  const qty = Number(item.quantity) || 0;
  const min = Number(item.min_stock ?? item.minimum ?? 10);
  if (qty <= 0) return 'habis';
  if (qty <= min) return 'menipis';
  return 'aman';
}

export function flattenErrors(errors) {
  if (!errors || typeof errors !== 'object') return {};
  const res = {};
  for (const [k, v] of Object.entries(errors)) {
    res[k] = Array.isArray(v) ? v[0] : String(v);
  }
  return res;
}
