import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { EmptyState, LoadingState } from '../components/ui/StateMessage';
import { useAuth } from '../context/useAuth';
import { stokApi } from '../services/stokApi';
import { createTugas } from '../services/tugasService';
import { formatNumber, formatRupiah, formatQty, resolveStatus, formatDate } from '../utils';
import { ui } from '../ui';

export default function ProdukPenjualanPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('katalog'); // 'katalog' | 'riwayat'
  const [products, setProducts] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states - Catat Penjualan
  const [saleQty, setSaleQty] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [isDelivery, setIsDelivery] = useState(false);
  const [deliveryDestination, setDeliveryDestination] = useState('');
  const [saleError, setSaleError] = useState('');
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  // Form states - Tambah Produk
  const [newProduct, setNewProduct] = useState({
    name: '',
    location: 'Etalase Utama A1',
    price: '',
    quantity: '',
    unit: 'pcs',
    min_stock: '10',
  });
  const [productError, setProductError] = useState('');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const refreshData = useCallback(async () => {
    try {
      const [itemsRes, trxRes] = await Promise.all([
        stokApi.listItems({ type: 'jadi', perPage: 100 }),
        stokApi.listTransactions({ kind: 'keluar', perPage: 100 }),
      ]);
      setProducts(itemsRes.data || []);
      setSalesHistory(trxRes.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      stokApi.listItems({ type: 'jadi', perPage: 100 }),
      stokApi.listTransactions({ kind: 'keluar', perPage: 100 }),
    ]).then(([itemsRes, trxRes]) => {
      if (!ignore) {
        setProducts(itemsRes.data || []);
        setSalesHistory(trxRes.data || []);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  // Quick action: Buka modal penjualan untuk produk tertentu
  const handleOpenSaleModal = (product = null) => {
    const targetProduct = product || products[0];
    setSelectedProduct(targetProduct || null);
    setSaleQty(1);
    setBuyerName('');
    setIsDelivery(false);
    setDeliveryDestination('');
    setSaleError('');
    setSaleModalOpen(true);
  };

  // Submit Penjualan
  const handleSubmitSale = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return setSaleError('Pilih produk yang akan dijual.');
    const qty = Number(saleQty);
    if (!qty || qty <= 0) return setSaleError('Jumlah terjual harus lebih dari 0.');
    if (qty > selectedProduct.quantity) {
      return setSaleError(`Stok tidak mencukupi (sisa ${selectedProduct.quantity} ${selectedProduct.unit}).`);
    }
    if (isDelivery && !deliveryDestination.trim()) {
      return setSaleError('Alamat / tujuan pengiriman wajib diisi.');
    }

    setIsSubmittingSale(true);
    setSaleError('');
    try {
      await stokApi.recordSale({
        itemId: selectedProduct.id,
        quantity: qty,
        buyer: buyerName.trim(),
        destination: deliveryDestination.trim(),
        recordedBy: user ? `${user.nama} (${user.roleLabel})` : 'Budi (Pemilik)',
      });

      // Jika butuh pengiriman, buatkan tugas otomatis untuk tim pengiriman
      if (isDelivery) {
        await createTugas({
          jenis: 'Pengiriman',
          judul: `Kirim ${qty} ${selectedProduct.name}`,
          detail: `Tujuan: ${deliveryDestination.trim()}${buyerName ? ` (Penerima: ${buyerName.trim()})` : ''}`,
        });
      }

      setSaleModalOpen(false);
      showToast(
        `Penjualan ${qty} ${selectedProduct.name} berhasil dicatat! Stok terpotong.${
          isDelivery ? ' Tugas pengiriman telah dibuat.' : ''
        }`
      );
      await refreshData();
    } catch (err) {
      setSaleError(err.message || 'Gagal memproses penjualan.');
    } finally {
      setIsSubmittingSale(false);
    }
  };

  // Submit Tambah Produk
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return setProductError('Nama produk wajib diisi.');
    if (!newProduct.price || Number(newProduct.price) <= 0) {
      return setProductError('Harga jual harus lebih dari 0.');
    }
    if (newProduct.quantity === '' || Number(newProduct.quantity) < 0) {
      return setProductError('Stok awal tidak boleh kurang dari 0.');
    }

    setIsSubmittingProduct(true);
    setProductError('');
    try {
      await stokApi.createItem({
        name: newProduct.name.trim(),
        type: 'jadi',
        location: newProduct.location.trim() || 'Etalase Utama',
        price: Number(newProduct.price),
        quantity: Number(newProduct.quantity),
        unit: newProduct.unit.trim() || 'pcs',
        min_stock: Number(newProduct.min_stock) || 10,
      });

      setAddProductModalOpen(false);
      setNewProduct({
        name: '',
        location: 'Etalase Utama A1',
        price: '',
        quantity: '',
        unit: 'pcs',
        min_stock: '10',
      });
      showToast('Produk jadi baru berhasil ditambahkan ke etalase!');
      await refreshData();
    } catch (err) {
      setProductError(err.message || 'Gagal menambahkan produk.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Filter produk
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || resolveStatus(p) === statusFilter;
    return matchSearch && matchStatus;
  });

  // Statistik ringkas
  const totalItems = products.length;
  const totalStock = products.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  const lowStockCount = products.filter((p) => resolveStatus(p) !== 'aman').length;
  const totalSalesUnits = salesHistory.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);

  return (
    <div className={ui.page}>
      <PageHeader
        title="Produk & Penjualan"
        subtitle="Kelola katalog produk jadi di etalase dan pencatatan transaksi penjualan"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAddProductModalOpen(true)}>
              + Tambah Produk Jadi
            </Button>
            <Button onClick={() => handleOpenSaleModal()} disabled={products.length === 0}>
              + Catat Penjualan
            </Button>
          </div>
        }
      />

      {/* Kartu Statistik */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-cream bg-white p-4 shadow-sm">
          <p className="text-xs text-[#4D2A00]/70">Total Varian Produk</p>
          <p className="mt-1 text-2xl font-bold text-[#4D2A00]">{formatNumber(totalItems)} varian</p>
        </div>
        <div className="rounded-xl border border-cream bg-white p-4 shadow-sm">
          <p className="text-xs text-[#4D2A00]/70">Total Stok Etalase</p>
          <p className="mt-1 text-2xl font-bold text-[#4D2A00]">{formatNumber(totalStock)} unit</p>
        </div>
        <div
          className={`rounded-xl border-l-4 p-4 shadow-sm ${
            lowStockCount > 0 ? 'border-l-[#CC6F00] bg-[#F9E6A8]' : 'border-l-[#F2A900] bg-white'
          }`}
        >
          <p className="text-xs text-[#4D2A00]/70">Perlu Restok Etalase</p>
          <p className="mt-1 text-2xl font-bold text-[#4D2A00]">{formatNumber(lowStockCount)} produk</p>
        </div>
        <div className="rounded-xl border border-cream bg-white p-4 shadow-sm">
          <p className="text-xs text-[#4D2A00]/70">Total Penjualan Tercatat</p>
          <p className="mt-1 text-2xl font-bold text-[#4D2A00]">{formatNumber(totalSalesUnits)} unit</p>
        </div>
      </div>

      {/* Main Container dengan Tab */}
      <div className={ui.card}>
        <div className="flex border-b border-[#F9E6A8] px-4 pt-3 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('katalog')}
            className={`-mb-px border-b-2 pb-2 text-sm font-semibold transition-colors ${
              activeTab === 'katalog'
                ? 'border-[#F2A900] text-[#4D2A00]'
                : 'border-transparent text-[#4D2A00]/60 hover:text-[#4D2A00]'
            }`}
          >
            Katalog Produk Etalase ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`-mb-px border-b-2 pb-2 text-sm font-semibold transition-colors ${
              activeTab === 'riwayat'
                ? 'border-[#F2A900] text-[#4D2A00]'
                : 'border-transparent text-[#4D2A00]/60 hover:text-[#4D2A00]'
            }`}
          >
            Riwayat Penjualan ({salesHistory.length})
          </button>
        </div>

        {/* TAB 1: KATALOG PRODUK */}
        {activeTab === 'katalog' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="search"
                  placeholder="Cari produk atau lokasi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${ui.input} sm:w-64`}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`${ui.input} sm:w-44`}
                >
                  <option value="">Semua Status Stok</option>
                  <option value="aman">Stok Aman</option>
                  <option value="menipis">Stok Menipis</option>
                  <option value="habis">Stok Habis</option>
                </select>
                {(search || statusFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('');
                    }}
                    className={ui.btnOutline}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <LoadingState />
            ) : filteredProducts.length === 0 ? (
              <EmptyState text="Tidak ada produk jadi yang sesuai dengan filter pencarian." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse">
                  <thead>
                    <tr>
                      <th className={ui.th}>ID</th>
                      <th className={ui.th}>Nama Produk</th>
                      <th className={ui.th}>Lokasi Etalase</th>
                      <th className={ui.th}>Harga Jual</th>
                      <th className={ui.th}>Stok Etalase</th>
                      <th className={ui.th}>Status</th>
                      <th className={`${ui.th} text-right`}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F9E6A8]/60">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-cream/20">
                        <td className={ui.td}>#{p.id}</td>
                        <td className={`${ui.td} font-bold text-[#4D2A00]`}>{p.name}</td>
                        <td className={ui.td}>{p.location}</td>
                        <td className={`${ui.td} font-semibold text-[#CC6F00]`}>{formatRupiah(p.price)}</td>
                        <td className={ui.td}>
                          <span className="font-bold">{formatQty(p.quantity, p.unit)}</span>
                        </td>
                        <td className={ui.td}>
                          <StatusBadge status={resolveStatus(p)} />
                        </td>
                        <td className={`${ui.td} text-right`}>
                          <button
                            type="button"
                            onClick={() => handleOpenSaleModal(p)}
                            disabled={p.quantity <= 0}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-secondary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Catat Jual
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RIWAYAT PENJUALAN */}
        {activeTab === 'riwayat' && (
          <div>
            {loading ? (
              <LoadingState />
            ) : salesHistory.length === 0 ? (
              <EmptyState text="Belum ada riwayat transaksi penjualan produk." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse">
                  <thead>
                    <tr>
                      <th className={ui.th}>ID Transaksi</th>
                      <th className={ui.th}>Tanggal</th>
                      <th className={ui.th}>Produk</th>
                      <th className={ui.th}>Jumlah</th>
                      <th className={ui.th}>Tujuan / Pembeli</th>
                      <th className={ui.th}>Lokasi Keluar</th>
                      <th className={ui.th}>Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F9E6A8]/60">
                    {salesHistory.map((trx) => (
                      <tr key={trx.id} className="hover:bg-cream/20">
                        <td className={`${ui.td} font-semibold`}>{trx.id}</td>
                        <td className={ui.td}>{formatDate(trx.date)}</td>
                        <td className={`${ui.td} font-bold text-[#4D2A00]`}>{trx.item_name}</td>
                        <td className={ui.td}>
                          <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                            -{formatQty(trx.quantity, trx.unit)}
                          </span>
                        </td>
                        <td className={ui.td}>{trx.buyer || trx.destination || '-'}</td>
                        <td className={ui.td}>{trx.location}</td>
                        <td className={ui.td}>{trx.recorded_by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: CATAT PENJUALAN PRODUK */}
      {saleModalOpen && selectedProduct && (
        <Modal title="Catat Penjualan Produk" onClose={() => setSaleModalOpen(false)}>
          <form onSubmit={handleSubmitSale} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#4D2A00]/70">Pilih Produk Jadi</label>
              <select
                className={`${ui.input} mt-1 w-full`}
                value={selectedProduct.id}
                onChange={(e) => {
                  const found = products.find((p) => p.id === Number(e.target.value));
                  if (found) setSelectedProduct(found);
                }}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                    {p.name} (Sisa: {p.quantity} {p.unit}) - {formatRupiah(p.price)}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-lg bg-cream/40 p-3 text-xs text-[#4D2A00]">
              <div className="flex justify-between">
                <span>Stok Etalase Tersedia:</span>
                <b>
                  {selectedProduct.quantity} {selectedProduct.unit}
                </b>
              </div>
              <div className="flex justify-between mt-1">
                <span>Harga Satuan:</span>
                <b>{formatRupiah(selectedProduct.price)}</b>
              </div>
            </div>

            <FormField
              label={`Jumlah Terjual (${selectedProduct.unit})`}
              type="number"
              min="1"
              max={selectedProduct.quantity}
              required
              value={saleQty}
              onChange={(e) => setSaleQty(e.target.value)}
            />

            <div className="flex justify-between items-center rounded-lg border border-[#F9E6A8] bg-white p-3 text-sm">
              <span className="font-medium text-[#4D2A00]">Total Tagihan:</span>
              <span className="text-lg font-bold text-[#CC6F00]">
                {formatRupiah((Number(saleQty) || 0) * (selectedProduct.price || 0))}
              </span>
            </div>

            <FormField
              label="Nama Pembeli / Pelanggan (Opsional)"
              placeholder="cth: Bu Rini / Kafe Senja"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
            />

            {/* Checkbox Pengiriman */}
            <div className="rounded-lg border border-cream p-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#4D2A00]">
                <input
                  type="checkbox"
                  checked={isDelivery}
                  onChange={(e) => setIsDelivery(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                Kirim melalui Staf Pengiriman
              </label>
              {isDelivery && (
                <div className="mt-3">
                  <FormField
                    label="Alamat / Tujuan Pengiriman"
                    required={isDelivery}
                    placeholder="cth: Toko Maju Jaya, Jl. Sudirman No. 12"
                    value={deliveryDestination}
                    onChange={(e) => setDeliveryDestination(e.target.value)}
                  />
                  <p className="mt-1 text-[11px] text-[#4D2A00]/70">
                    Sistem akan otomatis membuat kartu tugas di menu <b>Pengiriman &amp; Penataan</b>.
                  </p>
                </div>
              )}
            </div>

            {saleError && <p className="text-xs font-semibold text-red-600">{saleError}</p>}

            <div className="flex justify-end gap-2 pt-2 border-t border-cream">
              <Button type="button" variant="outline" onClick={() => setSaleModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmittingSale}>
                {isSubmittingSale ? 'Memproses...' : 'Konfirmasi & Potong Stok'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: TAMBAH PRODUK JADI */}
      {addProductModalOpen && (
        <Modal title="Tambah Produk Jadi ke Etalase" onClose={() => setAddProductModalOpen(false)}>
          <form onSubmit={handleSubmitProduct} className="space-y-3">
            <FormField
              label="Nama Produk"
              required
              placeholder="cth: Donat Cokelat Meses"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />

            <FormField
              label="Lokasi Etalase"
              placeholder="cth: Etalase Depan A1"
              value={newProduct.location}
              onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Harga Jual (Rp)"
                type="number"
                required
                placeholder="cth: 15000"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
              <FormField
                label="Stok Awal"
                type="number"
                required
                placeholder="cth: 20"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Satuan"
                placeholder="pcs / pack / kotak"
                value={newProduct.unit}
                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
              />
              <FormField
                label="Batas Peringatan Stok Menipis"
                type="number"
                placeholder="10"
                value={newProduct.min_stock}
                onChange={(e) => setNewProduct({ ...newProduct, min_stock: e.target.value })}
              />
            </div>

            {productError && <p className="text-xs font-semibold text-red-600">{productError}</p>}

            <div className="flex justify-end gap-2 pt-2 border-t border-cream">
              <Button type="button" variant="outline" onClick={() => setAddProductModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmittingProduct}>
                {isSubmittingProduct ? 'Menyimpan...' : 'Simpan Produk'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <Toast message={toast} />
    </div>
  );
}
