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
    STUDENT: {
        id: 'student',
        name: 'Student Plan',
        monthlyPrice: 249,
        yearlyPrice: 2499,
        duration: 'unlimited', // Students should have ongoing access
        features: {
            chatLimit: 100,
            fileUploadLimit: 25,
            fileSizeLimitMB: 25,
            monthlyQuota: 1000
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
    try {
        // Get current pricing from Firestore
        let currentPricing;
        try {
            currentPricing = await getCurrentPricing();
        } catch (error) {
            console.warn('Failed to fetch current pricing, using default:', error);
            currentPricing = {
                free: { monthly: 0, yearly: 0 },
                student: { monthly: 249, yearly: 2499 },
                plus: { monthly: 999, yearly: 9999 },
                pro: { monthly: 1999, yearly: 19999 },
                business: { monthly: 2499, yearly: 24999 }
            };
        }

        const planDetails = MEMBERSHIP_PLANS[newPlan.toUpperCase()];
        if (!planDetails) {
            throw new Error('Invalid membership plan');
        }

        const now = new Date();
        const expiryDate = planDetails.duration !== 'unlimited'
            ? new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days default
            : null;

        const updateData = {
            'membership.plan': newPlan,
            'membership.planName': planDetails.name,
            'membership.status': 'active',
            'membership.startDate': now.toISOString(),
            'membership.expiryDate': expiryDate ? expiryDate.toISOString() : null,
            'membership.isExpired': false,
            'membership.billingCycle': billingCycle,
            'membership.autoRenew': true,
            'membership.paymentStatus': newPlan === 'free' ? 'free' : 'paid',
            'membership.updatedAt': serverTimestamp()
        };

        // Add payment information if provided
        if (paymentData && newPlan !== 'free') {
            // Get the correct amount based on current pricing
            const planPricing = currentPricing[newPlan] || { monthly: 0, yearly: 0 };
            const amount = billingCycle === 'yearly' ? planPricing.yearly : planPricing.monthly;

            // Create a new payment history entry
            const paymentEntry = {
                transactionId: paymentData.transactionId,
                amount: amount,
                currency: paymentData.currency || 'INR',
                method: paymentData.method,
                plan: newPlan,
                billingCycle: billingCycle,
                timestamp: serverTimestamp(),
                date: now.toISOString()
            };

            // Add to payment history array in user document
            updateData['membership.paymentHistory'] = {
                [paymentData.transactionId]: paymentEntry
            };

            // Also add to a separate payments collection for analytics
            try {
                await addDoc(collection(db, 'payments'), {
                    userId: userId,
                    ...paymentEntry
                });
            } catch (paymentError) {
                console.error('Error saving payment to analytics collection:', paymentError);
            }
        }

        await updateDoc(doc(db, 'users', userId), updateData);

        console.log(`✅ Membership updated for user ${userId} to ${planDetails.name}`);
        return { success: true, message: 'Membership updated successfully' };

    } catch (error) {
        console.error('❌ Error updating user membership:', error);
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

        const userData = userDoc.data();
        const membership = userData.membership;

        if (membership.expiryDate && membership.status === 'active') {
            const now = new Date();
            const expiryDate = new Date(membership.expiryDate);

            if (now > expiryDate) {
                // Membership has expired
                await updateDoc(doc(db, 'users', userId), {
                    'membership.status': 'expired',
                    'membership.isExpired': true,
                    'membership.plan': 'free',
                    'membership.planName': 'Free Plan'
                });

                await addMembershipLog(userId, 'free', 'expired');

                console.log(`⏰ Membership expired for user ${userId}`);
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error('❌ Error checking membership expiry:', error);
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

