<?php

namespace Database\Seeders;

use App\Models\Tugas;
use App\Models\User;
use Illuminate\Database\Seeder;

class TugasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $andi = User::where('username', 'andi')->first();
        $dewi = User::where('username', 'dewi')->first();

        $tugas = [
            [
                'id' => 101,
                'user_id' => $andi?->id,
                'jenis' => 'Pengiriman',
                'judul' => 'Kirim 24 Roti Cokelat',
                'detail' => 'Tujuan: Toko Maju Jaya',
                'status' => 'Baru',
                'penerima' => null,
                'catatan' => null,
                'log' => '',
            ],
            [
                'id' => 102,
                'user_id' => $andi?->id,
                'jenis' => 'Pengiriman',
                'judul' => 'Kirim 10 Kue Keju',
                'detail' => 'Tujuan: Kafe Senja',
                'status' => 'Baru',
                'penerima' => null,
                'catatan' => null,
                'log' => '',
            ],
            [
                'id' => 103,
                'user_id' => $dewi?->id,
                'jenis' => 'Penataan',
                'judul' => 'Tata 40 Roti Tawar',
                'detail' => 'Lokasi: Etalase rak 2',
                'status' => 'Diproses',
                'penerima' => null,
                'catatan' => 'Mulai ditata',
                'log' => '07 Okt 2026 · Mulai ditata',
            ],
            [
                'id' => 104,
                'user_id' => $andi?->id,
                'jenis' => 'Pengiriman',
                'judul' => 'Kirim 12 Brownies',
                'detail' => 'Tujuan: Bu Rini',
                'status' => 'Selesai',
                'penerima' => 'Bu Rini',
                'catatan' => null,
                'log' => '06 Okt 2026 · Diterima Bu Rini',
            ],
        ];

        foreach ($tugas as $item) {
            Tugas::updateOrCreate(
                ['id' => $item['id']],
                $item
            );
        }
    }
}
