/**
 * FORDIPS TECH - Shopping Cart System
 */

let cart = JSON.parse(localStorage.getItem('fordipsTechCart')) || [];

function addToCart(product) {
    // Check if exact same product with same variants exists
    const existingItem = cart.find(item => {
        if (item.id !== product.id) return false;

        // If no variants, just match by ID
        if (!product.selectedVariants && !item.selectedVariants) return true;

        // Compare variants if they exist
        if (product.selectedVariants && item.selectedVariants) {
            return JSON.stringify(item.selectedVariants) === JSON.stringify(product.selectedVariants);
        }

        return false;
    });

    if (existingItem) {
        existingItem.quantity += (product.quantity || 1);
    } else {
        cart.push({
            ...product,
            quantity: product.quantity || 1
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

function removeFromCartByIndex(index) {
    cart.splice(index, 1);
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

function updateQuantityByIndex(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            removeFromCartByIndex(index);
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
        cartItems.innerHTML = `
            <div class="empty-cart-state">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <p class="empty-cart" data-i18n="cartEmpty">Your cart is empty</p>
                <a href="#products" class="btn-start-shopping">Start Shopping</a>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map((item, index) => {
            // Build variant display
            let variantHTML = '';
            if (item.selectedVariants) {
                const variants = Object.entries(item.selectedVariants)
                    .filter(([key, value]) => value !== null)
                    .map(([key, value]) => value)
                    .join(' • ');

                if (variants) {
                    variantHTML = `<div style="font-size: 12px; color: #64748b; margin-top: 4px;">${variants}</div>`;
                }
            }

            return `
                <div class="cart-item" style="display: flex; gap: 1rem; padding: 1rem; background: #f8fafc; border-radius: 12px; margin-bottom: 1rem;">
                    <div style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden; flex-shrink: 0;">
                        <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; margin-bottom: 0.25rem; font-size: 14px;">${item.name}</div>
                        ${variantHTML}
                        <div style="color: #2563eb; font-weight: 700; font-size: 16px; margin-top: 8px;">$${item.price.toLocaleString()}</div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem;">
                            <button class="qty-btn" data-index="${index}" data-action="decrease" style="width: 30px; height: 30px; border-radius: 50%; background: #2563eb; color: white; border: none; cursor: pointer; font-weight: 700;">−</button>
                            <span style="min-width: 30px; text-align: center; font-weight: 600;">${item.quantity}</span>
                            <button class="qty-btn" data-index="${index}" data-action="increase" style="width: 30px; height: 30px; border-radius: 50%; background: #2563eb; color: white; border: none; cursor: pointer; font-weight: 700;">+</button>
                            <button class="remove-btn" data-index="${index}" style="margin-left: auto; color: #ef4444; background: none; border: none; cursor: pointer; font-size: 1.5rem;">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach event listeners
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const action = e.target.dataset.action;
                updateQuantityByIndex(index, action === 'increase' ? 1 : -1);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                removeFromCartByIndex(index);
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

// Attach cart listeners to product buttons using event delegation
function attachCartListeners() {
    // Remove any existing delegated listener to prevent duplicates
    const existingListener = document._cartDelegateListener;
    if (existingListener) {
        document.body.removeEventListener('click', existingListener);
    }

    // Create new delegated event listener
    const cartClickHandler = function(e) {
        // Find the closest .btn-add-cart button
        const btn = e.target.closest('.btn-add-cart');

        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        // Prevent multiple rapid clicks
        if (btn.disabled) return;

        // Disable button temporarily
        btn.disabled = true;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span>Adding...</span>';
        btn.style.opacity = '0.6';

        try {
            const id = parseInt(btn.dataset.id);
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            const image = btn.dataset.image;

            // Validate data
            if (!id || !name || !price) {
                console.error('Invalid product data:', { id, name, price, image });
                showNotification('Invalid product data', 'error');
                return;
            }

            addToCart({ id, name, price, image });

            // Re-enable button after a delay
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
                btn.style.opacity = '1';
            }, 500);
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Failed to add to cart', 'error');

            // Re-enable button on error
            btn.disabled = false;
            btn.innerHTML = originalHTML;
            btn.style.opacity = '1';
        }
    };

    // Store reference to remove later if needed
    document._cartDelegateListener = cartClickHandler;

    // Attach single delegated listener to body
    document.body.addEventListener('click', cartClickHandler);
}

// Initialize cart system on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    // Attach cart button listeners using event delegation
    attachCartListeners();

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
    // Use unified notification system if available
    if (typeof showNotification === 'function') {
        showNotification(`${itemName} added to cart! ✓`, 'success');
    } else {
        // Fallback notification
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="width: 80px; height: 80px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
        `;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '99999',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            opacity: '0',
            transform: 'translateX(100px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        });

        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}
