<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ItemController extends Controller
{
    /**
     * Tampilkan daftar barang dengan filter & pencarian.
     */
    public function index(Request $request)
    {
        $query = Item::with('gudang');

        // Filter pencarian nama atau kode barang
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                  ->orWhere('kode_barang', 'like', "%{$search}%");
            });
        }

        // Filter jenis (mentah / jadi)
        if ($request->filled('jenis')) {
            $query->where('jenis', $request->jenis);
        }

        // Filter per gudang
        if ($request->filled('gudang_id')) {
            $query->where('gudang_id', $request->gudang_id);
        }

        // Filter stok menipis
        if ($request->boolean('low_stock')) {
            $query->whereColumn('stok', '<=', 'stok_minimum');
        }

        // Pengurutan
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination atau ambil semua
        if ($request->boolean('all')) {
            $items = $query->get();
        } else {
            $perPage = $request->get('per_page', 15);
            $items = $query->paginate($perPage);
        }

        return response()->json([
            'status' => 'success',
            'data' => $items
        ]);
    }

    /**
     * Tambah barang baru (Form Barang).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_barang' => 'nullable|string|max:50|unique:items,kode_barang',
            'nama_barang' => 'required|string|max:255',
            'jenis' => 'required|in:mentah,jadi',
            'gudang_id' => 'nullable|exists:gudangs,id',
            'stok' => 'nullable|integer|min:0',
            'stok_minimum' => 'nullable|integer|min:0',
            'satuan' => 'nullable|string|max:50',
            'harga_beli' => 'nullable|numeric|min:0',
            'harga_jual' => 'nullable|numeric|min:0',
            'deskripsi' => 'nullable|string',
        ]);

        // Auto-generate kode_barang jika kosong
        if (empty($validated['kode_barang'])) {
            $prefix = ($validated['jenis'] === 'mentah') ? 'MNT' : 'JDI';
            $validated['kode_barang'] = $prefix . '-' . strtoupper(Str::random(6));
        }

        $validated['stok'] = $validated['stok'] ?? 0;
        $validated['stok_minimum'] = $validated['stok_minimum'] ?? 5;
        $validated['satuan'] = $validated['satuan'] ?? 'pcs';
        $validated['harga_beli'] = $validated['harga_beli'] ?? 0;
        $validated['harga_jual'] = $validated['harga_jual'] ?? 0;

        $item = Item::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Barang berhasil ditambahkan',
            'data' => $item->load('gudang')
        ], 201);
    }

    /**
     * Tampilkan detail barang.
     */
    public function show(string $id)
    {
        $item = Item::with(['gudang', 'transaksiDetails.transaksi'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $item
        ]);
    }

    /**
     * Perbarui data barang.
     */
    public function update(Request $request, string $id)
    {
        $item = Item::findOrFail($id);

        $validated = $request->validate([
            'kode_barang' => 'sometimes|required|string|max:50|unique:items,kode_barang,' . $item->id,
            'nama_barang' => 'sometimes|required|string|max:255',
            'jenis' => 'sometimes|required|in:mentah,jadi',
            'gudang_id' => 'nullable|exists:gudangs,id',
            'stok' => 'sometimes|required|integer|min:0',
            'stok_minimum' => 'sometimes|required|integer|min:0',
            'satuan' => 'sometimes|required|string|max:50',
            'harga_beli' => 'nullable|numeric|min:0',
            'harga_jual' => 'nullable|numeric|min:0',
            'deskripsi' => 'nullable|string',
        ]);

        $item->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Data barang berhasil diperbarui',
            'data' => $item->load('gudang')
        ]);
    }

    /**
     * Hapus barang.
     */
    public function destroy(string $id)
    {
        $item = Item::findOrFail($id);
        $item->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Barang berhasil dihapus'
        ]);
    }
}

