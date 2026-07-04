import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import AdminNavbar from "@/Components/AdminNavbar";
import { Ban, FileText, AlertTriangle, HelpCircle } from "lucide-react";

export default function History({ auth, transactions, kiosList, shifts }) {
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [filterKios, setFilterKios] = useState("");
    const [filterShift, setFilterShift] = useState("");
    const [filterMethod, setFilterMethod] = useState("");

    const formatRp = (val) => "Rp " + Number(val).toLocaleString("id-ID");
    const formatDate = (val) =>
        new Date(val).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const applyFilter = () => {
        router.get(
            route("admin.history"),
            {
                kios_id: filterKios,
                shift_id: filterShift,
                payment_method: filterMethod,
            },
            { preserveState: true },
        );
    };

    return (
        <>
            <Head title="Riwayat Transaksi - Admin" />
            <div className="h-screen bg-theme-bg text-theme-text flex flex-col overflow-hidden">
                {/* Navbar */}
                <AdminNavbar activeTab="history" />

                {/* Content */}
                <div className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col overflow-hidden p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-theme-text">Riwayat Transaksi</h1>
                            <p className="text-theme-muted text-sm">
                                Semua transaksi yang telah diproses
                            </p>
                        </div>
                        <button
                            onClick={() => setShowHelpModal(true)}
                            className="bg-theme-panel hover:bg-theme-border border border-theme-border text-theme-text font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition text-sm shadow-sm"
                        >
                            <HelpCircle className="w-4 h-4 text-theme-muted" /> Panduan
                        </button>
                    </div>

                    {/* Filter */}
                    <div className="flex gap-3 mb-5 flex-wrap">
                        <select
                            value={filterKios}
                            onChange={(e) => setFilterKios(e.target.value)}
                            onBlur={applyFilter}
                            className="bg-theme-panel border border-theme-border text-sm rounded-lg pl-3 pr-8 py-2 text-theme-text outline-none focus:border-theme-accent"
                        >
                            <option value="">Semua Kios</option>
                            {kiosList.map((k) => (
                                <option key={k.id} value={k.id}>
                                    {k.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filterShift}
                            onChange={(e) => setFilterShift(e.target.value)}
                            onBlur={applyFilter}
                            className="bg-theme-panel border border-theme-border text-sm rounded-lg pl-3 pr-8 py-2 text-theme-text outline-none focus:border-theme-accent"
                        >
                            <option value="">Semua Shift</option>
                            {shifts.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filterMethod}
                            onChange={(e) => setFilterMethod(e.target.value)}
                            onBlur={applyFilter}
                            className="bg-theme-panel border border-theme-border text-sm rounded-lg pl-3 pr-8 py-2 text-theme-text outline-none focus:border-theme-accent"
                        >
                            <option value="">Semua Metode</option>
                            <option value="cash">Tunai</option>
                            <option value="non-tunai">Non-Tunai</option>
                        </select>
                        <button
                            onClick={applyFilter}
                            className="bg-theme-accent hover:bg-theme-accent-hover text-white text-sm px-4 py-2 rounded-lg transition font-medium shadow-sm"
                        >
                            Filter
                        </button>
                    </div>

                    {/* Tabel */}
                    <div className="flex-1 overflow-y-auto bg-theme-panel rounded-xl border border-theme-border overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-theme-border text-theme-muted text-xs uppercase bg-theme-bg/50">
                                    <th className="px-4 py-3 text-left">
                                        ID Transaksi
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Waktu
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Kasir
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Kios
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Shift
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Items
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Total
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Metode
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="text-center py-10 text-theme-muted"
                                        >
                                            Belum ada transaksi
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((trx) => (
                                        <tr
                                            key={trx.id}
                                            className="border-b border-theme-border hover:bg-theme-border/30 transition text-theme-text"
                                        >
                                            <td className="px-4 py-3 font-mono text-xs text-theme-muted">
                                                {trx.invoice_number}
                                            </td>
                                            <td className="px-4 py-3 text-theme-text text-sm">
                                                {formatDate(trx.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-theme-text text-sm">
                                                {trx.user?.name}
                                            </td>
                                            <td className="px-4 py-3 text-theme-text text-sm">
                                                {trx.kasir_session?.kios
                                                    ?.name ?? "-"}
                                            </td>
                                            <td className="px-4 py-3 text-theme-text text-sm">
                                                {trx.kasir_session?.shift
                                                    ?.name ?? "-"}
                                            </td>
                                            <td className="px-4 py-3 text-theme-text text-sm">
                                                {trx.items?.length} item
                                            </td>
                                            <td className="px-4 py-3 font-bold text-theme-text text-sm">
                                                {formatRp(trx.total_amount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="bg-green-900/20 border border-green-800/20 text-green-500 text-xs px-2 py-1 rounded-full font-medium">
                                                    💵{" "}
                                                    {trx.payment_method ===
                                                    "cash"
                                                        ? "Cash"
                                                        : trx.payment_method ===
                                                            "transfer"
                                                          ? "Transfer"
                                                          : "QRIS"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`text-xs font-semibold ${
                                                        trx.status ===
                                                        "cancelled"
                                                            ? "text-red-500"
                                                            : "text-green-500"
                                                    }`}
                                                >
                                                    {trx.status === "cancelled"
                                                        ? "✕ Dibatalkan"
                                                        : "✓ Selesai"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() =>
                                                        setSelectedTransaction(
                                                            trx,
                                                        )
                                                    }
                                                    className="bg-theme-bg border border-theme-border hover:border-theme-accent text-xs px-3 py-1.5 rounded-lg transition text-theme-text font-medium"
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

                {/* Modal Detail */}
                {selectedTransaction && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-theme-panel rounded-2xl w-full max-w-lg border border-theme-border shadow-2xl flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-theme-accent" />
                                    <span className="font-bold text-theme-text">
                                        Detail Transaksi
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="text-theme-muted hover:text-theme-text"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6 space-y-4 overflow-auto flex-1 text-theme-text">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-theme-bg rounded-xl p-3 border border-theme-border/50">
                                        <p className="text-xs text-theme-muted mb-1 font-semibold uppercase">
                                            ID TRANSAKSI
                                        </p>
                                        <p className="text-sm font-mono font-medium text-theme-text">
                                            {selectedTransaction.invoice_number}
                                        </p>
                                    </div>
                                    <div className="bg-theme-bg rounded-xl p-3 border border-theme-border/50">
                                        <p className="text-xs text-theme-muted mb-1 font-semibold uppercase">
                                            WAKTU
                                        </p>
                                        <p className="text-sm font-medium text-theme-text">
                                            {formatDate(
                                                selectedTransaction.created_at,
                                            )}
                                        </p>
                                    </div>
                                    <div className="bg-theme-bg rounded-xl p-3 border border-theme-border/50">
                                        <p className="text-xs text-theme-muted mb-1 font-semibold uppercase">
                                            KASIR
                                        </p>
                                        <p className="text-sm font-medium text-theme-text">
                                            {selectedTransaction.user?.name}
                                        </p>
                                    </div>
                                    <div className="bg-theme-bg rounded-xl p-3 border border-theme-border/50">
                                        <p className="text-xs text-theme-muted mb-1 font-semibold uppercase">
                                            KIOS
                                        </p>
                                        <p className="text-sm font-medium text-theme-text">
                                            {selectedTransaction.kasir_session
                                                ?.kios?.name ?? "-"}
                                        </p>
                                    </div>
                                    <div className="bg-theme-bg rounded-xl p-3 border border-theme-border/50">
                                        <p className="text-xs text-theme-muted mb-1 font-semibold uppercase">
                                            SHIFT
                                        </p>
                                        <p className="text-sm font-medium text-theme-text">
                                            {selectedTransaction.kasir_session
                                                ?.shift?.name ?? "-"}
                                        </p>
                                    </div>
                                    <div className="bg-theme-bg rounded-xl p-3 border border-theme-border/50">
                                        <p className="text-xs text-theme-muted mb-1 font-semibold uppercase">
                                            METODE
                                        </p>
                                        <p className="text-sm font-medium text-green-500">
                                            💵{" "}
                                            {selectedTransaction.payment_method ===
                                            "cash"
                                                ? "Cash"
                                                : selectedTransaction.payment_method ===
                                                    "transfer"
                                                  ? "Transfer"
                                                  : "QRIS"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold mb-2 text-theme-text">
                                        Detail Item
                                    </p>
                                    <div className="bg-theme-bg rounded-xl overflow-hidden border border-theme-border">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-theme-border text-theme-muted bg-theme-bg/50 font-semibold">
                                                    <th className="px-3 py-2 text-left">
                                                        PRODUK
                                                    </th>
                                                    <th className="px-3 py-2 text-center">
                                                        QTY
                                                    </th>
                                                    <th className="px-3 py-2 text-right">
                                                        HARGA
                                                    </th>
                                                    <th className="px-3 py-2 text-right">
                                                        SUBTOTAL
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedTransaction.items?.map(
                                                    (item, i) => (
                                                        <tr
                                                            key={i}
                                                            className="border-b border-theme-border text-theme-text"
                                                        >
                                                            <td className="px-3 py-2 font-medium">
                                                                {
                                                                    item.product
                                                                        ?.name
                                                                }
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                {item.quantity}
                                                            </td>
                                                            <td className="px-3 py-2 text-right text-theme-muted">
                                                                {formatRp(
                                                                    item.price,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2 text-right font-medium">
                                                                {formatRp(
                                                                    item.subtotal,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="space-y-1 text-sm border-t border-theme-border pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-theme-muted">
                                            Total
                                        </span>
                                        <span className="font-bold text-theme-text text-base">
                                            {formatRp(
                                                selectedTransaction.total_amount,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-theme-muted">
                                            Dibayar
                                        </span>
                                        <span className="text-theme-text">
                                            {formatRp(
                                                selectedTransaction.paid_amount,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-theme-accent font-semibold">
                                            Kembalian
                                        </span>
                                        <span className="text-theme-accent font-bold">
                                            {formatRp(
                                                selectedTransaction.change_amount,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 px-6 pb-6 pt-3 border-t border-theme-border shrink-0">
                                {selectedTransaction.status !== "cancelled" && (
                                    <button
                                        onClick={() =>
                                            setShowCancelConfirm(true)
                                        }
                                        className="flex-1 py-2.5 rounded-xl bg-red-900/10 hover:bg-red-900/20 border border-red-500/20 text-red-500 text-sm font-semibold transition flex items-center justify-center gap-2"
                                    >
                                        <Ban className="w-4 h-4 text-red-500" /> Batalkan Transaksi
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-theme-border text-sm font-semibold hover:bg-theme-border transition text-theme-text"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Modal Konfirmasi Batalkan Transaksi */}
            {showCancelConfirm && selectedTransaction && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
                    <div className="bg-theme-panel rounded-2xl w-full max-w-sm border border-theme-border p-6 text-center shadow-2xl flex flex-col items-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
                        <h2 className="font-bold text-lg mb-2 text-theme-text">
                            Batalkan Transaksi?
                        </h2>
                        <p className="text-theme-muted text-sm mb-1">
                            Transaksi{" "}
                            <strong className="text-theme-text">
                                {selectedTransaction.invoice_number}
                            </strong>{" "}
                            akan dibatalkan.
                        </p>
                        <p className="text-theme-muted text-sm mb-5">
                            Stok akan dikembalikan secara otomatis.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl border text-theme-text border-theme-border text-sm font-semibold hover:bg-theme-border transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => {
                                    router.patch(
                                        route(
                                            "admin.transaction.cancel",
                                            selectedTransaction.id,
                                        ),
                                        {},
                                        {
                                            onSuccess: () => {
                                                setShowCancelConfirm(false);
                                                setSelectedTransaction(null);
                                            },
                                        },
                                    );
                                }}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition"
                            >
                                Batalkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showHelpModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-theme-panel rounded-2xl w-full max-w-lg border border-theme-border max-h-[85vh] flex flex-col text-theme-text shadow-2xl animate-modal-pop">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-theme-border shrink-0">
                            <div className="flex items-center gap-3">
                                <HelpCircle className="w-6 h-6 text-theme-accent" />
                                <h2 className="text-lg font-bold text-theme-text">
                                    Panduan Riwayat Transaksi
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
                                <FileText className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm text-theme-text">
                                        1. Melacak Transaksi
                                    </p>
                                    <p className="text-theme-muted text-sm mt-1">
                                        Semua transaksi yang dilakukan oleh kasir terdaftar di sini secara urut waktu. Anda dapat mencari berdasarkan Kios, Shift, atau Metode Pembayaran.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Ban className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm text-theme-text">
                                        2. Batalkan Transaksi
                                    </p>
                                    <p className="text-theme-muted text-sm mt-1">
                                        Admin dapat membatalkan transaksi yang salah input. Pembatalan akan otomatis mengembalikan stok barang ke database.
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
