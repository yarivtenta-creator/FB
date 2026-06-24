'use strict';
/**
 * agent_control_center_v2.js — PRIORITY 1 (enhanced).
 * Upgrades the Module Pack's agent_control_center with: Last Run Time,
 * Last Output Time, Test Agent (dry run, no side effects), diagnostics, last output.
 * Status & diagnostics ONLY. No orders, no execution start, no broker.
 */
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, 'agents_state.json');

function _load(){ try { return JSON.parse(fs.readFileSync(STORE,'utf8')); } catch { return { agents: [] }; } }
function _save(d){ fs.writeFileSync(STORE, JSON.stringify(d,null,2)); }

function list(){ return _load().agents; }

function health(a){
  if (a.status === 'error') return 'error';
  if (!a.enabled) return 'disabled';
  return 'ok';
}

function diagnostics(id){
  const a = _load().agents.find(x=>x.id===Number(id));
  if (!a) return { ok:false, error:'not_found' };
  return {
    ok:true, id:a.id, name:a.name, type:a.type, status:a.status,
    enabled:a.enabled, last_run_time:a.last_run_time, last_output_time:a.last_output_time,
    health: health(a), notes: a.diag_notes || 'No anomalies. Mock diagnostics.'
  };
}

function lastOutput(id){
  const a = _load().agents.find(x=>x.id===Number(id));
  if (!a) return { ok:false, error:'not_found' };
  return { ok:true, id:a.id, name:a.name, last_output_time:a.last_output_time, output:a.last_output };
}

/**
 * testAgent — DRY RUN ONLY. Simulates a health probe; does NOT run the agent's
 * real loop, fetch live data, or place anything. Records a test timestamp.
 */
function testAgent(id){
  const d = _load();
  const a = d.agents.find(x=>x.id===Number(id));
  if (!a) return { ok:false, error:'not_found' };
  a.last_test_time = new Date().toISOString();
  a.last_test_result = a.enabled ? 'reachable (mock)' : 'disabled';
  _save(d);
  return { ok:true, id:a.id, name:a.name, test_result:a.last_test_result, executed:false, ran_real_loop:false };
}

// Status flag only — does NOT control a real loop.
function setRunning(id, running){
  const d = _load();
  const a = d.agents.find(x=>x.id===Number(id));
  if (!a) return { ok:false, error:'not_found' };
  a.status = running ? 'running' : 'stopped';
  a.last_change = new Date().toISOString();
  _save(d);
  return { ok:true, id:a.id, status:a.status, executed:false };
}

module.exports = { list, diagnostics, lastOutput, testAgent, setRunning };
