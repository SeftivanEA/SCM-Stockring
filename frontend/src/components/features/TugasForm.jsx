import { useEffect, useRef, useState } from 'react'
import FormField from '../ui/FormField'
import Button from '../ui/Button'
import { getStafByRole } from '../../services/tugasService'
import { parseError } from '../../utils/apiError'

const ROLE_JENIS = { Pengiriman: 'pengiriman', Penataan: 'penataan' }
const PLACEHOLDER = {
  Pengiriman: 'cth: Tujuan: Toko Maju Jaya',
  Penataan: 'cth: Lokasi: Etalase rak 2',
}

export default function TugasForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ jenis: 'Pengiriman', judul: '', detail: '', user_id: '' })
  const [staf, setStaf] = useState([])
  const [loadingStaf, setLoadingStaf] = useState(true)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const reqId = useRef(0)

  // Daftar staf pertama kali (jenis bawaan: Pengiriman).
  useEffect(() => {
    let ignore = false
    getStafByRole('pengiriman')
      .then((data) => {
        if (ignore) return
        setStaf(data)
        setForm((f) => ({ ...f, user_id: data[0]?.id ?? '' }))
      })
      .catch((err) => {
        if (!ignore) setErrors({ form: parseError(err).message })
      })
      .finally(() => {
        if (!ignore) setLoadingStaf(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  // Saat jenis diganti, daftar staf ikut berganti sesuai divisinya.
  const handleJenis = async (e) => {
    const jenis = e.target.value
    const id = ++reqId.current
    setForm((f) => ({ ...f, jenis, user_id: '' }))
    setStaf([])
    setLoadingStaf(true)
    try {
      const data = await getStafByRole(ROLE_JENIS[jenis])
      if (id !== reqId.current) return
      setStaf(data)
      setForm((f) => ({ ...f, user_id: data[0]?.id ?? '' }))
    } catch (err) {
      if (id === reqId.current) setErrors({ form: parseError(err).message })
    } finally {
      if (id === reqId.current) setLoadingStaf(false)
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = {}
    if (!form.judul.trim()) err.judul = 'Judul tugas wajib diisi'
    if (!form.user_id) err.user_id = 'Pilih staf yang ditugaskan'
    setErrors(err)
    if (Object.keys(err).length > 0) return

    setSaving(true)
    try {
      await onSubmit({
        jenis: form.jenis,
        judul: form.judul.trim(),
        detail: form.detail.trim(),
        user_id: Number(form.user_id),
      })
    } catch (error) {
      const { message, fields } = parseError(error)
      setErrors(Object.keys(fields).length ? fields : { form: message })
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormField label="Jenis Tugas" as="select" value={form.jenis} onChange={handleJenis} error={errors.jenis}>
        <option>Pengiriman</option>
        <option>Penataan</option>
      </FormField>
      <FormField
        label="Judul Tugas"
        required
        placeholder="cth: Kirim 20 Roti Tawar"
        value={form.judul}
        onChange={set('judul')}
        error={errors.judul}
      />
      <FormField
        label="Detail"
        as="textarea"
        rows="2"
        placeholder={PLACEHOLDER[form.jenis]}
        value={form.detail}
        onChange={set('detail')}
        error={errors.detail}
      />
      <FormField
        label="Ditugaskan ke"
        required
        as="select"
        value={form.user_id}
        onChange={set('user_id')}
        disabled={loadingStaf || staf.length === 0}
        error={errors.user_id}
      >
        {loadingStaf && <option value="">Memuat staf...</option>}
        {!loadingStaf && staf.length === 0 && <option value="">Belum ada staf di divisi ini</option>}
        {staf.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nama}
          </option>
        ))}
      </FormField>
      {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit" disabled={saving || loadingStaf}>{saving ? 'Menyimpan...' : 'Simpan Tugas'}</Button>
      </div>
    </form>
  )
}