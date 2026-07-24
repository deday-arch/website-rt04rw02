# ERD — Skema Database RT 04 / RW 02

## Diagram Relasi (Teks)

```
admin_users ──────────────────────────────────────────────────────┐
     │ id (PK)                                                     │
     │                                                             │
     ├──(dibuat_oleh)──► pengumuman                               │
     ├──(dibuat_oleh)──► kegiatan                                 │
     ├──(dibuat_oleh)──► umkm                                     │
     ├──(dicatat_oleh)─► iuran_bulanan                            │
     ├──(diproses_oleh)► laporan_kejadian                         │
     └──(admin_id)─────► audit_log ◄────────────────────────────┘

warga ─────────────────────────────────────────────────────────────
     │ id (PK)
     │ no_kartu (UNIQUE)
     │ nama
     │ kontak
     │
     ├──(warga_id)──► iuran_bulanan   [1 warga → N iuran bulan]
     ├──(warga_id)──► umkm            [1 warga → N usaha]
     ├──(warga_id)──► pengurus        [1 warga → 1 jabatan]
     ├──(warga_id)──► ronda_anggota   [1 warga → N jadwal ronda]
     └──(warga_id)──► laporan_kejadian [1 warga → N laporan]

ronda ──────────────────────────────────────────────────────────────
     │ id (PK)
     │ nama_regu, hari, tanggal, shift
     │
     └──(ronda_id)──► ronda_anggota   [1 regu → N anggota]
```

## Tabel & Kolom

| Tabel               | PK   | Kolom Utama                                              | Relasi |
|---------------------|------|----------------------------------------------------------|--------|
| `admin_users`       | UUID | username, password_hash, role, aktif                     | — |
| `warga`             | UUID | no_kartu, nama, kontak, aktif                            | — |
| `iuran_bulanan`     | UUID | warga_id, bulan, tahun, kebersihan, keamanan, total*, status, tgl_bayar | → warga, admin_users |
| `pengumuman`        | UUID | judul, isi, kategori, tanggal, aktif                     | → admin_users |
| `kegiatan`          | UUID | nama, tanggal, waktu, lokasi, kategori, status, gambar_url | → admin_users |
| `umkm`              | UUID | nama_usaha, pemilik, warga_id, kategori, kontak, gambar_url | → warga, admin_users |
| `pengurus`          | UUID | nama, jabatan, kontak, urutan, foto_url, aktif           | → warga |
| `ronda`             | UUID | nama_regu, hari, tanggal, shift                          | — |
| `ronda_anggota`     | UUID | ronda_id, nama, warga_id, urutan                         | → ronda, warga |
| `laporan_kejadian`  | UUID | nama_pelapor, jenis, lokasi, deskripsi, urgensi, status  | → warga, admin_users |
| `audit_log`         | BIGSERIAL | admin_id, aksi, tabel, record_id, data_lama, data_baru | → admin_users |

`*` kolom `total` adalah **GENERATED ALWAYS AS** (computed, tidak perlu diisi manual)

## ENUM Types

| Nama                  | Nilai                                             |
|-----------------------|---------------------------------------------------|
| `kategori_pengumuman` | Penting, Kegiatan, Info, Spesial                  |
| `kategori_kegiatan`   | Rutin, Spesial, Sosial, Keagamaan, Lainnya        |
| `status_kegiatan`     | Mendatang, Berlangsung, Selesai, Dibatalkan        |
| `kategori_umkm`       | Makanan & Minuman, Sembako, Jasa, …, Lainnya      |
| `status_iuran`        | Lunas, Belum Bayar, Cicilan                       |
| `urgensi_laporan`     | Normal, Mendesak, Darurat / Emergency             |
| `status_laporan`      | Masuk, Diproses, Selesai                          |
| `jenis_laporan`       | Gangguan Keamanan, Kebakaran, Banjir, …, Lainnya  |
| `role_admin`          | superadmin, admin, viewer                         |

## Views

| View                      | Deskripsi                                               |
|---------------------------|---------------------------------------------------------|
| `ringkasan_iuran_bulanan` | Statistik lunas/belum bayar & total terkumpul per bulan |
| `laporan_aktif`           | Laporan belum selesai, diurutkan per urgensi            |
| `jadwal_ronda_lengkap`    | Ronda + daftar anggota sebagai JSON array               |

## Setup Azure Database for PostgreSQL

```bash
# 1. Buat resource (Azure CLI)
az postgres flexible-server create \
  --name rt04rw02-db \
  --resource-group rg-rt04rw02 \
  --location southeastasia \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16 \
  --admin-user rtadmin \
  --admin-password "<password_kuat>" \
  --public-access 0.0.0.0

# 2. Buat database
az postgres flexible-server db create \
  --server-name rt04rw02-db \
  --resource-group rg-rt04rw02 \
  --database-name rt04rw02

# 3. Jalankan skema
psql "host=rt04rw02-db.postgres.database.azure.com \
      dbname=rt04rw02 user=rtadmin" \
  -f schema_postgresql.sql

# 4. Jalankan seed data
psql "host=rt04rw02-db.postgres.database.azure.com \
      dbname=rt04rw02 user=rtadmin" \
  -f seed_data.sql
```

## Connection String (untuk aplikasi)

```
postgresql://rtadmin:<password>@rt04rw02-db.postgres.database.azure.com:5432/rt04rw02?sslmode=require
```
