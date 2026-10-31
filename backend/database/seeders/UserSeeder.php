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
            [
                'name' => 'Budi',
                'username' => 'budi',
                'email' => 'budi@stockring.local',
                'password' => Hash::make('password'),
                'role' => 'pemilik',
                'divisi_id' => null,
            ],
            [
                'name' => 'Rina',
                'username' => 'rina',
                'email' => 'rina@stockring.local',
                'password' => Hash::make('password'),
                'role' => 'pendataan',
                'divisi_id' => $divisiMap['Pendataan'] ?? null,
            ],
            [
                'name' => 'Dewi',
                'username' => 'dewi',
                'email' => 'dewi@stockring.local',
                'password' => Hash::make('password'),
                'role' => 'penataan',
                'divisi_id' => $divisiMap['Penataan'] ?? null,
            ],
            [
                'name' => 'Andi',
                'username' => 'andi',
                'email' => 'andi@stockring.local',
                'password' => Hash::make('password'),
                'role' => 'pengiriman',
                'divisi_id' => $divisiMap['Pengiriman'] ?? null,
            ],
            [
                'name' => 'Sari',
                'username' => 'sari',
                'email' => 'sari@stockring.local',
                'password' => Hash::make('password'),
                'role' => 'audit',
                'divisi_id' => $divisiMap['Audit'] ?? null,
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
