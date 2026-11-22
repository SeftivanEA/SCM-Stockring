<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    use HasFactory;

    protected $table = 'items';

    protected $fillable = [
        'kode_barang',
        'nama_barang',
        'jenis',
        'gudang_id',
        'stok',
        'stok_minimum',
        'satuan',
        'harga_beli',
        'harga_jual',
        'deskripsi',
    ];

    protected $casts = [
        'stok' => 'integer',
        'stok_minimum' => 'integer',
        'harga_beli' => 'float',
        'harga_jual' => 'float',
    ];

    public function gudang(): BelongsTo
    {
        return $this->belongsTo(Gudang::class);
    }

    public function transaksiDetails(): HasMany
    {
        return $this->hasMany(TransaksiDetail::class);
    }

    /**
     * Scope helper untuk cek stok menipis
     */
    public function scopeLowStock($query)
    {
        return $query->whereColumn('stok', '<=', 'stok_minimum');
    }
}

