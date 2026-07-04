import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import AdminNavbar from "@/Components/AdminNavbar";
import { AlertTriangle, Clock, Receipt, HelpCircle } from "lucide-react";

export default function Dashboard({
    auth,
    stats,
    lowStockProducts,
    expiringProducts,
    recentTransactions,
}) {
    const [showHelpModal, setShowHelpModal] = useState(false);
    const formatRp = (val) => "Rp " + Number(val).toLocaleString("id-ID");

    const formatDate = (val) =>
        new Date(val).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <>
            <Head title="Dashboard Admin" />
            <div className="h-screen bg-theme-bg text-theme-text flex flex-col overflow-hidden">
                {/* Navbar */}
                <AdminNavbar activeTab="dashboard" />

                {/* Content */}
                <div className="flex-1 w-full max-w-[1440px] mx-auto overflow-y-auto p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-theme-text">
                                Selamat datang, {auth.user.name} 👋
                            </h1>
                            <p className="text-theme-muted text-sm">
                                Ringkasan aktivitas hari ini
                            </p>
                        </div>
                        <button
                            onClick={() => setShowHelpModal(true)}
                            className="bg-theme-panel hover:bg-theme-border border border-theme-border text-theme-text font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition text-sm shadow-sm"
                        >
                            <HelpCircle className="w-4 h-4 text-theme-muted" /> Panduan
                        </button>
                    </div>

                    {/* Cards Stat */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-theme-panel rounded-xl p-5 border border-theme-border shadow-sm animate-slide-up" style={{ animationDelay: '50ms' }}>
                            <p className="text-theme-muted text-xs mb-1">
                                Omzet Hari Ini
                            </p>
                            <p className="text-2xl font-bold text-theme-accent">
                                {formatRp(stats.today_revenue)}
                            </p>
                        </div>
                        <div className="bg-theme-panel rounded-xl p-5 border border-theme-border shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
                            <p className="text-theme-muted text-xs mb-1">
                                Transaksi Hari Ini
                            </p>
                            <p className="text-2xl font-bold text-theme-text">
                                {stats.today_count}
                            </p>
                        </div>
                        <div
                            className="bg-theme-panel rounded-xl p-5 border border-theme-border cursor-pointer hover:border-theme-muted transition shadow-sm animate-slide-up"
                            style={{ animationDelay: '150ms' }}
                            onClick={() => router.visit(route("admin.products"))}
                        >
                            <p className="text-theme-muted text-xs mb-1 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-theme-muted" /> Stok Menipis
                            </p>
                            <p className="text-2xl font-bold text-theme-text">
                                {stats.low_stock_count}
                            </p>
                        </div>
                        <div
                            className="bg-theme-panel rounded-xl p-5 border border-theme-border cursor-pointer hover:border-theme-muted transition shadow-sm animate-slide-up"
                            style={{ animationDelay: '200ms' }}
                            onClick={() => router.visit(route("admin.products"))}
                        >
                            <p className="text-theme-muted text-xs mb-1 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-theme-muted" /> Mendekati Kadaluarsa
                            </p>
                            <p className="text-2xl font-bold text-theme-text">
                                {stats.expiring_count}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Stok Menipis / Kadaluarsa */}
                        <div className="bg-theme-panel rounded-xl border border-theme-border p-5 shadow-sm animate-slide-up" style={{ animationDelay: '250ms' }}>
                            <h2 className="font-semibold mb-3 flex items-center gap-2 text-theme-text">
                                <AlertTriangle className="w-4 h-4 text-theme-muted" /> Perlu Perhatian
                            </h2>
                            {lowStockProducts.length === 0 &&
                            expiringProducts.length === 0 ? (
                                <p className="text-theme-muted text-sm py-4 text-center">
                                    Semua aman, tidak ada yang perlu ditindak
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {lowStockProducts.map((p) => (
                                        <div
                                            key={`low-${p.id}`}
                                            className="flex items-center justify-between bg-theme-bg rounded-lg px-3 py-2 border border-theme-border"
                                        >
                                            <span className="text-sm text-theme-text font-medium">
                                                {p.name}
                                            </span>
                                            <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-500 dark:border-yellow-800/20 px-2 py-0.5 rounded-full font-semibold">
                                                Stok: {p.total_stock}
                                            </span>
                                        </div>
                                    ))}
                                    {expiringProducts.map((p) => (
                                        <div
                                            key={`exp-${p.id}`}
                                            className="flex items-center justify-between bg-theme-bg rounded-lg px-3 py-2 border border-theme-border"
                                        >
                                            <span className="text-sm text-theme-text font-medium">
                                                {p.name}
                                            </span>
                                            <span className="text-xs bg-orange-900/20 text-orange-500 border border-orange-800/20 px-2 py-0.5 rounded-full font-medium">
                                                Exp:{" "}
                                                {new Date(
                                                    p.expiry_date,
                                                ).toLocaleDateString("id-ID", {
                                                    day: "2-digit",
                                                    month: "short",
                                                })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Transaksi Terbaru */}
                        <div className="bg-theme-panel rounded-xl border border-theme-border p-5 shadow-sm animate-slide-up" style={{ animationDelay: '300ms' }}>
                            <h2 className="font-semibold mb-3 flex items-center gap-2 text-theme-text">
                                <Receipt className="w-4 h-4 text-theme-muted" /> Transaksi Terbaru
                            </h2>
                            {recentTransactions.length === 0 ? (
                                <p className="text-theme-muted text-sm py-4 text-center">
                                    Belum ada transaksi
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {recentTransactions.map((t) => (
                                        <div
                                            key={t.id}
                                            className="flex items-center justify-between bg-theme-bg rounded-lg px-3 py-2 border border-theme-border"
                                        >
                                            <div>
                                                <p className="text-sm text-theme-text font-medium">
                                                    {t.invoice_number ?? `#${t.id}`}
                                                </p>
                                                <p className="text-xs text-theme-muted mt-0.5">
                                                    {t.kasirSession?.kios?.name} ·{" "}
                                                    {formatDate(t.created_at)}
                                                </p>
                                            </div>
                                            <span className="text-theme-accent font-bold text-sm">
                                                {formatRp(t.total_amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showHelpModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-theme-panel rounded-2xl w-full max-w-lg border border-theme-border max-h-[85vh] flex flex-col text-theme-text shadow-2xl animate-modal-pop">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-theme-border shrink-0">
                            <div className="flex items-center gap-3">
                                <HelpCircle className="w-6 h-6 text-theme-accent" />
                                <h2 className="text-lg font-bold text-theme-text">
                                    Panduan Dasbor Admin
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="text-theme-muted hover:text-theme-text text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Isi Panduan - Scrollable */}
                        <div className="overflow-y-auto p-5 space-y-4">
                            <div className="flex gap-3">
                                <Clock className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm text-theme-text">
                                        1. Ringkasan Aktivitas
                                    </p>
                                    <p className="text-theme-muted text-sm mt-1">
                                        Melihat <strong>Omzet Hari Ini</strong>, <strong>Transaksi Hari Ini</strong>, <strong>Stok Menipis</strong>, dan produk <strong>Mendekati Kadaluarsa</strong> secara sekilas di bagian atas dasbor.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm text-theme-text">
                                        2. Perlu Perhatian (Alerts)
                                    </p>
                                    <p className="text-theme-muted text-sm mt-1">
                                        Daftar produk yang stoknya di bawah ambang batas minimum atau hampir kadaluarsa akan muncul di panel sebelah kiri untuk ditindaklanjuti.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Receipt className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm text-theme-text">
                                        3. Transaksi Terbaru
                                    </p>
                                    <p className="text-theme-muted text-sm mt-1">
                                        Menampilkan daftar transaksi paling baru yang dilakukan oleh kasir di berbagai kios.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-theme-border shrink-0">
                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="w-full bg-theme-accent hover:bg-theme-accent-hover text-white font-bold py-3 rounded-lg transition"
                            >
                                Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}