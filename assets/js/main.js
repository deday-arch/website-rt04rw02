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

// ===== DATA WARGA DEFAULT (Card User List) =====
const WARGA_DEFAULT = [
  {noRumah:'0000000001',nama:'ANGGI',kontak:'089533007704'},
  {noRumah:'0000000002',nama:'EKA',kontak:'081218443309'},
  {noRumah:'0000000003',nama:'LALA',kontak:''},
  {noRumah:'0000000004',nama:'JAMAL',kontak:'081384492047'},
  {noRumah:'0000000005',nama:'BERLIAN',kontak:''},
  {noRumah:'0000000006',nama:'WAWANG',kontak:''},
  {noRumah:'0000000007',nama:'WIWIK',kontak:''},
  {noRumah:'0000000010',nama:'CASLORI',kontak:''},
  {noRumah:'0000000017',nama:'ARIF / PARFUM',kontak:'083117990602'},
  {noRumah:'0000000019',nama:'HJ ENCIS',kontak:''},
  {noRumah:'0000000020',nama:'FAJAR',kontak:'081212197900'},
  {noRumah:'0000000021',nama:'WIWID',kontak:''},
  {noRumah:'0000000022',nama:'ASTOYADI',kontak:'085811769417'},
  {noRumah:'0000000024',nama:'JAELANI',kontak:''},
  {noRumah:'0000000026',nama:'JAUHARI',kontak:''},
  {noRumah:'0000000028',nama:'HUSEN',kontak:'081316233416'},
  {noRumah:'0000000029',nama:'SAMIYAN',kontak:''},
  {noRumah:'0000000030',nama:'ZAINUDIN',kontak:''},
  {noRumah:'0000000031',nama:'ILHAM KHOLIK',kontak:'0857969727'},
  {noRumah:'0000000032',nama:'SOLIKHIN',kontak:'089525510380'},
  {noRumah:'0000000033',nama:'ZAINUDIN',kontak:''},
  {noRumah:'0000000034',nama:'BAGYO',kontak:'081315744404'},
  {noRumah:'0000000036',nama:'AGUS',kontak:''},
  {noRumah:'0000000037',nama:'MARITO',kontak:''},
  {noRumah:'0000000038',nama:'DONI',kontak:'081315447641'},
  {noRumah:'0000000039',nama:'PURWANTO',kontak:''},
  {noRumah:'0000000052',nama:'INDOMART MARKET',kontak:''},
  {noRumah:'0000000053',nama:'SIHOMBING',kontak:''},
  {noRumah:'0000000054',nama:'CAFE DOOR',kontak:''},
  {noRumah:'0000000055',nama:'EKA',kontak:'081218443309'},
  {noRumah:'0000000056',nama:'SULTHAN',kontak:''},
  {noRumah:'0000000057',nama:'DEDI KOSWARA',kontak:'085778929037'},
  {noRumah:'0000000060',nama:'ANDI',kontak:'081312631023'},
  {noRumah:'0000000061',nama:'EKO',kontak:'087809228079'},
  {noRumah:'0000000067',nama:'EVAK',kontak:''},
  {noRumah:'0000000068',nama:'SITI NGADIRAH',kontak:'085199397756'},
  {noRumah:'0000000070',nama:'TRI SISWANTI',kontak:'085715465538'},
  {noRumah:'0000000071',nama:'RUSDIAN',kontak:'087866850986'},
  {noRumah:'0000000074',nama:'RULLY',kontak:'085882912058'},
  {noRumah:'0000000075',nama:'HENI',kontak:''},
  {noRumah:'0000000077',nama:'FERY H',kontak:'085172365421'},
  {noRumah:'0000000078',nama:'LATIFAH',kontak:''},
  {noRumah:'0000000088',nama:'CASLORI',kontak:''},
  {noRumah:'0000000091',nama:'BABAN',kontak:'085157106010'},
  {noRumah:'0000000107',nama:'AFIF',kontak:'085885794230'},
  {noRumah:'0000000108',nama:'KOST AFIF',kontak:''},
  {noRumah:'0000000109',nama:'KOST AFIF C',kontak:''},
  {noRumah:'0000000111',nama:'AFUKARIM',kontak:'085176755011'},
  {noRumah:'0000000112',nama:'YANI / BIMA',kontak:''},
  {noRumah:'0000000113',nama:'YANI-BIMA',kontak:'081277191679'},
];

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

