'use strict';
/**
 * generate_users.js — (re)creates store/users.json with HASHED placeholder
 * passwords. Run: node generate_users.js
 * Placeholder passwords are documented in HOW_TO_INSTALL.md — CHANGE THEM.
 */
const fs = require('fs');
const path = require('path');
const { hash } = require('./hashing');

const PLACEHOLDERS = [
  { username:'admin',    role:'admin',    password:'ChangeMe-Admin-2026' },
  { username:'operator', role:'operator', password:'ChangeMe-Operator-2026' },
  { username:'viewer',   role:'viewer',   password:'ChangeMe-Viewer-2026' }
];

const users = PLACEHOLDERS.map(u => ({
  username: u.username, role: u.role, active: true,
  password_hash: hash(u.password), // never store plain text
  created_at: new Date().toISOString()
}));

const out = { _comment: 'Passwords are scrypt-hashed. Placeholders documented in HOW_TO_INSTALL.md — change them.', users };
fs.writeFileSync(path.join(__dirname,'store','users.json'), JSON.stringify(out, null, 2));
console.log('Wrote store/users.json with', users.length, 'hashed users (admin, operator, viewer).');
