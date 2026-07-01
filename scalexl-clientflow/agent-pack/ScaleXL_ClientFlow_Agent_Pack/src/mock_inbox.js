'use strict';

const conversations = [
  { id: 'conv_001', customer_id: 'cust_001', channel: 'whatsapp', status: 'open', unread: true, last_message: 'I need help with my order' },
  { id: 'conv_002', customer_id: 'cust_002', channel: 'email', status: 'pending', unread: false, last_message: 'When will my refund arrive?' }
];

function getConversationById(id) { return conversations.find(c => c.id === id) || null; }
function getAllConversations() { return conversations.slice(); }
function markAsRead(id) { const c = getConversationById(id); if (c) c.unread = false; return c; }

module.exports = { getConversationById, getAllConversations, markAsRead };
