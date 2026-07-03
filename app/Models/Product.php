<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'code',
        'description',
        'price',
        'unit',
        'image',
        'is_active',
        'expiry_date',
        'min_stock',
    ];

    protected $casts = [
        'price'       => 'decimal:2',
        'is_active'   => 'boolean',
        'expiry_date' => 'date',
        'min_stock'   => 'integer',
    ];

    protected $appends = ['total_stock', 'is_low_stock'];

    // Relasi: produk milik satu kategori
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Relasi: produk bisa muncul di banyak transaction items
    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function stocks()
    {
        return $this->hasMany(ProductStock::class);
    }

// Helper: ambil stok berdasarkan kios
    public function stockForKios(int $kiosId): int
    {
        return $this->stocks()->where('kios_id', $kiosId)->value('stock') ?? 0;
    }

    public function getTotalStockAttribute(): int
    {
        return $this->relationLoaded('stocks')
            ? $this->stocks->sum('stock')
            : $this->stocks()->sum('stock');
    }

    public function getIsLowStockAttribute(): bool
    {
        // Menipis kalau ADA kios yang stoknya <= ambang (bukan cuma total gabungan)
        return $this->stocks->contains(
            fn($s) => $s->stock > 0 && $s->stock <= $this->min_stock,
        );
    }

}
