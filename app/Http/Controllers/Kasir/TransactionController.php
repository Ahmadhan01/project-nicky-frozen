<?php

namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\AuditLog;

class TransactionController extends Controller
{
    public function store(Request $request)
{
    $request->validate([
        'items'          => 'required|array|min:1',
        'items.*.id'     => 'required|exists:products,id',
        'items.*.qty'    => 'required|integer|min:1',
        'items.*.price'  => 'required|numeric|min:0',
        'paid_amount'    => 'required|numeric|min:0',
        'payment_method' => 'required|in:cash,transfer,qris',
    ]);

    $activeSession = auth()->user()->activeSession();
   

    if (!$activeSession) {
        return back()->withErrors(['session' => 'Tidak ada sesi aktif.']);
    }

    $transaction = DB::transaction(function () use ($request, $activeSession) {
        $total = collect($request->items)->sum(fn($i) => $i['price'] * $i['qty']);

        $transaction = Transaction::create([
            'user_id'          => auth()->id(),
            'kasir_session_id' => $activeSession->id,
            'invoice_number'   => Transaction::generateInvoiceNumber(),
            'total_amount'     => $total,
            'paid_amount'      => $request->paid_amount,
            'change_amount'    => $request->paid_amount - $total,
            'payment_method'   => $request->payment_method,
            'status'           => 'completed',
        ]);

        foreach ($request->items as $item) {
            TransactionItem::create([
                'transaction_id' => $transaction->id,
                'product_id'     => $item['id'],
                'quantity'       => $item['qty'],
                'price'          => $item['price'],
                'subtotal'       => $item['price'] * $item['qty'],
            ]);

            Product::where('id', $item['id'])->decrement('stock', $item['qty']);
        }

        AuditLog::record(
    'transaction',
    "Transaksi {$transaction->invoice_number} sebesar Rp " . number_format($total, 0, ',', '.'),
    ['invoice' => $transaction->invoice_number, 'total' => $total]
);

        return $transaction;
    });

        return back()->with([
    'transaction' => $transaction->load(['items.product', 'user', 'kasirSession.kios', 'kasirSession.shift']),
]);
    }

    public function index(Request $request)
{
    $query = Transaction::with(['items.product', 'user', 'kasirSession.kios', 'kasirSession.shift'])
        ->where('user_id', auth()->id())
        ->latest();

    // Filter kios
    if ($request->kios_id) {
        $query->whereHas('kasirSession', fn($q) => $q->where('kios_id', $request->kios_id));
    }

    // Filter shift
    if ($request->shift_id) {
        $query->whereHas('kasirSession', fn($q) => $q->where('shift_id', $request->shift_id));
    }

    // Filter metode
    if ($request->payment_method) {
        $query->where('payment_method', $request->payment_method);
    }

    return \Inertia\Inertia::render('Kasir/History', [
        'transactions'  => $query->get(),
        'kiosList'      => \App\Models\Kios::all(),
        'shifts'        => \App\Models\Shift::all(),
    ]);
}
}