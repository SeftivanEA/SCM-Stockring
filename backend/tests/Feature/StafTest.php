<?php

namespace Tests\Feature;

use App\Models\Divisi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StafTest extends TestCase
{
    use RefreshDatabase;

    public function test_pemilik_can_list_staff(): void
    {
        $pemilik = User::factory()->create(['role' => 'pemilik']);
        User::factory()->count(2)->create(['role' => 'pendataan']);
        Sanctum::actingAs($pemilik);

        $response = $this->getJson('/api/staf');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_pemilik_can_create_staff(): void
    {
        $pemilik = User::factory()->create(['role' => 'pemilik']);
        $divisi = Divisi::factory()->create(['nama' => 'Penataan']);
        Sanctum::actingAs($pemilik);

        $response = $this->postJson('/api/staf', [
            'nama' => 'Roni Saputra',
            'username' => 'roni',
            'divisi_id' => $divisi->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.username', 'roni')
            ->assertJsonPath('data.divisi', 'Penataan');

        $this->assertDatabaseHas('users', ['username' => 'roni']);
    }

    public function test_pemilik_can_assign_staff_division(): void
    {
        $pemilik = User::factory()->create(['role' => 'pemilik']);
        $divisi = Divisi::factory()->create(['nama' => 'Pengiriman']);
        $staf = User::factory()->create(['role' => 'pendataan']);
        Sanctum::actingAs($pemilik);

        $response = $this->putJson('/api/staf/'.$staf->id.'/divisi', [
            'divisi_id' => $divisi->id,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.divisi', 'Pengiriman');

        $this->assertDatabaseHas('users', [
            'id' => $staf->id,
            'divisi_id' => $divisi->id,
            'role' => 'pengiriman',
        ]);
    }

    public function test_non_pemilik_cannot_access_staff_routes(): void
    {
        $staf = User::factory()->create(['role' => 'pendataan']);
        Sanctum::actingAs($staf);

        $response = $this->getJson('/api/staf');

        $response->assertStatus(403);
    }
}
