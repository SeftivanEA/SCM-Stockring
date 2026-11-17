import api from './api'

export const stokService = {
  // Dashboard Summary
  getDashboard: () => api.get('/dashboard/summary').then((res) => res.data.data),

  // Modul Barang (Items)
  getItems: (params = {}) => api.get('/items', { params }).then((res) => res.data.data),
  getItem: (id) => api.get(`/items/${id}`).then((res) => res.data.data),
  createItem: (data) => api.post('/items', data).then((res) => res.data),
  updateItem: (id, data) => api.put(`/items/${id}`, data).then((res) => res.data),
  deleteItem: (id) => api.delete(`/items/${id}`).then((res) => res.data),

  // Modul Gudang
  getGudang: () => api.get('/gudang').then((res) => res.data.data),
  createGudang: (data) => api.post('/gudang', data).then((res) => res.data),
  updateGudang: (id, data) => api.put(`/gudang/${id}`, data).then((res) => res.data),
  deleteGudang: (id) => api.delete(`/gudang/${id}`).then((res) => res.data),

  // Modul Transaksi & Pemotongan Stok
  getTransaksi: (params = {}) => api.get('/transaksi', { params }).then((res) => res.data.data),
  createTransaksi: (data) => api.post('/transaksi', data).then((res) => res.data),
  getTransaksiDetail: (id) => api.get(`/transaksi/${id}`).then((res) => res.data.data),
}

