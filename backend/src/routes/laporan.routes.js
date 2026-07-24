// ============================================================
//  laporan.routes.js — CRUD laporan kejadian + foto + GPS
// ============================================================
'use strict';

const express = require('express');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// ── Validasi base64 foto (max 5MB) ───────────────────────────
function validateFoto(b64) {
  if (!b64) return null;
  const m = b64.match(/^data:(image\/(jpeg|jpg|png|webp));base64,(.+)$/i);
  if (!m) return null;
  if (b64.length > 7_000_000) return null; // ~5MB
  return { mime: m[1], data: b64 };
}

// ── kolom aman untuk list (tanpa blob foto) ──────────────────
const LIST_COLS = `
  id, nama_pelapor, no_rumah, no_hp, jenis, lokasi, lokasi_gps, lat, lng,
  deskripsi, urgensi, status, catatan_admin, foto_mime,
  CASE WHEN foto_data IS NOT NULL THEN true ELSE false END AS ada_foto,
  diproses_oleh, tgl_diproses, tgl_selesai,
  created_at, updated_at,
  EXTRACT(MONTH FROM created_at)::INT AS bulan,
  EXTRACT(YEAR  FROM created_at)::INT AS tahun
`;

// GET /api/laporan?status=&urgensi=&bulan=&tahun=&search=
router.get('/', requireAuth, async (req, res) => {
  const { status, urgensi, bulan, tahun, search = '' } = req.query;
  let sql = `SELECT ${LIST_COLS} FROM laporan_kejadian WHERE 1=1`;
  const p = []; let i = 1;
  if (status)  { sql += ` AND status  = $${i++}`; p.push(status); }
  if (urgensi) { sql += ` AND urgensi = $${i++}`; p.push(urgensi); }
  if (bulan)   { sql += ` AND EXTRACT(MONTH FROM created_at) = $${i++}`; p.push(+bulan); }
  if (tahun)   { sql += ` AND EXTRACT(YEAR  FROM created_at) = $${i++}`; p.push(+tahun); }
  if (search)  {
    sql += ` AND (nama_pelapor ILIKE $${i} OR lokasi ILIKE $${i} OR jenis::TEXT ILIKE $${i})`;
    p.push(`%${search}%`); i++;
  }
  sql += ' ORDER BY created_at DESC';
  try {
    const { rows } = await query(sql, p);
    res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    console.error('[laporan/GET]', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil laporan.' });
  }
});

// GET /api/laporan/publik (publik — tanpa blob)
router.get('/publik', async (req, res) => {
  const { bulan, tahun } = req.query;
  let sql = `SELECT ${LIST_COLS} FROM laporan_kejadian WHERE 1=1`;
  const p = []; let i = 1;
  if (bulan) { sql += ` AND EXTRACT(MONTH FROM created_at) = $${i++}`; p.push(+bulan); }
  if (tahun) { sql += ` AND EXTRACT(YEAR  FROM created_at) = $${i++}`; p.push(+tahun); }
  sql += ' ORDER BY created_at DESC LIMIT 20';
  try {
    const { rows } = await query(sql, p);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil laporan.' });
  }
});

// GET /api/laporan/periode — daftar tahun+bulan yang punya data (publik)
router.get('/periode', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT EXTRACT(YEAR FROM created_at)::INT  AS tahun,
             EXTRACT(MONTH FROM created_at)::INT AS bulan,
             COUNT(*)::INT AS total
        FROM laporan_kejadian
       GROUP BY tahun, bulan
       ORDER BY tahun DESC, bulan DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil periode.' });
  }
});

// GET /api/laporan/:id (admin — detail penuh)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT *, CASE WHEN foto_data IS NOT NULL THEN true ELSE false END AS ada_foto
         FROM laporan_kejadian WHERE id = $1`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil laporan.' });
  }
});

// GET /api/laporan/:id/foto — stream gambar langsung
router.get('/:id/foto', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT foto_data, foto_mime FROM laporan_kejadian WHERE id = $1', [req.params.id]
    );
    if (!rows.length || !rows[0].foto_data)
      return res.status(404).json({ success: false, message: 'Foto tidak ada.' });
    const raw = rows[0].foto_data.replace(/^data:image\/\w+;base64,/, '');
    const buf = Buffer.from(raw, 'base64');
    res.set('Content-Type', rows[0].foto_mime || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buf);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil foto.' });
  }
});

// POST /api/laporan (publik)
router.post('/', async (req, res) => {
  const { nama_pelapor, no_rumah, no_hp, jenis = 'Lainnya',
          lokasi, deskripsi, urgensi = 'Normal',
          foto_data, lat, lng, lokasi_gps } = req.body;

  if (!nama_pelapor || !lokasi || !deskripsi)
    return res.status(400).json({ success: false, message: 'nama_pelapor, lokasi, dan deskripsi wajib diisi.' });

  let fd = null, fm = null;
  if (foto_data) {
    const v = validateFoto(foto_data);
    if (!v) return res.status(400).json({ success: false, message: 'Foto tidak valid (maks 5MB, format JPEG/PNG/WEBP).' });
    fd = v.data; fm = v.mime;
  }

  try {
    const { rows } = await query(
      `INSERT INTO laporan_kejadian
         (nama_pelapor, no_rumah, no_hp, jenis, lokasi, deskripsi, urgensi,
          foto_data, foto_mime, lat, lng, lokasi_gps)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id, jenis, lokasi, urgensi, status,
         CASE WHEN foto_data IS NOT NULL THEN true ELSE false END AS ada_foto,
         created_at`,
      [nama_pelapor.trim(), no_rumah||null, no_hp||null, jenis,
       lokasi.trim(), deskripsi.trim(), urgensi,
       fd, fm, lat||null, lng||null, lokasi_gps||null]
    );
    res.status(201).json({
      success: true,
      message: 'Laporan berhasil dikirim. Pengurus RT akan segera menindaklanjuti.',
      data: rows[0],
    });
  } catch (err) {
    console.error('[laporan/POST]', err);
    res.status(500).json({ success: false, message: 'Gagal mengirim laporan.' });
  }
});

// PUT /api/laporan/:id (admin — update status + catatan)
router.put('/:id', requireAuth, async (req, res) => {
  const { status, catatan_admin } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'status wajib diisi.' });
  try {
    const { rows } = await query(
      `UPDATE laporan_kejadian
          SET status        = $1,
              catatan_admin = COALESCE($2, catatan_admin),
              diproses_oleh = $3,
              tgl_diproses  = CASE WHEN $1 = 'Diproses' AND tgl_diproses IS NULL THEN NOW() ELSE tgl_diproses END,
              tgl_selesai   = CASE WHEN $1 = 'Selesai'  AND tgl_selesai  IS NULL THEN NOW() ELSE tgl_selesai  END
        WHERE id = $4
        RETURNING id, status, catatan_admin, tgl_diproses, tgl_selesai`,
      [status, catatan_admin||null, req.admin.id, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[laporan/PUT]', err);
    res.status(500).json({ success: false, message: 'Gagal update laporan.' });
  }
});

// DELETE /api/laporan/:id (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM laporan_kejadian WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan.' });
    res.json({ success: true, message: 'Laporan dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus laporan.' });
  }
});

module.exports = router;