// (lanjutan WARGA_DEFAULT)
const WARGA_DEFAULT_2 = [
  {noRumah:'0000000114',nama:'UYUM',kontak:''},
  {noRumah:'0000000115',nama:'KADRAH',kontak:'081382035494'},
  {noRumah:'0000000116',nama:'SADIMO',kontak:'085732364760'},
  {noRumah:'0000000117',nama:'ATUN',kontak:''},
  {noRumah:'0000000122',nama:'JENY',kontak:'089601556933'},
  {noRumah:'0000000124',nama:'SARBINI',kontak:'085881793115'},
  {noRumah:'0000000128',nama:'NDRI',kontak:''},
  {noRumah:'0000000136',nama:'BASROWI',kontak:''},
  {noRumah:'0000000144',nama:'KOST 1',kontak:''},
  {noRumah:'0000000145',nama:'KOST 2',kontak:''},
  {noRumah:'0000000146',nama:'KOST 3',kontak:''},
  {noRumah:'0000000148',nama:'GUDANG JEEP',kontak:''},
  {noRumah:'0000000149',nama:'RUMAH KSG',kontak:''},
  {noRumah:'0000000160',nama:'KOST KIMBOK',kontak:''},
  {noRumah:'0000000161',nama:'IRHAMUDIN',kontak:'085715899610'},
  {noRumah:'0000000162',nama:'JUMANI',kontak:''},
  {noRumah:'0000000163',nama:'SULISTYO',kontak:'083878042606'},
  {noRumah:'0000000164',nama:'AJI SUBEKTI',kontak:''},
  {noRumah:'0000000165',nama:'MULYANI',kontak:''},
  {noRumah:'0000000166',nama:'YOSEF',kontak:'081398623460'},
  {noRumah:'0000000167',nama:'ADAM',kontak:''},
  {noRumah:'0000000170',nama:'GINO',kontak:'0895330957717'},
  {noRumah:'0000000171',nama:'NGADIMAN',kontak:'083825410163'},
  {noRumah:'0000000172',nama:'PAIMAN',kontak:'082123210944'},
  {noRumah:'0000000173',nama:'POLMA LAY',kontak:'085715325616'},
  {noRumah:'0000000174',nama:'NINING R',kontak:'089603025585'},
  {noRumah:'0000000179',nama:'JONI P',kontak:'08811499313'},
  {noRumah:'0000000180',nama:'FERY KIMBOK',kontak:'082310921469'},
  {noRumah:'0000000181',nama:'SULISTIONO / TIO',kontak:'081906126161'},
  {noRumah:'0000000182',nama:'AHMAD JUNAIDI',kontak:'085863747798'},
  {noRumah:'0000000183',nama:'INDRA / NDOY',kontak:''},
  {noRumah:'0000000186',nama:'SUHERMAN',kontak:'085710485539'},
  {noRumah:'0000000187',nama:'SURYATNA',kontak:'081219655006'},
  {noRumah:'0000000188',nama:'ALFAMART',kontak:''},
  {noRumah:'0000000189',nama:'AGEN TELOR',kontak:''},
  {noRumah:'0000000190',nama:'PADEL',kontak:''},
  {noRumah:'0000000192',nama:'MASJID ACEH',kontak:''},
  {noRumah:'0000000246',nama:'ARI',kontak:'08138091963'},
  {noRumah:'0000522147',nama:'MARDIYANTO',kontak:'085281901019'},
  {noRumah:'0004921430',nama:'INDRA / NDOYY',kontak:''},
  {noRumah:'0004925904',nama:'INGGA G',kontak:''},
  {noRumah:'0004931465',nama:'ARIA WISNU',kontak:'089669330944'},
  {noRumah:'0004932129',nama:'CHIRIL',kontak:'085780758887'},
  {noRumah:'0004932162',nama:'MAULID',kontak:'085236919992'},
  {noRumah:'0004934115',nama:'DAVID',kontak:'087713357485'},
  {noRumah:'0004935158',nama:'DIVA',kontak:''},
  {noRumah:'0004935216',nama:'ASMODIN',kontak:'0838909000367'},
  {noRumah:'0004935992',nama:'FAWZI / OJI',kontak:'089603025585'},
  {noRumah:'0004937836',nama:'IWAN KURNIAWAN',kontak:'08996245759'},
  {noRumah:'0004940946',nama:'CICE NIEN O',kontak:'0819436444123'},
];
const WARGA_DEFAULT_3 = [
  {noRumah:'0004946524',nama:'UMI / TONI',kontak:'085812841606'},
  {noRumah:'0004946781',nama:'LIVANDRY S',kontak:'08298090468'},
  {noRumah:'0004949455',nama:'OVIEN',kontak:'082221047646'},
  {noRumah:'0004950697',nama:'ANDRI W',kontak:''},
  {noRumah:'0004956066',nama:'IKHSANUL PUTRA',kontak:'082123728260'},
  {noRumah:'0004957598',nama:'LANNI HB',kontak:'082287154162'},
  {noRumah:'0004961281',nama:'SRI ATUN',kontak:''},
  {noRumah:'0004961639',nama:'SUHANDA',kontak:'085717680174'},
  {noRumah:'0004964948',nama:'ROHIM',kontak:'085782602638'},
  {noRumah:'0004966614',nama:'INDAH PERMATA S',kontak:'082373345955'},
  {noRumah:'0004968021',nama:'SANTI W',kontak:'085246652132'},
  {noRumah:'0004968068',nama:'AGUNG DEMA MARHENTO',kontak:'085921211033'},
  {noRumah:'0004969208',nama:'ARYO',kontak:'085717097055'},
  {noRumah:'0004969299',nama:'FRANSISCA W',kontak:'08119105315'},
  {noRumah:'0004970728',nama:'ARIF',kontak:'08129343147'},
  {noRumah:'0004971676',nama:'SUGENG',kontak:''},
  {noRumah:'0004976144',nama:'ANDI WICAKSANA',kontak:'087822660286'},
  {noRumah:'0004976340',nama:'DENU ATMAJA',kontak:'081212169993'},
  {noRumah:'0004983558',nama:'SUKANDI',kontak:'082112015392'},
  {noRumah:'0004987091',nama:'NABILLA',kontak:'0857019123'},
  {noRumah:'0004988561',nama:'ECKY',kontak:'087733986978'},
  {noRumah:'0004989498',nama:'H YANTO',kontak:'08161653797'},
  {noRumah:'0004990017',nama:'KIM',kontak:'085607622977'},
  {noRumah:'0004990793',nama:'BAMBANG',kontak:''},
  {noRumah:'0004992670',nama:'AINA URBA',kontak:'082287154162'},
  {noRumah:'0004997694',nama:'YUNI',kontak:''},
  {noRumah:'0004998010',nama:'ROSIANTI HADI P',kontak:'085810600250'},
  {noRumah:'0004998593',nama:'OKKY',kontak:'085695238031'},
  {noRumah:'0004999756',nama:'DEWINTA',kontak:'085313344726'},
  {noRumah:'0005001836',nama:'BAYU-FITRI',kontak:'081818822793'},
  {noRumah:'0005002262',nama:'SAHUD - MAK ONI',kontak:'089653831507'},
  {noRumah:'0005002813',nama:'JOEY',kontak:'081357352701'},
  {noRumah:'0005003698',nama:'M FADLI',kontak:'081779950556'},
  {noRumah:'0005004169',nama:'LIKHUN',kontak:'087705016190'},
  {noRumah:'0005005417',nama:'NAFIZHA',kontak:''},
  {noRumah:'0005017619',nama:'WILMA',kontak:'087884126462'},
  {noRumah:'0005017784',nama:'CHRISTOPER L',kontak:'081375332643'},
  {noRumah:'0005024944',nama:'BAIM',kontak:'089513899071'},
  {noRumah:'0005025232',nama:'YOLA',kontak:'081214134248'},
  {noRumah:'0005028930',nama:'ERIKA',kontak:'KONTRAK - HJ UTI'},
  {noRumah:'0005029437',nama:'ALI YUNUS',kontak:'085281986904'},
  {noRumah:'0005033553',nama:'IIS',kontak:'083870485685'},
  {noRumah:'0005033903',nama:'NYOMAN',kontak:'085945530535'},
  {noRumah:'0005034117',nama:'DAVID PRIYADI',kontak:'085794264211'},
  {noRumah:'0005034911',nama:'AWI-UNYIL',kontak:'081210094122'},
  {noRumah:'0005036825',nama:'ADI',kontak:''},
  {noRumah:'0005037578',nama:'PURWONO',kontak:'0817599324'},
  {noRumah:'0005039437',nama:'SUNARDIYANTO / GENDUT',kontak:'085281901019'},
  {noRumah:'0005040957',nama:'WAWAN GUNAWAN',kontak:'081399733870'},
  {noRumah:'0005048103',nama:'NURHAYATI',kontak:'081370658092'},
];
const WARGA_DEFAULT_4 = [
  {noRumah:'0005055239',nama:'FADZILAH',kontak:'082234759171'},
  {noRumah:'0005057017',nama:'WINIHARSO',kontak:'085249557002'},
  {noRumah:'0005059242',nama:'AGUS NAIM',kontak:'08565577552'},
  {noRumah:'0005062539',nama:'AKO',kontak:'082249921741'},
  {noRumah:'0005063425',nama:'NADIAFSYA',kontak:'088232015229'},
  {noRumah:'0005066894',nama:'ASRHON',kontak:'089504614780'},
  {noRumah:'0005069973',nama:'RUSTONO',kontak:'081385513049'},
  {noRumah:'0005072777',nama:'ISMAIL SUBANA',kontak:'083878585837'},
  {noRumah:'0005074213',nama:'ADI SUSANTO',kontak:'085695063489'},
  {noRumah:'0005075602',nama:'ALI YUSUF',kontak:''},
  {noRumah:'0005077135',nama:'ARAIYAH',kontak:'081355003410'},
  {noRumah:'0005077728',nama:'DHANI',kontak:'085697891135'},
  {noRumah:'0005079770',nama:'KARSIM',kontak:'085697954574'},
  {noRumah:'0005081231',nama:'ANDRE',kontak:'0812172888016'},
  {noRumah:'0005087205',nama:'RAHMAT',kontak:''},
  {noRumah:'0005088498',nama:'H SOSIAWAN',kontak:''},
  {noRumah:'0005089073',nama:'ZALDY',kontak:'082114704545'},
  {noRumah:'0005089412',nama:'DAMBAS',kontak:'081517892573'},
  {noRumah:'0005092427',nama:'ANDRI',kontak:''},
  {noRumah:'0005093609',nama:'DIAH WAHYU F',kontak:'085156377541'},
  {noRumah:'0005099616',nama:'CHANDRA',kontak:'081515669493'},
  {noRumah:'0005100846',nama:'KHUSEN',kontak:''},
  {noRumah:'0005103627',nama:'SAPTONO',kontak:'081318938658'},
  {noRumah:'0005199987',nama:'LIDYA F',kontak:'081280159983'},
  {noRumah:'0005200456',nama:'ASRON',kontak:'081361669666'},
  {noRumah:'0005202152',nama:'BASROWI',kontak:'088211472198'},
  {noRumah:'0005202827',nama:'IYAN - KEBAB',kontak:'081213160598'},
  {noRumah:'0005202956',nama:'SARBINI',kontak:'085881793115'},
  {noRumah:'0005205587',nama:'ANDREW KS',kontak:'082273083446'},
  {noRumah:'0005209282',nama:'SUPRIYONO',kontak:'082211015506'},
  {noRumah:'0005212014',nama:'DIANA',kontak:'085718083974'},
  {noRumah:'0005212276',nama:'SHOLEHATI',kontak:'0822111081657'},
  {noRumah:'0005214913',nama:'CHOIRUNISA',kontak:'085266666505'},
  {noRumah:'0005217028',nama:'MERY / NASRULLAH',kontak:'088975921141'},
  {noRumah:'0005219903',nama:'REZA RAHMA A',kontak:'081287731502'},
  {noRumah:'0005220633',nama:'ANDRI',kontak:'08561687874'},
  {noRumah:'0005225013',nama:'AZAM',kontak:'081384153203'},
  {noRumah:'0005225721',nama:'SAFEI',kontak:'085692014978'},
  {noRumah:'0005226049',nama:'ERVANSYAH',kontak:'0812888844'},
  {noRumah:'0005228535',nama:'ENI MARITA S',kontak:'085276056514'},
  {noRumah:'0005229651',nama:'M RIZKY',kontak:''},
  {noRumah:'0005230509',nama:'ROY',kontak:'08561540202'},
  {noRumah:'0005241192',nama:'GUNAWAN',kontak:'081280189199'},
  {noRumah:'0005241437',nama:'LUKMAN',kontak:'089635719264'},
  {noRumah:'0005244287',nama:'EKO',kontak:'081290820312'},
  {noRumah:'0005245246',nama:'KARWITA',kontak:''},
  {noRumah:'0005245287',nama:'YANTO',kontak:'085708727659'},
  {noRumah:'0005247337',nama:'RICKY',kontak:'081290595812'},
  {noRumah:'0005249182',nama:'YANDRA',kontak:'081380661791'},
  {noRumah:'0005249656',nama:'SYUKHENDRI / KEN',kontak:'081398697848'},
];
const WARGA_DEFAULT_5 = [
  {noRumah:'0005251659',nama:'ANWAR',kontak:'085883764897'},
  {noRumah:'0005256000',nama:'YULIA',kontak:'0895376710785'},
  {noRumah:'0005271690',nama:'DENI',kontak:'085709305915'},
  {noRumah:'0005276378',nama:'NURINDAH',kontak:'082130860505'},
  {noRumah:'0005276500',nama:'SUPRAPTO',kontak:'081318802245'},
  {noRumah:'0005277304',nama:'SUYATNO',kontak:'08176552009'},
  {noRumah:'0005278853',nama:'MANIS M',kontak:'0887433063411'},
  {noRumah:'0005283014',nama:'RENA SANJAYA',kontak:'081290340236'},
  {noRumah:'0005285221',nama:'ALEX',kontak:'081510924462'},
  {noRumah:'0005285998',nama:'RIS SUDRAJAT',kontak:'081296372096'},
  {noRumah:'0005287373',nama:'WAHYU SRI - ALM. UJO',kontak:'081217976033'},
  {noRumah:'0005291576',nama:'MOH IDHAM',kontak:'081287044231'},
  {noRumah:'0005303971',nama:'ZAINUDIN',kontak:'085691300893'},
  {noRumah:'0005307844',nama:'GUSMAN URIP',kontak:'085710772504'},
  {noRumah:'0005309165',nama:'NOVI AZIS',kontak:'085692347458'},
  {noRumah:'0005316017',nama:'ARYA',kontak:'081345241482'},
  {noRumah:'0005337436',nama:'GUNUNG ISWAHYUDI',kontak:'082114777892'},
  {noRumah:'0005340151',nama:'KEBAB / IAN',kontak:''},
  {noRumah:'0005360954',nama:'KARDI',kontak:'087822243515'},
  {noRumah:'0005369731',nama:'AMAR',kontak:'081213567147'},
  {noRumah:'0005431628',nama:'WAFA',kontak:'085858170203'},
  {noRumah:'0005434174',nama:'DEDY NUR',kontak:'08999997092'},
  {noRumah:'0005460037',nama:'TURUT',kontak:'085710476147'},
  {noRumah:'0005524396',nama:'JODHI P',kontak:'085697791189'},
  {noRumah:'0005551748',nama:'BEBEN',kontak:'081290852256'},
  {noRumah:'0005649390',nama:'YUSUF',kontak:'KONTRAK - HJ UTI'},
  {noRumah:'0006037427',nama:'ANGGI',kontak:'085174097474'},
  {noRumah:'0006042743',nama:"MA'RUF",kontak:'089513899071'},
  {noRumah:'0006044884',nama:'IRINA',kontak:'085960270390'},
  {noRumah:'0006045427',nama:'RANGGA',kontak:'082374904196'},
  {noRumah:'0006048796',nama:'SRI-WANTO',kontak:'081316413560'},
  {noRumah:'0006050900',nama:'ALVIN',kontak:'081361985070'},
  {noRumah:'0006060022',nama:'ARTHA',kontak:'089601711149'},
  {noRumah:'0006060363',nama:'SHALI',kontak:'0813382325529'},
  {noRumah:'0006074245',nama:'SUTRISNA',kontak:''},
  {noRumah:'0006077888',nama:'DEA',kontak:'082272476395'},
  {noRumah:'0006081313',nama:'BP ADIT WARKOP',kontak:''},
  {noRumah:'0006084744',nama:'FURQON',kontak:'083812922913'},
  {noRumah:'0006088629',nama:'REZA',kontak:'087882321722'},
  {noRumah:'0006088891',nama:'DWI M',kontak:'081388968519'},
  {noRumah:'0006091341',nama:'WAHADI',kontak:'085893576614'},
  {noRumah:'0006092043',nama:'OCA',kontak:''},
  {noRumah:'0006094203',nama:'RISMA JARKASI',kontak:'08174900107'},
  {noRumah:'0006098261',nama:'MESIASH',kontak:'085975444349'},
  {noRumah:'0006101204',nama:'ANDRIYANSAH',kontak:'089602814473'},
  {noRumah:'0006102662',nama:'RAFLI YOLANDA',kontak:'081214134243'},
  {noRumah:'0006106774',nama:'DEDY',kontak:'081281818056'},
  {noRumah:'0006109093',nama:'OKTARIA M',kontak:'081289023772'},
  {noRumah:'0006111030',nama:'AVININDA',kontak:'085914062743'},
  {noRumah:'0006114965',nama:'RIZKY C',kontak:''},
  {noRumah:'0006115130',nama:'HERA S',kontak:'085959466016'},
  {noRumah:'0006123136',nama:'YUNI',kontak:'081381249809'},
  {noRumah:'0006125818',nama:'SULISTIONO',kontak:'081906126161'},
  {noRumah:'0006127061',nama:'GIANDRA',kontak:'083168026208'},
  {noRumah:'0012477582',nama:'BEBEK',kontak:''},
  {noRumah:'0049622738',nama:'REGITA W',kontak:'082225618949'},
];

