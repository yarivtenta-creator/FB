'use strict';

const crm     = require('../ScaleXL_ClientFlow_Agent_Pack/src/mock_crm');
const clients = require('../ScaleXL_ClientFlow_Agent_Pack/src/mock_clients');
const intake  = require('../ScaleXL_ClientFlow_Agent_Pack/src/mock_intake');

let pass = 0, fail = 0;

function assert(label, condition) {
  if (condition) { console.log('  ✅ PASS:', label); pass++; }
  else           { console.error('  ❌ FAIL:', label); fail++; }
}

console.log('\n── Client ownership model ──────────────────────────────');

const client = clients.createClient('Acme Corp');
assert('createClient returns record with id',   client && client.id);
assert('createClient stores name',              client.name === 'Acme Corp');
assert('getAllClients includes new client',      clients.getAllClients().some(c => c.id === client.id));

console.log('\n── Intake upload + client link ─────────────────────────');

const intakeRec = intake.createIntake(client.id, { campaign: 'Summer2026', budget: 5000 });
assert('createIntake returns record',           intakeRec && intakeRec.id);
assert('intake linked to client',               intakeRec.client_id === client.id);
clients.linkIntake(client.id, intakeRec.id);
const updatedClient = clients.getClientById(client.id);
assert('client.intake_id updated after link',   updatedClient.intake_id === intakeRec.id);

console.log('\n── Lead import with client_id ──────────────────────────');

const l1 = crm.addLead({ name: 'Alice', email: 'alice@example.com', score: 'hot',  client_id: client.id });
const l2 = crm.addLead({ name: 'Bob',   email: 'bob@example.com',   score: 'warm', client_id: client.id });
assert('imported lead has client_id',           l1.client_id === client.id);
assert('imported lead defaults to stage intake',l1.stage === 'intake');

const clientLeads = crm.getLeadsByClientId(client.id);
assert('getLeadsByClientId returns both leads', clientLeads.length === 2);

console.log('\n── Advance all intake leads ────────────────────────────');

const stuckBefore = crm.getLeadsByStage('intake').length;
assert('intake leads exist before advance',     stuckBefore >= 2);
const advanced = crm.advanceAllIntakeLeads();
assert('advanceAllIntakeLeads returns count',   advanced === stuckBefore);
const stuckAfter = crm.getLeadsByStage('intake').length;
assert('no leads remain at intake stage',       stuckAfter === 0);
const qualifiedLeads = crm.getLeadsByStage('qualified');
assert('previously stuck leads are now qualified', qualifiedLeads.some(l => l.id === l1.id));

console.log('\n── Delete all leads ────────────────────────────────────');

const totalBefore = crm.getAllLeads().length;
assert('leads exist before delete',             totalBefore > 0);
const deleted = crm.deleteAllLeads();
assert('deleteAllLeads returns count',          deleted === totalBefore);
assert('no leads remain after delete',          crm.getAllLeads().length === 0);

console.log('\n── addLead defaults preserved ──────────────────────────');

const l3 = crm.addLead({ name: 'Test', score: 'hot' });
assert('addLead still works (stage=intake)',    l3.stage === 'intake');
assert('addLead auto-generates id',             typeof l3.id === 'string' && l3.id.startsWith('lead_'));

console.log('\n────────────────────────────────────────────────────────');
console.log(`Results: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
