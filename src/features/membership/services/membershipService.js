import {
    doc,
    getDoc,
    addDoc,
    collection,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from '../../../utils/firebaseConfig';
import { API_BASE_URL } from '../../../utils/api';

/**
 * Membership Plans Configuration
 */
export const MEMBERSHIP_PLANS = {
    FREE: {
        id: 'free',
        name: 'Free Plan',
        monthlyPrice: 0,
        yearlyPrice: 0,
        duration: 'unlimited',
        features: {
            chatLimit: 10,
            fileUploadLimit: 10,
            fileSizeLimitMB: 5,
            monthlyQuota: 100
        }
    },
    STARTER: {
        id: 'starter',
        name: 'Starter Plan',
        monthlyPrice: 199,
        yearlyPrice: 1999,
        duration: 'unlimited',
        features: {
            chatLimit: 150,
            fileUploadLimit: 25,
            fileSizeLimitMB: 25,
            monthlyQuota: 1500
        }
    },
    PLUS: {
        id: 'plus',
        name: 'Plus Plan',
        monthlyPrice: 999,
        yearlyPrice: 9999,
        duration: 'unlimited', // Plus users should have ongoing access
        features: {
            chatLimit: 500,
            fileUploadLimit: 100,
            fileSizeLimitMB: 100,
            monthlyQuota: 5000
        }
    },
    PRO: {
        id: 'pro',
        name: 'Pro Plan',
        monthlyPrice: 1999,
        yearlyPrice: 19999,
        duration: 'unlimited', // Pro users should have ongoing access
        features: {
            chatLimit: 1000,
            fileUploadLimit: 250,
            fileSizeLimitMB: 250,
            monthlyQuota: 10000,
            prioritySupport: true,
            advancedFeatures: true
        }
    },
    BUSINESS: {
        id: 'business',
        name: 'Business Plan',
        monthlyPrice: 2499,
        yearlyPrice: 24999,
        duration: 'unlimited', // Business users should have ongoing access
        features: {
            chatLimit: -1, // unlimited
            fileUploadLimit: -1, // unlimited
            fileSizeLimitMB: 500,
            monthlyQuota: -1, // unlimited
            prioritySupport: true,
            advancedFeatures: true,
            teamManagement: true
        }
    }
};

export function isMembershipExpired(membership) {
    if (!membership) return false;
    const expiryValue = membership.expiryDate || membership.expiresAt;
    if (!expiryValue) return false;
    try {
        if (expiryValue.toDate) {
            return Timestamp.now().toMillis() > expiryValue.toDate().getTime();
        }
        if (expiryValue.toMillis) {
            return Timestamp.now().toMillis() > expiryValue.toMillis();
        }
        const parsed = new Date(expiryValue);
        if (!Number.isNaN(parsed.getTime())) {
            return Date.now() > parsed.getTime();
        }
    } catch {
        return false;
    }
    return false;
}

/**
 * Updates user membership plan
 */
export async function updateUserMembership(userId, newPlan, billingCycle = 'monthly', paymentData = null) {
    // DEPRECATION WARNING: Paid plan upgrades should go through Razorpay -> Backend /payment/verify
    // This function is now ONLY safe for free plan downgrades initiated by user.
    if (newPlan !== 'free') {
        console.warn('[membershipService] updateUserMembership is deprecated for paid plans.');
        console.warn('[membershipService] Use Razorpay payment flow instead. Backend handles membership.');
        throw new Error('Paid plan updates must go through payment flow for security.');
    }

    try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/users/membership/downgrade`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Failed to downgrade membership');
        }

        console.log(`User ${userId} downgraded to Free plan`);
        return await response.json();

    } catch (error) {
        console.error('Error updating membership:', error);
        throw error;
    }
}

/**
 * Checks if user's membership has expired and updates status
 */
export async function checkMembershipExpiry(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return false;
        const data = userDoc.data();
        const membership = data.membership;

        const expired = isMembershipExpired(membership);
        if (!expired) return false;

        // Client should not write membership status. Backend cron handles expiry.
        if (membership?.status !== 'expired') {
            const membershipPlan = membership?.plan || membership?.planName || 'unknown';
            await addMembershipLog(userId, membershipPlan, 'expired').catch(err =>
                console.warn('[membershipService] Failed to log expiry:', err)
            );
            console.warn(`[membershipService] Detected expired membership for ${userId}`);
        }

        return true;
    } catch (error) {
        console.error('[membershipService] checkMembershipExpiry error:', error);
        return false;
    }
}

/**
 * Gets user's current membership details
 */
export async function getUserMembership(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return null;

        const userData = userDoc.data();
        const membership = userData.membership || { status: 'inactive' };
        if (isMembershipExpired(membership)) {
            return { ...membership, status: 'expired' };
        }
        return membership;
    } catch (error) {
        console.error('Error getting user membership:', error);
        return null;
    }
}

/**
 * Logs membership changes for audit trail
 */
export async function addMembershipLog(userId, plan, action, paymentData = null) {
    try {
        const logData = {
            userId: userId,
            action: action, // 'upgrade', 'downgrade', 'expired', 'cancelled'
            plan: plan,
            timestamp: serverTimestamp(),
            date: new Date().toISOString(),
            paymentData: paymentData || null
        };

        await addDoc(collection(db, 'membershipLogs'), logData);
    } catch (error) {
        console.error('Error logging membership change:', error);
    }
}
