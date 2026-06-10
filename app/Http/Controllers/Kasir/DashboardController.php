<?php

namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Models\Kios;
use App\Models\Product;
use App\Models\Shift;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $activeSession = auth()->user()->activeSession();

        return Inertia::render('Kasir/Dashboard', [
            'products'      => Product::with('category')->where('is_active', true)->get(),
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

    return redirect()->route('kasir.dashboard');
}
}