import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function Dashboard({
    auth,
    stats,
    lowStockProducts,
    expiringProducts,
    recentTransactions,
}) {
    const [time, setTime] = useState(new Date());
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatRp = (val) => "Rp " + Number(val).toLocaleString("id-ID");

    const formatDate = (val) =>
        new Date(val).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });

    const logout = () => router.post(route("logout"));

    return (
        <>
            <Head title="Dashboard Admin" />
            <div className="h-screen bg-[#0d1117] text-white flex flex-col overflow-hidden">
                {/* Navbar */}
                <nav className="bg-[#161b22] px-6 py-3 flex items-center justify-between border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <img
                            src="/LOGO_NO_TEXT.png"
                            alt="Nicky Frozen"
                            className="h-8 w-8 object-contain"
                        />
                        <div>
                            <p className="font-bold text-sm leading-none">
                                Nicky Frozen
                            </p>
                            <p className="text-gray-500 text-xs">
                                SISTEM KASIR
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="bg-[#1f2937] px-4 py-2 rounded-lg text-sm text-cyan-400 flex items-center gap-2">
                            🏠 Dashboard
                        </button>
                        <button
                            onClick={() => router.visit(route("admin.history"))}
                            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white flex items-center gap-2"
                        >
                            📋 Riwayat
                        </button>
                        <button
                            onClick={() => router.visit(route("admin.products"))}
                            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white flex items-center gap-2"
                        >
                            📦 Produk
                        </button>
                        <button
                            onClick={() => router.visit(route("admin.recap"))}
                            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white flex items-center gap-2"
                        >
                            📊 Rekap
                        </button>
                        <button
                            onClick={() => router.visit(route("admin.audit"))}
                            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white flex items-center gap-2"
                        >
                            🔍 Audit
                        </button>
                        {auth.user.role === "owner" && (
                            <button
                                onClick={() => router.visit(route("admin.master"))}
                                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white flex items-center gap-2"
                            >
                                👑 Master
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">
                            ● Online
                        </span>
                        <span className="text-sm text-gray-300">
                            {time.toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu((prev) => !prev)}
                                className="flex items-center gap-2 hover:opacity-80 transition"
                            >
                                <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold">
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm">{auth.user.name} ▾</span>
                            </button>

                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-[#161b22] border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-700">
                                            <p className="text-sm font-semibold text-white">
                                                {auth.user.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {auth.user.email}
                                            </p>
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
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold">
                            Selamat datang, {auth.user.name} 👋
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Ringkasan aktivitas hari ini
                        </p>
                    </div>

                    {/* Cards Stat */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-[#161b22] rounded-xl p-5 border border-gray-800">
                            <p className="text-gray-400 text-xs mb-1">
                                Omzet Hari Ini
                            </p>
                            <p className="text-2xl font-bold text-cyan-400">
                                {formatRp(stats.today_revenue)}
                            </p>
                        </div>
                        <div className="bg-[#161b22] rounded-xl p-5 border border-gray-800">
                            <p className="text-gray-400 text-xs mb-1">
                                Transaksi Hari Ini
                            </p>
                            <p className="text-2xl font-bold text-white">
                                {stats.today_count}
                            </p>
                        </div>
                        <div
                            className="bg-[#161b22] rounded-xl p-5 border border-gray-800 cursor-pointer hover:border-yellow-700 transition"
                            onClick={() => router.visit(route("admin.products"))}
                        >
                            <p className="text-gray-400 text-xs mb-1">
                                ⚠️ Stok Menipis
                            </p>
                            <p className="text-2xl font-bold text-yellow-400">
                                {stats.low_stock_count}
                            </p>
                        </div>
                        <div
                            className="bg-[#161b22] rounded-xl p-5 border border-gray-800 cursor-pointer hover:border-orange-700 transition"
                            onClick={() => router.visit(route("admin.products"))}
                        >
                            <p className="text-gray-400 text-xs mb-1">
                                ⏰ Mendekati Kadaluarsa
                            </p>
                            <p className="text-2xl font-bold text-orange-400">
                                {stats.expiring_count}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Stok Menipis / Kadaluarsa */}
                        <div className="bg-[#161b22] rounded-xl border border-gray-800 p-5">
                            <h2 className="font-semibold mb-3">
                                ⚠️ Perlu Perhatian
                            </h2>
                            {lowStockProducts.length === 0 &&
                            expiringProducts.length === 0 ? (
                                <p className="text-gray-500 text-sm py-4 text-center">
                                    Semua aman, tidak ada yang perlu ditindak
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {lowStockProducts.map((p) => (
                                        <div
                                            key={`low-${p.id}`}
                                            className="flex items-center justify-between bg-[#0d1117] rounded-lg px-3 py-2"
                                        >
                                            <span className="text-sm text-gray-300">
                                                {p.name}
                                            </span>
                                            <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded-full">
                                                Stok: {p.total_stock}
                                            </span>
                                        </div>
                                    ))}
                                    {expiringProducts.map((p) => (
                                        <div
                                            key={`exp-${p.id}`}
                                            className="flex items-center justify-between bg-[#0d1117] rounded-lg px-3 py-2"
                                        >
                                            <span className="text-sm text-gray-300">
                                                {p.name}
                                            </span>
                                            <span className="text-xs bg-orange-900/50 text-orange-400 px-2 py-0.5 rounded-full">
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
                        <div className="bg-[#161b22] rounded-xl border border-gray-800 p-5">
                            <h2 className="font-semibold mb-3">
                                🧾 Transaksi Terbaru
                            </h2>
                            {recentTransactions.length === 0 ? (
                                <p className="text-gray-500 text-sm py-4 text-center">
                                    Belum ada transaksi
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {recentTransactions.map((t) => (
                                        <div
                                            key={t.id}
                                            className="flex items-center justify-between bg-[#0d1117] rounded-lg px-3 py-2"
                                        >
                                            <div>
                                                <p className="text-sm text-gray-300">
                                                    {t.invoice_number ?? `#${t.id}`}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {t.kasirSession?.kios?.name} ·{" "}
                                                    {formatDate(t.created_at)}
                                                </p>
                                            </div>
                                            <span className="text-cyan-400 font-semibold text-sm">
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
        </>
    );
}