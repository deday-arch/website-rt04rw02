// ============================================================
//  auth.routes.js — Login & logout admin
// ============================================================
'use strict';

const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
  }

  try {
    const { rows } = await query(
      'SELECT id, username, password_hash, role, nama_lengkap FROM admin_users WHERE username = $1 AND aktif = TRUE',
      [username]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    // Update last_login
    await query('UPDATE admin_users SET last_login = NOW() WHERE id = $1', [admin.id]);

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id:          admin.id,
        username:    admin.username,
        role:        admin.role,
        nama_lengkap: admin.nama_lengkap,
      },
    });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/auth/me — cek sesi aktif
router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// POST /api/auth/logout — invalidasi sisi client (token tidak di-blacklist di sini)
router.post('/logout', requireAuth, (req, res) => {
  res.json({ success: true, message: 'Logout berhasil.' });
});

module.exports = router;
