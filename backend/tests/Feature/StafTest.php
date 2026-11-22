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
            'password' => 'secret123',
            'divisi_id' => $divisi->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.username', 'roni')
            ->assertJsonPath('data.divisi', 'Penataan')
            ->assertJsonPath('data.role', 'penataan');

        $this->assertDatabaseHas('users', ['username' => 'roni']);
    }

    public function test_create_staff_requires_password_min_6_chars(): void
    {
        $pemilik = User::factory()->create(['role' => 'pemilik']);
        Sanctum::actingAs($pemilik);

        $responseNoPass = $this->postJson('/api/staf', [
            'nama' => 'Roni Saputra',
            'username' => 'roni_nopass',
        ]);
        $responseNoPass->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        $responseShortPass = $this->postJson('/api/staf', [
            'nama' => 'Roni Saputra',
            'username' => 'roni_short',
            'password' => '12345',
        ]);
        $responseShortPass->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_create_staff_with_custom_division_assigns_staf_role(): void
    {
        $pemilik = User::factory()->create(['role' => 'pemilik']);
        $customDivisi = Divisi::factory()->create(['nama' => 'Logistik Tambahan']);
        Sanctum::actingAs($pemilik);

        $response = $this->postJson('/api/staf', [
            'nama' => 'Bambang',
            'username' => 'bambang',
            'password' => 'secret123',
            'divisi_id' => $customDivisi->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.role', 'staf')
            ->assertJsonPath('data.roleLabel', 'Staf');

        $this->assertDatabaseHas('users', [
            'username' => 'bambang',
            'role' => 'staf',
        ]);
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

    public function test_assign_custom_division_changes_staff_role_to_staf(): void
    {
        $pemilik = User::factory()->create(['role' => 'pemilik']);
        $customDivisi = Divisi::factory()->create(['nama' => 'Operasional Khusus']);
        $auditStaf = User::factory()->create(['role' => 'audit']);
        Sanctum::actingAs($pemilik);

        $response = $this->putJson('/api/staf/'.$auditStaf->id.'/divisi', [
            'divisi_id' => $customDivisi->id,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.role', 'staf')
            ->assertJsonPath('data.roleLabel', 'Staf');

        $this->assertDatabaseHas('users', [
            'id' => $auditStaf->id,
            'divisi_id' => $customDivisi->id,
            'role' => 'staf',
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
