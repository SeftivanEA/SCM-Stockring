<?php

namespace Tests\Feature;

use App\Models\Tugas;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TugasTest extends TestCase
{
    use RefreshDatabase;

    public function test_staf_pengiriman_can_list_tasks(): void
    {
        Tugas::factory()->count(3)->create(['jenis' => 'Pengiriman']);
        $staf = User::factory()->create(['role' => 'pengiriman']);
        Sanctum::actingAs($staf);

        $response = $this->getJson('/api/tugas');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_pemilik_can_create_task(): void
    {
        $pemilik = User::factory()->create(['role' => 'pemilik']);
        Sanctum::actingAs($pemilik);

        $response = $this->postJson('/api/tugas', [
            'jenis' => 'Pengiriman',
            'judul' => 'Kirim Paket Donat',
            'detail' => 'Tujuan: Toko Berkah',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.judul', 'Kirim Paket Donat')
            ->assertJsonPath('data.status', 'Baru');

        $this->assertDatabaseHas('tugas', ['judul' => 'Kirim Paket Donat']);
    }

    public function test_staf_pengiriman_can_update_task_status(): void
    {
        $staf = User::factory()->create(['role' => 'pengiriman']);
        $tugas = Tugas::factory()->create([
            'jenis' => 'Pengiriman',
            'status' => 'Baru',
        ]);
        Sanctum::actingAs($staf);

        $response = $this->patchJson('/api/tugas/'.$tugas->id.'/status', [
            'status' => 'Selesai',
            'penerima' => 'Pak Ahmad',
            'catatan' => 'Diterima dalam kondisi baik',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'Selesai')
            ->assertJsonPath('data.penerima', 'Pak Ahmad');

        $this->assertDatabaseHas('tugas', [
            'id' => $tugas->id,
            'status' => 'Selesai',
            'penerima' => 'Pak Ahmad',
        ]);
    }

    public function test_audit_staf_cannot_update_task_status(): void
    {
        $audit = User::factory()->create(['role' => 'audit']);
        $tugas = Tugas::factory()->create(['jenis' => 'Penataan']);
        Sanctum::actingAs($audit);

        $response = $this->patchJson('/api/tugas/'.$tugas->id.'/status', [
            'status' => 'Selesai',
        ]);

        $response->assertStatus(403);
    }
}
