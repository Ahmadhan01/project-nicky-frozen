import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import AdminNavbar from "@/Components/AdminNavbar";
import { Plus, Edit2, Trash2, AlertTriangle, Package, FolderOpen, Layers, HelpCircle, Eye, EyeOff, Search } from "lucide-react";

export default function Products({
    auth,
    products,
    categories,
    kiosList,
    flash,
}) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [form, setForm] = useState({
        name: "",
        code: "",
        category_id: "",
        price: "",
        unit: "pcs",
        description: "",
        is_active: true,
        expiry_date: "",
        min_stock: 5,
        stocks: {},
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [categoryForm, setCategoryForm] = useState({
        name: "",
        description: "",
    });
    const [editCategory, setEditCategory] = useState(null);
    const [showDeleteCategory, setShowDeleteCategory] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [showHelpModal, setShowHelpModal] = useState(false);

    const formatRp = (val) => "Rp " + Number(val).toLocaleString("id-ID");

    const getExpiryStatus = (expiryDate) => {
        if (!expiryDate) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exp = new Date(expiryDate);
        const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { label: "Kadaluarsa", color: "bg-red-500 text-white" };
        }
        if (diffDays <= 7) {
            return {
                label: `H-${diffDays}`,
                color: "bg-orange-500 text-white",
            };
        }
        return null;
    };

    const generateNextCode = () => {
        const prefix = "NF-";
        const numbers = products
            .map((p) => p.code)
            .filter((code) => code && code.startsWith(prefix))
            .map((code) => parseInt(code.replace(prefix, ""), 10))
            .filter((n) => !isNaN(n));

        const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
        return prefix + String(nextNumber).padStart(3, "0");
    };

    const openAdd = () => {
        setEditProduct(null);
        setFormErrors({});
        setForm({
            name: "",
            code: generateNextCode(),
            category_id: "",
            price: "",
            unit: "pcs",
            description: "",
            is_active: true,
            expiry_date: "",
            min_stock: 5,
            stocks: {}, // diisi lewat input "Stok per Kios"
        });
        setShowModal(true);
    };

    const openEdit = (product) => {
        setEditProduct(product);
        setFormErrors({});

        // Load stok per kios
        const stocksMap = {};
        kiosList.forEach((kios) => {
            const found = product.stocks?.find((s) => s.kios_id === kios.id);
            stocksMap[kios.id] = found?.stock ?? 0;
        });

        setForm({
            name: product.name,
            code: product.code,
            category_id: product.category_id,
            price: product.price,
            unit: product.unit,
            description: product.description ?? "",
            is_active: product.is_active,
            expiry_date: product.expiry_date
                ? product.expiry_date.slice(0, 10)
                : "",
            min_stock: product.min_stock ?? 5,
            stocks: stocksMap,
        });
        setShowModal(true);
    };

    const stocksToArray = () =>
        Object.entries(form.stocks || {}).map(([kios_id, stock]) => ({
            kios_id: parseInt(kios_id),
            stock,
        }));

    const handleSubmit = () => {
        if (editProduct) {
            router.put(route("admin.products.update", editProduct.id), form, {
                onSuccess: () => {
                    router.put(
                        route("admin.products.stock", editProduct.id),
                        { stocks: stocksToArray() },
                        { onSuccess: () => setShowModal(false) },
                    );
                },
                onError: (errors) => {
                    console.error("Gagal update produk:", errors);
                    setFormErrors(errors);
                },
            });
        } else {
            // Produk baru: stok awal tiap kios dikirim sekalian
            router.post(
                route("admin.products.store"),
                { ...form, stocks: stocksToArray() },
                {
                    onSuccess: () => setShowModal(false),
                    onError: (errors) => {
                        console.error("Gagal tambah produk:", errors);
                        setFormErrors(errors);
                    },
                },
            );
        }
    };

    const handleDelete = (product) => {
        router.delete(route("admin.products.destroy", product.id), {
            onSuccess: () => setShowDeleteConfirm(null),
        });
    };

    const openAddCategory = () => {
        setEditCategory(null);
        setCategoryForm({ name: "", description: "" });
        setShowCategoryModal(true);
    };

    const openEditCategory = (category) => {
        setEditCategory(category);
        setCategoryForm({
            name: category.name,
            description: category.description ?? "",
        });
        setShowCategoryModal(true);
    };

    const handleCategorySubmit = () => {
        if (editCategory) {
            router.put(
                route("admin.categories.update", editCategory.id),
                categoryForm,
                {
                    onSuccess: () => setShowCategoryModal(false),
                },
            );
        } else {
            router.post(route("admin.categories.store"), categoryForm, {
                onSuccess: () => setShowCategoryModal(false),
            });
        }
    };

    const handleDeleteCategory = (category) => {
        router.delete(route("admin.categories.destroy", category.id), {
            onSuccess: () => setShowDeleteCategory(null),
        });
    };

    const applyFilter = () => {
        router.get(
            route("admin.products"),
            {
                search,
                category_id: activeCategory,
            },
            { preserveState: true },
        );
    };

    const categoryNames = ["Semua", ...categories.map((c) => c.name)];

    const filteredProducts = products.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory =
            activeCategory === "Semua" || p.category?.name === activeCategory;
        return matchSearch && matchCategory;
    });

    return (
        <>
            <Head title="Manajemen Produk" />
            <div className="h-screen bg-theme-bg text-theme-text flex flex-col overflow-hidden">
                {/* Navbar */}
                <AdminNavbar activeTab="products" />

                {/* Content */}
                <div className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col overflow-hidden p-6">
                    {/* Title */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 className="text-xl font-bold text-theme-text">
                                Manajemen Produk
                            </h1>
                            <p className="text-theme-muted text-sm">
                                Kelola katalog frozen food Nicky Frozen
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
                                onClick={openAddCategory}
                                className="bg-theme-panel hover:bg-theme-border border border-theme-border text-theme-text font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition text-sm shadow-sm"
                            >
                                <FolderOpen className="w-4 h-4 text-theme-muted" /> Kategori
                            </button>
                            <button
                                onClick={openAdd}
                                className="bg-theme-accent hover:bg-theme-accent-hover text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition text-sm shadow-sm"
                            >
                                <Plus className="w-4 h-4 text-white" /> Produk
                            </button>
                        </div>
                    </div>

                    {/* Flash */}
                    {flash?.success && (
                        <div className="mb-4 bg-[#f6fdf8] text-green-800 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/50 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm">
                            ✅ {flash.success}
                        </div>
                    )}

                    {/* Peringatan stok menipis */}
                    {products.filter((p) => p.is_low_stock).length > 0 && (
                        <div className="mb-4 bg-[#fffdf4] text-yellow-800 border border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900/50 px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-semibold shadow-sm">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            <span>
                                {products.filter((p) => p.is_low_stock).length} produk stok menipis, segera restock.
                            </span>
                        </div>
                    )}

                    {/* Search */}
                    <div className="flex items-center bg-theme-panel rounded-xl px-4 py-3 mb-4 gap-2.5 border border-theme-border shadow-sm">
                        <Search className="w-4 h-4 text-theme-muted" />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyUp={(e) => e.key === "Enter" && applyFilter()}
                            className="bg-transparent outline-none text-sm text-theme-text placeholder-theme-muted w-full"
                        />
                    </div>

                    {/* Filter Kategori */}
                    <div className="flex gap-2 mb-5 flex-wrap">
                        {categoryNames.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition border ${
                                    activeCategory === cat
                                        ? "bg-theme-accent text-white border-theme-accent"
                                        : "bg-theme-panel text-theme-muted hover:text-theme-text border-theme-border"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Grid Produk */}
                    <div className="flex-1 overflow-y-auto px-2 pt-2 pb-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {filteredProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="animate-slide-up hover-scale-card bg-theme-panel rounded-xl p-4 border border-theme-border relative shadow-sm flex flex-col justify-between"
                                    style={{ animationDelay: `${(index % 18) * 30}ms` }}
                                >
                                    <div>
                                        {/* Badge Aktif/Nonaktif */}
                                        <div
                                            className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 ${
                                                product.is_active
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                            }`}
                                        >
                                            {product.is_active ? "✓" : "✕"}
                                        </div>

                                        {/* Badge Kadaluarsa */}
                                        {getExpiryStatus(product.expiry_date) && (
                                            <div
                                                className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold z-10 ${
                                                    getExpiryStatus(
                                                        product.expiry_date,
                                                    ).color
                                                }`}
                                            >
                                                {
                                                    getExpiryStatus(
                                                        product.expiry_date,
                                                    ).label
                                                }
                                            </div>
                                        )}

                                        {/* Badge Stok Menipis */}
                                        {product.is_low_stock && (
                                            <div
                                                className={`absolute px-2 py-0.5 rounded-full text-[10px] font-bold z-10 bg-yellow-500 text-black ${
                                                    getExpiryStatus(
                                                        product.expiry_date,
                                                    )
                                                        ? "top-8 left-2"
                                                        : "top-2 left-2"
                                                }`}
                                            >
                                                ⚠️ Menipis
                                            </div>
                                        )}

                                        <div className="bg-theme-bg rounded-lg p-4 flex items-center justify-center mb-3">
                                            <Package className="w-8 h-8 text-theme-muted" />
                                        </div>
                                        <p className="text-sm font-semibold leading-tight text-theme-text">
                                            {product.name}
                                        </p>
                                        <p className="text-xs text-theme-muted mb-1">
                                            {product.category?.name}
                                        </p>
                                        <p className="text-theme-accent font-bold text-sm">
                                            {formatRp(product.price)}
                                        </p>
                                        {product.expiry_date && (
                                            <p className="text-[11px] text-theme-muted">
                                                Exp:{" "}
                                                {new Date(
                                                    product.expiry_date,
                                                ).toLocaleDateString("id-ID", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        )}
                                        <p
                                            className={`text-xs mb-2 ${(product.stocks?.reduce((a, s) => a + s.stock, 0) ?? 0) === 0 ? "text-red-400 font-medium" : "text-theme-muted"}`}
                                        >
                                            Stok:{" "}
                                            {product.stocks?.reduce(
                                                (a, s) => a + s.stock,
                                                0,
                                            ) ?? 0}
                                        </p>

                                        {/* Progress Stok (total semua kios) */}
                                        <div className="w-full bg-theme-border rounded-full h-1.5 mb-4">
                                            <div
                                                className={`h-1.5 rounded-full ${
                                                    (product.stocks?.reduce(
                                                        (a, s) => a + s.stock,
                                                        0,
                                                    ) ?? 0) === 0
                                                        ? "bg-red-500"
                                                        : product.is_low_stock
                                                          ? "bg-yellow-500"
                                                          : "bg-theme-accent"
                                                }`}
                                                style={{
                                                    width: `${Math.min(100, ((product.stocks?.reduce((a, s) => a + s.stock, 0) ?? 0) / 100) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Tombol */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEdit(product)}
                                            className="flex-1 bg-theme-border hover:opacity-85 text-theme-text text-xs py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition border border-transparent shadow-sm"
                                        >
                                            <Edit2 className="w-3.5 h-3.5 text-theme-muted" /> Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                setShowDeleteConfirm(product)
                                            }
                                            className="flex-1 bg-red-900/10 hover:bg-red-900/20 text-red-500 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition border border-red-500/20 shadow-sm"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-red-500" /> Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modal Tambah/Edit Produk */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-theme-panel rounded-2xl w-full max-w-lg border border-theme-border shadow-2xl max-h-[90vh] flex flex-col text-theme-text animate-modal-pop">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border shrink-0">
                                <h2 className="font-bold flex items-center gap-2 text-theme-text">
                                    {editProduct ? (
                                        <>
                                            <Edit2 className="w-5 h-5 text-theme-accent" />
                                            <span>Edit Produk</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5 text-theme-accent" />
                                            <span>Tambah Produk</span>
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
                            <div className="p-6 space-y-3 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-theme-muted mb-1 block">
                                            Nama Produk
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm outline-none focus:border-theme-accent text-theme-text"
                                            placeholder="Nama produk frozen"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-theme-muted mb-1 block">
                                            Kode Produk
                                        </label>
                                        <input
                                            type="text"
                                            value={form.code}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    code: e.target.value,
                                                })
                                            }
                                            className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm outline-none focus:border-theme-accent text-theme-text"
                                            placeholder="Kode produk"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-theme-muted mb-1 block">
                                        Kategori
                                    </label>
                                    <select
                                        value={form.category_id}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                category_id: e.target.value,
                                            })
                                        }
                                        className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg pl-3 pr-8 py-2 text-sm outline-none focus:border-theme-accent text-theme-text"
                                    >
                                        <option value="">Pilih kategori</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs text-theme-muted mb-1 block">
                                            Harga
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={
                                                form.price
                                                    ? Number(
                                                          form.price,
                                                      ).toLocaleString("id-ID")
                                                    : ""
                                            }
                                            onChange={(e) => {
                                                const digitsOnly =
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        "",
                                                    );
                                                setForm({
                                                    ...form,
                                                    price: digitsOnly,
                                                });
                                            }}
                                            className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm outline-none focus:border-theme-accent text-theme-text"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-theme-muted mb-1 block">
                                            Satuan
                                        </label>
                                        <select
                                            value={form.unit}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    unit: e.target.value,
                                                })
                                            }
                                            className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg pl-3 pr-8 py-2 text-sm outline-none focus:border-theme-accent text-theme-text"
                                        >
                                            <option value="pcs">pcs</option>
                                            <option value="kg">kg</option>
                                            <option value="pack">pack</option>
                                            <option value="liter">liter</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-theme-muted mb-1 block">
                                        Tanggal Kadaluarsa (opsional)
                                    </label>
                                    <input
                                        type="date"
                                        value={form.expiry_date ?? ""}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                expiry_date: e.target.value,
                                            })
                                        }
                                        className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm outline-none focus:border-theme-accent text-theme-text dark:[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-theme-muted mb-1 block">
                                        Ambang Stok Menipis
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.min_stock}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                min_stock:
                                                    parseInt(e.target.value) ||
                                                    0,
                                            })
                                        }
                                        className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm outline-none focus:border-theme-accent text-theme-text"
                                        placeholder="5"
                                    />
                                </div>

                                {kiosList && kiosList.length > 0 && (
                                    <div>
                                        <label className="text-xs text-theme-muted mb-2 block">
                                            Stok per Kios
                                        </label>
                                        <div className="space-y-2">
                                            {kiosList.map((kios) => (
                                                <div
                                                    key={kios.id}
                                                    className="flex items-center gap-3 bg-theme-bg rounded-lg px-3 py-2"
                                                >
                                                    <span className="text-sm text-theme-text flex-1">
                                                        🏪 {kios.name}
                                                    </span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={
                                                            form.stocks?.[
                                                                kios.id
                                                            ] === 0 ||
                                                            form.stocks?.[
                                                                kios.id
                                                            ] === undefined
                                                                ? ""
                                                                : form.stocks[
                                                                      kios.id
                                                                  ]
                                                        }
                                                        onChange={(e) => {
                                                            const val =
                                                                e.target.value;
                                                            setForm({
                                                                ...form,
                                                                stocks: {
                                                                    ...form.stocks,
                                                                    [kios.id]:
                                                                        val ===
                                                                        ""
                                                                            ? 0
                                                                            : parseInt(
                                                                                  val,
                                                                              ) ||
                                                                              0,
                                                                },
                                                            });
                                                        }}
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        placeholder="0"
                                                        className="w-24 bg-theme-panel border border-theme-input-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-theme-accent text-theme-text text-center"
                                                    />
                                                    <span className="text-xs text-theme-muted">
                                                        {form.unit}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs text-theme-muted mb-1 block">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                description: e.target.value,
                                            })
                                        }
                                        className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm outline-none focus:border-theme-accent text-theme-text resize-none"
                                        rows={2}
                                        placeholder="Deskripsi produk (opsional)"
                                    />
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-theme-bg rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={form.is_active}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                is_active: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 rounded accent-theme-accent"
                                    />
                                    <label
                                        htmlFor="is_active"
                                        className="text-sm text-theme-text flex items-center gap-2"
                                    >
                                        <span
                                            className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                                                form.is_active
                                                    ? "bg-green-500 text-white"
                                                    : "bg-red-500 text-white"
                                            }`}
                                        >
                                            {form.is_active ? "✓" : "✕"}
                                        </span>
                                        {form.is_active
                                            ? "Produk Aktif — tampil di kasir"
                                            : "Produk Nonaktif — tidak tampil di kasir"}
                                    </label>
                                </div>
                            </div>

                            {Object.keys(formErrors).length > 0 && (
                                <div className="mx-6 mb-3 bg-red-900/20 border border-red-800/40 text-red-400 text-xs rounded-lg px-3 py-2 space-y-1">
                                    {Object.entries(formErrors).map(
                                        ([field, msg]) => (
                                            <p key={field}>⚠️ {msg}</p>
                                        ),
                                    )}
                                </div>
                            )}
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
                                    {editProduct
                                        ? "Simpan Perubahan"
                                        : "Tambah Produk"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modal Konfirmasi Hapus */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-theme-panel rounded-2xl w-full max-w-sm border border-theme-border p-6 text-center flex flex-col items-center animate-modal-pop">
                            <Trash2 className="w-12 h-12 text-red-500 mb-3" />
                            <h2 className="font-bold text-lg mb-1 text-theme-text">
                                Hapus Produk?
                            </h2>
                            <p className="text-theme-muted text-sm mb-5">
                                Produk{" "}
                                <strong className="text-theme-text">
                                    {showDeleteConfirm.name}
                                </strong>{" "}
                                akan dihapus permanen.
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
            </div>

            {/* Modal Kategori */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-theme-panel rounded-2xl w-full max-w-2xl border border-theme-border shadow-2xl animate-modal-pop">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border">
                            <h2 className="font-bold text-theme-text flex items-center gap-2">
                                <FolderOpen className="w-5 h-5 text-theme-accent" />
                                <span>Manajemen Kategori</span>
                            </h2>
                            <button
                                onClick={() => setShowCategoryModal(false)}
                                className="text-theme-muted hover:text-theme-text"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-2 gap-6">
                            {/* Form Tambah/Edit */}
                            <div>
                                <h3 className="text-sm text-theme-text font-semibold mb-3 flex items-center gap-2">
                                    {editCategory ? (
                                        <>
                                            <Edit2 className="w-4 h-4 text-theme-accent" />
                                            <span>Edit Kategori</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 text-theme-accent" />
                                            <span>Tambah Kategori</span>
                                        </>
                                    )}
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-theme-muted mb-1 block">
                                            Nama Kategori
                                        </label>
                                        <input
                                            value={categoryForm.name}
                                            onChange={(e) =>
                                                setCategoryForm({
                                                    ...categoryForm,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm outline-none focus:border-theme-accent text-theme-text"
                                            placeholder="Nama kategori"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-theme-muted mb-1 block">
                                            Deskripsi
                                        </label>

                                        <textarea
                                            value={categoryForm.description}
                                            onChange={(e) =>
                                                setCategoryForm({
                                                    ...categoryForm,
                                                    description: e.target.value,
                                                })
                                            }
                                            className="w-full bg-theme-input-bg border border-theme-input-border rounded-lg px-3 py-2 text-sm outline-none focus:border-theme-accent text-theme-text resize-none"
                                            rows={3}
                                            placeholder="Deskripsi kategori (opsional)"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        {editCategory && (
                                            <button
                                                onClick={() => {
                                                    setEditCategory(null);
                                                    setCategoryForm({
                                                        name: "",
                                                        description: "",
                                                    });
                                                }}
                                                className="flex-1 py-2 rounded-lg border border-theme-border text-theme-text text-sm hover:bg-theme-border transition"
                                            >
                                                Batal
                                            </button>
                                        )}
                                        <button
                                            onClick={handleCategorySubmit}
                                            className="flex-1 py-2 rounded-lg bg-theme-accent hover:bg-theme-accent-hover text-white text-sm font-semibold transition"
                                        >
                                            {editCategory ? "Simpan" : "Tambah"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* List Kategori */}
                            <div>
                                <h3 className="text-sm text-theme-text font-semibold mb-3">
                                    Daftar Kategori ({categories.length})
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-auto pr-1">
                                    {categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="flex items-center justify-between bg-theme-bg rounded-lg px-3 py-2 border border-theme-border shadow-sm"
                                        >
                                            <div>
                                                <p className="text-sm text-theme-text font-medium">
                                                    {cat.name}
                                                </p>
                                                {cat.description && (
                                                    <p className="text-xs text-theme-muted">
                                                        {cat.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() =>
                                                        openEditCategory(cat)
                                                    }
                                                    className="p-1.5 text-theme-text bg-theme-border hover:opacity-85 rounded transition"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5 text-theme-muted" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setShowDeleteCategory(
                                                            cat,
                                                        )
                                                    }
                                                    className="p-1.5 bg-red-900/10 hover:bg-red-900/20 text-red-500 rounded transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus Kategori */}
            {showDeleteCategory && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-theme-panel rounded-2xl w-full max-w-sm border border-theme-border p-6 text-center flex flex-col items-center animate-modal-pop">
                        <Trash2 className="w-12 h-12 text-red-500 mb-3" />
                        <h2 className="font-bold text-theme-text text-lg mb-1">
                            Hapus Kategori?
                        </h2>
                        <p className="text-theme-muted text-sm mb-5">
                            Kategori{" "}
                            <strong className="text-theme-text">
                                {showDeleteCategory.name}
                            </strong>{" "}
                            akan dihapus permanen.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setShowDeleteCategory(null)}
                                className="flex-1 py-2.5 rounded-xl border border-theme-border text-theme-text text-sm hover:bg-theme-border transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() =>
                                    handleDeleteCategory(showDeleteCategory)
                                }
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Bantuan Halaman Produk */}
            {showHelpModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-theme-panel rounded-2xl w-full max-w-lg border border-theme-border max-h-[85vh] flex flex-col animate-modal-pop">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-theme-border">
                            <div className="flex items-center gap-3">
                                <HelpCircle className="w-6 h-6 text-theme-accent" />
                                <h2 className="text-lg font-bold text-theme-text">
                                    Panduan Manajemen Produk
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
                                <Plus className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm text-theme-text">
                                        1. Menambah Produk Baru
                                    </p>
                                    <p className="text-theme-muted text-sm mt-1">
                                        Tekan tombol{" "}
                                        <strong>"+ Produk"</strong> di pojok
                                        kanan atas. Isi nama, harga, dan
                                        kategori produk, lalu tekan{" "}
                                        <strong>"Tambah"</strong>.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Edit2 className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm text-theme-text">
                                        2. Mengedit Produk
                                    </p>
                                    <p className="text-theme-muted text-sm mt-1">
                                        Tekan tombol{" "}
                                        <strong>"Edit"</strong> di kartu
                                        produk untuk mengubah nama, harga,
                                        atau kategorinya.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Package className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm text-theme-text">
                                        3. Mengatur Stok per Kios
                                    </p>
                                    <p className="text-theme-muted text-sm mt-1">
                                        Di form Tambah/Edit Produk, ada
                                        bagian <strong>"Stok per Kios"</strong>
                                        . Isi jumlah stok untuk masing-
                                        masing kios secara terpisah — jadi
                                        setiap kios punya stok sendiri-
                                        sendiri, tidak digabung.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm text-theme-text">
                                        4. Ambang Stok Menipis
                                    </p>
                                    <p className="text-theme-muted text-sm mt-1">
                                        Kolom <strong>"Ambang Stok
                                        Menipis"</strong> menentukan kapan
                                        produk dianggap "hampir habis" dan
                                        memunculkan peringatan kuning di
                                        halaman ini. Contoh: diisi 5 berarti
                                        peringatan muncul saat stok tersisa
                                        5 atau kurang.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Trash2 className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm text-theme-text">
                                        5. Menghapus Produk
                                    </p>
                                    <p className="text-theme-muted text-sm mt-1">
                                        Tekan{" "}
                                        <strong className="text-red-400">
                                            "Hapus"
                                        </strong>{" "}
                                        pada kartu produk.
                                        <br />
                                        <span className="text-theme-muted flex items-center gap-1 mt-1">
                                            <AlertTriangle className="w-3.5 h-3.5 text-theme-accent" /> Produk yang dihapus TIDAK
                                            BISA dikembalikan lagi. Kalau
                                            cuma mau produk sementara tidak
                                            dijual, sebaiknya jangan dihapus
                                            — cukup atur stoknya jadi 0.
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <FolderOpen className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm text-theme-text">
                                        6. Kelola Kategori
                                    </p>
                                    <p className="text-theme-muted text-sm mt-1">
                                        Tekan tombol{" "}
                                        <strong>"Kategori"</strong> untuk
                                        menambah, mengedit, atau menghapus
                                        kategori (misal: "Makanan Beku",
                                        "Minuman").
                                        <br />
                                        <span className="text-theme-muted flex items-center gap-1 mt-1">
                                            <AlertTriangle className="w-3.5 h-3.5 text-theme-accent" /> Menghapus kategori juga
                                            bersifat permanen. Pastikan
                                            tidak ada produk penting yang
                                            masih memakai kategori tersebut
                                            sebelum menghapusnya.
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Search className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm text-theme-text">
                                        7. Mencari & Menyaring Produk
                                    </p>
                                    <p className="text-theme-muted text-sm mt-1">
                                        Ketik nama produk di kolom pencarian,
                                        atau klik tombol kategori untuk
                                        menampilkan produk dari kategori
                                        tertentu saja.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <HelpCircle className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
                                <div>
                                   <p className="font-semibold text-sm text-theme-text">
                                        Masih Bingung?
                                    </p>
                                    <p className="text-theme-muted text-sm mt-1">
                                        Hubungi developer/admin teknis kalau
                                        ada kendala yang tidak bisa
                                        diatasi sendiri.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-theme-border">
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
