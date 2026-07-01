'use strict';
/**
 * system_map.js — PRIORITY 5. System map data (read-only).
 * Describes the pipeline nodes + edges for the interactive map. No execution.
 */
function map(){
  return {
    nodes: [
      { id:'data', label:'Data Sources', detail:'Alpaca, T4 mock, News mock, Econ mock, Internal' },
      { id:'agents', label:'Agents', detail:'Market Intel, Scanner, Smart Money, Political, Risk' },
      { id:'signals', label:'Signals', detail:'Paper Signal Board (explainable)' },
      { id:'approval', label:'Approval Queue', detail:'Pending orders awaiting human approval' },
      { id:'governance', label:'Governance', detail:'Manual mode, gate flag, audit log' },
      { id:'future_exec', label:'Future Execution Layer', detail:'NOT built. Human-gated, out of scope.' }
    ],
    edges: [
      ['data','agents'],['agents','signals'],['signals','approval'],
      ['approval','governance'],['governance','future_exec']
    ],
    note: 'Read-only map. The final node is intentionally not implemented; execution stays gated.'
  };
}
module.exports = { map };
