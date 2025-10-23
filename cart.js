/**
 * FORDIPS TECH - Shopping Cart System
 */

let cart = JSON.parse(localStorage.getItem('fordipsTechCart')) || [];

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showCartNotification(product.name);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== parseInt(id));
    saveCart();
    updateCartUI();
}

function updateQuantity(id, change) {
    const item = cart.find(i => i.id === parseInt(id));
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function saveCart() {
    localStorage.setItem('fordipsTechCart', JSON.stringify(cart));
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const totalAmount = document.getElementById('totalAmount');

    // Update count
    const count = getCartCount();
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? 'block' : 'none';

    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart" data-i18n="cartEmpty">Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item" style="display: flex; gap: 1rem; padding: 1rem; background: #f8fafc; border-radius: 12px; margin-bottom: 1rem;">
                <div style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden;">
                    <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">${item.name}</div>
                    <div style="color: #2563eb; font-weight: 700;">$${item.price.toLocaleString()}</div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                        <button class="qty-btn" data-id="${item.id}" data-action="decrease" style="width: 30px; height: 30px; border-radius: 50%; background: #2563eb; color: white; border: none; cursor: pointer; font-weight: 700;">−</button>
                        <span style="min-width: 30px; text-align: center; font-weight: 600;">${item.quantity}</span>
                        <button class="qty-btn" data-id="${item.id}" data-action="increase" style="width: 30px; height: 30px; border-radius: 50%; background: #2563eb; color: white; border: none; cursor: pointer; font-weight: 700;">+</button>
                        <button class="remove-btn" data-id="${item.id}" style="margin-left: auto; color: #ef4444; background: none; border: none; cursor: pointer; font-size: 1.5rem;">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Attach event listeners
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const action = e.target.dataset.action;
                updateQuantity(id, action === 'increase' ? 1 : -1);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                removeFromCart(e.target.dataset.id);
            });
        });
    }

    // Update total
    totalAmount.textContent = `$${getCartTotal().toLocaleString()}`;
}

// Cart modal controls
const cartModal = document.getElementById('cartModal');
const cartButton = document.getElementById('cartButton');
const cartClose = document.getElementById('cartClose');
const cartOverlay = document.getElementById('cartOverlay');

function openCart() {
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartModal.classList.remove('active');
    document.body.style.overflow = '';
}

if (cartButton) cartButton.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// Attach cart listeners to product buttons
function attachCartListeners() {
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = parseInt(btn.dataset.id);
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            const image = btn.dataset.image;

            addToCart({ id, name, price, image });
        });
    });
}

// Checkout
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'error');
                return;
            }

            const total = getCartTotal();
            showNotification(
                `Checkout coming soon! Total: $${total.toLocaleString()}`,
                'success'
            );
        });
    }
});

function showCartNotification(itemName) {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 30px; height: 30px; background: rgba(255,255,255,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">✓</div>
            <div><strong>${itemName}</strong><br>Added to cart</div>
        </div>
    `;

    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        fontWeight: '600',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
        zIndex: '10001',
        animation: 'slideInUp 0.3s ease',
        maxWidth: '300px'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
