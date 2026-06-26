import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const AVATAR_COLORS = ['#22d3ee', '#a855f7', '#22c55e', '#ef4444', '#eab308', '#ec4899', '#f97316', '#ffffff', '#6b7280'];

export default function Master({ auth, users, kiosList, shifts, flash }) {
    const [showModal, setShowModal] = useState(false);
    const [editKasir, setEditKasir] = useState(null);
    const [viewKasir, setViewKasir] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        name: '', username: '', password: '',
        role: 'kasir',  
        avatar_color: '#22d3ee', notes: '',
    });
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [time, setTime] = useState(new Date());
    const [alertMessage, setAlertMessage] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatRp = (val) => {
        if (val >= 1000000) return 'Rp ' + (val / 1000000).toFixed(1) + 'jt';
        if (val >= 1000) return 'Rp ' + (val / 1000).toFixed(0) + 'rb';
        return 'Rp ' + Number(val).toLocaleString('id-ID');
    };

    const formatDate = (val) => val ? new Date(val).toLocaleString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }) : '-';

    const onlineCount  = users.filter(k => k.is_online).length;
const offlineCount = users.length - onlineCount;

    const openAdd = () => {
        setEditKasir(null);
        setForm({ name: '', username: '', password: '', default_kios_id: '', default_shift_id: '', avatar_color: '#22d3ee', notes: '' });
        setShowModal(true);
    };

    const openEdit = (user) => {
    setEditKasir(user);
    setForm({
        name:             user.name,
        username:         user.username,
        password:         '',
        role:             user.role,     
        avatar_color:     user.avatar_color,
        notes:            user.notes ?? '',
    });
    setShowModal(true);
};

    const handleSubmit = () => {
    if (!editKasir && form.password.length < 8) {
        setAlertMessage('Password minimal 8 karakter!');
        return;
    }
    if (editKasir && form.password && form.password.length < 8) {
        setAlertMessage('Password minimal 8 karakter!');
        return;
    }

    if (editKasir) {
        router.put(route('admin.master.update', editKasir.id), form, {
            onSuccess: () => setShowModal(false),
        });
    } else {
        router.post(route('admin.master.store'), form, {
            onSuccess: () => setShowModal(false),
        });
    }
};

    const handleDelete = (kasir) => {
        router.delete(route('admin.master.destroy', kasir.id), {
            onSuccess: () => setShowDeleteConfirm(null),
        });
    };

    const logout = () => router.post(route('logout'));

    return (
        <>
            <Head title="Menu Master" />
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
                        <button onClick={() => router.visit(route('admin.history'))} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white flex items-center gap-2">📋 Riwayat</button>
                        <button onClick={() => router.visit(route('admin.products'))} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white flex items-center gap-2">📦 Produk</button>
                        <button onClick={() => router.visit(route('admin.recap'))} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white flex items-center gap-2">📊 Rekap</button>
                        <button onClick={() => router.visit(route('admin.audit'))} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white flex items-center gap-2">🔍 Audit</button>
                        <button className="bg-[#1f2937] px-4 py-2 rounded-lg text-sm text-cyan-400 flex items-center gap-2">👑 Master</button>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">● Online</span>
                        <span className="text-sm text-gray-300">{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="relative">
                            <button onClick={() => setShowUserMenu(prev => !prev)} className="flex items-center gap-2 hover:opacity-80 transition">
                                <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold">
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm">{auth.user.name} ▾</span>
                            </button>
                            {showUserMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-[#161b22] border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-700">
                                            <p className="text-sm font-semibold text-white">{auth.user.name}</p>
                                            <p className="text-xs text-gray-400">{auth.user.email}</p>
                                            <span className="text-xs bg-cyan-900/50 text-cyan-400 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">{auth.user.role}</span>
                                        </div>
                                        <button onClick={logout} className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-900/30 transition flex items-center gap-2">🚪 Logout</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Content */}
                <div className="p-6">
                    {/* Title */}
                    <div className="flex items-center justify-between mb-5">
    <div>
        <h1 className="text-xl font-bold">Menu Master</h1>
        <p className="text-gray-400 text-sm">Kelola profil pengguna dan pantau status kerja real-time</p>
    </div>
    <button onClick={openAdd}
        className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition text-sm">
        + Tambah Pengguna
    </button>
</div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Daftar Kasir */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-3">
    <p className="font-semibold text-sm">Daftar Pengguna</p>
    <span className="text-xs text-gray-400">{users.length} Pengguna</span>
</div>
                            <div className="space-y-3">
                                {users.length === 0 ? (
    <div className="text-center py-10 text-gray-500 bg-[#161b22] rounded-xl border border-gray-800">
        Belum ada pengguna
    </div>
) : (
    users.map(user => (
        <div key={user.id} className={`bg-[#161b22] rounded-xl border-l-4 p-4 flex items-center justify-between ${
            user.is_online ? 'border-cyan-500' : 'border-gray-700'
        }`}>
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                    style={{ backgroundColor: user.avatar_color }}>
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{user.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            user.role === 'admin'
                                ? 'bg-purple-900/50 text-purple-400'
                                : 'bg-cyan-900/50 text-cyan-400'
                        }`}>
                            {user.role === 'admin' ? '🔧 Admin' : '🛒 Kasir'}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">@{user.username}</p>
                    <div className="flex gap-2">
                        {user.default_kios && (
                            <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full font-medium">
                                {user.default_kios?.name}
                            </span>
                        )}
                        {user.default_shift && (
                            <span className="bg-green-900/50 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">
                                {user.default_shift?.name}
                            </span>
                        )}
                    </div>
                    {user.notes && <p className="text-xs text-gray-500 mt-1">{user.notes}</p>}
                    <p className="text-xs text-gray-500 mt-0.5">Terakhir aktif: {formatDate(user.last_active_at)}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setViewKasir(user)}
                    className="bg-cyan-900/50 hover:bg-cyan-800 text-cyan-400 p-2 rounded-lg transition">👁️</button>
                <button onClick={() => openEdit(user)}
                    className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition">✏️</button>
                <button onClick={() => setShowDeleteConfirm(user)}
                    className="bg-red-900/50 hover:bg-red-800 text-red-400 p-2 rounded-lg transition">🗑️</button>
            </div>
        </div>
    ))
)}
                            </div>
                        </div>

                        {/* Stats & Monitor */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#161b22] rounded-xl border border-gray-800 p-4 text-center">
                                    <p className="text-3xl font-bold text-green-400">{onlineCount}</p>
                                    <p className="text-xs text-gray-400 mt-1">SEDANG ONLINE</p>
                                </div>
                                <div className="bg-[#161b22] rounded-xl border border-gray-800 p-4 text-center">
                                    <p className="text-3xl font-bold text-white">{offlineCount}</p>
                                    <p className="text-xs text-gray-400 mt-1">SEDANG OFFLINE</p>
                                </div>
                            </div>

                            <div className="bg-[#161b22] rounded-xl border border-gray-800 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="font-semibold text-sm">Monitor Aktivitas</p>
                                        <p className="text-xs text-gray-400">Status kasir yang sedang login saat ini.</p>
                                    </div>
                                    <span className="bg-green-900/50 text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">● Live</span>
                                </div>
                                <div className="space-y-2">
    {users.map(user => (
        <div key={user.id} className="flex items-center justify-between bg-[#0d1117] rounded-lg p-3">
            <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: user.avatar_color }}>
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-sm font-medium">{user.name} <span className="text-xs text-gray-400">@{user.username}</span></p>
                    <p className="text-xs text-gray-500">{user.default_kios?.name ?? '-'} · {user.default_shift?.name ?? '-'}</p>
                </div>
            </div>
            <div className="text-right">
                <span className={`text-xs flex items-center gap-1 justify-end ${user.is_online ? 'text-green-400' : 'text-gray-500'}`}>
                    ● {user.is_online ? 'Online' : 'Offline'}
                </span>
                <p className="text-xs text-gray-500">{formatDate(user.last_active_at)}</p>
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
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#161b22] rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl max-h-[90vh] overflow-auto">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                                <h2 className="font-bold">{editKasir ? '✏️ Edit Kasir' : '➕ Tambah Kasir Baru'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
                            </div>
                            <div className="p-6 space-y-3">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Nama Lengkap</label>
                                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                        className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 text-white"
                                        placeholder="contoh: Ahmad Basikal" />
                                </div>
                                <div>
    <label className="text-xs text-gray-400 mb-1 block">Role / Hak Akses</label>
    <div className="flex gap-2">
        <button
            type="button"
            onClick={() => setForm({...form, role: 'kasir'})}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition flex items-center justify-center gap-2 ${
                form.role === 'kasir'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                    : 'bg-[#0d1117] border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
        >
            🛒 Kasir
        </button>
        <button
            type="button"
            onClick={() => setForm({...form, role: 'admin'})}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition flex items-center justify-center gap-2 ${
                form.role === 'admin'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                    : 'bg-[#0d1117] border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
        >
            🔧 Admin
        </button>
    </div>
    <p className="text-xs text-gray-500 mt-1">
        {form.role === 'admin'
            ? 'Admin dapat kelola produk, riwayat, rekap, dan audit'
            : 'Kasir hanya dapat melakukan transaksi penjualan'}
    </p>
</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Username</label>
                                        <input value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                                            className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 text-white"
                                            placeholder="contoh: ahmad999" />
                                    </div>
                                    <div>
    <label className="text-xs text-gray-400 mb-1 block">
        Password {editKasir && '(kosongkan jika tidak diubah)'}
    </label>
    <div className="relative">
        <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 text-white pr-9"
            placeholder="Min. 8 karakter"
        />
        <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            👁️
        </button>
    </div>
    {/* Indikator kekuatan password */}
    {form.password.length > 0 && (
        <div className="mt-1 flex items-center gap-2">
            <div className={`h-1 flex-1 rounded-full ${
                form.password.length >= 8 ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className={`text-xs ${
                form.password.length >= 8 ? 'text-green-400' : 'text-red-400'
            }`}>
                {form.password.length >= 8 ? '✓ Password valid' : `${form.password.length}/8 karakter`}
            </span>
        </div>
    )}
</div>
                                </div>
                                
                                <div>
                                    <label className="text-xs text-gray-400 mb-2 block">Warna Avatar</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {AVATAR_COLORS.map(color => (
                                            <button key={color} type="button" onClick={() => setForm({...form, avatar_color: color})}
                                                className={`w-8 h-8 rounded-full border-2 transition ${form.avatar_color === color ? 'border-white scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Catatan (Opsional)</label>
                                    <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                                        className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 text-white resize-none"
                                        rows={2} placeholder="contoh: kasir tetap kios 1" />
                                </div>
                            </div>
                            <div className="flex gap-3 px-6 pb-6">
                                <button onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-600 text-sm hover:bg-gray-800 transition">Batal</button>
                                <button onClick={handleSubmit}
                                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold transition">
                                    {editKasir ? 'Simpan Perubahan' : 'Tambah Kasir'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal View Profil */}
                {viewKasir && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#161b22] rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                                <h2 className="font-bold">👤 Profil Kasir</h2>
                                <button onClick={() => setViewKasir(null)} className="text-gray-400 hover:text-white">✕</button>
                            </div>
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3"
                                    style={{ backgroundColor: viewKasir.avatar_color }}>
                                    {viewKasir.name.charAt(0).toUpperCase()}
                                </div>
                                <p className="font-bold text-lg">{viewKasir.name}</p>
                                <p className="text-sm text-gray-400 mb-2">@{viewKasir.username}</p>
                                <div className="flex justify-center gap-2 mb-5">
                                    <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">{viewKasir.default_kios?.name}</span>
                                    <span className="bg-green-900/50 text-green-400 text-xs px-2 py-1 rounded-full">{viewKasir.default_shift?.name}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${viewKasir.is_online ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                                        ● {viewKasir.is_online ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-[#0d1117] rounded-xl p-4">
                                        <p className="text-2xl font-bold text-cyan-400">{viewKasir.total_count}</p>
                                        <p className="text-xs text-gray-400 mt-1">TOTAL TRANSAKSI</p>
                                    </div>
                                    <div className="bg-[#0d1117] rounded-xl p-4">
                                        <p className="text-2xl font-bold text-green-400">{formatRp(viewKasir.total_revenue)}</p>
                                        <p className="text-xs text-gray-400 mt-1">TOTAL OMSET</p>
                                    </div>
                                </div>
                                {viewKasir.notes && (
                                    <div className="bg-[#0d1117] rounded-xl p-4 mb-3 text-left">
                                        <p className="text-xs text-gray-500 mb-1">CATATAN</p>
                                        <p className="text-sm">{viewKasir.notes}</p>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500">Terakhir aktif: {formatDate(viewKasir.last_active_at)}</p>
                            </div>
                            <div className="px-6 pb-6">
                                <button onClick={() => setViewKasir(null)}
                                    className="w-full py-2.5 rounded-xl border border-gray-600 text-sm font-semibold hover:bg-gray-800 transition">Tutup</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Konfirmasi Hapus */}
                {showDeleteConfirm && (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-[#161b22] rounded-2xl w-full max-w-sm border border-gray-700 p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="font-bold text-lg mb-1">Hapus Pengguna?</h2>
            <p className="text-gray-400 text-sm mb-5">
                Akun <strong className="text-white">{showDeleteConfirm.name}</strong> ({showDeleteConfirm.role}) akan dihapus permanen.
            </p>
            <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-600 text-sm hover:bg-gray-800 transition">Batal</button>
                <button onClick={() => handleDelete(showDeleteConfirm)}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition">Hapus</button>
            </div>
        </div>
    </div>
)}
            </div>
            {/* Modal Alert */}
{alertMessage && (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
        <div className="bg-[#161b22] rounded-2xl w-full max-w-sm border border-gray-700 p-6 text-center shadow-2xl">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-white font-semibold text-sm mb-5">{alertMessage}</p>
            <button
                onClick={() => setAlertMessage(null)}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold transition"
            >
                OK
            </button>
        </div>
    </div>
)}
        </>
    );
}