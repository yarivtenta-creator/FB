'use strict';
/**
 * provider_routes.stub.js — AGENT 1 handoff to AGENT 5.
 * Read-only provider status + read-only test probe. No keys, no orders, no execution.
 * Agent 5 merges these two routes into data_layer/routes.js (mounted under /api/data).
 */
const registry = require('./provider_registry');

module.exports = function mount(router){
  // Single provider status (read-only)
  router.get('/providers/:id/status', (req,res)=>{
    const p = registry.get(req.params.id);
    if (!p) return res.status(404).json({ ok:false, error:'unknown_provider', id:req.params.id });
    res.json(p);
  });
  // Read-only connectivity probe (NEVER live in mock; NEVER an order path).
  // Async: in live mode it performs a REAL read-only GET via the provider adapter.
  router.post('/providers/:id/test', async (req,res)=>{
    try { res.json(await registry.test(req.params.id)); }
    catch (e){ res.status(500).json({ ok:false, error:'probe_failed' }); }
  });
  return router;
};
