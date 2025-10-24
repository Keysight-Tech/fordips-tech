/**
 * FORDIPS TECH - Supabase Integration
 * Complete E-commerce Database Integration
 *
 * Configuration is now managed in config.js for better security
 */

// ============================================
// CONFIGURATION - Now loaded from config.js
// ============================================
const SUPABASE_URL = window.FORDIPS_CONFIG?.SUPABASE_CONFIG?.url || 'https://loutcbvftzojsioahtdw.supabase.co';
const SUPABASE_ANON_KEY = window.FORDIPS_CONFIG?.SUPABASE_CONFIG?.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdXRjYnZmdHpvanNpb2FodGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNDc5NjMsImV4cCI6MjA3NjgyMzk2M30.u49fBtuF99IsEAr8iYLo_3SnHAOqTR-Y7WPXnkGVKOs';

// ============================================
// INITIALIZE SUPABASE CLIENT
// ============================================
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make supabase client globally available for other scripts (reviews, checkout, etc.)
window.supabaseClient = supabase;

// Log initialization
window.FORDIPS_CONFIG?.logger.info('✅ Supabase client initialized', {
    url: SUPABASE_URL,
    timestamp: new Date().toISOString()
});

// Global state
let currentUser = null;
let currentCart = [];

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

// Check if user is logged in
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;

    if (user) {
        // Load user cart from database
        await loadUserCart();
        updateUIForLoggedInUser();
    }

    return user;
}

// Sign up new user
async function signUp(email, password, fullName) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) throw error;

        return { success: true, user: data.user };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Signup error:', error);
        return { success: false, error: error.message };
    }
}

// Sign in existing user
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        currentUser = data.user;
        await loadUserCart();
        updateUIForLoggedInUser();

        return { success: true, user: data.user };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// Sign out
async function signOut() {
    await supabase.auth.signOut();
    currentUser = null;
    currentCart = [];
    updateUIForLoggedOutUser();
}

// Update UI based on auth state
function updateUIForLoggedInUser() {
    // Update account link to show user email or name
    const accountLinks = document.querySelectorAll('[href="#account"]');
    accountLinks.forEach(link => {
        if (currentUser) {
            link.textContent = currentUser.email.split('@')[0];
            link.onclick = (e) => {
                e.preventDefault();
                showUserDashboard();
            };
        }
    });
}

function updateUIForLoggedOutUser() {
    const accountLinks = document.querySelectorAll('[href="#account"]');
    accountLinks.forEach(link => {
        link.textContent = 'My Account';
        link.onclick = null;
    });
}

// ============================================
// PRODUCTS FUNCTIONS
// ============================================

