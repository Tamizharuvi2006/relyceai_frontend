/**
 * Role Management Utility
 * Aligns with Firebase Security Rules
 * 
 * Firebase Rules Summary:
 * - SuperAdmin can change other users' roles (but not demote another SuperAdmin)
 * - SuperAdmin cannot demote themselves
 * - Admin/SuperAdmin can write to coupons, tokens, blogs
 * - Only SuperAdmin can write to plans, pricing, stats
 * - Audit logs are append-only (no update/delete)
 */

// Define role hierarchy (higher numbers = more privileges)
// Must match Firebase rule expectations
export const ROLE_HIERARCHY = {
  'user': 1,
  'premium': 2,
  'admin': 3,
  'superadmin': 4  // Matches Firebase: get(...).data.role == "superadmin"
};

// Define role display names
export const ROLE_DISPLAY_NAMES = {
  'user': 'User',
  'premium': 'Premium User',
  'admin': 'Administrator',
  'superadmin': 'Super Administrator'
};

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  'user': ['read:own_data', 'update:own_profile'],
  'premium': ['read:own_data', 'update:own_profile', 'access:premium_features'],
  'admin': [
    'read:all_users',
    'write:coupons',
    'write:tokens',
    'write:blogs',
    'read:stats'
  ],
  'superadmin': [
    'read:all_users',
    'write:coupons',
    'write:tokens',
    'write:blogs',
    'read:stats',
    'write:stats',
    'write:plans',
    'write:pricing',
    'change:user_roles',
    'read:audit_logs',
    'create:audit_logs'
  ]
};

/**
 * Check if a user has a specific role or higher
 * @param {string} userRole - User's current role
 * @param {string} requiredRole - Required role
 * @returns {boolean} Whether user has required role
 */
export const hasRole = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
};

/**
 * Check if a user can modify another user's role
 * Based on Firebase Rules:
 * - Only SuperAdmin can change roles
 * - SuperAdmin cannot demote another SuperAdmin
 * - SuperAdmin cannot demote themselves
 * 
 * @param {string} currentUserRole - Current user's role
 * @param {string} targetUserRole - Target user's current role
 * @param {string} newRole - New role to assign
 * @param {boolean} isSelf - Whether modifying own role
 * @returns {boolean} Whether current user can modify target user's role
 */
export const canModifyUserRole = (currentUserRole, targetUserRole, newRole, isSelf = false) => {
  // Only superadmin can change roles (Firebase: role == "superadmin")
  if (currentUserRole !== 'superadmin') {
    return false;
  }

  // Cannot modify own role (Firebase: request.auth.uid != userId)
  if (isSelf) {
    return false;
  }

  // Cannot demote another superadmin (Firebase: no demotion of superadmin)
  if (targetUserRole === 'superadmin' && newRole !== 'superadmin') {
    return false;
  }

  return true;
};

/**
 * Get user role level
 * @param {string} role - Role name
 * @returns {number} Role level (higher = more privileges)
 */
export const getUserRoleLevel = (role) => {
  return ROLE_HIERARCHY[role] || 0;
};

/**
 * Check if user is super admin (matches Firebase: role == "superadmin")
 * @param {string} role - User role
 * @returns {boolean} Whether user is super admin
 */
export const checkIsSuperAdmin = (role) => {
  return role === 'superadmin';
};

/**
 * Check if user is admin (matches Firebase: role in ["admin", "superadmin"])
 * @param {string} role - User role
 * @returns {boolean} Whether user is admin or higher
 */
export const checkIsAdminOrHigher = (role) => {
  return role === 'admin' || role === 'superadmin';
};

/**
 * Check if user has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean} Whether user has the permission
 */
export const hasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

/**
 * Get role display name
 * @param {string} role - Role identifier
 * @returns {string} Human-readable role name
 */
export const getRoleDisplayName = (role) => {
  return ROLE_DISPLAY_NAMES[role] || role;
};

/**
 * Get available role options for a user to assign
 * Based on Firebase rules, only superadmin can assign roles
 * @param {string} currentUserRole - Current user's role
 * @returns {Array} Available role options
 */
export const getAssignableRoles = (currentUserRole) => {
  if (currentUserRole !== 'superadmin') {
    return []; // Only superadmin can assign roles
  }

  // Superadmin can assign all roles except superadmin to others
  return [
    { value: 'user', label: 'User' },
    { value: 'premium', label: 'Premium User' },
    { value: 'admin', label: 'Administrator' },
    { value: 'superadmin', label: 'Super Administrator' }
  ];
};

export default {
  ROLE_HIERARCHY,
  ROLE_DISPLAY_NAMES,
  ROLE_PERMISSIONS,
  hasRole,
  canModifyUserRole,
  getUserRoleLevel,
  checkIsSuperAdmin,
  checkIsAdminOrHigher,
  hasPermission,
  getRoleDisplayName,
  getAssignableRoles
};
