<?php

namespace Database\Seeders;

use App\Models\Divisi;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisiMap = Divisi::pluck('id', 'nama');

        $users = [
            // Pemilik / Manajer
            [
                'name' => 'Budi Pratama Santoso',
                'username' => 'budi',
                'email' => 'budi.santoso@stockring.local',
                'password' => Hash::make('password'),
                'role' => 'pemilik',
                'divisi_id' => null,
            ],
            // Divisi Pendataan
            [
                'name' => 'Rina Marlina',
                'username' => 'rina',
                'email' => 'rina.marlina@stockring.local',
                'password' => Hash::make('password'),
                'role' => 'pendataan',
                'divisi_id' => $divisiMap['Pendataan'] ?? null,
            ],
            [
                'name' => 'Fajar Nugroho',
                'username' => 'fajar.nugroho',
                'email' => 'fajar.nugroho@stockring.local',
                'password' => Hash::make('password'),
                'role' => 'pendataan',
                'divisi_id' => $divisiMap['Pendataan'] ?? null,
            ],
            // Divisi Penataan
            [
                'name' => 'Dewi Lestari',
                'username' => 'dewi',
                'email' => 'dewi.lestari@stockring.local',
                'password' => Hash::make('password'),
                'role' => 'penataan',
                'divisi_id' => $divisiMap['Penataan'] ?? null,
            ],
            [
                'name' => 'Siti Rahmawati',
                'username' => 'siti.rahmawati',
                'email' => 'siti.rahmawati@stockring.local',
                'password' => Hash::make('password'),
                'role' => 'penataan',
                'divisi_id' => $divisiMap['Penataan'] ?? null,
            ],
            // Divisi Pengiriman
            [
                'name' => 'Andi Wijaya Saputra',
                'username' => 'andi',
                'email' => 'andi.wijaya@stockring.local',
                'password' => Hash::make('password'),
                'role' => 'pengiriman',
                'divisi_id' => $divisiMap['Pengiriman'] ?? null,
            ],
            [
                'name' => 'Rizky Maulana',
                'username' => 'rizky.maulana',
                'email' => 'rizky.maulana@stockring.local',
                'password' => Hash::make('password'),
                'role' => 'pengiriman',
                'divisi_id' => $divisiMap['Pengiriman'] ?? null,
            ],
            // Divisi Audit
            [
                'name' => 'Sari Indah Permata',
                'username' => 'sari',
                'email' => 'sari.permata@stockring.local',
                'password' => Hash::make('password'),
                'role' => 'audit',
                'divisi_id' => $divisiMap['Audit'] ?? null,
            ],
            // Divisi Kustom (Quality Control & Pengemasan -> Role 'staf')
            [
                'name' => 'Dimas Wahyu Fauzi',
                'username' => 'dimas.fauzi',
                'email' => 'dimas.fauzi@stockring.local',
                'password' => Hash::make('password'),
                'role' => 'staf',
                'divisi_id' => $divisiMap['Quality Control'] ?? null,
            ],
            [
                'name' => 'Nurul Hidayah',
                'username' => 'nurul.hidayah',
                'email' => 'nurul.hidayah@stockring.local',
                'password' => Hash::make('password'),
                'role' => 'staf',
                'divisi_id' => $divisiMap['Pengemasan'] ?? null,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['username' => $userData['username']],
                $userData
            );
        }
    }
}