// Load all products from database
async function loadProducts(category = null) {
    try {
        let query = supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (category && category !== 'all') {
            query = query.eq('category_slug', category);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data || [];
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error loading products:', error);
        return [];
    }
}

// Render products to the page
async function renderProductsFromDB(category = null) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Loading products...</p>';

    const products = await loadProducts(category);

    if (products.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No products found.</p>';
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category_slug}">
            <div class="product-image">
                <img src="${product.image_url}" alt="${product.name}" loading="lazy">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                ${product.stock_quantity === 0 ? '<div class="product-badge out-of-stock">OUT OF STOCK</div>' : ''}
            </div>
            <div class="product-content">
                <div class="product-category">${product.category_slug}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.description || ''}</p>
                <div class="product-price">$${parseFloat(product.price).toLocaleString()}</div>
                <button class="btn btn-add-cart"
                        data-product-id="${product.id}"
                        data-id="${product.id}"
                        data-name="${product.name}"
                        data-price="${product.price}"
                        data-image="${product.image_url}"
                        ${product.stock_quantity === 0 ? 'disabled' : ''}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <span>${product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
            </div>
        </div>
    `).join('');

    // Re-attach event listeners
    attachCartListeners();
}

// ============================================
// SHOPPING CART FUNCTIONS
// ============================================

// Load user's cart from database (for logged-in users)
async function loadUserCart() {
    if (!currentUser) return;

    try {
        const { data, error } = await supabase
            .from('cart_items')
            .select(`
                *,
                products (
                    id,
                    name,
                    price,
                    image_url,
                    stock_quantity
                )
            `)
            .eq('user_id', currentUser.id);

        if (error) throw error;

        currentCart = data.map(item => ({
            id: item.products.id,
            name: item.products.name,
            price: parseFloat(item.products.price),
            image: item.products.image_url,
            quantity: item.quantity
        }));

        updateCartDisplay();
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error loading cart:', error);
    }
}

// Add item to cart
async function addToCart(productId, productName, productPrice, productImage) {
    // Check if user is logged in
    if (!currentUser) {
        // For guest users, use localStorage
        addToLocalCart(productId, productName, productPrice, productImage);
        return;
    }

    try {
        // Check if item already in cart
        const { data: existing } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('product_id', productId)
            .single();

        if (existing) {
            // Update quantity
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: existing.quantity + 1 })
                .eq('id', existing.id);

            if (error) throw error;
        } else {
            // Insert new item
            const { error } = await supabase
                .from('cart_items')
                .insert({
                    user_id: currentUser.id,
                    product_id: productId,
                    quantity: 1
                });

            if (error) throw error;
        }

        await loadUserCart();
        showNotification('Added to cart!', 'success');
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error adding to cart:', error);
        showNotification('Error adding to cart', 'error');
    }
}

// Guest cart functions (localStorage)
function addToLocalCart(productId, productName, productPrice, productImage) {
    const cart = JSON.parse(localStorage.getItem('fordipstech_cart') || '[]');
    const existing = cart.find(item => item.id == productId);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }

    localStorage.setItem('fordipstech_cart', JSON.stringify(cart));
    currentCart = cart;
    updateCartDisplay();
    showNotification('Added to cart!', 'success');
}

// Update cart display
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const totalAmount = document.getElementById('totalAmount');

    const count = currentCart.reduce((sum, item) => sum + item.quantity, 0);
    const total = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartCount) cartCount.textContent = count;
    if (totalAmount) totalAmount.textContent = `$${total.toFixed(2)}`;

    if (cartItems) {
        if (currentCart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        } else {
            cartItems.innerHTML = currentCart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>$${item.price}</p>
                        <div class="cart-item-quantity">
                            <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})">&times;</button>
                </div>
            `).join('');
        }
    }
}

// ============================================
// ORDER FUNCTIONS
// ============================================

