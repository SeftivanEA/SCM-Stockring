<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
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
            'name' => $this->name,
            'nama' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'role' => $this->role,
            'roleLabel' => $this->role_label,
            'divisi_id' => $this->divisi_id,
            'divisi' => $this->divisi?->nama,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
