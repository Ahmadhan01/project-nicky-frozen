<p align="center">
  <img src="public/LOGO.png" alt="Nicky Frozen Logo" width="180">
</p>

<h1 align="center">Nicky Frozen — Aplikasi Kasir & Manajemen Toko</h1>

<p align="center">
  Aplikasi Point of Sale (POS) berbasis web untuk toko frozen food, dibangun dengan Laravel + Inertia.js + React.
</p>

---

## 📋 Tentang Project

**Nicky Frozen** adalah aplikasi kasir (POS) sekaligus sistem manajemen toko untuk bisnis frozen food. Aplikasi ini mendukung banyak peran pengguna (kasir, admin, owner) dengan fitur transaksi, manajemen produk & stok, rekap penjualan, hingga audit log — serta mendukung mode **offline** untuk kasir melalui service worker.

## ✨ Fitur Utama

### 🧾 Modul Kasir
- Dashboard kasir & mulai sesi kerja (session start)
- Transaksi penjualan (create, sync, cancel)
- Cetak/lihat struk (receipt)
- Riwayat transaksi
- Dukungan **transaksi offline** dengan sinkronisasi otomatis saat online kembali (PWA/Service Worker)

### 🛠️ Modul Admin
- Dashboard admin
- Manajemen produk & kategori (CRUD)
- Manajemen stok produk, termasuk stok minimum & tanggal kadaluarsa (expiry date)
- Riwayat transaksi & pembatalan transaksi
- Rekap penjualan (recap)
- Audit log aktivitas sistem

### 👑 Modul Master (khusus Owner)
- Manajemen pengguna/karyawan (CRUD user, role kasir/admin/owner)

### 🔐 Autentikasi & Otorisasi
- Login, register, reset password, verifikasi email (Laravel Breeze)
- Role-based access control: `owner`, `admin`, `kasir`

## 🧱 Tech Stack

| Layer      | Teknologi |
|------------|-----------|
| Backend    | Laravel 13 (PHP 8.3) |
| Frontend   | React 18 + Inertia.js 2 |
| Styling    | Tailwind CSS |
| Build Tool | Vite |
| Database   | MySQL / SQLite (via Eloquent ORM) |
| Auth       | Laravel Breeze + Laravel Sanctum |
| Charts     | Recharts |
| Offline    | Service Worker (PWA-style caching untuk halaman kasir) |
| Deployment | Railway (Nixpacks) |

## 📂 Struktur Project (Ringkas)

app/
├─ Http/Controllers/
│   ├─ Admin/        # Dashboard, Product, Recap, Audit, User (Master)
│   ├─ Kasir/         # Dashboard, Transaction, Receipt
│   └─ Auth/          # Login, Register, Reset Password, dll.
├─ Models/            # Product, Category, Transaction, User, Kios, Shift, dll.
database/
├─ migrations/
└─ seeders/
resources/
├─ js/Pages/
│   ├─ Admin/         # Dashboard, Products, Master, Recap, Audit, History
│   └─ Kasir/         # Dashboard, History, Receipt
└─ css/
routes/
├─ web.php
└─ auth.php
public/
└─ sw.js              # Service worker untuk mode offline kasir

## 🚀 Instalasi & Menjalankan Secara Lokal

### Prasyarat
- PHP >= 8.3
- Composer
- Node.js >= 18 (disarankan 22) & NPM
- Database (MySQL/MariaDB atau SQLite)

### Langkah-langkah

1. **Clone repository**
```bash
   git clone https://github.com/Ahmadhan01/project-nicky-frozen.git
   cd project-nicky-frozen
```

2. **Install dependency PHP**
```bash
   composer install
```

3. **Install dependency JavaScript**
```bash
   npm install
```

4. **Salin file environment**
```bash
   cp .env.example .env
```

5. **Generate application key**
```bash
   php artisan key:generate
```

6. **Konfigurasi database**
   Sesuaikan variabel berikut di file `.env`:
```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=nicky_frozen
   DB_USERNAME=root
   DB_PASSWORD=
```

7. **Jalankan migrasi & seeder**
```bash
   php artisan migrate --seed
```

8. **Jalankan aplikasi (mode development)**
```bash
   composer run dev
```
   Perintah di atas otomatis menjalankan `php artisan serve`, queue listener, log viewer (`pail`), dan `vite dev server` secara bersamaan.

   Atau jalankan manual di dua terminal terpisah:
```bash
   php artisan serve
   npm run dev
```

9. Buka aplikasi di `http://localhost:8000`

## 🧪 Testing

```bash
composer test
# atau
php artisan test
```

## 🏗️ Build untuk Production

```bash
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## ☁️ Deployment

Project ini sudah dikonfigurasi untuk deploy ke **Railway** menggunakan **Nixpacks** (lihat `railway.json` & `nixpacks.toml`). Perintah start otomatis menjalankan migrasi, seeding, lalu menyalakan server:

```bash
php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=$PORT
```

## 👥 Role Pengguna

| Role    | Akses |
|---------|-------|
| Kasir   | Dashboard kasir, transaksi, riwayat, struk |
| Admin   | Semua akses Kasir + manajemen produk, kategori, stok, rekap, audit |
| Owner   | Semua akses Admin + manajemen pengguna (Master) |

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b fitur/nama-fitur`)
3. Commit perubahan (`git commit -m "Menambahkan fitur ..."`)
4. Push ke branch (`git push origin fitur/nama-fitur`)
5. Buat Pull Request

## 📄 Lisensi

Project ini dibangun di atas [Laravel Framework](https://laravel.com), yang berlisensi [MIT](https://opensource.org/licenses/MIT).