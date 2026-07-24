// ============================================================
//  warga.routes.js — CRUD master data warga
// ============================================================
'use strict';

const express = require('express');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/warga?search=&page=1&limit=50
router.get('/', requireAuth, async (req, res) => {
  const { search = '', page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const like   = `%${search}%`;

  try {
    const { rows } = await query(
      `SELECT id, no_kartu, nama, kontak, alamat, aktif, keterangan, created_at
         FROM warga
        WHERE (nama ILIKE $1 OR no_kartu ILIKE $1)
        ORDER BY no_kartu
        LIMIT $2 OFFSET $3`,
      [like, parseInt(limit), offset]
    );
    const total = await query(
      'SELECT COUNT(*) FROM warga WHERE (nama ILIKE $1 OR no_kartu ILIKE $1)',
      [like]
    );
    res.json({ success: true, data: rows, total: parseInt(total.rows[0].count) });
  } catch (err) {
    console.error('[warga/GET]', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data warga.' });
  }
});

// GET /api/warga/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM warga WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Warga tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data.' });
  }
});

// POST /api/warga
router.post('/', requireAuth, async (req, res) => {
  const { no_kartu, nama, kontak, alamat, keterangan } = req.body;
  if (!no_kartu || !nama) {
    return res.status(400).json({ success: false, message: 'no_kartu dan nama wajib diisi.' });
  }
  try {
    const { rows } = await query(
      `INSERT INTO warga (no_kartu, nama, kontak, alamat, keterangan)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [no_kartu.trim(), nama.trim(), kontak || null, alamat || null, keterangan || null]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'No. kartu sudah terdaftar.' });
    }
    console.error('[warga/POST]', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan data.' });
  }
});

// PUT /api/warga/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { no_kartu, nama, kontak, alamat, aktif, keterangan } = req.body;
  try {
    const { rows } = await query(
      `UPDATE warga
          SET no_kartu   = COALESCE($1, no_kartu),
              nama       = COALESCE($2, nama),
              kontak     = $3,
              alamat     = $4,
              aktif      = COALESCE($5, aktif),
              keterangan = $6
        WHERE id = $7
        RETURNING *`,
      [no_kartu, nama, kontak || null, alamat || null, aktif, keterangan || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Warga tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[warga/PUT]', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data.' });
  }
});

// DELETE /api/warga/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM warga WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Warga tidak ditemukan.' });
    res.json({ success: true, message: 'Data warga dihapus.' });
  } catch (err) {
    console.error('[warga/DELETE]', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus data.' });
  }
});

module.exports = router;
