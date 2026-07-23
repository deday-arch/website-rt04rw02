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
function getIuran() {
  const d=getData(KEY_IURAN); if(!d.length){const ns=['Ahmad Santoso','Budi Prasetyo','Citra Dewi','Dedi Kurniawan','Eka Rahayu','Faisal Hidayat','Gita Permata','Hendra Wijaya','Indah Lestari','Joko Santoso','Kartini Sari','Luthfi Rahman'],st=['Lunas','Lunas','Belum Bayar','Lunas','Belum Bayar','Lunas','Lunas','Belum Bayar','Lunas','Lunas','Belum Bayar','Lunas'],tl=['2026-07-02','2026-07-03','','2026-07-05','','2026-07-07','2026-07-08','','2026-07-10','2026-07-11','','2026-07-12'];const def=ns.map((n,i)=>({id:genId(),noRumah:'No.'+(i+1),nama:n,kebersihan:30000,keamanan:20000,status:st[i],tglBayar:tl[i]}));saveData(KEY_IURAN,def);return def;}return d;
}
function renderIuranTable(filter='') {
  const tbody=document.getElementById('tbodyIuran'); if(!tbody) return;
  const data=getIuran().filter(x=>(x.nama+x.noRumah).toLowerCase().includes(filter.toLowerCase()));
  if(!data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="9">Tidak ada data.</td></tr>';return;}
  tbody.innerHTML=data.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.noRumah)}</td><td>${esc(x.nama)}</td><td>Rp ${num(x.kebersihan)}</td><td>Rp ${num(x.keamanan)}</td><td><strong>Rp ${num((x.kebersihan||0)+(x.keamanan||0))}</strong></td><td><span class="status-${x.status==='Lunas'?'lunas':'belum'}">${esc(x.status)}</span></td><td>${x.tglBayar?fmtDate(x.tglBayar):'-'}</td><td><div class="action-btns"><button class="btn-edit" onclick="editIuran('${x.id}')"><i class="fas fa-pen"></i> Edit</button><button class="btn-del" onclick="deleteIuran('${x.id}','${esc(x.nama)}')"><i class="fas fa-trash"></i> Hapus</button></div></td></tr>`).join('');
}
function openAddIuran(){document.getElementById('modalIuranTitle').textContent='Tambah Data Iuran';['iurId','iurNoRumah','iurNama','iurTgl'].forEach(id=>document.getElementById(id).value='');document.getElementById('iurKebersihan').value=30000;document.getElementById('iurKeamanan').value=20000;document.getElementById('iurStatus').value='Belum Bayar';openModal('modalIuran');}
function editIuran(id){const x=getIuran().find(r=>r.id===id);if(!x)return;document.getElementById('modalIuranTitle').textContent='Edit Data Iuran';document.getElementById('iurId').value=x.id;document.getElementById('iurNoRumah').value=x.noRumah;document.getElementById('iurNama').value=x.nama;document.getElementById('iurKebersihan').value=x.kebersihan;document.getElementById('iurKeamanan').value=x.keamanan;document.getElementById('iurStatus').value=x.status;document.getElementById('iurTgl').value=x.tglBayar||'';openModal('modalIuran');}
function saveIuran(){const id=document.getElementById('iurId').value,noRumah=document.getElementById('iurNoRumah').value.trim(),nama=document.getElementById('iurNama').value.trim(),kebersihan=parseInt(document.getElementById('iurKebersihan').value)||0,keamanan=parseInt(document.getElementById('iurKeamanan').value)||0,status=document.getElementById('iurStatus').value,tglBayar=document.getElementById('iurTgl').value;if(!noRumah||!nama){showToast('No. rumah dan nama wajib diisi!','error');return;}let data=getIuran();if(id){data=data.map(x=>x.id===id?{...x,noRumah,nama,kebersihan,keamanan,status,tglBayar}:x);showToast('Data iuran diperbarui!');}else{data.push({id:genId(),noRumah,nama,kebersihan,keamanan,status,tglBayar});showToast('Data iuran ditambahkan!');}saveData(KEY_IURAN,data);closeModal('modalIuran');renderIuranTable();updateDashStats();}
function deleteIuran(id,label){confirmDelete('data iuran "'+label+'"',()=>{saveData(KEY_IURAN,getIuran().filter(x=>x.id!==id));showToast('Dihapus!','info');renderIuranTable();updateDashStats();});}

// ══ CRUD: UMKM ════════════════════════════════════════════
const KEY_UMKM = 'rt04_umkm';
function getUmkm(){const d=getData(KEY_UMKM);if(!d.length){const def=[{id:genId(),nama:'Warung Bu Sari',pemilik:'Sari Mulyani',noRumah:'No. 7',kategori:'Makanan & Minuman',deskripsi:'Nasi uduk, lontong sayur, gorengan. Buka 06.00-10.00.',kontak:'0812-1111-2222',gambar:''},{id:genId(),nama:'Bakery Lestari',pemilik:'Lestari Wulandari',noRumah:'No. 12',kategori:'Makanan & Minuman',deskripsi:'Kue ulang tahun, brownies, roti tawar homemade. Menerima pesanan.',kontak:'0813-3333-4444',gambar:''},{id:genId(),nama:'Toko Sembako Pak Hendra',pemilik:'Hendra Wijaya',noRumah:'No. 8',kategori:'Sembako',deskripsi:'Lengkap kebutuhan dapur sehari-hari. Buka 07.00-21.00.',kontak:'0814-5555-6666',gambar:''},{id:genId(),nama:'Salon Nova',pemilik:'Nova Anggraini',noRumah:'No. 20',kategori:'Jasa',deskripsi:'Potong rambut, creambath, rebonding, make-up. Menerima panggilan.',kontak:'0815-7777-8888',gambar:''},{id:genId(),nama:'Servis Elektronik Pak Budi',pemilik:'Budi Prasetyo',noRumah:'No. 2',kategori:'Jasa',deskripsi:'Perbaikan TV, kulkas, mesin cuci, AC. Berpengalaman 15 tahun.',kontak:'0817-1111-3333',gambar:''}];saveData(KEY_UMKM,def);return def;}return d;}
function renderUmkmTable(filter=''){const tbody=document.getElementById('tbodyUmkm');if(!tbody)return;const data=getUmkm().filter(x=>(x.nama+x.pemilik+x.kategori).toLowerCase().includes(filter.toLowerCase()));if(!data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="6">Tidak ada UMKM.</td></tr>';return;}tbody.innerHTML=data.map((x,i)=>`<tr><td>${i+1}</td><td><strong>${esc(x.nama)}</strong><br><small style="color:var(--text-muted)">${esc(x.pemilik)}</small>${x.gambar?'<br><small style="color:#16a34a"><i class="fas fa-image"></i> Ada foto</small>':''}</td><td>${esc(x.noRumah)}</td><td>${esc(x.kategori)}</td><td>${esc(x.kontak)}</td><td><div class="action-btns"><button class="btn-edit" onclick="editUmkm('${x.id}')"><i class="fas fa-pen"></i> Edit</button><button class="btn-del" onclick="deleteUmkm('${x.id}','${esc(x.nama)}')"><i class="fas fa-trash"></i> Hapus</button></div></td></tr>`).join('');}
function previewUmkmGambar(input){if(input.files&&input.files[0]){const r=new FileReader();r.onload=e=>{document.getElementById('umkmGambarData').value=e.target.result;document.getElementById('umkmGambarImg').src=e.target.result;document.getElementById('umkmGambarPreview').style.display='block';};r.readAsDataURL(input.files[0]);}}
function hapusUmkmGambar(){document.getElementById('umkmGambarData').value='';document.getElementById('umkmGambarImg').src='';document.getElementById('umkmGambarPreview').style.display='none';document.getElementById('umkmGambarFile').value='';}
function openAddUmkm(){document.getElementById('modalUmkmTitle').textContent='Tambah UMKM';['umkmId','umkmNama','umkmPemilik','umkmNoRumah','umkmDeskripsi','umkmKontak'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});document.getElementById('umkmKategori').value='Makanan & Minuman';hapusUmkmGambar();openModal('modalUmkm');}
function editUmkm(id){const x=getUmkm().find(r=>r.id===id);if(!x)return;document.getElementById('modalUmkmTitle').textContent='Edit UMKM';document.getElementById('umkmId').value=x.id;document.getElementById('umkmNama').value=x.nama;document.getElementById('umkmPemilik').value=x.pemilik;document.getElementById('umkmNoRumah').value=x.noRumah;document.getElementById('umkmKategori').value=x.kategori;document.getElementById('umkmDeskripsi').value=x.deskripsi;document.getElementById('umkmKontak').value=x.kontak;if(x.gambar){document.getElementById('umkmGambarData').value=x.gambar;document.getElementById('umkmGambarImg').src=x.gambar;document.getElementById('umkmGambarPreview').style.display='block';}else{hapusUmkmGambar();}openModal('modalUmkm');}
function saveUmkm(){const id=document.getElementById('umkmId').value,nama=document.getElementById('umkmNama').value.trim(),pemilik=document.getElementById('umkmPemilik').value.trim(),noRumah=document.getElementById('umkmNoRumah').value.trim(),kategori=document.getElementById('umkmKategori').value,deskripsi=document.getElementById('umkmDeskripsi').value.trim(),kontak=document.getElementById('umkmKontak').value.trim(),gambar=document.getElementById('umkmGambarData')?.value||'';if(!nama||!pemilik){showToast('Nama usaha dan pemilik wajib!','error');return;}let data=getUmkm();if(id){data=data.map(x=>x.id===id?{...x,nama,pemilik,noRumah,kategori,deskripsi,kontak,gambar}:x);showToast('UMKM diperbarui!');}else{data.unshift({id:genId(),nama,pemilik,noRumah,kategori,deskripsi,kontak,gambar});showToast('UMKM ditambahkan!');}saveData(KEY_UMKM,data);closeModal('modalUmkm');renderUmkmTable();updateDashStats();}
function deleteUmkm(id,label){confirmDelete('UMKM "'+label+'"',()=>{saveData(KEY_UMKM,getUmkm().filter(x=>x.id!==id));showToast('UMKM dihapus!','info');renderUmkmTable();updateDashStats();});}
rownies, roti tawar.',kontak:'0813-3333-4444'},{id:genId(),nama:'Toko Sembako Pak Hendra',pemilik:'Hendra Wijaya',noRumah:'No. 8',kategori:'Sembako',deskripsi:'Kebutuhan dapur lengkap. Buka 07.00-21.00.',kontak:'0814-5555-6666'},{id:genId(),nama:'Salon Nova',pemilik:'Nova Anggraini',noRumah:'No. 20',kategori:'Jasa',deskripsi:'Potong rambut, creambath, rebonding.',kontak:'0815-7777-8888'},{id:genId(),nama:'Batik Kartini',pemilik:'Kartini Sari',noRumah:'No. 11',kategori:'Kerajinan',deskripsi:'Batik tulis dan cap. Pesanan seragam.',kontak:'0816-9999-0000'},{id:genId(),nama:'Servis Elektronik Pak Budi',pemilik:'Budi Prasetyo',noRumah:'No. 2',kategori:'Jasa',deskripsi:'Perbaikan TV, kulkas, mesin cuci, AC.',kontak:'0817-1111-3333'}];saveData(KEY_UMKM,def);return def;}return d;}
function renderUmkmTable(filter=''){const tbody=document.getElementById('tbodyUmkm');if(!tbody)return;const data=getUmkm().filter(x=>(x.nama+x.pemilik+x.kategori).toLowerCase().includes(filter.toLowerCase()));if(!data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="6">Tidak ada UMKM.</td></tr>';return;}tbody.innerHTML=data.map((x,i)=>`<tr><td>${i+1}</td><td><strong>${esc(x.nama)}</strong><br><small>${esc(x.pemilik)}</small></td><td>${esc(x.noRumah)}</td><td>${esc(x.kategori)}</td><td>${esc(x.kontak)}</td><td><div class="action-btns"><button class="btn-edit" onclick="editUmkm('${x.id}')"><i class="fas fa-pen"></i> Edit</button><button class="btn-del" onclick="deleteUmkm('${x.id}','${esc(x.nama)}')"><i class="fas fa-trash"></i> Hapus</button></div></td></tr>`).join('');}
function openAddUmkm(){document.getElementById('modalUmkmTitle').textContent='Tambah UMKM';['umkmId','umkmNama','umkmPemilik','umkmNoRumah','umkmDeskripsi','umkmKontak'].forEach(id=>document.getElementById(id).value='');document.getElementById('umkmKategori').value='Makanan & Minuman';openModal('modalUmkm');}
function editUmkm(id){const x=getUmkm().find(r=>r.id===id);if(!x)return;document.getElementById('modalUmkmTitle').textContent='Edit UMKM';document.getElementById('umkmId').value=x.id;document.getElementById('umkmNama').value=x.nama;document.getElementById('umkmPemilik').value=x.pemilik;document.getElementById('umkmNoRumah').value=x.noRumah;document.getElementById('umkmKategori').value=x.kategori;document.getElementById('umkmDeskripsi').value=x.deskripsi;document.getElementById('umkmKontak').value=x.kontak;openModal('modalUmkm');}
function saveUmkm(){const id=document.getElementById('umkmId').value,nama=document.getElementById('umkmNama').value.trim(),pemilik=document.getElementById('umkmPemilik').value.trim(),noRumah=document.getElementById('umkmNoRumah').value.trim(),kategori=document.getElementById('umkmKategori').value,deskripsi=document.getElementById('umkmDeskripsi').value.trim(),kontak=document.getElementById('umkmKontak').value.trim();if(!nama||!pemilik){showToast('Nama usaha dan pemilik wajib!','error');return;}let data=getUmkm();if(id){data=data.map(x=>x.id===id?{...x,nama,pemilik,noRumah,kategori,deskripsi,kontak}:x);showToast('UMKM diperbarui!');}else{data.push({id:genId(),nama,pemilik,noRumah,kategori,deskripsi,kontak});showToast('UMKM ditambahkan!');}saveData(KEY_UMKM,data);closeModal('modalUmkm');renderUmkmTable();updateDashStats();}
function deleteUmkm(id,label){confirmDelete('UMKM "'+label+'"',()=>{saveData(KEY_UMKM,getUmkm().filter(x=>x.id!==id));showToast('UMKM dihapus!','info');renderUmkmTable();updateDashStats();});}

// ══ CRUD: KEGIATAN ════════════════════════════════════════
const KEY_KEGIATAN = 'rt04_kegiatan';
function getKegiatan(){const d=getData(KEY_KEGIATAN);if(!d.length){const def=[{id:genId(),nama:'Kerja Bakti Lingkungan',tanggal:'2026-07-27',waktu:'07.00-12.00 WIB',lokasi:'Seluruh RT 04',peserta:'Semua warga',kategori:'Rutin',status:'Mendatang',deskripsi:'Bersih-bersih lingkungan RT bersama seluruh warga. Membersihkan got, trotoar, dan fasilitas umum.',gambar:''},{id:genId(),nama:'Peringatan HUT RI ke-81',tanggal:'2026-08-17',waktu:'07.00-22.00 WIB',lokasi:'Lapangan RT 04',peserta:'Semua warga',kategori:'Spesial',status:'Mendatang',deskripsi:'Upacara bendera, lomba tradisional, panjat pinang, dan malam hiburan bersama warga.',gambar:''},{id:genId(),nama:'Arisan Bulanan Ibu-Ibu',tanggal:'2026-08-03',waktu:'09.00-12.00 WIB',lokasi:'Rumah Bu Ketua PKK',peserta:'Ibu-ibu warga',kategori:'Rutin',status:'Mendatang',deskripsi:'Arisan dan pertemuan rutin ibu-ibu PKK RT 04. Diisi dengan pengajian singkat dan sosialisasi program RT.',gambar:''},{id:genId(),nama:'Halal Bihalal Warga',tanggal:'2026-06-15',waktu:'09.00-13.00 WIB',lokasi:'Lapangan RT 04',peserta:'Semua warga',kategori:'Spesial',status:'Selesai',deskripsi:'Silaturahmi dan halal bihalal seluruh warga RT 04 pasca Idul Fitri. Dihadiri lebih dari 200 warga.',gambar:''}];saveData(KEY_KEGIATAN,def);return def;}return d;}
function renderKegiatanTable(filter=''){const tbody=document.getElementById('tbodyKegiatan');if(!tbody)return;const data=getKegiatan().filter(x=>(x.nama+x.lokasi).toLowerCase().includes(filter.toLowerCase()));if(!data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="7">Tidak ada kegiatan.</td></tr>';return;}tbody.innerHTML=data.map((x,i)=>`<tr><td>${i+1}</td><td><strong>${esc(x.nama)}</strong>${x.gambar?'<br><small style="color:#16a34a"><i class="fas fa-image"></i> Ada foto</small>':''}</td><td>${fmtDate(x.tanggal)}</td><td>${esc(x.waktu)}</td><td>${esc(x.lokasi)}</td><td><span class="badge badge-${x.status==='Selesai'?'blue':x.status==='Berlangsung'?'green':'orange'}">${esc(x.status)}</span></td><td><div class="action-btns"><button class="btn-edit" onclick="editKegiatan('${x.id}')"><i class="fas fa-pen"></i> Edit</button><button class="btn-del" onclick="deleteKegiatan('${x.id}','${esc(x.nama)}')"><i class="fas fa-trash"></i> Hapus</button></div></td></tr>`).join('');}
function previewKegGambar(input){if(input.files&&input.files[0]){const r=new FileReader();r.onload=e=>{document.getElementById('kegGambarData').value=e.target.result;document.getElementById('kegGambarImg').src=e.target.result;document.getElementById('kegGambarPreview').style.display='block';};r.readAsDataURL(input.files[0]);}}
function hapusKegGambar(){document.getElementById('kegGambarData').value='';document.getElementById('kegGambarImg').src='';document.getElementById('kegGambarPreview').style.display='none';document.getElementById('kegGambarFile').value='';}
function openAddKegiatan(){document.getElementById('modalKegiatanTitle').textContent='Tambah Kegiatan';['kegId','kegNama','kegTanggal','kegWaktu','kegLokasi','kegPeserta','kegDeskripsi'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});document.getElementById('kegKategori').value='Rutin';document.getElementById('kegStatus').value='Mendatang';hapusKegGambar();openModal('modalKegiatan');}
function editKegiatan(id){const x=getKegiatan().find(r=>r.id===id);if(!x)return;document.getElementById('modalKegiatanTitle').textContent='Edit Kegiatan';document.getElementById('kegId').value=x.id;document.getElementById('kegNama').value=x.nama;document.getElementById('kegTanggal').value=x.tanggal;document.getElementById('kegWaktu').value=x.waktu;document.getElementById('kegLokasi').value=x.lokasi;document.getElementById('kegPeserta').value=x.peserta;document.getElementById('kegKategori').value=x.kategori;document.getElementById('kegStatus').value=x.status;const dEl=document.getElementById('kegDeskripsi');if(dEl)dEl.value=x.deskripsi||'';if(x.gambar){document.getElementById('kegGambarData').value=x.gambar;document.getElementById('kegGambarImg').src=x.gambar;document.getElementById('kegGambarPreview').style.display='block';}else{hapusKegGambar();}openModal('modalKegiatan');}
function saveKegiatan(){const id=document.getElementById('kegId').value,nama=document.getElementById('kegNama').value.trim(),tanggal=document.getElementById('kegTanggal').value,waktu=document.getElementById('kegWaktu').value.trim(),lokasi=document.getElementById('kegLokasi').value.trim(),peserta=document.getElementById('kegPeserta').value.trim(),kategori=document.getElementById('kegKategori').value,status=document.getElementById('kegStatus').value,deskripsi=(document.getElementById('kegDeskripsi')?.value||'').trim(),gambar=document.getElementById('kegGambarData')?.value||'';if(!nama||!tanggal){showToast('Nama dan tanggal wajib!','error');return;}let data=getKegiatan();if(id){data=data.map(x=>x.id===id?{...x,nama,tanggal,waktu,lokasi,peserta,kategori,status,deskripsi,gambar}:x);showToast('Kegiatan diperbarui!');}else{data.unshift({id:genId(),nama,tanggal,waktu,lokasi,peserta,kategori,status,deskripsi,gambar});showToast('Kegiatan ditambahkan!');}saveData(KEY_KEGIATAN,data);closeModal('modalKegiatan');renderKegiatanTable();updateDashStats();}
function deleteKegiatan(id,label){confirmDelete('kegiatan "'+label+'"',()=>{saveData(KEY_KEGIATAN,getKegiatan().filter(x=>x.id!==id));showToast('Dihapus!','info');renderKegiatanTable();updateDashStats();});}

// ══ CRUD: PENGURUS ════════════════════════════════════════
const KEY_PENGURUS='rt04_pengurus';
const PENGURUS_DEF=[
  {id:'p01',nama:'NOVI AZIZ',jabatan:'Ketua RT',icon:'fa-user-tie',warna:'#1565c0',kontak:'085692347458',alamat:'',foto:''},
  {id:'p02',nama:'SAPTONO',jabatan:'Wakil Ketua RT',icon:'fa-user-check',warna:'#0288d1',kontak:'081318938658',alamat:'',foto:''},
  {id:'p03',nama:'LUKMAN',jabatan:'Sekretaris',icon:'fa-pen-clip',warna:'#0891b2',kontak:'089635719264',alamat:'',foto:''},
  {id:'p04',nama:'MERRY',jabatan:'Bendahara',icon:'fa-wallet',warna:'#d97706',kontak:'088975921141',alamat:'',foto:''},
  {id:'p05',nama:'ALEX',jabatan:'Penasehat',icon:'fa-star',warna:'#7c3aed',kontak:'081510924462',alamat:'',foto:''},
  {id:'p06',nama:"MA'RUF",jabatan:'Penasehat',icon:'fa-star',warna:'#7c3aed',kontak:'089513899071',alamat:'',foto:''},
  {id:'p07',nama:'M IDHAM',jabatan:'Humas',icon:'fa-bullhorn',warna:'#ea580c',kontak:'081287044231',alamat:'',foto:''},
  {id:'p08',nama:'AMAR',jabatan:'Humas',icon:'fa-bullhorn',warna:'#ea580c',kontak:'081213567147',alamat:'',foto:''},
  {id:'p09',nama:'G. ISWAHYUDI',jabatan:'Pembina',icon:'fa-chalkboard-user',warna:'#0f766e',kontak:'082114777892',alamat:'',foto:''},
  {id:'p10',nama:'DAMBAS',jabatan:'Ketua Keamanan',icon:'fa-shield-halved',warna:'#dc2626',kontak:'081517892573',alamat:'',foto:''},
  {id:'p11',nama:'SUPRAPTO',jabatan:'Wakil Ketua Keamanan',icon:'fa-shield',warna:'#b91c1c',kontak:'081318802245',alamat:'',foto:''},
  {id:'p12',nama:'FAUZI',jabatan:'Rois',icon:'fa-mosque',warna:'#16a34a',kontak:'089603025585',alamat:'',foto:''},
  {id:'p13',nama:'AGUNG',jabatan:'Perlengkapan',icon:'fa-boxes-stacked',warna:'#4f46e5',kontak:'085921211033',alamat:'',foto:''},
  {id:'p14',nama:'ZAINUDIN',jabatan:'Perlengkapan',icon:'fa-boxes-stacked',warna:'#4f46e5',kontak:'085691300893',alamat:'',foto:''},
  {id:'p15',nama:'ENCANG',jabatan:'Kepemudaan',icon:'fa-people-group',warna:'#db2777',kontak:'',alamat:'',foto:''},
  {id:'p16',nama:'ILYAS',jabatan:'Kepemudaan',icon:'fa-people-group',warna:'#db2777',kontak:'',alamat:'',foto:''},
  {id:'p17',nama:'YOGA',jabatan:'Kepemudaan',icon:'fa-people-group',warna:'#db2777',kontak:'',alamat:'',foto:''},
];
function getPengurus(){const d=getData(KEY_PENGURUS);if(!d.length){saveData(KEY_PENGURUS,PENGURUS_DEF);return PENGURUS_DEF;}return d;}
function renderPengurusTable(filter=''){const tbody=document.getElementById('tbodyPengurus');if(!tbody)return;const data=getPengurus().filter(x=>(x.nama+x.jabatan).toLowerCase().includes((filter||'').toLowerCase()));if(!data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="6">Tidak ada data.</td></tr>';return;}tbody.innerHTML=data.map((x,i)=>`<tr><td>${i+1}</td><td>${x.foto?`<img src="${x.foto}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--border)"/>`:`<div style="width:40px;height:40px;border-radius:50%;background:${esc(x.warna||'#1565c0')};display:flex;align-items:center;justify-content:center;color:#fff;font-size:.9rem"><i class="fas ${esc(x.icon||'fa-user')}"></i></div>`}</td><td><strong>${esc(x.nama)}</strong></td><td>${esc(x.jabatan)}</td><td>${esc(x.kontak||'-')}</td><td><div class="action-btns"><button class="btn-edit" onclick="editPengurus('${x.id}')"><i class="fas fa-pen"></i> Edit</button><button class="btn-del" onclick="deletePengurus('${x.id}','${esc(x.nama)}')"><i class="fas fa-trash"></i> Hapus</button></div></td></tr>`).join('');}
function previewPngFoto(input){if(input.files&&input.files[0]){const r=new FileReader();r.onload=e=>{document.getElementById('pngFotoData').value=e.target.result;document.getElementById('pngFotoImg').src=e.target.result;document.getElementById('pngFotoPreview').style.display='block';};r.readAsDataURL(input.files[0]);}}
function hapusPngFoto(){document.getElementById('pngFotoData').value='';document.getElementById('pngFotoImg').src='';document.getElementById('pngFotoPreview').style.display='none';const f=document.getElementById('pngFotoFile');if(f)f.value='';}
function openAddPengurus(){document.getElementById('modalPengurusTitle').textContent='Tambah Pengurus';['pngId','pngNama','pngJabatan','pngKontak','pngAlamat'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});hapusPngFoto();openModal('modalPengurus');}
function editPengurus(id){const x=getPengurus().find(r=>r.id===id);if(!x)return;document.getElementById('modalPengurusTitle').textContent='Edit Pengurus';document.getElementById('pngId').value=x.id;document.getElementById('pngNama').value=x.nama;document.getElementById('pngJabatan').value=x.jabatan;document.getElementById('pngKontak').value=x.kontak||'';document.getElementById('pngAlamat').value=x.alamat||'';if(x.foto){document.getElementById('pngFotoData').value=x.foto;document.getElementById('pngFotoImg').src=x.foto;document.getElementById('pngFotoPreview').style.display='block';}else{hapusPngFoto();}openModal('modalPengurus');}
function savePengurus(){const id=document.getElementById('pngId').value,nama=document.getElementById('pngNama').value.trim(),jabatan=document.getElementById('pngJabatan').value.trim(),kontak=document.getElementById('pngKontak').value.trim(),alamat=document.getElementById('pngAlamat').value.trim(),foto=document.getElementById('pngFotoData')?.value||'';if(!nama||!jabatan){showToast('Nama dan jabatan wajib!','error');return;}let data=getPengurus();if(id){data=data.map(x=>x.id===id?{...x,nama,jabatan,kontak,alamat,foto}:x);showToast('Pengurus diperbarui!');}else{data.push({id:genId(),nama,jabatan,kontak,alamat,foto,icon:'fa-user',warna:'#1565c0'});showToast('Pengurus ditambahkan!');}saveData(KEY_PENGURUS,data);closeModal('modalPengurus');renderPengurusTable();}
function deletePengurus(id,label){confirmDelete('pengurus "'+label+'"',()=>{saveData(KEY_PENGURUS,getPengurus().filter(x=>x.id!==id));showToast('Dihapus!','info');renderPengurusTable();});}

const KEY_LAPORAN = 'rt04_laporan';
function getLaporan(){const d=getData(KEY_LAPORAN);if(!d.length){const def=[{id:genId(),nama:'Warga No.5',kontak:'0812-xxx',jenis:'Gangguan Keamanan',lokasi:'Depan gang RT 04',deskripsi:'Ada orang tidak dikenal berkeliaran.',urgensi:'Mendesak',status:'Selesai',tanggal:'2026-07-20'},{id:genId(),nama:'Warga No.9',kontak:'0813-xxx',jenis:'Masalah Sampah',lokasi:'TPS RT 04',deskripsi:'Sampah 3 hari belum diangkut.',urgensi:'Normal',status:'Diproses',tanggal:'2026-07-18'},{id:genId(),nama:'Warga No.3',kontak:'0814-xxx',jenis:'Fasilitas Umum Rusak',lokasi:'Blok B RT 04',deskripsi:'Lampu jalan mati.',urgensi:'Normal',status:'Selesai',tanggal:'2026-07-15'}];saveData(KEY_LAPORAN,def);return def;}return d;}
function renderLaporanTable(filter=''){const tbody=document.getElementById('tbodyLaporan');if(!tbody)return;const data=getLaporan().filter(x=>(x.jenis+x.nama+x.lokasi).toLowerCase().includes(filter.toLowerCase()));if(!data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="7">Tidak ada laporan.</td></tr>';return;}tbody.innerHTML=data.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.nama)}</td><td>${esc(x.jenis)}</td><td>${esc(x.lokasi)}</td><td><span class="badge badge-${urgBadge(x.urgensi)}">${esc(x.urgensi)}</span></td><td><span class="status-${statusClass(x.status)}">${esc(x.status)}</span></td><td><div class="action-btns"><button class="btn-edit" onclick="editLaporan('${x.id}')"><i class="fas fa-pen"></i> Update</button><button class="btn-del" onclick="deleteLaporan('${x.id}','${esc(x.jenis)}')"><i class="fas fa-trash"></i> Hapus</button></div></td></tr>`).join('');}
function editLaporan(id){const x=getLaporan().find(r=>r.id===id);if(!x)return;document.getElementById('lapId').value=x.id;document.getElementById('lapStatus').value=x.status;document.getElementById('lapJenis').textContent=x.jenis;document.getElementById('lapNama').textContent=x.nama;document.getElementById('lapLokasi').textContent=x.lokasi;document.getElementById('lapDeskripsi').textContent=x.deskripsi;openModal('modalLaporan');}
function saveLaporan(){const id=document.getElementById('lapId').value,status=document.getElementById('lapStatus').value;let data=getLaporan();data=data.map(x=>x.id===id?{...x,status}:x);saveData(KEY_LAPORAN,data);showToast('Status laporan diperbarui!');closeModal('modalLaporan');renderLaporanTable();}
function deleteLaporan(id,label){confirmDelete('laporan "'+label+'"',()=>{saveData(KEY_LAPORAN,getLaporan().filter(x=>x.id!==id));showToast('Dihapus!','info');renderLaporanTable();updateDashStats();});}

