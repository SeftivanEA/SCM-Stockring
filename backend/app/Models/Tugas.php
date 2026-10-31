<?php

namespace App\Models;

use Database\Factories\TugasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'jenis', 'judul', 'detail', 'status', 'penerima', 'catatan', 'log'])]
class Tugas extends Model
{
    /** @use HasFactory<TugasFactory> */
    use HasFactory;

    /**
     * Get the user/staf assigned to this tugas.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
