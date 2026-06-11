import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Products({ auth, products, categories, flash }) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [form, setForm] = useState({
        name: '', code: '', category_id: '', price: '',
        stock: '', unit: 'pcs', description: '', is_active: true,
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const formatRp = (val) => 'Rp ' + Number(val).toLocaleString('id-ID');

    const openAdd = () => {
        setEditProduct(null);
        setForm({ name: '', code: '', category_id: '', price: '', stock: '', unit: 'pcs', description: '', is_active: true });
        setShowModal(true);
    };

    const openEdit = (product) => {
        setEditProduct(product);
        setForm({
            name:        product.name,
            code:        product.code,
            category_id: product.category_id,
            price:       product.price,
            stock:       product.stock,
            unit:        product.unit,
            description: product.description ?? '',
            is_active:   product.is_active,
        });
        setShowModal(true);
    };

    const handleSubmit = () => {
        if (editProduct) {
            router.put(route('admin.products.update', editProduct.id), form, {
                onSuccess: () => setShowModal(false),
            });
        } else {
            router.post(route('admin.products.store'), form, {
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const handleDelete = (product) => {
        router.delete(route('admin.products.destroy', product.id), {
            onSuccess: () => setShowDeleteConfirm(null),
        });
    };

    const [time, setTime] = useState(new Date());

useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
}, []);

    const applyFilter = () => {
        router.get(route('admin.products'), {
            search,
            category_id: activeCategory,
        }, { preserveState: true });
    };

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = !activeCategory || p.category_id == activeCategory;
        return matchSearch && matchCat;
    });

    const logout = () => router.post(route('logout'));

    return (
        <>
            <Head title="Manajemen Produk" />
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
                        <button onClick={() => router.visit(route('kasir.dashboard'))} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white flex items-center gap-2">🛒 Kasir</button>
                        <button onClick={() => router.visit(route('admin.history'))} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white flex items-center gap-2">📋 Riwayat</button>
                        <button className="bg-[#1f2937] px-4 py-2 rounded-lg text-sm text-cyan-400 flex items-center gap-2">📦 Produk</button>
                        <button onClick={() => router.visit(route('admin.recap'))} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white flex items-center gap-2">📊 Rekap</button>
                        <button onClick={() => router.visit(route('admin.audit'))} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white flex items-center gap-2">🔍 Audit</button>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">● Online</span>
                        <span className="text-sm text-gray-300">
    {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
</span>
                        <div className="flex items-center gap-2 cursor-pointer" onClick={logout}>
                            <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm">{auth.user.name} ▾</span>
                        </div>
                    </div>
                </nav>

                {/* Content */}
                <div className="p-6">
                    {/* Title */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 className="text-xl font-bold">Manajemen Produk</h1>
                            <p className="text-gray-400 text-sm">Kelola katalog frozen food Nicky Frozen</p>
                        </div>
                        <button
                            onClick={openAdd}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition"
                        >
                            + Produk
                        </button>
                    </div>

                    {/* Flash */}
                    {flash?.success && (
                        <div className="mb-4 bg-green-900/50 text-green-400 border border-green-800 px-4 py-3 rounded-xl text-sm">
                            ✅ {flash.success}
                        </div>
                    )}

                    {/* Search */}
                    <div className="flex items-center bg-[#161b22] rounded-xl px-4 py-3 mb-4 gap-2 border border-gray-800">
                        <span className="text-gray-500">🔍</span>
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyUp={e => e.key === 'Enter' && applyFilter()}
                            className="bg-transparent outline-none text-sm text-white placeholder-gray-500 w-full"
                        />
                    </div>

                    {/* Filter Kategori */}
                    <div className="flex gap-2 mb-5 flex-wrap">
                        <button
                            onClick={() => setActiveCategory('')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${!activeCategory ? 'bg-cyan-500 text-white' : 'bg-[#161b22] text-gray-400 hover:text-white border border-gray-700'}`}
                        >
                            Semua
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeCategory == cat.id ? 'bg-cyan-500 text-white' : 'bg-[#161b22] text-gray-400 hover:text-white border border-gray-700'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Grid Produk */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="bg-[#161b22] rounded-xl p-4 border border-gray-800 hover:border-gray-600 transition">
                                <div className="bg-[#0d1117] rounded-lg p-4 flex items-center justify-center mb-3">
                                    <span className="text-2xl">🍱</span>
                                </div>
                                <p className="text-sm font-semibold leading-tight">{product.name}</p>
                                <p className="text-xs text-gray-400 mb-1">{product.category?.name}</p>
                                <p className="text-cyan-400 font-bold text-sm">{formatRp(product.price)}</p>
                                <p className="text-xs text-gray-500 mb-2">Stok: {product.stock}</p>

                                {/* Progress Stok */}
                                <div className="w-full bg-gray-700 rounded-full h-1 mb-3">
                                    <div
                                        className="bg-cyan-500 h-1 rounded-full"
                                        style={{ width: `${Math.min(100, (product.stock / 100) * 100)}%` }}
                                    />
                                </div>

                                {/* Tombol */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEdit(product)}
                                        className="flex-1 bg-[#1f2937] hover:bg-gray-700 text-white text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 transition"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(product)}
                                        className="flex-1 bg-red-900/50 hover:bg-red-800 text-red-400 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 transition"
                                    >
                                        🗑️ Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal Tambah/Edit Produk */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#161b22] rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                                <h2 className="font-bold">{editProduct ? '✏️ Edit Produk' : '➕ Tambah Produk'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
                            </div>
                            <div className="p-6 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Nama Produk</label>
                                        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                            className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 text-white"
                                            placeholder="Nama produk" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Kode Produk</label>
                                        <input value={form.code} onChange={e => setForm({...form, code: e.target.value})}
                                            className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 text-white"
                                            placeholder="NF-001" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Kategori</label>
                                    <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                                        className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 text-white">
                                        <option value="">Pilih kategori</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Harga</label>
                                        <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                                            className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 text-white"
                                            placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Stok</label>
                                        <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                                            className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 text-white"
                                            placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Satuan</label>
                                        <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                                            className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 text-white">
                                            <option value="pcs">pcs</option>
                                            <option value="kg">kg</option>
                                            <option value="pack">pack</option>
                                            <option value="liter">liter</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Deskripsi</label>
                                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                                        className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 text-white resize-none"
                                        rows={2} placeholder="Deskripsi produk (opsional)" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="is_active" checked={form.is_active}
                                        onChange={e => setForm({...form, is_active: e.target.checked})}
                                        className="rounded" />
                                    <label htmlFor="is_active" className="text-sm text-gray-300">Produk aktif</label>
                                </div>
                            </div>
                            <div className="flex gap-3 px-6 pb-6">
                                <button onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-600 text-sm hover:bg-gray-800 transition">
                                    Batal
                                </button>
                                <button onClick={handleSubmit}
                                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold transition">
                                    {editProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Konfirmasi Hapus */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#161b22] rounded-2xl w-full max-w-sm border border-gray-700 p-6 text-center">
                            <div className="text-4xl mb-3">🗑️</div>
                            <h2 className="font-bold text-lg mb-1">Hapus Produk?</h2>
                            <p className="text-gray-400 text-sm mb-5">
                                Produk <strong className="text-white">{showDeleteConfirm.name}</strong> akan dihapus permanen.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-600 text-sm hover:bg-gray-800 transition">
                                    Batal
                                </button>
                                <button onClick={() => handleDelete(showDeleteConfirm)}
                                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition">
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}