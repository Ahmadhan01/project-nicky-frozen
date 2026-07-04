import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import AdminNavbar from "@/Components/AdminNavbar";
import { HelpCircle, Download, Calendar, Coins, TrendingUp, CreditCard, Award, Phone } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

export default function Recap({
    auth,
    stats,
    chartData,
    breakdown,
    kiosList,
    period,
    kios_id,
}) {
    const [selectedKios, setSelectedKios] = useState(kios_id ?? "");
    const [selectedPeriod, setSelectedPeriod] = useState(period ?? "weekly");

    const formatRp = (val) => {
        if (val >= 1000000) return "Rp " + (val / 1000000).toFixed(1) + "jt";
        if (val >= 1000) return "Rp " + (val / 1000).toFixed(0) + "rb";
        return "Rp " + Number(val).toLocaleString("id-ID");
    };

    const formatRpFull = (val) => "Rp " + Number(val).toLocaleString("id-ID");

    const applyFilter = () => {
        router.get(
            route("admin.recap"),
            {
                period: selectedPeriod,
                kios_id: selectedKios,
            },
            { preserveState: true },
        );
    };

    const cashPercent =
        stats.total_count > 0
            ? Math.round((stats.cash_count / stats.total_count) * 100)
            : 0;
    const nonCashPercent = 100 - cashPercent;

    const [showHelpModal, setShowHelpModal] = useState(false);

    const pieData = [
        { name: "Cash", value: stats.cash_total, color: "var(--theme-accent)" },
        { name: "Non-Cash", value: stats.non_cash_total, color: "var(--theme-muted)" },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-theme-panel border border-theme-border rounded-lg px-3 py-2 text-xs shadow-md text-theme-text">
                    <p className="text-theme-muted">{label}</p>
                    <p className="text-theme-accent font-bold">
                        {formatRp(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <Head title="Rekap Keuangan" />
            <div className="h-screen bg-theme-bg text-theme-text flex flex-col overflow-hidden">
                {/* Navbar */}
                <AdminNavbar activeTab="recap" />

                {/* Content */}
                <div className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col overflow-hidden p-6">
                    {/* Title */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 className="text-xl font-bold text-theme-text">
                                Rekap Keuangan
                            </h1>
                            <p className="text-theme-muted text-sm">
                                Laporan penjualan dan analitik bisnis
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
                                onClick={() => {
                                    const headers = [
                                        "Produk",
                                        "QTY Terjual",
                                        "Total Pendapatan",
                                        "% Kontribusi",
                                    ];
                                    const rows = breakdown.map((b) => [
                                        b.name,
                                        b.qty + " " + b.unit,
                                        formatRpFull(b.revenue),
                                        b.contribution + "%",
                                    ]);
                                    const csv = [headers, ...rows]
                                        .map((r) => r.join(","))
                                        .join("\n");
                                    const blob = new Blob([csv], {
                                        type: "text/csv",
                                    });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = "rekap-nicky-frozen.csv";
                                    a.click();
                                }}
                                className="bg-theme-accent hover:bg-theme-accent-hover text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition text-sm shadow-sm"
                            >
                                <Download className="w-4 h-4 text-white" /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-3 mb-5">
                        <p className="text-sm text-theme-muted">Kios</p>
                        <select
                            value={selectedKios}
                            onChange={(e) => setSelectedKios(e.target.value)}
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
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="bg-theme-panel border border-theme-border text-sm rounded-lg pl-3 pr-8 py-2 text-theme-text outline-none focus:border-theme-accent"
                        >
                            <option value="daily">Harian</option>
                            <option value="weekly">Mingguan</option>
                            <option value="monthly">Bulanan</option>
                        </select>
                        <button
                            onClick={applyFilter}
                            className="bg-theme-accent hover:bg-theme-accent-hover text-white text-sm px-4 py-2 rounded-lg transition font-semibold shadow-sm"
                        >
                            Tampilkan
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-theme-panel rounded-xl border border-theme-border p-5 shadow-sm animate-slide-up" style={{ animationDelay: '50ms' }}>
                                <div className="text-2xl mb-2">💰</div>
                                <p className="text-xs text-theme-muted uppercase tracking-wide font-semibold">
                                    Total Pendapatan
                                </p>
                                <p className="text-3xl font-bold text-theme-text mt-1">
                                    {formatRp(stats.total_revenue)}
                                </p>
                                <p className="text-xs text-theme-muted mt-1">
                                    {stats.total_count} Transaksi
                                </p>
                            </div>
                            <div className="bg-theme-panel rounded-xl border border-theme-border p-5 shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
                                <div className="text-2xl mb-2">💵</div>
                                <p className="text-xs text-theme-muted uppercase tracking-wide font-semibold">
                                    Pembayaran Cash
                                </p>
                                <p className="text-3xl font-bold text-theme-text mt-1">
                                    {formatRp(stats.cash_total)}
                                </p>
                                <p className="text-xs text-theme-muted mt-1">
                                    {stats.cash_count} Transaksi
                                </p>
                            </div>
                            <div className="bg-theme-panel rounded-xl border border-theme-border p-5 shadow-sm animate-slide-up" style={{ animationDelay: '150ms' }}>
                                <div className="text-2xl mb-2">💳</div>
                                <p className="text-xs text-theme-muted uppercase tracking-wide font-semibold">
                                    Non-Cash (QRIS)
                                </p>
                                <p className="text-3xl font-bold text-theme-text mt-1">
                                    {formatRp(stats.non_cash_total)}
                                </p>
                                <p className="text-xs text-theme-muted mt-1">
                                    {stats.non_cash_count} Transaksi
                                </p>
                            </div>
                            <div className="bg-theme-panel rounded-xl border border-theme-border p-5 shadow-sm animate-slide-up" style={{ animationDelay: '200ms' }}>
                                <div className="text-2xl mb-2">📈</div>
                                <p className="text-xs text-theme-muted uppercase tracking-wide font-semibold">
                                    Rata-rata Transaksi
                                </p>
                                <p className="text-3xl font-bold text-theme-text mt-1">
                                    {formatRp(stats.avg_transaction)}
                                </p>
                                <p className="text-xs text-theme-muted mt-1">
                                    Per Transaksi
                                </p>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                            {/* Bar Chart */}
                            <div className="lg:col-span-2 bg-theme-panel rounded-xl border border-theme-border p-5 shadow-sm animate-slide-up" style={{ animationDelay: '250ms' }}>
                                <div className="flex items-center gap-2 mb-4">
                                    <span>📈</span>
                                    <p className="text-sm font-semibold text-theme-text">
                                        Penjualan per Hari (
                                        {selectedPeriod === "weekly"
                                            ? "7 Terakhir"
                                            : selectedPeriod === "monthly"
                                              ? "Bulan Ini"
                                              : "Hari Ini"}
                                        )
                                    </p>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={chartData}>
                                        <XAxis
                                            dataKey="date"
                                            tick={{
                                                fill: "var(--theme-muted)",
                                                fontSize: 11,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis hide />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar
                                            dataKey="total"
                                            fill="url(#barGradient)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <defs>
                                            <linearGradient
                                                id="barGradient"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="var(--theme-accent)"
                                                    stopOpacity={0.9}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="var(--theme-accent)"
                                                    stopOpacity={0.1}
                                                />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Pie Chart */}
                            <div className="bg-theme-panel rounded-xl border border-theme-border p-5 shadow-sm animate-slide-up" style={{ animationDelay: '300ms' }}>
                                <div className="flex items-center gap-2 mb-4 text-theme-text">
                                    <span>💳</span>
                                    <p className="text-sm font-semibold">
                                        Metode Pembayaran
                                    </p>
                                </div>
                                <div className="flex items-center justify-center">
                                    <PieChart width={180} height={180}>
                                        <Pie
                                            data={pieData}
                                            cx={90}
                                            cy={90}
                                            innerRadius={55}
                                            outerRadius={80}
                                            dataKey="value"
                                            startAngle={90}
                                            endAngle={-270}
                                        >
                                            {pieData.map((entry, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={entry.color}
                                                />
                                            ))}
                                        </Pie>
                                        <text
                                            x={90}
                                            y={85}
                                            textAnchor="middle"
                                            fill="var(--theme-muted)"
                                            fontSize={11}
                                            fontWeight="bold"
                                        >
                                            Total
                                        </text>
                                        <text
                                            x={90}
                                            y={105}
                                            textAnchor="middle"
                                            fill="var(--theme-text)"
                                            fontSize={16}
                                            fontWeight="bold"
                                        >
                                            {stats.total_count}
                                        </text>
                                    </PieChart>
                                </div>
                                <div className="space-y-2 mt-2">
                                    <div className="flex items-center justify-between text-xs text-theme-text">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-theme-accent" />
                                            <span className="text-theme-muted">
                                                Cash — {cashPercent}%
                                            </span>
                                        </div>
                                        <span className="text-theme-text font-medium">
                                            {formatRpFull(stats.cash_total)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-theme-text">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-theme-border" />
                                            <span className="text-theme-muted">
                                                Non-Cash — {nonCashPercent}%
                                            </span>
                                        </div>
                                        <span className="text-theme-text font-medium">
                                            {formatRpFull(stats.non_cash_total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown per Produk */}
                        <div className="bg-theme-panel rounded-xl border border-theme-border overflow-hidden flex flex-col max-h-[360px] shadow-sm animate-slide-up" style={{ animationDelay: '350ms' }}>
                            <div className="px-5 py-4 border-b border-theme-border bg-theme-bg/30">
                                <p className="font-semibold text-sm text-theme-text">
                                    Breakdown per Produk
                                </p>
                            </div>
                            <div className="overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-theme-border text-theme-muted text-xs uppercase bg-theme-bg/50">
                                            <th className="px-5 py-3 text-left">
                                                Produk
                                            </th>
                                            <th className="px-5 py-3 text-left">
                                                QTY Terjual
                                            </th>
                                            <th className="px-5 py-3 text-left">
                                                Total Pendapatan
                                            </th>
                                            <th className="px-5 py-3 text-left">
                                                % Kontribusi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {breakdown.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="text-center py-8 text-theme-muted"
                                                >
                                                    Belum ada data
                                                </td>
                                            </tr>
                                        ) : (
                                            breakdown.map((item, i) => (
                                                <tr
                                                    key={i}
                                                    className="border-b border-theme-border hover:bg-theme-border/30 transition text-theme-text"
                                                >
                                                    <td className="px-5 py-3 font-medium">
                                                        {item.name}
                                                    </td>
                                                    <td className="px-5 py-3 text-theme-muted">
                                                        {item.qty} {item.unit}
                                                    </td>
                                                    <td className="px-5 py-3 font-semibold text-theme-text">
                                                        {formatRpFull(item.revenue)}
                                                    </td>
                                                    <td className="px-5 py-3 text-theme-muted">
                                                        {item.contribution}%
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Bantuan Halaman Rekap */}
                {showHelpModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-theme-panel rounded-2xl w-full max-w-lg border border-theme-border max-h-[85vh] flex flex-col text-theme-text">
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-theme-border">
                                <div className="flex items-center gap-3">
                                    <HelpCircle className="w-6 h-6 text-theme-accent" />
                                    <h2 className="text-lg font-bold text-theme-text">
                                        Panduan Membaca Rekap
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
                                    <Calendar className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            1. Memilih Kios & Periode
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Pilih <strong>Kios</strong> kalau
                                            mau lihat laporan kios tertentu
                                            saja, dan pilih periode (
                                            <strong>
                                                Harian/Mingguan/Bulanan
                                            </strong>
                                            ), lalu tekan <strong>"Tampilkan"</strong>.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Coins className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            2. Kartu Ringkasan
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            4 kotak di atas menunjukkan{" "}
                                            <strong>Total Pendapatan</strong>{" "}
                                            (semua transaksi),{" "}
                                            <strong>Pembayaran Cash</strong>,{" "}
                                            <strong>Non-Cash (QRIS)</strong>,
                                            dan <strong>Rata-rata per Transaksi</strong>{" "}
                                            sesuai kios & periode yang dipilih.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <TrendingUp className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            3. Grafik Penjualan per Hari
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Grafik batang menunjukkan naik-
                                            turunnya pendapatan dari hari ke
                                            hari. Makin tinggi batang, makin
                                            besar pendapatan hari itu.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <CreditCard className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            4. Grafik Metode Pembayaran
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Diagram lingkaran menunjukkan
                                            perbandingan pelanggan yang bayar{" "}
                                            <strong>Tunai</strong> vs <strong>Non-Tunai</strong>. Angka di
                                            tengah adalah total jumlah
                                            transaksi.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Award className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            5. Tabel Produk Terlaris
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Tabel di bawah menunjukkan produk
                                            mana yang paling banyak terjual,
                                            beserta kontribusinya (%) terhadap
                                            total pendapatan. Berguna buat tahu
                                            produk mana yang paling laku.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Download className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-theme-text">
                                            6. Export CSV
                                        </p>
                                        <p className="text-theme-muted text-sm mt-1">
                                            Tekan <strong>"Export CSV"</strong>{" "}
                                            untuk mengunduh laporan produk
                                            terlaris dalam bentuk file yang bisa
                                            dibuka di Excel/Google Sheets.
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
        </>
    );
}
