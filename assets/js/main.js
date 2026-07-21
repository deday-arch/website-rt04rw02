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
    const status  = row.cells[6]?.textContent.toLowerCase() || '';

    const matchSearch = noRumah.includes(searchVal) || nama.includes(searchVal);
    const matchStatus = statusVal === '' || status.includes(statusVal.toLowerCase());

    row.style.display = matchSearch && matchStatus ? '' : 'none';
  });
}

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
