// ============================================================
//  api-connector.js
//  Jembatan antara frontend HTML dan backend API RT 04 / RW 02
//  Otomatis mendeteksi apakah pakai API atau localStorage
// ============================================================
(function () {
  'use strict';

  // Deteksi environment:
  // - localhost:3000  → pakai /api (relative, Express serve static)
  // - localhost:5500  → pakai http://localhost:3000/api (Live Server)
  // - GitHub Pages / domain lain → pakai URL Render (diisi saat deploy)
  const RENDER_URL = 'https://website-rt04rw02-production.up.railway.app';

  function getApiBase() {
    const { hostname, port } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      if (port === '3000') return '/api';
      return 'http://localhost:3000/api';
    }
    // Production: GitHub Pages → pakai Render backend
    return RENDER_URL + '/api';
  }

  const API_BASE = getApiBase();
  // Base URL tanpa /api (untuk health check)
  const BASE_URL  = API_BASE.replace(/\/api$/, '');

  // ── Token JWT dari sessionStorage ──────────────────────────
  function getToken() {
    return sessionStorage.getItem('rt04_jwt') || '';
  }

  // ── Fetch helper ─────────────────────────────────────────────
  async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    try {
      const res = await fetch(API_BASE + path, { ...options, headers: { ...headers, ...(options.headers || {}) } });
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      console.warn('[API] Gagal fetch, fallback ke localStorage:', e.message);
      return { ok: false, status: 0, data: null };
    }
  }

  // ── Expose ke global window.API ──────────────────────────────
  window.API = {

    // ── AUTH ───────────────────────────────────────────────────
    async login(username, password) {
      const r = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (r.ok && r.data.token) {
        sessionStorage.setItem('rt04_jwt', r.data.token);
        sessionStorage.setItem('rt04_admin_session', JSON.stringify({
          user: r.data.admin.username,
          role: r.data.admin.role,
          time: Date.now(),
        }));
      }
      return r;
    },

    logout() {
      sessionStorage.removeItem('rt04_jwt');
      sessionStorage.removeItem('rt04_admin_session');
      window.location.href = '/admin-login.html';
    },

    // ── PENGUMUMAN ─────────────────────────────────────────────
    async getPengumuman(params = {}) {
      const q = new URLSearchParams(params).toString();
      return apiFetch('/pengumuman' + (q ? '?' + q : ''));
    },
    async savePengumuman(data, id = null) {
      return id
        ? apiFetch('/pengumuman/' + id, { method: 'PUT', body: JSON.stringify(data) })
        : apiFetch('/pengumuman',       { method: 'POST', body: JSON.stringify(data) });
    },
    async deletePengumuman(id) {
      return apiFetch('/pengumuman/' + id, { method: 'DELETE' });
    },

    // ── IURAN ─────────────────────────────────────────────────
    async getIuran(params = {}) {
      const q = new URLSearchParams(params).toString();
      return apiFetch('/iuran' + (q ? '?' + q : ''));
    },
    async saveIuran(data, id = null) {
      return id
        ? apiFetch('/iuran/' + id, { method: 'PUT', body: JSON.stringify(data) })
        : apiFetch('/iuran',       { method: 'POST', body: JSON.stringify(data) });
    },
    async deleteIuran(id) {
      return apiFetch('/iuran/' + id, { method: 'DELETE' });
    },
    async getRingkasanIuran() {
      return apiFetch('/iuran/ringkasan');
    },

    // ── UMKM ──────────────────────────────────────────────────
    async getUmkm(params = {}) {
      const q = new URLSearchParams(params).toString();
      return apiFetch('/umkm' + (q ? '?' + q : ''));
    },
    async saveUmkm(data, id = null) {
      return id
        ? apiFetch('/umkm/' + id, { method: 'PUT', body: JSON.stringify(data) })
        : apiFetch('/umkm',       { method: 'POST', body: JSON.stringify(data) });
    },
    async deleteUmkm(id) {
      return apiFetch('/umkm/' + id, { method: 'DELETE' });
    },

    // ── KEGIATAN ──────────────────────────────────────────────
    async getKegiatan(params = {}) {
      const q = new URLSearchParams(params).toString();
      return apiFetch('/kegiatan' + (q ? '?' + q : ''));
    },
    async saveKegiatan(data, id = null) {
      return id
        ? apiFetch('/kegiatan/' + id, { method: 'PUT', body: JSON.stringify(data) })
        : apiFetch('/kegiatan',       { method: 'POST', body: JSON.stringify(data) });
    },
    async deleteKegiatan(id) {
      return apiFetch('/kegiatan/' + id, { method: 'DELETE' });
    },

    // ── PENGURUS ──────────────────────────────────────────────
    async getPengurus() {
      return apiFetch('/pengurus');
    },
    async savePengurus(data, id = null) {
      return id
        ? apiFetch('/pengurus/' + id, { method: 'PUT', body: JSON.stringify(data) })
        : apiFetch('/pengurus',       { method: 'POST', body: JSON.stringify(data) });
    },
    async deletePengurus(id) {
      return apiFetch('/pengurus/' + id, { method: 'DELETE' });
    },

    // ── RONDA ─────────────────────────────────────────────────
    async getRonda() {
      return apiFetch('/ronda');
    },
    async saveRonda(data, id = null) {
      return id
        ? apiFetch('/ronda/' + id, { method: 'PUT', body: JSON.stringify(data) })
        : apiFetch('/ronda',       { method: 'POST', body: JSON.stringify(data) });
    },
    async deleteRonda(id) {
      return apiFetch('/ronda/' + id, { method: 'DELETE' });
    },

    // ── LAPORAN ───────────────────────────────────────────────
    async getLaporan(params = {}) {
      const q = new URLSearchParams(params).toString();
      return apiFetch('/laporan' + (q ? '?' + q : ''));
    },
    async getLaporanPublik() {
      return apiFetch('/laporan/publik');
    },
    async submitLaporan(data) {
      return apiFetch('/laporan', { method: 'POST', body: JSON.stringify(data) });
    },
    async updateStatusLaporan(id, status, catatan_admin = '') {
      return apiFetch('/laporan/' + id, { method: 'PUT', body: JSON.stringify({ status, catatan_admin }) });
    },
    async deleteLaporan(id) {
      return apiFetch('/laporan/' + id, { method: 'DELETE' });
    },

    // ── WARGA ─────────────────────────────────────────────────
    async getWarga(params = {}) {
      const q = new URLSearchParams(params).toString();
      return apiFetch('/warga' + (q ? '?' + q : ''));
    },
    async saveWarga(data, id = null) {
      return id
        ? apiFetch('/warga/' + id, { method: 'PUT', body: JSON.stringify(data) })
        : apiFetch('/warga',       { method: 'POST', body: JSON.stringify(data) });
    },
    async deleteWarga(id) {
      return apiFetch('/warga/' + id, { method: 'DELETE' });
    },

    // ── HEALTH CHECK ──────────────────────────────────────────
    async health() {
      try {
        const res = await fetch(BASE_URL + '/health');
        return await res.json();
      } catch(e) {
        return { ok: false, error: e.message };
      }
    },
  };

  // ── Auto-load pengumuman di halaman index ─────────────────
  async function loadPengumumanBeranda() {
    const list = document.getElementById('pengList');
    if (!list) return;

    const r = await window.API.getPengumuman({ limit: 4 });
    if (!r.ok || !r.data?.data?.length) return; // biarkan fallback localStorage

    const BADGE_COLOR = { Penting:'#ef4444', Kegiatan:'#2563eb', Info:'#16a34a', Spesial:'#d97706' };
    const ICON_BG     = { Penting:'#fef2f2', Kegiatan:'#eff6ff', Info:'#f0fdf4', Spesial:'#fffbeb' };
    const ICON_ICON   = { Penting:'fa-circle-exclamation', Kegiatan:'fa-calendar-days', Info:'fa-circle-info', Spesial:'fa-star' };
    const CSS_CLASS   = { Penting:'penting', Kegiatan:'kegiatan', Info:'info', Spesial:'' };

    function fmtTgl(d) {
      if (!d) return '';
      const p = d.split('T')[0].split('-');
      const bln = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
      return +p[2] + ' ' + (bln[+p[1]] || '') + ' ' + p[0];
    }

    list.innerHTML = r.data.data.map(x => {
      const kat = x.kategori || 'Info';
      return `<div class="peng-item ${CSS_CLASS[kat] || ''}">
        <div class="peng-icon" style="background:${ICON_BG[kat]||'#f8fafc'}">
          <i class="fas ${ICON_ICON[kat]||'fa-bullhorn'}" style="color:${BADGE_COLOR[kat]||'#64748b'}"></i>
        </div>
        <div class="peng-body">
          <h4>${x.judul || ''}</h4>
          <p>${x.isi || ''}</p>
          <div class="peng-meta">
            <span class="peng-date"><i class="fas fa-clock"></i> ${fmtTgl(x.tanggal)}</span>
            <span class="badge" style="background:${ICON_BG[kat]};color:${BADGE_COLOR[kat]};font-size:.68rem">${kat}</span>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  // ── Auto-load stat UMKM dari API ─────────────────────────
  async function loadStatsBeranda() {
    const elU = document.getElementById('statUmkm');
    if (!elU) return;
    const r = await window.API.getUmkm();
    if (r.ok && r.data?.data) {
      elU.textContent = r.data.data.length;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadPengumumanBeranda();
    loadStatsBeranda();
  });

  console.log('[API Connector] Aktif — endpoint:', API_BASE);
})();
