'use strict';
/**
 * data_hub.js — PRIORITY 3. Unified Data Layer (single source of truth).
 * Normalizes multiple MOCK adapters into one output format so future agents
 * consume DATA_HUB instead of providers directly. No live connections.
 *
 * Unified record shape:
 *   { provider, kind, symbol, value, unit, ts, mock:true }
 */
const adapters = {
  alpaca: () => ([
    { provider:'alpaca', kind:'quote', symbol:'AAPL', value:203.10, unit:'USD', ts:'2026-06-03T14:00:00Z', mock:true },
    { provider:'alpaca', kind:'quote', symbol:'NVDA', value:1180.42, unit:'USD', ts:'2026-06-03T14:00:00Z', mock:true }
  ]),
  t4_mock: () => ([
    { provider:'t4_mock', kind:'future', symbol:'ES', value:5312.25, unit:'idx', ts:'2026-06-03T14:00:00Z', mock:true },
    { provider:'t4_mock', kind:'future', symbol:'NQ', value:18920.50, unit:'idx', ts:'2026-06-03T14:00:00Z', mock:true }
  ]),
  news_mock: () => ([
    { provider:'news_mock', kind:'headline', symbol:'NVDA', value:'Chipmaker momentum continues (mock)', unit:'text', ts:'2026-06-03T13:58:00Z', mock:true }
  ]),
  econ_calendar_mock: () => ([
    { provider:'econ_calendar_mock', kind:'event', symbol:'US-CPI', value:'CPI release 13:30 ET (mock)', unit:'text', ts:'2026-06-03T13:30:00Z', mock:true }
  ]),
  internal_signals: () => ([
    { provider:'internal_signals', kind:'signal', symbol:'AAPL', value:'breakout 0.41 (mock)', unit:'score', ts:'2026-06-03T13:35:00Z', mock:true }
  ])
  // future_sources: register more mock adapters here. Never add live connections.
};

function providers(){ return Object.keys(adapters); }

function unified(filterProvider){
  let rows = [];
  for (const name of Object.keys(adapters)){
    if (filterProvider && name !== filterProvider) continue;
    try { rows = rows.concat(adapters[name]()); } catch { /* adapter degraded */ }
  }
  return rows.sort((a,b)=> String(b.ts).localeCompare(String(a.ts)));
}

function describe(){
  return {
    note: 'All future agents should consume unified() instead of calling providers directly.',
    output_shape: { provider:'string', kind:'string', symbol:'string', value:'any', unit:'string', ts:'iso', mock:'true' },
    providers: providers(),
    live_connections: false
  };
}

module.exports = { providers, unified, describe };
