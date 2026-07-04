import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import AdminNavbar from "@/Components/AdminNavbar";
import { Plus, Edit2, Trash2, HelpCircle, Users, Key, Eye, ShieldAlert, Phone, AlertTriangle } from "lucide-react";

const AVATAR_COLORS = [
    "#22d3ee",
    "#a855f7",
    "#22c55e",
    "#ef4444",
    "#eab308",
    "#ec4899",
    "#f97316",
    "#ffffff",
    "#6b7280",
];

export default function Master({ auth, users, kiosList, shifts, flash, errors }) {
    const [showModal, setShowModal] = useState(false);
    const [editKasir, setEditKasir] = useState(null);
    const [viewKasir, setViewKasir] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        name: "",
        username: "",
        password: "",
        role: "kasir",
        avatar_color: "#22d3ee",
        notes: "",
    });
    const [alertMessage, setAlertMessage] = useState(null);
    const [showHelpModal, setShowHelpModal] = useState(false);

    const formatRp = (val) => {
        if (val >= 1000000) return "Rp " + (val / 1000000).toFixed(1) + "jt";
        if (val >= 1000) return "Rp " + (val / 1000).toFixed(0) + "rb";
        return "Rp " + Number(val).toLocaleString("id-ID");
    };

    const formatDate = (val) =>
        val
            ? new Date(val).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "-";

    const onlineCount = users.filter((k) => k.is_online).length;
    const offlineCount = users.length - onlineCount;

    const openAdd = () => {
        setEditKasir(null);
        setForm({
            name: "",
            username: "",
            password: "",
            default_kios_id: "",
            default_shift_id: "",
            avatar_color: "#22d3ee",
            notes: "",
        });
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditKasir(user);
        setForm({
            name: user.name,
            username: user.username,
            password: "",
            role: user.role,
            avatar_color: user.avatar_color,
            notes: user.notes ?? "",
        });
        setShowModal(true);
    };

    const handleSubmit = () => {
        if (!editKasir && form.password.length < 8) {
            setAlertMessage("Password minimal 8 karakter!");
            return;
        }
        if (editKasir && form.password && form.password.length < 8) {
            setAlertMessage("Password minimal 8 karakter!");
            return;
        }

        if (editKasir) {
            router.put(route("admin.master.update", editKasir.id), form, {
                onSuccess: () => setShowModal(false),
            });
        } else {
            router.post(route("admin.master.store"), form, {
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const handleDelete = (kasir) => {
        router.delete(route("admin.master.destroy", kasir.id), {
            onSuccess: () => setShowDeleteConfirm(null),
        });
    };

    const logout = () => router.post(route("logout"));

    return (
        <>
            <Head title="Menu Master" />
            {flash?.success && (
                <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
                    ✅ {flash.success}
                </div>
            )}
            <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col">
                {/* Navbar */}
                <AdminNavbar activeTab="master" />

                {/* Content */}
                <div className="p-6 w-full max-w-[1440px] mx-auto flex-1">
                    {/* Title */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 className="text-xl font-bold text-theme-text">Menu Master</h1>
                            <p className="text-theme-muted text-sm">
                                Kelola profil pengguna dan pantau status kerja
                                real-time
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowHelpModal(true)}
                                className="bg-theme-panel hover:bg-theme-border border border-theme-border text-theme-text font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition text-sm shadow-sm"
                            >
                                <HelpCircle className="w-4 h-4 text-theme-muted" /> Panduan
                            </button>
                            <button
                                onClick={openAdd}
                                className="bg-theme-accent hover:bg-theme-accent-hover text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition text-sm shadow-sm"
                            >
                                <Plus className="w-4 h-4 text-white" /> Tambah Pengguna
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Daftar Kasir */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-3">
                                <p className="font-semibold text-sm text-theme-text">
                                    Daftar Pengguna
                                </p>
                                <span className="text-xs text-theme-muted">
                                    {users.length} Pengguna
                                </span>
                            </div>
                            <div className="space-y-3">
                                {users.length === 0 ? (
                                    <div className="text-center py-10 text-theme-muted bg-theme-panel rounded-xl border border-theme-border shadow-sm">
                                        Belum ada pengguna
                                    </div>
                                ) : (
                                    users.map((user) => (
                                        <div
                                            key={user.id}
                                            className={`bg-theme-panel rounded-xl border-l-4 p-4 flex items-center justify-between shadow-sm border-y border-r border-theme-border transition-all duration-200 hover:scale-[1.01] hover:shadow-md hover:border-theme-accent/20 ${
                                                user.is_online
                                                    ? "border-l-theme-accent"
                                                    : "border-l-theme-muted/50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-inner ${user.avatar_color === "#ffffff" ? "text-slate-900" : "text-white"}`}
                                                    style={{
                                                        backgroundColor:
                                                            user.avatar_color,
                                                    }}
                                                >
                                                    {user.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-sm text-theme-text">
                                                            {user.name}
                                                        </p>
                                                        <span
                                                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                                user.role ===
                                                                "admin"
                                                                    ? "bg-purple-900/20 text-purple-400 border border-purple-800/20"
                                                                    : "bg-theme-accent/10 text-theme-accent border border-theme-accent/20"
                                                            }`}
                                                        >
                                                            {user.role ===
                                                            "admin"
                                                                ? "🔧 Admin"
                                                                : "🛒 Kasir"}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-theme-muted mb-1">
                                                        @{user.username}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        {user.default_kios && (
                                                            <span className="bg-theme-bg border border-theme-border text-theme-muted text-xs px-2 py-0.5 rounded-full font-medium">
                                                                {
                                                                    user
                                                                        .default_kios
                                                                        ?.name
                                                                }
                                                            </span>
                                                        )}
                                                        {user.default_shift && (
                                                            <span className="bg-green-900/20 border border-green-800/20 text-green-500 text-xs px-2 py-0.5 rounded-full font-medium">
                                                                {
                                                                    user
                                                                        .default_shift
                                                                        ?.name
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    {user.notes && (
                                                        <p className="text-xs text-theme-muted mt-1.5 italic">
                                                            {user.notes}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-theme-muted mt-1">
                                                        Terakhir aktif:{" "}
                                                        {formatDate(
                                                            user.last_active_at,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        setViewKasir(user)
                                                    }
                                                    className="bg-theme-bg hover:opacity-85 text-theme-accent p-2 rounded-lg transition border border-theme-border shadow-sm"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4 text-theme-accent" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        openEdit(user)
                                                    }
                                                    className="bg-theme-bg hover:opacity-85 text-theme-text p-2 rounded-lg transition border border-theme-border shadow-sm"
                                                    title="Edit Pengguna"
                                                >
                                                    <Edit2 className="w-4 h-4 text-theme-muted" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setShowDeleteConfirm(
                                                            user,
                                                        )
                                                    }
                                                    className="bg-red-900/10 hover:bg-red-900/20 text-red-500 p-2 rounded-lg transition border border-red-500/20 shadow-sm"
                                                    title="Hapus Pengguna"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Stats & Monitor */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-theme-panel rounded-xl border border-theme-border p-4 text-center shadow-sm">
                                    <p className="text-3xl font-bold text-green-500">
                                        {onlineCount}
                                    </p>
                                    <p className="text-xs text-theme-muted mt-1 font-semibold uppercase">
                                        SEDANG ONLINE
                                    </p>
                                </div>
                                <div className="bg-theme-panel rounded-xl border border-theme-border p-4 text-center shadow-sm">
                                    <p className="text-3xl font-bold text-theme-text">
                                        {offlineCount}
                                    </p>
                                    <p className="text-xs text-theme-muted mt-1 font-semibold uppercase">
                                        SEDANG OFFLINE
                                    </p>
                                </div>
                            </div>

                            <div className="bg-theme-panel rounded-xl border border-theme-border p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            Monitor Aktivitas
                                        </p>
                                        <p className="text-xs text-theme-muted mt-0.5">
                                            Status kasir saat ini.
                                        </p>
                                    </div>
                                    <span className="bg-green-900/20 border border-green-800/20 text-green-500 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                                        ● Live
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {users.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between bg-theme-bg rounded-lg p-3 border border-theme-border/50"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-inner ${user.avatar_color === "#ffffff" ? "text-slate-900" : "text-white"}`}
                                                    style={{
                                                        backgroundColor:
                                                            user.avatar_color,
                                                    }}
                                                >
                                                    {user.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-theme-text leading-tight">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-theme-muted mt-0.5">
                                                        @{user.username} · {user.default_kios?.name ?? "-"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`text-xs flex items-center gap-1 justify-end font-semibold ${user.is_online ? "text-green-500" : "text-theme-muted"}`}
                                                >
                                                    ●{" "}
                                                    {user.is_online
                                                        ? "Online"
                                                        : "Offline"}
                                                </span>
                                                <p className="text-[10px] text-theme-muted mt-0.5">
                                                    {formatDate(
                                                        user.last_active_at,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Tambah/Edit */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-theme-panel rounded-2xl w-full max-w-lg border border-theme-border shadow-2xl max-h-[90vh] flex flex-col text-theme-text animate-modal-pop">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border shrink-0">
                                <h2 className="font-bold flex items-center gap-2 text-theme-text">
                                    {editKasir ? (
                                        <>
                                            <Edit2 className="w-5 h-5 text-theme-accent" />
                                            <span>Edit User</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5 text-theme-accent" />
                                            <span>Tambah User Baru</span>
                                        </>
                                    )}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-theme-muted hover:text-theme-text"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6 space-y-4 overflow-y-auto">
                                <div>
                                    <label className="text-xs text-theme-muted mb-1 block">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm outline-none focus:border-theme-accent text-theme-text"
                                        placeholder="contoh: Ahmad Basikal"
                                        required
                                    />
                                    {errors?.name && (
                                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-theme-muted mb-1 block">
                                        Role / Hak Akses
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setForm({
                                                    ...form,
                                                    role: "kasir",
                                                })
                                            }
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition flex items-center justify-center gap-2 ${
                                                form.role === "kasir"
                                                    ? "bg-theme-accent/20 border-theme-accent text-theme-accent"
                                                    : "bg-theme-input-bg border-theme-input-border text-theme-muted hover:border-theme-border"
                                            }`}
                                        >
                                            🛒 Kasir
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setForm({
                                                    ...form,
                                                    role: "admin",
                                                })
                                            }
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition flex items-center justify-center gap-2 ${
                                                form.role === "admin"
                                                    ? "bg-purple-500/20 border-purple-500 text-purple-400"
                                                    : "bg-theme-input-bg border-theme-input-border text-theme-muted hover:border-theme-border"
                                            }`}
                                        >
                                            🔧 Admin
                                        </button>
                                    </div>
                                    <p className="text-xs text-theme-muted mt-1.5 italic">
                                        {form.role === "admin"
                                            ? "Admin dapat kelola produk, riwayat, rekap, dan audit"
                                            : "Kasir hanya dapat melakukan transaksi penjualan"}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-theme-muted mb-1 block">
                                            Username
                                        </label>
                                        <input
                                            value={form.username}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    username: e.target.value,
                                                })
                                            }
                                            className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm outline-none focus:border-theme-accent text-theme-text"
                                            placeholder="contoh: ahmad999"
                                            required
                                        />
                                        {errors?.username && (
                                            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-theme-muted mb-1 block">
                                            Password{" "}
                                            {editKasir &&
                                                "(kosongkan jika tidak diubah)"}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={form.password}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        password:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm outline-none focus:border-theme-accent text-theme-text pr-9"
                                                placeholder="Min. 8 karakter"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-muted text-sm hover:text-theme-text transition"
                                            >
                                                👁️
                                            </button>
                                        </div>
                                        {errors?.password && (
                                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                        )}
                                        {/* Indikator kekuatan password */}
                                        {form.password.length > 0 && (
                                            <div className="mt-1.5 flex items-center gap-2">
                                                <div
                                                    className={`h-1 flex-1 rounded-full ${
                                                        form.password.length >=
                                                        8
                                                            ? "bg-green-500"
                                                            : "bg-red-500"
                                                    }`}
                                                />
                                                <span
                                                    className={`text-xs ${
                                                        form.password.length >=
                                                        8
                                                            ? "text-green-500 font-semibold"
                                                            : "text-red-500 font-semibold"
                                                    }`}
                                                >
                                                    {form.password.length >= 8
                                                        ? "✓ Password valid"
                                                        : `${form.password.length}/8 karakter`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-theme-muted mb-2 block">
                                        Warna Avatar
                                    </label>
                                    <div className="flex gap-2 flex-wrap bg-theme-bg p-3 rounded-lg border border-theme-border">
                                        {AVATAR_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() =>
                                                    setForm({
                                                        ...form,
                                                        avatar_color: color,
                                                    })
                                                }
                                                className={`w-8 h-8 rounded-full border-2 transition ${form.avatar_color === color ? "border-theme-accent scale-110 shadow ring-2 ring-theme-accent/20" : "border-transparent opacity-80 hover:opacity-100"}`}
                                                style={{
                                                    backgroundColor: color,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-theme-muted mb-1 block">
                                        Catatan (Opsional)
                                    </label>
                                    <textarea
                                        value={form.notes}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                notes: e.target.value,
                                            })
                                        }
                                        className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm outline-none focus:border-theme-accent text-theme-text resize-none"
                                        rows={2}
                                        placeholder="contoh: kasir tetap kios 1"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 px-6 pb-6 pt-3 border-t border-theme-border shrink-0">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-theme-border text-sm hover:bg-theme-border transition text-theme-text"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 py-2.5 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white text-sm font-semibold transition"
                                >
                                    {editKasir
                                        ? "Simpan Perubahan"
                                        : "Tambah User"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal View Profil */}
                {viewKasir && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-theme-panel rounded-2xl w-full max-w-md border border-theme-border shadow-2xl flex flex-col text-theme-text animate-modal-pop">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border">
                                <h2 className="font-bold text-theme-text flex items-center gap-2">
                                    <Users className="w-5 h-5 text-theme-accent" />
                                    <span>Profil Kasir</span>
                                </h2>
                                <button
                                    onClick={() => setViewKasir(null)}
                                    className="text-theme-muted hover:text-theme-text"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6 text-center">
                                <div
                                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 shadow-inner ${viewKasir.avatar_color === "#ffffff" ? "text-slate-900" : "text-white"}`}
                                    style={{
                                        backgroundColor: viewKasir.avatar_color,
                                    }}
                                >
                                    {viewKasir.name.charAt(0).toUpperCase()}
                                </div>
                                <p className="font-bold text-lg text-theme-text">
                                    {viewKasir.name}
                                </p>
                                <p className="text-sm text-theme-muted mb-3">
                                    @{viewKasir.username}
                                </p>
                                <div className="flex justify-center gap-2 mb-5">
                                    {viewKasir.default_kios && (
                                        <span className="bg-theme-bg border border-theme-border text-theme-muted text-xs px-2.5 py-0.5 rounded-full font-medium">
                                            {viewKasir.default_kios?.name}
                                        </span>
                                    )}
                                    {viewKasir.default_shift && (
                                        <span className="bg-green-900/20 border border-green-800/20 text-green-500 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                            {viewKasir.default_shift?.name}
                                        </span>
                                    )}
                                    <span
                                        className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${viewKasir.is_online ? "bg-green-900/20 border-green-800/20 text-green-500" : "bg-theme-bg border-theme-border text-theme-muted"}`}
                                    >
                                        ● {viewKasir.is_online ? "Online" : "Offline"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-theme-bg rounded-xl p-4 border border-theme-border/50">
                                        <p className="text-2xl font-bold text-theme-accent">
                                            {viewKasir.total_count}
                                        </p>
                                        <p className="text-xs text-theme-muted mt-1 font-semibold uppercase">
                                            TOTAL TRANSAKSI
                                        </p>
                                    </div>
                                    <div className="bg-theme-bg rounded-xl p-4 border border-theme-border/50">
                                        <p className="text-2xl font-bold text-green-500">
                                            {formatRp(viewKasir.total_revenue)}
                                        </p>
                                        <p className="text-xs text-theme-muted mt-1 font-semibold uppercase">
                                            TOTAL OMSET
                                        </p>
                                    </div>
                                </div>
                                {viewKasir.notes && (
                                    <div className="bg-theme-bg border border-theme-border/50 rounded-xl p-4 mb-4 text-left">
                                        <p className="text-xs text-theme-muted mb-1 font-semibold uppercase">
                                            CATATAN
                                        </p>
                                        <p className="text-sm text-theme-text">
                                            {viewKasir.notes}
                                        </p>
                                    </div>
                                )}
                                <p className="text-xs text-theme-muted">
                                    Terakhir aktif:{" "}
                                    {formatDate(viewKasir.last_active_at)}
                                </p>
                            </div>
                            <div className="px-6 pb-6">
                                <button
                                    onClick={() => setViewKasir(null)}
                                    className="w-full py-2.5 rounded-xl border border-theme-border text-sm font-semibold hover:bg-theme-border transition text-theme-text"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Konfirmasi Hapus */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-theme-panel rounded-2xl w-full max-w-sm border border-theme-border p-6 text-center shadow-2xl flex flex-col items-center animate-modal-pop">
                            <Trash2 className="w-12 h-12 text-red-500 mb-3" />
                            <h2 className="font-bold text-lg mb-1 text-theme-text">
                                Hapus Pengguna?
                            </h2>
                            <p className="text-theme-muted text-sm mb-5">
                                Akun{" "}
                                <strong className="text-theme-text">
                                    {showDeleteConfirm.name}
                                </strong>{" "}
                                ({showDeleteConfirm.role}) akan dihapus
                                permanen.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-theme-border text-sm hover:bg-theme-border transition text-theme-text"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() =>
                                        handleDelete(showDeleteConfirm)
                                    }
                                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Bantuan Halaman Master */}
                {showHelpModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-theme-panel rounded-2xl w-full max-w-lg border border-theme-border max-h-[85vh] flex flex-col text-theme-text animate-modal-pop">
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-theme-border shrink-0">
                                <div className="flex items-center gap-3">
                                    <HelpCircle className="w-6 h-6 text-theme-accent" />
                                    <h2 className="text-lg font-bold text-theme-text">
                                        Panduan Kelola Pengguna
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
                                    <Users className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            1. Bedanya Kasir, Admin, dan Owner
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            <strong>Kasir</strong>: hanya bisa
                                            buka halaman transaksi & riwayat.{" "}
                                            <strong>Admin</strong>: bisa kelola
                                            produk, laporan, dan riwayat, tapi
                                            tidak bisa kelola pengguna lain.{" "}
                                            <strong>Owner</strong>: akses penuh,
                                            termasuk halaman ini (Master).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Plus className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            2. Menambah Pengguna Baru
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Tekan <strong>"+ Tambah Pengguna"</strong>
                                            , isi nama, email, pilih role (
                                            <strong>Kasir</strong> atau <strong>Admin</strong>), dan buat
                                            password minimal 8 karakter. Kalau
                                            role Kasir, tentukan juga kios
                                            tempat dia biasa bertugas.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Key className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            3. Reset Password Pengguna
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Buka <strong>Edit</strong> pada
                                            pengguna yang lupa password, lalu
                                            isi kolom password dengan yang baru.
                                            Kalau kolom password dikosongkan
                                            saat edit, password lama tetap
                                            dipakai (tidak berubah).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Eye className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            4. Memantau Status Kerja
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Tekan foto/nama pengguna untuk
                                            melihat profil lengkapnya, termasuk
                                            status <strong className="text-green-500">Online</strong>{" "}
                                            dan kios tempatnya bertugas saat ini
                                            secara real-time.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Trash2 className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            5. Menghapus Pengguna
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Tekan <strong className="text-red-500">"Hapus"</strong>{" "}
                                            pada pengguna yang sudah tidak
                                            bekerja lagi.
                                            <br />
                                            <span className="text-theme-muted flex items-center gap-1 mt-1">
                                                <AlertTriangle className="w-3.5 h-3.5 text-theme-accent" /> Akun yang dihapus TIDAK BISA
                                                dikembalikan. Jangan hapus akun
                                                kasir yang masih sedang
                                                bertugas/login — pastikan dulu
                                                dia sedang tidak dalam shift
                                                kerja.
                                            </span>
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
                                            Hubungi developer/admin teknis kalau
                                            ada kendala yang tidak bisa diatasi
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
            </div>
            {/* Modal Alert */}
            {alertMessage && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 animate-fade-in">
                    <div className="bg-theme-panel rounded-2xl w-full max-w-sm border border-theme-border p-6 text-center shadow-2xl animate-modal-pop">
                        <div className="text-4xl mb-3">⚠️</div>
                        <p className="text-theme-text font-semibold text-sm mb-5">
                            {alertMessage}
                        </p>
                        <button
                            onClick={() => setAlertMessage(null)}
                            className="w-full py-2.5 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white text-sm font-semibold transition"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
