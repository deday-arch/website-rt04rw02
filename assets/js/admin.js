/* ============================================================
   ADMIN.JS — Auth + CRUD Website RT 04 / RW 02
   Versi bersih — tanpa duplikat
   ============================================================ */

// ── AKUN ADMIN ─────────────────────────────────────────────
const ADMIN_ACCOUNTS = { 'admin':'rt04rw02@2026', 'ketua.rt':'Jombang@2026', 'sekretaris':'Ciputat@2026' };
const SESSION_KEY = 'rt04_admin_session';

// ── AUTH ────────────────────────────────────────────────────
function doLogin(e) {
  if (e) e.preventDefault();
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  if (ADMIN_ACCOUNTS[user] && ADMIN_ACCOUNTS[user] === pass) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, time: Date.now() }));
    window.location.href = 'admin-dashboard.html';
  } else {
    if (errEl) errEl.style.display = 'flex';
    document.getElementById('loginPass').value = '';
  }
}
function checkAuth() {
  const s = sessionStorage.getItem(SESSION_KEY);
  if (!s) { window.location.href = 'admin-login.html'; return null; }
  return JSON.parse(s);
}
function doLogout() { sessionStorage.removeItem(SESSION_KEY); window.location.href = 'admin-login.html'; }
function togglePw() {
  const inp = document.getElementById('loginPass'), ico = document.getElementById('pwIcon');
  if (inp.type === 'password') { inp.type = 'text'; ico.className = 'fas fa-eye-slash'; }
  else { inp.type = 'password'; ico.className = 'fas fa-eye'; }
}

