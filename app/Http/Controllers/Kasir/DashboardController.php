<?php
namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Kios;
use App\Models\Product;
use App\Models\Shift;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $activeSession = auth()->user()->activeSession();
        $kiosId        = $activeSession?->kios_id;

        $products = Product::with(['category', 'stocks'])
            ->where('is_active', true)
            ->get()
            ->map(function ($product) use ($kiosId) {
                $stock = $kiosId
                    ? $product->stocks->where('kios_id', $kiosId)->first()?->stock ?? 0
                    : $product->stocks->sum('stock');

                return [
                    'id'          => $product->id,
                    'name'        => $product->name,
                    'code'        => $product->code,
                    'price'       => $product->price,
                    'stock'       => $stock,
                    'unit'        => $product->unit,
                    'is_active'   => $product->is_active,
                    'category'    => $product->category,
                    'category_id' => $product->category_id,
                ];
            });

        return Inertia::render('Kasir/Dashboard', [
            'products'      => $products,
            'kiosList'      => Kios::where('is_active', true)->get(),
            'shifts'        => Shift::where('is_active', true)->get(),
            'activeSession' => $activeSession?->load(['kios', 'shift']),
        ]);
    }

    public function startSession(Request $request)
    {
        // Tutup sesi aktif sebelumnya jika ada
        auth()->user()->kasirSessions()
            ->where('status', 'active')
            ->update(['status' => 'closed', 'ended_at' => now()]);

        // Buat sesi baru
        \App\Models\KasirSession::create([
            'user_id'    => auth()->id(),
            'kios_id'    => $request->kios_id,
            'shift_id'   => $request->shift_id,
            'started_at' => now(),
            'status'     => 'active',
        ]);

        $kios  = \App\Models\Kios::find($request->kios_id);
        $shift = \App\Models\Shift::find($request->shift_id);

        AuditLog::record(
            'session',
            "Sesi dimulai: {$kios->name} {$shift->name}",
            ['kios_id' => $request->kios_id, 'shift_id' => $request->shift_id]
        );

        return redirect()->route('kasir.dashboard');
    }
}
