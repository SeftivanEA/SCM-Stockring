<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DivisiController;
use App\Http\Controllers\Api\StafController;
use App\Http\Controllers\Api\TugasController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Stockring SCM
|--------------------------------------------------------------------------
*/

// Autentikasi Publik
Route::post('/login', [AuthController::class, 'login'])->name('api.login');

// Rute Terproteksi Sanctum
Route::middleware('auth:sanctum')->group(function (): void {
    // Profil & Logout
    Route::get('/me', [AuthController::class, 'me'])->name('api.me');
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');

    // Kelola Divisi (Hanya Pemilik yang dapat menambah/menghapus)
    Route::get('/divisi', [DivisiController::class, 'index'])->name('api.divisi.index');
    Route::get('/divisi/{divisi}', [DivisiController::class, 'show'])->name('api.divisi.show');
    Route::middleware('role:pemilik')->group(function (): void {
        Route::post('/divisi', [DivisiController::class, 'store'])->name('api.divisi.store');
        Route::delete('/divisi/{divisi}', [DivisiController::class, 'destroy'])->name('api.divisi.destroy');
    });

    // Kelola Staf (Hanya Pemilik)
    Route::middleware('role:pemilik')->group(function (): void {
        Route::get('/staf', [StafController::class, 'index'])->name('api.staf.index');
        Route::post('/staf', [StafController::class, 'store'])->name('api.staf.store');
        Route::put('/staf/{user}/divisi', [StafController::class, 'assignDivisi'])->name('api.staf.assign-divisi');
    });

    // Kelola Tugas Pengiriman & Penataan
    Route::middleware('role:pemilik,penataan,pengiriman')->group(function (): void {
        Route::get('/tugas', [TugasController::class, 'index'])->name('api.tugas.index');
        Route::get('/tugas/{tugas}', [TugasController::class, 'show'])->name('api.tugas.show');
        Route::patch('/tugas/{tugas}/status', [TugasController::class, 'updateStatus'])->name('api.tugas.update-status');
    });

    Route::middleware('role:pemilik')->group(function (): void {
        Route::post('/tugas', [TugasController::class, 'store'])->name('api.tugas.store');
    });
});
