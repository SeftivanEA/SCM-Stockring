<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DivisiController;
use App\Http\Controllers\Api\GudangController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\StafController;
use App\Http\Controllers\Api\TransaksiController;
use App\Http\Controllers\Api\TugasController;
use Illuminate\Support\Facades\Route;

// Tes API (publik)
Route::get('/ping', fn () => response()->json(['status' => 'success', 'message' => 'Stockring API is running']));

// Autentikasi publik
Route::post('/login', [AuthController::class, 'login'])->name('api.login');

// Semua rute di bawah ini wajib login
Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/me', [AuthController::class, 'me'])->name('api.me');
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');

    // Divisi
    Route::get('/divisi', [DivisiController::class, 'index'])->name('api.divisi.index');
    Route::get('/divisi/{divisi}', [DivisiController::class, 'show'])->name('api.divisi.show');
    Route::middleware('role:pemilik')->group(function (): void {
        Route::post('/divisi', [DivisiController::class, 'store'])->name('api.divisi.store');
        Route::delete('/divisi/{divisi}', [DivisiController::class, 'destroy'])->name('api.divisi.destroy');

        // Staf
        Route::get('/staf', [StafController::class, 'index'])->name('api.staf.index');
        Route::post('/staf', [StafController::class, 'store'])->name('api.staf.store');
        Route::put('/staf/{user}/divisi', [StafController::class, 'assignDivisi'])->name('api.staf.assign-divisi');

        // Membuat tugas
        Route::post('/tugas', [TugasController::class, 'store'])->name('api.tugas.store');
    });

    // Tugas pengiriman & penataan
    Route::middleware('role:pemilik,penataan,pengiriman')->group(function (): void {
        Route::get('/tugas', [TugasController::class, 'index'])->name('api.tugas.index');
        Route::get('/tugas/{tugas}', [TugasController::class, 'show'])->name('api.tugas.show');
        Route::patch('/tugas/{tugas}/status', [TugasController::class, 'updateStatus'])->name('api.tugas.update-status');
    });

    // Dashboard: semua peran yang login
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    // Stok: baca
    Route::middleware('role:pemilik,pendataan,audit')->group(function (): void {
        Route::apiResource('gudang', GudangController::class)->only(['index', 'show']);
        Route::apiResource('items', ItemController::class)->only(['index', 'show']);
        Route::get('transaksi', [TransaksiController::class, 'index']);
        Route::get('transaksi/{id}', [TransaksiController::class, 'show']);
    });

    // Stok: tulis barang dan transaksi
    Route::middleware('role:pemilik,pendataan')->group(function (): void {
        Route::apiResource('items', ItemController::class)->only(['store', 'update', 'destroy']);
        Route::post('transaksi', [TransaksiController::class, 'store']);
    });

    // Gudang: tulis (hanya pemilik)
    Route::middleware('role:pemilik')->group(function (): void {
        Route::apiResource('gudang', GudangController::class)->only(['store', 'update', 'destroy']);
    });
});