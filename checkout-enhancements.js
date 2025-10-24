/**
 * FORDIPS TECH - Checkout Enhancements
 * Currency selector and Help Me Pay integration
 */

// Initialize checkout enhancements when DOM is ready
function initializeCheckoutEnhancements() {
    setupCheckoutCurrencySelector();
    setupHelpMePayButton();
    syncCheckoutWithGlobalCurrency();
}

/**
 * Setup currency selector in checkout
 */
function setupCheckoutCurrencySelector() {
    const currencySelect = document.getElementById('checkoutCurrencySelect');

    if (!currencySelect) {
        return;
    }

    // Set initial value from current currency
    if (window.currencyManager) {
        const currentCurrency = window.currencyManager.getCurrentCurrency();
        currencySelect.value = currentCurrency;
    }

    // Handle currency change
    currencySelect.addEventListener('change', (e) => {
        const selectedCurrency = e.target.value;

        // Update global currency using currency manager
        if (window.currencyManager) {
            window.currencyManager.setCurrency(selectedCurrency);
        }

        // Update checkout totals with animation
        updateCheckoutTotalsWithAnimation();
    });
}

/**
 * Sync checkout currency with global currency changes
 */
function syncCheckoutWithGlobalCurrency() {
    // Listen for currency change events
    window.addEventListener('currencyChanged', (event) => {
        const currencySelect = document.getElementById('checkoutCurrencySelect');

        if (currencySelect && event.detail && event.detail.currency) {
            const newCurrency = event.detail.currency;

            // Update select if it doesn't match
            if (currencySelect.value !== newCurrency) {
                currencySelect.value = newCurrency;
                updateCheckoutTotalsWithAnimation();
            }
        }
    });

    // Also sync when checkout modal opens
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            setTimeout(syncCheckoutCurrency, 100);
        });
    }
}

/**
 * Sync currency selector with current currency
 */
function syncCheckoutCurrency() {
    const currencySelect = document.getElementById('checkoutCurrencySelect');

    if (currencySelect && window.currencyManager) {
        const currentCurrency = window.currencyManager.getCurrentCurrency();
        currencySelect.value = currentCurrency;
    }
}

/**
 * Update checkout totals with animation
 */
function updateCheckoutTotalsWithAnimation() {
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const totalEl = document.getElementById('checkoutTotal');

    // Add animation class
    if (subtotalEl) {
        subtotalEl.classList.add('currency-changing');
        setTimeout(() => {
            subtotalEl.classList.remove('currency-changing');
        }, 300);
    }

    if (totalEl) {
        totalEl.classList.add('currency-changing');
        setTimeout(() => {
            totalEl.classList.remove('currency-changing');
        }, 300);
    }

    // The actual price update will be handled by the currency system
    // which should already be watching these elements
}

/**
 * Setup Help Me Pay button
 */
function setupHelpMePayButton() {
    const helpMePayBtn = document.getElementById('checkoutHelpMePayBtn');

    if (!helpMePayBtn) {
        return;
    }

    helpMePayBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Get cart data for Help Me Pay
        const cartData = getCartDataForHelpMePay();

        if (!cartData || cartData.items.length === 0) {
            alert('Your cart is empty. Please add items before using Help Me Pay.');
            return;
        }

        // Close checkout modal
        closeCheckoutModal();

        // Open Help Me Pay modal with cart data
        setTimeout(() => {
            openHelpMePayModal(cartData);
        }, 300);
    });
}

/**
 * Get cart data for Help Me Pay
 */
function getCartDataForHelpMePay() {
    // Get cart from localStorage or global variable
    let cart = [];

    if (window.cart && Array.isArray(window.cart)) {
        cart = window.cart;
    } else if (localStorage.getItem('cart')) {
        try {
            cart = JSON.parse(localStorage.getItem('cart'));
        } catch (e) {
        }
    }

    // Get total from checkout
    const totalEl = document.getElementById('checkoutTotal');
    const totalText = totalEl ? totalEl.textContent : '$0.00';

    // Get current currency
    const currency = window.currencyManager ?
        window.currencyManager.getCurrentCurrency() : 'USD';

    return {
        items: cart,
        total: totalText,
        currency: currency,
        itemCount: cart.length,
        subtotal: document.getElementById('checkoutSubtotal')?.textContent || '$0.00'
    };
}

/**
 * Open Help Me Pay modal with cart data
 */
function openHelpMePayModal(cartData) {
    // Check if Help Me Pay system exists
    if (typeof window.openHelpMePayModal === 'function') {
        window.openHelpMePayModal(cartData);
    } else if (typeof openHelpMePay === 'function') {
        openHelpMePay(cartData);
    } else {
        // Fallback: try to open modal directly
        const helpMePayModal = document.getElementById('helpMePayModal');
        if (helpMePayModal) {
            helpMePayModal.classList.add('active');

            // Populate with cart data
            populateHelpMePayWithCartData(cartData);
        } else {
            alert('Help Me Pay feature is currently unavailable. Please try again later.');
        }
    }
}

/**
 * Populate Help Me Pay modal with cart data
 */
function populateHelpMePayWithCartData(cartData) {
    // Update order total in Help Me Pay
    const totalAmountEl = document.getElementById('helpMePayTotalAmount');
    if (totalAmountEl) {
        totalAmountEl.textContent = cartData.total;
    }

    // Update item count
    const itemCountEl = document.getElementById('helpMePayItemCount');
    if (itemCountEl) {
        itemCountEl.textContent = `${cartData.itemCount} items`;
    }

    // Update currency if needed
    const currencyDisplays = document.querySelectorAll('.help-me-pay-currency');
    currencyDisplays.forEach(el => {
        el.textContent = cartData.currency;
    });

}

/**
 * Close checkout modal
 */
function closeCheckoutModal() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.style.display = 'none';
    }

    // Try to call global close function if it exists
    if (typeof window.closeCheckoutModal === 'function') {
        window.closeCheckoutModal();
    }
}

/**
 * Update checkout button to show currency
 */
function updateCheckoutButtonCurrency() {
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (checkoutBtn && window.currencyManager) {
        const currency = window.currencyManager.getCurrentCurrency();
        const symbol = window.currencyManager.getSymbol(currency);

        // You could add currency badge to button if desired
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for other systems to initialize
        setTimeout(initializeCheckoutEnhancements, 500);
    });
} else {
    setTimeout(initializeCheckoutEnhancements, 500);
}

// Also initialize when checkout modal is opened
document.addEventListener('click', (e) => {
    if (e.target && (e.target.id === 'checkoutBtn' || e.target.closest('#checkoutBtn'))) {
        setTimeout(syncCheckoutCurrency, 200);
    }
});

