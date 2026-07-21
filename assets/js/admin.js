/* ============================================================
   ADMIN.JS — Auth + CRUD untuk Website RT 04 / RW 02
   Data disimpan di localStorage (client-side)
   ============================================================ */

// ── AKUN ADMIN (username : password) ──────────────────────
const ADMIN_ACCOUNTS = {
  'admin'    : 'rt04rw02@2026',
  'ketua.rt' : 'Jombang@2026',
  'sekretaris': 'Ciputat@2026'
};
const SESSION_KEY = 'rt04_admin_session';

// ── AUTH FUNCTIONS ─────────────────────────────────────────
function doLogin(e) {
  if (e) e.preventDefault();
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');

  if (ADMIN_ACCOUNTS[user] && ADMIN_ACCOUNTS[user] === pass) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, time: Date.now() }));
    window.location.href = 'admin-dashboard.html';
  } else {
    if (errEl) { errEl.style.display = 'flex'; }
    document.getElementById('loginPass').value = '';
  }
}

function checkAuth() {
  const s = sessionStorage.getItem(SESSION_KEY);
  if (!s) { window.location.href = 'admin-login.html'; return null; }
  return JSON.parse(s);
}

function doLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = 'admin-login.html';
}

function togglePw() {
  const inp = document.getElementById('loginPass');
  const ico = document.getElementById('pwIcon');
  if (inp.type === 'password') { inp.type = 'text'; ico.className = 'fas fa-eye-slash'; }
  else { inp.type = 'password'; ico.className = 'fas fa-eye'; }
}

// ── DATA HELPERS ───────────────────────────────────────────
function getData(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}
function saveData(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── TOAST NOTIFICATION ────────────────────────────────────
function showToast(msg, type = 'success') {
  let cont = document.getElementById('toastContainer');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'toastContainer';
    cont.className = 'toast-container';
    document.body.appendChild(cont);
  }
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas ${icons[type]||icons.info}"></i> ${msg}`;
  cont.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; setTimeout(() => t.remove(), 400); }, 3000);
}

// ── MODAL HELPERS ─────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ── CONFIRM DELETE ────────────────────────────────────────
let _deleteCallback = null;
function confirmDelete(label, cb) {
  _deleteCallback = cb;
  const box = document.getElementById('confirmOverlay');
  document.getElementById('confirmLabel').textContent = label;
  box.classList.add('open');
}
function confirmYes() {
  document.getElementById('confirmOverlay').classList.remove('open');
  if (_deleteCallback) { _deleteCallback(); _deleteCallback = null; }
}
function confirmNo() { document.getElementById('confirmOverlay').classList.remove('open'); }

// ══════════════════════════════════════════════════════════
// CRUD: PENGUMUMAN
// ══════════════════════════════════════════════════════════
const KEY_PENGUMUMAN = 'rt04_pengumuman';

function defaultPengumuman() {
  return [
    { id: genId(), judul: 'Pembayaran Iuran Bulan Juli 2026', isi: 'Iuran bulan Juli 2026 sudah dapat dibayarkan. Batas pembayaran tanggal 31 Juli 2026.', kategori: 'Penting', tanggal: '2026-07-01' },
    { id: genId(), judul: 'Kerja Bakti Lingkungan', isi: 'Kerja bakti bersama pada hari Minggu, 27 Juli 2026 pukul 07.00 WIB.', kategori: 'Kegiatan', tanggal: '2026-07-20' },
    { id: genId(), judul: 'Pendaftaran UMKM Baru', isi: 'Bagi warga yang memiliki usaha, silakan hubungi sekretaris RT.', kategori: 'Info', tanggal: '2026-07-15' }
  ];
}

function getPengumuman() {
  const d = getData(KEY_PENGUMUMAN);
  if (d.length === 0) { const def = defaultPengumuman(); saveData(KEY_PENGUMUMAN, def); return def; }
  return d;
}

