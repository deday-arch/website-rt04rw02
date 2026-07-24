// ============================================================
//  pengumuman.routes.js — CRUD pengumuman RT
// ============================================================
'use strict';

const express = require('express');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/pengumuman?search=&kategori=&limit=10 (publik)
router.get('/', async (req, res) => {
  const { search = '', kategori, limit = 20 } = req.query;
  let sql = `SELECT id, judul, isi, kategori, tanggal FROM pengumuman WHERE aktif = TRUE`;
  const params = [];
  let i = 1;
  if (search)   { sql += ` AND (judul ILIKE $${i} OR isi ILIKE $${i})`; params.push(`%${search}%`); i++; }
  if (kategori) { sql += ` AND kategori = $${i++}`; params.push(kategori); }
  sql += ` ORDER BY tanggal DESC LIMIT $${i}`;
  params.push(parseInt(limit));

  try {
    const { rows } = await query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil pengumuman.' });
  }
});

// GET /api/pengumuman/:id (publik)
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM pengumuman WHERE id = $1 AND aktif = TRUE', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data.' });
  }
});

// POST /api/pengumuman (admin)
router.post('/', requireAuth, async (req, res) => {
  const { judul, isi, kategori = 'Info', tanggal } = req.body;
  if (!judul || !isi) {
    return res.status(400).json({ success: false, message: 'Judul dan isi wajib diisi.' });
  }
  try {
    const { rows } = await query(
      `INSERT INTO pengumuman (judul, isi, kategori, tanggal, dibuat_oleh)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [judul.trim(), isi.trim(), kategori, tanggal || new Date().toISOString().slice(0, 10), req.admin.id]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[pengumuman/POST]', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan pengumuman.' });
  }
});

// PUT /api/pengumuman/:id (admin)
router.put('/:id', requireAuth, async (req, res) => {
  const { judul, isi, kategori, tanggal, aktif } = req.body;
  try {
    const { rows } = await query(
      `UPDATE pengumuman
          SET judul    = COALESCE($1, judul),
              isi      = COALESCE($2, isi),
              kategori = COALESCE($3, kategori),
              tanggal  = COALESCE($4, tanggal),
              aktif    = COALESCE($5, aktif)
        WHERE id = $6 RETURNING *`,
      [judul, isi, kategori, tanggal, aktif, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui pengumuman.' });
  }
});

// DELETE /api/pengumuman/:id (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM pengumuman WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan.' });
    res.json({ success: true, message: 'Pengumuman dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus pengumuman.' });
  }
});

module.exports = router;
