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
            ['nama' => 'Pendataan', 'deskripsi' => 'Mencatat barang masuk & verifikasi fisik'],
            ['nama' => 'Penataan', 'deskripsi' => 'Menata barang di etalase'],
            ['nama' => 'Pengiriman', 'deskripsi' => 'Memproses pengiriman barang'],
            ['nama' => 'Audit', 'deskripsi' => 'Memeriksa data stok (hanya baca)'],
        ];

        foreach ($divisis as $divisi) {
            Divisi::updateOrCreate(
                ['nama' => $divisi['nama']],
                ['deskripsi' => $divisi['deskripsi']]
            );
        }
    }
}
