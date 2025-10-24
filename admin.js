/**
 * FORDIPS TECH - Admin Panel JavaScript
 * Handles all admin panel functionality
 */

// State
let currentUser = null;
let allProducts = [];
let allOrders = [];
let allContacts = [];
let allSubscribers = [];
let currentEditingProduct = null;

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', async function() {
    window.FORDIPS_CONFIG?.logger.log('Admin panel loading...');

    // Check if user is authenticated and is admin
    await checkAdminAccess();

    // Load initial data
    await loadDashboard();

    // Setup product form handler
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
});

// ===================================
// AUTHENTICATION
// ===================================
async function checkAdminAccess() {
    showLoading();

    try {
        currentUser = await window.fordipsTech.getCurrentUser();

        if (!currentUser) {
            alert('Please log in to access the admin panel');
            window.location.href = 'index.html';
            return;
        }

        // Check if user is admin
        const isAdmin = await window.fordipsTech.isAdmin();

        if (!isAdmin) {
            alert('You do not have admin privileges');
            window.location.href = 'index.html';
            return;
        }

        // Update UI with user info
        const userName = currentUser.user_metadata?.full_name || currentUser.email;
        document.getElementById('adminUserName').textContent = userName;

    } catch (error) {
        alert('Error checking admin access');
        window.location.href = 'index.html';
    } finally {
        hideLoading();
    }
}

async function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        await window.fordipsTech.signOut();
        window.location.href = 'index.html';
    }
}

// ===================================
// TAB NAVIGATION
// ===================================
function showTab(tabName) {
    // Hide all content
    document.querySelectorAll('.admin-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected content
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked tab
    event.target.classList.add('active');

    // Load data for the tab
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'contacts':
            loadContacts();
            break;
        case 'newsletter':
            loadNewsletter();
            break;
    }
}

// ===================================
// DASHBOARD
// ===================================
async function loadDashboard() {
    showLoading();

    try {
        // Load all data
        allProducts = await window.fordipsTech.loadProducts();
        allOrders = await window.fordipsTech.getAllOrders();
        allContacts = await window.fordipsTech.getAllContactSubmissions();

        // Calculate stats
        const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

        // Update stats
        document.getElementById('totalProducts').textContent = allProducts.length;
        document.getElementById('totalOrders').textContent = allOrders.length;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('totalContacts').textContent = allContacts.length;

        // Show recent orders
        const recentOrders = allOrders.slice(0, 5);
        displayRecentOrders(recentOrders);

    } catch (error) {
        alert('Error loading dashboard data');
    } finally {
        hideLoading();
    }
}

