<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staf\AssignStafDivisiRequest;
use App\Http\Requests\Staf\StoreStafRequest;
use App\Http\Resources\UserResource;
use App\Models\Divisi;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;

class StafController extends Controller
{
    /**
     * Display a listing of staff members.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::with('divisi');

        if ($request->filled('divisi')) {
            $query->whereHas('divisi', function ($q) use ($request): void {
                $q->where('nama', $request->query('divisi'));
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->query('role'));
        }

        $staf = $query->orderBy('name')->get();

        return UserResource::collection($staf);
    }

    /**
     * Store a newly created staff member.
     */
    public function store(StoreStafRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $divisiId = $validated['divisi_id'] ?? null;
        if (! $divisiId && ! empty($validated['divisi'])) {
            $divisi = Divisi::firstOrCreate(
                ['nama' => $validated['divisi']],
                ['deskripsi' => '-']
            );
            $divisiId = $divisi->id;
        }

        $role = $validated['role'] ?? null;
        if (! $role && $divisiId) {
            $divisiModel = Divisi::find($divisiId);
            $role = match (strtolower($divisiModel?->nama ?? '')) {
                'pendataan' => 'pendataan',
                'penataan' => 'penataan',
                'pengiriman' => 'pengiriman',
                'audit' => 'audit',
                default => 'pendataan',
            };
        }

        $user = User::create([
            'name' => $validated['nama'],
            'username' => $validated['username'],
            'email' => $validated['username'].'@stockring.local',
            'password' => Hash::make($validated['password'] ?? 'password'),
            'role' => $role ?? 'pendataan',
            'divisi_id' => $divisiId,
        ]);

        return response()->json([
            'message' => 'Staf berhasil ditambahkan',
            'data' => new UserResource($user->load('divisi')),
        ], 201);
    }

    /**
     * Assign staff to a division.
     */
    public function assignDivisi(AssignStafDivisiRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();

        $divisiId = $validated['divisi_id'] ?? null;
        if (! $divisiId && ! empty($validated['divisi'])) {
            $divisi = Divisi::firstOrCreate(
                ['nama' => $validated['divisi']],
                ['deskripsi' => '-']
            );
            $divisiId = $divisi->id;
        }

        $user->divisi_id = $divisiId;
        if ($divisiId) {
            $divisiModel = Divisi::find($divisiId);
            $mappedRole = match (strtolower($divisiModel?->nama ?? '')) {
                'pendataan' => 'pendataan',
                'penataan' => 'penataan',
                'pengiriman' => 'pengiriman',
                'audit' => 'audit',
                default => null,
            };
            if ($mappedRole && $user->role !== 'pemilik') {
                $user->role = $mappedRole;
            }
        }
        $user->save();

        return response()->json([
            'message' => 'Divisi staf berhasil diperbarui',
            'data' => new UserResource($user->load('divisi')),
        ]);
    }
}