// ── HELPERS ─────────────────────────────────────────────────
function getData(k)       { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } }
function saveData(k, arr) { localStorage.setItem(k, JSON.stringify(arr)); }
function genId()          { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function esc(s)           { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function num(n)           { return (n||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
function fmtDate(d)       { if (!d) return '-'; const p=d.split('-'), m=['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']; return +p[2]+' '+(m[+p[1]]||'')+' '+p[0]; }
function badgeClass(k)    { return ({Penting:'red',Kegiatan:'blue',Info:'green',Spesial:'orange'})[k]||'blue'; }
function urgBadge(u)      { return ({'Darurat / Emergency':'red',Mendesak:'orange',Normal:'blue'})[u]||'blue'; }
function statusClass(s)   { return ({Selesai:'selesai',Diproses:'diproses',Masuk:'masuk'})[s]||'masuk'; }

// ── TOAST ───────────────────────────────────────────────────
function showToast(msg, type='success') {
  let c = document.getElementById('toastContainer');
  if (!c) { c = document.createElement('div'); c.id='toastContainer'; c.className='toast-container'; document.body.appendChild(c); }
  const icons = {success:'fa-circle-check',error:'fa-circle-xmark',info:'fa-circle-info'};
  const t = document.createElement('div');
  t.className = 'toast '+type;
  t.innerHTML = '<i class="fas '+(icons[type]||icons.info)+'"></i> '+msg;
  c.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .4s'; setTimeout(()=>t.remove(),400); },3000);
}

// ── MODAL / CONFIRM ─────────────────────────────────────────
function openModal(id)  { const e=document.getElementById(id); if(e) e.classList.add('open'); }
function closeModal(id) { const e=document.getElementById(id); if(e) e.classList.remove('open'); }
let _cb = null;
function confirmDelete(label, cb) {
  _cb = cb;
  const el=document.getElementById('confirmLabel'); if(el) el.textContent=label;
  const ov=document.getElementById('confirmOverlay'); if(ov) ov.classList.add('open');
}
function confirmYes() { const ov=document.getElementById('confirmOverlay'); if(ov) ov.classList.remove('open'); if(_cb){_cb();_cb=null;} }
function confirmNo()  { const ov=document.getElementById('confirmOverlay'); if(ov) ov.classList.remove('open'); }

// ══ CRUD: PENGUMUMAN ══════════════════════════════════════
const KEY_PENGUMUMAN = 'rt04_pengumuman';
function getPengumuman() {
  const d = getData(KEY_PENGUMUMAN);
  if (!d.length) { const def=[{id:genId(),judul:'Pembayaran Iuran Juli 2026',isi:'Batas pembayaran 31 Juli 2026.',kategori:'Penting',tanggal:'2026-07-01'},{id:genId(),judul:'Kerja Bakti Lingkungan',isi:'Minggu 27 Juli 2026 pukul 07.00 WIB.',kategori:'Kegiatan',tanggal:'2026-07-20'},{id:genId(),judul:'Pendaftaran UMKM Baru',isi:'Hubungi sekretaris RT untuk mendaftarkan usaha.',kategori:'Info',tanggal:'2026-07-15'}]; saveData(KEY_PENGUMUMAN,def); return def; }
  return d;
}
function renderPengumumanTable(filter='') {
  const tbody=document.getElementById('tbodyPengumuman'); if(!tbody) return;
  const data=getPengumuman().filter(x=>(x.judul+x.isi).toLowerCase().includes(filter.toLowerCase()));
  if(!data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="5">Tidak ada data.</td></tr>';return;}
  tbody.innerHTML=data.map((x,i)=>`<tr><td>${i+1}</td><td><strong>${esc(x.judul)}</strong></td><td><span class="badge badge-${badgeClass(x.kategori)}">${esc(x.kategori)}</span></td><td>${fmtDate(x.tanggal)}</td><td><div class="action-btns"><button class="btn-edit" onclick="editPengumuman('${x.id}')"><i class="fas fa-pen"></i> Edit</button><button class="btn-del" onclick="deletePengumuman('${x.id}','${esc(x.judul)}')"><i class="fas fa-trash"></i> Hapus</button></div></td></tr>`).join('');
}
function openAddPengumuman() { document.getElementById('modalPengumumanTitle').textContent='Tambah Pengumuman'; ['pngId','pngJudul','pngIsi'].forEach(id=>document.getElementById(id).value=''); document.getElementById('pngKategori').value='Info'; document.getElementById('pngTanggal').value=new Date().toISOString().slice(0,10); openModal('modalPengumuman'); }
function editPengumuman(id) { const x=getPengumuman().find(p=>p.id===id); if(!x) return; document.getElementById('modalPengumumanTitle').textContent='Edit Pengumuman'; document.getElementById('pngId').value=x.id; document.getElementById('pngJudul').value=x.judul; document.getElementById('pngIsi').value=x.isi; document.getElementById('pngKategori').value=x.kategori; document.getElementById('pngTanggal').value=x.tanggal; openModal('modalPengumuman'); }
function savePengumuman() {
  const id=document.getElementById('pngId').value, judul=document.getElementById('pngJudul').value.trim(), isi=document.getElementById('pngIsi').value.trim(), kategori=document.getElementById('pngKategori').value, tanggal=document.getElementById('pngTanggal').value;
  if(!judul||!isi){showToast('Judul dan isi wajib diisi!','error');return;}
  let data=getPengumuman();
  if(id){data=data.map(x=>x.id===id?{...x,judul,isi,kategori,tanggal}:x);showToast('Pengumuman diperbarui!');}
  else{data.unshift({id:genId(),judul,isi,kategori,tanggal});showToast('Pengumuman ditambahkan!');}
  saveData(KEY_PENGUMUMAN,data); closeModal('modalPengumuman'); renderPengumumanTable(); updateDashStats();
}
function deletePengumuman(id,label) { confirmDelete('pengumuman "'+label+'"',()=>{saveData(KEY_PENGUMUMAN,getPengumuman().filter(x=>x.id!==id));showToast('Dihapus!','info');renderPengumumanTable();updateDashStats();}); }

// ══ CRUD: IURAN ═══════════════════════════════════════════
const KEY_IURAN = 'rt04_iuran';
// Data warga dari Card User List
const DEFAULT_WARGA = [
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
  {noRumah:'0006042743',nama:'MA\'RUF',kontak:'089513899071'},
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
function getIuran() {
  const d=getData(KEY_IURAN);
  if(!d.length){
    const def=DEFAULT_WARGA.map(w=>({
      id:genId(),
      noRumah:w.noRumah,
      nama:w.nama,
      kebersihan:30000,
      keamanan:20000,
      status:'Belum Bayar',
      tglBayar:'',
      kontak:w.kontak
    }));
    saveData(KEY_IURAN,def);
    return def;
  }
  return d;
}
function renderIuranTable(filter='') {
  const tbody=document.getElementById('tbodyIuran'); if(!tbody) return;
  const data=getIuran().filter(x=>(x.nama+x.noRumah).toLowerCase().includes(filter.toLowerCase()));
  if(!data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="9">Tidak ada data.</td></tr>';return;}
  tbody.innerHTML=data.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.noRumah)}</td><td>${esc(x.nama)}<br><small style="color:#888">${esc(x.kontak||'-')}</small></td><td>Rp ${num(x.kebersihan)}</td><td>Rp ${num(x.keamanan)}</td><td><strong>Rp ${num((x.kebersihan||0)+(x.keamanan||0))}</strong></td><td><span class="status-${x.status==='Lunas'?'lunas':'belum'}">${esc(x.status)}</span></td><td>${x.tglBayar?fmtDate(x.tglBayar):'-'}</td><td><div class="action-btns"><button class="btn-edit" onclick="editIuran('${x.id}')"><i class="fas fa-pen"></i> Edit</button><button class="btn-del" onclick="deleteIuran('${x.id}','${esc(x.nama)}')"><i class="fas fa-trash"></i> Hapus</button></div></td></tr>`).join('');
}
function openAddIuran(){document.getElementById('modalIuranTitle').textContent='Tambah Data Iuran';['iurId','iurNoRumah','iurNama','iurTgl','iurKontak'].forEach(id=>document.getElementById(id)&&(document.getElementById(id).value=''));document.getElementById('iurKebersihan').value=30000;document.getElementById('iurKeamanan').value=20000;document.getElementById('iurStatus').value='Belum Bayar';openModal('modalIuran');}
function editIuran(id){const x=getIuran().find(r=>r.id===id);if(!x)return;document.getElementById('modalIuranTitle').textContent='Edit Data Iuran';document.getElementById('iurId').value=x.id;document.getElementById('iurNoRumah').value=x.noRumah;document.getElementById('iurNama').value=x.nama;document.getElementById('iurKebersihan').value=x.kebersihan;document.getElementById('iurKeamanan').value=x.keamanan;document.getElementById('iurStatus').value=x.status;document.getElementById('iurTgl').value=x.tglBayar||'';const kEl=document.getElementById('iurKontak');if(kEl)kEl.value=x.kontak||'';openModal('modalIuran');}
function saveIuran(){const id=document.getElementById('iurId').value,noRumah=document.getElementById('iurNoRumah').value.trim(),nama=document.getElementById('iurNama').value.trim(),kebersihan=parseInt(document.getElementById('iurKebersihan').value)||0,keamanan=parseInt(document.getElementById('iurKeamanan').value)||0,status=document.getElementById('iurStatus').value,tglBayar=document.getElementById('iurTgl').value,kontak=(document.getElementById('iurKontak')?.value||'').trim();if(!noRumah||!nama){showToast('No. kartu dan nama wajib diisi!','error');return;}let data=getIuran();if(id){data=data.map(x=>x.id===id?{...x,noRumah,nama,kebersihan,keamanan,status,tglBayar,kontak}:x);showToast('Data iuran diperbarui!');}else{data.push({id:genId(),noRumah,nama,kebersihan,keamanan,status,tglBayar,kontak});showToast('Data iuran ditambahkan!');}saveData(KEY_IURAN,data);closeModal('modalIuran');renderIuranTable();updateDashStats();}
function deleteIuran(id,label){confirmDelete('data iuran "'+label+'"',()=>{saveData(KEY_IURAN,getIuran().filter(x=>x.id!==id));showToast('Dihapus!','info');renderIuranTable();updateDashStats();});}

// ══ CRUD: UMKM ════════════════════════════════════════════
const KEY_UMKM = 'rt04_umkm';
function getUmkm(){const d=getData(KEY_UMKM);if(!d.length){const def=[{id:genId(),nama:'Warung Bu Sari',pemilik:'Sari Mulyani',noRumah:'No. 7',kategori:'Makanan & Minuman',deskripsi:'Nasi uduk, lontong sayur, gorengan. Buka 06.00-10.00.',kontak:'0812-1111-2222'},{id:genId(),nama:'Bakery Lestari',pemilik:'Lestari Wulandari',noRumah:'No. 12',kategori:'Makanan & Minuman',deskripsi:'Kue ulang tahun, brownies, roti tawar.',kontak:'0813-3333-4444'},{id:genId(),nama:'Toko Sembako Pak Hendra',pemilik:'Hendra Wijaya',noRumah:'No. 8',kategori:'Sembako',deskripsi:'Kebutuhan dapur lengkap. Buka 07.00-21.00.',kontak:'0814-5555-6666'},{id:genId(),nama:'Salon Nova',pemilik:'Nova Anggraini',noRumah:'No. 20',kategori:'Jasa',deskripsi:'Potong rambut, creambath, rebonding.',kontak:'0815-7777-8888'},{id:genId(),nama:'Batik Kartini',pemilik:'Kartini Sari',noRumah:'No. 11',kategori:'Kerajinan',deskripsi:'Batik tulis dan cap. Pesanan seragam.',kontak:'0816-9999-0000'},{id:genId(),nama:'Servis Elektronik Pak Budi',pemilik:'Budi Prasetyo',noRumah:'No. 2',kategori:'Jasa',deskripsi:'Perbaikan TV, kulkas, mesin cuci, AC.',kontak:'0817-1111-3333'}];saveData(KEY_UMKM,def);return def;}return d;}
function renderUmkmTable(filter=''){const tbody=document.getElementById('tbodyUmkm');if(!tbody)return;const data=getUmkm().filter(x=>(x.nama+x.pemilik+x.kategori).toLowerCase().includes(filter.toLowerCase()));if(!data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="6">Tidak ada UMKM.</td></tr>';return;}tbody.innerHTML=data.map((x,i)=>`<tr><td>${i+1}</td><td><strong>${esc(x.nama)}</strong><br><small>${esc(x.pemilik)}</small></td><td>${esc(x.noRumah)}</td><td>${esc(x.kategori)}</td><td>${esc(x.kontak)}</td><td><div class="action-btns"><button class="btn-edit" onclick="editUmkm('${x.id}')"><i class="fas fa-pen"></i> Edit</button><button class="btn-del" onclick="deleteUmkm('${x.id}','${esc(x.nama)}')"><i class="fas fa-trash"></i> Hapus</button></div></td></tr>`).join('');}
function openAddUmkm(){document.getElementById('modalUmkmTitle').textContent='Tambah UMKM';['umkmId','umkmNama','umkmPemilik','umkmNoRumah','umkmDeskripsi','umkmKontak'].forEach(id=>document.getElementById(id).value='');document.getElementById('umkmKategori').value='Makanan & Minuman';openModal('modalUmkm');}
function editUmkm(id){const x=getUmkm().find(r=>r.id===id);if(!x)return;document.getElementById('modalUmkmTitle').textContent='Edit UMKM';document.getElementById('umkmId').value=x.id;document.getElementById('umkmNama').value=x.nama;document.getElementById('umkmPemilik').value=x.pemilik;document.getElementById('umkmNoRumah').value=x.noRumah;document.getElementById('umkmKategori').value=x.kategori;document.getElementById('umkmDeskripsi').value=x.deskripsi;document.getElementById('umkmKontak').value=x.kontak;openModal('modalUmkm');}
function saveUmkm(){const id=document.getElementById('umkmId').value,nama=document.getElementById('umkmNama').value.trim(),pemilik=document.getElementById('umkmPemilik').value.trim(),noRumah=document.getElementById('umkmNoRumah').value.trim(),kategori=document.getElementById('umkmKategori').value,deskripsi=document.getElementById('umkmDeskripsi').value.trim(),kontak=document.getElementById('umkmKontak').value.trim();if(!nama||!pemilik){showToast('Nama usaha dan pemilik wajib!','error');return;}let data=getUmkm();if(id){data=data.map(x=>x.id===id?{...x,nama,pemilik,noRumah,kategori,deskripsi,kontak}:x);showToast('UMKM diperbarui!');}else{data.push({id:genId(),nama,pemilik,noRumah,kategori,deskripsi,kontak});showToast('UMKM ditambahkan!');}saveData(KEY_UMKM,data);closeModal('modalUmkm');renderUmkmTable();updateDashStats();}
function deleteUmkm(id,label){confirmDelete('UMKM "'+label+'"',()=>{saveData(KEY_UMKM,getUmkm().filter(x=>x.id!==id));showToast('UMKM dihapus!','info');renderUmkmTable();updateDashStats();});}

// ══ CRUD: KEGIATAN ════════════════════════════════════════
const KEY_KEGIATAN = 'rt04_kegiatan';
function getKegiatan(){const d=getData(KEY_KEGIATAN);if(!d.length){const def=[{id:genId(),nama:'Kerja Bakti Lingkungan',tanggal:'2026-07-27',waktu:'07.00-12.00 WIB',lokasi:'Seluruh RT 04',peserta:'Semua warga',kategori:'Rutin',status:'Mendatang'},{id:genId(),nama:'Peringatan HUT RI ke-81',tanggal:'2026-08-17',waktu:'07.00-22.00 WIB',lokasi:'Lapangan RT 04',peserta:'Semua warga',kategori:'Spesial',status:'Mendatang'},{id:genId(),nama:'Arisan Bulanan Ibu-Ibu',tanggal:'2026-08-03',waktu:'09.00-12.00 WIB',lokasi:'Rumah Bu Ketua PKK',peserta:'Ibu-ibu warga',kategori:'Rutin',status:'Mendatang'},{id:genId(),nama:'Halal Bihalal Warga',tanggal:'2026-06-15',waktu:'09.00-13.00 WIB',lokasi:'Lapangan RT 04',peserta:'Semua warga',kategori:'Spesial',status:'Selesai'}];saveData(KEY_KEGIATAN,def);return def;}return d;}
function renderKegiatanTable(filter=''){const tbody=document.getElementById('tbodyKegiatan');if(!tbody)return;const data=getKegiatan().filter(x=>(x.nama+x.lokasi).toLowerCase().includes(filter.toLowerCase()));if(!data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="7">Tidak ada kegiatan.</td></tr>';return;}tbody.innerHTML=data.map((x,i)=>`<tr><td>${i+1}</td><td><strong>${esc(x.nama)}</strong></td><td>${fmtDate(x.tanggal)}</td><td>${esc(x.waktu)}</td><td>${esc(x.lokasi)}</td><td><span class="badge badge-${x.status==='Selesai'?'blue':'green'}">${esc(x.status)}</span></td><td><div class="action-btns"><button class="btn-edit" onclick="editKegiatan('${x.id}')"><i class="fas fa-pen"></i> Edit</button><button class="btn-del" onclick="deleteKegiatan('${x.id}','${esc(x.nama)}')"><i class="fas fa-trash"></i> Hapus</button></div></td></tr>`).join('');}
function openAddKegiatan(){document.getElementById('modalKegiatanTitle').textContent='Tambah Kegiatan';['kegId','kegNama','kegTanggal','kegWaktu','kegLokasi','kegPeserta'].forEach(id=>document.getElementById(id).value='');document.getElementById('kegKategori').value='Rutin';document.getElementById('kegStatus').value='Mendatang';openModal('modalKegiatan');}
function editKegiatan(id){const x=getKegiatan().find(r=>r.id===id);if(!x)return;document.getElementById('modalKegiatanTitle').textContent='Edit Kegiatan';document.getElementById('kegId').value=x.id;document.getElementById('kegNama').value=x.nama;document.getElementById('kegTanggal').value=x.tanggal;document.getElementById('kegWaktu').value=x.waktu;document.getElementById('kegLokasi').value=x.lokasi;document.getElementById('kegPeserta').value=x.peserta;document.getElementById('kegKategori').value=x.kategori;document.getElementById('kegStatus').value=x.status;openModal('modalKegiatan');}
function saveKegiatan(){const id=document.getElementById('kegId').value,nama=document.getElementById('kegNama').value.trim(),tanggal=document.getElementById('kegTanggal').value,waktu=document.getElementById('kegWaktu').value.trim(),lokasi=document.getElementById('kegLokasi').value.trim(),peserta=document.getElementById('kegPeserta').value.trim(),kategori=document.getElementById('kegKategori').value,status=document.getElementById('kegStatus').value;if(!nama||!tanggal){showToast('Nama dan tanggal wajib!','error');return;}let data=getKegiatan();if(id){data=data.map(x=>x.id===id?{...x,nama,tanggal,waktu,lokasi,peserta,kategori,status}:x);showToast('Kegiatan diperbarui!');}else{data.unshift({id:genId(),nama,tanggal,waktu,lokasi,peserta,kategori,status});showToast('Kegiatan ditambahkan!');}saveData(KEY_KEGIATAN,data);closeModal('modalKegiatan');renderKegiatanTable();updateDashStats();}
function deleteKegiatan(id,label){confirmDelete('kegiatan "'+label+'"',()=>{saveData(KEY_KEGIATAN,getKegiatan().filter(x=>x.id!==id));showToast('Dihapus!','info');renderKegiatanTable();updateDashStats();});}

// ══ CRUD: LAPORAN ═════════════════════════════════════════
const KEY_LAPORAN = 'rt04_laporan';
function getLaporan(){const d=getData(KEY_LAPORAN);if(!d.length){const def=[{id:genId(),nama:'Warga No.5',kontak:'0812-xxx',jenis:'Gangguan Keamanan',lokasi:'Depan gang RT 04',deskripsi:'Ada orang tidak dikenal berkeliaran.',urgensi:'Mendesak',status:'Selesai',tanggal:'2026-07-20'},{id:genId(),nama:'Warga No.9',kontak:'0813-xxx',jenis:'Masalah Sampah',lokasi:'TPS RT 04',deskripsi:'Sampah 3 hari belum diangkut.',urgensi:'Normal',status:'Diproses',tanggal:'2026-07-18'},{id:genId(),nama:'Warga No.3',kontak:'0814-xxx',jenis:'Fasilitas Umum Rusak',lokasi:'Blok B RT 04',deskripsi:'Lampu jalan mati.',urgensi:'Normal',status:'Selesai',tanggal:'2026-07-15'}];saveData(KEY_LAPORAN,def);return def;}return d;}
function renderLaporanTable(filter=''){const tbody=document.getElementById('tbodyLaporan');if(!tbody)return;const data=getLaporan().filter(x=>(x.jenis+x.nama+x.lokasi).toLowerCase().includes(filter.toLowerCase()));if(!data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="7">Tidak ada laporan.</td></tr>';return;}tbody.innerHTML=data.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.nama)}</td><td>${esc(x.jenis)}</td><td>${esc(x.lokasi)}</td><td><span class="badge badge-${urgBadge(x.urgensi)}">${esc(x.urgensi)}</span></td><td><span class="status-${statusClass(x.status)}">${esc(x.status)}</span></td><td><div class="action-btns"><button class="btn-edit" onclick="editLaporan('${x.id}')"><i class="fas fa-pen"></i> Update</button><button class="btn-del" onclick="deleteLaporan('${x.id}','${esc(x.jenis)}')"><i class="fas fa-trash"></i> Hapus</button></div></td></tr>`).join('');}
function editLaporan(id){const x=getLaporan().find(r=>r.id===id);if(!x)return;document.getElementById('lapId').value=x.id;document.getElementById('lapStatus').value=x.status;document.getElementById('lapJenis').textContent=x.jenis;document.getElementById('lapNama').textContent=x.nama;document.getElementById('lapLokasi').textContent=x.lokasi;document.getElementById('lapDeskripsi').textContent=x.deskripsi;openModal('modalLaporan');}
function saveLaporan(){const id=document.getElementById('lapId').value,status=document.getElementById('lapStatus').value;let data=getLaporan();data=data.map(x=>x.id===id?{...x,status}:x);saveData(KEY_LAPORAN,data);showToast('Status laporan diperbarui!');closeModal('modalLaporan');renderLaporanTable();}
function deleteLaporan(id,label){confirmDelete('laporan "'+label+'"',()=>{saveData(KEY_LAPORAN,getLaporan().filter(x=>x.id!==id));showToast('Dihapus!','info');renderLaporanTable();updateDashStats();});}

// ══ CRUD: RONDA ═══════════════════════════════════════════
const KEY_RONDA = 'rt04_ronda';
function getRonda(){const d=getData(KEY_RONDA);if(!d.length){const def=[{id:genId(),hari:'Senin',tanggal:'21 Jul 2026',petugas:'Budi P., Hendra W., Faisal H.',koordinator:'Faisal H.',shift:'22.00–04.00'},{id:genId(),hari:'Selasa',tanggal:'22 Jul 2026',petugas:'Ahmad S., Dedi K., Joko S.',koordinator:'Ahmad S.',shift:'22.00–04.00'},{id:genId(),hari:'Rabu',tanggal:'23 Jul 2026',petugas:'Luthfi R., Rudi S., Tono M.',koordinator:'Luthfi R.',shift:'22.00–04.00'},{id:genId(),hari:'Kamis',tanggal:'24 Jul 2026',petugas:'Agus P., Wahyu S., Rizki A.',koordinator:'Agus P.',shift:'22.00–04.00'},{id:genId(),hari:'Jumat',tanggal:'25 Jul 2026',petugas:'Budi P., Hendra W., Dedi K.',koordinator:'Budi P.',shift:'22.00–04.00'},{id:genId(),hari:'Sabtu',tanggal:'26 Jul 2026',petugas:'Ahmad S., Faisal H., Joko S.',koordinator:'Faisal H.',shift:'22.00–04.00'},{id:genId(),hari:'Minggu',tanggal:'27 Jul 2026',petugas:'Luthfi R., Tono M., Wahyu S.',koordinator:'Luthfi R.',shift:'22.00–04.00'}];saveData(KEY_RONDA,def);return def;}return d;}
function renderRondaTable(filter=''){const tbody=document.getElementById('tbodyRonda');if(!tbody)return;const data=getRonda().filter(x=>(x.hari+x.petugas).toLowerCase().includes(filter.toLowerCase()));if(!data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="5">Tidak ada data.</td></tr>';return;}tbody.innerHTML=data.map((x,i)=>`<tr><td><strong>${esc(x.hari)}</strong><br><small>${esc(x.tanggal)}</small></td><td>${esc(x.petugas)}</td><td>${esc(x.shift)}</td><td>${esc(x.koordinator)}</td><td><div class="action-btns"><button class="btn-edit" onclick="editRonda('${x.id}')"><i class="fas fa-pen"></i> Edit</button><button class="btn-del" onclick="deleteRonda('${x.id}','${esc(x.hari)}')"><i class="fas fa-trash"></i> Hapus</button></div></td></tr>`).join('');}
function openAddRonda(){document.getElementById('modalRondaTitle').textContent='Tambah Jadwal Ronda';['rndId','rndHari','rndTanggal','rndPetugas','rndKoordinator'].forEach(id=>document.getElementById(id).value='');document.getElementById('rndShift').value='22.00–04.00';openModal('modalRonda');}
function editRonda(id){const x=getRonda().find(r=>r.id===id);if(!x)return;document.getElementById('modalRondaTitle').textContent='Edit Jadwal Ronda';document.getElementById('rndId').value=x.id;document.getElementById('rndHari').value=x.hari;document.getElementById('rndTanggal').value=x.tanggal;document.getElementById('rndPetugas').value=x.petugas;document.getElementById('rndShift').value=x.shift;document.getElementById('rndKoordinator').value=x.koordinator;openModal('modalRonda');}
function saveRonda(){const id=document.getElementById('rndId').value,hari=document.getElementById('rndHari').value.trim(),tanggal=document.getElementById('rndTanggal').value.trim(),petugas=document.getElementById('rndPetugas').value.trim(),shift=document.getElementById('rndShift').value.trim(),koordinator=document.getElementById('rndKoordinator').value.trim();if(!hari||!petugas){showToast('Hari dan petugas wajib!','error');return;}let data=getRonda();if(id){data=data.map(x=>x.id===id?{...x,hari,tanggal,petugas,shift,koordinator}:x);showToast('Jadwal diperbarui!');}else{data.push({id:genId(),hari,tanggal,petugas,shift,koordinator});showToast('Jadwal ditambahkan!');}saveData(KEY_RONDA,data);closeModal('modalRonda');renderRondaTable();}
function deleteRonda(id,label){confirmDelete('jadwal "'+label+'"',()=>{saveData(KEY_RONDA,getRonda().filter(x=>x.id!==id));showToast('Dihapus!','info');renderRondaTable();});}

// ══ DASHBOARD STATS + INIT ════════════════════════════════
function updateDashStats(){
  const ids=['statPengumuman','statIuran','statUmkm','statKegiatan'];
  const vals=[getPengumuman().length,getIuran().length,getUmkm().length,getKegiatan().length];
  ids.forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=vals[i];});
}

document.addEventListener('DOMContentLoaded',()=>{
  const href=window.location.href.toLowerCase();
  if(href.includes('admin-login')) return; // halaman login tidak perlu auth
  const session=checkAuth(); if(!session) return;
  document.querySelectorAll('#adminUsername').forEach(el=>el.textContent=session.user);
  if(href.includes('admin-dashboard'))    { updateDashStats(); }
  else if(href.includes('admin-pengumuman')) { renderPengumumanTable(); const s=document.getElementById('searchPengumuman'); if(s) s.addEventListener('input',e=>renderPengumumanTable(e.target.value)); }
  else if(href.includes('admin-iuran'))      { renderIuranTable();     const s=document.getElementById('searchIuran');     if(s) s.addEventListener('input',e=>renderIuranTable(e.target.value)); }
  else if(href.includes('admin-umkm'))       { renderUmkmTable();      const s=document.getElementById('searchUmkm');      if(s) s.addEventListener('input',e=>renderUmkmTable(e.target.value)); }
  else if(href.includes('admin-kegiatan'))   { renderKegiatanTable();  const s=document.getElementById('searchKegiatan');  if(s) s.addEventListener('input',e=>renderKegiatanTable(e.target.value)); }
  else if(href.includes('admin-laporan'))    { renderLaporanTable();   const s=document.getElementById('searchLaporan');   if(s) s.addEventListener('input',e=>renderLaporanTable(e.target.value)); }
  else if(href.includes('admin-ronda'))      { renderRondaTable();     const s=document.getElementById('searchRonda');     if(s) s.addEventListener('input',e=>renderRondaTable(e.target.value)); }
});
