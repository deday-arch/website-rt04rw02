// ============================================================
//  kegiatan.routes.js — CRUD kegiatan RT
// ============================================================
'use strict';

const express = require('express');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/kegiatan?search=&status=&kategori= (publik)
router.get('/', async (req, res) => {
  const { search = '', status, kategori } = req.query;
  let sql = `SELECT id, nama, tanggal, waktu, lokasi, peserta, kategori, status, deskripsi, gambar_url
               FROM kegiatan WHERE 1=1`;
  const params = [];
  let i = 1;
  if (search)   { sql += ` AND (nama ILIKE $${i} OR lokasi ILIKE $${i})`; params.push(`%${search}%`); i++; }
  if (status)   { sql += ` AND status = $${i++}`;   params.push(status); }
  if (kategori) { sql += ` AND kategori = $${i++}`; params.push(kategori); }
  sql += ' ORDER BY tanggal DESC';

  try {
    const { rows } = await query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data kegiatan.' });
  }
});

// GET /api/kegiatan/:id (publik)
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM kegiatan WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data.' });
  }
});

// POST /api/kegiatan (admin)
router.post('/', requireAuth, async (req, res) => {
  const { nama, tanggal, waktu, lokasi, peserta, kategori = 'Rutin', status = 'Mendatang', deskripsi, gambar_url } = req.body;
  if (!nama || !tanggal) {
    return res.status(400).json({ success: false, message: 'Nama dan tanggal wajib diisi.' });
  }
  try {
    const { rows } = await query(
      `INSERT INTO kegiatan (nama, tanggal, waktu, lokasi, peserta, kategori, status, deskripsi, gambar_url, dibuat_oleh)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [nama.trim(), tanggal, waktu||null, lokasi||null, peserta||null, kategori, status, deskripsi||null, gambar_url||null, req.admin.id]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[kegiatan/POST]', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan kegiatan.' });
  }
});

// PUT /api/kegiatan/:id (admin)
router.put('/:id', requireAuth, async (req, res) => {
  const { nama, tanggal, waktu, lokasi, peserta, kategori, status, deskripsi, gambar_url } = req.body;
  try {
    const { rows } = await query(
      `UPDATE kegiatan
          SET nama       = COALESCE($1, nama),
              tanggal    = COALESCE($2, tanggal),
              waktu      = $3,
              lokasi     = $4,
              peserta    = $5,
              kategori   = COALESCE($6, kategori),
              status     = COALESCE($7, status),
              deskripsi  = $8,
              gambar_url = $9
        WHERE id = $10 RETURNING *`,
      [nama, tanggal, waktu||null, lokasi||null, peserta||null, kategori, status, deskripsi||null, gambar_url||null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui kegiatan.' });
  }
});

// DELETE /api/kegiatan/:id (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM kegiatan WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan.' });
    res.json({ success: true, message: 'Kegiatan dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus kegiatan.' });
  }
});

module.exports = router;
