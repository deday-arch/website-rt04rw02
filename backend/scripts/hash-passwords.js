// Script sekali pakai: update password admin di database
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { query } = require('../src/config/db');

const ACCOUNTS = [
  { username: 'admin',      password: 'rt04rw02@2026' },
  { username: 'ketua.rt',   password: 'Jombang@2026'  },
  { username: 'sekretaris', password: 'Ciputat@2026'   },
];

(async () => {
  console.log('Mengupdate password admin...\n');
  for (const acc of ACCOUNTS) {
    const hash = await bcrypt.hash(acc.password, 12);
    await query(
      'UPDATE admin_users SET password_hash = $1 WHERE username = $2',
      [hash, acc.username]
    );
    console.log(`✅  ${acc.username} — password di-hash`);
  }
  console.log('\nSelesai! Semua password sudah di-update.');
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
