import Button from './components/ui/Button'
import Badge from './components/ui/Badge'

export default function App() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-ink">Stockring</h1>
      <div className="flex gap-2">
        <Button>Simpan</Button>
        <Button variant="outline">Batal</Button>
        <Button variant="danger">Hapus</Button>
      </div>
      <div className="flex gap-2">
        <Badge variant="success">Aman</Badge>
        <Badge variant="warning">Menipis</Badge>
        <Badge variant="danger">Habis</Badge>
        <Badge variant="neutral">Keluar</Badge>
      </div>
    </div>
  )
}