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
        $rizky = User::where('username', 'rizky.maulana')->first();
        $dewi = User::where('username', 'dewi')->first();
        $siti = User::where('username', 'siti.rahmawati')->first();

        $tugas = [
            [
                'id' => 101,
                'user_id' => $andi?->id,
                'jenis' => 'Pengiriman',
                'judul' => 'Kirim 50 Box Croissant Mentega & Danish Pastry',
                'detail' => 'Tujuan: Café Kopi Senja Utama, Ruko Grand Boulevard Blok B-08, Surabaya',
                'status' => 'Baru',
                'penerima' => null,
                'catatan' => null,
                'log' => '',
            ],
            [
                'id' => 102,
                'user_id' => $rizky?->id,
                'jenis' => 'Pengiriman',
                'judul' => 'Kirim 35 Paket Roti Tawar Gandum & Sourdough',
                'detail' => 'Tujuan: Supermarket Rejeki Fresh Market, Jl. Basuki Rahmat No. 112',
                'status' => 'Diproses',
                'penerima' => null,
                'catatan' => 'Kurir berangkat menggunakan pick-up pendingin (Van-02)',
                'log' => '12 Nov 2026 · Diproses · Kurir berangkat menggunakan pick-up pendingin (Van-02)',
            ],
            [
                'id' => 103,
                'user_id' => $dewi?->id,
                'jenis' => 'Penataan',
                'judul' => 'Penataan & Rotasi 80 Pcs Roti Manis & Choco Bun',
                'detail' => 'Lokasi: Etalase Utama Rak Depan Lantai 1 (Toko Pusat)',
                'status' => 'Diproses',
                'penerima' => null,
                'catatan' => 'Tata sesuai standar FIFO dan cek label tanggal kedaluwarsa',
                'log' => '13 Nov 2026 · Mulai ditata · Tata sesuai standar FIFO dan cek label tanggal kedaluwarsa',
            ],
            [
                'id' => 104,
                'user_id' => $andi?->id,
                'jenis' => 'Pengiriman',
                'judul' => 'Kirim 20 Loyang Brownies Panggang Almond Premium',
                'detail' => 'Tujuan: Ibu Hj. Sri Mulyani (Pesanan Acara Arisan), Jl. Cendrawasih No. 24',
                'status' => 'Selesai',
                'penerima' => 'Ibu Hj. Sri Mulyani',
                'catatan' => 'Pesanan diterima dalam kondisi hangat dan pembayaran tunai lunas',
                'log' => "11 Nov 2026 · Diproses\n11 Nov 2026 · Diterima Ibu Hj. Sri Mulyani · Pesanan diterima dalam kondisi hangat dan pembayaran tunai lunas",
            ],
            [
                'id' => 105,
                'user_id' => $siti?->id,
                'jenis' => 'Penataan',
                'judul' => 'Display Produk Baru Muffin Cokelat Lumer & Baguette',
                'detail' => 'Lokasi: Showcase Kaca Tengah Suhu Terkontrol (Dekat Meja Kasir)',
                'status' => 'Baru',
                'penerima' => null,
                'catatan' => null,
                'log' => '',
            ],
            [
                'id' => 106,
                'user_id' => $rizky?->id,
                'jenis' => 'Pengiriman',
                'judul' => 'Kirim 15 Box Aneka Tartlette & Pie Buah Segar',
                'detail' => 'Tujuan: Hotel Bumi Heritage, Ball Room Lt. 3, Jl. Pahlawan No. 70',
                'status' => 'Selesai',
                'penerima' => 'Chef Aris (Pastry Dept)',
                'catatan' => 'Diterima langsung oleh Chef Pastry, suhu chiller sesuai standar',
                'log' => "10 Nov 2026 · Diproses\n10 Nov 2026 · Diterima Chef Aris (Pastry Dept) · Diterima langsung oleh Chef Pastry, suhu chiller sesuai standar",
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
