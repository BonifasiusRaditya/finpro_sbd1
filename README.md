# MBG (Makanan Bergizi Gratis)

## Teknologi yang Digunakan
- **Frontend/Backend**: Next.js (framework React)
- **Basis Data**: PostgreSQL (dihosting di Neon)
- **Bahasa Pemrograman**: TypeScript
- **Klien Database**: `pg` (node-postgres)

## Arsitektur Aplikasi
Sistem terdiri dari tiga jenis pengguna utama:

### 1. SISI SISWA
- **Login**: Siswa masuk ke akun pribadi mereka
- **Pembuatan QR Code**: Setiap siswa menerima QR code unik setiap hari
- **Klaim Makanan**: Siswa menunjukkan QR code ke pihak sekolah untuk dipindai
- **Batas Satu Kali per Hari**: Setiap siswa hanya bisa klaim satu kali per hari
- **Pembuatan Akun**: Akun siswa hanya bisa dibuat oleh pihak sekolah

### 2. SISI SEKOLAH
- **Pemindaian QR Code**: Sekolah memindai QR code siswa untuk mencatat klaim
- **Dashboard**:
  - Statistik jumlah makanan yang didistribusikan hari ini
  - Tampilan menu makanan hari ini
  - Pelacakan alokasi makanan harian
- **Pelacakan Makanan**: Mencatat dan memantau seluruh distribusi makanan
- **Manajemen Akun**: Sekolah dapat mengubah kata sandi setelah akun dibuat oleh pemerintah
- **Pembuatan Akun**: Akun sekolah dibuat oleh pemerintah daerah

### 3. SISI PEMERINTAH
- **Tampilan Provinsi**: Memantau semua sekolah dalam satu provinsi
- **Pelacakan Distribusi**: Memantau distribusi makanan dari pengiriman hingga konsumsi
- **Pengawasan Keuangan**: Menghitung total pengeluaran berdasarkan harga per porsi
- **Manajemen Menu**:
  - Memilih menu untuk masing-masing sekolah
  - Menentukan jumlah porsi untuk setiap sekolah
  - Mendukung pemilihan menu berbasis AI
- **Manajemen Sekolah**: Membuat dan mengelola akun sekolah
- **Analitik**: Menyediakan tampilan tingkat tinggi mengenai efektivitas program

## Skema Basis Data

### Tabel Inti:
1. **governments**: Informasi akun dan kontak pemerintah provinsi
2. **schools**: Informasi sekolah yang terhubung dengan provinsi masing-masing
3. **users**: Informasi siswa yang terhubung ke sekolahnya
4. **menus**: Menu makanan yang tersedia beserta harga
5. **school_menu_allocations**: Alokasi menu harian dan jumlah per sekolah
6. **reception_logs**: Catatan klaim makanan oleh siswa

### Hubungan Kunci:
- Pemerintah → Sekolah (1:banyak)
- Sekolah → Siswa (1:banyak)
- Sekolah → Menu (banyak:banyak melalui `school_menu_allocations`)
- Siswa → Log Penerimaan (1:banyak, maksimum 1 per hari)

## Aturan Bisnis
1. **Satu makanan per siswa per hari**: Ditegakkan melalui constraint `UNIQUE (user_id, date)`
2. **Pembuatan akun secara hierarkis**:
   - Pemerintah membuat akun sekolah
   - Sekolah membuat akun siswa
3. **Manajemen per provinsi**: Setiap pemerintah provinsi hanya mengelola sekolah di wilayahnya
4. **Alokasi menu harian**: Sekolah mendapatkan menu dan jumlah porsi tertentu setiap hari
5. **Rantai pelacakan**: Distribusi makanan dilacak dari alokasi pemerintah → penerimaan sekolah → konsumsi oleh siswa

