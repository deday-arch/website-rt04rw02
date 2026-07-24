-- ============================================================
--  SUPABASE MIGRATION — RT 04 / RW 02
--  Jalankan file ini di: Supabase Dashboard → SQL Editor
--  Urutan: 1. Extensions → 2. Types → 3. Tables → 4. Views
--           → 5. Triggers → 6. Data seed
-- ============================================================

-- ── 1. EXTENSION ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 2. ENUM TYPES ────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE kategori_pengumuman  AS ENUM ('Penting','Kegiatan','Info','Spesial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE kategori_kegiatan    AS ENUM ('Rutin','Spesial','Sosial','Keagamaan','Lainnya');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE status_kegiatan      AS ENUM ('Mendatang','Berlangsung','Selesai','Dibatalkan');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE kategori_umkm AS ENUM (
    'Makanan & Minuman','Sembako','Jasa','Fashion',
    'Elektronik','Pendidikan','Kesehatan','Lainnya');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE status_iuran         AS ENUM ('Lunas','Belum Bayar','Cicilan');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE urgensi_laporan      AS ENUM ('Normal','Mendesak','Darurat / Emergency');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE status_laporan       AS ENUM ('Masuk','Diproses','Selesai');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE jenis_laporan AS ENUM (
    'Gangguan Keamanan','Kebakaran','Banjir / Genangan Air',
    'Kecelakaan','Pohon Tumbang','Gangguan Listrik / PLN',
    'Masalah Sampah','Fasilitas Umum Rusak','Lainnya');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE role_admin           AS ENUM ('superadmin','admin','viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 3. TABLES ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(50) NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  role          role_admin  NOT NULL DEFAULT 'admin',
  nama_lengkap  VARCHAR(100),
  aktif         BOOLEAN     NOT NULL DEFAULT TRUE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warga (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  no_kartu    VARCHAR(20)  NOT NULL UNIQUE,
  nama        VARCHAR(150) NOT NULL,
  kontak      VARCHAR(30),
  alamat      TEXT,
  aktif       BOOLEAN      NOT NULL DEFAULT TRUE,
  keterangan  TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_warga_no_kartu ON warga(no_kartu);
CREATE INDEX IF NOT EXISTS idx_warga_nama     ON warga(nama);

CREATE TABLE IF NOT EXISTS iuran_bulanan (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  warga_id     UUID         NOT NULL REFERENCES warga(id) ON DELETE CASCADE,
  bulan        SMALLINT     NOT NULL CHECK (bulan BETWEEN 1 AND 12),
  tahun        SMALLINT     NOT NULL CHECK (tahun >= 2020),
  kebersihan   INTEGER      NOT NULL DEFAULT 30000 CHECK (kebersihan >= 0),
  keamanan     INTEGER      NOT NULL DEFAULT 20000 CHECK (keamanan >= 0),
  total        INTEGER      GENERATED ALWAYS AS (kebersihan + keamanan) STORED,
  status       status_iuran NOT NULL DEFAULT 'Belum Bayar',
  tgl_bayar    DATE,
  dicatat_oleh UUID         REFERENCES admin_users(id) ON DELETE SET NULL,
  catatan      TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_iuran_warga_bulan UNIQUE (warga_id, bulan, tahun)
);
CREATE INDEX IF NOT EXISTS idx_iuran_warga_id  ON iuran_bulanan(warga_id);
CREATE INDEX IF NOT EXISTS idx_iuran_bulan_thn ON iuran_bulanan(bulan, tahun);
CREATE INDEX IF NOT EXISTS idx_iuran_status    ON iuran_bulanan(status);

CREATE TABLE IF NOT EXISTS pengumuman (
  id          UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  judul       VARCHAR(200)          NOT NULL,
  isi         TEXT                  NOT NULL,
  kategori    kategori_pengumuman   NOT NULL DEFAULT 'Info',
  tanggal     DATE                  NOT NULL DEFAULT CURRENT_DATE,
  aktif       BOOLEAN               NOT NULL DEFAULT TRUE,
  dibuat_oleh UUID                  REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pengumuman_tanggal  ON pengumuman(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_pengumuman_aktif    ON pengumuman(aktif);

CREATE TABLE IF NOT EXISTS kegiatan (
  id          UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        VARCHAR(200)      NOT NULL,
  tanggal     DATE              NOT NULL,
  waktu       VARCHAR(50),
  lokasi      VARCHAR(200),
  peserta     VARCHAR(200),
  kategori    kategori_kegiatan NOT NULL DEFAULT 'Rutin',
  status      status_kegiatan   NOT NULL DEFAULT 'Mendatang',
  deskripsi   TEXT,
  gambar_url  TEXT,
  dibuat_oleh UUID              REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_kegiatan_tanggal ON kegiatan(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_kegiatan_status  ON kegiatan(status);

CREATE TABLE IF NOT EXISTS umkm (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_usaha  VARCHAR(200)  NOT NULL,
  pemilik     VARCHAR(150)  NOT NULL,
  warga_id    UUID          REFERENCES warga(id) ON DELETE SET NULL,
  no_rumah    VARCHAR(50),
  kategori    kategori_umkm NOT NULL DEFAULT 'Lainnya',
  deskripsi   TEXT,
  kontak      VARCHAR(50),
  gambar_url  TEXT,
  aktif       BOOLEAN       NOT NULL DEFAULT TRUE,
  dibuat_oleh UUID          REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_umkm_kategori ON umkm(kategori);
CREATE INDEX IF NOT EXISTS idx_umkm_aktif    ON umkm(aktif);

CREATE TABLE IF NOT EXISTS pengurus (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  warga_id   UUID         REFERENCES warga(id) ON DELETE SET NULL,
  nama       VARCHAR(150) NOT NULL,
  jabatan    VARCHAR(100) NOT NULL,
  kontak     VARCHAR(50),
  alamat     TEXT,
  ikon_css   VARCHAR(60)  DEFAULT 'fa-user',
  warna_hex  VARCHAR(10)  DEFAULT '#1565c0',
  foto_url   TEXT,
  urutan     SMALLINT     NOT NULL DEFAULT 99,
  aktif      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pengurus_urutan ON pengurus(urutan);
CREATE INDEX IF NOT EXISTS idx_pengurus_aktif  ON pengurus(aktif);

CREATE TABLE IF NOT EXISTS ronda (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_regu  VARCHAR(50)  NOT NULL,
  hari       VARCHAR(15),
  tanggal    DATE,
  shift      VARCHAR(30)  NOT NULL DEFAULT '22.00–04.00',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ronda_tanggal ON ronda(tanggal);

CREATE TABLE IF NOT EXISTS ronda_anggota (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  ronda_id   UUID         NOT NULL REFERENCES ronda(id) ON DELETE CASCADE,
  nama       VARCHAR(150) NOT NULL,
  warga_id   UUID         REFERENCES warga(id) ON DELETE SET NULL,
  urutan     SMALLINT     NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ronda_anggota_ronda ON ronda_anggota(ronda_id);

CREATE TABLE IF NOT EXISTS laporan_kejadian (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  warga_id        UUID            REFERENCES warga(id) ON DELETE SET NULL,
  nama_pelapor    VARCHAR(150)    NOT NULL,
  no_rumah        VARCHAR(50),
  no_hp           VARCHAR(30),
  jenis           jenis_laporan   NOT NULL DEFAULT 'Lainnya',
  lokasi          VARCHAR(200)    NOT NULL,
  deskripsi       TEXT            NOT NULL,
  urgensi         urgensi_laporan NOT NULL DEFAULT 'Normal',
  status          status_laporan  NOT NULL DEFAULT 'Masuk',
  catatan_admin   TEXT,
  foto_data       TEXT,
  foto_mime       VARCHAR(30)     DEFAULT 'image/jpeg',
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  lokasi_gps      TEXT,
  diproses_oleh   UUID            REFERENCES admin_users(id) ON DELETE SET NULL,
  tgl_diproses    TIMESTAMPTZ,
  tgl_selesai     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_laporan_status  ON laporan_kejadian(status);
CREATE INDEX IF NOT EXISTS idx_laporan_created ON laporan_kejadian(created_at DESC);

CREATE TABLE IF NOT EXISTS dokumentasi (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  judul       VARCHAR(200) NOT NULL,
  deskripsi   TEXT,
  tipe        VARCHAR(10)  NOT NULL DEFAULT 'foto' CHECK (tipe IN ('foto','video')),
  media_data  TEXT,
  media_mime  VARCHAR(40)  DEFAULT 'image/jpeg',
  video_url   TEXT,
  bulan       SMALLINT     NOT NULL CHECK (bulan BETWEEN 1 AND 12),
  tahun       SMALLINT     NOT NULL CHECK (tahun >= 2020),
  aktif       BOOLEAN      NOT NULL DEFAULT TRUE,
  dibuat_oleh UUID         REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dok_bulan_tahun ON dokumentasi(tahun DESC, bulan DESC);

CREATE TABLE IF NOT EXISTS audit_log (
  id         BIGSERIAL    PRIMARY KEY,
  admin_id   UUID         REFERENCES admin_users(id) ON DELETE SET NULL,
  username   VARCHAR(50),
  aksi       VARCHAR(20)  NOT NULL,
  tabel      VARCHAR(60)  NOT NULL,
  record_id  TEXT,
  data_lama  JSONB,
  data_baru  JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

-- ── 4. VIEWS ─────────────────────────────────────────────────

CREATE OR REPLACE VIEW ringkasan_iuran_bulanan AS
SELECT
  ib.tahun, ib.bulan,
  COUNT(*)                                          AS total_warga,
  COUNT(*) FILTER (WHERE ib.status='Lunas')         AS sudah_bayar,
  COUNT(*) FILTER (WHERE ib.status='Belum Bayar')   AS belum_bayar,
  SUM(ib.total) FILTER (WHERE ib.status='Lunas')    AS total_terkumpul,
  ROUND(COUNT(*) FILTER (WHERE ib.status='Lunas') * 100.0 / NULLIF(COUNT(*),0),1) AS persen_lunas
FROM iuran_bulanan ib
GROUP BY ib.tahun, ib.bulan
ORDER BY ib.tahun DESC, ib.bulan DESC;

CREATE OR REPLACE VIEW laporan_aktif AS
SELECT
  lk.id, lk.nama_pelapor, lk.no_rumah, lk.no_hp,
  lk.jenis, lk.lokasi, lk.deskripsi, lk.urgensi, lk.status,
  lk.ada_foto, lk.created_at, au.username AS diproses_oleh_user
FROM (
  SELECT *,
    CASE WHEN foto_data IS NOT NULL THEN true ELSE false END AS ada_foto
  FROM laporan_kejadian
  WHERE status IN ('Masuk','Diproses')
) lk
LEFT JOIN admin_users au ON au.id = lk.diproses_oleh
ORDER BY
  CASE lk.urgensi
    WHEN 'Darurat / Emergency' THEN 1
    WHEN 'Mendesak'            THEN 2
    ELSE 3
  END, lk.created_at DESC;

CREATE OR REPLACE VIEW jadwal_ronda_lengkap AS
SELECT
  r.id, r.nama_regu, r.hari, r.tanggal, r.shift,
  JSON_AGG(JSON_BUILD_OBJECT('urutan',ra.urutan,'nama',ra.nama) ORDER BY ra.urutan) AS anggota
FROM ronda r
LEFT JOIN ronda_anggota ra ON ra.ronda_id = r.id
GROUP BY r.id, r.nama_regu, r.hari, r.tanggal, r.shift
ORDER BY r.tanggal, r.nama_regu;

-- ── 5. TRIGGER updated_at ────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'admin_users','warga','iuran_bulanan','pengumuman',
    'kegiatan','umkm','pengurus','ronda','laporan_kejadian','dokumentasi'
  ] LOOP
    EXECUTE FORMAT(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I;
       CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      t, t, t, t);
  END LOOP;
END $$;

-- ── 6. SEED DATA ─────────────────────────────────────────────

-- Admin accounts (password di-hash setelah koneksi berhasil via script)
INSERT INTO admin_users (username, password_hash, role, nama_lengkap) VALUES
  ('admin',      '$2a$12$WIplaceholderhashadmin000000000000000000000000000000000','superadmin','Administrator'),
  ('ketua.rt',   '$2a$12$WIplaceholderHashKetua00000000000000000000000000000000','admin',     'Ketua RT'),
  ('sekretaris', '$2a$12$WIplaceholderHashSekre00000000000000000000000000000000','admin',     'Sekretaris RT')
ON CONFLICT (username) DO NOTHING;

-- Pengurus RT
INSERT INTO pengurus (nama, jabatan, kontak, ikon_css, warna_hex, urutan) VALUES
  ('NOVI AZIZ',     'Ketua RT',             '085692347458','fa-user-tie',          '#1565c0', 1),
  ('SAPTONO',       'Wakil Ketua RT',        '081318938658','fa-user-check',        '#0288d1', 2),
  ('LUKMAN',        'Sekretaris',            '089635719264','fa-pen-clip',          '#0891b2', 3),
  ('MERRY',         'Bendahara',             '088975921141','fa-wallet',            '#d97706', 4),
  ('ALEX',          'Penasehat',             '081510924462','fa-star',              '#7c3aed', 5),
  ('MA''RUF',       'Penasehat',             '089513899071','fa-star',              '#7c3aed', 6),
  ('M IDHAM',       'Humas',                 '081287044231','fa-bullhorn',          '#ea580c', 7),
  ('AMAR',          'Humas',                 '081213567147','fa-bullhorn',          '#ea580c', 8),
  ('G. ISWAHYUDI',  'Pembina',               '082114777892','fa-chalkboard-user',   '#0f766e', 9),
  ('DAMBAS',        'Ketua Keamanan',        '081517892573','fa-shield-halved',     '#dc2626',10),
  ('SUPRAPTO',      'Wakil Ketua Keamanan',  '081318802245','fa-shield',            '#b91c1c',11),
  ('FAUZI',         'Rois',                  '089603025585','fa-mosque',            '#16a34a',12),
  ('AGUNG',         'Perlengkapan',          '085921211033','fa-boxes-stacked',     '#4f46e5',13),
  ('ZAINUDIN',      'Perlengkapan',          '085691300893','fa-boxes-stacked',     '#4f46e5',14),
  ('ENCANG',        'Kepemudaan',             NULL,          'fa-people-group',      '#db2777',15),
  ('ILYAS',         'Kepemudaan',             NULL,          'fa-people-group',      '#db2777',16),
  ('YOGA',          'Kepemudaan',             NULL,          'fa-people-group',      '#db2777',17)
ON CONFLICT DO NOTHING;

-- Pengumuman default
INSERT INTO pengumuman (judul, isi, kategori, tanggal) VALUES
  ('Pembayaran Iuran Juli 2026',
   'Batas pembayaran 31 Juli 2026. Iuran Kebersihan Rp 30.000 + Keamanan Rp 20.000.',
   'Penting','2026-07-01'),
  ('Jadwal Ronda Malam Juli–Agustus 2026',
   'Jadwal 15 regu ronda telah disusun. Harap seluruh anggota hadir tepat waktu.',
   'Kegiatan','2026-07-20'),
  ('Pendaftaran UMKM Warga',
   'Hubungi Sekretaris RT Bpk. Lukman untuk mendaftarkan usaha Anda secara gratis.',
   'Info','2026-07-15')
ON CONFLICT DO NOTHING;

-- Kegiatan
INSERT INTO kegiatan (nama, tanggal, waktu, lokasi, peserta, kategori, status, deskripsi) VALUES
  ('Kerja Bakti Lingkungan','2026-07-27','07.00-12.00 WIB','Seluruh RT 04','Semua warga',
   'Rutin','Mendatang','Bersih-bersih lingkungan RT bersama seluruh warga.'),
  ('Peringatan HUT RI ke-81','2026-08-17','07.00-22.00 WIB','Lapangan RT 04','Semua warga',
   'Spesial','Mendatang','Upacara bendera, lomba tradisional, dan malam hiburan.')
ON CONFLICT DO NOTHING;

-- UMKM
INSERT INTO umkm (nama_usaha, pemilik, no_rumah, kategori, deskripsi, kontak) VALUES
  ('Warung Bu Sari',          'Sari Mulyani',   'No. 7', 'Makanan & Minuman',
   'Nasi uduk, lontong sayur, gorengan. Buka 06.00-10.00.','0812-1111-2222'),
  ('Toko Sembako Pak Hendra', 'Hendra Wijaya',  'No. 8', 'Sembako',
   'Lengkap kebutuhan dapur. Buka 07.00-21.00.','0814-5555-6666'),
  ('Salon Nova',              'Nova Anggraini', 'No. 20','Jasa',
   'Potong rambut, creambath, rebonding, make-up.','0815-7777-8888')
ON CONFLICT DO NOTHING;

-- ── SELESAI ───────────────────────────────────────────────────
-- Setelah menjalankan file ini, jalankan script hash-password:
-- node backend/scripts/hash-passwords.js
-- ============================================================
