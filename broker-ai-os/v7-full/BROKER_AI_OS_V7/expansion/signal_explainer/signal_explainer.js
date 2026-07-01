'use strict';
/**
 * signal_explainer.js — PRIORITY 4. Explainability for Paper Signal Board.
 * For each signal, returns: source, trigger, confidence, supporting data,
 * timestamp. Read-only. No black-box signals; every field is shown.
 */
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, 'signal_explanations.json');

function _load(){ try { return JSON.parse(fs.readFileSync(STORE,'utf8')).explanations; } catch { return []; } }

function all(){ return _load(); }
function explain(signalId){
  const e = _load().find(x => x.signal_id === Number(signalId));
  return e ? { ok:true, ...e } : { ok:false, error:'no_explanation' };
}
module.exports = { all, explain };
