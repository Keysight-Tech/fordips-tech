/**
 * FORDIPS TECH - Stripe Payment Integration
 * Real-time payment processing with Stripe
 */

// ⚠️ IMPORTANT: Replace this with your actual Stripe publishable key
// To get started:
// 1. Create a free account at https://stripe.com
// 2. Go to https://dashboard.stripe.com/test/apikeys
// 3. Copy your "Publishable key" (starts with pk_test_)
// 4. Replace the key below
// 5. For production, use your LIVE publishable key (starts with pk_live_)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51YOUR_TEST_KEY_HERE';

// Initialize Stripe
let stripe = null;

// Initialize Stripe when DOM is ready
function initializeStripe() {
    try {
        if (typeof Stripe === 'undefined') {
            console.error('❌ Stripe.js not loaded');
            return false;
        }

        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        console.log('✅ Stripe initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Stripe initialization error:', error);
        return false;
    }
}

/**
 * Process payment with Stripe
 */
async function processStripePayment(orderData, cartItems) {
    try {
        if (!stripe) {
            throw new Error('Stripe not initialized');
        }

        // Calculate total
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Prepare line items for Stripe
        const lineItems = cartItems.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: item.description || `${item.name} - Premium electronics`,
                    images: [item.image]
                },
                unit_amount: Math.round(item.price * 100) // Stripe uses cents
            },
            quantity: item.quantity
        }));

        // Show loading state
        showPaymentProcessing();

        // Create checkout session via your server or Supabase Edge Function
        // For now, we'll use Stripe Checkout with client-side redirect
        const { error } = await stripe.redirectToCheckout({
            lineItems: lineItems,
            mode: 'payment',
            successUrl: `${window.location.origin}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/#checkout`,
            customerEmail: orderData.email,
            billingAddressCollection: 'required',
            shippingAddressCollection: {
                allowedCountries: ['US', 'CM', 'GB', 'CA', 'AU']
            },
            metadata: {
                customer_name: `${orderData.firstName} ${orderData.lastName}`,
                customer_phone: orderData.phone || '',
                order_notes: orderData.notes || ''
            }
        });

        if (error) {
            throw error;
        }

    } catch (error) {
        console.error('❌ Stripe payment error:', error);
        hidePaymentProcessing();
        showPaymentError(error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Alternative: Create Stripe Checkout Session via Supabase Edge Function
 * This is more secure and recommended for production
 */
async function createCheckoutSessionViaServer(orderData, cartItems) {
    try {
        // This requires a Supabase Edge Function or backend API
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderData,
                cartItems
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }

        const session = await response.json();

        // Redirect to Stripe Checkout
        const { error } = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (error) {
            throw error;
        }

        return { success: true };

    } catch (error) {
        console.error('❌ Checkout session error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Show payment processing state
 */
function showPaymentProcessing() {
    const processingModal = document.createElement('div');
    processingModal.id = 'paymentProcessingModal';
    processingModal.className = 'payment-processing-modal';
    processingModal.innerHTML = `
        <div class="payment-processing-overlay"></div>
        <div class="payment-processing-content">
            <div class="payment-processing-spinner"></div>
            <h3>Processing Payment</h3>
            <p>Redirecting to secure checkout...</p>
        </div>
    `;
    document.body.appendChild(processingModal);
    document.body.style.overflow = 'hidden';
}

/**
 * Hide payment processing state
 */
function hidePaymentProcessing() {
    const modal = document.getElementById('paymentProcessingModal');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = '';
}

/**
 * Show payment error
 */
function showPaymentError(message) {
    if (typeof showNotification === 'function') {
        showNotification(`Payment Error: ${message}`, 'error');
    } else {
        alert(`Payment Error: ${message}`);
    }
}

/**
 * Handle successful payment (called from success page)
 */
async function handlePaymentSuccess(sessionId) {
    try {
        // Verify payment with your server
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const session = await response.json();

        if (session.payment_status === 'paid') {
            // Clear cart
            localStorage.removeItem('fordips_cart');

            // Show success message
            if (typeof showNotification === 'function') {
                showNotification('Payment successful! Thank you for your order.', 'success');
            }

            // Redirect to orders page or show order details
            return { success: true, session };
        } else {
            throw new Error('Payment not completed');
        }

    } catch (error) {
        console.error('❌ Payment verification error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get payment methods available
 */
function getAvailablePaymentMethods() {
    return [
        {
            id: 'card',
            name: 'Credit/Debit Card',
            icon: '💳',
            description: 'Visa, Mastercard, American Express'
        },
        {
            id: 'apple_pay',
            name: 'Apple Pay',
            icon: '',
            description: 'Pay with Apple Pay'
        },
        {
            id: 'google_pay',
            name: 'Google Pay',
            icon: 'G',
            description: 'Pay with Google Pay'
        }
    ];
}

// Export functions globally
window.stripePayment = {
    processPayment: processStripePayment,
    handleSuccess: handlePaymentSuccess,
    getPaymentMethods: getAvailablePaymentMethods
};

// Initialize Stripe when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStripe);
} else {
    initializeStripe();
}

console.log('💳 Stripe Payment Integration loaded');
