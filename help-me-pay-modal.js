/**
 * FORDIPS TECH - HELP ME PAY MODAL SYSTEM
 * Complete modal-based Help Me Pay functionality with order tracking
 */

class HelpMePayModal {
    constructor() {
        this.modalId = 'helpMePayModal';
        this.orderData = null;
        this.init();
    }

    init() {
        // Attach event listener to Help Me Pay button
        document.addEventListener('DOMContentLoaded', () => {
            const helpMePayBtn = document.getElementById('checkoutHelpMePayBtn');
            if (helpMePayBtn) {
                helpMePayBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openModal();
                });
            }
        });
    }

    openModal() {
        // Validate cart
        if (!cart || cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return;
        }

        // Get customer info from checkout form if available
        const customerName = document.getElementById('customerName')?.value || 'A friend';
        const customerEmail = document.getElementById('customerEmail')?.value || '';

        // Prepare order data
        this.orderData = {
            customerName: customerName,
            customerEmail: customerEmail,
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            subtotal: getCartTotal(),
            total: getCartTotal(),
            currency: window.currencyManager ? window.currencyManager.currentCurrency : 'USD',
            timestamp: new Date().toISOString()
        };

        // Create and show modal
        this.createModal();
    }

    createModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById(this.modalId);
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = this.modalId;
        modal.className = 'modal';
        modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 10000; align-items: center; justify-content: center;';

        modal.innerHTML = `
            <div class="modal-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;" onclick="window.helpMePayModal.closeModal()"></div>
            <div class="modal-content" style="position: relative; z-index: 2; background: white; border-radius: 20px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
                <button class="modal-close" onclick="window.helpMePayModal.closeModal()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 2rem; cursor: pointer; color: #666; z-index: 3;">&times;</button>

                <div style="padding: 2.5rem;">
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div style="width: 80px; height: 80px; margin: 0 auto 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <h2 style="margin: 0 0 0.5rem 0; color: #1a1a2e; font-size: 1.75rem;">Help Me Pay</h2>
                        <p style="color: #666; margin: 0;">Request someone to help you pay for this order</p>
                    </div>

                    <!-- Order Summary -->
                    <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                        <h3 style="margin: 0 0 1rem 0; font-size: 1rem; color: #374151;">Order Summary</h3>
                        <div id="helpMePayOrderItems">
                            ${this.orderData.items.map(item => `
                                <div style="display: flex; gap: 1rem; margin-bottom: 0.75rem; align-items: center;">
                                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; font-size: 0.9rem;">${item.name}</div>
                                        <div style="color: #666; font-size: 0.85rem;">Qty: ${item.quantity} × $${item.price}</div>
                                    </div>
                                    <div style="font-weight: 700; color: #2563eb;">$${(item.price * item.quantity).toLocaleString()}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="border-top: 2px solid #e5e7eb; padding-top: 1rem; margin-top: 1rem; display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700;">
                            <span>Total:</span>
                            <span style="color: #2563eb;">$${this.orderData.total.toLocaleString()}</span>
                        </div>
                    </div>

                    <!-- Form -->
                    <form id="helpMePayForm" onsubmit="window.helpMePayModal.submitRequest(event)">
                        <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #1f2937;">Who should pay for this order?</h3>

                        <div style="margin-bottom: 1.25rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151; font-size: 0.9rem;">Their Name *</label>
                            <input type="text" id="helperName" required placeholder="e.g., John Doe" style="width: 100%; padding: 0.875rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem; transition: all 0.3s;" onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#e5e7eb'">
                        </div>

                        <div style="margin-bottom: 1.25rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151; font-size: 0.9rem;">Their Email or Phone Number *</label>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <input type="email" id="helperEmail" placeholder="email@example.com" style="width: 100%; padding: 0.875rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem; transition: all 0.3s;" onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#e5e7eb'">
                                <input type="tel" id="helperPhone" placeholder="+1 234 567 8900" style="width: 100%; padding: 0.875rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem; transition: all 0.3s;" onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#e5e7eb'">
                            </div>
                            <small style="color: #6b7280; font-size: 0.8rem; margin-top: 0.25rem; display: block;">Provide at least one contact method</small>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151; font-size: 0.9rem;">Personal Message (Optional)</label>
                            <textarea id="helperMessage" rows="3" placeholder="Add a personal message..." style="width: 100%; padding: 0.875rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem; resize: vertical; font-family: inherit; transition: all 0.3s;" onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#e5e7eb'"></textarea>
                        </div>

                        <!-- Info Box -->
                        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #93c5fd; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem;">
                            <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                <div>
                                    <strong style="color: #1e40af; display: block; margin-bottom: 0.5rem;">How it works:</strong>
                                    <ul style="margin: 0; padding-left: 1.25rem; color: #1f2937; font-size: 0.9rem; line-height: 1.6;">
                                        <li>We'll send them a secure payment link via email/SMS</li>
                                        <li>They can view the order details and pay using their preferred method</li>
                                        <li>Order status will be "Pending" until they complete payment</li>
                                        <li>You'll both receive confirmation when payment is complete</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- Buttons -->
                        <div style="display: flex; gap: 1rem;">
                            <button type="button" onclick="window.helpMePayModal.closeModal()" style="flex: 1; padding: 1rem; border: 2px solid #e5e7eb; background: white; color: #374151; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">
                                Cancel
                            </button>
                            <button type="submit" style="flex: 2; padding: 1rem; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(102, 126, 234, 0.4)'">
                                Send Payment Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    async submitRequest(event) {
        event.preventDefault();

        const helperName = document.getElementById('helperName').value.trim();
        const helperEmail = document.getElementById('helperEmail').value.trim();
        const helperPhone = document.getElementById('helperPhone').value.trim();
        const helperMessage = document.getElementById('helperMessage').value.trim();

        // Validation
        if (!helperName) {
            showNotification('Please enter the helper\'s name', 'error');
            return;
        }

        if (!helperEmail && !helperPhone) {
            showNotification('Please provide at least email or phone number', 'error');
            return;
        }

        // Create order with pending status
        const orderId = this.generateOrderId();
        const paymentLink = `${window.location.origin}/help-me-pay-payment.html?order=${orderId}`;

        const orderRequest = {
            orderId: orderId,
            status: 'pending',
            customerName: this.orderData.customerName,
            customerEmail: this.orderData.customerEmail,
            helperName: helperName,
            helperEmail: helperEmail,
            helperPhone: helperPhone,
            helperMessage: helperMessage,
            items: this.orderData.items,
            subtotal: this.orderData.subtotal,
            total: this.orderData.total,
            currency: this.orderData.currency,
            paymentLink: paymentLink,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours
        };

        // Save to localStorage (in production, this would go to a database)
        this.saveOrder(orderRequest);

        // Show sending notification
        showNotification('Sending payment request...', 'info');

        // Simulate sending email/SMS (in production, this would use a backend service)
        await this.sendPaymentRequest(orderRequest);

        // Close modal
        this.closeModal();

        // Show success message
        this.showSuccessMessage(orderRequest);
    }

    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `HMP-${timestamp}-${random}`;
    }

    saveOrder(orderRequest) {
        // Get existing orders
        const orders = JSON.parse(localStorage.getItem('helpMePayOrders') || '[]');

        // Add new order
        orders.push(orderRequest);

        // Save back to localStorage
        localStorage.setItem('helpMePayOrders', JSON.stringify(orders));

        console.log('Order saved:', orderRequest);
    }

    async sendPaymentRequest(orderRequest) {
        // In production, this would send actual emails/SMS
        // For now, we'll just log the details and save them

        const emailContent = `
Hi ${orderRequest.helperName},

${orderRequest.customerName} has sent you a payment request!

${orderRequest.helperMessage ? `Message: "${orderRequest.helperMessage}"` : ''}

Order Details:
${orderRequest.items.map(item => `- ${item.name} (${item.quantity}x) - $${(item.price * item.quantity).toLocaleString()}`).join('\n')}

Total Amount: $${orderRequest.total.toLocaleString()} ${orderRequest.currency}

Click here to view and pay: ${orderRequest.paymentLink}

This link expires in 48 hours.

Thank you!
FORDIPS TECH
        `;

        console.log('Email/SMS would be sent with content:', emailContent);

        // Save notification details
        const notification = {
            orderId: orderRequest.orderId,
            type: 'payment_request',
            recipient: orderRequest.helperEmail || orderRequest.helperPhone,
            content: emailContent,
            sentAt: new Date().toISOString()
        };

        const notifications = JSON.parse(localStorage.getItem('helpMePayNotifications') || '[]');
        notifications.push(notification);
        localStorage.setItem('helpMePayNotifications', JSON.stringify(notifications));

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    showSuccessMessage(orderRequest) {
        const message = `
            <div style="text-align: center; padding: 2rem;">
                <div style="width: 100px; height: 100px; margin: 0 auto 1.5rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: scaleIn 0.5s ease;">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <h2 style="margin: 0 0 1rem 0; color: #1a1a2e; font-size: 1.75rem;">Payment Request Sent!</h2>
                <p style="color: #666; margin: 0 0 1.5rem 0; font-size: 1.1rem;">
                    We've sent a secure payment link to <strong style="color: #2563eb;">${orderRequest.helperName}</strong>
                </p>
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px; margin: 0 0 1.5rem 0; text-align: left;">
                    <div style="margin-bottom: 0.75rem;"><strong>Order ID:</strong> ${orderRequest.orderId}</div>
                    <div style="margin-bottom: 0.75rem;"><strong>Status:</strong> <span style="color: #f59e0b;">⏳ Pending Payment</span></div>
                    <div style="margin-bottom: 0.75rem;"><strong>Total:</strong> $${orderRequest.total.toLocaleString()} ${orderRequest.currency}</div>
                    ${orderRequest.helperEmail ? `<div style="margin-bottom: 0.75rem;"><strong>Email:</strong> ${orderRequest.helperEmail}</div>` : ''}
                    ${orderRequest.helperPhone ? `<div style="margin-bottom: 0.75rem;"><strong>Phone:</strong> ${orderRequest.helperPhone}</div>` : ''}
                </div>
                <p style="color: #666; font-size: 0.95rem; margin: 0 0 1.5rem 0;">
                    They have 48 hours to complete the payment. You'll receive a confirmation email once they pay.
                </p>
                <button onclick="window.location.href='index.html'" style="padding: 1rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                    Back to Home
                </button>
            </div>
        `;

        // Show in a new modal
        const successModal = document.createElement('div');
        successModal.className = 'modal';
        successModal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 10001; align-items: center; justify-content: center;';
        successModal.innerHTML = `
            <div class="modal-content" style="background: white; border-radius: 20px; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
                ${message}
            </div>
        `;
        document.body.appendChild(successModal);

        // Clear cart
        cart = [];
        saveCart();
        updateCartUI();
    }

    closeModal() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }
}

// Initialize on page load
window.helpMePayModal = new HelpMePayModal();
