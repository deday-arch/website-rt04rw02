// ============================================================
//  iuran.routes.js — CRUD iuran bulanan warga
// ============================================================
'use strict';

const express = require('express');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/iuran?bulan=7&tahun=2026&search=&status=
router.get('/', async (req, res) => {
  const { bulan, tahun, search = '', status } = req.query;

  let sql = `
    SELECT ib.id, ib.warga_id, w.no_kartu, w.nama, w.kontak,
           ib.bulan, ib.tahun, ib.kebersihan, ib.keamanan, ib.total,
           ib.status, ib.tgl_bayar, ib.catatan
      FROM iuran_bulanan ib
      JOIN warga w ON w.id = ib.warga_id
     WHERE 1=1
  `;
  const params = [];
  let i = 1;

  if (bulan)  { sql += ` AND ib.bulan = $${i++}`;  params.push(parseInt(bulan)); }
  if (tahun)  { sql += ` AND ib.tahun = $${i++}`;  params.push(parseInt(tahun)); }
  if (status) { sql += ` AND ib.status = $${i++}`; params.push(status); }
  if (search) {
    sql += ` AND (w.nama ILIKE $${i} OR w.no_kartu ILIKE $${i})`;
    params.push(`%${search}%`); i++;
  }
  sql += ' ORDER BY w.no_kartu';

  try {
    const { rows } = await query(sql, params);
    res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    console.error('[iuran/GET]', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data iuran.' });
  }
});

// GET /api/iuran/ringkasan — statistik per bulan
router.get('/ringkasan', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM ringkasan_iuran_bulanan LIMIT 24');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil ringkasan.' });
  }
});

// GET /api/iuran/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT ib.*, w.no_kartu, w.nama, w.kontak
         FROM iuran_bulanan ib
         JOIN warga w ON w.id = ib.warga_id
        WHERE ib.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data.' });
  }
});

// POST /api/iuran
router.post('/', requireAuth, async (req, res) => {
  const { warga_id, bulan, tahun, kebersihan = 30000, keamanan = 20000, status = 'Belum Bayar', tgl_bayar, catatan } = req.body;
  if (!warga_id || !bulan || !tahun) {
    return res.status(400).json({ success: false, message: 'warga_id, bulan, dan tahun wajib diisi.' });
  }
  try {
    const { rows } = await query(
      `INSERT INTO iuran_bulanan
         (warga_id, bulan, tahun, kebersihan, keamanan, status, tgl_bayar, catatan, dicatat_oleh)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [warga_id, bulan, tahun, kebersihan, keamanan, status, tgl_bayar || null, catatan || null, req.admin.id]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Data iuran warga untuk bulan ini sudah ada.' });
    }
    console.error('[iuran/POST]', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan data.' });
  }
});

// PUT /api/iuran/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { kebersihan, keamanan, status, tgl_bayar, catatan } = req.body;
  try {
    const { rows } = await query(
      `UPDATE iuran_bulanan
          SET kebersihan  = COALESCE($1, kebersihan),
              keamanan    = COALESCE($2, keamanan),
              status      = COALESCE($3, status),
              tgl_bayar   = $4,
              catatan     = $5,
              dicatat_oleh = $6
        WHERE id = $7
        RETURNING *`,
      [kebersihan, keamanan, status, tgl_bayar || null, catatan || null, req.admin.id, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[iuran/PUT]', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data.' });
  }
});

// DELETE /api/iuran/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM iuran_bulanan WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    res.json({ success: true, message: 'Data iuran dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus data.' });
  }
});

module.exports = router;
