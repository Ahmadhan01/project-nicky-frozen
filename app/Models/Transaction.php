<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\KasirSession;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'kasir_session_id', 
        'invoice_number',
        'total_amount',
        'paid_amount',
        'change_amount',
        'payment_method',
        'status',
        'is_offline_sync',
        'notes',
    ];

    protected $casts = [
        'total_amount'  => 'decimal:2',
        'paid_amount'   => 'decimal:2',
        'change_amount' => 'decimal:2',
    ];

    // Relasi: transaksi milik satu kasir
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi: transaksi punya banyak item
    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

    // Helper: generate nomor invoice otomatis
    public static function generateInvoiceNumber(): string
    {
        $date    = now()->format('Ymd');
        $last    = self::whereDate('created_at', today())->count() + 1;
        $counter = str_pad($last, 3, '0', STR_PAD_LEFT);

        return "INV-{$date}-{$counter}";
    }

    public function kasirSession()
{
    return $this->belongsTo(KasirSession::class);
}
}