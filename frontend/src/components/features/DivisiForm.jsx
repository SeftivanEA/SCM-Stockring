import { useState } from 'react'
import FormField from '../ui/FormField'
import Button from '../ui/Button'

export default function DivisiForm({ existingNames, onSubmit, onCancel }) {
  const [nama, setNama] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const n = nama.trim()
    if (!n) return setError('Nama divisi wajib diisi')
    if (existingNames.some((x) => x.toLowerCase() === n.toLowerCase())) {
      return setError('Nama divisi sudah ada')
    }
    onSubmit({ nama: n, deskripsi: deskripsi.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormField
        label="Nama Divisi"
        required
        placeholder="cth: Pengemasan"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        error={error}
      />
      <FormField
        label="Deskripsi Tugas"
        as="textarea"
        rows="2"
        value={deskripsi}
        onChange={(e) => setDeskripsi(e.target.value)}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit">Simpan Divisi</Button>
      </div>
    </form>
  )
}