'use strict';
/**
 * signal_scoring — ranks signals. SCORING ONLY. No trading, no execution.
 * Factors: confidence, source quality, market trend alignment, confirmation count.
 */
const hub = require('../data_hub_v2');

// Source quality weights (mock, tunable).
const SOURCE_QUALITY = { '13f_mock':0.9, 'congress_mock':0.7, 'insider_mock':0.6, default:0.5 };

function scoreOne(sig, ctx){
  const conf = typeof sig.confidence === 'number' ? sig.confidence : 0.5;
  const quality = SOURCE_QUALITY[sig.provider] || SOURCE_QUALITY.default;
  const trendAlign = ctx.trend && sig.direction
    ? (ctx.trend === sig.direction ? 1 : (sig.direction === 'neutral' ? 0.5 : 0.2)) : 0.5;
  const confirmations = ctx.confirmations[sig.symbol] || 1;
  const confirmFactor = Math.min(1, 0.4 + 0.2 * confirmations); // more sources agreeing → higher
  // weighted blend (weights sum to 1)
  const score = +(0.35*conf + 0.25*quality + 0.20*trendAlign + 0.20*confirmFactor).toFixed(4);
  return { ...sig, score, factors:{ confidence:conf, source_quality:quality, trend_alignment:trendAlign, confirmations } };
}

function rankSignals(opts={}){
  const signals = hub.getSignals();
  // confirmation count = how many providers emit a signal for the same symbol
  const confirmations = signals.reduce((m,s)=>{ m[s.symbol]=(m[s.symbol]||0)+1; return m; },{});
  const trend = opts.trend || 'long'; // mock market trend context
  const scored = signals.map(s=> scoreOne(s, { trend, confirmations }));
  return scored.sort((a,b)=> b.score - a.score);
}
module.exports = { rankSignals, scoreOne };
