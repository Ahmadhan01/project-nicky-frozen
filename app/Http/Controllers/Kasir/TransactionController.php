<?php

namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\AuditLog;
use Inertia\Inertia;

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

    try {
        $transaction = DB::transaction(function () use ($request, $activeSession) {
            $total = collect($request->items)->sum(fn($i) => $i['price'] * $i['qty']);

            // Validasi stok semua item dulu
            foreach ($request->items as $item) {
                $product = Product::find($item['id']);
                if (!$product || $product->stock < $item['qty']) {
                    throw new \Exception("Stok {$product->name} tidak cukup! Tersisa {$product->stock}.");
                }
            }

            $transaction = Transaction::create([
                'user_id'          => auth()->id(),
                'kasir_session_id' => $activeSession->id,
                'invoice_number'   => Transaction::generateInvoiceNumber(),
                'total_amount'     => $total,
                'paid_amount'      => $request->paid_amount,
                'change_amount'    => $request->paid_amount - $total,
                'payment_method'   => $request->payment_method,
                'status'           => 'completed',
                'is_offline_sync'  => false,
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
])->with('products', Product::with('category')->where('is_active', true)->get());

    } catch (\Exception $e) {
        return back()->withErrors(['stock' => $e->getMessage()]);
    }
}

    public function index(Request $request)
{
    $query = Transaction::with(['items.product', 'user', 'kasirSession.kios', 'kasirSession.shift'])
        ->where('user_id', auth()->id())
        ->latest();

    if ($request->kios_id) {
        $query->whereHas('kasirSession', fn($q) => $q->where('kios_id', $request->kios_id));
    }

    if ($request->shift_id) {
        $query->whereHas('kasirSession', fn($q) => $q->where('shift_id', $request->shift_id));
    }

    if ($request->payment_method) {
        $query->where('payment_method', $request->payment_method);
    }

    return Inertia::render('Kasir/History', [
        'transactions' => $query->get(),
        'kiosList'     => \App\Models\Kios::all(),
        'shifts'       => \App\Models\Shift::all(),
    ]);
}

public function sync(Request $request)
{
    $request->validate([
        'transactions'                    => 'required|array',
        'transactions.*.items'            => 'required|array',
        'transactions.*.paid_amount'      => 'required|numeric',
        'transactions.*.payment_method'   => 'required|in:cash,transfer,qris',
        'transactions.*.offline_id'       => 'required|string',
    ]);

    $activeSession = auth()->user()->activeSession();

    if (!$activeSession) {
        return response()->json(['error' => 'Tidak ada sesi aktif.'], 422);
    }

    $synced = 0;

    foreach ($request->transactions as $trxData) {
        DB::transaction(function () use ($trxData, $activeSession, &$synced) {
            $total = collect($trxData['items'])->sum(fn($i) => $i['price'] * $i['qty']);

            $transaction = Transaction::create([
                'user_id'          => auth()->id(),
                'kasir_session_id' => $activeSession->id,
                'invoice_number'   => Transaction::generateInvoiceNumber(),
                'total_amount'     => $total,
                'paid_amount'      => $trxData['paid_amount'],
                'change_amount'    => $trxData['paid_amount'] - $total,
                'payment_method'   => $trxData['payment_method'],
                'status'           => 'completed',
                'is_offline_sync'  => true,
            ]);

            foreach ($trxData['items'] as $item) {
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
                "Transaksi offline {$transaction->invoice_number} disinkronkan sebesar Rp " . number_format($total, 0, ',', '.'),
                ['invoice' => $transaction->invoice_number, 'offline_id' => $trxData['offline_id']]
            );

            $synced++;
        });
    }

    return response()->json(['synced' => $synced]);
}

public function cancel(Transaction $transaction)
{
    if ($transaction->status === 'cancelled') {
        return back()->withErrors(['error' => 'Transaksi sudah dibatalkan.']);
    }

    DB::transaction(function () use ($transaction) {
        // Kembalikan stok produk
        foreach ($transaction->items as $item) {
            Product::where('id', $item->product_id)->increment('stock', $item->quantity);
        }

        // Update status transaksi
        $transaction->update(['status' => 'cancelled']);

        // Catat di audit log
        AuditLog::record(
            'transaction',
            "Transaksi {$transaction->invoice_number} dibatalkan — stok dikembalikan",
            ['invoice' => $transaction->invoice_number]
        );
    });

    return back()->with('success', 'Transaksi berhasil dibatalkan dan stok dikembalikan!');
}
}