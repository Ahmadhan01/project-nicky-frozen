<?php
namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        if (! $activeSession) {
            return back()->withErrors(['session' => 'Tidak ada sesi aktif.']);
        }

        try {
            $transaction = DB::transaction(function () use ($request, $activeSession) {
                $total = collect($request->items)->sum(fn($i) => $i['price'] * $i['qty']);

                foreach ($request->items as $item) {
                    $productStock = \App\Models\ProductStock::where('product_id', $item['id'])
                        ->where('kios_id', $activeSession->kios_id)
                        ->first();

                    if (! $productStock || $productStock->stock < $item['qty']) {
                        $product = Product::find($item['id']);
                        $tersisa = $productStock?->stock ?? 0;
                        throw new \Exception("Stok {$product->name} di kios ini tidak cukup! Tersisa {$tersisa}.");
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

                    \App\Models\ProductStock::where('product_id', $item['id'])
                        ->where('kios_id', $activeSession->kios_id)
                        ->decrement('stock', $item['qty']);
                }

                AuditLog::record(
                    'transaction',
                    "Transaksi {$transaction->invoice_number} sebesar Rp " . number_format($total, 0, ',', '.'),
                    ['invoice' => $transaction->invoice_number, 'total' => $total]
                );

                return $transaction;
            });

            // Simpan hanya ID di session, bukan seluruh data
            session(['last_transaction_id' => $transaction->id]);

            return back();

        } catch (\Exception $e) {
            return back()->withErrors(['stock' => $e->getMessage()]);
        }
    }

    public function getLastTransaction()
    {
        $id = session('last_transaction_id');
        if (! $id) {
            return response()->json(null);
        }

        $transaction = Transaction::with([
            'items.product',
            'user',
            'kasirSession.kios',
            'kasirSession.shift',
        ])->find($id);

        session()->forget('last_transaction_id');

        return response()->json($transaction);
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
            'transactions'                  => 'required|array',
            'transactions.*.items'          => 'required|array',
            'transactions.*.paid_amount'    => 'required|numeric',
            'transactions.*.payment_method' => 'required|in:cash,transfer,qris',
            'transactions.*.offline_id'     => 'required|string',
        ]);

        $activeSession = auth()->user()->activeSession();

        if (! $activeSession) {
            return response()->json(['error' => 'Tidak ada sesi aktif.'], 422);
        }

        $synced = 0;
        $failed = [];

        foreach ($request->transactions as $trxData) {
            try {
                DB::transaction(function () use ($trxData, $activeSession, &$synced) {
                    // Validasi stok per kios dulu, sama seperti transaksi online biasa
                    foreach ($trxData['items'] as $item) {
                        $productStock = \App\Models\ProductStock::where('product_id', $item['id'])
                            ->where('kios_id', $activeSession->kios_id)
                            ->first();

                        if (! $productStock || $productStock->stock < $item['qty']) {
                            $product = Product::find($item['id']);
                            $tersisa = $productStock?->stock ?? 0;
                            throw new \Exception("Stok {$product->name} di kios ini tidak cukup untuk sinkronisasi! Tersisa {$tersisa}.");
                        }
                    }

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

                        \App\Models\ProductStock::where('product_id', $item['id'])
                            ->where('kios_id', $activeSession->kios_id)
                            ->decrement('stock', $item['qty']);
                    }

                    AuditLog::record(
                        'transaction',
                        "Transaksi offline {$transaction->invoice_number} disinkronkan sebesar Rp " . number_format($total, 0, ',', '.'),
                        ['invoice' => $transaction->invoice_number, 'offline_id' => $trxData['offline_id'], 'kios_id' => $activeSession->kios_id]
                    );

                    $synced++;
                });
            } catch (\Exception $e) {
                $failed[] = ['offline_id' => $trxData['offline_id'], 'error' => $e->getMessage()];
            }
        }

        return response()->json(['synced' => $synced, 'failed' => $failed]);
    }

    public function cancel(Transaction $transaction)
    {
        if ($transaction->status === 'cancelled') {
            return back()->withErrors(['error' => 'Transaksi sudah dibatalkan.']);
        }

        DB::transaction(function () use ($transaction) {
            // Stok harus dikembalikan ke KIOS ASAL transaksi ini, bukan ke stok global
            $kiosId = $transaction->kasirSession->kios_id;

            foreach ($transaction->items as $item) {
                \App\Models\ProductStock::firstOrCreate(
                    ['product_id' => $item->product_id, 'kios_id' => $kiosId],
                    ['stock' => 0]
                )->increment('stock', $item->quantity);
            }

            $transaction->update(['status' => 'cancelled']);

            AuditLog::record(
                'transaction',
                "Transaksi {$transaction->invoice_number} dibatalkan — stok dikembalikan ke kios asalnya",
                ['invoice' => $transaction->invoice_number, 'kios_id' => $kiosId]
            );
        });

        return back()->with('success', 'Transaksi berhasil dibatalkan dan stok dikembalikan!');
    }
}
