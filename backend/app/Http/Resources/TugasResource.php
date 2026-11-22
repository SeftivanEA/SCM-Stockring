<?php

namespace App\Http\Resources;

use App\Models\Tugas;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Tugas
 */
class TugasResource extends JsonResource
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
            'user_id' => $this->user_id,
            'staf_nama' => $this->user?->name,
            'jenis' => $this->jenis,
            'judul' => $this->judul,
            'detail' => $this->detail,
            'status' => $this->status,
            'penerima' => $this->penerima,
            'catatan' => $this->catatan,
            'log' => $this->log ?? '',
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
