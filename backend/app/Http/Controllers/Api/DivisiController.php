<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Divisi\StoreDivisiRequest;
use App\Http\Resources\DivisiResource;
use App\Models\Divisi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DivisiController extends Controller
{
    /**
     * Display a listing of divisions.
     */
    public function index(): AnonymousResourceCollection
    {
        $divisis = Divisi::withCount('users')->get();

        return DivisiResource::collection($divisis);
    }

    /**
     * Store a newly created division in storage.
     */
    public function store(StoreDivisiRequest $request): JsonResponse
    {
        $divisi = Divisi::create($request->validated());

        return response()->json([
            'message' => 'Divisi berhasil ditambahkan',
            'data' => new DivisiResource($divisi),
        ], 201);
    }

    /**
     * Display the specified division.
     */
    public function show(Divisi $divisi): DivisiResource
    {
        return new DivisiResource($divisi->loadCount('users'));
    }

    /**
     * Remove the specified division from storage.
     */
    public function destroy(Divisi $divisi): JsonResponse
    {
        $divisi->delete();

        return response()->json([
            'message' => 'Divisi berhasil dihapus',
        ]);
    }
}
