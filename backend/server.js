// ============================================================
//  server.js — Entry point Backend RT 04 / RW 02
//  Express + PostgreSQL (Azure) + JWT
// ============================================================
'use strict';

require('dotenv').config();

const express     = require('express');
const helmet      = require('helmet');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');
const path        = require('path');
const { ping }    = require('./src/config/db');

// ── Routes ───────────────────────────────────────────────────
const authRoutes       = require('./src/routes/auth.routes');
const wargaRoutes      = require('./src/routes/warga.routes');
const iuranRoutes      = require('./src/routes/iuran.routes');
const pengumumanRoutes = require('./src/routes/pengumuman.routes');
const kegiatanRoutes   = require('./src/routes/kegiatan.routes');
const umkmRoutes       = require('./src/routes/umkm.routes');
const pengurusRoutes   = require('./src/routes/pengurus.routes');
const rondaRoutes      = require('./src/routes/ronda.routes');
const laporanRoutes      = require('./src/routes/laporan.routes');
const dokumentasiRoutes  = require('./src/routes/dokumentasi.routes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security headers ─────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // dinonaktifkan agar CDN font-awesome bisa load
}));

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Izinkan request tanpa origin (mis. Postman, curl) di development
    if (!origin || process.env.NODE_ENV === 'development') return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin '${origin}' tidak diizinkan.`));
  },
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body parser ───────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));  // 50mb untuk foto/video base64
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX, 10)      || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Terlalu banyak permintaan. Coba lagi nanti.' },
});
app.use('/api/', limiter);

// ── Static files: sajikan folder website HTML ─────────────────
const FRONTEND_DIR = path.join(__dirname, '..'); // folder website-rt04rw02-main
app.use(express.static(FRONTEND_DIR));

// ── Health check ─────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const db = await ping();
  res.status(db.ok ? 200 : 503).json({
    status:      db.ok ? 'ok' : 'degraded',
    service:     'RT04RW02 API',
    version:     '1.0.0',
    environment: process.env.NODE_ENV,
    database:    db,
    timestamp:   new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/warga',      wargaRoutes);
app.use('/api/iuran',      iuranRoutes);
app.use('/api/pengumuman', pengumumanRoutes);
app.use('/api/kegiatan',   kegiatanRoutes);
app.use('/api/umkm',       umkmRoutes);
app.use('/api/pengurus',   pengurusRoutes);
app.use('/api/ronda',      rondaRoutes);
app.use('/api/laporan',      laporanRoutes);
app.use('/api/dokumentasi',  dokumentasiRoutes);

// ── 404 handler (API only) ────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Endpoint '${req.method} ${req.path}' tidak ditemukan.` });
});

// ── Fallback: semua route non-API → index.html ────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[SERVER ERROR]', err.message);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan pada server.'
      : err.message,
  });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🏠  RT 04 / RW 02 API Server`);
  console.log(`    Mode  : ${process.env.NODE_ENV || 'development'}`);
  console.log(`    Port  : ${PORT}`);
  console.log(`    Docs  : http://localhost:${PORT}/health\n`);

  const db = await ping();
  if (db.ok) {
    console.log(`✅  Database PostgreSQL (Azure) terhubung — ${db.server_time}`);
  } else {
    console.error(`❌  Database GAGAL terhubung: ${db.error}`);
    console.error('    Periksa konfigurasi .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)');
  }
});

module.exports = app;
