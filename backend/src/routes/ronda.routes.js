// ============================================================
//  ronda.routes.js — CRUD jadwal ronda malam
// ============================================================
'use strict';

const express = require('express');
const { query, transaction } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/ronda (publik) — ronda lengkap dengan anggota
router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM jadwal_ronda_lengkap');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil jadwal ronda.' });
  }
});

// GET /api/ronda/:id (publik)
router.get('/:id', async (req, res) => {
  try {
    const ronda = await query('SELECT * FROM ronda WHERE id = $1', [req.params.id]);
    if (!ronda.rows.length) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });
    const anggota = await query(
      'SELECT id, nama, urutan FROM ronda_anggota WHERE ronda_id = $1 ORDER BY urutan',
      [req.params.id]
    );
    res.json({ success: true, data: { ...ronda.rows[0], anggota: anggota.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data.' });
  }
});

// POST /api/ronda (admin) — buat regu + anggota sekaligus
router.post('/', requireAuth, async (req, res) => {
  const { nama_regu, hari, tanggal, shift = '22.00–04.00', anggota = [] } = req.body;
  if (!nama_regu || !anggota.length) {
    return res.status(400).json({ success: false, message: 'nama_regu dan anggota wajib diisi.' });
  }
  try {
    const result = await transaction(async (client) => {
      const r = await client.query(
        'INSERT INTO ronda (nama_regu, hari, tanggal, shift) VALUES ($1,$2,$3,$4) RETURNING *',
        [nama_regu.trim(), hari||null, tanggal||null, shift]
      );
      const rondaId = r.rows[0].id;

      for (let idx = 0; idx < anggota.length; idx++) {
        const nm = typeof anggota[idx] === 'string' ? anggota[idx] : anggota[idx].nama;
        await client.query(
          'INSERT INTO ronda_anggota (ronda_id, nama, urutan) VALUES ($1,$2,$3)',
          [rondaId, nm.trim(), idx + 1]
        );
      }
      return r.rows[0];
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error('[ronda/POST]', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan jadwal ronda.' });
  }
});

// PUT /api/ronda/:id (admin)
router.put('/:id', requireAuth, async (req, res) => {
  const { nama_regu, hari, tanggal, shift, anggota } = req.body;
  try {
    const result = await transaction(async (client) => {
      const r = await client.query(
        `UPDATE ronda
            SET nama_regu = COALESCE($1, nama_regu),
                hari      = $2,
                tanggal   = $3,
                shift     = COALESCE($4, shift)
          WHERE id = $5 RETURNING *`,
        [nama_regu, hari||null, tanggal||null, shift, req.params.id]
      );
      if (!r.rows.length) throw new Error('NOT_FOUND');

      // Ganti anggota jika dikirim
      if (Array.isArray(anggota)) {
        await client.query('DELETE FROM ronda_anggota WHERE ronda_id = $1', [req.params.id]);
        for (let idx = 0; idx < anggota.length; idx++) {
          const nm = typeof anggota[idx] === 'string' ? anggota[idx] : anggota[idx].nama;
          await client.query(
            'INSERT INTO ronda_anggota (ronda_id, nama, urutan) VALUES ($1,$2,$3)',
            [req.params.id, nm.trim(), idx + 1]
          );
        }
      }
      return r.rows[0];
    });
    res.json({ success: true, data: result });
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });
    console.error('[ronda/PUT]', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui jadwal.' });
  }
});

// DELETE /api/ronda/:id (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // ronda_anggota akan cascade-delete
    const { rowCount } = await query('DELETE FROM ronda WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });
    res.json({ success: true, message: 'Jadwal ronda dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus jadwal.' });
  }
});

module.exports = router;
