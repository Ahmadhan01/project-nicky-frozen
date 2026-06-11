<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kios;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RecapController extends Controller
{
    public function index(Request $request)
    {
        $period  = $request->period ?? 'weekly';
        $kiosId  = $request->kios_id;

        // Range tanggal
        $startDate = match($period) {
            'daily'   => now()->startOfDay(),
            'weekly'  => now()->subDays(6)->startOfDay(),
            'monthly' => now()->startOfMonth(),
            default   => now()->subDays(6)->startOfDay(),
        };

        $query = Transaction::where('status', 'completed')
            ->where('created_at', '>=', $startDate);

        if ($kiosId) {
            $query->whereHas('kasirSession', fn($q) => $q->where('kios_id', $kiosId));
        }

        $transactions = $query->get();

        // Stats utama
        $totalRevenue  = $transactions->sum('total_amount');
        $totalCount    = $transactions->count();
        $cashTotal     = $transactions->where('payment_method', 'cash')->sum('total_amount');
        $cashCount     = $transactions->where('payment_method', 'cash')->count();
        $nonCashTotal  = $transactions->whereIn('payment_method', ['transfer', 'qris'])->sum('total_amount');
        $nonCashCount  = $transactions->whereIn('payment_method', ['transfer', 'qris'])->count();
        $avgTransaction = $totalCount > 0 ? $totalRevenue / $totalCount : 0;

        // Grafik per hari
        $days = collect();
        $daysCount = match($period) {
            'daily'   => 1,
            'weekly'  => 7,
            'monthly' => now()->daysInMonth,
            default   => 7,
        };

        for ($i = $daysCount - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $label = now()->subDays($i)->locale('id')->isoFormat('ddd');
            $total = $transactions->filter(fn($t) =>
                $t->created_at->format('Y-m-d') === $date
            )->sum('total_amount');
            $days->push(['date' => $label, 'total' => $total]);
        }

        // Breakdown per produk
        $breakdown = TransactionItem::with('product')
            ->whereHas('transaction', function($q) use ($startDate, $kiosId) {
                $q->where('status', 'completed')->where('created_at', '>=', $startDate);
                if ($kiosId) {
                    $q->whereHas('kasirSession', fn($sq) => $sq->where('kios_id', $kiosId));
                }
            })
            ->select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_revenue'))
            ->groupBy('product_id')
            ->orderByDesc('total_revenue')
            ->get()
            ->map(fn($item) => [
                'name'          => $item->product?->name ?? '-',
                'qty'           => $item->total_qty,
                'revenue'       => $item->total_revenue,
                'unit'          => $item->product?->unit ?? 'pcs',
                'contribution'  => $totalRevenue > 0 ? round(($item->total_revenue / $totalRevenue) * 100, 1) : 0,
            ]);

        return Inertia::render('Admin/Recap', [
            'stats' => [
                'total_revenue'   => $totalRevenue,
                'total_count'     => $totalCount,
                'cash_total'      => $cashTotal,
                'cash_count'      => $cashCount,
                'non_cash_total'  => $nonCashTotal,
                'non_cash_count'  => $nonCashCount,
                'avg_transaction' => $avgTransaction,
            ],
            'chartData'  => $days,
            'breakdown'  => $breakdown,
            'kiosList'   => Kios::all(),
            'period'     => $period,
            'kios_id'    => $kiosId,
        ]);
    }
}