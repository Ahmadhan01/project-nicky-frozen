import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Dashboard({ auth, products, kiosList, shifts, activeSession, flash }) {
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paidAmount, setPaidAmount] = useState('');
    const [showSessionModal, setShowSessionModal] = useState(!activeSession);
    const [selectedKios, setSelectedKios] = useState(null);
    const [selectedShift, setSelectedShift] = useState(null);
    const [receiptData, setReceiptData] = useState(null);

    // Tampilkan struk otomatis setelah transaksi berhasil
useEffect(() => {
    if (flash?.transaction) {
        setReceiptData(flash.transaction);
    }
}, [flash]);

    // Ambil kategori unik dari produk
    const categories = ['Semua', ...new Set(products.map(p => p.category?.name).filter(Boolean))];

    // Filter produk
    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = activeCategory === 'Semua' || p.category?.name === activeCategory;
        return matchSearch && matchCategory;
    });

    // Tambah ke keranjang
    const addToCart = (product) => {
        if (product.stock === 0) return;
        setCart(prev => {
            const exists = prev.find(i => i.id === product.id);
            if (exists) {
                return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    // Update qty
    const updateQty = (id, delta) => {
        setCart(prev => prev
            .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
            .filter(i => i.qty > 0)
        );
    };

    // Hapus item
    const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

    // Hitung total
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const change = paidAmount ? parseInt(paidAmount.replace(/\D/g, '')) - subtotal : 0;

    // Format rupiah
    const formatRp = (val) => 'Rp ' + Number(val).toLocaleString('id-ID');

    // Mulai sesi
    const startSession = () => {
        if (!selectedKios || !selectedShift) return;
        router.post(route('kasir.session.start'), {
            kios_id: selectedKios,
            shift_id: selectedShift,
        }, {
            onSuccess: () => setShowSessionModal(false),
        });
    };

    const processTransaction = () => {
    if (cart.length === 0) return;

    const paid = parseInt(paidAmount.replace(/\D/g, '')) || 0;

    if (paymentMethod === 'cash' && paid < subtotal) {
        alert('Uang pembayaran kurang!');
        return;
    }

    router.post(route('kasir.transaction.store'), {
    items: cart.map(i => ({
        id:    i.id,
        qty:   i.qty,
        price: i.price,
    })),
    paid_amount:    paid,
    payment_method: paymentMethod,
}, {
    onSuccess: (page) => {
        setCart([]);
        setPaidAmount('');
        if (page.props.flash?.transaction) {
            setReceiptData(page.props.flash.transaction);
        }
    },
});
};

    // Logout
    const logout = () => router.post(route('logout'));

    return (
        <>
            <Head title="Kasir - Nicky Frozen" />
            {flash?.success && (
    <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
        ✅ {flash.success}
    </div>
)}
            <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">

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
                        <button className="bg-[#1f2937] px-4 py-2 rounded-lg text-sm flex items-center gap-2 text-cyan-400">
                            🛒 Kasir
                        </button>
                        <button
    onClick={() => router.visit(route('kasir.history'))}
    className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 text-gray-400 hover:text-white"
>
    📋 Riwayat
</button>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">● Online</span>
                        <span className="text-sm text-gray-300">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="flex items-center gap-2 cursor-pointer" onClick={logout}>
                            <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm">{auth.user.name} ▾</span>
                        </div>
                    </div>
                </nav>

                {/* Info Sesi */}
                {activeSession && (
                    <div className="bg-[#161b22] px-6 py-2 flex items-center gap-6 text-xs text-gray-400 border-b border-gray-800">
                        <span>🏪 Kios: <strong className="text-white">{activeSession.kios?.name}</strong></span>
                        <span>🕐 Shift: <strong className="text-white">{activeSession.shift?.name}</strong></span>
                        <span>👤 User: <strong className="text-white">{auth.user.name}</strong></span>
                        <span>📅 <strong className="text-white">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                        <button onClick={() => setShowSessionModal(true)} className="ml-auto text-cyan-400 hover:underline">Ganti Sesi</button>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Kiri: Produk */}
                    <div className="flex-1 flex flex-col p-4 overflow-auto">

                        {/* Search */}
                        <div className="flex items-center bg-[#161b22] rounded-lg px-4 py-2 mb-4 gap-2 border border-gray-800">
                            <span className="text-gray-500">🔍</span>
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-transparent outline-none text-sm text-white placeholder-gray-500 w-full"
                            />
                        </div>

                        {/* Filter Kategori */}
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                                        activeCategory === cat
                                            ? 'bg-cyan-500 text-white'
                                            : 'bg-[#161b22] text-gray-400 hover:text-white border border-gray-700'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Grid Produk */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {filteredProducts.map(product => {
                                const inCart = cart.find(i => i.id === product.id);
                                const habis = product.stock === 0;
                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => !habis && addToCart(product)}
                                        className={`bg-[#161b22] rounded-xl p-3 border relative transition cursor-pointer
                                            ${habis ? 'opacity-50 cursor-not-allowed border-gray-800' : 'border-gray-800 hover:border-cyan-500'}`}
                                    >
                                        {inCart && (
                                            <span className="absolute top-2 right-2 bg-cyan-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                                {inCart.qty}
                                            </span>
                                        )}
                                        <div className="bg-[#0d1117] rounded-lg p-4 flex items-center justify-center mb-2">
                                            <span className="text-2xl">🍱</span>
                                        </div>
                                        <p className="text-sm font-medium leading-tight">{product.name}</p>
                                        <p className="text-cyan-400 font-bold text-sm mt-1">{formatRp(product.price)}</p>
                                        <p className={`text-xs mt-0.5 ${habis ? 'text-red-400' : 'text-gray-500'}`}>
                                            {habis ? 'habis' : `Stok: ${product.stock}`}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Kanan: Keranjang */}
                    <div className="w-80 bg-[#161b22] border-l border-gray-800 flex flex-col">
                        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-bold">Keranjang Belanja</span>
                                {cart.length > 0 && (
                                    <span className="bg-cyan-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{cart.length}</span>
                                )}
                            </div>
                            {cart.length > 0 && (
                                <button onClick={() => setCart([])} className="text-red-400 text-xs hover:underline">Hapus Semua</button>
                            )}
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-auto p-4 space-y-3">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                    <span className="text-4xl mb-2">🛒</span>
                                    <p className="text-sm">Belum ada item</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-2">
                                        <div className="bg-[#0d1117] p-2 rounded-lg">
                                            <span className="text-lg">🍱</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-gray-400">{formatRp(item.price)}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-[#0d1117] rounded text-sm hover:bg-gray-700">-</button>
                                            <span className="text-xs w-5 text-center">{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 bg-[#0d1117] rounded text-sm hover:bg-gray-700">+</button>
                                        </div>
                                        <span className="text-xs text-white min-w-fit">{formatRp(item.price * item.qty)}</span>
                                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer Keranjang */}
                        <div className="p-4 border-t border-gray-800 space-y-3">
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Subtotal ({cart.length} item)</span>
                                <span>{formatRp(subtotal)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{formatRp(subtotal)}</span>
                            </div>

                            {/* Metode Pembayaran */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                                        paymentMethod === 'cash' ? 'bg-cyan-500 text-white' : 'bg-[#0d1117] text-gray-400 border border-gray-700'
                                    }`}
                                >
                                    💵 Cash
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('transfer')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                                        paymentMethod === 'transfer' ? 'bg-cyan-500 text-white' : 'bg-[#0d1117] text-gray-400 border border-gray-700'
                                    }`}
                                >
                                    💳 Non-Tunai
                                </button>
                            </div>

                            {/* Uang Pembayaran */}
                            <input
                                type="text"
                                placeholder="Rp 0"
                                value={paidAmount}
                                onChange={e => setPaidAmount(e.target.value)}
                                className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 text-white"
                            />

                            {/* Kembalian */}
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Kembalian</span>
                                <span className={change < 0 ? 'text-red-400' : 'text-white'}>{formatRp(Math.max(0, change))}</span>
                            </div>

                            {/* Tombol Proses */}
                            <button
                            onClick={processTransaction}
                                disabled={cart.length === 0}
                                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                            >
                                📷 Proses Transaksi
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Setup Sesi */}
                {showSessionModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="bg-[#161b22] rounded-2xl p-6 w-full max-w-md border border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xl">⚙️</span>
                                <h2 className="text-lg font-bold">Setup Sesi Kasir</h2>
                            </div>
                            <p className="text-gray-400 text-sm mb-5">Pilih kios dan shift untuk sesi ini</p>

                            {/* Pilih Kios */}
                            <p className="text-sm font-medium mb-2">Kios</p>
                            <div className="space-y-2 mb-4">
                                {kiosList.map(kios => (
                                    <div
                                        key={kios.id}
                                        onClick={() => setSelectedKios(kios.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${
                                            selectedKios === kios.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-700 bg-[#0d1117] hover:border-gray-500'
                                        }`}
                                    >
                                        <span className="text-xl">🏪</span>
                                        <div>
                                            <p className="text-sm font-medium">{kios.name}</p>
                                            <p className="text-xs text-gray-400">{kios.location}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pilih Shift */}
                            <p className="text-sm font-medium mb-2">Shift</p>
                            <div className="space-y-2 mb-6">
                                {shifts.map(shift => (
                                    <div
                                        key={shift.id}
                                        onClick={() => setSelectedShift(shift.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${
                                            selectedShift === shift.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-700 bg-[#0d1117] hover:border-gray-500'
                                        }`}
                                    >
                                        <span className="text-xl">{shift.name.includes('Pagi') ? '☀️' : '🌙'}</span>
                                        <div>
                                            <p className="text-sm font-medium">{shift.name}</p>
                                            <p className="text-xs text-gray-400">{shift.start_time} - {shift.end_time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tombol */}
                            <div className="flex gap-3">
                                {activeSession && (
                                    <button
                                        onClick={() => setShowSessionModal(false)}
                                        className="flex-1 py-2 rounded-lg border border-gray-600 text-sm hover:bg-gray-800 transition"
                                    >
                                        Batal
                                    </button>
                                )}
                                <button
                                    onClick={startSession}
                                    disabled={!selectedKios || !selectedShift}
                                    className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
                                >
                                    Mulai Sesi
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modal Struk */}
{receiptData && (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-[#161b22] rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">

            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <span>🧾</span>
                    <span className="font-bold">Struk Pembayaran</span>
                </div>
                <button
                    onClick={() => setReceiptData(null)}
                    className="text-gray-400 hover:text-white text-xl"
                >✕</button>
            </div>

            {/* Isi Struk */}
            <div className="p-6">

                {/* Header Toko */}
                <div className="text-center mb-4">
                    <div className="bg-[#0d1117] w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl">🧾</span>
                    </div>
                    <p className="font-bold text-white">NICKY FROZEN</p>
                    <p className="text-xs text-gray-400">
                        {receiptData.kasir_session?.kios?.name} | {receiptData.kasir_session?.shift?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                        {new Date(receiptData.created_at).toLocaleString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">No: {receiptData.invoice_number}</p>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-gray-600 my-3" />

                {/* Items */}
                <div className="space-y-3 mb-3">
                    {receiptData.items?.map((item, i) => (
                        <div key={i} className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <div className="bg-[#0d1117] p-1.5 rounded">
                                    <span className="text-sm">🍱</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{item.product?.name}</p>
                                    <p className="text-xs text-gray-400">{item.quantity} x {formatRp(item.price)}</p>
                                </div>
                            </div>
                            <span className="text-sm font-medium">{formatRp(item.subtotal)}</span>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-gray-600 my-3" />

                {/* Total */}
                <div className="bg-[#0d1117] rounded-xl p-4 space-y-2">
                    <div className="flex justify-between font-bold text-base">
                        <span>TOTAL</span>
                        <span>{formatRp(receiptData.total_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>Pembayaran ({receiptData.payment_method === 'cash' ? 'Cash' : 'Non-Tunai'})</span>
                        <span>{formatRp(receiptData.paid_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-cyan-400">
                        <span>Kembalian</span>
                        <span>{formatRp(receiptData.change_amount)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-4 space-y-1">
                    <p className="text-xs text-gray-400">Kasir: {receiptData.user?.name}</p>
                    <p className="text-xs text-gray-500">✨ Terima kasih telah berbelanja! ✨</p>
                    <p className="text-xs text-gray-500">Simpan struk ini sebagai bukti pembelian.</p>
                </div>
            </div>

            {/* Tombol */}
            <div className="flex gap-3 px-6 pb-6">
                <button
                    onClick={() => setReceiptData(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-600 text-sm font-semibold hover:bg-gray-800 transition"
                >
                    Tutup
                </button>
                <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                    🖨️ Cetak
                </button>
            </div>
        </div>
    </div>
)}
            </div>
        </>
    );
}