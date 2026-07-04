import { Head, router, usePage } from "@inertiajs/react";
import { useState, useEffect, useCallback } from "react";
import KasirNavbar from "@/Components/KasirNavbar";
import { 
    AlertTriangle, 
    WifiOff, 
    RefreshCw, 
    CheckCircle2, 
    Settings, 
    Store, 
    Sun, 
    Moon, 
    FileText, 
    Package, 
    Printer,
    HelpCircle,
    Lock,
    ShoppingCart,
    Plus,
    History,
    LogOut,
    Phone,
    Wifi,
    Search
} from "lucide-react";

export default function Dashboard({
    auth,
    products,
    kiosList,
    shifts,
    activeSession,
    flash,
}) {
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [paidAmount, setPaidAmount] = useState("");
    const [showSessionModal, setShowSessionModal] = useState(!activeSession);
    const [selectedKios, setSelectedKios] = useState(null);
    const [selectedShift, setSelectedShift] = useState(null);
    const [receiptData, setReceiptData] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineQueue, setOfflineQueue] = useState(() => {
        const saved = localStorage.getItem("nicky_offline_queue");
        return saved ? JSON.parse(saved) : [];
    });
    const [isSyncing, setIsSyncing] = useState(false);
    const [showOfflineToast, setShowOfflineToast] = useState(false);
    const [alertModal, setAlertModal] = useState(null);
    const [showHelpModal, setShowHelpModal] = useState(false);

    // Tampilkan struk otomatis setelah transaksi berhasil
    useEffect(() => {
        if (flash?.transaction) {
            setReceiptData(flash.transaction);
        }
    }, [flash]);

    // Sync offline queue
    const syncOfflineQueue = useCallback(async () => {
        const queue = JSON.parse(
            localStorage.getItem("nicky_offline_queue") || "[]",
        );
        if (queue.length === 0) return;

        setIsSyncing(true);
        try {
            const csrfResponse = await fetch("/csrf-refresh");
            const csrfData = await csrfResponse.json();
            const csrfToken = csrfData.token;

            const response = await fetch(route("kasir.transaction.sync"), {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({ transactions: queue }),
            });

            if (response.ok) {
                localStorage.removeItem("nicky_offline_queue");
                setOfflineQueue([]);
                // Tampilkan notifikasi dulu, baru reload
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (e) {
            console.error("Sync failed:", e);
        } finally {
            setIsSyncing(false);
        }
    }, []);

    // Deteksi online/offline
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
        };
        const handleOffline = () => {
            setIsOnline(false);
            setShowOfflineToast(true);
            setTimeout(() => setShowOfflineToast(false), 5000);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    useEffect(() => {
        if (isOnline) {
            syncOfflineQueue();
        }
    }, [isOnline]);

    // Ambil kategori unik dari produk
    const categories = [
        "Semua",
        ...new Set(products.map((p) => p.category?.name).filter(Boolean)),
    ];

    // Filter produk
    const filteredProducts = products.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory =
            activeCategory === "Semua" || p.category?.name === activeCategory;
        return matchSearch && matchCategory;
    });

    // Stok tersisa tiap produk (dikurangi qty yang sudah di keranjang)
    const productsWithRemaining = products.map((p) => ({
        ...p,
        remainingStock: p.stock - (cart.find((i) => i.id === p.id)?.qty || 0),
    }));

    // Produk dengan stok menipis (real-time, ikut isi keranjang)
    const lowStockProducts = productsWithRemaining.filter(
        (p) => p.remainingStock > 0 && p.remainingStock <= (p.min_stock ?? 5),
    );

    // Tambah ke keranjang — batasi sesuai stok
    const addToCart = (product) => {
        if (product.stock === 0) return;
        setCart((prev) => {
            const exists = prev.find((i) => i.id === product.id);
            if (exists) {
                // Cek apakah qty sudah melebihi stok
                if (exists.qty >= product.stock) {
                    setAlertModal({
                        type: "alert",
                        message: `Stok ${product.name} hanya tersisa ${product.stock}, tidak bisa menambah lagi!`,
                    });
                    return prev;
                }
                return prev.map((i) =>
                    i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
                );
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    // Update qty — batasi sesuai stok
    const updateQty = (id, delta) => {
        setCart((prev) =>
            prev
                .map((i) => {
                    if (i.id === id) {
                        const newQty = i.qty + delta;
                        if (newQty > i.stock) {
                            setAlertModal({
                                type: "alert",
                                message: `Stok ${i.name} hanya tersisa ${i.stock}!`,
                            });
                            return i;
                        }
                        return { ...i, qty: newQty };
                    }
                    return i;
                })
                .filter((i) => i.qty > 0),
        );
    };

    // Set qty langsung dari input — batasi sesuai stok
    const setQtyDirect = (id, value) => {
        const parsed = parseInt(value);
        if (isNaN(parsed) || value === "") {
            // Biarkan kosong sementara user mengetik
            setCart((prev) =>
                prev.map((i) => (i.id === id ? { ...i, qtyInput: value } : i)),
            );
            return;
        }
        if (parsed <= 0) {
            removeItem(id);
            return;
        }
        setCart((prev) =>
            prev.map((i) => {
                if (i.id !== id) return i;
                if (parsed > i.stock) {
                    setAlertModal({
                        type: "alert",
                        message: `Stok ${i.name} hanya tersisa ${i.stock}!`,
                    });
                    return { ...i, qty: i.stock, qtyInput: String(i.stock) };
                }
                return { ...i, qty: parsed, qtyInput: String(parsed) };
            }),
        );
    };

    const commitQtyInput = (id) => {
        setCart((prev) =>
            prev
                .map((i) => {
                    if (i.id !== id) return i;
                    const parsed = parseInt(i.qtyInput);
                    if (isNaN(parsed) || parsed <= 0) return null;
                    return { ...i, qty: parsed, qtyInput: undefined };
                })
                .filter(Boolean),
        );
    };

    // Hapus item
    const removeItem = (id) =>
        setCart((prev) => prev.filter((i) => i.id !== id));

    // Hitung total
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const change = paidAmount
        ? parseInt(paidAmount.replace(/\D/g, "")) - subtotal
        : 0;

    // Format rupiah
    const formatRp = (val) => "Rp " + Number(val).toLocaleString("id-ID");

    // Mulai sesi
    const startSession = () => {
        if (!selectedKios || !selectedShift) return;
        router.post(
            route("kasir.session.start"),
            {
                kios_id: selectedKios,
                shift_id: selectedShift,
            },
            {
                onSuccess: () => setShowSessionModal(false),
            },
        );
    };



    // Proses transaksi
    const processTransaction = () => {
        if (cart.length === 0) return;

        const paid =
            paymentMethod === "cash"
                ? parseInt(paidAmount.replace(/\D/g, "")) || 0
                : subtotal;

        if (paymentMethod === "cash" && paid < subtotal) {
            setAlertModal({
                type: "alert",
                message: "Uang pembayaran kurang!",
            });
            return;
        }

        // Kalau offline, simpan ke localStorage
        if (!isOnline) {
            const offlineId = "offline_" + Date.now();
            const newTransaction = {
                offline_id: offlineId,
                items: cart.map((i) => ({
                    id: i.id,
                    qty: i.qty,
                    price: i.price,
                })),
                paid_amount: paid,
                payment_method: paymentMethod,
            };

            const updatedQueue = [...offlineQueue, newTransaction];
            localStorage.setItem(
                "nicky_offline_queue",
                JSON.stringify(updatedQueue),
            );
            setOfflineQueue(updatedQueue);
            setCart([]);
            setPaidAmount("");
            setAlertModal({
                type: "alert",
                message: `Transaksi disimpan offline! Total tersimpan: ${updatedQueue.length} transaksi.`,
            });
            return;
        }

        // Online — proses normal
        router.post(
            route("kasir.transaction.store"),
            {
                items: cart.map((i) => ({
                    id: i.id,
                    qty: i.qty,
                    price: i.price,
                })),
                paid_amount: paid,
                payment_method: paymentMethod,
            },
            {
                onSuccess: () => {
                    setCart([]);
                    setPaidAmount("");
                    fetch(route("kasir.transaction.last"), {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                        credentials: "same-origin",
                    })
                        .then((r) => r.json())
                        .then((transaction) => {
                            if (transaction) {
                                setReceiptData(transaction);
                            } else {
                                router.reload({ only: ["products"] });
                            }
                        })
                        .catch(() => router.reload({ only: ["products"] }));
                },
                onError: (errors) => {
                    if (errors.stock) {
                        setAlertModal({ type: "alert", message: errors.stock });
                        router.reload({ only: ["products"] });
                    } else if (errors.session) {
                        setAlertModal({
                            type: "alert",
                            message: errors.session,
                        });
                    }
                },
            },
        );
    };

    // Logout
    const logout = () => router.post(route("logout"));

    const printReceipt = () => {
        const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Struk - ${receiptData.invoice_number}</title>
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
            </style>
        </head>
        <body>
            <div class="center">
                <div class="bold large">NICKY FROZEN</div>
                <div>${receiptData.kasir_session?.kios?.name ?? ""} | ${receiptData.kasir_session?.shift?.name ?? ""}</div>
                <div>${new Date(receiptData.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                <div>No: ${receiptData.invoice_number}</div>
            </div>
            <div class="divider"></div>
            ${receiptData.items
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
                <span>Rp ${Number(receiptData.total_amount).toLocaleString("id-ID")}</span>
            </div>
            <div class="row">
                <span>Pembayaran (${receiptData.payment_method === "cash" ? "Cash" : "Non-Tunai"})</span>
                <span>Rp ${Number(receiptData.paid_amount).toLocaleString("id-ID")}</span>
            </div>
            <div class="row">
                <span>Kembalian</span>
                <span>Rp ${Number(receiptData.change_amount).toLocaleString("id-ID")}</span>
            </div>
            <div class="divider"></div>
            <div class="footer">
                <div>Kasir: ${receiptData.user?.name}</div>
                <div>Terima kasih telah berbelanja!</div>
                <div>Simpan struk ini sebagai bukti pembelian.</div>
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

    const AlertModal = () => {
        if (!alertModal) return null;
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4 animate-fade-in">
                <div className="bg-theme-panel rounded-2xl w-full max-w-sm border border-theme-border shadow-2xl overflow-hidden flex flex-col items-center animate-modal-pop">
                    <div className="p-6 flex flex-col items-center text-center">
                        <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                                alertModal.type === "confirm"
                                    ? "bg-red-500/20 text-red-500"
                                    : "bg-yellow-500/20 text-yellow-500"
                            }`}
                        >
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <p className="text-theme-text font-semibold text-base leading-snug">
                            {alertModal.message}
                        </p>
                    </div>
                    <div className="w-full flex border-t border-theme-border">
                        {alertModal.type === "confirm" && (
                            <button
                                onClick={() => setAlertModal(null)}
                                className="flex-1 py-3 text-sm font-semibold text-theme-muted hover:bg-theme-bg/50 transition border-r border-theme-border"
                            >
                                Batal
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (alertModal.onConfirm) {
                                    alertModal.onConfirm();
                                }
                                setAlertModal(null);
                            }}
                            className={`flex-1 py-3 text-sm font-semibold transition ${
                                alertModal.type === "confirm"
                                    ? "text-red-500 hover:bg-red-500/10"
                                    : "text-theme-accent hover:bg-theme-accent/10"
                            }`}
                        >
                            {alertModal.type === "confirm"
                                ? "Ya, Batalkan"
                                : "OK"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const FlashToast = ({ message }) => {
        return (
            <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-toast-in">
                <CheckCircle2 className="w-5 h-5 text-white" /> {message}
            </div>
        );
    };

    return (
        <>
            <Head title="Kasir - Nicky Frozen" />
            {/* Banner Offline */}
            {!isOnline && (
                <div className="bg-yellow-900/80 border-b border-yellow-700 px-6 py-3 flex items-center gap-3 text-yellow-300 text-sm">
                    <WifiOff className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>
                        <strong>Mode Offline Aktif.</strong>{" "}
                        {offlineQueue.length} transaksi tersimpan lokal — data
                        akan disinkronkan otomatis saat online kembali.
                    </span>
                </div>
            )}

            {/* Banner Stok Menipis */}
            {lowStockProducts.length > 0 && (
                <div className="bg-orange-900/80 border-b border-orange-700 px-6 py-2 flex items-center gap-3 text-orange-300 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>
                        <strong>Stok Menipis!</strong>{" "}
                        {lowStockProducts
                            .map((p) => `${p.name} (${p.remainingStock})`)
                            .join(", ")}
                    </span>
                </div>
            )}

            {/* Banner Syncing */}
            {isSyncing && (
                <div className="bg-blue-900/80 border-b border-blue-700 px-6 py-3 flex items-center gap-3 text-blue-300 text-sm">
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                    <span>
                        <strong>
                            Menyinkronkan {offlineQueue.length} transaksi...
                        </strong>{" "}
                        Mohon tunggu.
                    </span>
                </div>
            )}

            {/* Toast Offline */}
            {showOfflineToast && (
                <div className="fixed bottom-6 right-6 bg-theme-panel border border-yellow-700/50 text-theme-text px-5 py-4 rounded-xl shadow-lg z-50 flex items-start gap-3 max-w-sm">
                    <WifiOff className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-sm">Mode Offline</p>
                        <p className="text-xs text-theme-muted mt-0.5">
                            Transaksi akan disimpan lokal dan disinkronkan saat
                            online.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowOfflineToast(false)}
                        className="text-theme-muted hover:text-theme-text ml-2"
                    >
                        ✕
                    </button>
                </div>
            )}
            {flash?.success && <FlashToast message={flash.success} />}
            <div className="h-screen bg-theme-bg text-theme-text flex flex-col overflow-hidden">
                {/* Navbar */}
                <KasirNavbar activeTab="kasir" isOnline={isOnline} onHelpClick={() => setShowHelpModal(true)} />

                {/* Info Sesi */}
                {activeSession && (
                    <div className="bg-theme-panel border-b border-theme-border shrink-0">
                        <div className="max-w-[1440px] mx-auto px-6 py-2 flex items-center gap-6 text-xs text-theme-muted">
                            <span>
                            🏪 Kios:{" "}
                            <strong className="text-theme-text">
                                {activeSession.kios?.name}
                            </strong>
                        </span>
                        <span>
                            🕐 Shift:{" "}
                            <strong className="text-theme-text">
                                {activeSession.shift?.name}
                            </strong>
                        </span>
                        <span>
                            👤 User:{" "}
                            <strong className="text-theme-text">
                                {auth.user.name}
                            </strong>
                        </span>
                        <span>
                            📅{" "}
                            <strong className="text-theme-text">
                                {new Date().toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </strong>
                        </span>
                        <div className="ml-auto flex items-center gap-4">
                            <button
                                onClick={() => setShowHelpModal(true)}
                                className="bg-theme-panel hover:bg-theme-border border border-theme-border text-theme-text font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5 transition text-xs shadow-sm"
                            >
                                <HelpCircle className="w-3.5 h-3.5 text-theme-muted" /> Panduan
                            </button>
                            <button
                                onClick={() => setShowSessionModal(true)}
                                className="text-theme-accent hover:underline text-xs"
                            >
                                Ganti Sesi
                            </button>
                        </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 w-full max-w-[1440px] mx-auto flex overflow-hidden">
                    {/* Kiri: Produk */}
                    <div className="flex-1 flex flex-col p-4 overflow-hidden">
                        {/* Search */}
                        <div className="flex items-center bg-theme-panel rounded-lg px-4 py-2 mb-4 gap-2 border border-theme-border">
                            <span className="text-theme-muted">🔍</span>
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent outline-none text-sm text-theme-text placeholder-theme-muted w-full"
                            />
                        </div>

                        {/* Filter Kategori */}
                        <div className="flex gap-2 mb-2.5 flex-wrap">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                                        activeCategory === cat
                                            ? "bg-theme-accent text-white"
                                            : "bg-theme-panel text-theme-muted hover:text-theme-text border border-theme-border"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Grid Produk */}
                        <div className="flex-1 overflow-y-auto px-2 pt-1.5 pb-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {filteredProducts.map((product, index) => {
                                    const inCart = cart.find(
                                        (i) => i.id === product.id,
                                    );
                                    const remainingStock =
                                        product.stock - (inCart?.qty || 0);
                                    const habis = remainingStock <= 0;
                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() =>
                                                !habis && addToCart(product)
                                            }
                                            className={`animate-slide-up hover-scale-card bg-theme-panel rounded-xl p-3 border relative cursor-pointer active:scale-[0.98]
                                            ${habis ? "opacity-50 cursor-not-allowed border-theme-border" : "border-theme-border"}`}
                                            style={{ animationDelay: `${(index % 15) * 30}ms` }}
                                        >
                                            {inCart && (
                                                <span className="absolute top-2 right-2 bg-theme-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                                    {inCart.qty}
                                                </span>
                                            )}
                                            <div className="bg-theme-bg rounded-lg p-4 flex items-center justify-center mb-2">
                                                <span className="text-2xl">
                                                    🍱
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium leading-tight text-theme-text">
                                                {product.name}
                                            </p>
                                            <p className="text-theme-accent font-bold text-sm mt-1">
                                                {formatRp(product.price)}
                                            </p>
                                            <p
                                                className={`text-xs mt-0.5 ${
                                                    habis
                                                        ? "text-red-500 font-medium"
                                                        : remainingStock <= 5
                                                          ? "text-amber-500 font-medium"
                                                          : "text-theme-muted"
                                                }`}
                                            >
                                                {habis
                                                    ? "Habis"
                                                    : remainingStock <= 5
                                                      ? `⚠️ Stok: ${remainingStock}`
                                                      : `Stok: ${remainingStock}`}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Kanan: Keranjang */}
                    <div className="w-80 bg-theme-panel border-l border-theme-border flex flex-col">
                        <div className="p-4 border-b border-theme-border flex items-center justify-between">
                            <div className="flex items-center gap-2 text-theme-text">
                                <span className="font-bold">
                                    Keranjang Belanja
                                </span>
                                {cart.length > 0 && (
                                    <span className="bg-theme-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                        {cart.length}
                                    </span>
                                )}
                            </div>
                            {cart.length > 0 && (
                                <button
                                    onClick={() => setCart([])}
                                    className="text-red-500 text-xs hover:underline"
                                >
                                    Hapus Semua
                                </button>
                            )}
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-auto p-4 space-y-3">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-theme-muted">
                                    <span className="text-4xl mb-2">🛒</span>
                                    <p className="text-sm">Belum ada item</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="animate-slide-up flex flex-col gap-2 pb-3 border-b border-theme-border/60 last:border-0 last:pb-0"
                                    >
                                        {/* Baris atas: ikon, nama, harga satuan, hapus */}
                                        <div className="flex items-center gap-2">
                                            <div className="bg-theme-bg p-2 rounded-lg shrink-0">
                                                <span className="text-lg">
                                                    🍱
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold truncate text-theme-text">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-theme-muted">
                                                    {formatRp(item.price)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    removeItem(item.id)
                                                }
                                                className="text-red-500 hover:text-red-400 text-sm shrink-0"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {/* Baris bawah: kontrol qty & subtotal */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() =>
                                                        updateQty(item.id, -1)
                                                    }
                                                    className="w-8 h-8 bg-theme-bg rounded text-base hover:bg-theme-border flex items-center justify-center text-theme-text"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={
                                                        item.qtyInput !==
                                                        undefined
                                                            ? item.qtyInput
                                                            : item.qty
                                                    }
                                                    onChange={(e) =>
                                                        setQtyDirect(
                                                            item.id,
                                                            e.target.value.replace(
                                                                /\D/g,
                                                                "",
                                                            ),
                                                        )
                                                    }
                                                    onKeyDown={(e) => {
                                                        const allowedKeys = [
                                                            "Backspace",
                                                            "Delete",
                                                            "ArrowLeft",
                                                            "ArrowRight",
                                                            "Tab",
                                                            "Enter",
                                                        ];
                                                        if (
                                                            !/^[0-9]$/.test(
                                                                e.key,
                                                            ) &&
                                                            !allowedKeys.includes(
                                                                e.key,
                                                            )
                                                        ) {
                                                            e.preventDefault();
                                                        }
                                                        if (e.key === "Enter")
                                                            e.target.blur();
                                                    }}
                                                    onBlur={() =>
                                                        commitQtyInput(item.id)
                                                    }
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    className="w-12 h-8 bg-theme-bg border border-theme-border rounded text-sm text-center text-theme-text outline-none focus:border-theme-accent"
                                                />
                                                <button
                                                    onClick={() =>
                                                        updateQty(item.id, 1)
                                                    }
                                                    className="w-8 h-8 bg-theme-bg rounded text-base hover:bg-theme-border flex items-center justify-center text-theme-text"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="text-xs text-theme-text min-w-fit">
                                                {formatRp(
                                                    item.price * item.qty,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer Keranjang */}
                        <div className="p-4 border-t border-theme-border space-y-3">
                            <div className="flex justify-between text-sm text-theme-muted">
                                <span>Subtotal ({cart.length} item)</span>
                                <span>{formatRp(subtotal)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-theme-text">
                                <span>Total</span>
                                <span>{formatRp(subtotal)}</span>
                            </div>

                            {/* Metode Pembayaran */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPaymentMethod("cash")}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
                                        paymentMethod === "cash"
                                            ? "bg-theme-accent text-white shadow-sm"
                                            : "bg-theme-bg text-theme-muted border border-theme-border hover:text-theme-text"
                                    }`}
                                >
                                    💵 Cash
                                </button>
                                <button
                                    onClick={() => setPaymentMethod("transfer")}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
                                        paymentMethod === "transfer"
                                            ? "bg-theme-accent text-white shadow-sm"
                                            : "bg-theme-bg text-theme-muted border border-theme-border hover:text-theme-text"
                                    }`}
                                >
                                    💳 Non-Tunai
                                </button>
                            </div>

                            {/* Uang Pembayaran — hanya tampil kalau Cash */}
                            {paymentMethod === "cash" && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Rp 0"
                                        value={paidAmount}
                                        onChange={(e) => {
                                            const digitsOnly =
                                                e.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                );
                                            setPaidAmount(
                                                digitsOnly
                                                    ? Number(
                                                          digitsOnly,
                                                      ).toLocaleString("id-ID")
                                                    : "",
                                            );
                                        }}
                                        inputMode="numeric"
                                        className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm outline-none focus:border-theme-accent text-theme-text"
                                    />
                                    <div className="flex justify-between text-sm text-theme-muted">
                                        <span>Kembalian</span>
                                        <span
                                            className={
                                                change < 0
                                                    ? "text-red-500 font-semibold"
                                                    : "text-theme-text font-semibold"
                                            }
                                        >
                                            {formatRp(Math.max(0, change))}
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* Tombol Proses */}
                            <button
                                onClick={processTransaction}
                                disabled={cart.length === 0}
                                className="w-full bg-green-600 hover:bg-green-500 active:scale-[0.98] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:active:scale-100 text-white font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow"
                            >
                                📷 Proses Transaksi
                            </button>
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
                                        Panduan Kasir
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
                                    <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">
                                            1. Login
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Masukkan username & password yang
                                            diberikan admin di halaman login.
                                            Kalau berhasil, kamu akan masuk ke
                                            halaman Kasir ini.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Settings className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">
                                            2. Setup Sesi Kasir
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Setiap mulai kerja, pilih dulu{" "}
                                            <strong>Kios</strong> (lokasi
                                            jualan) dan <strong>Shift</strong>{" "}
                                            (pagi/siang/malam). Ini wajib diisi
                                            sebelum bisa transaksi.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Search className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">
                                            3. Cari & Pilih Produk
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Ketik nama barang di kolom{" "}
                                            <strong>"Cari produk..."</strong>{" "}
                                            atau klik tombol kategori (misal:
                                            "Minuman", "Makanan") untuk
                                            mempersempit pilihan.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <ShoppingCart className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">
                                            4. Tambah Barang ke Keranjang
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Klik produk yang dibeli pelanggan.
                                            Produk otomatis masuk ke keranjang
                                            di sebelah kanan.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Plus className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">
                                            5. Ubah Jumlah atau Hapus Barang
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Di keranjang, tekan tombol{" "}
                                            <strong>+</strong> atau{" "}
                                            <strong>-</strong> untuk ubah
                                            jumlah. Tekan ikon tempat sampah
                                            untuk menghapus barang dari
                                            keranjang.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">
                                            6. Pilih Cara Bayar
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Pilih <strong>Tunai</strong> atau{" "}
                                            <strong>Non-Tunai</strong> (QRIS/
                                            kartu). Kalau tunai, masukkan jumlah
                                            uang yang diberikan pelanggan di
                                            kolom <strong>"Rp 0"</strong>, nanti
                                            kembaliannya muncul otomatis di
                                            bawahnya.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">
                                            7. Proses Transaksi
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Tekan tombol hijau{" "}
                                            <strong>"Proses Transaksi"</strong>.
                                            Setelah berhasil, struk akan
                                            langsung muncul di layar secara
                                            otomatis.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Printer className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">
                                            8. Cetak atau Tutup Struk
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Di layar struk, tekan{" "}
                                            <strong>"Cetak"</strong> untuk
                                            mencetak/simpan struk, atau{" "}
                                            <strong>"Tutup"</strong> kalau
                                            pelanggan tidak butuh struk fisik.
                                            Setelah ditutup, kamu siap melayani
                                            pelanggan berikutnya.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <History className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">
                                            9. Buka Riwayat Transaksi
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Tekan tombol{" "}
                                            <strong>"Riwayat"</strong> di
                                            pojok kiri atas untuk melihat daftar
                                            semua transaksi yang sudah dibuat.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <FileText className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">
                                            10. Lihat Detail Transaksi
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Di halaman Riwayat, tekan tombol{" "}
                                            <strong>"Detail"</strong> pada
                                            transaksi yang mau dilihat. Muncul
                                            rincian barang, total bayar, dan
                                            kembalian. Dari sini juga bisa cetak
                                            ulang strukmu dengan tombol{" "}
                                            <strong>"Cetak Struk"</strong>.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">
                                            11. Membatalkan Transaksi
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Kalau ada transaksi yang salah
                                            (misal salah input barang), buka{" "}
                                            <strong>Detail</strong>{" "}
                                            transaksinya, lalu tekan{" "}
                                            <strong className="text-red-400">
                                                "Batalkan Transaksi"
                                            </strong>
                                            . Akan muncul konfirmasi — tekan{" "}
                                            <strong>"Batalkan"</strong> untuk
                                            memastikan. Stok barang akan
                                            otomatis dikembalikan.
                                            <br />
                                            <span className="text-yellow-400 flex items-center gap-1 mt-1">
                                                <AlertTriangle className="w-3.5 h-3.5" /> Hati-hati, transaksi yang
                                                sudah dibatalkan tidak bisa
                                                dikembalikan lagi!
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Wifi className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">
                                            12. Kalau Internet Mati
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Tenang, aplikasi tetap bisa dipakai!
                                            Muncul tulisan{" "}
                                            <strong className="text-red-400">
                                                "Offline"
                                            </strong>{" "}
                                            di pojok kanan atas. Transaksi tetap
                                            tersimpan dan akan otomatis terkirim
                                            begitu internet nyala lagi.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <LogOut className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">
                                            13. Logout (Selesai Kerja)
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Tekan nama kamu di pojok kanan atas,
                                            lalu pilih{" "}
                                            <strong className="text-red-400">
                                                "Logout"
                                            </strong>
                                            . Selalu logout setelah selesai
                                            shift, jangan biarkan aplikasi
                                            terbuka begitu saja.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Phone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm">
                                            Masih Bingung?
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Hubungi admin/pemilik toko kalau ada
                                            kendala yang tidak bisa diatasi
                                            sendiri.
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

                {/* Modal Setup Sesi */}
                {showSessionModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
                        <div className="bg-theme-panel rounded-2xl p-6 w-full max-w-md border border-theme-border text-theme-text shadow-2xl animate-modal-pop">
                            <div className="flex items-center gap-3 mb-2">
                                <Settings className="w-5 h-5 text-theme-accent" />
                                <h2 className="text-lg font-bold text-theme-text">
                                    Setup Sesi Kasir
                                </h2>
                            </div>
                            <p className="text-theme-muted text-sm mb-5">
                                Pilih kios dan shift untuk sesi ini
                            </p>

                            {/* Pilih Kios */}
                            <p className="text-sm font-medium mb-2">Kios</p>
                            <div className="space-y-2 mb-4">
                                {kiosList.map((kios) => (
                                    <div
                                        key={kios.id}
                                        onClick={() => setSelectedKios(kios.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${
                                            selectedKios === kios.id
                                                ? "border-theme-accent bg-theme-accent/10"
                                                : "border-theme-border bg-theme-bg hover:border-theme-muted"
                                        }`}
                                    >
                                        <Store className="w-5 h-5 text-theme-accent" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {kios.name}
                                            </p>
                                            <p className="text-xs text-theme-muted">
                                                {kios.location}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pilih Shift */}
                            <p className="text-sm font-medium mb-2">Shift</p>
                            <div className="space-y-2 mb-6">
                                {shifts.map((shift) => (
                                    <div
                                        key={shift.id}
                                        onClick={() =>
                                            setSelectedShift(shift.id)
                                        }
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${
                                            selectedShift === shift.id
                                                ? "border-theme-accent bg-theme-accent/10"
                                                : "border-theme-border bg-theme-bg hover:border-theme-muted"
                                        }`}
                                    >
                                        <span className="text-xl">
                                            {shift.name.includes("Pagi") ? (
                                                <Sun className="w-5 h-5 text-yellow-400" />
                                            ) : (
                                                <Moon className="w-5 h-5 text-blue-400" />
                                            )}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {shift.name}
                                            </p>
                                            <p className="text-xs text-theme-muted">
                                                {shift.start_time} -{" "}
                                                {shift.end_time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tombol */}
                            <div className="flex gap-3">
                                {activeSession && (
                                    <button
                                        onClick={() =>
                                            setShowSessionModal(false)
                                        }
                                        className="flex-1 py-2 rounded-lg border border-theme-border text-sm hover:bg-theme-border transition text-theme-text"
                                    >
                                        Batal
                                    </button>
                                )}
                                <button
                                    onClick={startSession}
                                    disabled={!selectedKios || !selectedShift}
                                    className="flex-1 py-2 rounded-lg bg-theme-accent hover:bg-theme-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
                                >
                                    Mulai Sesi
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modal Struk */}
                {receiptData && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-theme-panel rounded-2xl w-full max-w-lg border border-theme-border shadow-2xl flex flex-col max-h-[90vh] text-theme-text animate-modal-pop">
                            {/* Header Modal */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-theme-accent" />
                                    <span className="font-bold">
                                        Struk Pembayaran
                                    </span>
                                </div>
                                <button
                                    onClick={() => setReceiptData(null)}
                                    className="text-theme-muted hover:text-theme-text text-xl"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Isi Struk */}
                            <div className="p-6 overflow-auto flex-1">
                                {/* Header Toko */}
                                <div className="text-center mb-4">
                                    <div className="bg-theme-bg w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 border border-theme-border/50">
                                        <FileText className="w-6 h-6 text-theme-accent" />
                                    </div>
                                    <p className="font-bold text-theme-text">
                                        NICKY FROZEN
                                    </p>
                                    <p className="text-xs text-theme-muted">
                                        {receiptData.kasir_session?.kios?.name}{" "}
                                        |{" "}
                                        {receiptData.kasir_session?.shift?.name}
                                    </p>
                                    <p className="text-xs text-theme-muted">
                                        {new Date(
                                            receiptData.created_at,
                                        ).toLocaleString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                    <p className="text-xs text-theme-muted mt-1 italic">
                                        No: {receiptData.invoice_number}
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-dashed border-theme-border my-3" />

                                {/* Items */}
                                <div className="space-y-3 mb-3">
                                    {receiptData.items?.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between items-start"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="bg-theme-bg p-1.5 rounded flex items-center justify-center border border-theme-border/50">
                                                    <Package className="w-4 h-4 text-theme-accent" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-theme-text">
                                                        {item.product?.name}
                                                    </p>
                                                    <p className="text-xs text-theme-muted">
                                                        {item.quantity} x{" "}
                                                        {formatRp(item.price)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium text-theme-text">
                                                {formatRp(item.subtotal)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-dashed border-theme-border my-3" />

                                {/* Total */}
                                <div className="bg-theme-bg rounded-xl p-4 space-y-2 border border-theme-border/50">
                                    <div className="flex justify-between font-bold text-base text-theme-text">
                                        <span>TOTAL</span>
                                        <span>
                                            {formatRp(receiptData.total_amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-theme-muted">
                                        <span>
                                            Pembayaran (
                                            {receiptData.payment_method ===
                                            "cash"
                                                ? "Cash"
                                                : "Non-Tunai"}
                                            )
                                        </span>
                                        <span className="text-theme-text font-medium">
                                            {formatRp(receiptData.paid_amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm font-semibold text-theme-accent">
                                        <span>Kembalian</span>
                                        <span>
                                            {formatRp(
                                                receiptData.change_amount,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="text-center mt-4 space-y-1">
                                    <p className="text-xs text-theme-muted">
                                        Kasir: {receiptData.user?.name}
                                    </p>
                                    <p className="text-xs text-theme-muted">
                                        ✨ Terima kasih telah berbelanja! ✨
                                    </p>
                                    <p className="text-xs text-theme-muted">
                                        Simpan struk ini sebagai bukti
                                        pembelian.
                                    </p>
                                </div>
                            </div>

                            {/* Tombol */}
                            <div className="flex gap-3 px-6 pb-6">
                                <button
                                    onClick={() => {
                                        setReceiptData(null);
                                        router.reload({ only: ["products"] });
                                    }}
                                    className="flex-1 py-2.5 rounded-xl border border-theme-border text-sm font-semibold hover:bg-theme-border transition text-theme-text"
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={printReceipt}
                                    className="flex-1 py-2.5 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white text-sm font-semibold transition flex items-center justify-center gap-2 shadow"
                                >
                                    <Printer className="w-4 h-4 text-white" /> Cetak
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <AlertModal />
        </>
    );
}
