/**
 * FORDIPS TECH - Enhanced Checkout System
 * Handles order placement, Supabase integration, and notifications
 */

// Admin email defined in contact-system.js

// Enhanced checkout form submission
function initializeEnhancedCheckout() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (!checkoutForm) return;

    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();

    const form = e.target;

    // Get cart items
    const cartItems = getCartItems();
    if (!cartItems || cartItems.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    // Prepare order data
    const orderData = {
        firstName: document.getElementById('checkoutFirstName').value,
        lastName: document.getElementById('checkoutLastName').value,
        email: document.getElementById('checkoutEmail').value,
        phone: document.getElementById('checkoutPhone')?.value || '',
        address: document.getElementById('checkoutAddress').value,
        city: document.getElementById('checkoutCity').value,
        zipCode: document.getElementById('checkoutZip').value,
        paymentMethod: document.querySelector('input[name="payment"]:checked').value
    };

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Processing Payment...</span>';

    try {
        // Check if payment method is Stripe (credit card)
        if (orderData.paymentMethod === 'card' || orderData.paymentMethod === 'stripe') {
            // Process with Stripe - this will redirect to Stripe Checkout
            if (window.stripePayment && typeof window.stripePayment.processPayment === 'function') {
                // Save order data to localStorage for after payment
                localStorage.setItem('pending_order', JSON.stringify({
                    orderData,
                    cartItems,
                    timestamp: Date.now()
                }));

                // Process Stripe payment (will redirect)
                await window.stripePayment.processPayment(orderData, cartItems);
                // Note: Code won't reach here as Stripe redirects to their checkout page
            } else {
                throw new Error('Stripe payment not initialized. Please try again.');
            }
        } else {
            // For other payment methods (COD, bank transfer, etc.), create order without payment
            const result = await window.orderTracking.createOrderWithTracking(orderData, cartItems);

            if (result.success) {
                // Clear cart
                clearCart();

                // Close checkout modal
                if (typeof closeCheckoutModal === 'function') {
                    closeCheckoutModal();
                }

                // Show thank you message with tracking
                showThankYouWithTracking(result.orderNumber, result.trackingNumber, cartItems, orderData);

                // Show success notification
                showNotification('Order placed successfully!', 'success');
            } else {
                throw new Error(result.error || 'Failed to create order');
            }
        }

    } catch (error) {
        showNotification(error.message || 'Failed to process payment. Please try again.', 'error');

        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// Save order to Supabase
async function saveOrderToSupabase(orderData, orderItems) {
    try {
        // Check if Supabase client exists
        if (typeof supabaseClient === 'undefined') {
            // Fallback to localStorage for demo
            return saveOrderToLocalStorage(orderData, orderItems);
        }

        // Insert order
        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (orderError) throw orderError;

        // Insert order items with order_id
        const itemsWithOrderId = orderItems.map(item => ({
            ...item,
            order_id: order.id
        }));

        const { error: itemsError } = await supabaseClient
            .from('order_items')
            .insert(itemsWithOrderId);

        if (itemsError) throw itemsError;

        return order.id;

    } catch (error) {
        // Fallback to localStorage
        return saveOrderToLocalStorage(orderData, orderItems);
    }
}

// Fallback: Save order to localStorage (for demo/testing)
function saveOrderToLocalStorage(orderData, orderItems) {
    const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const order = {
        id: orderId,
        ...orderData,
        items: orderItems,
        created_at: new Date().toISOString()
    };

    // Get existing orders
    const orders = JSON.parse(localStorage.getItem('fordips_orders') || '[]');
    orders.push(order);

    // Save to localStorage
    localStorage.setItem('fordips_orders', JSON.stringify(orders));

    return orderId;
}

// Send notifications to customer and admin
async function sendOrderNotifications(orderId, orderData, orderItems) {
    try {
        // Prepare notification messages
        const customerMessage = createCustomerNotification(orderId, orderData, orderItems);
        const adminMessage = createAdminNotification(orderId, orderData, orderItems);

        // If Supabase is available, save notifications
        if (typeof supabaseClient !== 'undefined') {
            const notifications = [
                {
                    order_id: orderId,
                    recipient_email: orderData.customer_email,
                    recipient_type: 'customer',
                    subject: `Order Confirmation - ${orderId}`,
                    message: customerMessage,
                    status: 'sent'
                },
                {
                    order_id: orderId,
                    recipient_email: ADMIN_EMAIL,
                    recipient_type: 'admin',
                    subject: `New Order Received - ${orderId}`,
                    message: adminMessage,
                    status: 'sent'
                }
            ];

            await supabaseClient
                .from('notifications')
                .insert(notifications);
        }

        // In a real app, you would send actual emails here
        // For now, console log the notifications

        // Store notifications in localStorage for demo
        const allNotifications = JSON.parse(localStorage.getItem('fordips_notifications') || '[]');
        allNotifications.push({
            orderId,
            customerEmail: orderData.customer_email,
            adminEmail: ADMIN_EMAIL,
            timestamp: new Date().toISOString(),
            customerMessage,
            adminMessage
        });
        localStorage.setItem('fordips_notifications', JSON.stringify(allNotifications));

        return true;
    } catch (error) {
        return false;
    }
}

// Create customer notification message
function createCustomerNotification(orderId, orderData, orderItems) {
    const itemsList = orderItems.map(item => {
        let itemText = `• ${item.product_name} x${item.quantity} - $${item.subtotal.toFixed(2)}`;
        if (item.variant_color) itemText += ` (${item.variant_color})`;
        if (item.variant_storage) itemText += ` [${item.variant_storage}]`;
        if (item.variant_size) itemText += ` [${item.variant_size}]`;
        return itemText;
    }).join('\n');

    return `
Dear ${orderData.customer_name},

Thank you for your order at Fordips Tech!

Order ID: ${orderId}
Order Date: ${new Date().toLocaleDateString()}

Order Details:
${itemsList}

Subtotal: $${orderData.total_amount.toFixed(2)}
Shipping: FREE
Total: $${orderData.total_amount.toFixed(2)}

Shipping Address:
${orderData.shipping_address}
${orderData.city}, ${orderData.zip_code}

Payment Method: ${orderData.payment_method}

We'll send you another email when your order ships.

Thank you for shopping with us!

Best regards,
Fordips Tech Team
support@fordipstech.com
(667) 256 3680
    `.trim();
}

// Create admin notification message
function createAdminNotification(orderId, orderData, orderItems) {
    const itemsList = orderItems.map(item => {
        let itemText = `• ${item.product_name} x${item.quantity} - $${item.subtotal.toFixed(2)}`;
        if (item.variant_color) itemText += ` (${item.variant_color})`;
        if (item.variant_storage) itemText += ` [${item.variant_storage}]`;
        return itemText;
    }).join('\n');

    return `
NEW ORDER RECEIVED

Order ID: ${orderId}
Order Date: ${new Date().toLocaleString()}

Customer Information:
Name: ${orderData.customer_name}
Email: ${orderData.customer_email}
Phone: ${orderData.customer_phone}

Shipping Address:
${orderData.shipping_address}
${orderData.city}, ${orderData.zip_code}

Payment Method: ${orderData.payment_method}

Order Items:
${itemsList}

Total Amount: $${orderData.total_amount.toFixed(2)}

Please process this order as soon as possible.
    `.trim();
}

// Show thank you message modal
function showThankYouMessage(orderData, orderId) {
    const thankYouHTML = `
        <div class="thank-you-modal active" id="thankYouModal">
            <div class="modal-overlay"></div>
            <div class="thank-you-content">
                <div class="thank-you-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>

                <h2>Thank You for Your Order!</h2>

                <div class="order-confirmation-details">
                    <p class="confirmation-message">
                        Your order has been successfully placed and is being processed.
                    </p>

                    <div class="order-summary-box">
                        <div class="summary-row">
                            <span>Order ID:</span>
                            <strong>${orderId}</strong>
                        </div>
                        <div class="summary-row">
                            <span>Email:</span>
                            <strong>${orderData.customer_email}</strong>
                        </div>
                        <div class="summary-row">
                            <span>Total:</span>
                            <strong>$${orderData.total_amount.toFixed(2)}</strong>
                        </div>
                    </div>

                    <p class="confirmation-note">
                        We've sent a confirmation email to <strong>${orderData.customer_email}</strong>
                        with your order details and tracking information.
                    </p>

                    <div class="next-steps">
                        <h3>What's Next?</h3>
                        <ul>
                            <li>✓ You'll receive an email confirmation shortly</li>
                            <li>✓ We'll notify you when your order ships</li>
                            <li>✓ Free shipping on all orders</li>
                        </ul>
                    </div>
                </div>

                <button class="btn btn-primary" onclick="closeThankYouMessage()">
                    Continue Shopping
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', thankYouHTML);
    document.body.style.overflow = 'hidden';
}

// Show thank you with tracking (NEW)
function showThankYouWithTracking(orderNumber, trackingNumber, cartItems, orderData) {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cartItems.map(item =>
        `<div class="thank-you-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="thank-you-item-info">
                <strong>${item.name}</strong>
                <p>Qty: ${item.quantity} × $${item.price.toFixed(2)}</p>
            </div>
            <span class="thank-you-item-total">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>`
    ).join('');

    const thankYouHTML = `
        <div class="thank-you-modal active" id="thankYouModal">
            <div class="modal-overlay"></div>
            <div class="thank-you-content">
                <div class="thank-you-icon">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" stroke-width="4"/>
                        <path d="M30 50 L45 65 L70 40" fill="none" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
                    </svg>
                </div>

                <h2>Thank You for Your Order!</h2>
                <p class="thank-you-message">Your order has been placed successfully and is being processed.</p>

                <div class="order-summary-box">
                    <div class="summary-row">
                        <span>Order Number:</span>
                        <strong class="order-number">${orderNumber}</strong>
                    </div>
                    <div class="summary-row">
                        <span>Tracking Number:</span>
                        <strong class="tracking-number">${trackingNumber}</strong>
                    </div>
                    <div class="summary-row">
                        <span>Total:</span>
                        <strong class="order-total">$${total.toFixed(2)}</strong>
                    </div>
                </div>

                <div class="order-items-summary">
                    <h4>Order Items:</h4>
                    ${itemsList}
                </div>

                <div class="confirmation-info">
                    <p>✉️ Confirmation email sent to <strong>${orderData.email}</strong></p>
                    <p>📧 Admin notified at <strong>${ADMIN_EMAIL}</strong></p>
                </div>

                <div class="next-steps">
                    <h4>What's Next?</h4>
                    <ul>
                        <li>✓ You'll receive an email confirmation shortly</li>
                        <li>✓ We'll notify you when your order ships</li>
                        <li>✓ Track your order anytime with the tracking number above</li>
                    </ul>
                </div>

                <div class="thank-you-actions">
                    <button onclick="window.showOrderTrackingModal('${orderNumber}')" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 10px; font-size: 1rem; padding: 0.875rem 1.75rem;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink: 0;">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>Track Order</span>
                    </button>
                    <button onclick="closeThankYouMessage()" class="btn btn-outline">
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', thankYouHTML);
    document.body.style.overflow = 'hidden';
}

// Close thank you message
function closeThankYouMessage() {
    const modal = document.getElementById('thankYouModal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
}

// Helper functions for cart operations
function getCartItems() {
    return JSON.parse(localStorage.getItem('fordips_cart') || '[]');
}

function clearCart() {
    localStorage.removeItem('fordips_cart');

    // Update cart UI
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = '0';

    const cartItems = document.getElementById('cartItems');
    if (cartItems) {
        cartItems.innerHTML = `
            <div class="empty-cart-state">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <p class="empty-cart">Your cart is empty</p>
                <a href="#products" class="btn-start-shopping">Start Shopping</a>
            </div>
        `;
    }

    // Update totals
    const subtotal = document.getElementById('subtotalAmount');
    const total = document.getElementById('totalAmount');
    if (subtotal) subtotal.textContent = '$0.00';
    if (total) total.textContent = '$0.00';
}

// Show notification toast
function showNotification(message, type = 'info') {
    // Use the admin notification system if available
    if (typeof window.showNotification !== 'undefined' && window.showNotification !== showNotification) {
        window.showNotification(message, type);
        return;
    }

    // Initialize notification container if it doesn't exist
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;
        document.body.appendChild(container);
    }

    // Get icon based on type
    const icons = {
        success: '<svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
        error: '<svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
        warning: '<svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
        info: '<svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
    };

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };

    // Create notification element - Simple circle with icon
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: ${colors[type] || colors.info};
        border-radius: 50%;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        color: white;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    notification.innerHTML = `<div style="filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));">${icons[type] || icons.info}</div>`;

    container.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove after duration
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeEnhancedCheckout();
});
