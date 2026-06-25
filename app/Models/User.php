<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'username', 'password', 'role', 'default_kios_id', 'default_shift_id', 'avatar_color', 'notes', 'last_active_at'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

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
        'last_active_at' => 'datetime',
    ];
}

    public function kasirSessions()
{
    return $this->hasMany(KasirSession::class);
}

// Helper: cek apakah kasir punya sesi aktif
public function activeSession()
{
    return $this->kasirSessions()->where('status', 'active')->latest()->first();
}

public function defaultKios()
{
    return $this->belongsTo(Kios::class, 'default_kios_id');
}

public function defaultShift()
{
    return $this->belongsTo(Shift::class, 'default_shift_id');
}

// Online jika aktif dalam 5 menit terakhir
public function isOnline(): bool
{
    return $this->last_active_at && $this->last_active_at->gt(now()->subMinutes(5));
}

public function isOwner(): bool
{
    return $this->role === 'owner';
}

public function isAdmin(): bool
{
    return $this->role === 'admin';
}

public function isKasir(): bool
{
    return $this->role === 'kasir';
}
}
