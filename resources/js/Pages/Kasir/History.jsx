import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function History({ auth, transactions, kiosList, shifts }) {
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [filterKios, setFilterKios] = useState('');
    const [filterShift, setFilterShift] = useState('');
    const [filterMethod, setFilterMethod] = useState('');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [cachedTransactions, setCachedTransactions] = useState([]);

const [time, setTime] = useState(new Date());

const [showUserMenu, setShowUserMenu] = useState(false);
const [showCancelConfirm, setShowCancelConfirm] = useState(false);

// Cache riwayat saat online
    useEffect(() => {
    // Selalu simpan data terbaru ke cache saat online
    if (navigator.onLine && transactions && transactions.length > 0) {
        localStorage.setItem('nicky_cached_transactions', JSON.stringify(transactions));
        localStorage.removeItem('nicky_offline_nav');
        setCachedTransactions(transactions);
    } else {
        // Ambil dari cache
        const cached = localStorage.getItem('nicky_cached_transactions');
        if (cached) setCachedTransactions(JSON.parse(cached));
    }
}, [transactions]);

    // Deteksi online/offline
   
useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
}, []);

    // Gunakan cachedTransactions kalau offline
    const displayTransactions = isOnline ? transactions : cachedTransactions;

useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
}, []);

    const formatRp = (val) => 'Rp ' + Number(val).toLocaleString('id-ID');
    const formatDate = (val) => new Date(val).toLocaleString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const applyFilter = () => {
        router.get(route('kasir.history'), {
            kios_id:        filterKios,
            shift_id:       filterShift,
            payment_method: filterMethod,
        }, { preserveState: true });
    };

    

    const logout = () => router.post(route('logout'));

    return (
        <>
            <Head title="Riwayat Transaksi" />
            {!isOnline && (
    <div className="bg-yellow-900/80 border-b border-yellow-700 px-6 py-3 flex items-center gap-3 text-yellow-300 text-sm">
        <span>⚠️</span>
        <span><strong>Mode Offline.</strong> Menampilkan data terakhir yang tersimpan.</span>
    </div>
)}
            <div className="h-screen bg-[#0d1117] text-white flex flex-col overflow-hidden">

                {/* Navbar */}
                <nav className="bg-[#161b22] px-6 py-3 flex items-center justify-between border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">❄️</span>
                        <div>
                            <p className="font-bold text-sm leading-none">Nicky Frozen</p>
                            <p className="text-gray-500 text-xs">SISTEM KASIR</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.visit(route('kasir.dashboard'))}
                            className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 text-gray-400 hover:text-white"
                        >
                            🛒 Kasir
                        </button>
                        <button className="bg-[#1f2937] px-4 py-2 rounded-lg text-sm flex items-center gap-2 text-cyan-400">
                            📋 Riwayat
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
    isOnline ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
}`}>
    ● {isOnline ? 'Online' : 'Offline'}
</span>
                        <span className="text-sm text-gray-300">
    {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
</span>
                        <div className="relative">
    <button
        onClick={() => setShowUserMenu(prev => !prev)}
        className="flex items-center gap-2 hover:opacity-80 transition"
    >
        <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold">
            {auth.user.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm">{auth.user.name} ▾</span>
    </button>

    {showUserMenu && (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-[#161b22] border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-semibold text-white">{auth.user.name}</p>
                    <p className="text-xs text-gray-400">{auth.user.email}</p>
                    <span className="text-xs bg-cyan-900/50 text-cyan-400 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
                        {auth.user.role}
                    </span>
                </div>
                <button
                    onClick={logout}
                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-900/30 transition flex items-center gap-2"
                >
                    🚪 Logout
                </button>
            </div>
        </>
    )}
</div>
                    </div>
                </nav>

                {/* Content */}
                {/* Content */}
<div className="flex-1 flex flex-col overflow-hidden p-6">

                    {/* Title */}
                    <div className="mb-4">
                        <h1 className="text-xl font-bold">Riwayat Transaksi</h1>
                        <p className="text-gray-400 text-sm">Semua transaksi yang telah diproses</p>
                    </div>

                    {/* Filter */}
                    <div className="flex gap-3 mb-5 flex-wrap">
                        <select
                            value={filterKios}
                            onChange={e => { setFilterKios(e.target.value); }}
                            onBlur={applyFilter}
                            className="bg-[#161b22] border border-gray-700 text-sm rounded-lg px-3 py-2 text-white outline-none"
                        >
                            <option value="">Semua Kios</option>
                            {kiosList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                        </select>

                        <select
                            value={filterShift}
                            onChange={e => { setFilterShift(e.target.value); }}
                            onBlur={applyFilter}
                            className="bg-[#161b22] border border-gray-700 text-sm rounded-lg px-3 py-2 text-white outline-none"
                        >
                            <option value="">Semua Shift</option>
                            {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>

                        <select
                            value={filterMethod}
                            onChange={e => { setFilterMethod(e.target.value); }}
                            onBlur={applyFilter}
                            className="bg-[#161b22] border border-gray-700 text-sm rounded-lg px-3 py-2 text-white outline-none"
                        >
                            <option value="">Semua Metode</option>
<option value="cash">Tunai</option>
<option value="non-tunai">Non-Tunai</option>
                        </select>

                        <button
                            onClick={applyFilter}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white text-sm px-4 py-2 rounded-lg transition"
                        >
                            Filter
                        </button>
                    </div>

                    {/* Tabel */}
                    {/* Tabel */}
<div className="flex-1 overflow-y-auto bg-[#161b22] rounded-xl border border-gray-800 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                                    <th className="px-4 py-3 text-left">ID Transaksi</th>
                                    <th className="px-4 py-3 text-left">Waktu</th>
                                    <th className="px-4 py-3 text-left">Kios</th>
                                    <th className="px-4 py-3 text-left">Shift</th>
                                    <th className="px-4 py-3 text-left">Items</th>
                                    <th className="px-4 py-3 text-left">Total</th>
                                    <th className="px-4 py-3 text-left">Metode</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-10 text-gray-500">
                                            Belum ada transaksi
                                        </td>
                                    </tr>
                                ) : (
                                    displayTransactions.map(trx => (
                                        <tr key={trx.id} className="border-b border-gray-800 hover:bg-[#1f2937] transition">
                                            <td className="px-4 py-3 font-mono text-xs text-gray-300">{trx.invoice_number}</td>
                                            <td className="px-4 py-3 text-gray-300">{formatDate(trx.created_at)}</td>
                                            <td className="px-4 py-3 text-gray-300">{trx.kasir_session?.kios?.name ?? '-'}</td>
                                            <td className="px-4 py-3 text-gray-300">{trx.kasir_session?.shift?.name ?? '-'}</td>
                                            <td className="px-4 py-3 text-gray-300">{trx.items?.length} item</td>
                                            <td className="px-4 py-3 font-bold text-white">{formatRp(trx.total_amount)}</td>
                                            <td className="px-4 py-3">
                                                <span className="bg-green-900/50 text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                                                    💵 {trx.payment_method === 'cash' ? 'Cash' : trx.payment_method === 'transfer' ? 'Transfer' : 'QRIS'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
    <span className={`text-xs flex items-center gap-1 ${
        trx.status === 'cancelled' ? 'text-red-400' : 'text-green-400'
    }`}>
        {trx.status === 'cancelled' ? '✕ Dibatalkan' : '✓ Selesai'}
    </span>
</td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => setSelectedTransaction(trx)}
                                                    className="bg-[#0d1117] border border-gray-700 hover:border-cyan-500 text-xs px-3 py-1.5 rounded-lg transition"
                                                >
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Detail Transaksi */}
                {selectedTransaction && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#161b22] rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                                <div className="flex items-center gap-2">
                                    <span>📄</span>
                                    <span className="font-bold">Detail Transaksi</span>
                                </div>
                                <button onClick={() => setSelectedTransaction(null)} className="text-gray-400 hover:text-white">✕</button>
                            </div>

                            {/* Info Grid */}
                            <div className="p-6 space-y-4 overflow-auto flex-1">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#0d1117] rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-1">ID TRANSAKSI</p>
                                        <p className="text-sm font-mono font-medium">{selectedTransaction.invoice_number}</p>
                                    </div>
                                    <div className="bg-[#0d1117] rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-1">WAKTU</p>
                                        <p className="text-sm font-medium">{formatDate(selectedTransaction.created_at)}</p>
                                    </div>
                                    <div className="bg-[#0d1117] rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-1">KIOS</p>
                                        <p className="text-sm font-medium">{selectedTransaction.kasir_session?.kios?.name ?? '-'}</p>
                                    </div>
                                    <div className="bg-[#0d1117] rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-1">SHIFT</p>
                                        <p className="text-sm font-medium">{selectedTransaction.kasir_session?.shift?.name ?? '-'}</p>
                                    </div>
                                    <div className="bg-[#0d1117] rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-1">KASIR</p>
                                        <p className="text-sm font-medium">{selectedTransaction.user?.name}</p>
                                    </div>
                                    <div className="bg-[#0d1117] rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-1">METODE</p>
                                        <p className="text-sm font-medium flex items-center gap-1">
                                            <span className="text-green-400">💵</span>
                                            {selectedTransaction.payment_method === 'cash' ? 'Cash' : selectedTransaction.payment_method === 'transfer' ? 'Transfer' : 'QRIS'}
                                        </p>
                                    </div>
                                </div>

                                {/* Detail Item */}
                                <div>
                                    <p className="text-sm font-semibold mb-2">Detail Item</p>
                                    <div className="bg-[#0d1117] rounded-xl overflow-hidden">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-800 text-gray-500">
                                                    <th className="px-3 py-2 text-left">PRODUK</th>
                                                    <th className="px-3 py-2 text-center">QTY</th>
                                                    <th className="px-3 py-2 text-right">HARGA</th>
                                                    <th className="px-3 py-2 text-right">SUBTOTAL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedTransaction.items?.map((item, i) => (
                                                    <tr key={i} className="border-b border-gray-800">
                                                        <td className="px-3 py-2 flex items-center gap-2">
                                                            <span className="bg-gray-800 p-1 rounded">🍱</span>
                                                            {item.product?.name}
                                                        </td>
                                                        <td className="px-3 py-2 text-center">{item.quantity}</td>
                                                        <td className="px-3 py-2 text-right">{formatRp(item.price)}</td>
                                                        <td className="px-3 py-2 text-right">{formatRp(item.subtotal)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total</span>
                                        <span className="font-bold">{formatRp(selectedTransaction.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Dibayar</span>
                                        <span>{formatRp(selectedTransaction.paid_amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-cyan-400">Kembalian</span>
                                        <span className="text-cyan-400 font-semibold">{formatRp(selectedTransaction.change_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 px-6 pb-6">
                                {selectedTransaction.status !== 'cancelled' && (
                                    <button
                                        onClick={() => setShowCancelConfirm(true)}
                                        className="flex-1 py-2.5 rounded-xl bg-red-900/50 hover:bg-red-800 text-red-400 text-sm font-semibold transition"
                                    >
                                        🚫 Batalkan Transaksi
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-600 text-sm font-semibold hover:bg-gray-800 transition"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Konfirmasi Batalkan — fixed overlay terpisah, di dalam selectedTransaction guard */}
                {selectedTransaction && showCancelConfirm && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-6">
                        <div className="bg-[#1c2333] rounded-2xl w-full max-w-xs border border-gray-700 shadow-2xl overflow-hidden">
                            <div className="p-6 flex flex-col items-center text-center">
                                <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-2xl">
                                    ⚠️
                                </div>
                                <p className="text-white font-semibold text-base">Batalkan Transaksi?</p>
                                <p className="text-gray-400 text-xs mt-2">
                                    Transaksi {selectedTransaction.invoice_number} akan dibatalkan. Stok akan dikembalikan secara otomatis.
                                </p>
                            </div>
                            <div className="flex border-t border-gray-700">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="flex-1 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-700/50 transition border-r border-gray-700"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        router.patch(route('kasir.transaction.cancel', selectedTransaction.id), {}, {
                                            onSuccess: () => {
                                                setShowCancelConfirm(false);
                                                setSelectedTransaction(null);
                                            },
                                        });
                                    }}
                                    className="flex-1 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition"
                                >
                                    Batalkan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
            </div>
        </>
    );
}