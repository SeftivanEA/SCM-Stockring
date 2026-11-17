<?php

namespace Tests\Feature;

use App\Models\Gudang;
use App\Models\Item;
use App\Models\Transaksi;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StokTest extends TestCase
{
    /**
     * Test modul gudang.
     */
    public function test_can_create_and_list_gudang(): void
    {
        $response = $this->postJson('/api/gudang', [
            'nama_gudang' => 'Gudang Uji Coba',
            'lokasi' => 'Lantai 2',
            'jenis' => 'utama',
            'keterangan' => 'Gudang untuk pengujian unit'
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.nama_gudang', 'Gudang Uji Coba');

        $this->getJson('/api/gudang')
            ->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    /**
     * Test modul items (CRUD & Filter).
     */
    public function test_can_create_and_filter_items(): void
    {
        $gudang = Gudang::first() ?? Gudang::create([
            'nama_gudang' => 'Gudang Tes',
            'jenis' => 'utama'
        ]);

        $response = $this->postJson('/api/items', [
            'nama_barang' => 'Bahan Uji Coba',
            'jenis' => 'mentah',
            'gudang_id' => $gudang->id,
            'stok' => 50,
            'stok_minimum' => 10,
            'satuan' => 'kg',
            'harga_beli' => 15000,
            'harga_jual' => 0
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.nama_barang', 'Bahan Uji Coba');

        // Test filter jenis mentah
        $this->getJson('/api/items?jenis=mentah')
            ->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    /**
     * Test transaksi masuk (restock menambah stok).
     */
    public function test_transaksi_masuk_increments_stock(): void
    {
        $item = Item::create([
            'kode_barang' => 'TEST-IN-' . uniqid(),
            'nama_barang' => 'Item Restok Tes',
            'jenis' => 'mentah',
            'stok' => 10,
            'stok_minimum' => 5,
            'satuan' => 'pcs',
            'harga_beli' => 5000,
            'harga_jual' => 0
        ]);

        $response = $this->postJson('/api/transaksi', [
            'tipe' => 'masuk',
            'tanggal_transaksi' => now()->toDateString(),
            'items' => [
                [
                    'item_id' => $item->id,
                    'jumlah' => 15,
                    'harga_satuan' => 5000
                ]
            ],
            'catatan' => 'Restok 15 pcs'
        ]);

        $response->assertStatus(201);
        $this->assertEquals(25, $item->fresh()->stok);
    }

    /**
     * Test transaksi keluar (penjualan memotong stok).
     */
    public function test_transaksi_keluar_decrements_stock(): void
    {
        $item = Item::create([
            'kode_barang' => 'TEST-OUT-' . uniqid(),
            'nama_barang' => 'Item Jual Tes',
            'jenis' => 'jadi',
            'stok' => 20,
            'stok_minimum' => 5,
            'satuan' => 'pcs',
            'harga_beli' => 4000,
            'harga_jual' => 10000
        ]);

        $response = $this->postJson('/api/transaksi', [
            'tipe' => 'keluar',
            'tanggal_transaksi' => now()->toDateString(),
            'items' => [
                [
                    'item_id' => $item->id,
                    'jumlah' => 8
                ]
            ],
            'catatan' => 'Penjualan 8 pcs'
        ]);

        $response->assertStatus(201);
        $this->assertEquals(12, $item->fresh()->stok);
    }

    /**
     * Test transaksi keluar gagal jika stok tidak cukup.
     */
    public function test_transaksi_keluar_fails_when_stock_insufficient(): void
    {
        $item = Item::create([
            'kode_barang' => 'TEST-FAIL-' . uniqid(),
            'nama_barang' => 'Item Langka',
            'jenis' => 'jadi',
            'stok' => 3,
            'stok_minimum' => 1,
            'satuan' => 'pcs',
            'harga_beli' => 5000,
            'harga_jual' => 10000
        ]);

        $response = $this->postJson('/api/transaksi', [
            'tipe' => 'keluar',
            'tanggal_transaksi' => now()->toDateString(),
            'items' => [
                [
                    'item_id' => $item->id,
                    'jumlah' => 10 // lebih besar dari stok 3
                ]
            ]
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['items']);

        // Stok tidak berubah
        $this->assertEquals(3, $item->fresh()->stok);
    }

    /**
     * Test dashboard summary endpoint.
     */
    public function test_dashboard_summary(): void
    {
        $response = $this->getJson('/api/dashboard/summary');

        $response->assertStatus(200)
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
                ]
            ]);
    }
}

