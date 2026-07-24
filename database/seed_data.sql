-- ============================================================
--  SEED DATA — Website RT 04 / RW 02
--  Jalankan SETELAH schema_postgresql.sql
-- ============================================================

-- ── PENGURUS ─────────────────────────────────────────────────
INSERT INTO pengurus (nama, jabatan, kontak, ikon_css, warna_hex, urutan) VALUES
    ('NOVI AZIZ',      'Ketua RT',              '085692347458', 'fa-user-tie',          '#1565c0', 1),
    ('SAPTONO',        'Wakil Ketua RT',         '081318938658', 'fa-user-check',        '#0288d1', 2),
    ('LUKMAN',         'Sekretaris',             '089635719264', 'fa-pen-clip',          '#0891b2', 3),
    ('MERRY',          'Bendahara',              '088975921141', 'fa-wallet',            '#d97706', 4),
    ('ALEX',           'Penasehat',              '081510924462', 'fa-star',              '#7c3aed', 5),
    ('MA''RUF',        'Penasehat',              '089513899071', 'fa-star',              '#7c3aed', 6),
    ('M IDHAM',        'Humas',                  '081287044231', 'fa-bullhorn',          '#ea580c', 7),
    ('AMAR',           'Humas',                  '081213567147', 'fa-bullhorn',          '#ea580c', 8),
    ('G. ISWAHYUDI',   'Pembina',                '082114777892', 'fa-chalkboard-user',   '#0f766e', 9),
    ('DAMBAS',         'Ketua Keamanan',         '081517892573', 'fa-shield-halved',     '#dc2626', 10),
    ('SUPRAPTO',       'Wakil Ketua Keamanan',   '081318802245', 'fa-shield',            '#b91c1c', 11),
    ('FAUZI',          'Rois',                   '089603025585', 'fa-mosque',            '#16a34a', 12),
    ('AGUNG',          'Perlengkapan',           '085921211033', 'fa-boxes-stacked',     '#4f46e5', 13),
    ('ZAINUDIN',       'Perlengkapan',           '085691300893', 'fa-boxes-stacked',     '#4f46e5', 14),
    ('ENCANG',         'Kepemudaan',             NULL,           'fa-people-group',      '#db2777', 15),
    ('ILYAS',          'Kepemudaan',             NULL,           'fa-people-group',      '#db2777', 16),
    ('YOGA',           'Kepemudaan',             NULL,           'fa-people-group',      '#db2777', 17);


-- ── PENGUMUMAN (3 default) ────────────────────────────────────
INSERT INTO pengumuman (judul, isi, kategori, tanggal) VALUES
    ('Pembayaran Iuran Juli 2026',
     'Batas pembayaran 31 Juli 2026. Iuran Kebersihan Rp 30.000 + Keamanan Rp 20.000.',
     'Penting', '2026-07-01'),

    ('Jadwal Ronda Malam Juli–Agustus 2026',
     'Jadwal 15 regu ronda telah disusun. Harap seluruh anggota hadir tepat waktu.',
     'Kegiatan', '2026-07-20'),

    ('Pendaftaran UMKM Warga',
     'Hubungi Sekretaris RT Bpk. Lukman untuk mendaftarkan usaha Anda secara gratis.',
     'Info', '2026-07-15');


-- ── KEGIATAN (2 mendatang) ────────────────────────────────────
INSERT INTO kegiatan (nama, tanggal, waktu, lokasi, peserta, kategori, status, deskripsi) VALUES
    ('Kerja Bakti Lingkungan',
     '2026-07-27', '07.00-12.00 WIB', 'Seluruh RT 04', 'Semua warga',
     'Rutin', 'Mendatang',
     'Bersih-bersih lingkungan RT bersama seluruh warga.'),

    ('Peringatan HUT RI ke-81',
     '2026-08-17', '07.00-22.00 WIB', 'Lapangan RT 04', 'Semua warga',
     'Spesial', 'Mendatang',
     'Upacara bendera, lomba tradisional, panjat pinang, dan malam hiburan.');


