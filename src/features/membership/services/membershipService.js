import {
    doc,
    getDoc,
    updateDoc,
    addDoc,
    collection,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../utils/firebaseConfig';
import { getCurrentPricing } from '../../admin/services/adminDashboard';

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
        // Only allow free plan downgrades from frontend
        const planDetails = MEMBERSHIP_PLANS['FREE'];
        const now = new Date();

        const updateData = {
            'membership.plan': 'free',
            'membership.planName': planDetails.name,
            'membership.status': 'active',
            'membership.billingCycle': null,
            'membership.autoRenew': false,
            'membership.paymentStatus': 'free',
            'membership.updatedAt': serverTimestamp()
        };

        await updateDoc(doc(db, 'users', userId), updateData);
        console.log(`✅ User ${userId} downgraded to Free plan`);
        return { success: true, message: 'Downgraded to Free plan' };

    } catch (error) {
        console.error('❌ Error updating membership:', error);
        throw error;
    }
}

/**
 * Checks if user's membership has expired and updates status
 */
export async function checkMembershipExpiry(userId) {
    // START_DEPRECATION_NOTICE
    // Logic moved to Backend (/users/init) for security.
    // Frontend should NOT update membership status directly.
    // END_DEPRECATION_NOTICE
    return false;
}

/**
 * Gets user's current membership details
 */
export async function getUserMembership(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return null;

        const userData = userDoc.data();

        // Check for expiry
        await checkMembershipExpiry(userId);

        return userData.membership;
    } catch (error) {
        console.error('❌ Error getting user membership:', error);
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
        console.error('❌ Error logging membership change:', error);
    }
}

