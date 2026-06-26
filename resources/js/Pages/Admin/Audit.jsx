import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Audit({ auth, logs }) {
    const formatDate = (val) => new Date(val).toLocaleString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const getIcon = (type) => {
        switch (type) {
            case 'transaction': return { icon: '✅', bg: 'bg-green-900/50', color: 'text-green-400' };
            case 'session':     return { icon: '⚙️', bg: 'bg-blue-900/50',  color: 'text-blue-400'  };
            case 'product':     return { icon: '📦', bg: 'bg-yellow-900/50', color: 'text-yellow-400' };
            default:            return { icon: '📋', bg: 'bg-gray-800',      color: 'text-gray-400'  };
        }
    };

const [time, setTime] = useState(new Date());

const [showUserMenu, setShowUserMenu] = useState(false);

useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
}, []);

    const logout = () => router.post(route('logout'));

    return (
        <>
            <Head title="Audit Trail" />
            <div className="h-screen bg-[#0d1117] text-white flex flex-col overflow-hidden">

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
                        <button className="bg-[#1f2937] px-4 py-2 rounded-lg text-sm text-cyan-400 flex items-center gap-2">🔍 Audit</button>
                        {auth.user.role === 'owner' && (
    <button onClick={() => router.visit(route('admin.master'))} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white flex items-center gap-2">
        👑 Master
    </button>
)}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">● Online</span>
                        <span className="text-sm text-gray-300">
    {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
</span>
                        <div className="relative">
    <button

        onClick={() => setShowUserMenu(prev => !prev)}
        className="flex items-center gap-2 hover:opacity-80 transition"
    >
        <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold">
            {auth.user.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm">{auth.user.name} ▾</span>
    </button>

    {showUserMenu && (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-[#161b22] border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-semibold text-white">{auth.user.name}</p>
                    <p className="text-xs text-gray-400">{auth.user.email}</p>
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
<div className="flex-1 flex flex-col overflow-hidden p-6">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold">Audit Trail</h1>
                        <p className="text-gray-400 text-sm">Log perubahan dan aktivitas sistem</p>
                    </div>

                    
                   {/* Log List */}
<div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {logs.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                <p className="text-4xl mb-2">📋</p>
                                <p>Belum ada aktivitas tercatat</p>
                            </div>
                        ) : (
                            logs.map(log => {
                                const { icon, bg, color } = getIcon(log.type);
                                return (
                                    <div key={log.id} className="bg-[#161b22] rounded-xl border border-gray-800 px-5 py-4 flex items-center gap-4 hover:border-gray-600 transition">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${bg}`}>
                                            {icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white">{log.description}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Oleh: <span className="text-gray-300">{log.user?.name ?? 'System'}</span>
                                                <span className="mx-1">·</span>
                                                {formatDate(log.created_at)}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full bg-gray-800 ${color} capitalize flex-shrink-0`}>
                                            {log.type}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}