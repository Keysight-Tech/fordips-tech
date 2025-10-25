/**
 * FORDIPS TECH - HELP ME PAY & MULTI-CURRENCY SYSTEM
 * Allow customers to request payment help from others with multi-currency support
 */

class HelpMePaySystem {
    constructor() {
        this.currencies = [
            { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
            { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
            { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
            { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.35 },
            { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.52 },
            { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 0.88 },
            { code: 'XAF', name: 'Central African Franc', symbol: 'FCFA', rate: 605 },
            { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1550 },
            { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', rate: 12.5 },
            { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 145 },
            { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 18.5 },
            { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', rate: 49 },
            { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', rate: 10 },
            { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', rate: 2500 },
            { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', rate: 3700 }
        ];
        this.selectedCurrency = 'USD';
        this.helpMePayMode = false;
        this.init();
    }

    init() {
        window.FORDIPS_CONFIG?.logger.log('💰 Help Me Pay & Currency System initializing...');
        this.addCurrencySelector();
        this.addHelpMePayOption();
    }

    addCurrencySelector() {
        // Add currency selector to header
        const header = document.querySelector('header nav .nav-links');
        if (!header) return;

        const currencySelectorHTML = `
            <div class="currency-selector" id="currencySelector">
                <button class="currency-btn" id="currencyBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span id="selectedCurrency">USD</span>
                </button>
                <div class="currency-dropdown" id="currencyDropdown">
                    <div class="currency-search">
                        <input type="text" placeholder="Search currency..." id="currencySearch">
                    </div>
                    <div class="currency-list" id="currencyList">
                        ${this.currencies.map(currency => `
                            <div class="currency-item" onclick="window.helpMePay.selectCurrency('${currency.code}')">
                                <span class="currency-code">${currency.code}</span>
                                <span class="currency-name">${currency.name}</span>
                                <span class="currency-symbol">${currency.symbol}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        header.insertAdjacentHTML('beforeend', currencySelectorHTML);

        // Setup event listeners
        document.getElementById('currencyBtn')?.addEventListener('click', () => {
            document.getElementById('currencyDropdown')?.classList.toggle('active');
        });

        // Currency search
        document.getElementById('currencySearch')?.addEventListener('input', (e) => {
            this.filterCurrencies(e.target.value);
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            const selector = document.getElementById('currencySelector');
            if (selector && !selector.contains(e.target)) {
                document.getElementById('currencyDropdown')?.classList.remove('active');
            }
        });
    }

    addHelpMePayOption() {
        // This will be added to checkout page
        // We'll modify the checkout form to include Help Me Pay option
        window.FORDIPS_CONFIG?.logger.log('Help Me Pay option ready');
    }

    selectCurrency(currencyCode) {
        this.selectedCurrency = currencyCode;
        const currency = this.currencies.find(c => c.code === currencyCode);

        // Update UI
        const selectedCurrencyEl = document.getElementById('selectedCurrency');
        if (selectedCurrencyEl) {
            selectedCurrencyEl.textContent = currencyCode;
        }
        document.getElementById('currencyDropdown')?.classList.remove('active');

        // Update all prices on page
        this.updateAllPrices();

        // Save to localStorage
        localStorage.setItem('selectedCurrency', currencyCode);

        window.FORDIPS_CONFIG?.logger.log('Currency changed to:', currencyCode);
    }

    filterCurrencies(query) {
        const lowerQuery = query.toLowerCase();
        const filtered = this.currencies.filter(c =>
            c.code.toLowerCase().includes(lowerQuery) ||
            c.name.toLowerCase().includes(lowerQuery)
        );

        const listHTML = filtered.map(currency => `
            <div class="currency-item" onclick="window.helpMePay.selectCurrency('${currency.code}')">
                <span class="currency-code">${currency.code}</span>
                <span class="currency-name">${currency.name}</span>
                <span class="currency-symbol">${currency.symbol}</span>
            </div>
        `).join('');

        document.getElementById('currencyList').innerHTML = listHTML;
    }

    convertPrice(usdPrice) {
        const currency = this.currencies.find(c => c.code === this.selectedCurrency);
        if (!currency) return usdPrice;

        const convertedPrice = usdPrice * currency.rate;
        return this.formatPrice(convertedPrice, currency);
    }

    formatPrice(price, currency) {
        const formatted = price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        return `${currency.symbol}${formatted}`;
    }

    updateAllPrices() {
        // Update product prices
        document.querySelectorAll('.product-price, .price').forEach(priceElement => {
            const usdPrice = parseFloat(priceElement.dataset.usdPrice || priceElement.textContent.replace(/[^0-9.]/g, ''));
            if (!isNaN(usdPrice)) {
                priceElement.dataset.usdPrice = usdPrice;
                priceElement.textContent = this.convertPrice(usdPrice);
            }
        });

        // Update cart total
        this.updateCartTotal();
    }

    updateCartTotal() {
        const cartTotal = document.getElementById('cartTotal');
        if (cartTotal) {
            const usdTotal = parseFloat(cartTotal.dataset.usdTotal || cartTotal.textContent.replace(/[^0-9.]/g, ''));
            if (!isNaN(usdTotal)) {
                cartTotal.dataset.usdTotal = usdTotal;
                cartTotal.textContent = this.convertPrice(usdTotal);
            }
        }
    }

    // HELP ME PAY FUNCTIONALITY
    createHelpMePayUI() {
        const checkoutForm = document.getElementById('checkoutForm');
        if (!checkoutForm) return;

        const helpMePayHTML = `
            <div class="help-me-pay-section" id="helpMePaySection">
                <div class="help-me-pay-toggle">
                    <label class="toggle-container">
                        <input type="checkbox" id="helpMePayToggle">
                        <span class="toggle-slider"></span>
                        <span class="toggle-label">
                            <strong>Help Me Pay</strong>
                            <small>Request someone else to pay for this order</small>
                        </span>
                    </label>
                </div>

                <div class="help-me-pay-form" id="helpMePayForm" style="display: none;">
                    <h4>👥 Who should help pay?</h4>
                    <p class="help-text">Enter the contact details of the person you want to request payment from.</p>

                    <div class="form-group">
                        <label for="helperName">Helper's Name *</label>
                        <input type="text" id="helperName" placeholder="e.g., John Doe" required>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="helperEmail">Email Address</label>
                            <input type="email" id="helperEmail" placeholder="helper@example.com">
                        </div>

                        <div class="form-group">
                            <label for="helperPhone">Phone Number</label>
                            <input type="tel" id="helperPhone" placeholder="+1 234 567 8900">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="helpMessage">Personal Message (Optional)</label>
                        <textarea id="helpMessage" rows="3" placeholder="Add a personal message to your payment request..."></textarea>
                    </div>

                    <div class="help-me-pay-preview">
                        <h5>📧 What they'll receive:</h5>
                        <div class="preview-box">
                            <p><strong>Payment Request from <span id="previewYourName">You</span></strong></p>
                            <p>Products: <span id="previewProducts">-</span></p>
                            <p>Total Amount: <span id="previewAmount">$0.00</span></p>
                            <p>Currency: <span id="previewCurrency">USD</span></p>
                            <p><em id="previewMessage">Your message will appear here...</em></p>
                            <p class="preview-action">They'll receive a secure payment link to complete the purchase.</p>
                        </div>
                    </div>

                    <div class="help-me-pay-info">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <p>
                            <strong>How it works:</strong>
                            <br>1. We'll send them an email/SMS with order details
                            <br>2. They'll get a secure payment link
                            <br>3. They can choose their payment method & currency
                            <br>4. Once paid, you'll both receive confirmation
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Insert before payment section
        const paymentSection = checkoutForm.querySelector('.payment-section');
        if (paymentSection) {
            paymentSection.insertAdjacentHTML('beforebegin', helpMePayHTML);
            this.setupHelpMePayListeners();
        }
    }

    setupHelpMePayListeners() {
        const toggle = document.getElementById('helpMePayToggle');
        const form = document.getElementById('helpMePayForm');

        if (toggle) {
            toggle.addEventListener('change', (e) => {
                this.helpMePayMode = e.target.checked;

                if (form) {
                    form.style.display = e.target.checked ? 'block' : 'none';
                }

                // Hide/show payment section
                const paymentSection = document.querySelector('.payment-section');
                if (paymentSection) {
                    paymentSection.style.display = e.target.checked ? 'none' : 'block';
                }
            });
        }

        // Update preview in real-time
        ['helperName', 'helperEmail', 'helperPhone', 'helpMessage'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => {
                this.updateHelpMePayPreview();
            });
        });

        // Update preview on customer name change
        document.getElementById('customerName')?.addEventListener('input', () => {
            this.updateHelpMePayPreview();
        });
    }

    updateHelpMePayPreview() {
        const customerName = document.getElementById('customerName')?.value || 'You';
        const helpMessage = document.getElementById('helpMessage')?.value || 'Your message will appear here...';

        document.getElementById('previewYourName').textContent = customerName;
        document.getElementById('previewMessage').textContent = helpMessage;

        // Update cart preview
        const cartItems = window.cart || [];
        const productNames = cartItems.map(item => item.name).join(', ') || '-';
        document.getElementById('previewProducts').textContent = productNames;

        // Update amount
        const total = this.calculateCartTotal();
        const currency = this.currencies.find(c => c.code === this.selectedCurrency);
        document.getElementById('previewAmount').textContent = this.formatPrice(total, currency);
        document.getElementById('previewCurrency').textContent = this.selectedCurrency;
    }

    calculateCartTotal() {
        const cartItems = window.cart || [];
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    async submitHelpMePayRequest(orderData) {
        try {
            const helperInfo = {
                name: document.getElementById('helperName')?.value,
                email: document.getElementById('helperEmail')?.value,
                phone: document.getElementById('helperPhone')?.value,
                message: document.getElementById('helpMessage')?.value
            };

            // Validate at least email or phone is provided
            if (!helperInfo.email && !helperInfo.phone) {
                throw new Error('Please provide either email or phone number for the helper');
            }

            const requestData = {
                ...orderData,
                helper_info: helperInfo,
                currency: this.selectedCurrency,
                payment_type: 'help_me_pay',
                status: 'pending_helper_payment',
                created_at: new Date().toISOString()
            };

            // Create help-me-pay request in database
            const result = await window.fordipsTech.createHelpMePayRequest(requestData);

            if (result.success) {
                // Send notification to helper
                await this.sendHelpMePayNotification(result.requestId, helperInfo, orderData);

                // Show success message
                this.showSuccessMessage(helperInfo);

                return result;
            }

            throw new Error(result.error || 'Failed to create help-me-pay request');

        } catch (error) {
            window.FORDIPS_CONFIG?.logger.error('Help Me Pay Error:', error);
            throw error;
        }
    }

    async sendHelpMePayNotification(requestId, helperInfo, orderData) {
        try {
            const paymentLink = `${window.location.origin}/help-me-pay.html?request=${requestId}`;

            const emailData = {
                to: helperInfo.email,
                subject: `${orderData.customer_name} is requesting your help with a payment`,
                message: `
                    <h2>Payment Request from ${orderData.customer_name}</h2>
                    <p>${helperInfo.message || 'They need your help to complete a purchase.'}</p>

                    <h3>Order Details:</h3>
                    <p><strong>Products:</strong> ${orderData.items.map(item => item.name).join(', ')}</p>
                    <p><strong>Total:</strong> ${this.convertPrice(orderData.total_amount)} ${this.selectedCurrency}</p>

                    <p>
                        <a href="${paymentLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                            View Request & Pay
                        </a>
                    </p>

                    <p><small>This link will expire in 48 hours.</small></p>
                `
            };

            // Send email notification
            await window.fordipsTech.sendEmail(emailData);

            // If phone number provided, send SMS
            if (helperInfo.phone) {
                const smsData = {
                    to: helperInfo.phone,
                    message: `${orderData.customer_name} sent you a payment request for ${this.convertPrice(orderData.total_amount)} ${this.selectedCurrency}. View details: ${paymentLink}`
                };

                await window.fordipsTech.sendSMS(smsData);
            }

            window.FORDIPS_CONFIG?.logger.log('Help Me Pay notification sent successfully');

        } catch (error) {
            window.FORDIPS_CONFIG?.logger.error('Error sending notification:', error);
            // Don't throw error here - the request was created successfully
        }
    }

    showSuccessMessage(helperInfo) {
        const message = `
            <div class="help-me-pay-success">
                <div class="success-icon">✅</div>
                <h3>Payment Request Sent!</h3>
                <p>We've sent a payment request to <strong>${helperInfo.name}</strong></p>
                ${helperInfo.email ? `<p>Email: ${helperInfo.email}</p>` : ''}
                ${helperInfo.phone ? `<p>Phone: ${helperInfo.phone}</p>` : ''}
                <p class="help-text">They'll receive a secure link to complete the payment. You'll both be notified once the payment is processed.</p>
                <button class="btn-primary" onclick="window.location.href='index.html'">Back to Home</button>
            </div>
        `;

        // Show in modal or replace checkout form
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.innerHTML = message;
        }
    }

    // Load saved currency preference
    loadSavedCurrency() {
        const saved = localStorage.getItem('selectedCurrency');
        if (saved && this.currencies.find(c => c.code === saved)) {
            this.selectCurrency(saved);
        }
    }
}

// Initialize Help Me Pay & Currency System when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.helpMePay = new HelpMePaySystem();
    window.helpMePay.loadSavedCurrency();

    // If on checkout page, add Help Me Pay UI
    if (window.location.pathname.includes('checkout')) {
        window.helpMePay.createHelpMePayUI();
    }

    window.FORDIPS_CONFIG?.logger.log('✅ Help Me Pay & Currency System ready');
});
