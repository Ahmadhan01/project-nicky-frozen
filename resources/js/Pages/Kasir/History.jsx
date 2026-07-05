import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import KasirNavbar from "@/Components/KasirNavbar";
import {
    HelpCircle,
    Search,
    FileText,
    Printer,
    AlertTriangle,
    Wifi,
    ShoppingCart,
    Phone,
    WifiOff,
} from "lucide-react";

export default function History({ auth, transactions, kiosList, shifts }) {
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [filterKios, setFilterKios] = useState("");
    const [filterShift, setFilterShift] = useState("");
    const [filterMethod, setFilterMethod] = useState("");
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [cachedTransactions, setCachedTransactions] = useState([]);

    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);

    // Cache riwayat saat online
    useEffect(() => {
        // Selalu simpan data terbaru ke cache saat online
        if (navigator.onLine && transactions && transactions.length > 0) {
            localStorage.setItem(
                "nicky_cached_transactions",
                JSON.stringify(transactions),
            );
            localStorage.removeItem("nicky_offline_nav");
            setCachedTransactions(transactions);
        } else {
            // Ambil dari cache
            const cached = localStorage.getItem("nicky_cached_transactions");
            if (cached) setCachedTransactions(JSON.parse(cached));
        }
    }, [transactions]);

    // Deteksi online/offline

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Gunakan cachedTransactions kalau offline
    const displayTransactions = isOnline ? transactions : cachedTransactions;

    const formatRp = (val) => "Rp " + Number(val).toLocaleString("id-ID");
    const formatDate = (val) =>
        new Date(val).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const printReceipt = (transaction) => {
        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Struk - ${transaction.invoice_number}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; background: #fff; width: 280px; margin: 0 auto; padding: 16px; }
                    .center { text-align: center; }
                    .bold { font-weight: bold; }
                    .large { font-size: 15px; }
                    .divider { border-top: 1px dashed #000; margin: 8px 0; }
                    .row { display: flex; justify-content: space-between; margin: 3px 0; }
                    .item-name { font-weight: bold; margin-top: 4px; }
                    .item-detail { color: #555; font-size: 11px; }
                    .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin: 4px 0; }
                    .footer { text-align: center; margin-top: 8px; font-size: 11px; color: #555; }
                    .cancelled { text-align: center; color: #c00; font-weight: bold; margin-top: 8px; border: 1px dashed #c00; padding: 4px; }
                </style>
            </head>
            <body>
                <div class="center">
                    <div class="bold large">NICKY FROZEN</div>
                    <div>${transaction.kasir_session?.kios?.name ?? ""} | ${transaction.kasir_session?.shift?.name ?? ""}</div>
                    <div>${new Date(transaction.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                    <div>No: ${transaction.invoice_number}</div>
                </div>
                <div class="divider"></div>
                ${transaction.items
                    ?.map(
                        (item) => `
                    <div>
                        <div class="row">
                            <span class="item-name">${item.product?.name}</span>
                            <span class="bold">Rp ${Number(item.subtotal).toLocaleString("id-ID")}</span>
                        </div>
                        <div class="item-detail">${item.quantity} x Rp ${Number(item.price).toLocaleString("id-ID")}</div>
                    </div>
                `,
                    )
                    .join("")}
                <div class="divider"></div>
                <div class="total-row">
                    <span>TOTAL</span>
                    <span>Rp ${Number(transaction.total_amount).toLocaleString("id-ID")}</span>
                </div>
                <div class="row">
                    <span>Pembayaran (${transaction.payment_method === "cash" ? "Cash" : "Non-Tunai"})</span>
                    <span>Rp ${Number(transaction.paid_amount).toLocaleString("id-ID")}</span>
                </div>
                <div class="row">
                    <span>Kembalian</span>
                    <span>Rp ${Number(transaction.change_amount).toLocaleString("id-ID")}</span>
                </div>
                <div class="divider"></div>
                ${transaction.status === "cancelled" ? '<div class="cancelled">*** TRANSAKSI DIBATALKAN ***</div>' : ""}
                <div class="footer">
                    <div>Kasir: ${transaction.user?.name}</div>
                    <div>Terima kasih telah berbelanja!</div>
                    <div>Cetak ulang struk pembayaran.</div>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open("", "_blank", "width=350,height=600");
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);
    };

    const applyFilter = () => {
        router.get(
            route("kasir.history"),
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
            <Head title="Riwayat Transaksi" />
            {!isOnline && (
                <div className="bg-yellow-900/80 border-b border-yellow-700 px-4 sm:px-6 py-3 flex flex-wrap items-start sm:items-center gap-3 text-yellow-300 text-sm">
                    <WifiOff className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5 sm:mt-0" />
                    <span>
                        <strong>Mode Offline.</strong> Menampilkan data terakhir
                        yang tersimpan.
                    </span>
                </div>
            )}
            <div className="min-h-screen lg:h-screen bg-theme-bg text-theme-text flex flex-col lg:overflow-hidden">
                {/* Navbar */}
                <KasirNavbar
                    activeTab="history"
                    isOnline={isOnline}
                    onHelpClick={() => setShowHelpModal(true)}
                />

                {/* Content */}
                <div className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col overflow-y-auto lg:overflow-hidden p-4 sm:p-6">
                    {/* Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-theme-text">
                                Riwayat Transaksi
                            </h1>
                            <p className="text-theme-muted text-sm">
                                Semua transaksi yang telah diproses
                            </p>
                        </div>
                        <button
                            onClick={() => setShowHelpModal(true)}
                            className="self-start sm:self-auto bg-theme-panel hover:bg-theme-border border border-theme-border text-theme-text font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition text-sm shadow-sm whitespace-nowrap"
                        >
                            <HelpCircle className="w-4 h-4 text-theme-muted" />{" "}
                            Panduan
                        </button>
                    </div>

                    {/* Filter */}
                    <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 mb-5 sm:flex-wrap">
                        <select
                            value={filterKios}
                            onChange={(e) => {
                                setFilterKios(e.target.value);
                            }}
                            onBlur={applyFilter}
                            className="bg-theme-panel border border-theme-border text-sm rounded-lg pl-3 pr-8 py-2 text-theme-text outline-none focus:border-theme-accent w-full sm:w-auto"
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
                            onChange={(e) => {
                                setFilterShift(e.target.value);
                            }}
                            onBlur={applyFilter}
                            className="bg-theme-panel border border-theme-border text-sm rounded-lg pl-3 pr-8 py-2 text-theme-text outline-none focus:border-theme-accent w-full sm:w-auto"
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
                            onChange={(e) => {
                                setFilterMethod(e.target.value);
                            }}
                            onBlur={applyFilter}
                            className="bg-theme-panel border border-theme-border text-sm rounded-lg pl-3 pr-8 py-2 text-theme-text outline-none focus:border-theme-accent w-full sm:w-auto"
                        >
                            <option value="">Semua Metode</option>
                            <option value="cash">Tunai</option>
                            <option value="non-tunai">Non-Tunai</option>
                        </select>

                        <button
                            onClick={applyFilter}
                            className="col-span-2 sm:col-auto bg-theme-accent hover:bg-theme-accent-hover text-white text-sm px-4 py-2 rounded-lg transition shadow-sm w-full sm:w-auto"
                        >
                            Filter
                        </button>
                    </div>

                    {/* Tabel - tampil di layar medium ke atas */}
                    <div className="hidden md:block flex-1 overflow-y-auto bg-theme-panel rounded-xl border border-theme-border overflow-hidden shadow-sm">
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
                                {displayTransactions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="text-center py-10 text-theme-muted"
                                        >
                                            Belum ada transaksi
                                        </td>
                                    </tr>
                                ) : (
                                    displayTransactions.map((trx) => (
                                        <tr
                                            key={trx.id}
                                            className="border-b border-theme-border hover:bg-theme-border/30 transition text-theme-text"
                                        >
                                            <td className="px-4 py-3 font-mono text-xs text-theme-muted">
                                                {trx.invoice_number}
                                            </td>
                                            <td className="px-4 py-3 text-theme-muted">
                                                {formatDate(trx.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-theme-muted">
                                                {trx.kasir_session?.kios
                                                    ?.name ?? "-"}
                                            </td>
                                            <td className="px-4 py-3 text-theme-muted">
                                                {trx.kasir_session?.shift
                                                    ?.name ?? "-"}
                                            </td>
                                            <td className="px-4 py-3 text-theme-muted">
                                                {trx.items?.length} item
                                            </td>
                                            <td className="px-4 py-3 font-bold text-theme-text">
                                                {formatRp(trx.total_amount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="bg-green-900/10 text-green-500 border border-green-500/20 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 w-fit font-medium">
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
                                                    className={`text-xs flex items-center gap-1 font-semibold ${
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
                                                    className="bg-theme-bg border border-theme-border text-theme-accent hover:border-theme-accent text-xs px-3 py-1.5 rounded-lg transition shadow-sm font-medium"
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

                    {/* List Kartu - tampil khusus mobile */}
                    <div className="md:hidden flex-1 overflow-y-auto space-y-3">
                        {displayTransactions.length === 0 ? (
                            <div className="text-center py-10 text-theme-muted bg-theme-panel rounded-xl border border-theme-border text-sm">
                                Belum ada transaksi
                            </div>
                        ) : (
                            displayTransactions.map((trx) => (
                                <div
                                    key={trx.id}
                                    className="bg-theme-panel rounded-xl border border-theme-border p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2.5">
                                        <div className="min-w-0">
                                            <p className="font-mono text-xs text-theme-muted truncate">
                                                {trx.invoice_number}
                                            </p>
                                            <p className="text-xs text-theme-muted mt-0.5">
                                                {formatDate(trx.created_at)}
                                            </p>
                                        </div>
                                        <span
                                            className={`text-xs flex items-center gap-1 font-semibold shrink-0 ${
                                                trx.status === "cancelled"
                                                    ? "text-red-500"
                                                    : "text-green-500"
                                            }`}
                                        >
                                            {trx.status === "cancelled"
                                                ? "✕ Dibatalkan"
                                                : "✓ Selesai"}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-theme-muted mb-3">
                                        <span>
                                            🏪{" "}
                                            {trx.kasir_session?.kios?.name ??
                                                "-"}
                                        </span>
                                        <span className="text-theme-border">
                                            •
                                        </span>
                                        <span>
                                            🕐{" "}
                                            {trx.kasir_session?.shift?.name ??
                                                "-"}
                                        </span>
                                        <span className="text-theme-border">
                                            •
                                        </span>
                                        <span>{trx.items?.length} item</span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="bg-green-900/10 text-green-500 border border-green-500/20 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium shrink-0">
                                                💵{" "}
                                                {trx.payment_method === "cash"
                                                    ? "Cash"
                                                    : trx.payment_method ===
                                                        "transfer"
                                                      ? "Transfer"
                                                      : "QRIS"}
                                            </span>
                                            <span className="font-bold text-theme-text text-sm truncate">
                                                {formatRp(trx.total_amount)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setSelectedTransaction(trx)
                                            }
                                            className="bg-theme-bg border border-theme-border text-theme-accent hover:border-theme-accent text-xs px-3 py-1.5 rounded-lg transition shadow-sm font-medium shrink-0"
                                        >
                                            Detail
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Modal Detail Transaksi */}
                {selectedTransaction && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-theme-panel rounded-2xl w-full max-w-lg border border-theme-border shadow-2xl flex flex-col max-h-[90vh] text-theme-text">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-theme-border shrink-0">
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

                            {/* Info Grid */}
                            <div className="p-4 sm:p-6 space-y-4 overflow-auto flex-1">
                                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                                    <div className="bg-theme-bg rounded-xl p-2.5 sm:p-3 border border-theme-border/50 shadow-inner">
                                        <p className="text-xs text-theme-muted mb-1 font-semibold uppercase">
                                            ID TRANSAKSI
                                        </p>
                                        <p className="text-sm font-mono font-medium text-theme-text break-all">
                                            {selectedTransaction.invoice_number}
                                        </p>
                                    </div>
                                    <div className="bg-theme-bg rounded-xl p-2.5 sm:p-3 border border-theme-border/50 shadow-inner">
                                        <p className="text-xs text-theme-muted mb-1 font-semibold uppercase">
                                            WAKTU
                                        </p>
                                        <p className="text-sm font-medium text-theme-text">
                                            {formatDate(
                                                selectedTransaction.created_at,
                                            )}
                                        </p>
                                    </div>
                                    <div className="bg-theme-bg rounded-xl p-2.5 sm:p-3 border border-theme-border/50 shadow-inner">
                                        <p className="text-xs text-theme-muted mb-1 font-semibold uppercase">
                                            KIOS
                                        </p>
                                        <p className="text-sm font-medium text-theme-text">
                                            {selectedTransaction.kasir_session
                                                ?.kios?.name ?? "-"}
                                        </p>
                                    </div>
                                    <div className="bg-theme-bg rounded-xl p-2.5 sm:p-3 border border-theme-border/50 shadow-inner">
                                        <p className="text-xs text-theme-muted mb-1 font-semibold uppercase">
                                            SHIFT
                                        </p>
                                        <p className="text-sm font-medium text-theme-text">
                                            {selectedTransaction.kasir_session
                                                ?.shift?.name ?? "-"}
                                        </p>
                                    </div>
                                    <div className="bg-theme-bg rounded-xl p-2.5 sm:p-3 border border-theme-border/50 shadow-inner">
                                        <p className="text-xs text-theme-muted mb-1 font-semibold uppercase">
                                            KASIR
                                        </p>
                                        <p className="text-sm font-medium text-theme-text">
                                            {selectedTransaction.user?.name}
                                        </p>
                                    </div>
                                    <div className="bg-theme-bg rounded-xl p-2.5 sm:p-3 border border-theme-border/50 shadow-inner">
                                        <p className="text-xs text-theme-muted mb-1 font-semibold uppercase">
                                            METODE
                                        </p>
                                        <p className="text-sm font-semibold flex items-center gap-1 text-theme-text">
                                            <span className="text-green-500">
                                                💵
                                            </span>
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

                                {/* Detail Item */}
                                <div>
                                    <p className="text-sm font-semibold mb-2 text-theme-text">
                                        Detail Item
                                    </p>
                                    <div className="bg-theme-bg rounded-xl overflow-hidden border border-theme-border/50 overflow-x-auto">
                                        <table className="w-full text-xs min-w-[420px] sm:min-w-0">
                                            <thead>
                                                <tr className="border-b border-theme-border text-theme-muted bg-theme-panel/30">
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
                                                            <td className="px-3 py-2 flex items-center gap-2">
                                                                <span className="bg-theme-panel border border-theme-border p-1 rounded">
                                                                    🍱
                                                                </span>
                                                                {
                                                                    item.product
                                                                        ?.name
                                                                }
                                                            </td>
                                                            <td className="px-3 py-2 text-center font-medium">
                                                                {item.quantity}
                                                            </td>
                                                            <td className="px-3 py-2 text-right text-theme-muted">
                                                                {formatRp(
                                                                    item.price,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2 text-right font-semibold">
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

                                {/* Total */}
                                <div className="space-y-1 text-sm bg-theme-bg/30 p-4 rounded-xl border border-theme-border/50">
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
                                    <div className="flex justify-between text-theme-muted text-xs mt-1">
                                        <span>Dibayar</span>
                                        <span className="text-theme-text">
                                            {formatRp(
                                                selectedTransaction.paid_amount,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-theme-accent font-semibold mt-1">
                                        <span>Kembalian</span>
                                        <span className="text-theme-accent font-bold">
                                            {formatRp(
                                                selectedTransaction.change_amount,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 shrink-0 border-t border-theme-border pt-4">
                                {selectedTransaction.status !== "cancelled" && (
                                    <button
                                        onClick={() =>
                                            setShowCancelConfirm(true)
                                        }
                                        className="w-full py-2.5 rounded-xl bg-red-900/10 hover:bg-red-900/20 text-red-500 text-sm font-semibold transition border border-red-500/20 shadow-sm"
                                    >
                                        🚫 Batalkan Transaksi
                                    </button>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() =>
                                            printReceipt(selectedTransaction)
                                        }
                                        className="flex-1 py-2.5 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white text-sm font-semibold transition flex items-center justify-center gap-2 shadow"
                                    >
                                        🖨️ Cetak Struk
                                    </button>
                                    <button
                                        onClick={() =>
                                            setSelectedTransaction(null)
                                        }
                                        className="flex-1 py-2.5 rounded-xl border border-theme-border text-sm font-semibold hover:bg-theme-border transition text-theme-text"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Konfirmasi Batalkan */}
                {selectedTransaction && showCancelConfirm && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 sm:p-6">
                        <div className="bg-theme-panel rounded-2xl w-full max-w-xs border border-theme-border shadow-2xl overflow-hidden text-theme-text">
                            <div className="p-5 sm:p-6 flex flex-col items-center text-center">
                                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-2xl">
                                    ⚠️
                                </div>
                                <p className="text-theme-text font-bold text-base">
                                    Batalkan Transaksi?
                                </p>
                                <p className="text-theme-muted text-xs mt-2 leading-relaxed">
                                    Transaksi{" "}
                                    <strong className="text-theme-text">
                                        {selectedTransaction.invoice_number}
                                    </strong>{" "}
                                    akan dibatalkan. Stok akan dikembalikan
                                    secara otomatis.
                                </p>
                            </div>
                            <div className="flex border-t border-theme-border">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="flex-1 py-3 text-sm font-semibold text-theme-text hover:bg-theme-border/50 transition border-r border-theme-border"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        router.patch(
                                            route(
                                                "kasir.transaction.cancel",
                                                selectedTransaction.id,
                                            ),
                                            {},
                                            {
                                                onSuccess: () => {
                                                    setShowCancelConfirm(false);
                                                    setSelectedTransaction(
                                                        null,
                                                    );
                                                },
                                            },
                                        );
                                    }}
                                    className="flex-1 py-3 text-sm font-semibold text-red-500 hover:bg-red-900/10 transition"
                                >
                                    Batalkan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Bantuan Halaman Riwayat */}
                {showHelpModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-theme-panel rounded-2xl w-full max-w-lg border border-theme-border max-h-[85vh] flex flex-col text-theme-text shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-theme-border shrink-0">
                                <div className="flex items-center gap-3">
                                    <HelpCircle className="w-6 h-6 text-theme-accent" />
                                    <h2 className="text-lg font-bold text-theme-text">
                                        Panduan Halaman Riwayat
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
                            <div className="overflow-y-auto p-4 sm:p-5 space-y-4 text-theme-text">
                                <div className="flex gap-3">
                                    <FileText className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            1. Melihat Daftar Transaksi
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Halaman ini menampilkan semua
                                            transaksi yang pernah dibuat,
                                            lengkap dengan ID, waktu, dan
                                            statusnya.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Search className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            2. Menyaring (Filter) Transaksi
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Gunakan pilihan{" "}
                                            <strong>Kios</strong>,{" "}
                                            <strong>Shift</strong>, atau{" "}
                                            <strong>Metode Bayar</strong> di
                                            bagian atas tabel, lalu tekan tombol{" "}
                                            <strong>"Filter"</strong> untuk
                                            mempersempit hasil pencarian.
                                            Contoh: mau lihat transaksi Tunai
                                            shift pagi saja.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <FileText className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            3. Melihat Detail Transaksi
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Tekan tombol{" "}
                                            <strong>"Detail"</strong> pada baris
                                            transaksi yang ingin dilihat. Akan
                                            muncul rincian barang yang dibeli,
                                            total, uang dibayar, dan kembalian.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Printer className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            4. Cetak Ulang Struk
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Di jendela Detail Transaksi, tekan{" "}
                                            <strong>"Cetak Struk"</strong> kalau
                                            pelanggan minta struk lagi atau
                                            struk sebelumnya hilang.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            5. Membatalkan Transaksi
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Di jendela Detail Transaksi, tekan{" "}
                                            <strong className="text-red-500">
                                                "Batalkan Transaksi"
                                            </strong>{" "}
                                            kalau ada kesalahan input. Akan
                                            muncul konfirmasi — tekan{" "}
                                            <strong>"Batalkan"</strong> untuk
                                            memastikan. Stok barang otomatis
                                            dikembalikan.
                                            <br />
                                            <span className="text-theme-muted flex items-center gap-1 mt-1">
                                                <AlertTriangle className="w-3.5 h-3.5 text-theme-accent" />{" "}
                                                Transaksi yang sudah dibatalkan
                                                tidak bisa diaktifkan lagi.
                                                Pastikan yakin sebelum menekan
                                                tombol ini.
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Wifi className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            6. Kalau Internet Mati
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Muncul tulisan{" "}
                                            <strong className="text-theme-accent">
                                                "Mode Offline"
                                            </strong>{" "}
                                            di atas halaman. Kamu tetap bisa
                                            melihat riwayat transaksi terakhir
                                            yang tersimpan, tapi data terbaru
                                            baru muncul setelah internet kembali
                                            online.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <ShoppingCart className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            7. Kembali ke Halaman Kasir
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Tekan tombol{" "}
                                            <strong>"Kasir"</strong> di pojok
                                            kiri atas untuk kembali melayani
                                            transaksi baru.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Phone className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            Masih Bingung?
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Hubungi admin/pemilik toko kalau ada
                                            kendala yang tidak bisa diatasi
                                            sendiri.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 sm:p-5 border-t border-theme-border shrink-0">
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
            </div>
        </>
    );
}
