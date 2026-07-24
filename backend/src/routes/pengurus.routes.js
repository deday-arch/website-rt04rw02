// ============================================================
//  pengurus.routes.js — CRUD pengurus RT
// ============================================================
'use strict';

const express = require('express');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/pengurus (publik)
router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, nama, jabatan, kontak, ikon_css, warna_hex, foto_url, urutan
         FROM pengurus WHERE aktif = TRUE ORDER BY urutan`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data pengurus.' });
  }
});

// POST /api/pengurus (admin)
router.post('/', requireAuth, async (req, res) => {
  const { nama, jabatan, kontak, alamat, ikon_css = 'fa-user', warna_hex = '#1565c0', foto_url, urutan = 99 } = req.body;
  if (!nama || !jabatan) {
    return res.status(400).json({ success: false, message: 'Nama dan jabatan wajib diisi.' });
  }
  try {
    const { rows } = await query(
      `INSERT INTO pengurus (nama, jabatan, kontak, alamat, ikon_css, warna_hex, foto_url, urutan)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [nama.trim(), jabatan.trim(), kontak||null, alamat||null, ikon_css, warna_hex, foto_url||null, urutan]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[pengurus/POST]', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan pengurus.' });
  }
});

// PUT /api/pengurus/:id (admin)
router.put('/:id', requireAuth, async (req, res) => {
  const { nama, jabatan, kontak, alamat, ikon_css, warna_hex, foto_url, urutan, aktif } = req.body;
  try {
    const { rows } = await query(
      `UPDATE pengurus
          SET nama      = COALESCE($1, nama),
              jabatan   = COALESCE($2, jabatan),
              kontak    = $3,
              alamat    = $4,
              ikon_css  = COALESCE($5, ikon_css),
              warna_hex = COALESCE($6, warna_hex),
              foto_url  = $7,
              urutan    = COALESCE($8, urutan),
              aktif     = COALESCE($9, aktif)
        WHERE id = $10 RETURNING *`,
      [nama, jabatan, kontak||null, alamat||null, ikon_css, warna_hex, foto_url||null, urutan, aktif, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Pengurus tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui pengurus.' });
  }
});

// DELETE /api/pengurus/:id (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM pengurus WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Pengurus tidak ditemukan.' });
    res.json({ success: true, message: 'Pengurus dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus pengurus.' });
  }
});

module.exports = router;
