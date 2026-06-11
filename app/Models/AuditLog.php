<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'description',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper: catat log
    public static function record(string $type, string $description, array $data = []): void
    {
        self::create([
            'user_id'     => auth()->id(),
            'type'        => $type,
            'description' => $description,
            'data'        => $data,
        ]);
    }
}