<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = now()->startOfDay();

        $todayTransactions = Transaction::where('status', 'completed')
            ->where('created_at', '>=', $today)
            ->get();

        $todayRevenue = $todayTransactions->sum('total_amount');
        $todayCount   = $todayTransactions->count();

        $products = Product::with('stocks')->get();

        $lowStockProducts = $products->filter(fn($p) => $p->is_low_stock)->values();

        $expiringProducts = $products
            ->filter(function ($p) {
                if (!$p->expiry_date) return false;
                $diffDays = now()->startOfDay()->diffInDays($p->expiry_date, false);
                return $diffDays <= 7; // sudah lewat atau tinggal <=7 hari
            })
            ->sortBy('expiry_date')
            ->values();

        $recentTransactions = Transaction::with(['user', 'kasirSession.kios'])
            ->where('status', 'completed')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'today_revenue'      => $todayRevenue,
                'today_count'        => $todayCount,
                'low_stock_count'    => $lowStockProducts->count(),
                'expiring_count'     => $expiringProducts->count(),
            ],
            'lowStockProducts'    => $lowStockProducts->take(5)->values(),
            'expiringProducts'    => $expiringProducts->take(5)->values(),
            'recentTransactions'  => $recentTransactions,
        ]);
    }
}