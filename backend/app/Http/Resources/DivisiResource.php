<?php

namespace App\Http\Resources;

use App\Models\Divisi;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Divisi
 */
class DivisiResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'deskripsi' => $this->deskripsi ?? '-',
            'staf_count' => $this->whenCounted('users'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