// Place order
async function placeOrder(orderData) {
    try {
        if (!currentUser) {
            // Guest checkout
            return await placeGuestOrder(orderData);
        }

        // Generate order number
        const orderNumber = `FT${Date.now().toString().slice(-8)}`;

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: currentUser.id,
                order_number: orderNumber,
                status: 'pending',
                total_amount: orderData.total,
                customer_name: orderData.firstName + ' ' + orderData.lastName,
                customer_email: orderData.email,
                shipping_address: orderData.address,
                shipping_city: orderData.city,
                shipping_zip: orderData.zip,
                payment_method: orderData.paymentMethod
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = currentCart.map(item => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            product_price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // Clear cart
        await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', currentUser.id);

        currentCart = [];
        updateCartDisplay();

        return { success: true, orderNumber: order.order_number };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error placing order:', error);
        return { success: false, error: error.message };
    }
}

// Get user's orders
async function getUserOrders() {
    if (!currentUser) return [];

    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *
                )
            `)
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error loading orders:', error);
        return [];
    }
}

// ============================================
// CONTACT & NEWSLETTER FUNCTIONS
// ============================================

// Submit contact form
async function submitContactForm(formData) {
    try {
        const { error } = await supabase
            .from('contact_submissions')
            .insert({
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error submitting contact form:', error);
        return { success: false, error: error.message };
    }
}

// Subscribe to newsletter
async function subscribeNewsletter(email) {
    try {
        const { error } = await supabase
            .from('newsletter_subscriptions')
            .insert({ email: email });

        if (error) {
            if (error.code === '23505') { // Unique violation
                return { success: false, error: 'Email already subscribed' };
            }
            throw error;
        }

        return { success: true };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error subscribing to newsletter:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

// Check if user is admin
async function isAdmin() {
    if (!currentUser) return false;

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', currentUser.id)
            .single();

        if (error) throw error;
        return data?.is_admin || false;
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error checking admin status:', error);
        return false;
    }
}

// Get all orders (admin only)
async function getAllOrders() {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (*),
                profiles (full_name, email)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error loading all orders:', error);
        return [];
    }
}

// Update order status (admin only)
async function updateOrderStatus(orderId, newStatus) {
    try {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error updating order status:', error);
        return { success: false, error: error.message };
    }
}

// Add new product (admin only)
async function addProduct(productData) {
    try {
        const { data, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

        if (error) throw error;
        return { success: true, product: data };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error adding product:', error);
        return { success: false, error: error.message };
    }
}

// Update product (admin only)
async function updateProduct(productId, productData) {
    try {
        const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', productId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error updating product:', error);
        return { success: false, error: error.message };
    }
}

// Delete product (admin only)
async function deleteProduct(productId) {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error deleting product:', error);
        return { success: false, error: error.message };
    }
}

// Get order items (admin only)
async function getOrderItems(orderId) {
    try {
        const { data, error } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

        if (error) throw error;
        return data || [];
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error loading order items:', error);
        return [];
    }
}

// Get all contact submissions (admin only)
async function getAllContactSubmissions() {
    try {
        const { data, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error loading contact submissions:', error);
        return [];
    }
}

// Update contact submission status (admin only)
async function updateContactStatus(contactId, newStatus) {
    try {
        const { error } = await supabase
            .from('contact_submissions')
            .update({ status: newStatus })
            .eq('id', contactId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error updating contact status:', error);
        return { success: false, error: error.message };
    }
}

// Get all newsletter subscribers (admin only)
async function getAllNewsletterSubscribers() {
    try {
        const { data, error } = await supabase
            .from('newsletter_subscriptions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error loading newsletter subscribers:', error);
        return [];
    }
}

// Get current user
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

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

// Attach cart button listeners
function attachCartListeners() {
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId || this.dataset.id;
            const productName = this.dataset.name;
            const productPrice = parseFloat(this.dataset.price);
            const productImage = this.dataset.image;

            addToCart(productId, productName, productPrice, productImage);
        });
    });
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    window.FORDIPS_CONFIG?.logger.log('🔵 Initializing Supabase integration...');

    // Check authentication
    await checkAuth();

    // Try to load products from database first
    const dbProducts = await loadProducts();

    if (dbProducts && dbProducts.length > 0) {
        // Use database products if available
        window.FORDIPS_CONFIG?.logger.log('✅ Loading products from database');
        await renderProductsFromDB();

        // Set up product filters to use database
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                await renderProductsFromDB(filter === 'all' ? null : filter);
            });
        });
    } else {
        // Fallback to static products if database is empty
        window.FORDIPS_CONFIG?.logger.log('⚠️ No products in database, using static products');
        if (typeof initializeProductsWithFilters === 'function') {
            initializeProductsWithFilters();
        } else if (typeof initializeProducts === 'function') {
            initializeProducts();
        } else {
            window.FORDIPS_CONFIG?.logger.error('❌ Static products not available');
        }
    }

    window.FORDIPS_CONFIG?.logger.log('✅ Supabase integration ready!');
});

// ============================================
// PRODUCT SEARCH FUNCTIONS
// ============================================
async function searchProducts(query) {
    try {
        const { data, error } = await supabase
            .rpc('search_products', { search_query: query });

        if (error) throw error;
        return data || [];
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Search error:', error);
        return [];
    }
}

// ============================================
// NOTIFICATIONS FUNCTIONS
// ============================================
async function getUserNotifications(userId, limit = 50) {
    try {
        const { data, error } = await supabase
            .rpc('get_user_notifications', {
                p_user_id: userId,
                p_limit: limit
            });

        if (error) throw error;
        return data || [];
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error loading notifications:', error);
        return [];
    }
}

async function createNotification(notificationData) {
    try {
        const { data, error } = await supabase
            .rpc('create_notification', {
                p_user_id: notificationData.user_id,
                p_type: notificationData.type,
                p_title: notificationData.title,
                p_message: notificationData.message,
                p_metadata: notificationData.metadata || {}
            });

        if (error) throw error;
        return { success: true, id: data };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error creating notification:', error);
        return { success: false, error: error.message };
    }
}

async function markNotificationAsRead(notificationId) {
    try {
        const { data, error } = await supabase
            .rpc('mark_notification_read', {
                notification_id: notificationId
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error marking notification as read:', error);
        return { success: false, error: error.message };
    }
}

async function markAllNotificationsAsRead(userId) {
    try {
        const { data, error } = await supabase
            .rpc('mark_all_notifications_read', {
                p_user_id: userId
            });

        if (error) throw error;
        return { success: true, count: data };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error marking all notifications as read:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// HELP ME PAY FUNCTIONS
// ============================================
async function createHelpMePayRequest(requestData) {
    try {
        const { data, error } = await supabase
            .rpc('create_help_me_pay_request', {
                p_requester_user_id: requestData.requester_user_id,
                p_requester_name: requestData.customer_name,
                p_requester_email: requestData.customer_email,
                p_requester_phone: requestData.customer_phone || null,
                p_helper_name: requestData.helper_info.name,
                p_helper_email: requestData.helper_info.email || null,
                p_helper_phone: requestData.helper_info.phone || null,
                p_helper_message: requestData.helper_info.message || null,
                p_order_data: requestData,
                p_currency: requestData.currency || 'USD',
                p_total_amount: requestData.total_amount
            });

        if (error) throw error;
        return { success: true, requestId: data };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error creating help me pay request:', error);
        return { success: false, error: error.message };
    }
}

async function getHelpMePayRequest(requestId) {
    try {
        const { data, error } = await supabase
            .rpc('get_help_me_pay_request', {
                request_id: requestId
            });

        if (error) throw error;
        return data && data.length > 0 ? data[0] : null;
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error loading help me pay request:', error);
        return null;
    }
}

async function updateHelpMePayStatus(requestId, status, orderId = null) {
    try {
        const { data, error } = await supabase
            .rpc('update_help_me_pay_status', {
                request_id: requestId,
                new_status: status,
                order_id: orderId
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error updating help me pay status:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// EMAIL & SMS FUNCTIONS
// ============================================
async function sendEmail(emailData) {
    try {
        // This would integrate with your email service (SendGrid, AWS SES, etc.)
        // For now, we'll log it
        window.FORDIPS_CONFIG?.logger.log('Email would be sent:', emailData);

        // In production, you would call your edge function or email service
        // const { data, error } = await supabase.functions.invoke('send-email', {
        //     body: emailData
        // });

        return { success: true };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}

async function sendSMS(smsData) {
    try {
        // This would integrate with your SMS service (Twilio, AWS SNS, etc.)
        window.FORDIPS_CONFIG?.logger.log('SMS would be sent:', smsData);

        // In production, you would call your SMS service
        // const { data, error } = await supabase.functions.invoke('send-sms', {
        //     body: smsData
        // });

        return { success: true };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Error sending SMS:', error);
        return { success: false, error: error.message };
    }
}

// Export functions for use in other scripts
window.fordipsTech = {
    checkAuth,
    signUp,
    signIn,
    signOut,
    loadProducts,
    addToCart,
    placeOrder,
    getUserOrders,
    submitContactForm,
    subscribeNewsletter,
    isAdmin,
    getAllOrders,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    getOrderItems,
    getAllContactSubmissions,
    updateContactStatus,
    getAllNewsletterSubscribers,
    getCurrentUser,
    // New functions for search
    searchProducts,
    // New functions for notifications
    getUserNotifications,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    // New functions for Help Me Pay
    createHelpMePayRequest,
    getHelpMePayRequest,
    updateHelpMePayStatus,
    // Communication functions
    sendEmail,
    sendSMS,
    currentUser: () => currentUser,
    currentCart: () => currentCart
};

window.FORDIPS_CONFIG?.logger.log('✅ Fordips Tech Supabase Integration Loaded');
