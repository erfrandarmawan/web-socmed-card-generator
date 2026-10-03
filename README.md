# Generator Kartu Gol

Product Requirements Document : https://docs.google.com/document/d/1PkJPH7MAmw43BxmvkpTbcsGpiMKLNe9P2dkrVEJb2nw/edit?usp=sharing

Aplikasi web untuk **membuat kartu pengumuman gol** siap unggah ke media sosial. Pengguna memilih pemain dan menit pertandingan, lalu mengunduh gambar dalam dua format: **vertikal (9:16)** untuk Story/Reels/TikTok dan **persegi (1:1)** untuk feed.

Seluruh proses pengolahan gambar dijalankan **di sisi klien (browser)**, sehingga server tidak dibebani komputasi render.

Dibangun dengan **Nuxt 4** (mode SPA), **Tailwind CSS 4**, **TypeScript**, dan **Canvas API**.

**Virtual Machine (VM) Biznet Gio (https://biznetgio.com/)** :
- **AFNLDEVELOBE** (kode voucher 15% produk Neo Lite, khusus pembelian baru saja)
- **AFNLPDEVELOBE** (kode voucher 10% produk Neo Lite Pro, khusus pembelian baru saja)

---

## ✨ Fitur Utama

- **Generator kartu gol** — menampilkan menit pertandingan dan nama pemain pada gambar bergaya poster.
- **Dropdown pemain dengan filter pencarian** — cari berdasarkan nama pemain; data berasal dari berkas JSON.
- **Opsi injury time** — untuk menit **45, 90, 105, dan 120** tersedia input tambahan (contoh: `45′ +2`, `90′ +1`, `105′ +3`, `120′ +1`).
- **Dua format sekaligus** — pratinjau vertikal (9:16, 1080×1920) dan persegi (1:1, 1080×1080).
- **Unduh PNG & WebP** — hasil render dapat diunduh pada kedua format dengan tombol terpisah.
- **Loading bar** — indikator proses saat kartu sedang dirender.
- **Sepenuhnya di browser** — tidak ada data yang dikirim ke server (ramah privasi).
- **Siap deploy sebagai SPA** — dibangun menjadi berkas statis dan disajikan lewat Docker + nginx.

---

## 🧱 Teknologi

| Kategori | Teknologi |
| --- | --- |
| Framework | Nuxt 4 (SPA / `ssr: false`) |
| Bahasa | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Rendering gambar | HTML Canvas 2D API |
| Data pemain | JSON statis (`app/data/players.json`) |
| Deployment | Docker (multi-stage) + nginx |

---

## ✅ Persyaratan

Pastikan sudah terpasang:

- Node.js **20.19+** atau **22.12+** (disarankan 22 LTS)
- npm **10+**
- Docker (opsional, untuk menjalankan via kontainer)

---

## 🚀 Langkah Menjalankan Proyek

### 1. Clone repositori

```bash
git clone https://github.com/erfrandarmawan/web-socmed-card-generator.git
cd web-socmed-card-generator
```

### 2. Install dependensi

```bash
npm install
```

### 3. Jalankan mode pengembangan

```bash
npm run dev
```

Buka **http://localhost:3000** di browser.

### 4. Build untuk produksi (SPA statis)

```bash
npm run generate
```

Hasil build berada di `.output/public` dan dapat disajikan oleh hosting statis apa pun. Untuk mencoba hasil build secara lokal:

```bash
npm run preview
```

### 5. Menjalankan dengan Docker

Build image lalu jalankan kontainer (aplikasi tersedia di **http://localhost:8080**):

```bash
docker build -t web-socmed-card-generator .
docker run --rm -p 8080:80 web-socmed-card-generator
```

Atau gunakan Docker Compose:

```bash
docker compose up --build
```

> Dockerfile menggunakan pendekatan multi-stage: tahap pertama membangun SPA dengan Node.js, tahap kedua menyajikan berkas statis memakai nginx (dengan fallback SPA dan caching aset).

---

## 🧪 Menjalankan Pemeriksaan Tipe

```bash
npm run typecheck
```

---

## 🗂️ Struktur Proyek

```
app/
├── app.vue                       # Kerangka aplikasi + footer
├── assets/css/main.css           # Tema Tailwind (warna merah Indonesia #B91F30)
├── components/
│   ├── CardResult.vue            # Pratinjau + tombol unduh PNG/WebP
│   └── PlayerCombobox.vue        # Dropdown pemain dengan pencarian
├── data/
│   └── players.json              # Basis data pemain (format JSON)
├── pages/
│   └── index.vue                 # Halaman generator
├── types/
│   └── index.ts                  # Tipe data Player
└── utils/
    ├── cardRenderer.ts           # Logika render Canvas + ekspor gambar
    └── identity.ts               # Inisial & warna avatar

public/favicon.svg
nuxt.config.ts                    # Konfigurasi Nuxt (SPA, tema, font)
Dockerfile                        # Build multi-stage (Node -> nginx)
nginx.conf                        # Konfigurasi server SPA
docker-compose.yml
```

---

## 🎨 Mengubah Data Pemain (JSON)

Data pemain disimpan di `app/data/players.json` dengan struktur berikut:

```json
{
  "id": "494432",
  "name": "Ole ROMENY",
  "team": "Indonesia",
  "country": "Indonesia",
  "position": "Pemain Depan",
  "number": 10
}
```

Data contoh diambil dari **FIFA Player Data** (Timnas Indonesia - https://www.fifa.com/id/tournaments/mens/asean-cup/2026/teams/indonesia/squad). Struktur asli FIFA yang bersarang (array `Players`, `PlayerName`, `PositionLocalized`, dan `JerseyNum`) disederhanakan menjadi struktur di atas agar mudah dirender. Untuk memperbarui data:

1. Ambil data terbaru dari sumber FIFA.
2. Konversi setiap pemain ke bentuk di atas (`name` dari `PlayerName[].Description`, `position` dari `PositionLocalized[].Description`, `number` dari `JerseyNum`, `id` dari `IdPlayer`).
3. Ganti isi `app/data/players.json`.

---

## 🛠️ Command List

```bash
npm run dev         # Jalankan server pengembangan
npm run build       # Build Nuxt (server + client)
npm run generate    # Build SPA statis ke .output/public
npm run preview     # Pratinjau hasil build
npm run typecheck   # Periksa tipe TypeScript
docker compose up --build   # Jalankan lewat Docker
```

---

## 💖 Dukungan & Kontak

Kamu dapat mendukung saya di https://saweria.co/erfrandarmawan

Collab via erfrandarmawan@develobe.id

Social Media Channel :
- https://www.youtube.com/@develobe_id
- https://tiktok.com/@erfrandarmawan
- https://instagram.com/erfrandarmawan

---

## 📄 Lisensi

Proyek ini menggunakan lisensi [MIT](https://opensource.org/licenses/MIT).
