<?php

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GudangController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\TransaksiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - SCM Stockring
|--------------------------------------------------------------------------
*/

// Endpoint Tes API
Route::get('/ping', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Stockring API is running'
    ]);
});

// Modul Gudang
Route::apiResource('gudang', GudangController::class);

// Modul Barang (Mentah & Jadi) -> Untuk Daftar Barang & Form Barang
Route::apiResource('items', ItemController::class);

// Modul Transaksi & Pemotongan Stok -> Untuk Riwayat Transaksi & Form Transaksi
Route::get('transaksi', [TransaksiController::class, 'index']);
Route::post('transaksi', [TransaksiController::class, 'store']);
Route::get('transaksi/{id}', [TransaksiController::class, 'show']);

// Modul Dashboard -> Ringkasan Statistik & Stok Menipis
Route::get('dashboard/summary', [DashboardController::class, 'summary']);

