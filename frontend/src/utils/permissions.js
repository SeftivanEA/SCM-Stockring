export const canWriteStok = (role) => ['pemilik', 'pendataan'].includes(role)
export const canWriteGudang = (role) => role === 'pemilik'
export const canReadStok = (role) => ['pemilik', 'pendataan', 'audit'].includes(role)
export const canReadTransaksi = (role) => ['pemilik', 'pendataan', 'audit'].includes(role)

export const formatTanggal = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })