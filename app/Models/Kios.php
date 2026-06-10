<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kios extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'location', 'is_active'];

    public function kasirSessions()
    {
        return $this->hasMany(KasirSession::class);
    }
}