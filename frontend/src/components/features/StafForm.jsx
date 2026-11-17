import { useState } from 'react'
import FormField from '../ui/FormField'
import Button from '../ui/Button'

export default function StafForm({ divisi, existingUsernames, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    nama: '',
    username: '',
    password: '',
    divisi: divisi[0]?.nama ?? '',
  })
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    const err = {}
    if (!form.nama.trim()) err.nama = 'Nama wajib diisi'
    if (!form.username.trim()) err.username = 'Username wajib diisi'
    else if (existingUsernames.includes(form.username.trim().toLowerCase())) err.username = 'Username sudah dipakai'
    if (form.password.length < 6) err.password = 'Password minimal 6 karakter'
    setErrors(err)
    if (Object.keys(err).length > 0) return
    onSubmit({ nama: form.nama.trim(), username: form.username.trim().toLowerCase(), divisi: form.divisi })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormField label="Nama Lengkap" required placeholder="cth: Budi Santoso" value={form.nama} onChange={set('nama')} error={errors.nama} />
      <FormField label="Username" required placeholder="cth: budi" value={form.username} onChange={set('username')} error={errors.username} />
      <FormField label="Password Sementara" required type="password" value={form.password} onChange={set('password')} error={errors.password} />
      <FormField label="Divisi / Tugas" as="select" value={form.divisi} onChange={set('divisi')}>
        {divisi.map((d) => (
          <option key={d.id}>{d.nama}</option>
        ))}
      </FormField>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit">Simpan Staf</Button>
      </div>
    </form>
  )
}