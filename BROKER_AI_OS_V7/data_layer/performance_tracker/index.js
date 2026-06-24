'use strict';
/**
 * performance_tracker — aggregates accuracy/win-rate/source+agent performance. Mock data.
 * Reads paper_trading stats + signal sources. No trading.
 */
const paper = require('../paper_trading');
const hub = require('../data_hub_v2');

function sourcePerformance(){
  // mock: attribute hypothetical accuracy per signal source
  const signals = hub.getSignals();
  const bySrc = signals.reduce((m,s)=>{ (m[s.provider]=m[s.provider]||[]).push(s); return m; },{});
  return Object.keys(bySrc).map(src=>({
    source:src, signals:bySrc[src].length,
    mock_accuracy:+(0.5 + 0.1*(bySrc[src].length)).toFixed(2), mock:true
  }));
}
function report(){
  const ps = paper.stats();
  return {
    paper_trading: ps,
    signal_accuracy: ps.win_rate, // proxy in mock
    win_rate: ps.win_rate, loss_rate: +(1-ps.win_rate).toFixed(3),
    avg_gain: ps.avg_gain, avg_loss: ps.avg_loss,
    source_performance: sourcePerformance(),
    agent_performance: [{ agent:'scanner', mock_accuracy:0.58 },{ agent:'smart_money', mock_accuracy:0.62 }],
    note:'Mock metrics. Real accuracy requires wired data + closed paper trades over time.'
  };
}
module.exports = { report, sourcePerformance };
