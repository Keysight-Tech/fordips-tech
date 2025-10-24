/**
 * FORDIPS TECH - Order Tracking UI
 * Customer-facing order tracking interface
 */

/**
 * Show order tracking modal
 */
function showOrderTrackingModal(orderNumber = null) {
    const modalHTML = `
        <div class="order-tracking-modal active" id="orderTrackingModal">
            <div class="modal-overlay" onclick="closeOrderTrackingModal()"></div>
            <div class="order-tracking-content">
                <button class="modal-close" onclick="closeOrderTrackingModal()">&times;</button>

                <h2 class="modal-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Track Your Order
                </h2>

                <div class="tracking-search">
                    <input type="text" id="trackingNumberInput" placeholder="Enter your order number (e.g., FT12345678)"
                           value="${orderNumber || ''}" class="tracking-input">
                    <button onclick="trackOrder()" class="btn btn-primary">
                        Track Order
                    </button>
                </div>

                <div id="trackingResults"></div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';

    if (orderNumber) {
        setTimeout(() => trackOrder(), 500);
    }
}

/**
 * Close order tracking modal
 */
function closeOrderTrackingModal() {
    const modal = document.getElementById('orderTrackingModal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
}

/**
 * Track order
 */
async function trackOrder() {
    const trackingInput = document.getElementById('trackingNumberInput');
    const resultsDiv = document.getElementById('trackingResults');
    const orderNumber = trackingInput.value.trim();

    if (!orderNumber) {
        resultsDiv.innerHTML = '<p class="error-message">Please enter your order number</p>';
        return;
    }

    resultsDiv.innerHTML = '<div class="loading-spinner">🔍 Searching for your order...</div>';

    const result = await window.orderTracking.getOrderTracking(orderNumber);

    if (!result.success) {
        resultsDiv.innerHTML = `
            <div class="tracking-error">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>Order Not Found</h3>
                <p>We couldn't find an order with number <strong>${orderNumber}</strong></p>
                <p>Please check your order number and try again.</p>
            </div>
        `;
        return;
    }

    displayOrderTracking(result.order);
}

/**
 * Display order tracking information
 */
function displayOrderTracking(order) {
    const resultsDiv = document.getElementById('trackingResults');
    const statusInfo = window.orderTracking.ORDER_STATUSES[order.status] || window.orderTracking.ORDER_STATUSES.pending;
    const statusHistory = JSON.parse(order.status_history || '[]');

    const html = `
        <div class="tracking-details">
            <!-- Order Header -->
            <div class="tracking-header">
                <div class="tracking-status" style="background: ${statusInfo.color}20; border-left: 4px solid ${statusInfo.color}">
                    <span class="status-icon">${statusInfo.icon}</span>
                    <div>
                        <h3>${statusInfo.label}</h3>
                        <p>${statusInfo.description}</p>
                    </div>
                </div>
            </div>

            <!-- Order Info -->
            <div class="tracking-info-grid">
                <div class="info-item">
                    <label>Order Number</label>
                    <strong>${order.order_number}</strong>
                </div>
                <div class="info-item">
                    <label>Order Date</label>
                    <strong>${new Date(order.created_at).toLocaleDateString()}</strong>
                </div>
                <div class="info-item">
                    <label>Total Amount</label>
                    <strong>$${parseFloat(order.total_amount).toFixed(2)}</strong>
                </div>
                ${order.tracking_number ? `
                    <div class="info-item">
                        <label>Tracking Number</label>
                        <strong>${order.tracking_number}</strong>
                    </div>
                ` : ''}
                ${order.carrier ? `
                    <div class="info-item">
                        <label>Carrier</label>
                        <strong>${order.carrier}</strong>
                    </div>
                ` : ''}
                ${order.estimated_delivery ? `
                    <div class="info-item">
                        <label>Est. Delivery</label>
                        <strong>${new Date(order.estimated_delivery).toLocaleDateString()}</strong>
                    </div>
                ` : ''}
            </div>

            <!-- Status Timeline -->
            <div class="status-timeline">
                <h4>Order Timeline</h4>
                <div class="timeline">
                    ${renderTimeline(statusHistory, order.status)}
                </div>
            </div>

            <!-- Contact Support -->
            <div class="tracking-footer">
                <p>Need help with your order?</p>
                <button onclick="closeOrderTrackingModal(); document.getElementById('contactForm').scrollIntoView({behavior: 'smooth'})" class="btn btn-outline">
                    Contact Support
                </button>
            </div>
        </div>
    `;

    resultsDiv.innerHTML = html;
}

/**
 * Render status timeline
 */
function renderTimeline(statusHistory, currentStatus) {
    if (statusHistory.length === 0) {
        return '<p class="timeline-empty">No status updates yet</p>';
    }

    return statusHistory.map((event, index) => {
        const statusInfo = window.orderTracking.ORDER_STATUSES[event.status] || {};
        const isLatest = index === statusHistory.length - 1;

        return `
            <div class="timeline-item ${isLatest ? 'active' : ''}">
                <div class="timeline-marker" style="background: ${statusInfo.color || '#ccc'}">
                    ${statusInfo.icon || '•'}
                </div>
                <div class="timeline-content">
                    <h5>${statusInfo.label || event.status}</h5>
                    <p class="timeline-date">${new Date(event.changed_at).toLocaleString()}</p>
                    ${event.notes ? `<p class="timeline-notes">${event.notes}</p>` : ''}
                    ${event.changed_by && event.changed_by !== 'system' ?
                        `<p class="timeline-by">Updated by: ${event.changed_by}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Show my orders modal (for logged-in users)
 */
async function showMyOrdersModal() {
    // Check if user is logged in
    const user = await getCurrentUser();

    if (!user) {
        showNotification('Please log in to view your orders', 'error');
        return;
    }

    const modalHTML = `
        <div class="my-orders-modal active" id="myOrdersModal">
            <div class="modal-overlay" onclick="closeMyOrdersModal()"></div>
            <div class="my-orders-content">
                <button class="modal-close" onclick="closeMyOrdersModal()">&times;</button>

                <h2 class="modal-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    </svg>
                    My Orders
                </h2>

                <div id="myOrdersList">
                    <div class="loading-spinner">Loading your orders...</div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';

    // Load orders
    await loadMyOrders(user.email);
}

/**
 * Close my orders modal
 */
function closeMyOrdersModal() {
    const modal = document.getElementById('myOrdersModal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
}

/**
 * Load customer orders
 */
async function loadMyOrders(customerEmail) {
    const listDiv = document.getElementById('myOrdersList');

    const result = await window.orderTracking.getCustomerOrders(customerEmail);

    if (!result.success || result.orders.length === 0) {
        listDiv.innerHTML = `
            <div class="no-orders">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <h3>No Orders Yet</h3>
                <p>You haven't placed any orders yet.</p>
                <button onclick="closeMyOrdersModal()" class="btn btn-primary">Start Shopping</button>
            </div>
        `;
        return;
    }

    const ordersHTML = result.orders.map(order => {
        const statusInfo = window.orderTracking.ORDER_STATUSES[order.status] || {};

        return `
            <div class="order-card">
                <div class="order-card-header">
                    <div>
                        <h4>${order.order_number}</h4>
                        <p class="order-date">${new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="order-status-badge" style="background: ${statusInfo.color}20; color: ${statusInfo.color}">
                        ${statusInfo.icon} ${statusInfo.label}
                    </div>
                </div>
                <div class="order-card-body">
                    <div class="order-info-row">
                        <span>Items:</span>
                        <strong>${order.items_count}</strong>
                    </div>
                    <div class="order-info-row">
                        <span>Total:</span>
                        <strong>$${parseFloat(order.total_amount).toFixed(2)}</strong>
                    </div>
                    ${order.tracking_number ? `
                        <div class="order-info-row">
                            <span>Tracking:</span>
                            <strong>${order.tracking_number}</strong>
                        </div>
                    ` : ''}
                </div>
                <div class="order-card-footer">
                    <button onclick="closeMyOrdersModal(); showOrderTrackingModal('${order.order_number}')"
                            class="btn btn-outline btn-sm">
                        Track Order
                    </button>
                </div>
            </div>
        `;
    }).join('');

    listDiv.innerHTML = `<div class="orders-grid">${ordersHTML}</div>`;
}

/**
 * Get current user
 */
async function getCurrentUser() {
    if (window.fordipsTech && window.fordipsTech.getCurrentUser) {
        return await window.fordipsTech.getCurrentUser();
    }
    return null;
}

// Add navigation link for order tracking
document.addEventListener('DOMContentLoaded', () => {
    // Add "Track Order" link to navigation if not exists
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && !document.getElementById('trackOrderLink')) {
        const li = document.createElement('li');
        li.innerHTML = '<a href="#" id="trackOrderLink" class="nav-link">Track Order</a>';
        navMenu.appendChild(li);

        document.getElementById('trackOrderLink').addEventListener('click', (e) => {
            e.preventDefault();
            showOrderTrackingModal();
        });
    }
});

// Export functions
window.showOrderTrackingModal = showOrderTrackingModal;
window.closeOrderTrackingModal = closeOrderTrackingModal;
window.trackOrder = trackOrder;
window.showMyOrdersModal = showMyOrdersModal;
window.closeMyOrdersModal = closeMyOrdersModal;

console.log('✅ Order Tracking UI loaded');
