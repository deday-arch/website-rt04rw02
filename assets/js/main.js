// ===== NAVBAR TOGGLE (MOBILE) =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
  // Tutup menu saat klik di luar
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('open');
    }
  });
}

// ===== TAB SWITCHER =====
function switchTab(tabId, el) {
  document.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
  const target = document.getElementById('tab-' + tabId);
  if (target) target.classList.add('active');
  if (el) el.classList.add('active');
}

// ===== FILTER TABEL IURAN =====
function filterTable() {
  const searchVal = (document.getElementById('searchWarga')?.value || '').toLowerCase();
  const statusVal = (document.getElementById('filterStatus')?.value || '').toLowerCase();
  const rows = document.querySelectorAll('#iuranTable tbody tr');

  rows.forEach(row => {
    const noRumah = row.cells[1]?.textContent.toLowerCase() || '';
    const nama    = row.cells[2]?.textContent.toLowerCase() || '';
    const status  = row.cells[7]?.textContent.toLowerCase() || '';

    const matchSearch = noRumah.includes(searchVal) || nama.includes(searchVal);
    const matchStatus = statusVal === '' || status.includes(statusVal.toLowerCase());

    row.style.display = matchSearch && matchStatus ? '' : 'none';
  });
}

// ===== RENDER TABEL IURAN PUBLIK DARI LOCALSTORAGE =====
(function renderPublicIuran() {
  const tbody = document.getElementById('tbodyIuranPublic');
  if (!tbody) return;

  // Ambil data dari localStorage, atau gunakan data default
  let data = [];
  try { data = JSON.parse(localStorage.getItem('rt04_iuran')) || []; } catch(e) { data = []; }

  // Jika localStorage kosong, load DEFAULT_WARGA yang sama dengan admin.js
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#888">Memuat data... Silakan buka halaman Admin terlebih dahulu atau refresh halaman.</td></tr>';
    return;
  }

  let lunas = 0, totalTerkumpul = 0;
  const fmtRp = n => 'Rp ' + (n||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const fmtDate = d => {
    if (!d) return '-';
    const p = d.split('-'), m = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return +p[2]+' '+(m[+p[1]]||'')+' '+p[0];
  };

  tbody.innerHTML = data.map((x, i) => {
    const isLunas = x.status === 'Lunas';
    if (isLunas) { lunas++; totalTerkumpul += (x.kebersihan||0) + (x.keamanan||0); }
    const statusHtml = isLunas
      ? '<span class="status-lunas">Lunas</span>'
      : '<span class="status-belum">Belum Bayar</span>';
    return `<tr>
      <td>${i+1}</td>
      <td>${x.noRumah||''}</td>
      <td>${x.nama||''}</td>
      <td style="font-size:.82rem;color:#555">${x.kontak||'-'}</td>
      <td>${fmtRp(x.kebersihan)}</td>
      <td>${fmtRp(x.keamanan)}</td>
      <td><strong>${fmtRp((x.kebersihan||0)+(x.keamanan||0))}</strong></td>
      <td>${statusHtml}</td>
      <td>${fmtDate(x.tglBayar)}</td>
    </tr>`;
  }).join('');

  const belum = data.length - lunas;
  const elLunas = document.getElementById('statLunas');
  const elBelum = document.getElementById('statBelum');
  const elTotal = document.getElementById('statTotal');
  if (elLunas) elLunas.textContent = lunas;
  if (elBelum) elBelum.textContent = belum;
  if (elTotal) elTotal.textContent = fmtRp(totalTerkumpul);
})();

// ===== FILTER UMKM =====
function filterUmkm() {
  const searchVal  = (document.getElementById('searchUmkm')?.value || '').toLowerCase();
  const kategori   = (document.getElementById('filterKategori')?.value || '').toLowerCase();
  const cards      = document.querySelectorAll('.umkm-card');
  let visible = 0;

  cards.forEach(card => {
    const nama  = (card.dataset.nama || '').toLowerCase();
    const kat   = (card.dataset.kategori || '').toLowerCase();

    const matchSearch   = nama.includes(searchVal);
    const matchKategori = kategori === '' || kat.includes(kategori);

    const show = matchSearch && matchKategori;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  const noResult = document.getElementById('noResult');
  if (noResult) noResult.style.display = visible === 0 ? 'block' : 'none';
}

// ===== FORM LAPORAN KEJADIAN =====
function submitLaporan(e) {
  e.preventDefault();
  const form    = document.getElementById('laporForm');
  const success = document.getElementById('formSuccess');

  if (!form || !success) return;

  // Tampilkan pesan sukses
  success.style.display = 'flex';
  form.reset();

  // Scroll ke pesan sukses
  success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Sembunyikan setelah 5 detik
  setTimeout(() => { success.style.display = 'none'; }, 6000);
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== HIGHLIGHT BARIS JADWAL RONDA HARI INI =====
(function highlightToday() {
  const today = new Date();
  const days  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const todayName = days[today.getDay()];

  document.querySelectorAll('.ronda-table tbody tr').forEach(row => {
    const hariLabel = row.querySelector('.hari-label');
    if (hariLabel && hariLabel.textContent.trim() === todayName) {
      row.classList.add('giliran-highlight');
    }
  });
})();

// ===== ACTIVE NAV LINK =====
(function setActiveNav() {
  const path    = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path && !link.classList.contains('btn-lapor')) {
      link.classList.add('active');
    }
  });
})();