function renderPengumumanTable(filter = '') {
  const data = getPengumuman().filter(x =>
    x.judul.toLowerCase().includes(filter.toLowerCase()) ||
    x.isi.toLowerCase().includes(filter.toLowerCase())
  );
  const tbody = document.getElementById('tbodyPengumuman');
  if (!tbody) return;
  if (data.length === 0) { tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Belum ada data pengumuman.</td></tr>'; return; }
  tbody.innerHTML = data.map((x, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${esc(x.judul)}</strong></td>
      <td><span class="badge badge-${badgeClass(x.kategori)}">${esc(x.kategori)}</span></td>
      <td>${fmtDate(x.tanggal)}</td>
      <td><div class="action-btns">
        <button class="btn-edit" onclick="editPengumuman('${x.id}')"><i class="fas fa-pen"></i> Edit</button>
        <button class="btn-del" onclick="deletePengumuman('${x.id}','${esc(x.judul)}')"><i class="fas fa-trash"></i> Hapus</button>
      </div></td>
    </tr>`).join('');
}

function openAddPengumuman() {
  document.getElementById('modalPengumumanTitle').textContent = 'Tambah Pengumuman';
  document.getElementById('pngId').value = '';
  document.getElementById('pngJudul').value = '';
  document.getElementById('pngIsi').value = '';
  document.getElementById('pngKategori').value = 'Info';
  document.getElementById('pngTanggal').value = new Date().toISOString().slice(0, 10);
  openModal('modalPengumuman');
}

function editPengumuman(id) {
  const x = getPengumuman().find(p => p.id === id);
  if (!x) return;
  document.getElementById('modalPengumumanTitle').textContent = 'Edit Pengumuman';
  document.getElementById('pngId').value = x.id;
  document.getElementById('pngJudul').value = x.judul;
  document.getElementById('pngIsi').value = x.isi;
  document.getElementById('pngKategori').value = x.kategori;
  document.getElementById('pngTanggal').value = x.tanggal;
  openModal('modalPengumuman');
}

function savePengumuman() {
  const id = document.getElementById('pngId').value;
  const judul = document.getElementById('pngJudul').value.trim();
  const isi = document.getElementById('pngIsi').value.trim();
  const kategori = document.getElementById('pngKategori').value;
  const tanggal = document.getElementById('pngTanggal').value;
  if (!judul || !isi) { showToast('Judul dan isi wajib diisi!', 'error'); return; }
  let data = getPengumuman();
  if (id) {
    data = data.map(x => x.id === id ? { ...x, judul, isi, kategori, tanggal } : x);
    showToast('Pengumuman berhasil diperbarui!');
  } else {
    data.unshift({ id: genId(), judul, isi, kategori, tanggal });
    showToast('Pengumuman berhasil ditambahkan!');
  }
  saveData(KEY_PENGUMUMAN, data);
  closeModal('modalPengumuman');
  renderPengumumanTable();
  updateDashStats();
}

function deletePengumuman(id, label) {
  confirmDelete(`pengumuman "${label}"`, () => {
    saveData(KEY_PENGUMUMAN, getPengumuman().filter(x => x.id !== id));
    showToast('Pengumuman berhasil dihapus!', 'info');
    renderPengumumanTable();
    updateDashStats();
  });
}

// ══════════════════════════════════════════════════════════
// CRUD: IURAN
// ══════════════════════════════════════════════════════════
const KEY_IURAN = 'rt04_iuran';

function defaultIuran() {
  const names = ['Ahmad Santoso','Budi Prasetyo','Citra Dewi','Dedi Kurniawan','Eka Rahayu','Faisal Hidayat','Gita Permata','Hendra Wijaya','Indah Lestari','Joko Santoso','Kartini Sari','Luthfi Rahman'];
  const status = ['Lunas','Lunas','Belum Bayar','Lunas','Belum Bayar','Lunas','Lunas','Belum Bayar','Lunas','Lunas','Belum Bayar','Lunas'];
  const tgl = ['2026-07-02','2026-07-03','','2026-07-05','','2026-07-07','2026-07-08','','2026-07-10','2026-07-11','','2026-07-12'];
  return names.map((n, i) => ({ id: genId(), noRumah: `No. ${i+1}`, nama: n, kebersihan: 30000, keamanan: 20000, status: status[i], tglBayar: tgl[i] }));
}

function getIuran() {
  const d = getData(KEY_IURAN);
  if (d.length === 0) { const def = defaultIuran(); saveData(KEY_IURAN, def); return def; }
  return d;
}

function renderIuranTable(filter = '') {
  const data = getIuran().filter(x =>
    x.nama.toLowerCase().includes(filter.toLowerCase()) ||
    x.noRumah.toLowerCase().includes(filter.toLowerCase())
  );
  const tbody = document.getElementById('tbodyIuran');
  if (!tbody) return;
  if (data.length === 0) { tbody.innerHTML = '<tr class="empty-row"><td colspan="8">Tidak ada data.</td></tr>'; return; }
  tbody.innerHTML = data.map((x, i) => `
    <tr>
      <td>${i+1}</td><td>${esc(x.noRumah)}</td><td>${esc(x.nama)}</td>
      <td>Rp ${num(x.kebersihan)}</td><td>Rp ${num(x.keamanan)}</td>
      <td><strong>Rp ${num(x.kebersihan + x.keamanan)}</strong></td>
      <td><span class="status-${x.status==='Lunas'?'lunas':'belum'}">${x.status}</span></td>
      <td>${x.tglBayar ? fmtDate(x.tglBayar) : '-'}</td>
      <td><div class="action-btns">
        <button class="btn-edit" onclick="editIuran('${x.id}')"><i class="fas fa-pen"></i> Edit</button>
        <button class="btn-del" onclick="deleteIuran('${x.id}','${esc(x.nama)}')"><i class="fas fa-trash"></i> Hapus</button>
      </div></td>
    </tr>`).join('');
}

function openAddIuran() {
  document.getElementById('modalIuranTitle').textContent = 'Tambah Data Iuran';
  ['iurId','iurNoRumah','iurNama','iurTgl'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('iurKebersihan').value = 30000;
  document.getElementById('iurKeamanan').value = 20000;
  document.getElementById('iurStatus').value = 'Belum Bayar';
  openModal('modalIuran');
}

function editIuran(id) {
  const x = getIuran().find(r => r.id === id);
  if (!x) return;
  document.getElementById('modalIuranTitle').textContent = 'Edit Data Iuran';
  document.getElementById('iurId').value = x.id;
  document.getElementById('iurNoRumah').value = x.noRumah;
  document.getElementById('iurNama').value = x.nama;
  document.getElementById('iurKebersihan').value = x.kebersihan;
  document.getElementById('iurKeamanan').value = x.keamanan;
  document.getElementById('iurStatus').value = x.status;
  document.getElementById('iurTgl').value = x.tglBayar || '';
  openModal('modalIuran');
}

function saveIuran() {
  const id = document.getElementById('iurId').value;
  const noRumah = document.getElementById('iurNoRumah').value.trim();
  const nama = document.getElementById('iurNama').value.trim();
  const kebersihan = parseInt(document.getElementById('iurKebersihan').value) || 0;
  const keamanan = parseInt(document.getElementById('iurKeamanan').value) || 0;
  const status = document.getElementById('iurStatus').value;
  const tglBayar = document.getElementById('iurTgl').value;
  if (!noRumah || !nama) { showToast('No. rumah dan nama wajib diisi!', 'error'); return; }
  let data = getIuran();
  if (id) {
    data = data.map(x => x.id === id ? { ...x, noRumah, nama, kebersihan, keamanan, status, tglBayar } : x);
    showToast('Data iuran berhasil diperbarui!');
  } else {
    data.push({ id: genId(), noRumah, nama, kebersihan, keamanan, status, tglBayar });
    showToast('Data iuran berhasil ditambahkan!');
  }
  saveData(KEY_IURAN, data);
  closeModal('modalIuran');
  renderIuranTable();
  updateDashStats();
}

function deleteIuran(id, label) {
  confirmDelete(`data iuran "${label}"`, () => {
    saveData(KEY_IURAN, getIuran().filter(x => x.id !== id));
    showToast('Data iuran berhasil dihapus!', 'info');
    renderIuranTable();
    updateDashStats();
  });
}

// ══════════════════════════════════════════════════════════
// CRUD: UMKM
// ══════════════════════════════════════════════════════════
const KEY_UMKM = 'rt04_umkm';

function defaultUmkm() {
  return [
    {id:genId(),nama:'Warung Bu Sari',pemilik:'Sari Mulyani',noRumah:'No. 7',kategori:'Makanan & Minuman',deskripsi:'Nasi uduk, lontong sayur, dan gorengan. Buka 06.00-10.00 WIB.',kontak:'0812-1111-2222'},
    {id:genId(),nama:'Bakery Lestari',pemilik:'Lestari Wulandari',noRumah:'No. 12',kategori:'Makanan & Minuman',deskripsi:'Kue ulang tahun, brownies, roti tawar homemade.',kontak:'0813-3333-4444'},
    {id:genId(),nama:'Toko Sembako Pak Hendra',pemilik:'Hendra Wijaya',noRumah:'No. 8',kategori:'Sembako',deskripsi:'Lengkap kebutuhan dapur. Buka 07.00-21.00 WIB.',kontak:'0814-5555-6666'},
    {id:genId(),nama:'Salon Nova',pemilik:'Nova Anggraini',noRumah:'No. 20',kategori:'Jasa',deskripsi:'Potong rambut, creambath, rebonding, make-up.',kontak:'0815-7777-8888'},
    {id:genId(),nama:'Batik Kartini',pemilik:'Kartini Sari',noRumah:'No. 11',kategori:'Kerajinan',deskripsi:'Batik tulis dan cap motif khas. Pesanan seragam.',kontak:'0816-9999-0000'},
    {id:genId(),nama:'Servis Elektronik Pak Budi',pemilik:'Budi Prasetyo',noRumah:'No. 2',kategori:'Jasa',deskripsi:'Perbaikan TV, kulkas, mesin cuci, AC.',kontak:'0817-1111-3333'},
  ];
}

function getUmkm() {
  const d = getData(KEY_UMKM);
  if (d.length === 0) { const def = defaultUmkm(); saveData(KEY_UMKM, def); return def; }
  return d;
}

function renderUmkmTable(filter = '') {
  const data = getUmkm().filter(x =>
    x.nama.toLowerCase().includes(filter.toLowerCase()) ||
    x.pemilik.toLowerCase().includes(filter.toLowerCase()) ||
    x.kategori.toLowerCase().includes(filter.toLowerCase())
  );
  const tbody = document.getElementById('tbodyUmkm');
  if (!tbody) return;
  if (data.length === 0) { tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Tidak ada data.</td></tr>'; return; }
  tbody.innerHTML = data.map((x, i) => `
    <tr>
      <td>${i+1}</td><td><strong>${esc(x.nama)}</strong><br><small style="color:#4a6580">${esc(x.pemilik)}</small></td>
      <td>${esc(x.noRumah)}</td><td>${esc(x.kategori)}</td><td>${esc(x.kontak)}</td>
      <td><div class="action-btns">
        <button class="btn-edit" onclick="editUmkm('${x.id}')"><i class="fas fa-pen"></i> Edit</button>
        <button class="btn-del" onclick="deleteUmkm('${x.id}','${esc(x.nama)}')"><i class="fas fa-trash"></i> Hapus</button>
      </div></td>
    </tr>`).join('');
}

function openAddUmkm() {
  document.getElementById('modalUmkmTitle').textContent = 'Tambah UMKM';
  ['umkmId','umkmNama','umkmPemilik','umkmNoRumah','umkmDeskripsi','umkmKontak'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('umkmKategori').value = 'Makanan & Minuman';
  openModal('modalUmkm');
}

function editUmkm(id) {
  const x = getUmkm().find(r => r.id === id);
  if (!x) return;
  document.getElementById('modalUmkmTitle').textContent = 'Edit UMKM';
  document.getElementById('umkmId').value = x.id;
  document.getElementById('umkmNama').value = x.nama;
  document.getElementById('umkmPemilik').value = x.pemilik;
  document.getElementById('umkmNoRumah').value = x.noRumah;
  document.getElementById('umkmKategori').value = x.kategori;
  document.getElementById('umkmDeskripsi').value = x.deskripsi;
  document.getElementById('umkmKontak').value = x.kontak;
  openModal('modalUmkm');
}

function saveUmkm() {
  const id = document.getElementById('umkmId').value;
  const nama = document.getElementById('umkmNama').value.trim();
  const pemilik = document.getElementById('umkmPemilik').value.trim();
  const noRumah = document.getElementById('umkmNoRumah').value.trim();
  const kategori = document.getElementById('umkmKategori').value;
  const deskripsi = document.getElementById('umkmDeskripsi').value.trim();
  const kontak = document.getElementById('umkmKontak').value.trim();
  if (!nama || !pemilik) { showToast('Nama usaha dan pemilik wajib diisi!', 'error'); return; }
  let data = getUmkm();
  if (id) {
    data = data.map(x => x.id === id ? { ...x, nama, pemilik, noRumah, kategori, deskripsi, kontak } : x);
    showToast('Data UMKM berhasil diperbarui!');
  } else {
    data.push({ id: genId(), nama, pemilik, noRumah, kategori, deskripsi, kontak });
    showToast('UMKM berhasil ditambahkan!');
  }
  saveData(KEY_UMKM, data);
  closeModal('modalUmkm');
  renderUmkmTable();
  updateDashStats();
}

function deleteUmkm(id, label) {
  confirmDelete(`UMKM "${label}"`, () => {
    saveData(KEY_UMKM, getUmkm().filter(x => x.id !== id));
    showToast('UMKM berhasil dihapus!', 'info');
    renderUmkmTable();
    updateDashStats();
  });
}

// ══════════════════════════════════════════════════════════
// CRUD: KEGIATAN
// ══════════════════════════════════════════════════════════
const KEY_KEGIATAN = 'rt04_kegiatan';

function defaultKegiatan() {
  return [
    {id:genId(),nama:'Kerja Bakti Lingkungan',tanggal:'2026-07-27',waktu:'07.00-12.00 WIB',lokasi:'Seluruh RT 04',peserta:'Semua warga',kategori:'Rutin',status:'Mendatang'},
    {id:genId(),nama:'Peringatan HUT RI ke-81',tanggal:'2026-08-17',waktu:'07.00-22.00 WIB',lokasi:'Lapangan RT 04',peserta:'Semua warga',kategori:'Spesial',status:'Mendatang'},
    {id:genId(),nama:'Arisan Bulanan Ibu-Ibu',tanggal:'2026-08-03',waktu:'09.00-12.00 WIB',lokasi:'Rumah Bu Ketua PKK',peserta:'Ibu-ibu warga',kategori:'Rutin',status:'Mendatang'},
    {id:genId(),nama:'Halal Bihalal Warga',tanggal:'2026-06-15',waktu:'09.00-13.00 WIB',lokasi:'Lapangan RT 04',peserta:'Semua warga',kategori:'Spesial',status:'Selesai'},
  ];
}

function getKegiatan() {
  const d = getData(KEY_KEGIATAN);
  if (d.length === 0) { const def = defaultKegiatan(); saveData(KEY_KEGIATAN, def); return def; }
  return d;
}

function renderKegiatanTable(filter = '') {
  const data = getKegiatan().filter(x =>
    x.nama.toLowerCase().includes(filter.toLowerCase()) ||
    x.lokasi.toLowerCase().includes(filter.toLowerCase())
  );
  const tbody = document.getElementById('tbodyKegiatan');
  if (!tbody) return;
  if (data.length === 0) { tbody.innerHTML = '<tr class="empty-row"><td colspan="7">Tidak ada data.</td></tr>'; return; }
  tbody.innerHTML = data.map((x, i) => `
    <tr>
      <td>${i+1}</td><td><strong>${esc(x.nama)}</strong></td>
      <td>${fmtDate(x.tanggal)}</td><td>${esc(x.waktu)}</td>
      <td>${esc(x.lokasi)}</td>
      <td><span class="badge badge-${x.status==='Selesai'?'blue':'green'}">${esc(x.status)}</span></td>
      <td><div class="action-btns">
        <button class="btn-edit" onclick="editKegiatan('${x.id}')"><i class="fas fa-pen"></i> Edit</button>
        <button class="btn-del" onclick="deleteKegiatan('${x.id}','${esc(x.nama)}')"><i class="fas fa-trash"></i> Hapus</button>
      </div></td>
    </tr>`).join('');
}

function openAddKegiatan() {
  document.getElementById('modalKegiatanTitle').textContent = 'Tambah Kegiatan';
  ['kegId','kegNama','kegTanggal','kegWaktu','kegLokasi','kegPeserta'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('kegKategori').value = 'Rutin';
  document.getElementById('kegStatus').value = 'Mendatang';
  openModal('modalKegiatan');
}

function editKegiatan(id) {
  const x = getKegiatan().find(r => r.id === id);
  if (!x) return;
  document.getElementById('modalKegiatanTitle').textContent = 'Edit Kegiatan';
  document.getElementById('kegId').value = x.id;
  document.getElementById('kegNama').value = x.nama;
  document.getElementById('kegTanggal').value = x.tanggal;
  document.getElementById('kegWaktu').value = x.waktu;
  document.getElementById('kegLokasi').value = x.lokasi;
  document.getElementById('kegPeserta').value = x.peserta;
  document.getElementById('kegKategori').value = x.kategori;
  document.getElementById('kegStatus').value = x.status;
  openModal('modalKegiatan');
}

function saveKegiatan() {
  const id = document.getElementById('kegId').value;
  const nama = document.getElementById('kegNama').value.trim();
  const tanggal = document.getElementById('kegTanggal').value;
  const waktu = document.getElementById('kegWaktu').value.trim();
  const lokasi = document.getElementById('kegLokasi').value.trim();
  const peserta = document.getElementById('kegPeserta').value.trim();
  const kategori = document.getElementById('kegKategori').value;
  const status = document.getElementById('kegStatus').value;
  if (!nama || !tanggal) { showToast('Nama kegiatan dan tanggal wajib diisi!', 'error'); return; }
  let data = getKegiatan();
  if (id) {
    data = data.map(x => x.id === id ? { ...x, nama, tanggal, waktu, lokasi, peserta, kategori, status } : x);
    showToast('Kegiatan berhasil diperbarui!');
  } else {
    data.unshift({ id: genId(), nama, tanggal, waktu, lokasi, peserta, kategori, status });
    showToast('Kegiatan berhasil ditambahkan!');
  }
  saveData(KEY_KEGIATAN, data);
  closeModal('modalKegiatan');
  renderKegiatanTable();
  updateDashStats();
}

function deleteKegiatan(id, label) {
  confirmDelete(`kegiatan "${label}"`, () => {
    saveData(KEY_KEGIATAN, getKegiatan().filter(x => x.id !== id));
    showToast('Kegiatan berhasil dihapus!', 'info');
    renderKegiatanTable();
    updateDashStats();
  });
}

// ══════════════════════════════════════════════════════════
// CRUD: LAPORAN
// ══════════════════════════════════════════════════════════
const KEY_LAPORAN = 'rt04_laporan';

function defaultLaporan() {
  return [
    {id:genId(),nama:'Warga No.5',kontak:'0812-xxx',jenis:'Gangguan Keamanan',lokasi:'Depan gang RT 04',deskripsi:'Ada orang tidak dikenal berkeliaran.',urgensi:'Mendesak',status:'Selesai',tanggal:'2026-07-20'},
    {id:genId(),nama:'Warga No.9',kontak:'0813-xxx',jenis:'Masalah Sampah',lokasi:'TPS RT 04',deskripsi:'Sampah 3 hari belum diangkut.',urgensi:'Normal',status:'Diproses',tanggal:'2026-07-18'},
    {id:genId(),nama:'Warga No.3',kontak:'0814-xxx',jenis:'Fasilitas Umum Rusak',lokasi:'Blok B RT 04',deskripsi:'Lampu jalan mati sejak seminggu lalu.',urgensi:'Normal',status:'Selesai',tanggal:'2026-07-15'},
  ];
}

function getLaporan() {
  const d = getData(KEY_LAPORAN);
  if (d.length === 0) { const def = defaultLaporan(); saveData(KEY_LAPORAN, def); return def; }
  return d;
}

function renderLaporanTable(filter = '') {
  const data = getLaporan().filter(x =>
    x.jenis.toLowerCase().includes(filter.toLowerCase()) ||
    x.nama.toLowerCase().includes(filter.toLowerCase()) ||
    x.lokasi.toLowerCase().includes(filter.toLowerCase())
  );
  const tbody = document.getElementById('tbodyLaporan');
  if (!tbody) return;
  if (data.length === 0) { tbody.innerHTML = '<tr class="empty-row"><td colspan="7">Tidak ada laporan.</td></tr>'; return; }
  tbody.innerHTML = data.map((x, i) => `
    <tr>
      <td>${i+1}</td><td>${esc(x.nama)}</td>
      <td>${esc(x.jenis)}</td><td>${esc(x.lokasi)}</td>
      <td><span class="badge badge-${urgBadge(x.urgensi)}">${esc(x.urgensi)}</span></td>
      <td><span class="status-${statusClass(x.status)}">${esc(x.status)}</span></td>
      <td><div class="action-btns">
        <button class="btn-edit" onclick="editLaporan('${x.id}')"><i class="fas fa-pen"></i> Update</button>
        <button class="btn-del" onclick="deleteLaporan('${x.id}','${esc(x.jenis)}')"><i class="fas fa-trash"></i> Hapus</button>
      </div></td>
    </tr>`).join('');
}

function editLaporan(id) {
  const x = getLaporan().find(r => r.id === id);
  if (!x) return;
  document.getElementById('lapId').value = x.id;
  document.getElementById('lapStatus').value = x.status;
  document.getElementById('lapJenis').textContent = x.jenis;
  document.getElementById('lapNama').textContent = x.nama;
  document.getElementById('lapLokasi').textContent = x.lokasi;
  document.getElementById('lapDeskripsi').textContent = x.deskripsi;
  openModal('modalLaporan');
}

function saveLaporan() {
  const id = document.getElementById('lapId').value;
  const status = document.getElementById('lapStatus').value;
  let data = getLaporan();
  data = data.map(x => x.id === id ? { ...x, status } : x);
  saveData(KEY_LAPORAN, data);
  showToast('Status laporan berhasil diperbarui!');
  closeModal('modalLaporan');
  renderLaporanTable();
}

function deleteLaporan(id, label) {
  confirmDelete(`laporan "${label}"`, () => {
    saveData(KEY_LAPORAN, getLaporan().filter(x => x.id !== id));
    showToast('Laporan berhasil dihapus!', 'info');
    renderLaporanTable();
    updateDashStats();
  });
}

// ── CRUD: RONDA ────────────────────────────────────────────
const KEY_RONDA = 'rt04_ronda';
function defaultRonda() {
  const hari = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
  const tgl = ['21 Jul 2026','22 Jul 2026','23 Jul 2026','24 Jul 2026','25 Jul 2026','26 Jul 2026','27 Jul 2026'];
  const petugas = [['Budi P.','Hendra W.','Faisal H.'],['Ahmad S.','Dedi K.','Joko S.'],['Luthfi R.','Rudi S.','Tono M.'],['Agus P.','Wahyu S.','Rizki A.'],['Budi P.','Hendra W.','Dedi K.'],['Ahmad S.','Faisal H.','Joko S.'],['Luthfi R.','Tono M.','Wahyu S.']];
  const koord = ['Faisal H.','Ahmad S.','Luthfi R.','Agus P.','Budi P.','Faisal H.','Luthfi R.'];
  return hari.map((h, i) => ({ id: genId(), hari: h, tanggal: tgl[i], petugas: petugas[i].join(', '), koordinator: koord[i], shift: '22.00 – 04.00' }));
}
function getRonda() {
  const d = getData(KEY_RONDA);
  if (d.length === 0) { const def = defaultRonda(); saveData(KEY_RONDA, def); return def; }
  return d;
}

function renderRondaTable(filter = '') {
  const data = getRonda().filter(x =>
    x.hari.toLowerCase().includes(filter.toLowerCase()) ||
    x.petugas.toLowerCase().includes(filter.toLowerCase())
  );
  const tbody = document.getElementById('tbodyRonda');
  if (!tbody) return;
  if (data.length === 0) { tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Tidak ada data.</td></tr>'; return; }
  tbody.innerHTML = data.map((x, i) => `
    <tr>
      <td><strong>${esc(x.hari)}</strong><br><small style="color:#4a6580">${esc(x.tanggal)}</small></td>
      <td>${esc(x.petugas)}</td><td>${esc(x.shift)}</td><td>${esc(x.koordinator)}</td>
      <td><div class="action-btns">
        <button class="btn-edit" onclick="editRonda('${x.id}')"><i class="fas fa-pen"></i> Edit</button>
        <button class="btn-del" onclick="deleteRonda('${x.id}','${esc(x.hari)}')"><i class="fas fa-trash"></i> Hapus</button>
      </div></td>
    </tr>`).join('');
}

function openAddRonda() {
  document.getElementById('modalRondaTitle').textContent = 'Tambah Jadwal Ronda';
  ['rndId','rndHari','rndTanggal','rndPetugas','rndShift','rndKoordinator'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('rndShift').value = '22.00 – 04.00';
  openModal('modalRonda');
}

function editRonda(id) {
  const x = getRonda().find(r => r.id === id);
  if (!x) return;
  document.getElementById('modalRondaTitle').textContent = 'Edit Jadwal Ronda';
  document.getElementById('rndId').value = x.id;
  document.getElementById('rndHari').value = x.hari;
  document.getElementById('rndTanggal').value = x.tanggal;
  document.getElementById('rndPetugas').value = x.petugas;
  document.getElementById('rndShift').value = x.shift;
  document.getElementById('rndKoordinator').value = x.koordinator;
  openModal('modalRonda');
}

function saveRonda() {
  const id = document.getElementById('rndId').value;
  const hari = document.getElementById('rndHari').value.trim();
  const tanggal = document.getElementById('rndTanggal').value.trim();
  const petugas = document.getElementById('rndPetugas').value.trim();
  const shift = document.getElementById('rndShift').value.trim();
  const koordinator = document.getElementById('rndKoordinator').value.trim();
  if (!hari || !petugas) { showToast('Hari dan petugas wajib diisi!', 'error'); return; }
  let data = getRonda();
  if (id) {
    data = data.map(x => x.id === id ? { ...x, hari, tanggal, petugas, shift, koordinator } : x);
    showToast('Jadwal ronda berhasil diperbarui!');
  } else {
    data.push({ id: genId(), hari, tanggal, petugas, shift, koordinator });
    showToast('Jadwal ronda berhasil ditambahkan!');
  }
  saveData(KEY_RONDA, data);
  closeModal('modalRonda');
  renderRondaTable();
}

function deleteRonda(id, label) {
  confirmDelete(`jadwal ronda "${label}"`, () => {
    saveData(KEY_RONDA, getRonda().filter(x => x.id !== id));
    showToast('Jadwal ronda berhasil dihapus!', 'info');
    renderRondaTable();
  });
}

// ══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════
function esc(str) { return (str||'').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function num(n) { return (n||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function fmtDate(d) {
  if (!d) return '-';
  const [y, m, dt] = d.split('-');
  const months = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return `${parseInt(dt)} ${months[parseInt(m)]} ${y}`;
}
function badgeClass(k) {
  const map = { 'Penting': 'red', 'Kegiatan': 'blue', 'Info': 'green', 'Spesial': 'orange' };
  return map[k] || 'blue';
}
function urgBadge(u) {
  const map = { 'Darurat / Emergency': 'red', 'Mendesak': 'orange', 'Normal': 'blue' };
  return map[u] || 'blue';
}
function statusClass(s) {
  const map = { 'Selesai': 'selesai', 'Diproses': 'diproses', 'Masuk': 'masuk' };
  return map[s] || 'masuk';
}

// ── DASHBOARD STATS ────────────────────────────────────────
function updateDashStats() {
  const pengumuman = getPengumuman().length;
  const iuran = getIuran().length;
  const umkm = getUmkm().length;
  const kegiatan = getKegiatan().length;
  
  const el1 = document.getElementById('statPengumuman');
  const el2 = document.getElementById('statIuran');
  const el3 = document.getElementById('statUmkm');
  const el4 = document.getElementById('statKegiatan');
  
  if (el1) el1.textContent = pengumuman;
  if (el2) el2.textContent = iuran;
  if (el3) el3.textContent = umkm;
  if (el4) el4.textContent = kegiatan;
}

// ── INIT DASHBOARD ─────────────────────────────────────────
// ── SET USERNAME DI SEMUA HALAMAN ADMIN ───────────────────
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isAdminPage = path.includes('admin-') && !path.includes('admin-login');
  if (!isAdminPage) return;

  const session = checkAuth();
  if (!session) return;

  // Set semua elemen username
  document.querySelectorAll('#adminUsername').forEach(el => {
    el.textContent = session.user;
  });

  if (path.includes('admin-dashboard')) {
    updateDashStats();
  } else if (path.includes('admin-pengumuman')) {
    renderPengumumanTable();
    document.getElementById('searchPengumuman').addEventListener('input', e => renderPengumumanTable(e.target.value));
  } else if (path.includes('admin-iuran')) {
    renderIuranTable();
    document.getElementById('searchIuran').addEventListener('input', e => renderIuranTable(e.target.value));
  } else if (path.includes('admin-umkm')) {
    renderUmkmTable();
    document.getElementById('searchUmkm').addEventListener('input', e => renderUmkmTable(e.target.value));
  } else if (path.includes('admin-kegiatan')) {
    renderKegiatanTable();
    document.getElementById('searchKegiatan').addEventListener('input', e => renderKegiatanTable(e.target.value));
  } else if (path.includes('admin-laporan')) {
    renderLaporanTable();
    document.getElementById('searchLaporan').addEventListener('input', e => renderLaporanTable(e.target.value));
  } else if (path.includes('admin-ronda')) {
    renderRondaTable();
    document.getElementById('searchRonda').addEventListener('input', e => renderRondaTable(e.target.value));
  }
});