## Fitur Utama yang Akan Dikembangkan
- [ ] Sistem pembuatan dan pemindaian QR code
- [ ] Dashboard waktu nyata untuk sekolah
- [ ] Analitik tingkat provinsi untuk pemerintah
- [ ] Pemilihan menu berbasis AI
- [ ] Manajemen alokasi harian
- [ ] Laporan keuangan dan perhitungan biaya
- [ ] Desain responsif untuk akses siswa melalui perangkat mobile
- [ ] Sistem autentikasi untuk ketiga jenis pengguna

## Status Pengembangan Saat Ini
- Konfigurasi database dengan Neon PostgreSQL
- Struktur repositori dasar untuk fitur pemerintah
- Endpoint API untuk autentikasi pemerintah
- Sedang menyelesaikan masalah **timeout koneksi database**

## Pengaturan Lingkungan
- **Database**: Neon PostgreSQL
- **Environment variable**: `DATABASE_URL` wajib diset
- **Konfigurasi SSL**: Gunakan `rejectUnauthorized: false` untuk koneksi Neon

## 📦Dokumentasi Instalasi Projek  

Untuk melakukan next web developing pada web ini, perlu adanya beberapa depedencies yang perlu diinstal menggunakan `npm install`

## 🚀 Cara Instalasi

```bash
npm install
```

## 📁 Dependencies yang Digunakan

Berikut adalah semua dependencies yang digunakan dalam proyek ini:

### 📦 Core Framework dan Library

* `next@15.3.2` - Framework React untuk membuat aplikasi web dengan SSR dan SSG.
* `react@19.1.0` - Library utama untuk membangun antarmuka pengguna.
* `react-dom@19.1.0` - Integrasi React dengan DOM.
* `react-router-dom@7.6.0` - Routing untuk aplikasi React.

### 🎨 UI dan Styling

* `tailwindcss@4.1.6` - Framework CSS utility-first.
* `@tailwindcss/postcss@4.1.6` - Plugin Tailwind untuk PostCSS.
* `clsx@2.1.1` - Untuk menggabungkan className secara kondisional.
* `class-variance-authority@0.7.1` - Utilitas untuk mengelola varian Tailwind secara efisien.
* `tw-animate-css@1.2.9` - Animasi berbasis Tailwind.

### 🧩 Komponen UI

* `@radix-ui/react-slot@1.2.2` - Komposisi UI berbasis slot dari Radix.
* `@radix-ui/react-tabs@1.1.11` - Komponen tab dari Radix UI.
* `lucide-react@0.509.0` - Ikon SVG yang dapat digunakan langsung dalam React.

### 📊 Visualisasi Data

* `recharts@2.15.3` - Grafik dan chart berbasis React.

### 🔍 QR Code

* `html5-qrcode@2.3.8` - Scanner QR berbasis HTML5.
* `qrcode.react@4.2.0` - Generator QR Code dalam React.

### 🔧 Tipe dan Tools TypeScript

* `typescript@5.8.3` - Bahasa TypeScript.
* `@types/node@20.17.46` - Tipe untuk Node.js.
* `@types/react@19.1.3` - Tipe untuk React.
* `@types/react-dom@19.1.3` - Tipe untuk React DOM.

### 🔍 Linting dan Eslint

* `eslint@9.26.0` - Linter untuk menjaga konsistensi kode.
* `eslint-config-next@15.3.2` - Konfigurasi ESLint khusus untuk proyek Next.js.
* `@eslint/eslintrc@3.3.1` - Konfigurasi tambahan ESLint.

### 🧪 Ekstra (tidak wajib / extraneous)

Dependencies ini muncul sebagai `extraneous`, artinya tidak terdaftar secara eksplisit di `package.json`. Jika kamu tidak butuh WebAssembly atau NAPI, bisa dihapus.

* `@emnapi/core@1.4.3`
* `@emnapi/runtime@1.4.3`
* `@emnapi/wasi-threads@1.0.2`
* `@napi-rs/wasm-runtime@0.2.9`
* `@tybys/wasm-util@0.9.0`

```bash
npm uninstall nama-paket
```

Untuk menambahkannya secara resmi, gunakan:

```bash
npm install nama-paket --save
```

---


