'use strict';

let clients = [];
let _counter = 0;

function _nextId() { return 'client_' + (++_counter); }

function createClient(name) {
  const rec = { id: _nextId(), name: name || 'Unnamed Client', intake_id: null, created_at: new Date().toISOString() };
  clients.push(rec);
  return rec;
}

function getClientById(id)  { return clients.find(c => c.id === id) || null; }
function getAllClients()     { return clients.slice(); }

function linkIntake(clientId, intakeId) {
  const c = clients.find(c => c.id === clientId);
  if (!c) return null;
  c.intake_id = intakeId;
  return c;
}

module.exports = { createClient, getClientById, getAllClients, linkIntake };
