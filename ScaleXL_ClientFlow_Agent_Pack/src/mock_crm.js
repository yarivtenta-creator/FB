'use strict';

const leads = [
  { id: 'lead_001', name: 'John Doe', email: 'john@example.com', score: 'hot', source: 'facebook_ad', business_type: 'ecommerce' },
  { id: 'lead_002', name: 'Jane Smith', email: 'jane@example.com', score: 'warm', source: 'instagram', business_type: 'service' },
  { id: 'lead_003', name: 'Bob Jones', email: 'bob@example.com', score: 'cold', source: 'website', business_type: 'saas' }
];

function getLeadById(id) { return leads.find(l => l.id === id) || null; }
function getAllLeads() { return leads.slice(); }
function addLead(lead) { lead.id = 'lead_' + Date.now(); leads.push(lead); return lead; }

module.exports = { getLeadById, getAllLeads, addLead };
