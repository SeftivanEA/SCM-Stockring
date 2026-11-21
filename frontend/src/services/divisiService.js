import api from './api'

export const getDivisi = async () => (await api.get('/divisi')).data.data
export const createDivisi = async (payload) => (await api.post('/divisi', payload)).data.data
export const getStaf = async () => (await api.get('/staf')).data.data
export const createStaf = async (payload) => (await api.post('/staf', payload)).data.data
export const assignStaf = async (id, divisiId) =>
  (await api.put(`/staf/${id}/divisi`, { divisi_id: divisiId })).data.data