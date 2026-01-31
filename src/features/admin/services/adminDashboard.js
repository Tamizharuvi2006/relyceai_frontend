import { collection, getDocs, doc, updateDoc, query, where, orderBy, getDoc, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebaseConfig';
import { verifyAdminAccess, validateRoleChange } from './adminSecurity';
import { generateUserId } from '../../users/services/userService';

export const MEMBERSHIP_PLANS = {
  free: { name: 'Free', monthly: 0, yearly: 0, yearlyDiscountPercentage: 0, features: ['Generic AI chatbot', 'Limited business chatbot', 'Basic data visualization', '15 chats/month', '30-day history'] },
  starter: { name: 'Starter', monthly: 199, yearly: 1999, yearlyDiscountPercentage: 16.7, features: ['Generic + Business chatbot', 'Interactive visualization', '150 chats/month', '60-day history', 'Export chat', 'Priority support'] },
  plus: { name: 'Plus', monthly: 499, yearly: 4999, yearlyDiscountPercentage: 16.7, features: ['Advanced business workflows', 'Enhanced visualization', '600 chats/month', 'File upload (50 files, 100MB)', 'Premium support', 'Export reports'] },
  pro: { name: 'Pro', monthly: 1499, yearly: 14999, yearlyDiscountPercentage: 16.7, features: ['Team collaboration (5 users)', 'Advanced analytics', 'Custom branding', 'API access', '1,500 chats/month', 'Priority tech support'] },
  business: { name: 'Business', monthly: 4999, yearly: 49999, yearlyDiscountPercentage: 16.7, features: ['Unlimited chats', 'Unlimited file uploads', 'Dedicated support manager', 'Team management', 'Advanced security', 'SLA guarantee'] }
};

export const getAllUsers = async (requesterId) => {
  const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(requesterId);
  if (error || (!isAdmin && !isSuperAdmin)) throw new Error('Unauthorized access to user data');

  const snapshot = await getDocs(collection(db, 'users'));
  const users = snapshot.docs.map(userDoc => ({
    id: userDoc.id, 
    ...userDoc.data(),
    stats: { filesUploaded: 0, conversations: 0, folders: 0 } // Default stats to avoid UI breaking
  }));

  return users.sort((a, b) => {
    const idA = a.uniqueUserId ? parseInt(a.uniqueUserId.replace('RA', '')) : 0;
    const idB = b.uniqueUserId ? parseInt(b.uniqueUserId.replace('RA', '')) : 0;
    return idA - idB;
  });
};

export const getUserStats = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return { filesUploaded: 0, conversations: 0, folders: 0 };

    const userData = userDoc.data();
    let filesUploaded = 0, conversations = 0, folders = 0;

    try { filesUploaded = (await getDocs(collection(db, 'users', userId, 'files'))).size; } catch { if (userData.files) filesUploaded = Object.keys(userData.files).length; }
    try { conversations = (await getDocs(collection(db, 'users', userId, 'conversations'))).size; } catch { if (userData.conversations) conversations = Object.keys(userData.conversations).length; }
    try { folders = (await getDocs(collection(db, 'users', userId, 'folders'))).size; } catch { folders = 3; }

    return { filesUploaded, conversations, folders, lastActivity: userData.lastActivity || userData.createdAt, totalUsage: userData.usage || 0 };
  } catch { return { filesUploaded: 0, conversations: 0, folders: 0 }; }
};

