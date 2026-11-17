import { useState } from 'react'
import FormField from '../ui/FormField'
import Button from '../ui/Button'

const OPSI = { Baru: ['Diproses', 'Selesai'], Diproses: ['Selesai', 'Baru'] }
const TAHAP = ['Baru', 'Diproses', 'Selesai']

export default function UpdateStatusForm({ tugas, onSubmit, onCancel }) {
  const opsi = OPSI[tugas.status]
  const [status, setStatus] = useState(opsi[0])
  const [penerima, setPenerima] = useState('')
  const [catatan, setCatatan] = useState('')
  const [error, setError] = useState('')

  const perluPenerima = status === 'Selesai' && tugas.jenis === 'Pengiriman'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (perluPenerima && !penerima.trim()) return setError('Nama penerima wajib diisi')
    onSubmit({ status, penerima: penerima.trim(), catatan: catatan.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm">
        <b>{tugas.judul}</b>
        <br />
        <span className="opacity-70">{tugas.detail}</span>
      </p>

      <div className="flex items-center gap-2 text-xs">
        {TAHAP.map((t, i) => (
          <span key={t} className="flex items-center gap-2">
            {i > 0 && <span>→</span>}
            <span className={`rounded-full px-3 py-1 ${t === tugas.status ? 'bg-primary font-bold' : 'bg-cream opacity-70'}`}>
              {t}
            </span>
          </span>
        ))}
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">Ubah status menjadi:</p>
        {opsi.map((o) => (
          <label key={o} className="mb-1 flex cursor-pointer items-center gap-2 rounded-lg border border-cream p-2">
            <input
              type="radio"
              name="status"
              value={o}
              checked={status === o}
              onChange={() => {
                setStatus(o)
                setError('')
              }}
              className="accent-primary"
            />
            {o}
          </label>
        ))}
      </div>

      {perluPenerima && (
        <FormField
          label="Nama Penerima"
          required
          placeholder="cth: Bu Rini"
          value={penerima}
          onChange={(e) => setPenerima(e.target.value)}
          error={error}
        />
      )}

      <FormField
        label="Catatan (opsional)"
        as="textarea"
        rows="2"
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
      />

      <p className="text-xs opacity-60">
        Saat Selesai, stok &amp; riwayat transaksi diperbarui dan Pemilik mendapat notifikasi.
      </p>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit">Simpan Status</Button>
      </div>
    </form>
  )
}