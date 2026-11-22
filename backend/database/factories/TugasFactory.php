<?php

namespace Database\Factories;

use App\Models\Tugas;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tugas>
 */
class TugasFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $jenis = fake()->randomElement(['Pengiriman', 'Penataan']);

        return [
            'user_id' => User::factory(),
            'jenis' => $jenis,
            'judul' => fake()->sentence(4),
            'detail' => fake()->sentence(6),
            'status' => fake()->randomElement(['Baru', 'Diproses', 'Selesai']),
            'penerima' => null,
            'catatan' => null,
            'log' => null,
        ];
    }
}
