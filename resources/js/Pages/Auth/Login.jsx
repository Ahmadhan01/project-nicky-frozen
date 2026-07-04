import { Head, useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff, ArrowRight, History, Sun, Moon } from "lucide-react";

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLight, setIsLight] = useState(false);

    useEffect(() => {
        setIsLight(document.documentElement.classList.contains("light"));
    }, []);

    const toggleTheme = () => {
        if (document.documentElement.classList.contains("light")) {
            document.documentElement.classList.remove("light");
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsLight(false);
        } else {
            document.documentElement.classList.remove("dark");
            document.documentElement.classList.add("light");
            localStorage.setItem("theme", "light");
            setIsLight(true);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <>
            <Head title="Login - Nicky Frozen" />
            <div className="min-h-screen bg-theme-bg flex text-theme-text font-sans relative">
                {/* Floating Theme Toggle */}
                <div className="absolute top-6 right-6 z-50">
                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-xl bg-theme-panel border border-theme-border flex items-center justify-center text-theme-muted hover:text-theme-text transition active:scale-95 shadow-md"
                        title={isLight ? "Mode Gelap" : "Mode Terang"}
                    >
                        {isLight ? (
                            <Moon className="w-5 h-5" />
                        ) : (
                            <Sun className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Left Side: Brand Showcase (Hidden on Mobile) */}
                <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex-col justify-between p-16 relative overflow-hidden border-r border-theme-border/20">
                    {/* Glowing Auras */}
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/15 blur-[120px] pointer-events-none" />

                    {/* Logo Header */}
                    <div className="flex items-center gap-3.5 z-10">
                        <div className="bg-white/5 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 shadow-inner flex items-center justify-center">
                            <img
                                src="/niki_fullwhite_v2.png"
                                alt="Nicky Frozen"
                                className="h-10 w-10 object-contain"
                            />
                        </div>
                        <div>
                            <p className="font-extrabold text-lg tracking-wider text-white uppercase leading-none">
                                Nicky Frozen
                            </p>
                            <p className="text-cyan-400 text-xs font-semibold tracking-widest mt-1">
                                SYSTEMS
                            </p>
                        </div>
                    </div>

                    {/* Interactive Highlights */}
                    <div className="space-y-8 z-10 my-auto">
                        <div className="space-y-4">
                            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-cyan-300 tracking-wide inline-block shadow-sm">
                                POS & Inventory System
                            </span>
                            <h1 className="text-white text-4xl xl:text-5xl font-black leading-tight tracking-tight">
                                Kelola Transaksi Toko <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                                    Lebih Cepat & Aman.
                                </span>
                            </h1>
                            <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                                Dilengkapi dengan fitur kasir offline, sinkronisasi otomatis, manajemen stok terpadu, dan pelaporan keuangan real-time.
                            </p>
                        </div>


                    </div>

                    {/* Footer branding */}
                    <div className="text-xs text-slate-500 z-10">
                        &copy; {new Date().getFullYear()} Nicky Frozen. All rights reserved.
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full lg:w-[45%] flex items-center justify-center p-8 sm:p-12 md:p-16 bg-theme-bg">
                    <div className="w-full max-w-md space-y-8 animate-slide-up">
                        {/* Header for Mobile */}
                        <div className="flex flex-col items-center text-center lg:hidden mb-6">
                            <div className="bg-theme-panel p-3 rounded-2xl border border-theme-border/60 shadow-md mb-3 flex items-center justify-center">
                                <img
                                    src={isLight ? "/niki_fullblack_v2.png" : "/niki_fullwhite_v2.png"}
                                    alt="Nicky Frozen"
                                    className="h-12 w-12 object-contain"
                                />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-theme-text">
                                Nicky Frozen
                            </h2>
                            <p className="text-xs text-theme-muted mt-1 uppercase tracking-widest font-bold">
                                POS SYSTEMS
                            </p>
                        </div>

                        {/* Title Section */}
                        <div className="space-y-2 text-center lg:text-left">
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-theme-text">
                                Welcome Back
                            </h2>
                            <p className="text-sm text-theme-muted">
                                Masukkan detail akun untuk mengakses dashboard kasir.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-5">
                            {/* Email / Username */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-theme-muted uppercase tracking-wider block">
                                    Email Address
                                </label>
                                <div className="flex items-center bg-theme-panel rounded-xl px-4 py-3.5 gap-3 border border-theme-border focus-within:border-theme-accent transition">
                                    <User className="w-5 h-5 text-theme-muted shrink-0" />
                                    <input
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className="bg-transparent text-theme-text placeholder-theme-muted outline-none w-full text-sm font-medium"
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-xs font-medium mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-theme-muted uppercase tracking-wider block">
                                    Password
                                </label>
                                <div className="flex items-center bg-theme-panel rounded-xl px-4 py-3.5 gap-3 border border-theme-border focus-within:border-theme-accent transition">
                                    <Lock className="w-5 h-5 text-theme-muted shrink-0" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        className="bg-transparent text-theme-text placeholder-theme-muted outline-none w-full text-sm font-medium"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-theme-muted hover:text-theme-text shrink-0 transition"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-xs font-medium mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember me (Optional but integrated nicely) */}
                            <div className="flex items-center justify-between text-xs font-medium">
                                <label className="flex items-center gap-2 cursor-pointer text-theme-muted hover:text-theme-text transition">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData("remember", e.target.checked)
                                        }
                                        className="rounded border-theme-border bg-theme-panel text-theme-accent focus:ring-theme-accent w-4 h-4"
                                    />
                                    <span>Ingat Sesi Saya</span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-theme-accent hover:bg-theme-accent-hover active:scale-[0.98] hover:-translate-y-0.5 active:translate-y-0 text-white font-bold py-3.5 rounded-xl transition-all duration-200 mt-2 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-theme-accent/20 cursor-pointer"
                            >
                                {processing ? "Memproses..." : "Masuk ke Akun"}
                                <ArrowRight className="w-4 h-4 text-white" />
                            </button>
                        </form>

                        {/* Catatan Bantuan */}
                        <div className="mt-8 pt-6 border-t border-theme-border text-center">
                            <p className="text-theme-muted text-xs leading-relaxed max-w-sm mx-auto">
                                Gunakan kredensial resmi yang telah didaftarkan.
                                <br />
                                Mengalami kendala login? Hubungi administrator atau pengelola cabang.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
