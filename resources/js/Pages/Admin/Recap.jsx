import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Recap({ auth, stats, chartData, breakdown, kiosList, period, kios_id }) {
    const [selectedKios, setSelectedKios] = useState(kios_id ?? '');
    const [selectedPeriod, setSelectedPeriod] = useState(period ?? 'weekly');

    const formatRp = (val) => {
        if (val >= 1000000) return 'Rp ' + (val / 1000000).toFixed(1) + 'jt';
        if (val >= 1000) return 'Rp ' + (val / 1000).toFixed(0) + 'rb';
        return 'Rp ' + Number(val).toLocaleString('id-ID');
    };

    const [time, setTime] = useState(new Date());

useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
}, []);

    const formatRpFull = (val) => 'Rp ' + Number(val).toLocaleString('id-ID');

    const applyFilter = () => {
        router.get(route('admin.recap'), {
            period:  selectedPeriod,
            kios_id: selectedKios,
        }, { preserveState: true });
    };

    const cashPercent  = stats.total_count > 0 ? Math.round((stats.cash_count / stats.total_count) * 100) : 0;
    const nonCashPercent = 100 - cashPercent;

    const [showUserMenu, setShowUserMenu] = useState(false);

    const pieData = [
        { name: 'Cash', value: stats.cash_total, color: '#22d3ee' },
        { name: 'Non-Cash', value: stats.non_cash_total, color: '#374151' },
    ];

    const logout = () => router.post(route('logout'));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1f2937] border border-gray-700 rounded-lg px-3 py-2 text-xs">
                    <p className="text-gray-400">{label}</p>
                    <p className="text-cyan-400 font-bold">{formatRp(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <Head title="Rekap Keuangan" />
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
                        <button className="bg-[#1f2937] px-4 py-2 rounded-lg text-sm text-cyan-400 flex items-center gap-2">📊 Rekap</button>
                        <button onClick={() => router.visit(route('admin.audit'))} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white flex items-center gap-2">🔍 Audit</button>
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
                {/* Content */}
<div className="flex-1 flex flex-col overflow-hidden p-6">
                    {/* Title */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 className="text-xl font-bold">Rekap Keuangan</h1>
                            <p className="text-gray-400 text-sm">Laporan penjualan dan analitik bisnis</p>
                        </div>
                        <button
                            onClick={() => {
                                const headers = ['Produk', 'QTY Terjual', 'Total Pendapatan', '% Kontribusi'];
                                const rows = breakdown.map(b => [b.name, b.qty + ' ' + b.unit, formatRpFull(b.revenue), b.contribution + '%']);
                                const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
                                const blob = new Blob([csv], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url; a.download = 'rekap-nicky-frozen.csv'; a.click();
                            }}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition text-sm"
                        >
                            📥 Export CSV
                        </button>
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-3 mb-5">
                        <p className="text-sm text-gray-400">Kios</p>
                        <select value={selectedKios} onChange={e => setSelectedKios(e.target.value)}
                            className="bg-[#161b22] border border-gray-700 text-sm rounded-lg px-3 py-2 text-white outline-none">
                            <option value="">Semua Kios</option>
                            {kiosList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                        </select>
                        <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
                            className="bg-[#161b22] border border-gray-700 text-sm rounded-lg px-3 py-2 text-white outline-none">
                            <option value="daily">Harian</option>
                            <option value="weekly">Mingguan</option>
                            <option value="monthly">Bulanan</option>
                        </select>
                        <button onClick={applyFilter}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white text-sm px-4 py-2 rounded-lg transition font-semibold">
                            Tampilkan
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-[#161b22] rounded-xl border border-gray-800 p-5">
                            <div className="text-2xl mb-2">💰</div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Total Pendapatan</p>
                            <p className="text-3xl font-bold text-white mt-1">{formatRp(stats.total_revenue)}</p>
                            <p className="text-xs text-gray-500 mt-1">{stats.total_count} Transaksi</p>
                        </div>
                        <div className="bg-[#161b22] rounded-xl border border-gray-800 p-5">
                            <div className="text-2xl mb-2">💵</div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Pembayaran Cash</p>
                            <p className="text-3xl font-bold text-white mt-1">{formatRp(stats.cash_total)}</p>
                            <p className="text-xs text-gray-500 mt-1">{stats.cash_count} Transaksi</p>
                        </div>
                        <div className="bg-[#161b22] rounded-xl border border-gray-800 p-5">
                            <div className="text-2xl mb-2">💳</div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Non-Cash (QRIS)</p>
                            <p className="text-3xl font-bold text-white mt-1">{formatRp(stats.non_cash_total)}</p>
                            <p className="text-xs text-gray-500 mt-1">{stats.non_cash_count} Transaksi</p>
                        </div>
                        <div className="bg-[#161b22] rounded-xl border border-gray-800 p-5">
                            <div className="text-2xl mb-2">📈</div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Rata-rata Transaksi</p>
                            <p className="text-3xl font-bold text-white mt-1">{formatRp(stats.avg_transaction)}</p>
                            <p className="text-xs text-gray-500 mt-1">Per Transaksi</p>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                        {/* Bar Chart */}
                        <div className="lg:col-span-2 bg-[#161b22] rounded-xl border border-gray-800 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <span>📈</span>
                                <p className="text-sm font-semibold">
                                    Penjualan per Hari ({selectedPeriod === 'weekly' ? '7 Terakhir' : selectedPeriod === 'monthly' ? 'Bulan Ini' : 'Hari Ini'})
                                </p>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={chartData}>
                                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="total" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#0891b2" stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-[#161b22] rounded-xl border border-gray-800 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <span>💳</span>
                                <p className="text-sm font-semibold">Metode Pembayaran</p>
                            </div>
                            <div className="flex items-center justify-center">
                                <PieChart width={180} height={180}>
                                    <Pie data={pieData} cx={90} cy={90} innerRadius={55} outerRadius={80}
                                        dataKey="value" startAngle={90} endAngle={-270}>
                                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <text x={90} y={85} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">Total</text>
                                    <text x={90} y={100} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">{stats.total_count}</text>
                                </PieChart>
                            </div>
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-cyan-400" />
                                        <span className="text-gray-300">Cash — {cashPercent}%</span>
                                    </div>
                                    <span className="text-gray-400">{formatRpFull(stats.cash_total)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-gray-600" />
                                        <span className="text-gray-300">Non-Cash — {nonCashPercent}%</span>
                                    </div>
                                    <span className="text-gray-400">{formatRpFull(stats.non_cash_total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                   
                    {/* Breakdown per Produk */}
<div className="bg-[#161b22] rounded-xl border border-gray-800 overflow-hidden flex flex-col max-h-72">
                        <div className="px-5 py-4 border-b border-gray-800">
                            <p className="font-semibold text-sm">Breakdown per Produk</p>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                                    <th className="px-5 py-3 text-left">Produk</th>
                                    <th className="px-5 py-3 text-left">QTY Terjual</th>
                                    <th className="px-5 py-3 text-left">Total Pendapatan</th>
                                    <th className="px-5 py-3 text-left">% Kontribusi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {breakdown.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-500">Belum ada data</td>
                                    </tr>
                                ) : (
                                    breakdown.map((item, i) => (
                                        <tr key={i} className="border-b border-gray-800 hover:bg-[#1f2937] transition">
                                            <td className="px-5 py-3">{item.name}</td>
                                            <td className="px-5 py-3 text-gray-300">{item.qty} {item.unit}</td>
                                            <td className="px-5 py-3 font-semibold">{formatRpFull(item.revenue)}</td>
                                            <td className="px-5 py-3 text-gray-300">{item.contribution}%</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    </div>
                </div>
            </div>
        </>
    );
}