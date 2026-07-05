import { router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    ShoppingCart,
    History,
    HelpCircle,
    LogOut,
    ChevronDown,
    Sun,
    Moon,
    Lock,
    Menu,
    X,
} from "lucide-react";

export default function KasirNavbar({ activeTab, isOnline, onHelpClick }) {
    const { auth } = usePage().props;
    const [time, setTime] = useState(new Date());
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isLight, setIsLight] = useState(false);
    const [showOfflineWarning, setShowOfflineWarning] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsLight(document.documentElement.classList.contains("light"));
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
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

    const logout = () => router.post(route("logout"));

    return (
        <nav className="bg-theme-panel border-b border-theme-border relative">
            <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center justify-between">
                {/* Brand Logo */}
                <div className="flex items-center gap-2">
                    <img
                        src={
                            isLight
                                ? "/niki_fullblack_v2.png"
                                : "/niki_fullwhite_v2.png"
                        }
                        alt="Nicky Frozen"
                        className="h-8 w-8 object-contain"
                    />
                    <div>
                        <p className="font-bold text-sm leading-none text-theme-text">
                            Nicky Frozen
                        </p>
                        <p className="text-theme-muted text-xs mt-1">
                            SISTEM KASIR
                        </p>
                    </div>
                </div>

                {/* Navigation tabs - DESKTOP VIEW (hidden di mobile, flex di lg) */}
                <div className="hidden lg:flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (!isOnline) {
                                localStorage.setItem(
                                    "nicky_offline_nav",
                                    "true",
                                );
                            }
                            router.visit(route("kasir.dashboard"));
                        }}
                        className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 active:scale-95 hover:bg-theme-border/20 ${
                            activeTab === "kasir"
                                ? "bg-theme-border text-theme-accent font-semibold"
                                : "text-theme-muted hover:text-theme-text"
                        }`}
                    >
                        <ShoppingCart className="w-4 h-4 text-theme-muted" />
                        Kasir
                    </button>
                    <button
                        onClick={() => {
                            if (!isOnline) {
                                setShowOfflineWarning(true);
                                setTimeout(
                                    () => setShowOfflineWarning(false),
                                    4000,
                                );
                                return;
                            }
                            router.visit(route("kasir.history"));
                        }}
                        className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 active:scale-95 ${
                            !isOnline
                                ? "text-theme-muted/40 cursor-not-allowed"
                                : "hover:bg-theme-border/20 " +
                                  (activeTab === "history"
                                      ? "bg-theme-border text-theme-accent font-semibold"
                                      : "text-theme-muted hover:text-theme-text")
                        }`}
                    >
                        {!isOnline ? (
                            <Lock className="w-4 h-4 text-theme-muted/40" />
                        ) : (
                            <History className="w-4 h-4 text-theme-muted" />
                        )}
                        Riwayat
                    </button>
                </div>

                {/* Right info & Profile - DESKTOP VIEW (hidden di mobile, flex di lg) */}
                <div className="hidden lg:flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-border/50 active:scale-95 transition-all duration-200"
                        title={isLight ? "Mode Gelap" : "Mode Terang"}
                    >
                        {isLight ? (
                            <Moon className="w-4 h-4 text-theme-muted" />
                        ) : (
                            <Sun className="w-4 h-4 text-theme-muted" />
                        )}
                    </button>
                    <span
                        className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                            isOnline
                                ? "bg-green-900/80 text-green-400"
                                : "bg-red-900/80 text-red-400"
                        }`}
                    >
                        ● {isOnline ? "Online" : "Offline"}
                    </span>
                    <span className="text-sm text-theme-muted font-medium">
                        {time.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu((prev) => !prev)}
                            className="flex items-center gap-2 hover:opacity-80 transition-all duration-150 active:scale-95 text-theme-text"
                        >
                            <div className="w-7 h-7 bg-theme-accent text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm flex items-center gap-1 font-medium">
                                {auth.user.name}
                                <ChevronDown className="w-3 h-3 text-theme-muted" />
                            </span>
                        </button>

                        {showUserMenu && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-40 animate-fade-in bg-black/10"
                                    onClick={() => setShowUserMenu(false)}
                                />

                                {/* Dropdown */}
                                <div className="absolute right-0 mt-2 w-48 bg-theme-panel border border-theme-border rounded-xl shadow-xl z-50 overflow-hidden animate-modal-pop origin-top-right">
                                    <div className="px-4 py-3 border-b border-theme-border">
                                        <p className="text-sm font-semibold text-theme-text">
                                            {auth.user.name}
                                        </p>
                                        <p className="text-xs text-theme-muted">
                                            {auth.user.email}
                                        </p>
                                        <span className="text-xs bg-theme-accent/20 text-theme-accent px-2 py-0.5 rounded-full mt-1 inline-block capitalize font-medium">
                                            {auth.user.role}
                                        </span>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-900/30 transition flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4 text-red-400" />
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Hamburger Toggle Button - MOBILE VIEW ONLY (block di mobile, hidden di lg) */}
                <div className="flex items-center lg:hidden gap-2">
                    {/* Theme toggle ditaruh luar agar mudah diakses di mobile */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-border/50"
                    >
                        {isLight ? (
                            <Moon className="w-5 h-5" />
                        ) : (
                            <Sun className="w-5 h-5" />
                        )}
                    </button>

                    <button
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        className="p-2 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-border/50 transition-colors"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Content Menu (Hanya tampil saat hamburger aktif di mobile) */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-theme-border bg-theme-panel px-6 py-4 space-y-4 animate-fade-in">
                    {/* Status & Jam */}
                    <div className="flex items-center justify-between border-b border-theme-border pb-3">
                        <span
                            className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${
                                isOnline
                                    ? "bg-green-900/80 text-green-400"
                                    : "bg-red-900/80 text-red-400"
                            }`}
                        >
                            ● {isOnline ? "Online" : "Offline"}
                        </span>
                        <span className="text-sm text-theme-muted font-medium">
                            Jam:{" "}
                            {time.toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>

                    {/* Navigasi Utama */}
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                if (!isOnline)
                                    localStorage.setItem(
                                        "nicky_offline_nav",
                                        "true",
                                    );
                                router.visit(route("kasir.dashboard"));
                            }}
                            className={`w-full px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-all ${
                                activeTab === "kasir"
                                    ? "bg-theme-border text-theme-accent font-semibold"
                                    : "text-theme-muted hover:bg-theme-border/10 text-theme-text"
                            }`}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Kasir
                        </button>

                        <button
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                if (!isOnline) {
                                    setShowOfflineWarning(true);
                                    setTimeout(
                                        () => setShowOfflineWarning(false),
                                        4000,
                                    );
                                    return;
                                }
                                router.visit(route("kasir.history"));
                            }}
                            className={`w-full px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-all ${
                                !isOnline
                                    ? "text-theme-muted/30 cursor-not-allowed"
                                    : activeTab === "history"
                                      ? "bg-theme-border text-theme-accent font-semibold"
                                      : "text-theme-muted hover:bg-theme-border/10 text-theme-text"
                            }`}
                        >
                            {!isOnline ? (
                                <Lock className="w-5 h-5 text-theme-muted/30" />
                            ) : (
                                <History className="w-5 h-5" />
                            )}
                            Riwayat
                        </button>
                    </div>

                    {/* Informasi Pengguna & Logout */}
                    <div className="pt-4 border-t border-theme-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-theme-accent text-white rounded-full flex items-center justify-center font-bold">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-theme-text leading-none">
                                    {auth.user.name}
                                </p>
                                <span className="text-[10px] bg-theme-accent/20 text-theme-accent px-1.5 py-0.5 rounded-full mt-1 inline-block capitalize">
                                    {auth.user.role}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="p-2.5 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded-xl transition flex items-center gap-2 text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            Keluar
                        </button>
                    </div>
                </div>
            )}

            {showOfflineWarning && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-yellow-900/90 border border-yellow-700 text-yellow-300 text-sm px-4 py-2.5 rounded-xl shadow-lg z-[999] flex items-center gap-2 animate-fade-in">
                    <Lock className="w-4 h-4 text-yellow-400 shrink-0" />
                    Riwayat butuh koneksi internet. Sambungkan dulu, ya.
                </div>
            )}
        </nav>
    );
}
