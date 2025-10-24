/**
 * FORDIPS TECH - Complete Order Tracking System
 * End-to-End Order Management with Customer & Admin Notifications
 */

const ADMIN_EMAIL = 'brineketum@gmail.com';
const ORDER_STATUSES = {
    pending: {
        label: 'Order Pending',
        description: 'Your order has been received and is waiting for confirmation.',
        icon: '⏳',
        color: '#f59e0b'
    },
    confirmed: {
        label: 'Order Confirmed',
        description: 'Your order has been confirmed and will be processed soon.',
        icon: '✓',
        color: '#10b981'
    },
    processing: {
        label: 'Processing',
        description: 'Your order is being prepared for shipment.',
        icon: '📦',
        color: '#3b82f6'
    },
    shipped: {
        label: 'Shipped',
        description: 'Your order is on its way!',
        icon: '🚚',
        color: '#8b5cf6'
    },
    out_for_delivery: {
        label: 'Out for Delivery',
        description: 'Your order is out for delivery and will arrive soon.',
        icon: '🚛',
        color: '#ec4899'
    },
    delivered: {
        label: 'Delivered',
        description: 'Your order has been delivered successfully!',
        icon: '✅',
        color: '#22c55e'
    },
    cancelled: {
        label: 'Cancelled',
        description: 'This order has been cancelled.',
        icon: '❌',
        color: '#ef4444'
    }
};

/**
 * Create order with automatic tracking and notifications
 */
async function createOrderWithTracking(orderData, cartItems) {
    try {
        if (!supabaseClient) {
            return createOrderLocalStorage(orderData, cartItems);
        }

        // Generate order number
        const orderNumber = generateOrderNumber();

        // Calculate total
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create order
        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .insert({
                order_number: orderNumber,
                customer_name: orderData.firstName + ' ' + orderData.lastName,
                customer_email: orderData.email,
                shipping_address: orderData.address,
                shipping_city: orderData.city,
                shipping_zip: orderData.zipCode,
                payment_method: orderData.paymentMethod,
                total_amount: total,
                status: 'pending',
                last_status_update: new Date().toISOString()
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = cartItems.map(item => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            product_price: item.price,
            product_image: item.image,
            quantity: item.quantity,
            variant_color: item.variant?.color || null,
            variant_storage: item.variant?.storage || null,
            variant_option: item.variant?.option || null,
            subtotal: item.price * item.quantity
        }));

        const { error: itemsError } = await supabaseClient
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // Create customer order tracking entry
        await createCustomerOrderTracking(order, cartItems.length);

        // Record initial status
        await recordStatusChange(order.id, null, 'pending', 'system', 'System', 'Order created');

        // Send notifications
        await sendOrderNotifications(order, orderItems, 'order_placed');

        return {
            success: true,
            orderId: order.id,
            orderNumber: order.order_number,
            trackingNumber: order.tracking_number
        };

    } catch (error) {
        console.error('Error creating order:', error);
        return createOrderLocalStorage(orderData, cartItems);
    }
}

/**
 * Generate unique order number
 */
function generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FT${timestamp}${random}`;
}

/**
 * Create customer order tracking entry
 */
async function createCustomerOrderTracking(order, itemsCount) {
    try {
        await supabaseClient
            .from('customer_order_tracking')
            .insert({
                order_id: order.id,
                customer_email: order.customer_email,
                customer_name: order.customer_name,
                order_number: order.order_number,
                status: order.status,
                total_amount: order.total_amount,
                items_count: itemsCount,
                tracking_url: `https://fordipstech.com/track/${order.order_number}`
            });
    } catch (error) {
        console.error('Error creating tracking entry:', error);
    }
}

/**
 * Update order status with notifications
 */
