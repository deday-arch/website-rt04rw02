═══════════════════════════════════════════════════════════
  SISTEM ADMIN - WEBSITE RT 04 / RW 02
  Jombang, Ciputat, Tangerang Selatan
═══════════════════════════════════════════════════════════

╔══════════════════════════════════════════════════════════╗
║  AKUN LOGIN ADMINISTRATOR                                ║
╠══════════════════════════════════════════════════════════╣
║  Username: admin         Password: rt04rw02@2026         ║
║  Username: ketua.rt      Password: Jombang@2026          ║
║  Username: sekretaris    Password: Ciputat@2026          ║
╚══════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════
  CARA AKSES PANEL ADMIN
═══════════════════════════════════════════════════════════

1. Buka browser (Chrome / Firefox / Edge)
2. Buka: http://localhost/rt-website/admin-login.html
   ATAU klik link "Admin" di footer website
3. Login dengan username & password di atas
4. Anda akan masuk ke Dashboard Admin

═══════════════════════════════════════════════════════════
  FITUR ADMIN (CRUD LENGKAP)
═══════════════════════════════════════════════════════════

✓ KELOLA PENGUMUMAN
  - Tambah pengumuman baru
  - Edit pengumuman yang ada
  - Hapus pengumuman
  - Filter & cari pengumuman

✓ KELOLA IURAN WARGA
  - Tambah data iuran warga
  - Update status pembayaran (Lunas / Belum Bayar)
  - Edit nominal iuran
  - Hapus data iuran
  - Filter & cari berdasarkan nama/no rumah

✓ KELOLA UMKM
  - Daftarkan UMKM baru
  - Edit informasi UMKM
  - Hapus UMKM
  - Filter berdasarkan kategori

✓ KELOLA KEGIATAN
  - Tambah kegiatan/acara baru
  - Edit detail kegiatan
  - Update status kegiatan
  - Hapus kegiatan

✓ KELOLA JADWAL RONDA
  - Buat jadwal ronda baru
  - Edit jadwal & petugas
  - Hapus jadwal

✓ KELOLA LAPORAN KEJADIAN
  - Lihat semua laporan warga
  - Update status laporan (Masuk / Diproses / Selesai)
  - Hapus laporan

═══════════════════════════════════════════════════════════
  PENYIMPANAN DATA
═══════════════════════════════════════════════════════════

✓ Semua data disimpan di LocalStorage browser
✓ Data tersimpan per komputer/browser
✓ Data TIDAK hilang saat logout atau tutup browser
✓ Data AKAN hilang jika:
  - Clear browser data/history
  - Ganti browser lain
  - Ganti komputer

⚠ UNTUK PRODUKSI: Ganti dengan database server seperti:
  - MySQL / PostgreSQL
  - Firebase
  - MongoDB
  - Backend API (PHP / Node.js / Python)

═══════════════════════════════════════════════════════════
  KEAMANAN
═══════════════════════════════════════════════════════════

✓ Login menggunakan username & password
✓ Session tersimpan di SessionStorage
✓ Auto-redirect ke login jika belum login
✓ Tombol logout tersedia di semua halaman admin

⚠ CATATAN KEAMANAN:
  - Password disimpan plain text di JavaScript
  - Sistem ini cocok untuk demo/prototype
  - Untuk produksi, gunakan:
    * Backend authentication (PHP/Node.js)
    * Password hashing (bcrypt/argon2)
    * Database server
    * HTTPS / SSL

═══════════════════════════════════════════════════════════
  STRUKTUR FILE ADMIN
═══════════════════════════════════════════════════════════

rt-website/
├── admin-login.html         → Halaman login admin
├── admin-dashboard.html     → Dashboard admin
├── admin-pengumuman.html    → CRUD pengumuman
├── admin-iuran.html         → CRUD iuran
├── admin-umkm.html          → CRUD UMKM
├── admin-kegiatan.html      → CRUD kegiatan
├── admin-ronda.html         → CRUD jadwal ronda
├── admin-laporan.html       → CRUD laporan
├── assets/
│   ├── css/
│   │   └── admin.css        → Style khusus admin
│   └── js/
│       └── admin.js         → Logic auth + CRUD
└── ADMIN-README.txt         → File ini

═══════════════════════════════════════════════════════════
  TROUBLESHOOTING
═══════════════════════════════════════════════════════════

❌ Tidak bisa login?
   → Cek username & password (case-sensitive)
   → Coba refresh halaman (F5)

❌ Data tidak muncul?
   → Cek console browser (F12)
   → Data mungkin belum ada, tambahkan via tombol "Tambah"

❌ Logout sendiri?
   → Session timeout (refresh halaman)
   → Login ulang

❌ Data hilang?
   → Browser data dibersihkan
   → Ganti browser/komputer (data di LocalStorage)

═══════════════════════════════════════════════════════════
 © 2026 RT 04 / RW 02 - Kp. Gedong, Jombang, Ciputat
═══════════════════════════════════════════════════════════
