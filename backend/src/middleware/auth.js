// ============================================================
//  auth.js — Middleware autentikasi JWT
// ============================================================
'use strict';

const jwt = require('jsonwebtoken');

/**
 * Middleware: verifikasi JWT dari header Authorization: Bearer <token>
 * Jika valid, menyuntikkan payload ke req.admin
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak ditemukan. Silakan login terlebih dahulu.',
    });
  }

  const token = authHeader.slice(7); // hapus "Bearer "

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload; // { id, username, role, iat, exp }
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Sesi telah berakhir, silakan login kembali.'
        : 'Token tidak valid.';
    return res.status(401).json({ success: false, message });
  }
}

/**
 * Middleware: hanya izinkan role tertentu.
 * Gunakan setelah requireAuth.
 * @param {...string} roles - role yang diizinkan, mis: 'superadmin', 'admin'
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk aksi ini.',
      });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
