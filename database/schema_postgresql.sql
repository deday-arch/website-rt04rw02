-- ============================================================
--  SKEMA DATABASE PostgreSQL - Website RT 04 / RW 02
--  Jombang, Ciputat, Tangerang Selatan
--  Versi  : 1.0
--  Dibuat : 2026-07-24
-- ============================================================

-- ── EXTENSION ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- ── ENUM TYPES ──────────────────────────────────────────────
CREATE TYPE kategori_pengumuman  AS ENUM ('Penting', 'Kegiatan', 'Info', 'Spesial');
CREATE TYPE kategori_kegiatan    AS ENUM ('Rutin', 'Spesial', 'Sosial', 'Keagamaan', 'Lainnya');
CREATE TYPE status_kegiatan      AS ENUM ('Mendatang', 'Berlangsung', 'Selesai', 'Dibatalkan');
CREATE TYPE kategori_umkm        AS ENUM (
    'Makanan & Minuman', 'Sembako', 'Jasa', 'Fashion',
    'Elektronik', 'Pendidikan', 'Kesehatan', 'Lainnya'
);
CREATE TYPE status_iuran         AS ENUM ('Lunas', 'Belum Bayar', 'Cicilan');
CREATE TYPE urgensi_laporan      AS ENUM ('Normal', 'Mendesak', 'Darurat / Emergency');
CREATE TYPE status_laporan       AS ENUM ('Masuk', 'Diproses', 'Selesai');
CREATE TYPE jenis_laporan        AS ENUM (
    'Gangguan Keamanan', 'Kebakaran', 'Banjir / Genangan Air',
    'Kecelakaan', 'Pohon Tumbang', 'Gangguan Listrik / PLN',
    'Masalah Sampah', 'Fasilitas Umum Rusak', 'Lainnya'
);
CREATE TYPE role_admin           AS ENUM ('superadmin', 'admin', 'viewer');


-- ============================================================
-- 1. TABEL: admin_users
--    Akun login admin panel
-- ============================================================
CREATE TABLE admin_users (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50)   NOT NULL UNIQUE,
    password_hash TEXT          NOT NULL,          -- bcrypt hash
    role          role_admin    NOT NULL DEFAULT 'admin',
    nama_lengkap  VARCHAR(100),
    aktif         BOOLEAN       NOT NULL DEFAULT TRUE,
    last_login    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  admin_users               IS 'Akun login untuk panel admin RT';
COMMENT ON COLUMN admin_users.password_hash IS 'Disimpan sebagai bcrypt hash, bukan plain text';
COMMENT ON COLUMN admin_users.role          IS 'superadmin: akses penuh | admin: CRUD | viewer: read-only';

-- Seed: akun default (password wajib diganti setelah deploy)
INSERT INTO admin_users (username, password_hash, role, nama_lengkap) VALUES
    ('admin',       '$2a$12$placeholder_hash_admin',       'superadmin', 'Administrator'),
    ('ketua.rt',    '$2a$12$placeholder_hash_ketua',       'admin',      'Ketua RT'),
    ('sekretaris',  '$2a$12$placeholder_hash_sekretaris',  'admin',      'Sekretaris RT');


