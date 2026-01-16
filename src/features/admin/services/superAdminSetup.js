import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../utils/firebaseConfig';

const DEBUG = import.meta.env.VITE_DEBUG_LOGS === 'true';

export const checkSuperAdminExists = async () => {
  try {
    const q1 = query(collection(db, 'users'), where('role', '==', 'superadmin'));
    const s1 = await getDocs(q1);
    if (!s1.empty) return true;
    const q2 = query(collection(db, 'users'), where('role', '==', 'super_admin'));
    const s2 = await getDocs(q2);
    return !s2.empty;
  } catch { return false; }
};

export const initializeSuperAdminUser = async () => {
  return { success: false, message: 'Manual setup required' };
};

export const checkSuperAdminInitialization = async () => {
  try {
    return { isInitialized: await checkSuperAdminExists(), timestamp: new Date().toISOString() };
  } catch (error) {
    return { isInitialized: false, error: error.message, timestamp: new Date().toISOString() };
  }
};

export const setupInitialSuperAdmin = async () => {
  try { return await initializeSuperAdminUser(); }
  catch (error) { return { success: false, error: error.message }; }
};

export const initializeSuperAdminSystem = async () => {
  try {
    const status = await checkSuperAdminInitialization();
    let setupResult = null;
    if (!status.isInitialized) setupResult = await setupInitialSuperAdmin();
    return { wasAlreadyInitialized: status.isInitialized, setupPerformed: !status.isInitialized, setupResult, timestamp: new Date().toISOString() };
  } catch (error) {
    return { wasAlreadyInitialized: false, setupPerformed: false, error: error.message, timestamp: new Date().toISOString() };
  }
};

export default { checkSuperAdminInitialization, setupInitialSuperAdmin, initializeSuperAdminSystem };