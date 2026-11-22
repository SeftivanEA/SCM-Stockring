<?php

namespace App\Models;

use Database\Factories\DivisiFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nama', 'deskripsi'])]
class Divisi extends Model
{
    /** @use HasFactory<DivisiFactory> */
    use HasFactory;

    /**
     * Get the users in this divisi.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
