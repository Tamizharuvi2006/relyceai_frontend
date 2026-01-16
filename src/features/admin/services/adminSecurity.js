import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebaseConfig';

export async function verifyAdminAccess(userId) {
  if (!userId) return { isAdmin: false, isSuperAdmin: false, error: 'Invalid user ID' };

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return { isAdmin: false, isSuperAdmin: false, error: 'User not found' };

    const userRole = userDoc.data().role || 'user';
    const validRoles = ['user', 'admin', 'superadmin'];
    if (!validRoles.includes(userRole)) return { isAdmin: false, isSuperAdmin: false, error: 'Invalid role' };

    return {
      isAdmin: userRole === 'admin' || userRole === 'superadmin',
      isSuperAdmin: userRole === 'superadmin',
      error: null
    };
  } catch { return { isAdmin: false, isSuperAdmin: false, error: 'Verification failed' }; }
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
  if (requesterRole !== 'superadmin') return false;
  if (currentRole === 'superadmin' && newRole !== 'superadmin') return false;
  return true;
}