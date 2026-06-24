'use strict';
/**
 * audit_center.js — PRIORITY 2. Unified, READ-ONLY audit aggregator.
 * Aggregates events across sources (approvals, rejections, config changes,
 * backups, health-check failures, agent status changes) into one searchable feed.
 * It only READS. It never writes to source systems and never executes anything.
 * Reuses the governance safety log as one input source when present.
 */
const fs = require('fs');
const path = require('path');
const LOCAL = path.join(__dirname, 'audit_events.json');

function _loadLocal(){ try { return JSON.parse(fs.readFileSync(LOCAL,'utf8')).events; } catch { return []; } }

// Optional: pull governance safety log if the governance pack is co-installed.
function _loadGovernance(){
  const candidates = [
    path.join(__dirname, '..', '..', '..', 'governance', 'store', 'safety_audit_log.json'),
    path.join(__dirname, '..', 'governance', 'store', 'safety_audit_log.json')
  ];
  for (const p of candidates){
    try {
      const ev = JSON.parse(fs.readFileSync(p,'utf8')).events || [];
      return ev.map(e => ({
        time: e.at, user: 'system', event_type: e.action,
        component: 'governance', description: e.detail
      }));
    } catch { /* not present */ }
  }
  return [];
}

function all(){
  // Local seed events + governance events (if available), newest first.
  const merged = [..._loadLocal(), ..._loadGovernance()];
  return merged.sort((a,b)=> String(b.time).localeCompare(String(a.time)));
}

function query({ type, component, q } = {}){
  let rows = all();
  if (type)      rows = rows.filter(r => r.event_type === type);
  if (component) rows = rows.filter(r => r.component === component);
  if (q){
    const needle = String(q).toLowerCase();
    rows = rows.filter(r =>
      (r.description||'').toLowerCase().includes(needle) ||
      (r.event_type||'').toLowerCase().includes(needle) ||
      (r.component||'').toLowerCase().includes(needle) ||
      (r.user||'').toLowerCase().includes(needle));
  }
  return rows;
}

function facets(){
  const rows = all();
  return {
    event_types: [...new Set(rows.map(r=>r.event_type))],
    components: [...new Set(rows.map(r=>r.component))]
  };
}

module.exports = { all, query, facets };
