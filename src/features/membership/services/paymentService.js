import { API_BASE_URL } from '../../../utils/api';
import toast from 'react-hot-toast';

/**
 * Payment Service
 * Handles Razorpay integration
 */

// Load Razorpay Script dynamically
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const createOrder = async (amount, currency = 'INR', planId) => {
    try {
        const token = localStorage.getItem('token'); // Get auth token if needed
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}` ;

        const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                amount: amount * 100, // Convert to subunits (paise)
                currency,
                notes: { plan_id: planId }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create order');
        }

        return await response.json();
    } catch (error) {
        console.error('Create Order Error:', error);
        throw error;
    }
};

export const verifyPayment = async (response, planDetails) => {
    try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/payment/verify`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: planDetails.id,
                billing_cycle: planDetails.billingCycle || 'monthly',
                user_id: planDetails.userId
            })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Payment verification failed');
        }

        return await res.json();
    } catch (error) {
        console.error('Verify Payment Error:', error);
        throw error;
    }
};

export const handleRazorpayPayment = async (plan, amount, user, billingCycle, onSuccess, onFailure) => {
    const res = await loadRazorpayScript();

    if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        if (onFailure) onFailure();
        return;
    }

    try {
        // 1. Create Order
        const orderData = await createOrder(amount, 'INR', plan.id);
        
        if (!orderData.success) throw new Error('Order creation failed');

        const { order, key_id } = orderData;

        // 2. Options for Razorpay
        const options = {
            key: key_id, 
            amount: order.amount,
            currency: order.currency,
            name: "Relyce AI",
            description: `Relyce AI ${plan.title} Plan - Access to premium AI features`,
            image: window.location.origin + "/logo.svg", // Use the correct SVG logo from public folder
            order_id: order.id,
            handler: async function (response) {
                try {
                    // 3. Verify Payment
                    await verifyPayment(response, {
                        id: plan.id,
                        billingCycle: billingCycle, 
                        userId: user.uid
                    });
                    
                    // 4. Update Database (via callback)
                    if (onSuccess) onSuccess({
                        transactionId: response.razorpay_payment_id,
                        orderId: response.razorpay_order_id,
                        amount: amount,
                        currency: 'INR',
                        method: 'razorpay'
                    });
                    
                } catch (err) {
                    toast.error(err.message || 'Payment verification failed');
                    if (onFailure) onFailure(err);
                }
            },
            prefill: {
                name: user?.displayName || '',
                email: user?.email || '',
                contact: '' // You can ask user for phone if needed
            },
            notes: {
                address: "Relyce AI Corporate Office",
                plan_details: `${plan.title} Plan`
            },
            theme: {
                color: "#10b981", // Emerald-500 (Matches Web Theme)
                backdrop_color: "#05060a" // Attempt to match dark theme background if supported
            },
            modal: {
                animation: true,
                backdropclose: false,
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

        paymentObject.on('payment.failed', function (response) {
            toast.error(response.error.description);
            if (onFailure) onFailure(response.error);
        });

    } catch (error) {
        toast.error(error.message || 'Something went wrong');
        if (onFailure) onFailure(error);
    }
};
