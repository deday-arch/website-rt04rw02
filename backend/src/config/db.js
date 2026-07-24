// ============================================================
//  db.js — PostgreSQL Connection Pool
//  Menggunakan library 'pg' (node-postgres) dengan SSL untuk Supabase
// ============================================================
'use strict';

const { Pool } = require('pg');
require('dotenv').config();

// ── Konfigurasi pool ─────────────────────────────────────────
const poolConfig = {
  host:               process.env.DB_HOST,
  port:               parseInt(process.env.DB_PORT, 10) || 5432,
  database:           process.env.DB_NAME,
  user:               process.env.DB_USER,
  password:           process.env.DB_PASSWORD,
  min:                parseInt(process.env.DB_POOL_MIN, 10)               || 2,
  max:                parseInt(process.env.DB_POOL_MAX, 10)               || 10,
  idleTimeoutMillis:  parseInt(process.env.DB_IDLE_TIMEOUT, 10)           || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10)|| 15000,
};

// Supabase wajib SSL — rejectUnauthorized: false agar tidak perlu CA cert
if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

// Force IPv4 agar tidak terkena masalah DNS IPv6 (Supabase Direct Connection)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const pool = new Pool(poolConfig);

// ── Event: log error koneksi idle ────────────────────────────
pool.on('error', (err) => {
  console.error('[DB] Unexpected idle client error:', err.message);
});

// ── Event: log saat pool connect (development saja) ──────────
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DB] New client connected to pool');
  }
});

// ── Helper: jalankan query tunggal ───────────────────────────
/**
 * @param {string} text   - Query SQL (gunakan $1, $2, ... untuk parameter)
 * @param {Array}  params - Array nilai parameter
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] query (${Date.now() - start}ms):`, text.slice(0, 80));
    }
    return result;
  } catch (err) {
    console.error('[DB] Query error:', err.message, '\nSQL:', text);
    throw err;
  }
}

// ── Helper: transaksi (BEGIN → COMMIT / ROLLBACK) ────────────
/**
 * Menjalankan beberapa query dalam satu transaksi.
 * @param {function(client: import('pg').PoolClient): Promise<any>} fn
 */
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

// ── Health check: test ping ke database ──────────────────────
async function ping() {
  try {
    const { rows } = await query('SELECT NOW() AS server_time');
    return { ok: true, server_time: rows[0].server_time };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { pool, query, transaction, ping };
