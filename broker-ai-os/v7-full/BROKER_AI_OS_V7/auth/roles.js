'use strict';
/**
 * roles.js — Role definitions and permission checks (RBAC).
 * Built-in roles: admin, operator, viewer. Custom roles can be added to ROLES.
 */

const ROLES = {
  admin: {
    label: 'Admin',
    permissions: ['*'] // full access
  },
  operator: {
    label: 'Operator',
    permissions: [
      'dashboard.view', 'signals.view', 'approvals.view',
      'approvals.decide',           // operators may approve/reject signals
      'audit.view', 'health.view'
    ]
    // NOTE: operators cannot modify system settings (no *.admin perms)
  },
  viewer: {
    label: 'Viewer',
    permissions: [
      'dashboard.view', 'signals.view', 'approvals.view', 'audit.view', 'health.view'
    ] // read-only
  }
};

// Admin-only protected areas (Configuration, Governance settings, Backup, Module Registry)
const ADMIN_ONLY = [
  'config.admin', 'governance.admin', 'backup.admin', 'modules.admin', 'users.admin'
];

function permissionsFor(role) {
  const r = ROLES[role];
  return r ? r.permissions.slice() : [];
}

function can(role, permission) {
  const perms = permissionsFor(role);
  if (perms.includes('*')) return true;          // admin
  if (ADMIN_ONLY.includes(permission)) return false; // non-admin blocked from admin-only
  return perms.includes(permission);
}

function listRoles() {
  return Object.keys(ROLES).map(k => ({ role: k, label: ROLES[k].label, permissions: ROLES[k].permissions }));
}

module.exports = { ROLES, ADMIN_ONLY, permissionsFor, can, listRoles };
