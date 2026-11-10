import api from './api'

export const getTugas = async () => (await api.get('/tugas')).data.data

export const updateStatusTugas = async (id, { status, penerima, catatan }) => {
  const body = { status }
  if (penerima) body.penerima = penerima
  if (catatan) body.catatan = catatan
  return (await api.patch(`/tugas/${id}/status`, body)).data.data
}