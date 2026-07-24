// ============================================================
//  db.js — PostgreSQL Connection Pool
//  Supabase PostgreSQL dengan keepalive + reconnect handling
// ============================================================
'use strict';

const { Pool } = require('pg');
require('dotenv').config();

// Force IPv4 — hindari masalah DNS IPv6 pada Supabase pooler
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// ── Konfigurasi pool ─────────────────────────────────────────
const poolConfig = {
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT, 10)  || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  min:      parseInt(process.env.DB_POOL_MIN, 10) || 1,
  max:      parseInt(process.env.DB_POOL_MAX, 10) || 5,
  idleTimeoutMillis:       parseInt(process.env.DB_IDLE_TIMEOUT, 10)        || 10000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10)  || 15000,
  // Keepalive agar koneksi tidak di-drop Supabase saat idle
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// Supabase wajib SSL
if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

// ── Buat pool ────────────────────────────────────────────────
const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  // Jangan crash server saat koneksi idle terputus (ECONNRESET normal di Supabase)
  console.warn('[DB] Idle client error (akan reconnect):', err.message);
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DB] New client connected to pool');
  }
});

// ── Helper: query dengan retry sekali jika koneksi terputus ──
async function query(text, params = []) {
  const start = Date.now();

  async function run() {
    const result = await pool.query(text, params);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] query (${Date.now() - start}ms):`, text.slice(0, 80));
    }
    return result;
  }

  try {
    return await run();
  } catch (err) {
    const isConnErr = err.code === 'ECONNRESET'
      || err.code === '57P01'
      || err.message.includes('terminating connection')
      || err.message.includes('Connection terminated');

    if (isConnErr) {
      console.warn('[DB] Koneksi terputus, mencoba ulang...');
      try {
        return await run();
      } catch (retryErr) {
        console.error('[DB] Retry gagal:', retryErr.message);
        throw retryErr;
      }
    }

    console.error('[DB] Query error:', err.message, '\nSQL:', text.slice(0, 120));
    throw err;
  }
}

// ── Helper: transaksi ─────────────────────────────────────────
async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── Health check ─────────────────────────────────────────────
async function ping() {
  try {
    const { rows } = await query('SELECT NOW() AS server_time');
    return { ok: true, server_time: rows[0].server_time };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { pool, query, transaction, ping };
