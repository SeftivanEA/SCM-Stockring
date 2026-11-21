<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TransaksiController extends Controller
{
        /**
     * Peran yang boleh mencatat transaksi keluar (penjualan). Sesuai UC4: hanya Pemilik.
     * Transaksi masuk (restok/pembelian) tetap boleh untuk Pemilik dan Pendataan (UC3).
     */
    private const ROLE_CATAT_KELUAR = ['pemilik'];
    /**
     * Tampilkan riwayat transaksi dengan filter & pencarian.
     */
    public function index(Request $request)
    {
        $query = Transaksi::with(['details.item', 'user'])->latest('tanggal_transaksi')->latest('id');

        // Filter tipe (masuk / keluar)
        if ($request->filled('tipe')) {
            $query->where('tipe', $request->tipe);
        }

        // Filter tanggal
        if ($request->filled('start_date')) {
            $query->whereDate('tanggal_transaksi', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('tanggal_transaksi', '<=', $request->end_date);
        }

        // Filter pencarian kode transaksi atau catatan
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_transaksi', 'like', "%{$search}%")
                  ->orWhere('catatan', 'like', "%{$search}%")
                  ->orWhereHas('details.item', function ($sub) use ($search) {
                      $sub->where('nama_barang', 'like', "%{$search}%")
                          ->orWhere('kode_barang', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = $request->get('per_page', 15);
        $transaksis = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $transaksis
        ]);
    }

    /**
     * Catat transaksi baru dan mutasi stok otomatis (Atomic Transaction).
     */
    public function store(Request $request)
    {
                if ($request->input('tipe') === 'keluar'
            && ! in_array($request->user()->role, self::ROLE_CATAT_KELUAR, true)) {
            abort(403, 'Hanya Pemilik yang dapat mencatat transaksi keluar (penjualan).');
        }
        $request->validate([
            'tipe' => 'required|in:masuk,keluar',
            'tanggal_transaksi' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.harga_satuan' => 'nullable|numeric|min:0',
            'catatan' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
        ]);

        return DB::transaction(function () use ($request) {
            $tipe = $request->tipe;
            $dateStr = date('Ymd', strtotime($request->tanggal_transaksi));
            $prefix = ($tipe === 'masuk') ? 'TRX-IN' : 'TRX-OUT';
            $kodeTransaksi = $prefix . '-' . $dateStr . '-' . strtoupper(Str::random(5));

            $totalHarga = 0;

            // 1. Buat Header Transaksi
            $transaksi = Transaksi::create([
                'kode_transaksi' => $kodeTransaksi,
                'tipe' => $tipe,
                'tanggal_transaksi' => $request->tanggal_transaksi,
                'user_id' => auth()->id() ?? $request->user_id,
                'catatan' => $request->catatan,
                'total_harga' => 0,
            ]);

            // 2. Proses tiap item transaksi & mutasi stok
            foreach ($request->items as $itemData) {
                // Lock baris item untuk mencegah race condition
                $item = Item::lockForUpdate()->findOrFail($itemData['item_id']);
                $jumlah = (int) $itemData['jumlah'];

                if ($tipe === 'keluar') {
                    // Validasi kecukupan stok
                    if ($item->stok < $jumlah) {
                        throw ValidationException::withMessages([
                            'items' => ["Stok barang '{$item->nama_barang}' tidak mencukupi. Sisa stok: {$item->stok}, permintaan: {$jumlah}."]
                        ]);
                    }

                    // Potong stok
                    $item->decrement('stok', $jumlah);

                    // Tentukan harga satuan (dari input atau dari master item)
                    $hargaSatuan = isset($itemData['harga_satuan']) && $itemData['harga_satuan'] !== null
                        ? (float) $itemData['harga_satuan']
                        : (float) $item->harga_jual;
                } else {
                    // Tambah stok (Barang masuk / Pembelian / Restok)
                    $item->increment('stok', $jumlah);

                    $hargaSatuan = isset($itemData['harga_satuan']) && $itemData['harga_satuan'] !== null
                        ? (float) $itemData['harga_satuan']
                        : (float) $item->harga_beli;
                }

                $subtotal = $hargaSatuan * $jumlah;
                $totalHarga += $subtotal;

                // Simpan rincian detail transaksi
                TransaksiDetail::create([
                    'transaksi_id' => $transaksi->id,
                    'item_id' => $item->id,
                    'jumlah' => $jumlah,
                    'harga_satuan' => $hargaSatuan,
                    'subtotal' => $subtotal,
                ]);
            }

            // 3. Update total harga transaksi
            $transaksi->update(['total_harga' => $totalHarga]);

            return response()->json([
                'status' => 'success',
                'message' => $tipe === 'masuk'
                    ? 'Transaksi masuk berhasil dicatat, stok barang berhasil ditambahkan.'
                    : 'Transaksi keluar berhasil dicatat, stok barang berhasil dipotong.',
                'data' => $transaksi->load('details.item')
            ], 201);
        });
    }

    /**
     * Tampilkan detail transaksi.
     */
    public function show(string $id)
    {
        $transaksi = Transaksi::with(['details.item.gudang', 'user'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $transaksi
        ]);
    }
}

