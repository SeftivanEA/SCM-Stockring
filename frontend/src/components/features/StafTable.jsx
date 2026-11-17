export default function StafTable({ staf, divisi, onAssign }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-cream bg-white">
      <div className="p-5 font-semibold">Daftar Staf &amp; Penetapan Tugas</div>
      <table className="w-full min-w-[520px] text-sm">
        <thead className="bg-cream text-left">
          <tr>
            <th className="px-5 py-2">Nama</th>
            <th>Username</th>
            <th>Divisi / Tugas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cream">
          {staf.map((s) => (
            <tr key={s.id}>
              <td className="px-5 py-3 font-medium">{s.nama}</td>
              <td>{s.username}</td>
              <td className="py-2">
                <select
                  className="w-44 rounded-lg border border-cream bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={s.divisi}
                  onChange={(e) => onAssign(s, e.target.value)}
                >
                  {divisi.map((d) => (
                    <option key={d.id}>{d.nama}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}