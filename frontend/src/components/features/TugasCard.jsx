import Badge from '../ui/Badge'
import Button from '../ui/Button'

export default function TugasCard({ tugas, onUpdate }) {
  return (
    <div className="rounded-xl border border-cream bg-white p-4 text-sm">
      <Badge variant={tugas.jenis === 'Pengiriman' ? 'neutral' : 'warning'}>{tugas.jenis}</Badge>
      <p className="mt-2 font-bold">{tugas.judul}</p>
      <p className="opacity-70">{tugas.detail}</p>
      {tugas.log && <p className="mt-2 text-xs opacity-60">{tugas.log}</p>}
      {tugas.status !== 'Selesai' && (
        <Button className="mt-3 w-full text-sm" onClick={() => onUpdate(tugas)}>
          Perbarui Status
        </Button>
      )}
    </div>
  )
}