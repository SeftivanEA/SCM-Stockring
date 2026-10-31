<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'username', 'email', 'password', 'role', 'divisi_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = ['role_label'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get human-readable role label.
     */
    protected function roleLabel(): Attribute
    {
        return Attribute::make(
            get: fn (): string => match ($this->role) {
                'pemilik' => 'Pemilik',
                'pendataan' => 'Staf Pendataan',
                'penataan' => 'Staf Penataan',
                'pengiriman' => 'Staf Pengiriman',
                'audit' => 'Staf Audit',
                default => ucfirst($this->role ?? 'Staf'),
            }
        );
    }

    /**
     * Get the divisi that the user belongs to.
     */
    public function divisi(): BelongsTo
    {
        return $this->belongsTo(Divisi::class);
    }

    /**
     * Get the tasks assigned to the user.
     */
    public function tugas(): HasMany
    {
        return $this->hasMany(Tugas::class);
    }
}
