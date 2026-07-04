import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import AdminNavbar from "@/Components/AdminNavbar";
import { 
    CheckCircle2, 
    Settings, 
    Package, 
    FileText, 
    ClipboardList, 
    HelpCircle, 
    Search, 
    RefreshCw, 
    Lightbulb, 
    Phone,
    Info
} from "lucide-react";

export default function Audit({ auth, logs }) {
    const formatDate = (val) =>
        new Date(val).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const getIcon = (type) => {
        switch (type) {
            case "transaction":
                return {
                    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
                    bg: "bg-green-900/10 border border-green-500/20",
                    color: "text-green-500 bg-green-900/10 border border-green-500/20",
                };
            case "session":
                return {
                    icon: <Settings className="w-5 h-5 text-blue-500" />,
                    bg: "bg-blue-900/10 border border-blue-500/20",
                    color: "text-blue-500 bg-blue-900/10 border border-blue-500/20",
                };
            case "product":
                return {
                    icon: <Package className="w-5 h-5 text-yellow-500" />,
                    bg: "bg-yellow-900/10 border border-yellow-500/20",
                    color: "text-yellow-500 bg-yellow-900/10 border border-yellow-500/20",
                };
            default:
                return {
                    icon: <FileText className="w-5 h-5 text-theme-muted" />,
                    bg: "bg-theme-bg border border-theme-border",
                    color: "text-theme-muted bg-theme-bg border border-theme-border",
                };
        }
    };

    const [showHelpModal, setShowHelpModal] = useState(false);

    useEffect(() => {
        const pollLogs = setInterval(() => {
            router.reload({ only: ["logs"] });
        }, 5000); // cek update tiap 5 detik
        return () => clearInterval(pollLogs);
    }, []);

    return (
        <>
            <Head title="Audit Trail" />
            <div className="h-screen bg-theme-bg text-theme-text flex flex-col overflow-hidden">
                {/* Navbar */}
                <AdminNavbar activeTab="audit" />

                {/* Content */}
                <div className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col overflow-hidden p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-theme-text">Audit Trail</h1>
                            <p className="text-theme-muted text-sm">
                                Log perubahan dan aktivitas sistem
                            </p>
                        </div>
                        <button
                            onClick={() => setShowHelpModal(true)}
                            className="bg-theme-panel hover:bg-theme-border border border-theme-border text-theme-text font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition text-sm shadow-sm"
                        >
                            <HelpCircle className="w-4 h-4 text-theme-muted" /> Panduan
                        </button>
                    </div>

                    {/* Log List */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {logs.length === 0 ? (
                            <div className="text-center py-16 text-theme-muted flex flex-col items-center">
                                <ClipboardList className="w-12 h-12 text-theme-muted mb-2 opacity-50" />
                                <p>Belum ada aktivitas tercatat</p>
                            </div>
                        ) : (
                            logs.map((log) => {
                                const { icon, bg, color } = getIcon(log.type);
                                return (
                                    <div
                                        key={log.id}
                                        className="bg-theme-panel rounded-xl border border-theme-border px-5 py-4 flex items-center gap-4 hover:border-theme-muted transition shadow-sm"
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
                                        >
                                            {icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-theme-text">
                                                {log.description}
                                            </p>
                                            <p className="text-xs text-theme-muted mt-0.5">
                                                Oleh:{" "}
                                                <span className="text-theme-text font-medium">
                                                    {log.user?.name ?? "System"}
                                                </span>
                                                <span className="mx-1">·</span>
                                                {formatDate(log.created_at)}
                                            </p>
                                        </div>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full border capitalize flex-shrink-0 font-medium ${color}`}
                                        >
                                            {log.type}
                                        </span>
                                    </div>
                                );
                            })
                        )}

                        </div>
                </div>

                {/* Modal Bantuan Halaman Audit */}
                {showHelpModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-theme-panel rounded-2xl w-full max-w-lg border border-theme-border max-h-[85vh] flex flex-col text-theme-text">
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-theme-border">
                                <div className="flex items-center gap-3">
                                    <HelpCircle className="w-6 h-6 text-theme-accent" />
                                    <h2 className="text-lg font-bold text-theme-text">
                                        Panduan Audit Trail
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
                            <div className="overflow-y-auto p-5 space-y-4 text-theme-text">
                                <div className="flex gap-3">
                                    <ClipboardList className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            1. Apa itu Audit Trail?
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Ini adalah "catatan sejarah"
                                            semua kejadian penting di
                                            sistem — siapa melakukan apa
                                            dan kapan. Berguna buat
                                            menelusuri kalau ada data yang
                                            janggal.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Info className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            2. Arti Warna & Ikon
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            <span className="text-green-500 font-semibold">
                                                Hijau (CheckCircle)
                                            </span>{" "}
                                            = aktivitas transaksi (jual/
                                            batal).{" "}
                                            <span className="text-blue-500 font-semibold">
                                                Biru (Settings)
                                            </span>{" "}
                                            = sesi kerja kasir (buka/tutup
                                            shift).{" "}
                                            <span className="text-yellow-500 font-semibold">
                                                Kuning (Package)
                                            </span>{" "}
                                            = perubahan data produk (tambah/
                                            edit/hapus).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Search className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            3. Membaca Satu Baris Log
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Setiap baris menunjukkan{" "}
                                            <strong>apa</strong> yang
                                            terjadi (deskripsi),{" "}
                                            <strong>siapa</strong> yang
                                            melakukan (nama pengguna), dan{" "}
                                            <strong>kapan</strong> (tanggal
                                            & jam).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <RefreshCw className="w-5 h-5 text-theme-accent shrink-0 mt-0.5 animate-spin-slow" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            4. Update Otomatis
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Halaman ini menyegarkan diri
                                            otomatis setiap 5 detik. Kamu
                                            tidak perlu refresh manual
                                            untuk melihat aktivitas
                                            terbaru.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Lightbulb className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            5. Kapan Halaman Ini Dipakai?
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Buka halaman ini kalau ada
                                            kejadian aneh — misalnya stok
                                            tiba-tiba berubah atau ada
                                            transaksi yang dibatalkan tanpa
                                            sepengetahuanmu. Dari sini bisa
                                            dicek siapa pelakunya dan
                                            kapan.
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
                                            Hubungi developer/admin teknis
                                            kalau ada kendala yang tidak
                                            bisa diatasi sendiri.
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
            </div>
        </>
    );
}
