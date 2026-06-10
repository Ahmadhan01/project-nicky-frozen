<?php

namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Models\Transaction;

class ReceiptController extends Controller
{
    public function show(Transaction $transaction)
    {
        // Pastikan hanya kasir yang memproses transaksi ini yang bisa lihat
        $transaction->load(['items.product', 'user', 'kasirSession.kios', 'kasirSession.shift']);

        return \Inertia\Inertia::render('Kasir/Receipt', [
            'transaction' => $transaction,
        ]);
    }
}