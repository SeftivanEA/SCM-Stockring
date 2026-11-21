const delay = (data, ms = 200) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), ms));

let items = [
  {
    id: 1,
    name: 'Tepung Terigu Cakra Kembar',
    type: 'mentah',
    location: 'Gudang Bahan Kering A',
    quantity: 5,
    unit: 'kg',
    price: 15000,
    min_stock: 10,
    status: 'menipis',
  },
  {
    id: 2,
    name: 'Gula Pasir Gulaku',
    type: 'mentah',
    location: 'Gudang Bahan Kering A',
    quantity: 50,
    unit: 'kg',
    price: 18000,
    min_stock: 15,
    status: 'aman',
  },
  {
    id: 3,
    name: 'Mentega Wisman 1kg',
    type: 'mentah',
    location: 'Ruang Pendingin 1',
    quantity: 0,
    unit: 'kg',
    price: 120000,
    min_stock: 5,
    status: 'habis',
  },
  {
    id: 4,
    name: 'Roti Cokelat Spesial',
    type: 'jadi',
    location: 'Etalase Utama A1',
    quantity: 35,
    unit: 'pcs',
    price: 12000,
    min_stock: 10,
    status: 'aman',
  },
  {
    id: 5,
    name: 'Roti Tawar Gandum',
    type: 'jadi',
    location: 'Etalase Utama A2',
    quantity: 18,
    unit: 'pcs',
    price: 18000,
    min_stock: 8,
    status: 'aman',
  },
  {
    id: 6,
    name: 'Croissant Butter',
    type: 'jadi',
    location: 'Etalase Pastry',
    quantity: 4,
    unit: 'pcs',
    price: 22000,
    min_stock: 10,
    status: 'menipis',
  },
  {
    id: 7,
    name: 'Ragi Instant Mauripan',
    type: 'mentah',
    location: 'Gudang Bahan Kering B',
    quantity: 2,
    unit: 'dus',
    price: 45000,
    min_stock: 5,
    status: 'menipis',
  },
  {
    id: 8,
    name: 'Susu UHT Full Cream',
    type: 'mentah',
    location: 'Ruang Pendingin 1',
    quantity: 24,
    unit: 'liter',
    price: 20000,
    min_stock: 10,
    status: 'aman',
  },
];

let warehouses = [
  {
    id: 1,
    name: 'Gudang Utama A',
    category: 'Bahan Baku Kering',
    capacity: 1000,
    used: 720,
    unit: 'kg',
    note: 'Lantai 1 dekat pintu masuk loading dock',
  },
  {
    id: 2,
    name: 'Gudang Bahan Basah & Minyak',
    category: 'Bahan Baku Basah',
    capacity: 500,
    used: 420,
    unit: 'liter',
    note: 'Lantai 1 sayap barat',
  },
  {
    id: 3,
    name: 'Cold Storage 1',
    category: 'Bahan Pendingin',
    capacity: 300,
    used: 280,
    unit: 'kg',
    note: 'Suhu stabil 2 - 4 derajat Celsius',
  },
  {
    id: 4,
    name: 'Gudang Kemasan & Box',
    category: 'Kemasan / Packaging',
    capacity: 2000,
    used: 600,
    unit: 'pcs',
    note: 'Lantai 2 atas ruang administrasi',
  },
];

let transactions = [
  {
    id: 'TRX-101',
    date: '2026-10-07',
    item_name: 'Roti Tawar Gandum',
    kind: 'masuk',
    quantity: 40,
    unit: 'pcs',
    location: 'Etalase Utama A2',
    recorded_by: 'Rina (Pendataan)',
  },
  {
    id: 'TRX-102',
    date: '2026-10-07',
    item_name: 'Roti Cokelat Spesial',
    kind: 'keluar',
    quantity: 24,
    unit: 'pcs',
    location: 'Etalase Utama A1',
    recorded_by: 'Andi (Pengiriman)',
  },
  {
    id: 'TRX-103',
    date: '2026-10-06',
    item_name: 'Tepung Terigu Cakra Kembar',
    kind: 'masuk',
    quantity: 100,
    unit: 'kg',
    location: 'Gudang Bahan Kering A',
    recorded_by: 'Rina (Pendataan)',
  },
  {
    id: 'TRX-104',
    date: '2026-10-06',
    item_name: 'Mentega Wisman 1kg',
    kind: 'keluar',
    quantity: 10,
    unit: 'kg',
    location: 'Ruang Pendingin 1',
    recorded_by: 'Dewi (Penataan)',
  },
  {
    id: 'TRX-105',
    date: '2026-10-05',
    item_name: 'Croissant Butter',
    kind: 'masuk',
    quantity: 25,
    unit: 'pcs',
    location: 'Etalase Pastry',
    recorded_by: 'Budi (Pemilik)',
  },
  {
    id: 'TRX-106',
    date: '2026-10-05',
    item_name: 'Susu UHT Full Cream',
    kind: 'masuk',
    quantity: 50,
    unit: 'liter',
    location: 'Ruang Pendingin 1',
    recorded_by: 'Rina (Pendataan)',
  },
  {
    id: 'TRX-107',
    date: '2026-10-04',
    item_name: 'Roti Cokelat Spesial',
    kind: 'keluar',
    quantity: 15,
    unit: 'pcs',
    location: 'Etalase Utama A1',
    recorded_by: 'Andi (Pengiriman)',
  },
];

