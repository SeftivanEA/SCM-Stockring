import { useState } from 'react'
import FormField from '../ui/FormField'
import Button from '../ui/Button'
import { parseError } from '../../utils/apiError'

export default function StafForm({ divisi, existingUsernames, onSubmit, onCancel }) {
  const [form, setForm] = useState({ nama: '', username: '', password: '', divisi_id: divisi[0]?.id ?? '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = {}
    if (!form.nama.trim()) err.nama = 'Nama wajib diisi'
    if (!form.username.trim()) err.username = 'Username wajib diisi'
    else if (existingUsernames.includes(form.username.trim().toLowerCase())) err.username = 'Username sudah dipakai'
    if (form.password.length < 6) err.password = 'Password minimal 6 karakter'
    if (!form.divisi_id) err.divisi_id = 'Pilih divisi'
    setErrors(err)
    if (Object.keys(err).length > 0) return

    setSaving(true)
    try {
      await onSubmit({
        nama: form.nama.trim(),
        username: form.username.trim().toLowerCase(),
        password: form.password,
        divisi_id: Number(form.divisi_id),
      })
    } catch (error) {
      const { message, fields } = parseError(error)
      setErrors(Object.keys(fields).length ? fields : { form: message })
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormField label="Nama Lengkap" required placeholder="cth: Budi Santoso" value={form.nama} onChange={set('nama')} error={errors.nama} />
      <FormField label="Username" required placeholder="cth: budi" value={form.username} onChange={set('username')} error={errors.username} />
      <FormField label="Password Sementara" required type="password" value={form.password} onChange={set('password')} error={errors.password} />
      <FormField label="Divisi / Tugas" as="select" value={form.divisi_id} onChange={set('divisi_id')} error={errors.divisi_id}>
        {divisi.map((d) => (
          <option key={d.id} value={d.id}>{d.nama}</option>
        ))}
      </FormField>
      {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Staf'}</Button>
      </div>
    </form>
  )
}