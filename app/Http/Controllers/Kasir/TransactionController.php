<?php

namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        DB::transaction(function () use ($request, $activeSession) {
            // Hitung total
            $total = collect($request->items)->sum(fn($i) => $i['price'] * $i['qty']);

            // Buat transaksi
            $transaction = Transaction::create([
                'user_id'           => auth()->id(),
                'kasir_session_id'  => $activeSession->id,
                'invoice_number'    => Transaction::generateInvoiceNumber(),
                'total_amount'      => $total,
                'paid_amount'       => $request->paid_amount,
                'change_amount'     => $request->paid_amount - $total,
                'payment_method'    => $request->payment_method,
                'status'            => 'completed',
            ]);

            // Simpan item & kurangi stok
            foreach ($request->items as $item) {
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id'     => $item['id'],
                    'quantity'       => $item['qty'],
                    'price'          => $item['price'],
                    'subtotal'       => $item['price'] * $item['qty'],
                ]);

                // Kurangi stok produk
                Product::where('id', $item['id'])->decrement('stock', $item['qty']);
            }
        });

        return redirect()->route('kasir.dashboard')->with('success', 'Transaksi berhasil!');
    }
}