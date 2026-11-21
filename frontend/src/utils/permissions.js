export const canWriteStok = (role) => ['pemilik', 'pendataan'].includes(role)
export const canWriteGudang = (role) => role === 'pemilik'
export const canReadStok = (role) => ['pemilik', 'pendataan', 'audit'].includes(role)
export const canReadTransaksi = (role) => ['pemilik', 'pendataan', 'audit'].includes(role)

export const formatTanggal = (value) => {
  if (!value) return '-'
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return String(value)
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}