<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kios;
use App\Models\Shift;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with([
            'items.product',
            'user',
            'kasirSession.kios',
            'kasirSession.shift',
        ])->latest();

        if ($request->kios_id) {
            $query->whereHas('kasirSession', fn($q) => $q->where('kios_id', $request->kios_id));
        }

        if ($request->shift_id) {
            $query->whereHas('kasirSession', fn($q) => $q->where('shift_id', $request->shift_id));
        }

        if ($request->payment_method) {
            $query->where('payment_method', $request->payment_method);
        }

        return Inertia::render('Admin/History', [
            'transactions' => $query->get(),
            'kiosList'     => Kios::all(),
            'shifts'       => Shift::all(),
        ]);
    }
}