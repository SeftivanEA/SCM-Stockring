<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gudang;
use Illuminate\Http\Request;

class GudangController extends Controller
{
    /**
     * Tampilkan daftar gudang beserta jumlah jenis barang di dalamnya.
     */
    public function index()
    {
        $gudangs = Gudang::withCount('items')->get();

        return response()->json([
            'status' => 'success',
            'data' => $gudangs
        ]);
    }

    /**
     * Simpan gudang baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_gudang' => 'required|string|max:255',
            'lokasi' => 'nullable|string|max:255',
            'jenis' => 'required|in:utama,produksi,etalase',
            'keterangan' => 'nullable|string',
        ]);

        $gudang = Gudang::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Gudang berhasil ditambahkan',
            'data' => $gudang
        ], 201);
    }

    /**
     * Tampilkan detail gudang beserta daftar item di dalamnya.
     */
    public function show(string $id)
    {
        $gudang = Gudang::with('items')->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $gudang
        ]);
    }

    /**
     * Perbarui data gudang.
     */
    public function update(Request $request, string $id)
    {
        $gudang = Gudang::findOrFail($id);

        $validated = $request->validate([
            'nama_gudang' => 'sometimes|required|string|max:255',
            'lokasi' => 'nullable|string|max:255',
            'jenis' => 'sometimes|required|in:utama,produksi,etalase',
            'keterangan' => 'nullable|string',
        ]);

        $gudang->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Data gudang berhasil diperbarui',
            'data' => $gudang
        ]);
    }

    /**
     * Hapus gudang (jika tidak ada barang terkait).
     */
    public function destroy(string $id)
    {
        $gudang = Gudang::findOrFail($id);

        if ($gudang->items()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak dapat menghapus gudang karena masih memiliki barang terkait.'
            ], 422);
        }

        $gudang->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Gudang berhasil dihapus'
        ]);
    }
}