export const stokApi = {
  getDashboard: async () => {
    const raw_stock = items
      .filter((i) => i.type === 'mentah')
      .reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
    const finished_stock = items
      .filter((i) => i.type === 'jadi')
      .reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
    const low_stock = items.filter((i) => i.status === 'menipis' || i.status === 'habis').length;

    const restock = items.filter((i) => i.status === 'menipis' || i.status === 'habis');

    return delay({
      summary: {
        total_items: items.length,
        raw_stock,
        finished_stock,
        low_stock,
      },
      chart: [
        { label: 'Sen', in: 25, out: 15 },
        { label: 'Sel', in: 30, out: 22 },
        { label: 'Rab', in: 18, out: 20 },
        { label: 'Kam', in: 35, out: 28 },
        { label: 'Jum', in: 40, out: 32 },
        { label: 'Sab', in: 50, out: 45 },
        { label: 'Min', in: 20, out: 25 },
      ],
      restock,
      recent: transactions.slice(0, 5),
    });
  },

  listItems: async ({ type = '', status = '', search = '', page = 1, perPage = 10 } = {}) => {
    let filtered = [...items];

    if (type) {
      filtered = filtered.filter((i) => i.type === type);
    }
    if (status) {
      filtered = filtered.filter((i) => i.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (i) => i.name.toLowerCase().includes(q) || (i.location && i.location.toLowerCase().includes(q)),
      );
    }

    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    return delay({
      data: paginated,
      meta: {
        page: Number(page),
        lastPage,
        total,
        perPage: Number(perPage),
      },
    });
  },

  deleteItem: async (id) => {
    items = items.filter((i) => i.id !== id);
    return delay({ success: true });
  },

  listWarehouses: async () => {
    return delay(warehouses);
  },

  createWarehouse: async (data) => {
    const newWarehouse = {
      id: Date.now(),
      name: data.name,
      category: data.category,
      capacity: Number(data.capacity),
      used: 0,
      unit: data.unit,
      note: data.note || '',
    };
    warehouses = [newWarehouse, ...warehouses];
    return delay(newWarehouse);
  },

  listTransactions: async ({ from = '', to = '', kind = '', search = '', page = 1, perPage = 10 } = {}) => {
    let filtered = [...transactions];

    if (from) {
      filtered = filtered.filter((t) => t.date >= from);
    }
    if (to) {
      filtered = filtered.filter((t) => t.date <= to);
    }
    if (kind) {
      filtered = filtered.filter((t) => t.kind.toLowerCase() === kind.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.item_name.toLowerCase().includes(q) ||
          (t.recorded_by && t.recorded_by.toLowerCase().includes(q)) ||
          (t.location && t.location.toLowerCase().includes(q)),
      );
    }

    const total_in = filtered
      .filter((t) => t.kind === 'masuk')
      .reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
    const total_out = filtered
      .filter((t) => t.kind === 'keluar')
      .reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);

    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    return delay({
      data: paginated,
      meta: {
        page: Number(page),
        lastPage,
        total,
        perPage: Number(perPage),
      },
      summary: {
        total_in,
        total_out,
      },
    });
  },

  createItem: async (data) => {
    const qty = Number(data.quantity) || 0;
    const min = Number(data.min_stock) || 10;
    const status = qty <= 0 ? 'habis' : qty <= min ? 'menipis' : 'aman';
    const newItem = {
      id: Date.now(),
      name: data.name.trim(),
      type: data.type || 'jadi',
      location: data.location || 'Etalase Utama',
      quantity: qty,
      unit: data.unit || 'pcs',
      price: Number(data.price) || 0,
      min_stock: min,
      status,
    };
    items = [newItem, ...items];
    return delay(newItem);
  },

  recordSale: async ({ itemId, quantity, buyer = '', destination = '', recordedBy = 'Budi (Pemilik)' }) => {
    const qty = Number(quantity);
    const item = items.find((i) => i.id === Number(itemId));
    if (!item) throw new Error('Produk tidak ditemukan');
    if (item.quantity < qty) throw new Error(`Stok tidak mencukupi (sisa ${item.quantity} ${item.unit})`);

    // Potong stok etalase otomatis
    item.quantity -= qty;
    const min = Number(item.min_stock) || 10;
    item.status = item.quantity <= 0 ? 'habis' : item.quantity <= min ? 'menipis' : 'aman';

    // Catat transaksi barang keluar
    const newTrx = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      item_name: item.name,
      kind: 'keluar',
      quantity: qty,
      unit: item.unit,
      location: item.location,
      recorded_by: recordedBy,
      buyer: buyer || '-',
      destination: destination || '-',
      total_price: qty * (item.price || 0),
    };
    transactions = [newTrx, ...transactions];

    return delay({ item, transaction: newTrx });
  },
};

export default stokApi;