// Gabungkan semua data warga
const ALL_WARGA = [...WARGA_DEFAULT, ...WARGA_DEFAULT_2, ...WARGA_DEFAULT_3, ...WARGA_DEFAULT_4, ...WARGA_DEFAULT_5];

// ===== RENDER TABEL IURAN PUBLIK =====
(function renderPublicIuran() {
  const tbody = document.getElementById('tbodyIuranPublic');
  if (!tbody) return;

  const fmtRp   = n => 'Rp ' + (n||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const fmtDate = d => {
    if (!d) return '-';
    const p = d.split('-'), m = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return +p[2]+' '+(m[+p[1]]||'')+' '+p[0];
  };

  // Ambil data dari localStorage (diupdate admin), fallback ke data default
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem('rt04_iuran')) || []; } catch(e) { saved = []; }

  // Buat map noRumah → status & tglBayar dari localStorage
  const statusMap = {};
  saved.forEach(x => { statusMap[x.noRumah] = { status: x.status||'Belum Bayar', tglBayar: x.tglBayar||'' }; });

  let lunas = 0, totalTerkumpul = 0;

  tbody.innerHTML = ALL_WARGA.map((w, i) => {
    const info      = statusMap[w.noRumah] || { status:'Belum Bayar', tglBayar:'' };
    const isLunas   = info.status === 'Lunas';
    if (isLunas) { lunas++; totalTerkumpul += 50000; }
    const statusHtml = isLunas
      ? '<span class="status-lunas">Lunas</span>'
      : '<span class="status-belum">Belum Bayar</span>';
    return `<tr>
      <td>${i+1}</td>
      <td>${w.noRumah}</td>
      <td>${w.nama}</td>
      <td style="font-size:.82rem;color:#555">${w.kontak||'-'}</td>
      <td>Rp 30.000</td>
      <td>Rp 20.000</td>
      <td><strong>Rp 50.000</strong></td>
      <td>${statusHtml}</td>
      <td>${fmtDate(info.tglBayar)}</td>
    </tr>`;
  }).join('');

  const belum = ALL_WARGA.length - lunas;
  const elLunas = document.getElementById('statLunas');
  const elBelum = document.getElementById('statBelum');
  const elTotal = document.getElementById('statTotal');
  if (elLunas) elLunas.textContent = lunas;
  if (elBelum) elBelum.textContent = belum;
  if (elTotal) elTotal.textContent = fmtRp(totalTerkumpul);
})();
