import { Head, router } from '@inertiajs/react';
import { Printer, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Receipt({ transaction }) {
    const [isLight, setIsLight] = useState(false);
    useEffect(() => {
        setIsLight(document.documentElement.classList.contains("light"));
    }, []);

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
            <div className="min-h-screen bg-theme-bg flex flex-col items-center justify-center p-6 pb-24 text-theme-text">

                {/* Struk */}
                <div className="bg-theme-panel text-theme-text rounded-2xl shadow-xl w-full max-w-sm p-6 border border-theme-border/60 print:shadow-none print:rounded-none print:bg-white print:text-black print:border-none" id="receipt">

                    {/* Header */}
                    <div className="text-center mb-4 flex flex-col items-center">
                        <img 
                            src={isLight ? "/niki_fullblack_v2.png" : "/niki_fullwhite_v2.png"} 
                            alt="Nicky Frozen" 
                            className="h-12 w-12 object-contain mb-2 print:hidden" 
                        />
                        <img 
                            src="/niki_fullblack_v2.png" 
                            alt="Nicky Frozen" 
                            className="h-12 w-12 object-contain mb-2 hidden print:block" 
                        />
                        <h1 className="font-bold text-xl text-theme-text print:text-black">Nicky Frozen</h1>
                        <p className="text-xs text-theme-muted print:text-gray-500">Sistem Kasir</p>
                        <p className="text-xs text-theme-muted mt-1 print:text-gray-500 font-medium">
                            {transaction.kasir_session?.kios?.name} — {transaction.kasir_session?.shift?.name}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-theme-border print:border-gray-300 my-3" />

                    {/* Info Transaksi */}
                    <div className="text-xs space-y-1 mb-3 text-theme-text print:text-black">
                        <div className="flex justify-between">
                            <span className="text-theme-muted print:text-gray-500">No. Invoice</span>
                            <span className="font-medium">{transaction.invoice_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-theme-muted print:text-gray-500">Tanggal</span>
                            <span className="font-medium text-right">{formatDate(transaction.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-theme-muted print:text-gray-500">Kasir</span>
                            <span className="font-medium">{transaction.user?.name}</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-theme-border print:border-gray-300 my-3" />

                    {/* Items */}
                    <div className="space-y-2 mb-3 text-theme-text print:text-black">
                        {transaction.items?.map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs">
                                    <span className="font-semibold">{item.product?.name}</span>
                                    <span className="font-medium">{formatRp(item.subtotal)}</span>
                                </div>
                                <div className="text-xs text-theme-muted print:text-gray-500">
                                    {item.quantity} x {formatRp(item.price)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-theme-border print:border-gray-300 my-3" />

                    {/* Total */}
                    <div className="space-y-1 text-xs mb-3 text-theme-text print:text-black">
                        <div className="flex justify-between text-theme-muted print:text-gray-500">
                            <span>Subtotal</span>
                            <span>{formatRp(transaction.total_amount)}</span>
                        </div>
                        <div className="flex justify-between text-theme-muted print:text-gray-500">
                            <span>Metode</span>
                            <span className="capitalize font-medium">{transaction.payment_method}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base mt-2">
                            <span>Total</span>
                            <span>{formatRp(transaction.total_amount)}</span>
                        </div>
                        <div className="flex justify-between text-theme-muted print:text-gray-500">
                            <span>Bayar</span>
                            <span>{formatRp(transaction.paid_amount)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-theme-accent print:text-green-600">
                            <span>Kembalian</span>
                            <span>{formatRp(transaction.change_amount)}</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-theme-border print:border-gray-300 my-3" />

                    {/* Footer */}
                    <p className="text-center text-xs text-theme-muted print:text-gray-500">Terima kasih telah berbelanja!</p>
                    <p className="text-center text-xs text-theme-muted print:text-gray-500 font-semibold mt-0.5">Nicky Frozen</p>
                </div>

                {/* Tombol Aksi */}
                <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-3 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="bg-theme-accent hover:bg-theme-accent-hover text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4 text-white" /> Cetak Struk
                    </button>
                    <button
                        onClick={handleBack}
                        className="bg-theme-panel hover:bg-theme-border text-theme-text font-semibold px-6 py-3 rounded-xl shadow-lg border border-theme-border transition flex items-center gap-2"
                    >
                        <ShoppingCart className="w-4 h-4 text-theme-accent" /> Transaksi Baru
                    </button>
                </div>
            </div>
        </>
    );
}