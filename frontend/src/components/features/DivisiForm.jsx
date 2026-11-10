import { useState } from 'react'
import FormField from '../ui/FormField'
import Button from '../ui/Button'
import { parseError } from '../../utils/apiError'

export default function DivisiForm({ existingNames, onSubmit, onCancel }) {
  const [nama, setNama] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const n = nama.trim()
    if (!n) return setErrors({ nama: 'Nama divisi wajib diisi' })
    if (existingNames.some((x) => x.toLowerCase() === n.toLowerCase())) {
      return setErrors({ nama: 'Nama divisi sudah ada' })
    }
    setSaving(true)
    try {
      await onSubmit({ nama: n, deskripsi: deskripsi.trim() })
    } catch (err) {
      const { message, fields } = parseError(err)
      setErrors(Object.keys(fields).length ? fields : { form: message })
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormField label="Nama Divisi" required placeholder="cth: Pengemasan" value={nama} onChange={(e) => setNama(e.target.value)} error={errors.nama} />
      <FormField label="Deskripsi Tugas" as="textarea" rows="2" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} error={errors.deskripsi} />
      {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Divisi'}</Button>
      </div>
    </form>
  )
}