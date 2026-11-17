<?php

namespace Database\Seeders;

use App\Models\Gudang;
use App\Models\Item;
use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use App\Models\User;
use Illuminate\Database\Seeder;

class StockSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Gudang
        $gudangBahan = Gudang::firstOrCreate(
            ['nama_gudang' => 'Gudang Bahan Baku'],
            [
                'lokasi' => 'Blok A - Sayap Barat',
                'jenis' => 'utama',
                'keterangan' => 'Penyimpanan bahan mentah dan persediaan utama'
            ]
        );

        $gudangProduksi = Gudang::firstOrCreate(
            ['nama_gudang' => 'Gudang Produksi'],
            [
                'lokasi' => 'Blok B - Lantai 1',
                'jenis' => 'produksi',
                'keterangan' => 'Penyimpanan bahan setengah jadi dan transit'
            ]
        );

        $etalase = Gudang::firstOrCreate(
            ['nama_gudang' => 'Etalase Toko Utama'],
            [
                'lokasi' => 'Area Toko Depan',
                'jenis' => 'etalase',
                'keterangan' => 'Display dan stok produk jadi siap jual'
            ]
        );

        // 2. Items Mentah
        $tepung = Item::firstOrCreate(
            ['kode_barang' => 'MNT-TPG01'],
            [
                'nama_barang' => 'Tepung Terigu Segitiga Biru',
                'jenis' => 'mentah',
                'gudang_id' => $gudangBahan->id,
                'stok' => 45,
                'stok_minimum' => 10,
                'satuan' => 'kg',
                'harga_beli' => 12000,
                'harga_jual' => 0,
                'deskripsi' => 'Tepung terigu protein sedang untuk adonan roti'
            ]
        );

        $gula = Item::firstOrCreate(
            ['kode_barang' => 'MNT-GLA01'],
            [
                'nama_barang' => 'Gula Pasir Kristal Putih',
                'jenis' => 'mentah',
                'gudang_id' => $gudangBahan->id,
                'stok' => 30,
                'stok_minimum' => 10,
                'satuan' => 'kg',
                'harga_beli' => 16000,
                'harga_jual' => 0,
                'deskripsi' => 'Gula pasir premium untuk pemanis olahan'
            ]
        );

        $mentega = Item::firstOrCreate(
            ['kode_barang' => 'MNT-MTG01'],
            [
                'nama_barang' => 'Mentega Margarin Spesial',
                'jenis' => 'mentah',
                'gudang_id' => $gudangBahan->id,
                'stok' => 3, // Menipis
                'stok_minimum' => 8,
                'satuan' => 'kg',
                'harga_beli' => 28000,
                'harga_jual' => 0,
                'deskripsi' => 'Margarin serbaguna'
            ]
        );

        // 3. Items Jadi
        $rotiTawar = Item::firstOrCreate(
            ['kode_barang' => 'JDI-ROTI01'],
            [
                'nama_barang' => 'Roti Tawar Gandum Kupas',
                'jenis' => 'jadi',
                'gudang_id' => $etalase->id,
                'stok' => 25,
                'stok_minimum' => 5,
                'satuan' => 'bungkus',
                'harga_beli' => 8000,
                'harga_jual' => 16500,
                'deskripsi' => 'Roti tawar gandum kupas kemasan plastik'
            ]
        );

        $donat = Item::firstOrCreate(
            ['kode_barang' => 'JDI-DONT01'],
            [
                'nama_barang' => 'Donat Cokelat Meses Klasik',
                'jenis' => 'jadi',
                'gudang_id' => $etalase->id,
                'stok' => 35,
                'stok_minimum' => 10,
                'satuan' => 'pcs',
                'harga_beli' => 2500,
                'harga_jual' => 6000,
                'deskripsi' => 'Donat lembut bertabur cokelat meses'
            ]
        );

        $croissant = Item::firstOrCreate(
            ['kode_barang' => 'JDI-CRST01'],
            [
                'nama_barang' => 'French Butter Croissant',
                'jenis' => 'jadi',
                'gudang_id' => $etalase->id,
                'stok' => 4, // Menipis
                'stok_minimum' => 8,
                'satuan' => 'pcs',
                'harga_beli' => 9000,
                'harga_jual' => 22000,
                'deskripsi' => 'Croissant renyah berlapis butter asli'
            ]
        );

        // 4. Transaksi Contoh (Masuk & Keluar)
        $user = User::first();
        $userId = $user ? $user->id : null;

        // Transaksi Masuk (Restok)
        $trxMasuk = Transaksi::firstOrCreate(
            ['kode_transaksi' => 'TRX-IN-SAMPLE001'],
            [
                'tipe' => 'masuk',
                'tanggal_transaksi' => now()->toDateString(),
                'total_harga' => (20 * 12000) + (10 * 16000),
                'user_id' => $userId,
                'catatan' => 'Restok berkala bahan baku tepung dan gula'
            ]
        );

        TransaksiDetail::firstOrCreate(
            ['transaksi_id' => $trxMasuk->id, 'item_id' => $tepung->id],
            ['jumlah' => 20, 'harga_satuan' => 12000, 'subtotal' => 240000]
        );

        TransaksiDetail::firstOrCreate(
            ['transaksi_id' => $trxMasuk->id, 'item_id' => $gula->id],
            ['jumlah' => 10, 'harga_satuan' => 16000, 'subtotal' => 160000]
        );

        // Transaksi Keluar (Penjualan)
        $trxKeluar = Transaksi::firstOrCreate(
            ['kode_transaksi' => 'TRX-OUT-SAMPLE001'],
            [
                'tipe' => 'keluar',
                'tanggal_transaksi' => now()->toDateString(),
                'total_harga' => (5 * 16500) + (10 * 6000),
                'user_id' => $userId,
                'catatan' => 'Penjualan offline toko etalase pagi'
            ]
        );

        TransaksiDetail::firstOrCreate(
            ['transaksi_id' => $trxKeluar->id, 'item_id' => $rotiTawar->id],
            ['jumlah' => 5, 'harga_satuan' => 16500, 'subtotal' => 82500]
        );

        TransaksiDetail::firstOrCreate(
            ['transaksi_id' => $trxKeluar->id, 'item_id' => $donat->id],
            ['jumlah' => 10, 'harga_satuan' => 6000, 'subtotal' => 60000]
        );
    }
}

