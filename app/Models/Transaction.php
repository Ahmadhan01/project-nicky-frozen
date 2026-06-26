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
        'is_offline_sync'  => 'boolean',
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
    $date = now()->format('Ymd');
    $last = self::whereDate('created_at', today())
                ->whereIn('status', ['completed', 'cancelled'])
                ->max('id') ?? 0;

    $todayCount = self::whereDate('created_at', today())->count() + 1;
    $counter    = str_pad($todayCount, 3, '0', STR_PAD_LEFT);

    // Pastikan tidak bentrok dengan yang sudah ada
    $candidate = "INV-{$date}-{$counter}";
    while (self::where('invoice_number', $candidate)->exists()) {
        $todayCount++;
        $counter   = str_pad($todayCount, 3, '0', STR_PAD_LEFT);
        $candidate = "INV-{$date}-{$counter}";
    }

    return $candidate;
}

    public function kasirSession()
{
    return $this->belongsTo(KasirSession::class);
}
}