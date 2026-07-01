'use strict';

let intakes = [];
let _counter = 0;

function _nextId() { return 'intake_' + (++_counter); }

function createIntake(clientId, data) {
  const rec = { id: _nextId(), client_id: clientId, data: data || {}, uploaded_at: new Date().toISOString() };
  intakes.push(rec);
  return rec;
}

function getIntakesByClientId(clientId) { return intakes.filter(i => i.client_id === clientId); }
function getAllIntakes()                 { return intakes.slice(); }
function getIntakeById(id)              { return intakes.find(i => i.id === id) || null; }

module.exports = { createIntake, getIntakesByClientId, getAllIntakes, getIntakeById };