-- ── UMKM (3 contoh) ──────────────────────────────────────────
INSERT INTO umkm (nama_usaha, pemilik, no_rumah, kategori, deskripsi, kontak) VALUES
    ('Warung Bu Sari',          'Sari Mulyani',   'No. 7',  'Makanan & Minuman',
     'Nasi uduk, lontong sayur, gorengan. Buka 06.00-10.00.',   '0812-1111-2222'),
    ('Toko Sembako Pak Hendra', 'Hendra Wijaya',  'No. 8',  'Sembako',
     'Lengkap kebutuhan dapur sehari-hari. Buka 07.00-21.00.',  '0814-5555-6666'),
    ('Salon Nova',              'Nova Anggraini', 'No. 20', 'Jasa',
     'Potong rambut, creambath, rebonding, make-up. Menerima panggilan.', '0815-7777-8888');


-- ── RONDA (15 regu) ───────────────────────────────────────────
WITH ronda_insert AS (
    INSERT INTO ronda (nama_regu, hari, tanggal, shift) VALUES
        ('Regu 1',  'Rabu',   '2026-07-22', '22.00–04.00'),
        ('Regu 2',  'Kamis',  '2026-07-23', '22.00–04.00'),
        ('Regu 3',  'Jumat',  '2026-07-24', '22.00–04.00'),
        ('Regu 4',  'Sabtu',  '2026-07-25', '22.00–04.00'),
        ('Regu 5',  'Minggu', '2026-07-26', '22.00–04.00'),
        ('Regu 6',  'Senin',  '2026-07-27', '22.00–04.00'),
        ('Regu 7',  'Selasa', '2026-07-28', '22.00–04.00'),
        ('Regu 8',  'Rabu',   '2026-07-29', '22.00–04.00'),
        ('Regu 9',  'Kamis',  '2026-07-30', '22.00–04.00'),
        ('Regu 10', 'Jumat',  '2026-07-31', '22.00–04.00'),
        ('Regu 11', 'Sabtu',  '2026-08-01', '22.00–04.00'),
        ('Regu 12', 'Minggu', '2026-08-02', '22.00–04.00'),
        ('Regu 13', 'Senin',  '2026-08-03', '22.00–04.00'),
        ('Regu 14', 'Selasa', '2026-08-04', '22.00–04.00'),
        ('Regu 15', 'Rabu',   '2026-08-05', '22.00–04.00')
    RETURNING id, nama_regu
)
-- Anggota Regu 1 sebagai contoh
INSERT INTO ronda_anggota (ronda_id, nama, urutan)
SELECT r.id, a.nama, a.urutan
FROM ronda_insert r
CROSS JOIN (VALUES
    ('Bpk.Rt Novi Azis',          1),
    ('Bpk.Dambas Muhari',         2),
    ('Bpk.Suherman',              3),
    ('Bpk.Ismail Subana',         4),
    ('Bpk.Dedi Nur Rohmawan',     5),
    ('Sdr.Toni Andrian',          6)
) AS a(nama, urutan)
WHERE r.nama_regu = 'Regu 1';

-- Catatan: anggota regu 2-15 dapat di-insert dengan pola yang sama
-- atau diimpor via script Python/CSV setelah migrasi warga

-- ── SAMPLE WARGA (5 pertama sebagai contoh) ──────────────────
-- Untuk import lengkap ~235 warga, gunakan script import_warga.sql
-- atau tools pgAdmin/psql COPY dari CSV
INSERT INTO warga (no_kartu, nama, kontak) VALUES
    ('0000000001', 'ANGGI',         '089533007704'),
    ('0000000002', 'EKA',           '081218443309'),
    ('0000000003', 'LALA',          NULL),
    ('0000000004', 'JAMAL',         '081384492047'),
    ('0000000005', 'BERLIAN',       NULL);

-- Untuk import lengkap semua warga (~235 data), jalankan:
-- \i import_warga_lengkap.sql
