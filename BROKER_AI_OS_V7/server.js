'use strict';
/**
 * server.js — BROKER_AI_OS_V7 (port 6060).
 * SAFETY: no broker client, no live endpoint, manual default, AUTO_RESUME=false,
 * Alpaca is READ-ONLY market data only — no orders, no execution, no positions modification.
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const health = require('./health/healthcheck');
const board = require('./agents/signal_board');
const t4 = require('./connectors/t4/t4_mock_connector');
const planner = require('./graph/plan_stub');

const govRouter = require('./governance/routes');
const authRouter = require('./auth/routes');
const expansionRouter = require('./expansion/routes');
const { requireAuth, requirePerm } = require('./auth/middleware');
const backup = require('./backup/backup_center');

const app = express();
app.use(express.json());

app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'auth', 'login.html')));
app.use(express.static(path.join(__dirname, 'public')));
// Read-only static operator guides (markdown). No secrets; documentation only.
app.use('/docs', express.static(path.join(__dirname, 'docs')));

(function bootSafety() {
  const line = `[boot] BROKER_AI_OS_V7 port=${config.PORT} mode=${config.EXECUTION_MODE} auto_resume=${config.AUTO_RESUME} live=${config.LIVE_ENDPOINT_ENABLED}`;
  try { fs.appendFileSync(path.join(__dirname, 'logs', 'v2.log'), `${new Date().toISOString()} ${line}\n`); } catch {}
  console.log(line);
})();

// ── Unauthenticated health / status endpoints ──────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', system: 'BROKER_AI_OS_V7', port: config.PORT, ts: new Date().toISOString() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', system: 'BROKER_AI_OS_V7', port: config.PORT, ts: new Date().toISOString() }));
app.get('/api/status', (req, res) => res.json({
  system: 'BROKER_AI_OS_V7', port: config.PORT,
  execution_mode: config.EXECUTION_MODE, live_trading: false,
  read_only: true, paper_mode: true, auto_resume: config.AUTO_RESUME,
  live_endpoint_enabled: config.LIVE_ENDPOINT_ENABLED, ts: new Date().toISOString()
}));
app.get('/api/providers', (req, res) => {
  try { res.json(require('./data_layer/provider_registry').list()); }
  catch { res.json({ providers: [], note: 'provider registry unavailable' }); }
});
app.get('/api/data/providers', (req, res) => {
  try { res.json(require('./data_layer/provider_registry').list()); }
  catch { res.json({ providers: [], note: 'provider registry unavailable' }); }
});

// ── Alpaca read-only routes (unauthenticated for diagnostics) ─────────────
app.use('/api/alpaca', require('./connectors/alpaca/alpaca_routes'));

app.use('/api/auth', authRouter);

app.get('/api/health/full', requireAuth, (req, res) => {
  try { res.json(health.fullHealth()); } catch { res.status(500).json({ error: 'health_check_failed' }); }
});
app.post('/api/health/test', requireAuth, (req, res) => {
  try { res.json({ ran: true, result: health.fullHealth() }); } catch { res.status(500).json({ error: 'health_check_failed' }); }
});

app.get('/api/execution/mode', requireAuth, (req, res) => res.json({
  mode: config.EXECUTION_MODE, valid_modes: config.VALID_MODES,
  live_endpoint_enabled: config.LIVE_ENDPOINT_ENABLED, note: 'No live mode exists.'
}));

// Governance = single approval authority (/api/gov primary + /api/governance compat)
app.use('/api/gov', govRouter);
app.use('/api/governance', govRouter);

app.get('/api/signals', requireAuth, (req, res) => res.json(board.list()));

// Admin-only overrides MUST be registered before the general expansion router
// so RBAC gates apply (config view + agent start/stop are admin actions).
app.get('/api/expansion/config', requirePerm('config.admin'), (req, res, next) => next());
app.post('/api/expansion/agents/:id/start', requirePerm('config.admin'), (req, res, next) => next());
app.post('/api/expansion/agents/:id/stop', requirePerm('config.admin'), (req, res, next) => next());
app.use('/api/expansion', requireAuth, expansionRouter);
app.use('/api/data', requireAuth, require('./data_layer/routes'));
app.use('/api/strategy', requireAuth, require('./strategy_engine/routes'));

app.get('/api/t4/mock', requireAuth, (req, res) => res.json(t4.getQuotes()));
app.get('/api/t4/quotes', requireAuth, (req, res) => res.json(t4.getQuotes()));
app.get('/api/t4/symbols', requireAuth, (req, res) => res.json(t4.getSymbolMap()));
function n8nReg(req, res) {
  try { res.json(JSON.parse(fs.readFileSync(path.join(__dirname, 'registry', 'n8n', 'template_registry.json'), 'utf8'))); }
  catch { res.status(500).json({ error: 'registry_unavailable' }); }
}
app.get('/api/n8n/registry', requireAuth, n8nReg);
app.get('/api/registry/n8n', requireAuth, n8nReg);

app.get('/api/backup', requirePerm('backup.admin'), (req, res) => res.json(backup.list()));
app.post('/api/backup', requirePerm('backup.admin'), (req, res) => res.json(backup.createManifest(req.body && req.body.label)));

app.post('/api/graph/propose', requireAuth, (req, res) => res.json(planner.propose(req.body && req.body.request)));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = config.PORT;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n✅ BROKER_AI_OS_V7 running at http://localhost:${PORT}`);
    console.log(`   mode=${config.EXECUTION_MODE} auto_resume=${config.AUTO_RESUME} live=${config.LIVE_ENDPOINT_ENABLED}`);
    console.log(`   Alpaca: READ-ONLY | No live trading | No order placement`);
    console.log(`   sign in at http://localhost:${PORT}/login\n`);
  });
}
module.exports = app;

