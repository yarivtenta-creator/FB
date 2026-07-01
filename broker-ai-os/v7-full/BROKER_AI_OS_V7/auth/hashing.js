'use strict';
/**
 * hashing.js — password hashing for the Auth Pack.
 *
 * SECURITY:
 *  - Passwords are NEVER stored in plain text.
 *  - Uses Node's built-in crypto.scrypt (salted, slow KDF). No native module
 *    needed, so it runs anywhere the .bat launcher runs.
 *  - bcrypt is a documented drop-in alternative (see SECURITY_NOTES.md): swap
 *    hash()/verify() for bcrypt.hash()/bcrypt.compare() if you prefer.
 *
 * Stored format:  scrypt$<saltHex>$<hashHex>
 */
const crypto = require('crypto');

const KEYLEN = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 }; // standard interactive cost

function hash(password) {
  if (typeof password !== 'string' || !password) throw new Error('password required');
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, KEYLEN, SCRYPT_PARAMS).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verify(password, stored) {
  try {
    const [scheme, salt, expected] = String(stored).split('$');
    if (scheme !== 'scrypt' || !salt || !expected) return false;
    const derived = crypto.scryptSync(password, salt, KEYLEN, SCRYPT_PARAMS).toString('hex');
    // constant-time compare
    const a = Buffer.from(derived, 'hex');
    const b = Buffer.from(expected, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

module.exports = { hash, verify };
