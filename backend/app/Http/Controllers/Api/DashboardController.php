<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gudang;
use App\Models\Item;
use App\Models\Transaksi;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Peran yang boleh melihat data transaksi (sama dengan akses baca transaksi di routes/api.php).
     */
    private const ROLE_LIHAT_TRANSAKSI = ['pemilik', 'pendataan', 'audit'];

    /**
     * Tampilkan data ringkasan / statistik untuk Dashboard.
     */
    public function summary(Request $request)
    {
        $bolehLihatTransaksi = in_array($request->user()->role, self::ROLE_LIHAT_TRANSAKSI, true);

        // Ringkasan stok: aman untuk semua peran yang login.
        $cards = [
            'total_items' => Item::count(),
            'total_barang_mentah' => Item::where('jenis', 'mentah')->count(),
            'total_barang_jadi' => Item::where('jenis', 'jadi')->count(),
            'total_gudang' => Gudang::count(),
            // Dihitung terpisah agar tidak ikut terbatas oleh take(10) di bawah.
            'low_stock_count' => Item::whereColumn('stok', '<=', 'stok_minimum')->count(),
        ];

        // Hanya kolom yang dipakai tampilan (tanpa harga beli/jual).
        $lowStockItems = Item::with('gudang')
            ->whereColumn('stok', '<=', 'stok_minimum')
            ->orderBy('stok', 'asc')
            ->take(10)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'nama_barang' => $item->nama_barang,
                'stok' => $item->stok,
                'satuan' => $item->satuan,
                'stok_minimum' => $item->stok_minimum,
                'gudang' => ['nama_gudang' => $item->gudang?->nama_gudang],
            ]);

        // Data transaksi (termasuk nominal rupiah) hanya untuk peran yang berhak.
        $recentTransactions = [];
        if ($bolehLihatTransaksi) {
            $cards += [
                'total_transaksi_masuk' => Transaksi::where('tipe', 'masuk')->count(),
                'total_transaksi_keluar' => Transaksi::where('tipe', 'keluar')->count(),
                'nominal_transaksi_masuk' => (float) Transaksi::where('tipe', 'masuk')->sum('total_harga'),
                'nominal_transaksi_keluar' => (float) Transaksi::where('tipe', 'keluar')->sum('total_harga'),
            ];

            $recentTransactions = Transaksi::with('details.item')
                ->latest('tanggal_transaksi')
                ->latest('id')
                ->take(5)
                ->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'cards' => $cards,
                'low_stock_items' => $lowStockItems,
                'recent_transactions' => $recentTransactions,
            ],
        ]);
    }
}