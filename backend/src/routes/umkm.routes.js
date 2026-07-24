// ============================================================
//  umkm.routes.js — CRUD UMKM warga
// ============================================================
'use strict';

const express = require('express');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/umkm?search=&kategori= (publik)
router.get('/', async (req, res) => {
  const { search = '', kategori } = req.query;
  let sql = `SELECT id, nama_usaha, pemilik, no_rumah, kategori, deskripsi, kontak, gambar_url
               FROM umkm WHERE aktif = TRUE`;
  const params = [];
  let i = 1;
  if (search)   { sql += ` AND (nama_usaha ILIKE $${i} OR pemilik ILIKE $${i} OR kategori ILIKE $${i})`; params.push(`%${search}%`); i++; }
  if (kategori) { sql += ` AND kategori = $${i++}`; params.push(kategori); }
  sql += ' ORDER BY created_at DESC';

  try {
    const { rows } = await query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data UMKM.' });
  }
});

// GET /api/umkm/:id (publik)
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM umkm WHERE id = $1 AND aktif = TRUE', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data.' });
  }
});

// POST /api/umkm (admin)
router.post('/', requireAuth, async (req, res) => {
  const { nama_usaha, pemilik, warga_id, no_rumah, kategori = 'Lainnya', deskripsi, kontak, gambar_url } = req.body;
  if (!nama_usaha || !pemilik) {
    return res.status(400).json({ success: false, message: 'nama_usaha dan pemilik wajib diisi.' });
  }
  try {
    const { rows } = await query(
      `INSERT INTO umkm (nama_usaha, pemilik, warga_id, no_rumah, kategori, deskripsi, kontak, gambar_url, dibuat_oleh)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [nama_usaha.trim(), pemilik.trim(), warga_id||null, no_rumah||null, kategori, deskripsi||null, kontak||null, gambar_url||null, req.admin.id]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[umkm/POST]', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan UMKM.' });
  }
});

// PUT /api/umkm/:id (admin)
router.put('/:id', requireAuth, async (req, res) => {
  const { nama_usaha, pemilik, no_rumah, kategori, deskripsi, kontak, gambar_url, aktif } = req.body;
  try {
    const { rows } = await query(
      `UPDATE umkm
          SET nama_usaha = COALESCE($1, nama_usaha),
              pemilik    = COALESCE($2, pemilik),
              no_rumah   = $3,
              kategori   = COALESCE($4, kategori),
              deskripsi  = $5,
              kontak     = $6,
              gambar_url = $7,
              aktif      = COALESCE($8, aktif)
        WHERE id = $9 RETURNING *`,
      [nama_usaha, pemilik, no_rumah||null, kategori, deskripsi||null, kontak||null, gambar_url||null, aktif, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui UMKM.' });
  }
});

// DELETE /api/umkm/:id (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM umkm WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan.' });
    res.json({ success: true, message: 'UMKM dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus UMKM.' });
  }
});

module.exports = router;
