# Stockring

Sistem Manajemen Stok Barang berbasis web untuk mengelola barang mentah (gudang), produk jadi (etalase), transaksi masuk/keluar, serta tugas pengiriman dan penataan. Proyek ini adalah Capstone Project SCM Kelompok 6.

## Daftar Isi
1. [Tentang Aplikasi](#tentang-aplikasi)
2. [Teknologi & Versi](#teknologi--versi)
3. [Struktur Folder](#struktur-folder)
4. [Pembagian Tugas](#pembagian-tugas)
5. [Prasyarat](#prasyarat)
6. [Cara Menjalankan Proyek](#cara-menjalankan-proyek)
7. [Alur Kerja Git](#alur-kerja-git)
8. [Aturan Tim](#aturan-tim)
9. [Troubleshooting](#troubleshooting)
10. [Progres Pengerjaan](#progres-pengerjaan)
11. [Anggota Tim](#anggota-tim)

---

## Tentang Aplikasi

### Peran Pengguna
| Peran | Akses |
|---|---|
| Pemilik Usaha / Manajer | Akses penuh ke seluruh menu |
| Staf Pendataan | Input barang masuk (pembelian/restok), verifikasi fisik barang |
| Staf Penataan | Menata barang di etalase, menerima tugas penataan |
| Staf Pengiriman | Menerima dan memperbarui status tugas pengiriman |
| Staf Audit | Hanya melihat data (baca saja) |

### Fitur Utama (Use Case)
- **UC1 Login / Autentikasi:** menu yang tampil mengikuti peran pengguna.
- **UC2 Mengelola Gudang:** tambah gudang dan kelompokkan berdasarkan jenis.
- **UC3 Mengelola Stok / Pembelian:** restok barang lama, beli barang baru, edit detail stok, klasifikasi barang mentah / jadi.
- **UC4 Mengelola Produk & Penjualan:** tambah produk jadi, stok etalase berkurang otomatis saat barang keluar.
- **UC5 Mengelola Divisi:** buat divisi dan tetapkan tugas staf.
- **UC6 Memproses Pengiriman & Penataan:** staf memperbarui status tugas.

### Alur Singkat
- **Barang masuk:** form pembelian, sistem mengarahkan barang mentah ke Gudang dan barang jadi ke Etalase, lalu Staf Pendataan memverifikasi fisik barang.
- **Barang keluar:** penjualan tercatat, stok etalase terpotong otomatis, lalu staf pengiriman menerima tugas dan memperbarui status.

---

## Teknologi & Versi

| Bagian | Teknologi | Versi |
|---|---|---|
| Frontend | React (Vite) | Vite 8.3.4 · React 19.2.8 |
| Styling | Tailwind CSS | akan dipasang |
| Backend | Laravel (REST API) | 13.35.0 |
| Bahasa backend | PHP | 8.3.30 |
| Database | MySQL | 8.4.3 |
| Autentikasi | Laravel Sanctum | akan dipasang |
| Lingkungan lokal | Laragon (Windows) | 8.6.1 |
| Runtime frontend | Node.js / npm | Node v22.22.0 . npm 10.9.4 |
| Version control | Git & GitHub | Git 2.47.1 |

> Semua anggota **wajib memakai versi mayor yang sama** agar tidak ada perbedaan perilaku.

### Palet Warna
| Warna | Hex | Penggunaan |
|---|---|---|
| Krem | `#F9E6A8` | Latar header tabel, badge, highlight |
| Amber | `#F2A900` | Warna primer: tombol aksi utama, menu aktif |
| Oranye tua | `#CC6F00` | Warna sekunder: hover, link, status stok menipis |
| Cokelat tua | `#4D2A00` | Sidebar, teks utama |

---

## Struktur Folder

```
SCM-Stockring/
├── backend/     # Laravel (REST API + database)
├── frontend/    # React + Vite (antarmuka pengguna)
├── .gitignore
└── README.md
```

---

## Pembagian Tugas

| Tim | Anggota | Cakupan |
|---|---|---|
| **A: Akses & Operasional** | Backend: `AqillaZiidane` · Frontend: `SeftivanEA` | Login (Sanctum), role/middleware, Divisi & Staf, Tugas Pengiriman/Penataan, layout (Sidebar/Topbar), routing |
| **B: Stok** | Backend: `MaghnunAziz` · Frontend: `ShafiraMaudhia` | Gudang, Items (mentah/jadi), Transaksi + pemotongan stok, Dashboard, Daftar Barang, Form Barang, Riwayat Transaksi |
| **Setup & Koordinasi** | `SeftivanEA` | Struktur repo, README, pengelolaan branch `main` / `develop` |

---

## Prasyarat

Pasang di komputer masing-masing:
- Git
- Laragon (versi Full, sudah termasuk PHP, MySQL, Composer)
- Node.js
- Editor kode (disarankan VS Code)

Cek instalasi:
```bash
git --version
php -v
composer -V
node -v
npm -v
```

---

## Cara Menjalankan Proyek

### 1. Clone repository
```bash
cd C:\laragon\www
git clone https://github.com/SeftivanEA/SCM-Stockring.git
cd SCM-Stockring
git checkout develop
```

### 2. Siapkan database
1. Buka Laragon, klik **Start All**.
2. Klik **Database** (HeidiSQL), lalu buat database kosong bernama `stockring`.

### 3. Jalankan backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```
Buka `backend/.env`, lalu pastikan bagian ini sesuai:
```
APP_NAME=Stockring

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stockring
DB_USERNAME=root
DB_PASSWORD=
```
Lanjutkan:
```bash
php artisan migrate
php artisan serve
```
Backend berjalan di **http://localhost:8000**.

### 4. Jalankan frontend (React)
Buka terminal baru:
```bash
cd frontend
npm install
```
Buat file `frontend/.env` berisi:
```
VITE_API_URL=http://localhost:8000/api
```
Lalu:
```bash
npm run dev
```
Frontend berjalan di **http://localhost:5173**.

> Backend dan frontend harus berjalan **bersamaan** di dua terminal berbeda.

---

## Alur Kerja Git

### Branch
- `main`: kode stabil, hanya diisi lewat Pull Request dari `develop`.
- `develop`: tempat semua fitur digabung.
- Branch fitur: dibuat dari `develop`.

### Penamaan branch fitur
```
feature/be-items-api          # backend
feature/fe-items-list         # frontend
fix/fe-login-validation       # perbaikan
```

### Langkah mengerjakan fitur
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nama-fitur

# ... kerjakan fitur ...

git add .
git commit -m "feat: deskripsi singkat"
git push -u origin feature/nama-fitur
```
Lalu di GitHub, buat **Pull Request** dari branch fitur ke `develop` dan minta satu anggota lain untuk me-review.

### Format pesan commit
| Awalan | Arti | Contoh |
|---|---|---|
| `feat:` | fitur baru | `feat: tambah endpoint items` |
| `fix:` | perbaikan bug | `fix: validasi stok negatif` |
| `chore:` | pekerjaan non-fitur | `chore: update dependensi` |
| `docs:` | dokumentasi | `docs: perbarui README` |

---

## Aturan Tim

1. **Jangan push langsung** ke `main` atau `develop`. Selalu lewat Pull Request.
2. **Jangan pernah commit file `.env`** atau data rahasia. Repo ini bersifat publik.
3. Sebelum mulai bekerja, selalu `git pull origin develop`.
4. Satu branch untuk satu fitur. Jangan mencampur beberapa fitur dalam satu branch.
5. Jangan mengubah file milik tim lain tanpa memberi tahu di grup.
6. Kesepakatan format API (endpoint dan JSON) harus disepakati backend dan frontend **sebelum** mengerjakan fitur.
7. Setiap database lokal bersifat pribadi. Data awal dibagikan lewat *migration* dan *seeder*, bukan file database.

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| `php` / `composer` tidak dikenali | Buka terminal dari Laragon (klik kanan Laragon, Terminal) |
| `php artisan migrate` gagal terhubung | Pastikan MySQL di Laragon menyala dan database `stockring` sudah dibuat |
| Error `No application encryption key` | Jalankan `php artisan key:generate` di folder `backend` |
| `npm run dev` gagal | Jalankan `npm install` dulu di folder `frontend` |
| Port 8000 / 5173 sudah dipakai | Tutup server lama (Ctrl + C) atau program lain yang memakai port tersebut |
| Setelah `git pull` aplikasi error | Jalankan `composer install` (backend) dan `npm install` (frontend), lalu `php artisan migrate` |

---

## Progres Pengerjaan

- [x] Setup repository dan struktur proyek
- [x] Koneksi Laravel ke MySQL
- [ ] Migration & model (User, Divisi, Gudang, Item, Transaksi)
- [ ] Login & role (Sanctum)
- [ ] CRUD Gudang
- [ ] CRUD Items (barang mentah / produk jadi)
- [ ] Transaksi & pemotongan stok
- [ ] Tugas pengiriman & penataan
- [ ] Divisi & staf
- [ ] Dashboard
- [ ] Pengujian & perbaikan

---

## Anggota Tim

| Nama | Peran | GitHub |
|---|---|---|
| `Seftivan Ekacandra Adityawardana` | Setup & Koordinasi | `@username` |
| `Mochammad Maghnun Aziz` | Backend | `@username` |
| `Aqilla Ziidane Akbar` | Backend | `@username` |
| `Shafira Maudhia Ayunda Suci` | Frontend | `@username` |
| `Seftivan Ekacandra Adityawardana` | Frontend | `@username` |