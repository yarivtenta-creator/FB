'use strict';
/**
 * secrets_status.js — reports STATUS of secrets, never values.
 * Output is only one of: Configured | Missing | Error. No key/secret/token/
 * password is ever read into memory or returned.
 */
function statusOf(/* name */){
  // This pack does not read .env or any secret store. By contract, returns Missing
  // unless a future safe provider reports presence WITHOUT exposing the value.
  return 'Missing';
}
function report(){
  // Names only — values never touched.
  const items = ['ALPACA_KEY','ALPACA_SECRET','ALPACA_KEY_B','T4_TOKEN','SESSION_SECRET'];
  return items.map(name => ({ name, status: statusOf(name) }));
}
module.exports = { statusOf, report };
