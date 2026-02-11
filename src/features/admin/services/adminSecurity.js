import { auth } from '../../../utils/firebaseConfig';

function normalizeRole(roleValue) {
  if (!roleValue) return '';
  const role = String(roleValue).trim().toLowerCase();
  return role === 'super_admin' ? 'superadmin' : role;
}

async function getClaimsRole(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) return { role: '', claims: {} };
  const tokenResult = await user.getIdTokenResult(forceRefresh);
  const claims = tokenResult?.claims || {};
  const roleFromClaim = normalizeRole(claims.role);
  const role = roleFromClaim || (claims.superadmin ? 'superadmin' : claims.admin ? 'admin' : '');
  return { role, claims };
}

export async function verifyAdminAccess(userId) {
  if (!auth.currentUser) return { isAdmin: false, isSuperAdmin: false, error: 'Not authenticated' };

  try {
    const { role, claims } = await getClaimsRole(true);
    const isSuperAdmin = role === 'superadmin' || claims.superadmin === true;
    const isAdmin = isSuperAdmin || role === 'admin' || claims.admin === true;

    if (!isAdmin) {
      return { isAdmin: false, isSuperAdmin: false, error: 'Unauthorized' };
    }

    return { isAdmin, isSuperAdmin, error: null };
  } catch {
    return { isAdmin: false, isSuperAdmin: false, error: 'Verification failed' };
  }
}

export async function canAccessAdminDashboard(userId) {
  const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(userId);
  return !error && (isAdmin || isSuperAdmin);
}

export async function canAccessSuperAdminFeatures(userId) {
  const { isSuperAdmin, error } = await verifyAdminAccess(userId);
  return !error && isSuperAdmin;
}

export async function protectAdminRoute(userId, requireSuperAdmin = false) {
  if (!userId) return { allowed: false, redirect: '/login' };
  const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(userId);
  if (error) return { allowed: false, redirect: '/unauthorized' };
  if (requireSuperAdmin && !isSuperAdmin) return { allowed: false, redirect: '/unauthorized' };
  if (!isAdmin && !isSuperAdmin) return { allowed: false, redirect: '/unauthorized' };
  return { allowed: true, redirect: null };
}

export function sanitizeUserData(userData, isAdminContext = false) {
  const sanitized = { ...userData };
  delete sanitized.password;
  delete sanitized.resetPasswordToken;
  delete sanitized.resetPasswordExpires;
  if (!isAdminContext) {
    delete sanitized.role;
    delete sanitized.paymentHistory;
    delete sanitized.adminNotes;
  }
  return sanitized;
}

export function validateRoleChange(currentRole, newRole, requesterRole) {
  const validRoles = ['user', 'premium', 'admin', 'superadmin'];
  if (!validRoles.includes(currentRole) || !validRoles.includes(newRole) || !validRoles.includes(requesterRole)) return false;
  
  // Superadmin can do anything
  if (requesterRole === 'superadmin') return true;

  // Admin can only manage 'user' and 'premium'
  if (requesterRole === 'admin') {
    if (currentRole === 'admin' || currentRole === 'superadmin') return false; // Cannot modify other admins
    if (newRole === 'admin' || newRole === 'superadmin') return false; // Cannot promote to admin
    return true; 
  }

  return false;
}
