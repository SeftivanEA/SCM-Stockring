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
     * Tampilkan data ringkasan / statistik untuk Dashboard.
     */
    public function summary()
    {
        $totalItems = Item::count();
        $totalBarangMentah = Item::where('jenis', 'mentah')->count();
        $totalBarangJadi = Item::where('jenis', 'jadi')->count();
        $totalGudang = Gudang::count();

        // Stok menipis
        $lowStockItems = Item::with('gudang')
            ->whereColumn('stok', '<=', 'stok_minimum')
            ->orderBy('stok', 'asc')
            ->take(10)
            ->get();

        // Transaksi terbaru
        $recentTransactions = Transaksi::with(['details.item', 'user'])
            ->latest('tanggal_transaksi')
            ->latest('id')
            ->take(5)
            ->get();

        // Statistik transaksi
        $totalTrxMasuk = Transaksi::where('tipe', 'masuk')->count();
        $totalTrxKeluar = Transaksi::where('tipe', 'keluar')->count();
        $nominalMasuk = Transaksi::where('tipe', 'masuk')->sum('total_harga');
        $nominalKeluar = Transaksi::where('tipe', 'keluar')->sum('total_harga');

        return response()->json([
            'status' => 'success',
            'data' => [
                'cards' => [
                    'total_items' => $totalItems,
                    'total_barang_mentah' => $totalBarangMentah,
                    'total_barang_jadi' => $totalBarangJadi,
                    'total_gudang' => $totalGudang,
                    'low_stock_count' => $lowStockItems->count(),
                    'total_transaksi_masuk' => $totalTrxMasuk,
                    'total_transaksi_keluar' => $totalTrxKeluar,
                    'nominal_transaksi_masuk' => (float) $nominalMasuk,
                    'nominal_transaksi_keluar' => (float) $nominalKeluar,
                ],
                'low_stock_items' => $lowStockItems,
                'recent_transactions' => $recentTransactions,
            ]
        ]);
    }
}

