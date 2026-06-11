import { Head, router } from '@inertiajs/react';

export default function Receipt({ transaction }) {
    const formatRp = (val) => 'Rp ' + Number(val).toLocaleString('id-ID');
    const formatDate = (val) => new Date(val).toLocaleString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const handlePrint = () => window.print();
    const handleBack = () => router.visit(route('kasir.dashboard'));


    return (
        <>
            <Head title="Struk Transaksi" />
            <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">

                {/* Struk */}
                <div className="bg-white text-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 print:shadow-none print:rounded-none" id="receipt">

                    {/* Header */}
                    <div className="text-center mb-4">
                        <div className="text-3xl mb-1">❄️</div>
                        <h1 className="font-bold text-xl">Nicky Frozen</h1>
                        <p className="text-xs text-gray-500">Sistem Kasir</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {transaction.kasir_session?.kios?.name} — {transaction.kasir_session?.shift?.name}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-gray-300 my-3" />

                    {/* Info Transaksi */}
                    <div className="text-xs space-y-1 mb-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">No. Invoice</span>
                            <span className="font-medium">{transaction.invoice_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Tanggal</span>
                            <span className="font-medium text-right">{formatDate(transaction.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Kasir</span>
                            <span className="font-medium">{transaction.user?.name}</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-gray-300 my-3" />

                    {/* Items */}
                    <div className="space-y-2 mb-3">
                        {transaction.items?.map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs">
                                    <span className="font-medium">{item.product?.name}</span>
                                    <span>{formatRp(item.subtotal)}</span>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {item.quantity} x {formatRp(item.price)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-gray-300 my-3" />

                    {/* Total */}
                    <div className="space-y-1 text-xs mb-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Subtotal</span>
                            <span>{formatRp(transaction.total_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Metode</span>
                            <span className="capitalize">{transaction.payment_method}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base mt-2">
                            <span>Total</span>
                            <span>{formatRp(transaction.total_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Bayar</span>
                            <span>{formatRp(transaction.paid_amount)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-green-600">
                            <span>Kembalian</span>
                            <span>{formatRp(transaction.change_amount)}</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-gray-300 my-3" />

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-400">Terima kasih telah berbelanja!</p>
                    <p className="text-center text-xs text-gray-400">Nicky Frozen 🧊</p>
                </div>

                {/* Tombol Aksi */}
                <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-3 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition"
                    >
                        🖨️ Cetak Struk
                    </button>
                    <button
                        onClick={handleBack}
                        className="bg-[#161b22] hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg border border-gray-700 transition"
                    >
                        🛒 Transaksi Baru
                    </button>
                </div>
            </div>
        </>
    );
}