import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../utils/firebaseConfig';

export const initializeAdminUser = async () => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'admin'));
    const snapshot = await getDocs(q);
    return snapshot.empty ? { success: false, message: 'No admin found' } : { success: true, message: 'Admin exists' };
  } catch (error) { return { success: false, error: error.message }; }
};

export const assignRolesToExistingUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    let updated = 0;
    for (const userDoc of snapshot.docs) {
      if (!userDoc.data().role) {
        await updateDoc(doc(db, 'users', userDoc.id), { role: 'user', updatedAt: serverTimestamp() });
        updated++;
      }
    }
    return { success: true, updatedCount: updated };
  } catch (error) { return { success: false, error: error.message }; }
};

export const setupInitialAdmin = async () => {
  try {
    const result = await initializeAdminUser();
    return result.success;
  } catch { return false; }
};

export const assignRolesToUsers = async () => {
  try { return await assignRolesToExistingUsers(); }
  catch (error) { return { success: false, error: error.message, updatedCount: 0, totalCount: 0 }; }
};

export const initializeAdminSystem = async () => {
  try {
    const adminResult = await setupInitialAdmin();
    const roleResult = await assignRolesToUsers();
    return { adminSetup: adminResult, roleAssignment: roleResult, timestamp: new Date().toISOString() };
  } catch (error) {
    return { adminSetup: false, roleAssignment: { success: false, error: error.message }, timestamp: new Date().toISOString(), error: error.message };
  }
};

export default { setupInitialAdmin, assignRolesToUsers, initializeAdminSystem };