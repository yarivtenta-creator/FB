'use strict';
/**
 * paper_bridge_routes.stub.js — AGENT 3 handoff to AGENT 5.
 * Governance→paper bridge endpoints. Paper-only; every response paper:true/executed:false.
 * Agent 5 merges these into data_layer/routes.js (mounted under /api/data).
 */
const bridge = require('./paper_bridge');

module.exports = function mount(router){
  router.get('/paper/candidates', (req,res)=> res.json(bridge.candidatesFromGovernance()));
  router.post('/paper/candidates/:id/simulate', (req,res)=> res.json(bridge.simulate(req.params.id)));
  router.get('/paper/bridge/stats', (req,res)=> res.json(bridge.stats()));
  return router;
};