export const getUserStatistics = async (requesterId) => {
  try {
    const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(requesterId);
    if (error || (!isAdmin && !isSuperAdmin)) throw new Error('Unauthorized access to statistics');

    const snapshot = await getDocs(collection(db, 'users'));
    let totalUsers = 0, premiumUsers = 0, monthlyRevenue = 0, newUsersThisMonth = 0;
    const now = new Date();

    let currentPricing;
    try { currentPricing = await getCurrentPricing(); } catch { currentPricing = MEMBERSHIP_PLANS; }

    snapshot.docs.forEach(d => {
      const userData = d.data();
      totalUsers++;
      const createdAt = userData.createdAt?.toDate?.() || new Date(userData.createdAt);
      if (createdAt?.getMonth() === now.getMonth() && createdAt?.getFullYear() === now.getFullYear()) newUsersThisMonth++;

      const membership = userData.membership;
      if (membership?.plan && membership.plan !== 'free') {
        premiumUsers++;
        const plan = membership.plan, billingCycle = membership.billingCycle || 'monthly';
        if (currentPricing[plan]) monthlyRevenue += billingCycle === 'yearly' ? currentPricing[plan].yearly / 12 : currentPricing[plan].monthly;
      }
    });

    return { totalUsers, premiumUsers, freeUsers: totalUsers - premiumUsers, monthlyRevenue: Math.round(monthlyRevenue), newUsersThisMonth, conversionRate: totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0 };
  } catch { return { totalUsers: 0, premiumUsers: 0, freeUsers: 0, monthlyRevenue: 0, newUsersThisMonth: 0, conversionRate: 0 }; }
};

export const updateUserMembership = async (userId, newPlan, billingCycle = 'monthly', paymentData = null, requesterId) => {
  const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(requesterId);
  if (error || (!isAdmin && !isSuperAdmin)) throw new Error('Unauthorized access to membership update');

  const userDocRef = doc(db, 'users', userId);
  const expiryDate = new Date();
  billingCycle === 'yearly' ? expiryDate.setFullYear(expiryDate.getFullYear() + 1) : expiryDate.setDate(expiryDate.getDate() + 30);

  const updateData = {
    membership: {
      plan: newPlan, planName: newPlan.charAt(0).toUpperCase() + newPlan.slice(1), billingCycle,
      startDate: Timestamp.fromDate(new Date()), expiryDate: newPlan === 'free' ? null : Timestamp.fromDate(expiryDate),
      isActive: newPlan !== 'free', updatedAt: Timestamp.fromDate(new Date())
    },
    lastActivity: Timestamp.fromDate(new Date())
  };

  if (paymentData && newPlan !== 'free') {
    const paymentEntry = { transactionId: paymentData.transactionId, amount: paymentData.amount, currency: paymentData.currency || 'INR', method: paymentData.method, plan: newPlan, billingCycle, timestamp: Timestamp.fromDate(new Date()), date: new Date().toISOString() };
    const userDoc = await getDoc(userDocRef);
    const existingHistory = userDoc.exists() ? userDoc.data().membership?.paymentHistory || {} : {};
    updateData.membership.paymentHistory = { ...existingHistory, [paymentData.transactionId]: paymentEntry };
    try { await setDoc(doc(collection(db, 'payments')), { userId, ...paymentEntry }); } catch { /* silent */ }
  }

  await updateDoc(userDocRef, updateData);
  return { success: true, message: 'Membership updated successfully' };
};

