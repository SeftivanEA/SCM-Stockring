<?php

namespace Tests\Feature;

use App\Models\Divisi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DivisiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_divisions(): void
    {
        Divisi::factory()->count(3)->create();
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/divisi');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_pemilik_can_create_division(): void
    {
        $pemilik = User::factory()->create(['role' => 'pemilik']);
        Sanctum::actingAs($pemilik);

        $response = $this->postJson('/api/divisi', [
            'nama' => 'Logistik',
            'deskripsi' => 'Pengelolaan armada',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.nama', 'Logistik');

        $this->assertDatabaseHas('divisis', ['nama' => 'Logistik']);
    }

    public function test_non_pemilik_cannot_create_division(): void
    {
        $staf = User::factory()->create(['role' => 'pendataan']);
        Sanctum::actingAs($staf);

        $response = $this->postJson('/api/divisi', [
            'nama' => 'Logistik',
        ]);

        $response->assertStatus(403);
    }

    public function test_pemilik_can_delete_division(): void
    {
        $pemilik = User::factory()->create(['role' => 'pemilik']);
        $divisi = Divisi::factory()->create();
        Sanctum::actingAs($pemilik);

        $response = $this->deleteJson('/api/divisi/'.$divisi->id);

        $response->assertOk();
        $this->assertDatabaseMissing('divisis', ['id' => $divisi->id]);
    }
}
