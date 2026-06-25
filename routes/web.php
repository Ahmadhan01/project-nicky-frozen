<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProfileController;

Route::get('/', function () {
    return redirect()->route('login');
});

// Route Kasir
Route::middleware(['auth', 'role:admin,kasir,owner'])->prefix('kasir')->name('kasir.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Kasir\DashboardController::class, 'index'])->name('dashboard');
    Route::post('/session/start', [\App\Http\Controllers\Kasir\DashboardController::class, 'startSession'])->name('session.start');
    Route::post('/transaction', [\App\Http\Controllers\Kasir\TransactionController::class, 'store'])->name('transaction.store');
    Route::post('/transaction/sync', [\App\Http\Controllers\Kasir\TransactionController::class, 'sync'])->name('transaction.sync');
    Route::patch('/transaction/{transaction}/cancel', [\App\Http\Controllers\Kasir\TransactionController::class, 'cancel'])->name('transaction.cancel');
    Route::get('/receipt/{transaction}', [\App\Http\Controllers\Kasir\ReceiptController::class, 'show'])->name('receipt.show');
    Route::get('/history', [\App\Http\Controllers\Kasir\TransactionController::class, 'index'])->name('history');
});

// Route Admin (tanpa Master)
Route::middleware(['auth', 'role:admin,owner'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        return redirect()->route('admin.products');
    })->name('dashboard');

    Route::get('/history', [\App\Http\Controllers\Admin\HistoryController::class, 'index'])->name('history');
    Route::patch('/transaction/{transaction}/cancel', [\App\Http\Controllers\Kasir\TransactionController::class, 'cancel'])->name('transaction.cancel');

    Route::get('/products', [\App\Http\Controllers\Admin\ProductController::class, 'index'])->name('products');
    Route::post('/products', [\App\Http\Controllers\Admin\ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'destroy'])->name('products.destroy');

    Route::post('/categories', [\App\Http\Controllers\Admin\ProductController::class, 'storeCategory'])->name('categories.store');
    Route::put('/categories/{category}', [\App\Http\Controllers\Admin\ProductController::class, 'updateCategory'])->name('categories.update');
    Route::delete('/categories/{category}', [\App\Http\Controllers\Admin\ProductController::class, 'destroyCategory'])->name('categories.destroy');

    Route::get('/recap', [\App\Http\Controllers\Admin\RecapController::class, 'index'])->name('recap');
    Route::get('/audit', [\App\Http\Controllers\Admin\AuditController::class, 'index'])->name('audit');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Route Master — khusus Owner saja
Route::middleware(['auth', 'role:owner'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/master', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('master');
    Route::post('/master', [\App\Http\Controllers\Admin\UserController::class, 'store'])->name('master.store');
    Route::put('/master/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('master.update');
    Route::delete('/master/{user}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('master.destroy');
});

Route::get('/csrf-refresh', function () {
    return response()->json(['token' => csrf_token()]);
})->middleware('web');

require __DIR__.'/auth.php';