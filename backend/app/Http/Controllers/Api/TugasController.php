<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tugas\StoreTugasRequest;
use App\Http\Requests\Tugas\UpdateStatusTugasRequest;
use App\Http\Resources\TugasResource;
use App\Models\Tugas;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TugasController extends Controller
{
    /**
     * Display a listing of tasks.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Tugas::with('user');
        $user = $request->user();

        if ($user->role === 'penataan') {
            $query->where('jenis', 'Penataan');
        } elseif ($user->role === 'pengiriman') {
            $query->where('jenis', 'Pengiriman');
        } elseif ($request->filled('jenis')) {
            $query->where('jenis', $request->query('jenis'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $tugas = $query->orderBy('id', 'desc')->get();

        return TugasResource::collection($tugas);
    }

    /**
     * Store a newly created task.
     */
    public function store(StoreTugasRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['status'] = $validated['status'] ?? 'Baru';

        $tugas = Tugas::create($validated);

        return response()->json([
            'message' => 'Tugas berhasil dibuat',
            'data' => new TugasResource($tugas->load('user')),
        ], 201);
    }

    /**
     * Display the specified task.
     */
    public function show(Request $request, Tugas $tugas): TugasResource
    {
        $this->authorizeTugasAccess($request->user(), $tugas);

        return new TugasResource($tugas->load('user'));
    }

    /**
     * Update the status of a task.
     */
    public function updateStatus(UpdateStatusTugasRequest $request, Tugas $tugas): JsonResponse
    {
        $this->authorizeTugasAccess($request->user(), $tugas);

        $validated = $request->validated();
        $status = $validated['status'];
        $penerima = $validated['penerima'] ?? null;
        $catatan = $validated['catatan'] ?? null;

        $tugas->status = $status;
        if ($penerima !== null) {
            $tugas->penerima = $penerima;
        }
        if ($catatan !== null) {
            $tugas->catatan = $catatan;
        }

        $tanggal = Carbon::now()->locale('id')->translatedFormat('d M Y');
        $keterangan = ($status === 'Selesai' && $penerima) ? "Diterima {$penerima}" : $status;
        $entryLog = "{$tanggal} · {$keterangan}".($catatan ? " · {$catatan}" : '');

        $tugas->log = $tugas->log ? "{$tugas->log}\n{$entryLog}" : $entryLog;
        $tugas->save();

        return response()->json([
            'message' => 'Status tugas berhasil diperbarui',
            'data' => new TugasResource($tugas->load('user')),
        ]);
    }

    /**
     * Authorize access to task based on user role and task jenis.
     */
    protected function authorizeTugasAccess(User $user, Tugas $tugas): void
    {
        if ($user->role === 'pemilik') {
            return;
        }

        $isAllowed = match ($user->role) {
            'penataan' => $tugas->jenis === 'Penataan',
            'pengiriman' => $tugas->jenis === 'Pengiriman',
            default => false,
        };

        if (! $isAllowed) {
            abort(403, 'Akses ditolak untuk jenis tugas ini.');
        }
    }
}
