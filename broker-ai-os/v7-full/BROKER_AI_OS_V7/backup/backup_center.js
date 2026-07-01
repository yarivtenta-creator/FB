'use strict';
/**
 * backup_center.js — MODULE 05 (standalone).
 * Management UI logic: create a backup MANIFEST, list backups, view history.
 * IMPORTANT: NO rollback/restore execution. "create" writes a manifest record
 * (metadata) only — it does not copy, move, overwrite, or delete any real files.
 */
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, 'backup_history.json');

function _load(){ try { return JSON.parse(fs.readFileSync(STORE,'utf8')); } catch { return { backups: [] }; } }
function _save(d){ fs.writeFileSync(STORE, JSON.stringify(d,null,2)); }

function list(){ return _load().backups; }

function createManifest(label){
  const d = _load();
  const id = 'bk_' + Date.now();
  const entry = {
    id,
    label: label || 'manual backup',
    created_at: new Date().toISOString(),
    type: 'manifest_only',
    note: 'Metadata record only. No files copied/moved. No rollback performed.'
  };
  d.backups.unshift(entry);
  _save(d);
  return { ok:true, backup: entry, executed: false };
}
// Intentionally NO restore()/rollback() function exists.
module.exports = { list, createManifest };
