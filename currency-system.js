/**
 * FORDIPS TECH - Currency System
 * Multi-currency support with real-time conversion
 */

// Currency data with exchange rates (base: USD)
const currencies = {
    // Major Global Currencies
    'USD': { symbol: '$', name: 'US Dollar', rate: 1.00, flag: '🇺🇸' },
    'EUR': { symbol: '€', name: 'Euro', rate: 0.92, flag: '🇪🇺' },
    'GBP': { symbol: '£', name: 'British Pound', rate: 0.79, flag: '🇬🇧' },
    'CAD': { symbol: 'CA$', name: 'Canadian Dollar', rate: 1.36, flag: '🇨🇦' },
    'AUD': { symbol: 'A$', name: 'Australian Dollar', rate: 1.53, flag: '🇦🇺' },
    'JPY': { symbol: '¥', name: 'Japanese Yen', rate: 149.50, flag: '🇯🇵' },
    'CHF': { symbol: 'CHF', name: 'Swiss Franc', rate: 0.88, flag: '🇨🇭' },
    'SGD': { symbol: 'S$', name: 'Singapore Dollar', rate: 1.34, flag: '🇸🇬' },
    'HKD': { symbol: 'HK$', name: 'Hong Kong Dollar', rate: 7.83, flag: '🇭🇰' },
    'CNY': { symbol: '¥', name: 'Chinese Yuan', rate: 7.24, flag: '🇨🇳' },

    // African Currencies
    'XAF': { symbol: 'FCFA', name: 'Central African CFA Franc', rate: 604.00, flag: '🇨🇲' },
    'XOF': { symbol: 'CFA', name: 'West African CFA Franc', rate: 604.00, flag: '🇸🇳' },
    'NGN': { symbol: '₦', name: 'Nigerian Naira', rate: 1575.00, flag: '🇳🇬' },
    'GHS': { symbol: 'GH₵', name: 'Ghanaian Cedi', rate: 15.80, flag: '🇬🇭' },
    'KES': { symbol: 'KSh', name: 'Kenyan Shilling', rate: 129.00, flag: '🇰🇪' },
    'ZAR': { symbol: 'R', name: 'South African Rand', rate: 18.25, flag: '🇿🇦' },
    'EGP': { symbol: 'E£', name: 'Egyptian Pound', rate: 49.00, flag: '🇪🇬' },
    'TZS': { symbol: 'TSh', name: 'Tanzanian Shilling', rate: 2515.00, flag: '🇹🇿' },
    'UGX': { symbol: 'USh', name: 'Ugandan Shilling', rate: 3680.00, flag: '🇺🇬' },
    'RWF': { symbol: 'FRw', name: 'Rwandan Franc', rate: 1370.00, flag: '🇷🇼' },

    // Other International Currencies
    'NZD': { symbol: 'NZ$', name: 'New Zealand Dollar', rate: 1.68, flag: '🇳🇿' },
    'SEK': { symbol: 'kr', name: 'Swedish Krona', rate: 10.65, flag: '🇸🇪' },
    'NOK': { symbol: 'kr', name: 'Norwegian Krone', rate: 10.90, flag: '🇳🇴' },
    'DKK': { symbol: 'kr', name: 'Danish Krone', rate: 6.88, flag: '🇩🇰' },
    'PLN': { symbol: 'zł', name: 'Polish Zloty', rate: 4.02, flag: '🇵🇱' },
    'TRY': { symbol: '₺', name: 'Turkish Lira', rate: 34.50, flag: '🇹🇷' },
    'PHP': { symbol: '₱', name: 'Philippine Peso', rate: 56.50, flag: '🇵🇭' },
    'THB': { symbol: '฿', name: 'Thai Baht', rate: 34.80, flag: '🇹🇭' },
    'MYR': { symbol: 'RM', name: 'Malaysian Ringgit', rate: 4.48, flag: '🇲🇾' }
};

// Current selected currency
let selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';

/**
 * Format price in selected currency
 */