// ══ CRUD: RONDA ═══════════════════════════════════════════
const KEY_RONDA = 'rt04_ronda';
const RONDA_DEF = [
  {id:'r01',regu:'Regu 1', hari:'Rabu',   tanggal:'2026-07-22',anggota:'Bpk.Rt Novi Azis\nBpk.Dambas Muhari\nBpk.Suherman\nBpk.Ismail Subana\nBpk.Dedi Nur Rohmawan\nSdr.Toni Andrian',shift:'22.00–04.00'},
  {id:'r02',regu:'Regu 2', hari:'Kamis',  tanggal:'2026-07-23',anggota:'Bpk.Zainudin Ce\'ot\nBpk.Wandi Siswanto\nBpk.Jauhari\nBpk.Bagiyo\nBpk.Syafe\'i Sate\nBpk.Afu Karim',shift:'22.00–04.00'},
  {id:'r03',regu:'Regu 3', hari:'Jumat',  tanggal:'2026-07-24',anggota:'Sdr.Amar Galih\nBpk.Lukman Nur Hakim\nSdr.Reval Nendi Sumarna\nSdr.Husein Robi\nSdr.Fajri & Riki Cilor\nBpk.Rully',shift:'22.00–04.00'},
  {id:'r04',regu:'Regu 4', hari:'Sabtu',  tanggal:'2026-07-25',anggota:'Bpk.Polma/Lay\nBpk.Ali Yunus\nBpk.Gino & Suroto\nBpk.Jaelani Bintang\nBpk.Sadimo\nBpk.Joni Pahlevi\nBpk.Irhamudin (Udin Tukang)',shift:'22.00–04.00'},
  {id:'r05',regu:'Regu 5', hari:'Minggu', tanggal:'2026-07-26',anggota:'Bpk.Jamalrudin Malik\nBpk.Karsim\nBpk.Winiharso\nBpk.Riki Otay\nBpk.Sahud Ma Onih\nBpk.Rizky H.Suyatno\nBpk.Yogi',shift:'22.00–04.00'},
  {id:'r06',regu:'Regu 6', hari:'Senin',  tanggal:'2026-07-27',anggota:'Bpk.Andriansyah Nur\nBpk.Rustono\nBpk.Bayu Fitri\nBpk.Rahmat & Sugeng\nBpk.Likuh\nBpk.Anwar Bhokor',shift:'22.00–04.00'},
  {id:'r07',regu:'Regu 7', hari:'Selasa', tanggal:'2026-07-28',anggota:'Bpk.Saptono (Ocoy)\nBpk.Ilham Kholik (Cilem)\nBpk.Dedi Supriyadi\nBpk.Fery Pak Kimbok\nBpk.Sukandi\nBpk.Denu Atmaja',shift:'22.00–04.00'},
  {id:'r08',regu:'Regu 8', hari:'Rabu',   tanggal:'2026-07-29',anggota:'Bpk.M.Idham (Mamat)\nBpk.Warwanto (Pa Yanto)\nBpk.Azmie Reza\nBpk.Doni H.Nurdin\nBpk.Sulistiono (Pa Tio)\nSdr.Bayu Raka Pangestu',shift:'22.00–04.00'},
  {id:'r09',regu:'Regu 9', hari:'Kamis',  tanggal:'2026-07-30',anggota:'Bpk.Gunung Iswahyudi\nBpk.Suyatno Guru\nBpk.Sarbini\nBpk.Dedi Koswara\nBpk.Fahri\nBpk.Ajie Subekti\nBpk.Maulid Madura',shift:'22.00–04.00'},
  {id:'r10',regu:'Regu 10',hari:'Jumat',  tanggal:'2026-07-31',anggota:'Bpk.Hardi.S (Bang Beben)\nBpk.Alex & M.Rifki.R\nBpk.Haryani (Uca)\nBpk.M.Yudistira\nBpk.Syamian\nBpk.Manis.W',shift:'22.00–04.00'},
  {id:'r11',regu:'Regu 11',hari:'Sabtu',  tanggal:'2026-08-01',anggota:'Bpk.Dema Agung Marhento\nBpk.Ramdani\nBpk.Ngadiman\nBpk.M.Syaif Rivaldi\nBpk.Ferry Haryadi\nSdr.Hamdan Keling\nSdr.Abimanyu',shift:'22.00–04.00'},
  {id:'r12',regu:'Regu 12',hari:'Minggu', tanggal:'2026-08-02',anggota:'Bpk.Suprapto\nBpk.Suhanda\nBpk.Evak Dermalaude\nBpk.Astoyadi\nBpk.Adi Suparman\nBpk.Rusdian',shift:'22.00–04.00'},
  {id:'r13',regu:'Regu 13',hari:'Senin',  tanggal:'2026-08-03',anggota:'Bpk.Deni Aryanto\nBpk.Ahmd Andrian\nBpk.Apip Fudin\nBpk.Indra Endoy\nSdr.Nasrullah Acung\nSdr.Imam & Ibnu Setiadi',shift:'22.00–04.00'},
  {id:'r14',regu:'Regu 14',hari:'Selasa', tanggal:'2026-08-04',anggota:'Bpk.Rangga (Angga)\nBpk.Paiman Odak\nBpk.Eko Kwetiau\nBpk.Azam Pangkas Rambut\nSdr.Dendi R.W (Endit)\nSdr.Agus Pak Marinto',shift:'22.00–04.00'},
  {id:'r15',regu:'Regu 15',hari:'Rabu',   tanggal:'2026-08-05',anggota:'Sdr.Ahmad Fauzi\nSdr.Fajar/Basri Beras\nBpk.Cepy Hermansyah\nBpk.Eko Widilaksana\nBpk.Faqih Akbar\nBpk.Agus Arta\nBpk.Syukhendri',shift:'22.00–04.00'},
];
function getRonda(){const d=getData(KEY_RONDA);if(!d.length){saveData(KEY_RONDA,RONDA_DEF);return RONDA_DEF;}return d;}
function renderRondaTable(filter=''){
  const tbody=document.getElementById('tbodyRonda');if(!tbody)return;
  const data=getRonda().filter(x=>(x.regu+x.hari+x.anggota).toLowerCase().includes((filter||'').toLowerCase()));
  if(!data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="5">Tidak ada data.</td></tr>';return;}
  tbody.innerHTML=data.map((x,i)=>`<tr>
    <td><strong>${esc(x.regu)}</strong><br><small style="color:#64748b">${esc(x.hari)}, ${esc(x.tanggal?fmtDate(x.tanggal):x.tanggal||'')}</small></td>
    <td style="white-space:pre-line;font-size:.82rem;max-width:280px">${esc(x.anggota||'')}</td>
    <td>${esc(x.shift)}</td>
    <td>${x.anggota?(x.anggota.split('\n')[0]||'-'):'-'}</td>
    <td><div class="action-btns">
      <button class="btn-edit" onclick="editRonda('${x.id}')"><i class="fas fa-pen"></i> Edit</button>
      <button class="btn-del" onclick="deleteRonda('${x.id}','${esc(x.regu)}')"><i class="fas fa-trash"></i> Hapus</button>
    </div></td>
  </tr>`).join('');}
function openAddRonda(){
  document.getElementById('modalRondaTitle').textContent='Tambah Jadwal Ronda';
  ['rndId','rndRegu','rndHari','rndTanggal','rndAnggota'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const s=document.getElementById('rndShift');if(s)s.value='22.00–04.00';
  openModal('modalRonda');}
function editRonda(id){
  const x=getRonda().find(r=>r.id===id);if(!x)return;
  document.getElementById('modalRondaTitle').textContent='Edit Jadwal Ronda';
  document.getElementById('rndId').value=x.id;
  document.getElementById('rndRegu').value=x.regu||'';
  document.getElementById('rndHari').value=x.hari||'';
  document.getElementById('rndTanggal').value=x.tanggal||'';
  document.getElementById('rndAnggota').value=x.anggota||'';
  document.getElementById('rndShift').value=x.shift||'22.00–04.00';
  openModal('modalRonda');}
function saveRonda(){
  const id=document.getElementById('rndId').value,
    regu=document.getElementById('rndRegu').value.trim(),
    hari=document.getElementById('rndHari').value.trim(),
    tanggal=document.getElementById('rndTanggal').value.trim(),
    anggota=document.getElementById('rndAnggota').value.trim(),
    shift=(document.getElementById('rndShift')?.value||'22.00–04.00').trim();
  if(!regu||!anggota){showToast('Nama regu dan anggota wajib!','error');return;}
  let data=getRonda();
  if(id){data=data.map(x=>x.id===id?{...x,regu,hari,tanggal,anggota,shift}:x);showToast('Jadwal diperbarui!');}
  else{data.push({id:genId(),regu,hari,tanggal,anggota,shift});showToast('Jadwal ditambahkan!');}
  saveData(KEY_RONDA,data);closeModal('modalRonda');renderRondaTable();}
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
  else if(href.includes('admin-pengurus'))   { renderPengurusTable();  const s=document.getElementById('searchPengurus');  if(s) s.addEventListener('input',e=>renderPengurusTable(e.target.value)); }
});
