// Mengubah error axios menjadi pesan siap tampil + pesan per field.
export function parseError(err) {
  const data = err.response?.data
  const fields = {}
  if (data?.errors) {
    for (const [key, messages] of Object.entries(data.errors)) fields[key] = messages[0]
  }
  let message = 'Tidak dapat terhubung ke server'
  if (err.response) message = data?.message || 'Terjadi kesalahan pada server'
  if (err.response?.status === 403) message = 'Anda tidak punya akses untuk aksi ini'
  return { message, fields }
}