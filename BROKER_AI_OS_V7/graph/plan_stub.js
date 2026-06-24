'use strict';
/**
 * plan_stub.js — safe pseudocode-level planner.
 * Returns a proposed plan object. Has NO side effects and NO broker access.
 */
function propose(request) {
  return {
    request: String(request || ''),
    steps: ['intake', 'classification', 'routing', 'human_review'],
    can_execute: false,
    note: 'Proposal only. Execution requires the Manual Approval Layer (not wired in v2).'
  };
}
module.exports = { propose };
