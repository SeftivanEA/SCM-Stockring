<?php

namespace Tests\Feature;

use App\Models\Gudang;
use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StokTest extends TestCase
{
    use RefreshDatabase;

    /** Buat pengguna dengan peran tertentu lalu login sebagai dia. */
        /** Buat pengguna dengan peran tertentu lalu login sebagai dia. */
    private function login(string $role): User
    {
        $user = User::factory()->create(['role' => $role]);

        Sanctum::actingAs($user);

        return $user;
    }

    private function buatItem(array $override = []): Item
    {
        return Item::create(array_merge([
            'kode_barang' => 'TEST-'.uniqid(),
            'nama_barang' => 'Item Uji',
            'jenis' => 'jadi',
            'stok' => 20,
            'stok_minimum' => 5,
            'satuan' => 'pcs',
            'harga_beli' => 4000,
            'harga_jual' => 10000,
        ], $override));
    }

    private function payloadTransaksi(string $tipe, int $itemId, int $jumlah): array
    {
        return [
            'tipe' => $tipe,
            'tanggal_transaksi' => now()->toDateString(),
            'items' => [['item_id' => $itemId, 'jumlah' => $jumlah]],
            'catatan' => 'Tes otomatis',
        ];
    }

    // ---------------------------------------------------------------
    // Wajib login
    // ---------------------------------------------------------------

    public function test_tamu_tanpa_login_ditolak_di_semua_endpoint_stok(): void
    {
        foreach (['/api/items', '/api/gudang', '/api/transaksi', '/api/dashboard/summary'] as $url) {
            $this->getJson($url)->assertStatus(401);
        }
    }

    // ---------------------------------------------------------------
    // Pemilik: akses penuh
    // ---------------------------------------------------------------

    public function test_pemilik_dapat_membuat_dan_melihat_gudang(): void
    {
        $this->login('pemilik');

        $this->postJson('/api/gudang', [
            'nama_gudang' => 'Gudang Uji Coba',
            'lokasi' => 'Lantai 2',
            'jenis' => 'utama',
            'keterangan' => 'Gudang untuk pengujian unit',
        ])->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.nama_gudang', 'Gudang Uji Coba');

        $this->getJson('/api/gudang')->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_pemilik_dapat_membuat_dan_memfilter_barang(): void
    {
        $this->login('pemilik');
        $gudang = Gudang::create(['nama_gudang' => 'Gudang Tes', 'jenis' => 'utama']);

        $this->postJson('/api/items', [
            'nama_barang' => 'Bahan Uji Coba',
            'jenis' => 'mentah',
            'gudang_id' => $gudang->id,
            'stok' => 50,
            'stok_minimum' => 10,
            'satuan' => 'kg',
            'harga_beli' => 15000,
            'harga_jual' => 0,
        ])->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.nama_barang', 'Bahan Uji Coba');

        $this->getJson('/api/items?jenis=mentah')->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_pemilik_transaksi_keluar_memotong_stok(): void
    {
        $this->login('pemilik');
        $item = $this->buatItem(['stok' => 20]);

        $this->postJson('/api/transaksi', $this->payloadTransaksi('keluar', $item->id, 8))
            ->assertStatus(201);

        $this->assertEquals(12, $item->fresh()->stok);
    }

    public function test_transaksi_keluar_ditolak_jika_stok_tidak_cukup(): void
    {
        $this->login('pemilik');
        $item = $this->buatItem(['stok' => 3]);

        $this->postJson('/api/transaksi', $this->payloadTransaksi('keluar', $item->id, 10))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['items']);

        $this->assertEquals(3, $item->fresh()->stok);
    }

    // ---------------------------------------------------------------
    // Pendataan (UC3): stok masuk boleh, penjualan dan gudang tidak
    // ---------------------------------------------------------------

    public function test_pendataan_dapat_mencatat_transaksi_masuk(): void
    {
        $this->login('pendataan');
        $item = $this->buatItem(['jenis' => 'mentah', 'stok' => 10]);

        $this->postJson('/api/transaksi', $this->payloadTransaksi('masuk', $item->id, 15))
            ->assertStatus(201);

        $this->assertEquals(25, $item->fresh()->stok);
    }

    public function test_pendataan_ditolak_mencatat_transaksi_keluar(): void
    {
        $this->login('pendataan');
        $item = $this->buatItem(['stok' => 20]);

        $this->postJson('/api/transaksi', $this->payloadTransaksi('keluar', $item->id, 5))
            ->assertStatus(403);

        $this->assertEquals(20, $item->fresh()->stok);
    }

    public function test_pendataan_dapat_menambah_barang_dan_membaca_riwayat(): void
    {
        $this->login('pendataan');
        $gudang = Gudang::create(['nama_gudang' => 'Gudang Tes', 'jenis' => 'utama']);

        $this->postJson('/api/items', [
            'nama_barang' => 'Barang Pendataan',
            'jenis' => 'mentah',
            'gudang_id' => $gudang->id,
            'stok' => 5,
            'stok_minimum' => 2,
            'satuan' => 'pcs',
            'harga_beli' => 1000,
            'harga_jual' => 0,
        ])->assertStatus(201);

        $this->getJson('/api/transaksi')->assertStatus(200);
    }

    public function test_pendataan_ditolak_membuat_gudang(): void
    {
        $this->login('pendataan');

        $this->postJson('/api/gudang', ['nama_gudang' => 'Uji', 'jenis' => 'utama'])
            ->assertStatus(403);
    }

    // ---------------------------------------------------------------
    // Audit: hanya membaca
    // ---------------------------------------------------------------

    public function test_audit_hanya_dapat_membaca_data_stok(): void
    {
        $this->login('audit');
        $item = $this->buatItem();

        $this->getJson('/api/items')->assertStatus(200);
        $this->getJson('/api/gudang')->assertStatus(200);
        $this->getJson('/api/transaksi')->assertStatus(200);

        $this->postJson('/api/gudang', ['nama_gudang' => 'Uji', 'jenis' => 'utama'])->assertStatus(403);
        $this->postJson('/api/items', ['nama_barang' => 'Uji', 'jenis' => 'mentah'])->assertStatus(403);
        $this->postJson('/api/transaksi', $this->payloadTransaksi('masuk', $item->id, 1))->assertStatus(403);
    }

    // ---------------------------------------------------------------
    // Peran lain: tidak boleh membaca data stok
    // ---------------------------------------------------------------

    public function test_penataan_ditolak_membaca_barang_tetapi_boleh_membuka_dashboard(): void
    {
        $this->login('penataan');

        $this->getJson('/api/items')->assertStatus(403);
        $this->getJson('/api/dashboard/summary')->assertStatus(200);
    }

    // ---------------------------------------------------------------
    // Dashboard: data keuangan hanya untuk peran yang berhak
    // ---------------------------------------------------------------

    public function test_dashboard_pemilik_memuat_data_transaksi_dan_nominal(): void
    {
        $this->login('pemilik');

        $this->getJson('/api/dashboard/summary')
            ->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'cards' => [
                        'total_items',
                        'total_barang_mentah',
                        'total_barang_jadi',
                        'total_gudang',
                        'low_stock_count',
                        'total_transaksi_masuk',
                        'total_transaksi_keluar',
                        'nominal_transaksi_masuk',
                        'nominal_transaksi_keluar',
                    ],
                    'low_stock_items',
                    'recent_transactions',
                ],
            ]);
    }

    public function test_dashboard_peran_tanpa_akses_transaksi_tidak_menerima_data_keuangan(): void
    {
        $this->login('penataan');
        $this->buatItem(['stok' => 1, 'stok_minimum' => 5]);

        $response = $this->getJson('/api/dashboard/summary')->assertStatus(200);

        $response->assertJsonPath('data.recent_transactions', []);
        $response->assertJsonMissingPath('data.cards.nominal_transaksi_masuk');
        $response->assertJsonMissingPath('data.cards.nominal_transaksi_keluar');
        $response->assertJsonMissingPath('data.cards.total_transaksi_masuk');
        $response->assertJsonMissingPath('data.cards.total_transaksi_keluar');
        $response->assertJsonPath('data.cards.low_stock_count', 1);
    }

    public function test_dashboard_stok_menipis_tidak_membocorkan_harga(): void
    {
        $this->login('pemilik');
        $this->buatItem(['stok' => 1, 'stok_minimum' => 5]);

        $this->getJson('/api/dashboard/summary')
            ->assertStatus(200)
            ->assertJsonMissingPath('data.low_stock_items.0.harga_beli')
            ->assertJsonMissingPath('data.low_stock_items.0.harga_jual');
    }
}