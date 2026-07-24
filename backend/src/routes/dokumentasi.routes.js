// ============================================================
//  dokumentasi.routes.js — CRUD foto/video per periode bulanan
// ============================================================
'use strict';

const express = require('express');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// ── Validasi base64 (foto max 5MB, video tidak disimpan blob) ─
function validateMedia(b64, tipe) {
  if (!b64) return null;
  const pattern = tipe === 'video'
    ? /^data:(video\/(mp4|webm));base64,(.+)$/i
    : /^data:(image\/(jpeg|jpg|png|webp));base64,(.+)$/i;
  const m = b64.match(pattern);
  if (!m) return null;
  const maxBytes = tipe === 'video' ? 52_000_000 : 7_000_000; // video max ~40MB
  if (b64.length > maxBytes) return null;
  return { mime: m[1], data: b64 };
}

// GET /api/dokumentasi?bulan=&tahun=&tipe=&search= (publik)
router.get('/', async (req, res) => {
  const { bulan, tahun, tipe, search = '' } = req.query;
  let sql = `
    SELECT id, judul, deskripsi, tipe, media_mime, video_url,
           bulan, tahun, aktif, created_at,
           CASE WHEN media_data IS NOT NULL THEN true ELSE false END AS ada_media
      FROM dokumentasi
     WHERE aktif = true
  `;
  const p = []; let i = 1;
  if (bulan)  { sql += ` AND bulan = $${i++}`;          p.push(+bulan); }
  if (tahun)  { sql += ` AND tahun = $${i++}`;          p.push(+tahun); }
  if (tipe)   { sql += ` AND tipe  = $${i++}`;          p.push(tipe); }
  if (search) { sql += ` AND judul ILIKE $${i++}`;      p.push(`%${search}%`); }
  sql += ' ORDER BY tahun DESC, bulan DESC, created_at DESC';
  try {
    const { rows } = await query(sql, p);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[dok/GET]', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil dokumentasi.' });
  }
});

// GET /api/dokumentasi/periode — daftar bulan/tahun yang punya data (publik)
router.get('/periode', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT tahun, bulan,
             COUNT(*)::INT            AS total,
             COUNT(*) FILTER (WHERE tipe='foto')::INT  AS total_foto,
             COUNT(*) FILTER (WHERE tipe='video')::INT AS total_video
        FROM dokumentasi WHERE aktif = true
       GROUP BY tahun, bulan
       ORDER BY tahun DESC, bulan DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil periode.' });
  }
});

// GET /api/dokumentasi/admin — semua termasuk tidak aktif (admin)
router.get('/admin', requireAuth, async (req, res) => {
  const { bulan, tahun, tipe, search = '' } = req.query;
  let sql = `
    SELECT id, judul, deskripsi, tipe, media_mime, video_url,
           bulan, tahun, aktif, created_at,
           CASE WHEN media_data IS NOT NULL THEN true ELSE false END AS ada_media
      FROM dokumentasi WHERE 1=1
  `;
  const p = []; let i = 1;
  if (bulan)  { sql += ` AND bulan = $${i++}`;     p.push(+bulan); }
  if (tahun)  { sql += ` AND tahun = $${i++}`;     p.push(+tahun); }
  if (tipe)   { sql += ` AND tipe  = $${i++}`;     p.push(tipe); }
  if (search) { sql += ` AND judul ILIKE $${i++}`; p.push(`%${search}%`); }
  sql += ' ORDER BY tahun DESC, bulan DESC, created_at DESC';
  try {
    const { rows } = await query(sql, p);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil dokumentasi.' });
  }
});

// GET /api/dokumentasi/:id/media — stream gambar atau video
router.get('/:id/media', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT media_data, media_mime FROM dokumentasi WHERE id = $1', [req.params.id]
    );
    if (!rows.length || !rows[0].media_data)
      return res.status(404).json({ success: false, message: 'Media tidak ditemukan.' });
    const raw = rows[0].media_data.replace(/^data:[^;]+;base64,/, '');
    const buf = Buffer.from(raw, 'base64');
    res.set('Content-Type', rows[0].media_mime || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buf);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil media.' });
  }
});

// POST /api/dokumentasi (admin)
router.post('/', requireAuth, async (req, res) => {
  const { judul, deskripsi, tipe = 'foto', media_data, video_url, bulan, tahun } = req.body;
  if (!judul)  return res.status(400).json({ success: false, message: 'Judul wajib diisi.' });
  if (!bulan || !tahun) return res.status(400).json({ success: false, message: 'Bulan dan tahun wajib diisi.' });

  let md = null, mm = null;
  if (tipe === 'foto' && media_data) {
    const v = validateMedia(media_data, 'foto');
    if (!v) return res.status(400).json({ success: false, message: 'Foto tidak valid (maks 5MB, JPEG/PNG/WEBP).' });
    md = v.data; mm = v.mime;
  }
  if (tipe === 'video' && media_data) {
    const v = validateMedia(media_data, 'video');
    if (v) { md = v.data; mm = v.mime; }
  }

  try {
    const { rows } = await query(
      `INSERT INTO dokumentasi (judul, deskripsi, tipe, media_data, media_mime, video_url, bulan, tahun, dibuat_oleh)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, judul, tipe, bulan, tahun, aktif, created_at,
                 CASE WHEN media_data IS NOT NULL THEN true ELSE false END AS ada_media`,
      [judul.trim(), deskripsi||null, tipe, md, mm, video_url||null, +bulan, +tahun, req.admin.id]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[dok/POST]', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan dokumentasi.' });
  }
});

// PUT /api/dokumentasi/:id (admin)
router.put('/:id', requireAuth, async (req, res) => {
  const { judul, deskripsi, tipe, media_data, video_url, bulan, tahun, aktif } = req.body;
  let md = undefined, mm = undefined;
  if (media_data) {
    const v = validateMedia(media_data, tipe || 'foto');
    if (v) { md = v.data; mm = v.mime; }
  }
  try {
    const setMedia = md !== undefined
      ? `, media_data = $8, media_mime = $9`
      : '';
    const baseParams = [
      judul||null, deskripsi||null, tipe||null, video_url||null,
      bulan ? +bulan : null, tahun ? +tahun : null, aktif,
    ];
    const allParams = md !== undefined
      ? [...baseParams, md, mm, req.params.id]
      : [...baseParams, req.params.id];
    const idIndex = allParams.length;

    const { rows } = await query(
      `UPDATE dokumentasi SET
         judul      = COALESCE($1, judul),
         deskripsi  = COALESCE($2, deskripsi),
         tipe       = COALESCE($3, tipe),
         video_url  = $4,
         bulan      = COALESCE($5, bulan),
         tahun      = COALESCE($6, tahun),
         aktif      = COALESCE($7, aktif)
         ${setMedia}
       WHERE id = $${idIndex}
       RETURNING id, judul, tipe, bulan, tahun, aktif, updated_at,
                 CASE WHEN media_data IS NOT NULL THEN true ELSE false END AS ada_media`,
      allParams
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Dokumentasi tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[dok/PUT]', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui dokumentasi.' });
  }
});

// DELETE /api/dokumentasi/:id (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM dokumentasi WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Dokumentasi tidak ditemukan.' });
    res.json({ success: true, message: 'Dokumentasi dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus dokumentasi.' });
  }
});

module.exports = router;
