'use strict';

let leads = [
  { id: 'lead_001', name: 'John Doe',  email: 'john@example.com', score: 'hot',  source: 'facebook_ad', business_type: 'ecommerce', stage: 'qualified', client_id: null },
  { id: 'lead_002', name: 'Jane Smith', email: 'jane@example.com', score: 'warm', source: 'instagram',   business_type: 'service',   stage: 'qualified', client_id: null },
  { id: 'lead_003', name: 'Bob Jones',  email: 'bob@example.com',  score: 'cold', source: 'website',      business_type: 'saas',       stage: 'qualified', client_id: null }
];

let _counter = 1000;

function _nextId() { return 'lead_' + (++_counter); }

function getLeadById(id)            { return leads.find(l => l.id === id) || null; }
function getAllLeads()               { return leads.slice(); }
function getLeadsByStage(stage)     { return leads.filter(l => l.stage === stage); }
function getLeadsByClientId(cid)    { return leads.filter(l => l.client_id === cid); }

function addLead(lead) {
  const rec = Object.assign({ stage: 'intake', client_id: null }, lead, { id: _nextId() });
  leads.push(rec);
  return rec;
}

function deleteLead(id) {
  const before = leads.length;
  leads = leads.filter(l => l.id !== id);
  return leads.length < before;
}

function deleteAllLeads() {
  const count = leads.length;
  leads = [];
  return count;
}

// Move every lead currently at stage "intake" to stage "qualified"
function advanceAllIntakeLeads() {
  const stuck = leads.filter(l => l.stage === 'intake');
  stuck.forEach(l => { l.stage = 'qualified'; });
  return stuck.length;
}

module.exports = {
  getLeadById,
  getAllLeads,
  getLeadsByStage,
  getLeadsByClientId,
  addLead,
  deleteLead,
  deleteAllLeads,
  advanceAllIntakeLeads
};