-- ============================================================
-- 2. TABEL: warga
--    Master data warga / penghuni RT 04 RW 02
-- ============================================================
CREATE TABLE warga (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    no_kartu     VARCHAR(20)  NOT NULL UNIQUE,  -- nomor kartu / no. rumah
    nama         VARCHAR(150) NOT NULL,
    kontak       VARCHAR(30),                   -- nomor HP / WA
    alamat       TEXT,
    aktif        BOOLEAN      NOT NULL DEFAULT TRUE,
    keterangan   TEXT,                          -- mis: 'Kontrak', 'Kost', 'Usaha'
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_warga_no_kartu ON warga (no_kartu);
CREATE INDEX idx_warga_nama     ON warga (nama);

COMMENT ON TABLE  warga          IS 'Master data warga / penghuni RT 04 RW 02';
COMMENT ON COLUMN warga.no_kartu IS 'Nomor unik kartu warga (10 digit, ex: 0000000001)';
COMMENT ON COLUMN warga.kontak   IS 'Nomor HP / WhatsApp warga';


-- ============================================================
-- 3. TABEL: iuran_bulanan
--    Catatan iuran kebersihan + keamanan per warga per bulan
-- ============================================================
CREATE TABLE iuran_bulanan (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id      UUID         NOT NULL REFERENCES warga (id) ON DELETE CASCADE,
    bulan         SMALLINT     NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun         SMALLINT     NOT NULL CHECK (tahun >= 2020),
    kebersihan    INTEGER      NOT NULL DEFAULT 30000 CHECK (kebersihan >= 0),
    keamanan      INTEGER      NOT NULL DEFAULT 20000 CHECK (keamanan >= 0),
    total         INTEGER      GENERATED ALWAYS AS (kebersihan + keamanan) STORED,
    status        status_iuran NOT NULL DEFAULT 'Belum Bayar',
    tgl_bayar     DATE,
    dicatat_oleh  UUID         REFERENCES admin_users (id) ON DELETE SET NULL,
    catatan       TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_iuran_warga_bulan UNIQUE (warga_id, bulan, tahun)
);

CREATE INDEX idx_iuran_warga_id   ON iuran_bulanan (warga_id);
CREATE INDEX idx_iuran_bulan_thn  ON iuran_bulanan (bulan, tahun);
CREATE INDEX idx_iuran_status     ON iuran_bulanan (status);

COMMENT ON TABLE  iuran_bulanan           IS 'Catatan pembayaran iuran kebersihan dan keamanan per warga per bulan';
COMMENT ON COLUMN iuran_bulanan.total     IS 'Kolom computed: kebersihan + keamanan (auto-generated)';
COMMENT ON COLUMN iuran_bulanan.tgl_bayar IS 'Tanggal pembayaran, NULL jika belum bayar';


-- ============================================================
-- 4. TABEL: pengumuman
--    Pengumuman resmi dari pengurus RT
-- ============================================================
CREATE TABLE pengumuman (
    id           UUID                   PRIMARY KEY DEFAULT gen_random_uuid(),
    judul        VARCHAR(200)           NOT NULL,
    isi          TEXT                   NOT NULL,
    kategori     kategori_pengumuman    NOT NULL DEFAULT 'Info',
    tanggal      DATE                   NOT NULL DEFAULT CURRENT_DATE,
    aktif        BOOLEAN                NOT NULL DEFAULT TRUE,
    dibuat_oleh  UUID                   REFERENCES admin_users (id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ            NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ            NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pengumuman_tanggal  ON pengumuman (tanggal DESC);
CREATE INDEX idx_pengumuman_kategori ON pengumuman (kategori);
CREATE INDEX idx_pengumuman_aktif    ON pengumuman (aktif);

COMMENT ON TABLE pengumuman IS 'Pengumuman resmi dari pengurus RT 04 RW 02';


-- ============================================================
-- 5. TABEL: kegiatan
--    Jadwal dan dokumentasi kegiatan RT
-- ============================================================
CREATE TABLE kegiatan (
    id           UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    nama         VARCHAR(200)      NOT NULL,
    tanggal      DATE              NOT NULL,
    waktu        VARCHAR(50),                   -- ex: '07.00-12.00 WIB'
    lokasi       VARCHAR(200),
    peserta      VARCHAR(200),                  -- ex: 'Semua warga'
    kategori     kategori_kegiatan NOT NULL DEFAULT 'Rutin',
    status       status_kegiatan   NOT NULL DEFAULT 'Mendatang',
    deskripsi    TEXT,
    gambar_url   TEXT,                          -- URL gambar (Azure Blob Storage)
    dibuat_oleh  UUID              REFERENCES admin_users (id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kegiatan_tanggal ON kegiatan (tanggal DESC);
CREATE INDEX idx_kegiatan_status  ON kegiatan (status);

COMMENT ON TABLE  kegiatan           IS 'Jadwal dan riwayat kegiatan RT 04 RW 02';
COMMENT ON COLUMN kegiatan.gambar_url IS 'URL ke Azure Blob Storage; simpan URL bukan base64';


-- ============================================================
-- 6. TABEL: umkm
--    Direktori usaha mikro warga RT
-- ============================================================
CREATE TABLE umkm (
    id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_usaha   VARCHAR(200)   NOT NULL,
    pemilik      VARCHAR(150)   NOT NULL,
    warga_id     UUID           REFERENCES warga (id) ON DELETE SET NULL,
    no_rumah     VARCHAR(50),                   -- fallback jika warga_id NULL
    kategori     kategori_umkm  NOT NULL DEFAULT 'Lainnya',
    deskripsi    TEXT,
    kontak       VARCHAR(50),
    gambar_url   TEXT,                          -- URL Azure Blob Storage
    aktif        BOOLEAN        NOT NULL DEFAULT TRUE,
    dibuat_oleh  UUID           REFERENCES admin_users (id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_umkm_kategori ON umkm (kategori);
CREATE INDEX idx_umkm_aktif    ON umkm (aktif);

COMMENT ON TABLE umkm IS 'Direktori usaha mikro kecil menengah warga RT 04 RW 02';


-- ============================================================
-- 7. TABEL: pengurus
--    Susunan pengurus RT periode aktif
-- ============================================================
CREATE TABLE pengurus (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id     UUID         REFERENCES warga (id) ON DELETE SET NULL,
    nama         VARCHAR(150) NOT NULL,
    jabatan      VARCHAR(100) NOT NULL,
    kontak       VARCHAR(50),
    alamat       TEXT,
    ikon_css     VARCHAR(60)  DEFAULT 'fa-user',   -- Font Awesome class
    warna_hex    VARCHAR(10)  DEFAULT '#1565c0',
    foto_url     TEXT,                              -- URL Azure Blob Storage
    urutan       SMALLINT     NOT NULL DEFAULT 99,  -- urutan tampil di halaman
    aktif        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pengurus_urutan ON pengurus (urutan);
CREATE INDEX idx_pengurus_aktif  ON pengurus (aktif);

COMMENT ON TABLE  pengurus        IS 'Susunan pengurus RT 04 RW 02 periode aktif';
COMMENT ON COLUMN pengurus.urutan IS 'Urutan tampil: 1=Ketua, 2=Wakil, dst.';


-- ============================================================
-- 8. TABEL: ronda
--    Jadwal ronda malam per regu
-- ============================================================
CREATE TABLE ronda (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_regu    VARCHAR(50)  NOT NULL,           -- ex: 'Regu 1'
    hari         VARCHAR(15),                      -- ex: 'Rabu'
    tanggal      DATE,
    shift        VARCHAR(30)  NOT NULL DEFAULT '22.00–04.00',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ronda_tanggal ON ronda (tanggal);

COMMENT ON TABLE ronda IS 'Jadwal ronda malam RT 04 RW 02, dikelola per regu';


-- ============================================================
-- 9. TABEL: ronda_anggota
--    Anggota tiap regu ronda (relasi many-to-many)
-- ============================================================
CREATE TABLE ronda_anggota (
    id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    ronda_id  UUID         NOT NULL REFERENCES ronda (id) ON DELETE CASCADE,
    nama      VARCHAR(150) NOT NULL,              -- nama peserta ronda
    warga_id  UUID         REFERENCES warga (id) ON DELETE SET NULL,
    urutan    SMALLINT     NOT NULL DEFAULT 1,    -- posisi dalam regu (ketua regu = 1)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ronda_anggota_ronda   ON ronda_anggota (ronda_id);
CREATE INDEX idx_ronda_anggota_warga   ON ronda_anggota (warga_id);

COMMENT ON TABLE  ronda_anggota        IS 'Daftar anggota per regu ronda';
COMMENT ON COLUMN ronda_anggota.urutan IS 'Urutan 1 = ketua regu / penanggungjawab';


-- ============================================================
-- 10. TABEL: laporan_kejadian
--     Laporan insiden/kejadian dari warga via form publik
-- ============================================================
CREATE TABLE laporan_kejadian (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id        UUID            REFERENCES warga (id) ON DELETE SET NULL,
    nama_pelapor    VARCHAR(150)    NOT NULL,
    no_rumah        VARCHAR(50),
    no_hp           VARCHAR(30),
    jenis           jenis_laporan   NOT NULL DEFAULT 'Lainnya',
    lokasi          VARCHAR(200)    NOT NULL,
    deskripsi       TEXT            NOT NULL,
    urgensi         urgensi_laporan NOT NULL DEFAULT 'Normal',
    status          status_laporan  NOT NULL DEFAULT 'Masuk',
    catatan_admin   TEXT,                          -- catatan tindak lanjut dari admin
    diproses_oleh   UUID            REFERENCES admin_users (id) ON DELETE SET NULL,
    tgl_diproses    TIMESTAMPTZ,
    tgl_selesai     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_laporan_status   ON laporan_kejadian (status);
CREATE INDEX idx_laporan_urgensi  ON laporan_kejadian (urgensi);
CREATE INDEX idx_laporan_created  ON laporan_kejadian (created_at DESC);

COMMENT ON TABLE laporan_kejadian IS 'Laporan kejadian / insiden dari warga RT 04 RW 02';


-- ============================================================
-- 11. TABEL: audit_log
--     Log seluruh aksi CRUD oleh admin (untuk keamanan & lacak)
-- ============================================================
CREATE TABLE audit_log (
    id           BIGSERIAL    PRIMARY KEY,
    admin_id     UUID         REFERENCES admin_users (id) ON DELETE SET NULL,
    username     VARCHAR(50),                     -- snapshot saat aksi
    aksi         VARCHAR(20)  NOT NULL,            -- INSERT / UPDATE / DELETE
    tabel        VARCHAR(60)  NOT NULL,            -- nama tabel yang diubah
    record_id    TEXT,                             -- ID record yang diubah (UUID as text)
    data_lama    JSONB,                            -- snapshot sebelum perubahan
    data_baru    JSONB,                            -- snapshot setelah perubahan
    ip_address   INET,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_admin    ON audit_log (admin_id);
CREATE INDEX idx_audit_tabel    ON audit_log (tabel);
CREATE INDEX idx_audit_created  ON audit_log (created_at DESC);

COMMENT ON TABLE audit_log IS 'Log perubahan data oleh admin — untuk keamanan dan keterlacakan';


-- ============================================================
-- TRIGGER: auto-update kolom updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Pasang trigger ke semua tabel yang punya kolom updated_at
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'admin_users', 'warga', 'iuran_bulanan', 'pengumuman',
        'kegiatan', 'umkm', 'pengurus', 'ronda', 'laporan_kejadian'
    ] LOOP
        EXECUTE FORMAT(
            'CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
            tbl, tbl
        );
    END LOOP;
END;
$$;


-- ============================================================
-- VIEW: ringkasan_iuran_bulanan
--    Statistik iuran per bulan untuk dashboard admin
-- ============================================================
CREATE OR REPLACE VIEW ringkasan_iuran_bulanan AS
SELECT
    ib.tahun,
    ib.bulan,
    COUNT(*)                                          AS total_warga,
    COUNT(*) FILTER (WHERE ib.status = 'Lunas')       AS sudah_bayar,
    COUNT(*) FILTER (WHERE ib.status = 'Belum Bayar') AS belum_bayar,
    SUM(ib.total) FILTER (WHERE ib.status = 'Lunas')  AS total_terkumpul,
    ROUND(
        COUNT(*) FILTER (WHERE ib.status = 'Lunas') * 100.0 / NULLIF(COUNT(*), 0),
        1
    )                                                  AS persen_lunas
FROM iuran_bulanan ib
GROUP BY ib.tahun, ib.bulan
ORDER BY ib.tahun DESC, ib.bulan DESC;

COMMENT ON VIEW ringkasan_iuran_bulanan IS 'Statistik pembayaran iuran per bulan';


-- ============================================================
-- VIEW: laporan_aktif
--    Laporan yang belum selesai, diurutkan urgensi tertinggi
-- ============================================================
CREATE OR REPLACE VIEW laporan_aktif AS
SELECT
    lk.id,
    lk.nama_pelapor,
    lk.no_rumah,
    lk.no_hp,
    lk.jenis,
    lk.lokasi,
    lk.deskripsi,
    lk.urgensi,
    lk.status,
    lk.created_at,
    au.username AS diproses_oleh_user
FROM laporan_kejadian lk
LEFT JOIN admin_users au ON au.id = lk.diproses_oleh
WHERE lk.status IN ('Masuk', 'Diproses')
ORDER BY
    CASE lk.urgensi
        WHEN 'Darurat / Emergency' THEN 1
        WHEN 'Mendesak'            THEN 2
        ELSE 3
    END,
    lk.created_at DESC;

COMMENT ON VIEW laporan_aktif IS 'Laporan kejadian yang masih aktif, diurutkan berdasarkan urgensi';


-- ============================================================
-- VIEW: jadwal_ronda_lengkap
--    Ronda dengan daftar anggota dalam satu baris (JSON array)
-- ============================================================
CREATE OR REPLACE VIEW jadwal_ronda_lengkap AS
SELECT
    r.id,
    r.nama_regu,
    r.hari,
    r.tanggal,
    r.shift,
    JSON_AGG(
        JSON_BUILD_OBJECT('urutan', ra.urutan, 'nama', ra.nama)
        ORDER BY ra.urutan
    ) AS anggota
FROM ronda r
LEFT JOIN ronda_anggota ra ON ra.ronda_id = r.id
GROUP BY r.id, r.nama_regu, r.hari, r.tanggal, r.shift
ORDER BY r.tanggal, r.nama_regu;

COMMENT ON VIEW jadwal_ronda_lengkap IS 'Jadwal ronda lengkap dengan daftar anggota sebagai JSON array';


-- ============================================================
-- ROW LEVEL SECURITY (RLS) — dasar
-- ============================================================
ALTER TABLE admin_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log         ENABLE ROW LEVEL SECURITY;

-- Hanya superadmin bisa melihat seluruh tabel admin_users
CREATE POLICY admin_users_policy ON admin_users
    USING (current_setting('app.current_role', TRUE) = 'superadmin'
        OR id::TEXT = current_setting('app.current_user_id', TRUE));

-- Semua admin bisa tulis ke audit_log, tidak ada yang bisa hapus
CREATE POLICY audit_log_insert ON audit_log
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY audit_log_select ON audit_log
    FOR SELECT USING (current_setting('app.current_role', TRUE) IN ('superadmin', 'admin'));


-- ============================================================
-- GRANT — role untuk aplikasi (least-privilege)
-- ============================================================
-- Buat role khusus aplikasi (jalankan sekali saat setup Azure)
-- CREATE ROLE rt04_app LOGIN PASSWORD 'ganti_dengan_password_kuat';

-- GRANT CONNECT ON DATABASE rt04rw02 TO rt04_app;
-- GRANT USAGE ON SCHEMA public TO rt04_app;

-- GRANT SELECT, INSERT, UPDATE, DELETE ON
--     warga, iuran_bulanan, pengumuman, kegiatan,
--     umkm, pengurus, ronda, ronda_anggota, laporan_kejadian
-- TO rt04_app;

-- GRANT SELECT ON admin_users TO rt04_app;
-- GRANT INSERT ON audit_log TO rt04_app;
-- GRANT USAGE ON SEQUENCE audit_log_id_seq TO rt04_app;


-- ============================================================
-- FIN — Schema RT 04 / RW 02 PostgreSQL (Azure)
-- ============================================================
