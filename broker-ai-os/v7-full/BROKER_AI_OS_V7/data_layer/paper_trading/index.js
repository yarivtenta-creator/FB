'use strict';
/**
 * paper_trading — LOCAL SIMULATION ONLY. No broker, no orders, no live accounts.
 * Open/close paper trades against mock hub quotes; track P/L. State held in-memory
 * (+ optional JSON persistence) and flagged paper:true everywhere.
 */
const fs = require('fs'); const path = require('path');
const hub = require('../data_hub_v2');
const STORE = path.join(__dirname, 'paper_state.json');

function _load(){ try { return JSON.parse(fs.readFileSync(STORE,'utf8')); } catch { return { trades:[], next_id:1 }; } }
function _save(s){ fs.writeFileSync(STORE, JSON.stringify(s,null,2)); }
function _price(symbol){ const q = hub.getQuotes().find(x=>x.symbol===symbol); return q ? q.price : null; }

function openTrade({ symbol, side='long', qty=1 }){
  const price = _price(symbol);
  if (price === null) return { ok:false, error:'no_mock_quote_for_symbol' };
  const s = _load();
  const t = { id:s.next_id++, symbol, side, qty:Number(qty), entry:price, status:'open',
    opened_at:new Date().toISOString(), paper:true, mock:true };
  s.trades.push(t); _save(s);
  return { ok:true, trade:t, note:'PAPER simulation only — no order placed.' };
}
function closeTrade(id){
  const s = _load(); const t = s.trades.find(x=>x.id===Number(id) && x.status==='open');
  if (!t) return { ok:false, error:'open_trade_not_found' };
  const price = _price(t.symbol); if (price===null) return { ok:false, error:'no_mock_quote' };
  t.exit = price; t.status='closed'; t.closed_at=new Date().toISOString();
  const dir = t.side==='long'?1:-1;
  t.pl = +((t.exit - t.entry) * t.qty * dir).toFixed(2);
  _save(s);
  return { ok:true, trade:t, note:'PAPER close — no order placed.' };
}
function listTrades(){ return _load().trades; }
function stats(){
  const trades = _load().trades.filter(t=>t.status==='closed');
  const wins = trades.filter(t=>t.pl>0), losses = trades.filter(t=>t.pl<=0);
  const sum = a=>a.reduce((x,t)=>x+t.pl,0);
  return {
    closed: trades.length, open: _load().trades.filter(t=>t.status==='open').length,
    win_rate: trades.length? +(wins.length/trades.length).toFixed(3):0,
    total_pl: +sum(trades).toFixed(2),
    avg_gain: wins.length? +(sum(wins)/wins.length).toFixed(2):0,
    avg_loss: losses.length? +(sum(losses)/losses.length).toFixed(2):0,
    paper:true
  };
}
function reset(){ _save({ trades:[], next_id:1 }); return { ok:true }; }
module.exports = { openTrade, closeTrade, listTrades, stats, reset };
