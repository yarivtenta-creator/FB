'use strict';

const store = {};

function set(key, value) { store[key] = value; }
function get(key) { return store[key] || null; }
function del(key) { delete store[key]; }
function getAll() { return Object.assign({}, store); }
function clear() { Object.keys(store).forEach(k => delete store[k]); }

module.exports = { set, get, del, getAll, clear };
