<?php

namespace Tests\Feature;

use App\Models\Tugas;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TugasTest extends TestCase
{
    use RefreshDatabase;

    public function test_staf_pengiriman_only_sees_pengiriman_tasks(): void
    {
        Tugas::factory()->count(2)->create(['jenis' => 'Pengiriman']);
        Tugas::factory()->count(3)->create(['jenis' => 'Penataan']);

        $stafPengiriman = User::factory()->create(['role' => 'pengiriman']);
        Sanctum::actingAs($stafPengiriman);

        $response = $this->getJson('/api/tugas');

        $response->assertOk()
            ->assertJsonCount(2, 'data');

        foreach ($response->json('data') as $item) {
            $this->assertSame('Pengiriman', $item['jenis']);
        }
    }

    public function test_staf_penataan_only_sees_penataan_tasks(): void
    {
        Tugas::factory()->count(2)->create(['jenis' => 'Pengiriman']);
        Tugas::factory()->count(3)->create(['jenis' => 'Penataan']);

        $stafPenataan = User::factory()->create(['role' => 'penataan']);
        Sanctum::actingAs($stafPenataan);

        $response = $this->getJson('/api/tugas');

        $response->assertOk()
            ->assertJsonCount(3, 'data');

        foreach ($response->json('data') as $item) {
            $this->assertSame('Penataan', $item['jenis']);
        }
    }

    public function test_pemilik_can_see_all_tasks_and_filter_by_jenis(): void
    {
        Tugas::factory()->count(2)->create(['jenis' => 'Pengiriman']);
        Tugas::factory()->count(3)->create(['jenis' => 'Penataan']);

        $pemilik = User::factory()->create(['role' => 'pemilik']);
        Sanctum::actingAs($pemilik);

        $responseAll = $this->getJson('/api/tugas');
        $responseAll->assertOk()->assertJsonCount(5, 'data');

        $responseFilter = $this->getJson('/api/tugas?jenis=Penataan');
        $responseFilter->assertOk()->assertJsonCount(3, 'data');
    }

    public function test_penataan_cannot_view_or_update_pengiriman_task(): void
    {
        $dewi = User::factory()->create(['role' => 'penataan']);
        $tugasPengiriman = Tugas::factory()->create([
            'jenis' => 'Pengiriman',
            'status' => 'Baru',
        ]);
        Sanctum::actingAs($dewi);

        $responseShow = $this->getJson('/api/tugas/'.$tugasPengiriman->id);
        $responseShow->assertStatus(403);

        $responsePatch = $this->patchJson('/api/tugas/'.$tugasPengiriman->id.'/status', [
            'status' => 'Diproses',
        ]);
        $responsePatch->assertStatus(403);
    }

    public function test_pengiriman_cannot_view_or_update_penataan_task(): void
    {
        $andi = User::factory()->create(['role' => 'pengiriman']);
        $tugasPenataan = Tugas::factory()->create([
            'jenis' => 'Penataan',
            'status' => 'Baru',
        ]);
        Sanctum::actingAs($andi);

        $responseShow = $this->getJson('/api/tugas/'.$tugasPenataan->id);
        $responseShow->assertStatus(403);

        $responsePatch = $this->patchJson('/api/tugas/'.$tugasPenataan->id.'/status', [
            'status' => 'Diproses',
        ]);
        $responsePatch->assertStatus(403);
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

    public function test_staf_pengiriman_can_update_task_status_to_diproses(): void
    {
        $staf = User::factory()->create(['role' => 'pengiriman']);
        $tugas = Tugas::factory()->create([
            'jenis' => 'Pengiriman',
            'status' => 'Baru',
        ]);
        Sanctum::actingAs($staf);

        $response = $this->patchJson('/api/tugas/'.$tugas->id.'/status', [
            'status' => 'Diproses',
            'catatan' => 'Sedang dalam perjalanan',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'Diproses');

        $this->assertDatabaseHas('tugas', [
            'id' => $tugas->id,
            'status' => 'Diproses',
        ]);
    }

    public function test_staf_pengiriman_can_complete_task_with_recipient_and_indonesian_log(): void
    {
        $staf = User::factory()->create(['role' => 'pengiriman']);
        $tugas = Tugas::factory()->create([
            'jenis' => 'Pengiriman',
            'status' => 'Diproses',
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

        $expectedDate = Carbon::now()->locale('id')->translatedFormat('d M Y');
        $this->assertStringContainsString($expectedDate, $response->json('data.log'));
        $this->assertStringContainsString('Diterima Pak Ahmad', $response->json('data.log'));
    }

    public function test_pengiriman_to_selesai_requires_penerima(): void
    {
        $staf = User::factory()->create(['role' => 'pengiriman']);
        $tugas = Tugas::factory()->create([
            'jenis' => 'Pengiriman',
            'status' => 'Diproses',
        ]);
        Sanctum::actingAs($staf);

        $response = $this->patchJson('/api/tugas/'.$tugas->id.'/status', [
            'status' => 'Selesai',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['penerima']);
    }

    public function test_cannot_update_completed_task(): void
    {
        $staf = User::factory()->create(['role' => 'pengiriman']);
        $tugas = Tugas::factory()->create([
            'jenis' => 'Pengiriman',
            'status' => 'Selesai',
            'penerima' => 'Pak Ahmad',
        ]);
        Sanctum::actingAs($staf);

        $response = $this->patchJson('/api/tugas/'.$tugas->id.'/status', [
            'status' => 'Diproses',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_invalid_status_transition_returns_422(): void
    {
        $staf = User::factory()->create(['role' => 'pengiriman']);
        $tugas = Tugas::factory()->create([
            'jenis' => 'Pengiriman',
            'status' => 'Baru',
        ]);
        Sanctum::actingAs($staf);

        $response = $this->patchJson('/api/tugas/'.$tugas->id.'/status', [
            'status' => 'Baru',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
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