function formatPrice(usdAmount, currencyCode = selectedCurrency) {
    const currency = currencies[currencyCode];
    if (!currency) return `$${usdAmount.toFixed(2)}`;

    const convertedAmount = usdAmount * currency.rate;

    // Format based on currency
    if (currencyCode === 'JPY' || currencyCode.includes('X') ||
        ['NGN', 'TZS', 'UGX', 'RWF'].includes(currencyCode)) {
        // No decimal places for these currencies
        return `${currency.symbol}${Math.round(convertedAmount).toLocaleString()}`;
    } else {
        return `${currency.symbol}${convertedAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
}

/**
 * Convert USD to selected currency
 */
function convertPrice(usdAmount, currencyCode = selectedCurrency) {
    const currency = currencies[currencyCode];
    if (!currency) return usdAmount;
    return usdAmount * currency.rate;
}

/**
 * Update all prices on the page
 */
function updateAllPrices() {
    // Update product prices
    document.querySelectorAll('[data-price-usd]').forEach(element => {
        const usdPrice = parseFloat(element.dataset.priceUsd);
        element.textContent = formatPrice(usdPrice);
    });

    // Update cart total
    updateCartCurrency();

    // Update checkout totals
    updateCheckoutCurrency();

    // Update product detail modal price if open
    if (window.currentProductView && window.currentProductView.product) {
        const priceElement = document.getElementById('currentProductPrice');
        if (priceElement) {
            priceElement.textContent = formatPrice(window.currentProductView.currentPrice);
        }
    }
}

/**
 * Update cart currency
 */
function updateCartCurrency() {
    const cart = JSON.parse(localStorage.getItem('fordipsTechCart')) || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const totalElement = document.getElementById('totalAmount');
    const subtotalElement = document.getElementById('subtotalAmount');

    if (totalElement) totalElement.textContent = formatPrice(total);
    if (subtotalElement) subtotalElement.textContent = formatPrice(total);
}

/**
 * Update checkout currency
 */
function updateCheckoutCurrency() {
    const cart = JSON.parse(localStorage.getItem('fordipsTechCart')) || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTotal = document.getElementById('checkoutTotal');

    if (checkoutSubtotal) checkoutSubtotal.textContent = formatPrice(total);
    if (checkoutTotal) checkoutTotal.textContent = formatPrice(total);
}

/**
 * Change currency
 */
function changeCurrency(currencyCode) {
    if (!currencies[currencyCode]) return;

    selectedCurrency = currencyCode;
    localStorage.setItem('selectedCurrency', currencyCode);

    // Update the select element if it exists
    const currencySelect = document.getElementById('checkoutCurrencySelect');
    if (currencySelect && currencySelect.value !== currencyCode) {
        currencySelect.value = currencyCode;
    }

    // Update all prices
    updateAllPrices();

    // Show notification
    if (typeof showNotification === 'function') {
        showNotification(`Currency changed to ${currencies[currencyCode].name}`, 'success');
    }
}

/**
 * Initialize currency selector - works with existing HTML select element
 */
function initializeCurrencySelector() {
    // Use the existing currency select in the checkout modal
    const currencySelect = document.getElementById('checkoutCurrencySelect');

    if (currencySelect) {
        // Set current currency
        currencySelect.value = selectedCurrency;

        // Add event listener for changes
        currencySelect.addEventListener('change', (e) => {
            changeCurrency(e.target.value);
        });

    } else {
    }

    // Initialize prices
    updateAllPrices();
}

/**
 * Build currency options HTML
 */
function buildCurrencyOptions() {
    const categories = {
        'Major Currencies': ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SGD', 'HKD', 'CNY'],
        'African Currencies': ['XAF', 'XOF', 'NGN', 'GHS', 'KES', 'ZAR', 'EGP', 'TZS', 'UGX', 'RWF'],
        'Other Currencies': ['NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'TRY', 'PHP', 'THB', 'MYR']
    };

    let html = '';

    for (const [category, codes] of Object.entries(categories)) {
        html += `<div class="currency-category">${category}</div>`;
        codes.forEach(code => {
            const curr = currencies[code];
            html += `
                <button class="currency-option ${code === selectedCurrency ? 'selected' : ''}"
                        onclick="selectCurrency('${code}')">
                    <span class="currency-flag">${curr.flag}</span>
                    <span class="currency-code">${code}</span>
                    <span class="currency-name">${curr.name}</span>
                </button>
            `;
        });
    }

    return html;
}

/**
 * Toggle currency dropdown
 */
function toggleCurrencyDropdown() {
    const dropdown = document.getElementById('currencyDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

/**
 * Select currency from dropdown
 */
function selectCurrency(code) {
    changeCurrency(code);

    // Update selected state in dropdown
    document.querySelectorAll('.currency-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.target.closest('.currency-option')?.classList.add('selected');

    // Close dropdown
    const dropdown = document.getElementById('currencyDropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}

/**
 * Get current currency info
 */
function getCurrentCurrency() {
    return {
        code: selectedCurrency,
        symbol: currencies[selectedCurrency].symbol,
        name: currencies[selectedCurrency].name,
        rate: currencies[selectedCurrency].rate
    };
}

// Initialize when checkout modal opens
document.addEventListener('DOMContentLoaded', () => {
    // Initialize on page load
    setTimeout(() => {
        if (document.getElementById('checkoutModal')) {
            initializeCurrencySelector();
        }
    }, 100);
});

// Re-initialize when checkout opens
const originalOpenCheckoutModal = window.openCheckoutModal;
if (originalOpenCheckoutModal) {
    window.openCheckoutModal = function() {
        originalOpenCheckoutModal.apply(this, arguments);
        setTimeout(initializeCurrencySelector, 100);
    };
}

// Export functions for global use
window.formatPrice = formatPrice;
window.convertPrice = convertPrice;
window.changeCurrency = changeCurrency;
window.getCurrentCurrency = getCurrentCurrency;
window.updateAllPrices = updateAllPrices;
