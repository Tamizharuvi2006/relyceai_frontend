import { doc, setDoc, getDoc, collection, updateDoc, query, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../utils/firebaseConfig';
import { createUserFolderStructure } from '../../files/services/fileService';
import { MEMBERSHIP_PLANS } from '../../membership/services/membershipService';

export async function generateUserId() {
    const counterRef = doc(db, 'counters', 'userIds');
    const counterSnap = await getDoc(counterRef);
    let nextIdNumber = 1;

    if (counterSnap.exists()) {
        const currentCounter = counterSnap.data().currentId || 0;
        nextIdNumber = currentCounter + 1;
        await updateDoc(counterRef, { currentId: nextIdNumber, lastUpdated: serverTimestamp() });
    } else {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        let maxIdNumber = 0;
        snapshot.docs.forEach(userDoc => {
            const userData = userDoc.data();
            if (userData.uniqueUserId?.startsWith('RA')) {
                const idNumber = parseInt(userData.uniqueUserId.substring(2));
                if (!isNaN(idNumber) && idNumber > maxIdNumber) maxIdNumber = idNumber;
            }
        });
        nextIdNumber = maxIdNumber + 1;
        await setDoc(counterRef, { currentId: nextIdNumber, lastUpdated: serverTimestamp() });
    }
    return `RA${nextIdNumber.toString().padStart(3, '0')}`;
}

export async function createUserProfile(userData, membershipPlan = 'free') {
    const userId = userData.uid;
    const userEmail = userData.email;
    const userName = userData.displayName || userEmail.split('@')[0];
    const uniqueUserId = await generateUserId();

    const now = new Date();
    const planDetails = MEMBERSHIP_PLANS[membershipPlan.toUpperCase()];
    const expiryDate = planDetails?.duration !== 'unlimited' ? new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)) : null;

    const userProfile = {
        email: userEmail,
        displayName: userName,
        userId, uniqueUserId,
        role: 'user',
        accountCreatedAt: serverTimestamp(),
        accountCreatedDate: now.toISOString(),
        lastLoginAt: serverTimestamp(),
        membership: {
            plan: membershipPlan,
            planName: planDetails.name,
            status: 'active',
            startDate: now.toISOString(),
            expiryDate: expiryDate?.toISOString() || null,
            isExpired: false,
            billingCycle: 'monthly',
            autoRenew: false,
            paymentStatus: membershipPlan === 'free' ? 'free' : 'pending'
        },
        usage: {
            totalChats: 0, totalMessages: 0, totalFilesUploaded: 0,
            storageUsedMB: 0, monthlyQuotaUsed: 0, lastResetDate: now.toISOString()
        },
        settings: { notifications: true, emailUpdates: true, dataRetention: true }
    };

    await setDoc(doc(db, 'users', userId), userProfile);
    await createUserFolderStructure(userId, userName);
    return userProfile;
}

export async function updateUserUsage(userId, updates) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return;

        const currentUsage = userDoc.data().usage;
        const usageUpdates = {};
        if (updates.chats) usageUpdates['usage.totalChats'] = currentUsage.totalChats + updates.chats;
        if (updates.messages) usageUpdates['usage.totalMessages'] = currentUsage.totalMessages + updates.messages;
        if (updates.filesUploaded) usageUpdates['usage.totalFilesUploaded'] = currentUsage.totalFilesUploaded + updates.filesUploaded;
        if (updates.storageUsedMB) usageUpdates['usage.storageUsedMB'] = currentUsage.storageUsedMB + updates.storageUsedMB;
        if (updates.quotaUsed) usageUpdates['usage.monthlyQuotaUsed'] = currentUsage.monthlyQuotaUsed + updates.quotaUsed;
        await updateDoc(userRef, usageUpdates);
    } catch { /* silent */ }
}

export async function updateUserLastLogin(userId) {
    try {
        await updateDoc(doc(db, 'users', userId), { lastLoginAt: serverTimestamp() });
    } catch { /* silent */ }
}

export async function assignUserIdToExistingUser(userId, userData) {
    try {
        if (userData.uniqueUserId) return userData.uniqueUserId;
        const uniqueUserId = await generateUserId();
        await updateDoc(doc(db, 'users', userId), { uniqueUserId, updatedAt: serverTimestamp() });
        return uniqueUserId;
    } catch { return null; }
}

export async function ensureUserHasId(userId) {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) return null;

        const userData = userDoc.data();
        if (userData.uniqueUserId) return userData.uniqueUserId;

        const uniqueUserId = await generateUserId();
        await updateDoc(userDocRef, { uniqueUserId, updatedAt: serverTimestamp() });
        return uniqueUserId;
    } catch { return null; }
}

export async function getUserRole(userId) {
    try {
        const userData = await getUserData(userId);
        if (!userData) return 'user';
        const role = userData.role || 'user';
        return role === 'super_admin' ? 'superadmin' : role;
    } catch { return 'user'; }
}

export async function getUserData(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.exists() ? userDoc.data() : null;
    } catch { return null; }
}