async function updateOrderStatus(orderId, newStatus, changedBy, changedByName, notes = null, trackingInfo = null) {
    try {
        if (!supabaseClient) {
            return { success: false, error: 'Database not available' };
        }

        // Get current order
        const { data: order, error: fetchError } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (fetchError) throw fetchError;

        const oldStatus = order.status;

        // Update order
        const updateData = {
            status: newStatus,
            last_status_update: new Date().toISOString()
        };

        if (notes) updateData.notes = notes;
        if (trackingInfo) {
            if (trackingInfo.trackingNumber) updateData.tracking_number = trackingInfo.trackingNumber;
            if (trackingInfo.carrier) updateData.carrier = trackingInfo.carrier;
            if (trackingInfo.estimatedDelivery) updateData.estimated_delivery_date = trackingInfo.estimatedDelivery;
        }

        const { error: updateError } = await supabaseClient
            .from('orders')
            .update(updateData)
            .eq('id', orderId);

        if (updateError) throw updateError;

        // Record status change
        await recordStatusChange(orderId, oldStatus, newStatus, changedBy, changedByName, notes);

        // Update customer tracking
        await supabaseClient
            .from('customer_order_tracking')
            .update({ status: newStatus })
            .eq('order_id', orderId);

        // Get order items for notification
        const { data: items } = await supabaseClient
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

        // Send notifications
        const updatedOrder = { ...order, ...updateData };
        await sendOrderNotifications(updatedOrder, items, `order_${newStatus}`);

        return {
            success: true,
            oldStatus,
            newStatus,
            orderNumber: order.order_number
        };

    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Record status change in history
 */
async function recordStatusChange(orderId, oldStatus, newStatus, changedBy, changedByName, notes) {
    try {
        await supabaseClient
            .from('order_status_history')
            .insert({
                order_id: orderId,
                previous_status: oldStatus,
                new_status: newStatus,
                changed_by: changedBy,
                changed_by_name: changedByName,
                notes: notes
            });
    } catch (error) {
        console.error('Error recording status change:', error);
    }
}

/**
 * Send order notifications to customer and admin
 */
async function sendOrderNotifications(order, items, notificationType) {
    try {
        const notifications = [];

        // Get status info
        const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;

        // Customer notification
        const customerNotification = {
            order_id: order.id,
            recipient_email: order.customer_email,
            recipient_type: 'customer',
            notification_type: notificationType,
            subject: getCustomerNotificationSubject(order.status, order.order_number),
            message: getCustomerNotificationMessage(order, items, statusInfo),
            metadata: {
                order_number: order.order_number,
                tracking_number: order.tracking_number,
                status: order.status
            }
        };
        notifications.push(customerNotification);

        // Admin notification
        const adminNotification = {
            order_id: order.id,
            recipient_email: ADMIN_EMAIL,
            recipient_type: 'admin',
            notification_type: notificationType,
            subject: getAdminNotificationSubject(order.status, order.order_number),
            message: getAdminNotificationMessage(order, items, statusInfo),
            metadata: {
                order_number: order.order_number,
                customer_email: order.customer_email,
                status: order.status,
                total_amount: order.total_amount
            }
        };
        notifications.push(adminNotification);

        // Save notifications
        const { error } = await supabaseClient
            .from('order_notifications')
            .insert(notifications);

        if (error) throw error;

        console.log(`✅ Notifications sent for order ${order.order_number}`);

        // Show user notification
        if (typeof showNotification === 'function' && notificationType !== 'order_placed') {
            showNotification(
                `Order status updated! Admin has been notified at ${ADMIN_EMAIL}`,
                'success'
            );
        }

        return { success: true };

    } catch (error) {
        console.error('Error sending order notifications:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get customer notification subject
 */
function getCustomerNotificationSubject(status, orderNumber) {
    const subjects = {
        pending: `Order Received - ${orderNumber}`,
        confirmed: `Order Confirmed - ${orderNumber}`,
        processing: `Order Processing - ${orderNumber}`,
        shipped: `Order Shipped - ${orderNumber}`,
        out_for_delivery: `Out for Delivery - ${orderNumber}`,
        delivered: `Order Delivered - ${orderNumber}`,
        cancelled: `Order Cancelled - ${orderNumber}`
    };
    return subjects[status] || `Order Update - ${orderNumber}`;
}

/**
 * Get customer notification message
 */
function getCustomerNotificationMessage(order, items, statusInfo) {
    const itemsList = items.map(item =>
        `- ${item.product_name} x${item.quantity} - $${(item.product_price * item.quantity).toFixed(2)}`
    ).join('\n');

    let trackingInfo = '';
    if (order.tracking_number) {
        trackingInfo = `\n\nTracking Number: ${order.tracking_number}`;
        if (order.carrier) trackingInfo += `\nCarrier: ${order.carrier}`;
        if (order.estimated_delivery_date) {
            trackingInfo += `\nEstimated Delivery: ${new Date(order.estimated_delivery_date).toLocaleDateString()}`;
        }
    }

    return `
Dear ${order.customer_name},

${statusInfo.icon} ${statusInfo.label}

${statusInfo.description}

ORDER DETAILS:
Order Number: ${order.order_number}
Status: ${statusInfo.label}
Total: $${parseFloat(order.total_amount).toFixed(2)}

ITEMS:
${itemsList}
${trackingInfo}

SHIPPING ADDRESS:
${order.shipping_address}
${order.shipping_city}, ${order.shipping_zip}

Track your order: https://fordipstech.com/track/${order.order_number}

Need help? Contact us at support@fordipstech.com or call (667) 256-3680

Thank you for shopping with Fordips Tech!

Best regards,
Fordips Tech Team
    `.trim();
}

/**
 * Get admin notification subject
 */
function getAdminNotificationSubject(status, orderNumber) {
    const subjects = {
        pending: `🔔 NEW ORDER: ${orderNumber}`,
        confirmed: `✅ Order Confirmed: ${orderNumber}`,
        processing: `📦 Order Processing: ${orderNumber}`,
        shipped: `🚚 Order Shipped: ${orderNumber}`,
        out_for_delivery: `🚛 Out for Delivery: ${orderNumber}`,
        delivered: `✅ Order Delivered: ${orderNumber}`,
        cancelled: `❌ Order Cancelled: ${orderNumber}`
    };
    return subjects[status] || `Order Update: ${orderNumber}`;
}

/**
 * Get admin notification message
 */
function getAdminNotificationMessage(order, items, statusInfo) {
    const itemsList = items.map(item =>
        `- ${item.product_name} x${item.quantity} - $${(item.product_price * item.quantity).toFixed(2)}`
    ).join('\n');

    return `
ADMIN ALERT - ORDER UPDATE

${statusInfo.icon} Status: ${statusInfo.label}

ORDER INFORMATION:
Order Number: ${order.order_number}
Customer: ${order.customer_name}
Email: ${order.customer_email}
Total Amount: $${parseFloat(order.total_amount).toFixed(2)}
Payment Method: ${order.payment_method}
Status: ${statusInfo.label}

ITEMS (${items.length}):
${itemsList}

SHIPPING:
${order.shipping_address}
${order.shipping_city}, ${order.shipping_zip}

${order.tracking_number ? `Tracking: ${order.tracking_number}` : ''}
${order.carrier ? `Carrier: ${order.carrier}` : ''}

ACTION REQUIRED:
${status === 'pending' ? '⚠️ New order - Please confirm and process' : ''}
${status === 'processing' ? '📦 Prepare items for shipping' : ''}
${status === 'shipped' ? '✅ Monitor delivery status' : ''}

Order placed: ${new Date(order.created_at).toLocaleString()}
Last updated: ${new Date(order.last_status_update).toLocaleString()}

Manage order: https://fordipstech.com/admin/orders/${order.id}
    `.trim();
}

/**
 * Get order tracking information
 */
async function getOrderTracking(orderNumber) {
    try {
        if (!supabaseClient) {
            return getOrderTrackingLocalStorage(orderNumber);
        }

        const { data, error } = await supabaseClient
            .rpc('get_order_tracking', { p_order_number: orderNumber });

        if (error) throw error;

        if (!data || data.length === 0) {
            return { success: false, error: 'Order not found' };
        }

        return {
            success: true,
            order: data[0]
        };

    } catch (error) {
        console.error('Error getting order tracking:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get customer orders
 */
async function getCustomerOrders(customerEmail) {
    try {
        if (!supabaseClient) {
            return getCustomerOrdersLocalStorage(customerEmail);
        }

        const { data, error } = await supabaseClient
            .rpc('get_customer_orders', { p_customer_email: customerEmail });

        if (error) throw error;

        return {
            success: true,
            orders: data || []
        };

    } catch (error) {
        console.error('Error getting customer orders:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get admin dashboard data
 */
async function getAdminDashboard() {
    try {
        const { data, error } = await supabaseClient
            .rpc('get_admin_order_dashboard');

        if (error) throw error;

        return {
            success: true,
            dashboard: data
        };

    } catch (error) {
        console.error('Error getting admin dashboard:', error);
        return { success: false, error: error.message };
    }
}

/**
 * LocalStorage fallback functions
 */
function createOrderLocalStorage(orderData, cartItems) {
    const orders = JSON.parse(localStorage.getItem('fordips_orders') || '[]');
    const orderNumber = generateOrderNumber();
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = {
        id: 'ORD-' + Date.now(),
        order_number: orderNumber,
        customer_name: orderData.firstName + ' ' + orderData.lastName,
        customer_email: orderData.email,
        total_amount: total,
        status: 'pending',
        items: cartItems,
        created_at: new Date().toISOString(),
        tracking_number: 'FT-' + Date.now()
    };

    orders.push(order);
    localStorage.setItem('fordips_orders', JSON.stringify(orders));

    return {
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        trackingNumber: order.tracking_number
    };
}

function getOrderTrackingLocalStorage(orderNumber) {
    const orders = JSON.parse(localStorage.getItem('fordips_orders') || '[]');
    const order = orders.find(o => o.order_number === orderNumber);

    if (!order) {
        return { success: false, error: 'Order not found' };
    }

    return { success: true, order };
}

function getCustomerOrdersLocalStorage(customerEmail) {
    const orders = JSON.parse(localStorage.getItem('fordips_orders') || '[]');
    const customerOrders = orders.filter(o => o.customer_email === customerEmail);

    return {
        success: true,
        orders: customerOrders
    };
}

// Export functions globally
window.orderTracking = {
    createOrderWithTracking,
    updateOrderStatus,
    getOrderTracking,
    getCustomerOrders,
    getAdminDashboard,
    ORDER_STATUSES
};

console.log('✅ Order Tracking System loaded');
