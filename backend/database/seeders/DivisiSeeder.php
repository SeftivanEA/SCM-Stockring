<?php

namespace Database\Seeders;

use App\Models\Divisi;
use Illuminate\Database\Seeder;

class DivisiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisis = [
            [
                'nama' => 'Pendataan',
                'deskripsi' => 'Penerimaan, pencatatan stok bahan mentah, dan verifikasi fisik gudang',
            ],
            [
                'nama' => 'Penataan',
                'deskripsi' => 'Display, pengaturan etalase, dan rotasi stok produk jadi di toko',
            ],
            [
                'nama' => 'Pengiriman',
                'deskripsi' => 'Pemrosesan order keluar, distribusi barang, dan pengantaran ke pelanggan',
            ],
            [
                'nama' => 'Audit',
                'deskripsi' => 'Pemeriksaan stok berkala, audit kepatuhan, dan rekonsiliasi data inventaris',
            ],
            [
                'nama' => 'Quality Control',
                'deskripsi' => 'Pengawasan mutu bahan baku, standarisasi resep, dan inspeksi kelayakan produk',
            ],
            [
                'nama' => 'Pengemasan',
                'deskripsi' => 'Pengepakan produk segar, pemberian label batch/tanggal, dan segel kemasan',
            ],
        ];

        foreach ($divisis as $divisi) {
            Divisi::updateOrCreate(
                ['nama' => $divisi['nama']],
                ['deskripsi' => $divisi['deskripsi']]
            );
        }
    }
}