export const getUsersByPlan = async (planType, requesterId) => {
  try {
    const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(requesterId);
    if (error || (!isAdmin && !isSuperAdmin)) throw new Error('Unauthorized access to user data');
    const q = query(collection(db, 'users'), where('membership.plan', '==', planType), orderBy('createdAt', 'desc'));
    return (await getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};

export const getRecentActivity = async (limit = 10, requesterId) => {
  try {
    const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(requesterId);
    if (error || (!isAdmin && !isSuperAdmin)) throw new Error('Unauthorized access to activity data');
    const q = query(collection(db, 'users'), orderBy('lastActivity', 'desc'));
    return (await getDocs(q)).docs.slice(0, limit).map(d => {
      const data = d.data();
      return { userId: d.id, email: data.email, lastActivity: data.lastActivity, plan: data.membership?.plan || 'free', action: 'Last seen' };
    });
  } catch { return []; }
};

export const exportUserData = async (format = 'json', requesterId) => {
  const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(requesterId);
  if (error || (!isAdmin && !isSuperAdmin)) throw new Error('Unauthorized access to export data');
  const users = await getAllUsers(requesterId);
  if (format === 'csv') {
    const headers = ['ID', 'Email', 'Plan', 'Created At', 'Expires At', 'Files', 'Conversations'];
    return [headers, ...users.map(u => [u.id, u.email, u.membership?.plan || 'free', u.createdAt?.toDate?.()?.toISOString() || '', u.membership?.expiryDate?.toDate?.()?.toISOString() || '', u.stats?.filesUploaded || 0, u.stats?.conversations || 0])];
  }
  return users;
};

export const getRevenueAnalytics = async (requesterId) => {
  try {
    const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(requesterId);
    if (error || (!isAdmin && !isSuperAdmin)) throw new Error('Unauthorized access to revenue analytics');

    const planPricing = { starter: { monthly: 199, yearly: 1999 }, plus: { monthly: 999, yearly: 9999 }, business: { monthly: 2499, yearly: 24999 } };
    const analytics = { daily: {}, monthly: {}, planBreakdown: { starter: { count: 0, revenue: 0 }, plus: { count: 0, revenue: 0 }, business: { count: 0, revenue: 0 } }, totalRevenue: 0 };

    (await getDocs(collection(db, 'users'))).docs.forEach(d => {
      const membership = d.data().membership;
      if (membership?.plan && membership.plan !== 'free' && planPricing[membership.plan]) {
        const revenue = (membership.billingCycle || 'monthly') === 'yearly' ? planPricing[membership.plan].yearly : planPricing[membership.plan].monthly;
        analytics.planBreakdown[membership.plan].count++;
        analytics.planBreakdown[membership.plan].revenue += revenue;
        analytics.totalRevenue += revenue;
      }
    });
    return analytics;
  } catch { return { daily: {}, monthly: {}, planBreakdown: { starter: { count: 0, revenue: 0 }, plus: { count: 0, revenue: 0 }, business: { count: 0, revenue: 0 } }, totalRevenue: 0 }; }
};

export const testPaymentsCollection = async () => {
  try { await getDocs(collection(db, 'payments')); return true; } catch { return false; }
};

export const getPaymentAnalytics = async (requesterId) => {
  try {
    const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(requesterId);
    if (error || (!isAdmin && !isSuperAdmin)) throw new Error('Unauthorized access to payment analytics');

    if (!await testPaymentsCollection()) return { payments: [], analytics: { totalRevenue: 0, monthlyRevenue: {}, planDistribution: { starter: { count: 0, revenue: 0 }, plus: { count: 0, revenue: 0 }, pro: { count: 0, revenue: 0 }, business: { count: 0, revenue: 0 } }, paymentMethods: { card: 0, upi: 0, netbanking: 0 } } };

    const payments = [], analytics = { totalRevenue: 0, monthlyRevenue: {}, planDistribution: { starter: { count: 0, revenue: 0 }, plus: { count: 0, revenue: 0 }, pro: { count: 0, revenue: 0 }, business: { count: 0, revenue: 0 } }, paymentMethods: { card: 0, upi: 0, netbanking: 0 } };

    (await getDocs(collection(db, 'payments'))).docs.forEach(d => {
      try {
        const data = { id: d.id, ...d.data() };
        payments.push(data);
        analytics.totalRevenue += data.amount || 0;
        if (data.timestamp) {
          const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
          const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          analytics.monthlyRevenue[key] = (analytics.monthlyRevenue[key] || 0) + (data.amount || 0);
        }
        if (data.plan && analytics.planDistribution[data.plan]) { analytics.planDistribution[data.plan].count++; analytics.planDistribution[data.plan].revenue += data.amount || 0; }
        if (data.method && analytics.paymentMethods[data.method] !== undefined) analytics.paymentMethods[data.method]++;
      } catch { /* silent */ }
    });

    payments.sort((a, b) => {
      try { return (b.timestamp?.toDate?.() || new Date(b.timestamp || 0)).getTime() - (a.timestamp?.toDate?.() || new Date(a.timestamp || 0)).getTime(); } catch { return 0; }
    });
    return { payments, analytics };
  } catch { return { payments: [], analytics: { totalRevenue: 0, monthlyRevenue: {}, planDistribution: { starter: { count: 0, revenue: 0 }, plus: { count: 0, revenue: 0 }, pro: { count: 0, revenue: 0 }, business: { count: 0, revenue: 0 } }, paymentMethods: { card: 0, upi: 0, netbanking: 0 } } }; }
};

export const updateUserRole = async (userId, newRole, requesterId) => {
  const { isAdmin, isSuperAdmin, error: accessError } = await verifyAdminAccess(requesterId);
  if (accessError || (!isAdmin && !isSuperAdmin)) throw new Error('Insufficient permissions to modify user roles');

  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) throw new Error('User not found');

  const currentRole = userDoc.data().role || 'user';
  if (!validateRoleChange(currentRole, newRole, isSuperAdmin ? 'superadmin' : 'admin')) throw new Error('Invalid role change - insufficient permissions');

  await updateDoc(userDocRef, { role: newRole, lastUpdatedAt: Timestamp.fromDate(new Date()) });
  return { success: true, message: 'User role updated successfully' };
};

export const calculateYearlyPrice = (monthlyPrice, discountPercentage) => {
  if (monthlyPrice === 0) return 0;
  return Math.round(monthlyPrice * 12 * (1 - discountPercentage / 100));
};

export const savePricingChanges = async (updatedPrices, requesterId) => {
  const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(requesterId);
  if (error || (!isAdmin && !isSuperAdmin)) throw new Error('Unauthorized access to pricing updates');

  const processedPrices = { ...updatedPrices };
  Object.keys(processedPrices).forEach(planId => {
    const plan = processedPrices[planId];
    if (plan.monthly !== undefined && plan.yearlyDiscountPercentage !== undefined) {
      processedPrices[planId] = { ...plan, yearly: calculateYearlyPrice(plan.monthly, plan.yearlyDiscountPercentage) };
    } else if (plan.monthly !== undefined && plan.yearly === undefined) {
      processedPrices[planId] = { ...plan, yearly: plan.monthly * 12, yearlyDiscountPercentage: 0 };
    }
  });

  await setDoc(doc(db, 'config', 'pricing'), { plans: processedPrices, updatedAt: Timestamp.fromDate(new Date()), updatedBy: requesterId }, { merge: true });
  return { success: true, message: 'Pricing updated successfully!' };
};

export const getCurrentPricing = async () => {
  try {
    const pricingDoc = await getDoc(doc(db, 'config', 'pricing'));
    return pricingDoc.exists() ? pricingDoc.data().plans || MEMBERSHIP_PLANS : MEMBERSHIP_PLANS;
  } catch { return MEMBERSHIP_PLANS; }
};

export const validateCoupon = async (couponCode) => {
  try { const { validateCoupon: fn } = await import('../../../utils/couponManagement'); return await fn(couponCode); } catch { return null; }
};

export const saveCoupon = async (couponData, requesterId) => {
  try {
    const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(requesterId);
    if (error || (!isAdmin && !isSuperAdmin)) throw new Error('Unauthorized');
    const { saveCoupon: fn } = await import('../../../utils/couponManagement');
    return await fn(couponData);
  } catch (e) { return { success: false, message: 'Failed: ' + e.message }; }
};

export const getAllCoupons = async (requesterId) => {
  try {
    const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(requesterId);
    if (error || (!isAdmin && !isSuperAdmin)) throw new Error('Unauthorized');
    const { getAllCoupons: fn } = await import('../../../utils/couponManagement');
    return await fn();
  } catch { return []; }
};

export const updateCoupon = async (couponId, updateData, requesterId) => {
  try {
    const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(requesterId);
    if (error || (!isAdmin && !isSuperAdmin)) throw new Error('Unauthorized');
    const { updateCoupon: fn } = await import('../../../utils/couponManagement');
    return await fn(couponId, updateData);
  } catch (e) { return { success: false, message: 'Failed: ' + e.message }; }
};

export const deleteCoupon = async (couponId, requesterId) => {
  try {
    const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(requesterId);
    if (error || (!isAdmin && !isSuperAdmin)) throw new Error('Unauthorized');
    const { deleteCoupon: fn } = await import('../../../utils/couponManagement');
    return await fn(couponId);
  } catch (e) { return { success: false, message: 'Failed: ' + e.message }; }
};

export const toggleCouponStatus = async (couponId, active, requesterId) => {
  try {
    const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(requesterId);
    if (error || (!isAdmin && !isSuperAdmin)) throw new Error('Unauthorized');
    const { toggleCouponStatus: fn } = await import('../../../utils/couponManagement');
    return await fn(couponId, active);
  } catch (e) { return { success: false, message: 'Failed: ' + e.message }; }
};

export const deleteUser = async (userId, requesterId) => {
  const { isAdmin, isSuperAdmin, error: accessError } = await verifyAdminAccess(requesterId);
  if (accessError || (!isAdmin && !isSuperAdmin)) throw new Error('Insufficient permissions to delete users');

  const { doc, deleteDoc, collection, getDocs, query, where } = await import('firebase/firestore');

  await deleteDoc(doc(db, 'users', userId));

  const sessions = await getDocs(collection(db, 'users', userId, 'chatSessions'));
  for (const session of sessions.docs) {
    const msgs = await getDocs(collection(db, 'users', userId, 'chatSessions', session.id, 'messages'));
    await Promise.all(msgs.docs.map(m => deleteDoc(doc(db, 'users', userId, 'chatSessions', session.id, 'messages', m.id))));
    await deleteDoc(doc(db, 'users', userId, 'chatSessions', session.id));
  }

  const files = await getDocs(collection(db, 'users', userId, 'files'));
  await Promise.all(files.docs.map(f => deleteDoc(doc(db, 'users', userId, 'files', f.id))));

  const folders = await getDocs(collection(db, 'users', userId, 'folders'));
  await Promise.all(folders.docs.map(f => deleteDoc(doc(db, 'users', userId, 'folders', f.id))));

  const shared = await getDocs(query(collection(db, 'sharedChats'), where('userId', '==', userId)));
  await Promise.all(shared.docs.map(s => deleteDoc(doc(db, 'sharedChats', s.id))));

  return { success: true, message: 'User deleted successfully' };
};

export const getUsersByMembership = async (membershipType, requesterId) => {
  try {
    const { isAdmin, isSuperAdmin, error } = await verifyAdminAccess(requesterId);
    if (error || (!isAdmin && !isSuperAdmin)) throw new Error('Unauthorized');
    return (await getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};

export const checkPaymentStatus = async (paymentId) => {
  try {
     const token = localStorage.getItem('token');
     const response = await fetch(`http://localhost:8080/payment/admin/check-payment/${paymentId}`, {
        method: 'GET',
        headers: {
           'Authorization': `Bearer ${token}`
        }
     });
     if (!response.ok) {
        throw new Error((await response.json()).detail || 'Failed to check payment');
     }
     return await response.json();
  } catch (error) {
     throw error;
  }
};

export const syncPaymentManual = async (paymentId, userId, planId) => {
  try {
     const token = localStorage.getItem('token');
     const response = await fetch(`http://localhost:8080/payment/admin/sync-payment/${paymentId}`, {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId, plan_id: planId })
     });
     if (!response.ok) {
        throw new Error((await response.json()).detail || 'Failed to sync payment');
     }
     return await response.json();
  } catch (error) {
     throw error;
  }
};
