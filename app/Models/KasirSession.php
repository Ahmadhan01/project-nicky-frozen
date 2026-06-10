<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KasirSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'kios_id',
        'shift_id',
        'started_at',
        'ended_at',
        'status',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at'   => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function kios()
    {
        return $this->belongsTo(Kios::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}