function displayRecentOrders(orders) {
    const container = document.getElementById('recentOrders');

    if (orders.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No orders yet</p></div>';
        return;
    }

    const table = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td><strong>${order.order_number}</strong></td>
                        <td>${order.customer_name}</td>
                        <td>$${parseFloat(order.total_amount).toFixed(2)}</td>
                        <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                        <td>${new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

// ===================================
// PRODUCTS MANAGEMENT
// ===================================
async function loadProducts() {
    showLoading();

    try {
        allProducts = await window.fordipsTech.loadProducts();
        displayProducts(allProducts);
    } catch (error) {
        alert('Error loading products');
    } finally {
        hideLoading();
    }
}

function displayProducts(products) {
    const container = document.getElementById('productsTable');

    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>No Products Found</h3>
                <p>Click "Add New Product" to get started</p>
            </div>
        `;
        return;
    }

    const table = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Badge</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr>
                        <td><img src="${product.image_url}" alt="${product.name}" class="product-image"></td>
                        <td><strong>${product.name}</strong></td>
                        <td>${product.category_slug}</td>
                        <td>$${parseFloat(product.price).toFixed(2)}</td>
                        <td>${product.badge ? `<span class="badge badge-${product.badge.toLowerCase()}">${product.badge}</span>` : '-'}</td>
                        <td>${product.stock_quantity}</td>
                        <td>${product.is_active ? '<span style="color: #10b981;">●</span> Active' : '<span style="color: #ef4444;">●</span> Inactive'}</td>
                        <td>
                            <div class="table-actions">
                                <button onclick="editProduct('${product.id}')" class="btn-edit">Edit</button>
                                <button onclick="deleteProduct('${product.id}', '${product.name}')" class="btn-delete">Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

function filterProducts() {
    const category = document.getElementById('categoryFilter').value;

    if (category === 'all') {
        displayProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category_slug === category);
        displayProducts(filtered);
    }
}

function searchProducts() {
    const query = document.getElementById('productSearch').value.toLowerCase();

    if (!query) {
        displayProducts(allProducts);
        return;
    }

    const filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );

    displayProducts(filtered);
}

function openAddProductModal() {
    currentEditingProduct = null;
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModal').classList.add('active');
}

async function editProduct(productId) {
    const product = allProducts.find(p => p.id === productId);

    if (!product) return;

    currentEditingProduct = product;

    // Populate form
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category_slug;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productImage').value = product.image_url;
    document.getElementById('productBadge').value = product.badge || '';
    document.getElementById('productStock').value = product.stock_quantity;
    document.getElementById('productActive').checked = product.is_active;

    document.getElementById('productModal').classList.add('active');
}

async function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
        return;
    }

    showLoading();

    try {
        const result = await window.fordipsTech.deleteProduct(productId);

        if (result.success) {
            alert('Product deleted successfully!');
            await loadProducts();
        } else {
            alert('Error deleting product: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Error deleting product');
    } finally {
        hideLoading();
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('productName').value,
        category_slug: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        image_url: document.getElementById('productImage').value,
        badge: document.getElementById('productBadge').value || null,
        stock_quantity: parseInt(document.getElementById('productStock').value),
        is_active: document.getElementById('productActive').checked
    };

    showLoading();

    try {
        let result;
        const productId = document.getElementById('productId').value;

        if (productId) {
            // Update existing product
            result = await window.fordipsTech.updateProduct(productId, formData);
        } else {
            // Add new product
            result = await window.fordipsTech.addProduct(formData);
        }

        if (result.success) {
            alert(productId ? 'Product updated successfully!' : 'Product added successfully!');
            closeProductModal();
            await loadProducts();
        } else {
            alert('Error saving product: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Error saving product');
    } finally {
        hideLoading();
    }
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('productForm').reset();
    currentEditingProduct = null;
}

// ===================================
// ORDERS MANAGEMENT
// ===================================
async function loadOrders() {
    showLoading();

    try {
        allOrders = await window.fordipsTech.getAllOrders();
        displayOrders(allOrders);
    } catch (error) {
        alert('Error loading orders');
    } finally {
        hideLoading();
    }
}

function displayOrders(orders) {
    const container = document.getElementById('ordersTable');

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <h3>No Orders Found</h3>
                <p>Orders will appear here once customers make purchases</p>
            </div>
        `;
        return;
    }

    const table = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td><strong>${order.order_number}</strong></td>
                        <td>${order.customer_name}</td>
                        <td>${order.customer_email}</td>
                        <td>$${parseFloat(order.total_amount).toFixed(2)}</td>
                        <td>
                            <select onchange="updateOrderStatus('${order.id}', this.value)" class="status-badge status-${order.status}">
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </td>
                        <td>${new Date(order.created_at).toLocaleDateString()}</td>
                        <td>
                            <button onclick="viewOrderDetails('${order.id}')" class="btn-edit">View Details</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

function filterOrders() {
    const status = document.getElementById('statusFilter').value;

    if (status === 'all') {
        displayOrders(allOrders);
    } else {
        const filtered = allOrders.filter(o => o.status === status);
        displayOrders(filtered);
    }
}

function searchOrders() {
    const query = document.getElementById('orderSearch').value.toLowerCase();

    if (!query) {
        displayOrders(allOrders);
        return;
    }

    const filtered = allOrders.filter(o =>
        o.order_number.toLowerCase().includes(query) ||
        o.customer_name.toLowerCase().includes(query) ||
        o.customer_email.toLowerCase().includes(query)
    );

    displayOrders(filtered);
}

async function updateOrderStatus(orderId, newStatus) {
    showLoading();

    try {
        const result = await window.fordipsTech.updateOrderStatus(orderId, newStatus);

        if (result.success) {
            // Update local state
            const order = allOrders.find(o => o.id === orderId);
            if (order) {
                order.status = newStatus;
            }
            alert('Order status updated successfully!');
        } else {
            alert('Error updating order status');
            await loadOrders(); // Reload to reset
        }
    } catch (error) {
        alert('Error updating order status');
        await loadOrders();
    } finally {
        hideLoading();
    }
}

async function viewOrderDetails(orderId) {
    showLoading();

    try {
        const orderItems = await window.fordipsTech.getOrderItems(orderId);
        const order = allOrders.find(o => o.id === orderId);

        if (!order) return;

        const detailsHTML = `
            <div style="padding: 2rem;">
                <h3>Order ${order.order_number}</h3>
                <div style="margin: 1.5rem 0;">
                    <p><strong>Customer:</strong> ${order.customer_name}</p>
                    <p><strong>Email:</strong> ${order.customer_email}</p>
                    <p><strong>Shipping Address:</strong> ${order.shipping_address}, ${order.shipping_city}, ${order.shipping_zip}</p>
                    <p><strong>Payment Method:</strong> ${order.payment_method}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
                    <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                </div>

                <h4>Order Items:</h4>
                <table class="data-table" style="margin-top: 1rem;">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderItems.map(item => `
                            <tr>
                                <td>${item.product_name}</td>
                                <td>$${parseFloat(item.product_price).toFixed(2)}</td>
                                <td>${item.quantity}</td>
                                <td>$${parseFloat(item.subtotal).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="font-weight: bold;">
                            <td colspan="3" style="text-align: right;">Total:</td>
                            <td>$${parseFloat(order.total_amount).toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        document.getElementById('orderDetails').innerHTML = detailsHTML;
        document.getElementById('orderModal').classList.add('active');

    } catch (error) {
        alert('Error loading order details');
    } finally {
        hideLoading();
    }
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

// ===================================
// CONTACT SUBMISSIONS
// ===================================
async function loadContacts() {
    showLoading();

    try {
        allContacts = await window.fordipsTech.getAllContactSubmissions();
        displayContacts(allContacts);
    } catch (error) {
        alert('Error loading contact submissions');
    } finally {
        hideLoading();
    }
}

function displayContacts(contacts) {
    const container = document.getElementById('contactsTable');

    if (contacts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📧</div>
                <h3>No Contact Submissions</h3>
                <p>Contact form submissions will appear here</p>
            </div>
        `;
        return;
    }

    const table = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${contacts.map(contact => `
                    <tr>
                        <td><strong>${contact.name}</strong></td>
                        <td>${contact.email}</td>
                        <td>${contact.subject}</td>
                        <td>${contact.message.substring(0, 50)}${contact.message.length > 50 ? '...' : ''}</td>
                        <td>
                            <select onchange="updateContactStatus('${contact.id}', this.value)" class="status-badge status-${contact.status}">
                                <option value="new" ${contact.status === 'new' ? 'selected' : ''}>New</option>
                                <option value="in_progress" ${contact.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                                <option value="resolved" ${contact.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                            </select>
                        </td>
                        <td>${new Date(contact.created_at).toLocaleDateString()}</td>
                        <td>
                            <a href="mailto:${contact.email}" class="btn-edit">Reply</a>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

function filterContacts() {
    const status = document.getElementById('contactStatusFilter').value;

    if (status === 'all') {
        displayContacts(allContacts);
    } else {
        const filtered = allContacts.filter(c => c.status === status);
        displayContacts(filtered);
    }
}

async function updateContactStatus(contactId, newStatus) {
    showLoading();

    try {
        const result = await window.fordipsTech.updateContactStatus(contactId, newStatus);

        if (result.success) {
            const contact = allContacts.find(c => c.id === contactId);
            if (contact) {
                contact.status = newStatus;
            }
            alert('Contact status updated!');
        } else {
            alert('Error updating contact status');
            await loadContacts();
        }
    } catch (error) {
        alert('Error updating contact status');
        await loadContacts();
    } finally {
        hideLoading();
    }
}

// ===================================
// NEWSLETTER SUBSCRIBERS
// ===================================
async function loadNewsletter() {
    showLoading();

    try {
        allSubscribers = await window.fordipsTech.getAllNewsletterSubscribers();
        displayNewsletter(allSubscribers);
    } catch (error) {
        alert('Error loading newsletter subscribers');
    } finally {
        hideLoading();
    }
}

function displayNewsletter(subscribers) {
    const container = document.getElementById('newsletterTable');

    if (subscribers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📰</div>
                <h3>No Subscribers</h3>
                <p>Newsletter subscribers will appear here</p>
            </div>
        `;
        return;
    }

    const table = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Subscribed Date</th>
                </tr>
            </thead>
            <tbody>
                ${subscribers.map(sub => `
                    <tr>
                        <td><strong>${sub.email}</strong></td>
                        <td>${sub.is_active ? '<span style="color: #10b981;">●</span> Active' : '<span style="color: #ef4444;">●</span> Inactive'}</td>
                        <td>${new Date(sub.created_at).toLocaleDateString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

function exportSubscribers() {
    if (allSubscribers.length === 0) {
        alert('No subscribers to export');
        return;
    }

    // Create CSV content
    const csv = [
        ['Email', 'Status', 'Subscribed Date'],
        ...allSubscribers.map(sub => [
            sub.email,
            sub.is_active ? 'Active' : 'Inactive',
            new Date(sub.created_at).toLocaleString()
        ])
    ].map(row => row.join(',')).join('\n');

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// Close modals on background click
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

