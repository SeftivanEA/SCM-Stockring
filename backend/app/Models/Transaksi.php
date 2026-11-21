<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaksi extends Model
{
    use HasFactory;

    protected $table = 'transaksis';

    protected $fillable = [
        'kode_transaksi',
        'tipe',
        'tanggal_transaksi',
        'total_harga',
        'user_id',
        'catatan',
    ];

    protected $casts = [
        'tanggal_transaksi' => 'date',
        'total_harga' => 'float',
    ];

    public function details(): HasMany
    {
        return $this->hasMany(TransaksiDetail::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

