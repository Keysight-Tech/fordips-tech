/**
 * FORDIPS TECH - Enhanced Checkout System
 * World-class checkout experience with validation and payment processing
 */

/**
 * Open Checkout Modal
 */
function openCheckoutModal() {
    const cart = JSON.parse(localStorage.getItem('fordipsTechCart')) || [];

    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 0; // FREE
    const total = subtotal + shipping;

    // Update checkout totals
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTotal = document.getElementById('checkoutTotal');

    if (checkoutSubtotal) checkoutSubtotal.textContent = `$${subtotal.toLocaleString()}`;
    if (checkoutTotal) checkoutTotal.textContent = `$${total.toLocaleString()}`;

    // Display cart items in checkout summary (optional enhancement)
    displayCheckoutItems(cart);

    // Show modal
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Close cart modal if open
        const cartModal = document.getElementById('cartModal');
        if (cartModal) cartModal.classList.remove('active');
    }
}

/**
 * Close Checkout Modal
 */
function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Clear form
    const form = document.getElementById('checkoutForm');
    if (form) form.reset();

    // Clear any validation messages
    clearValidationErrors();
}

/**
 * Display cart items in checkout (optional)
 */
function displayCheckoutItems(cart) {
    // We can add a section in checkout to show items if needed
    // For now, this is a placeholder for future enhancement
}

/**
 * Real-time Form Validation
 */
function setupFormValidation() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    // Email validation
    const emailInput = document.getElementById('checkoutEmail');
    if (emailInput) {
        emailInput.addEventListener('blur', () => validateEmail(emailInput));
        emailInput.addEventListener('input', () => clearFieldError(emailInput));
    }

    // ZIP code validation
    const zipInput = document.getElementById('checkoutZip');
    if (zipInput) {
        zipInput.addEventListener('blur', () => validateZipCode(zipInput));
        zipInput.addEventListener('input', () => clearFieldError(zipInput));
    }

    // Phone validation (if exists)
    const phoneInput = document.getElementById('checkoutPhone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', () => validatePhone(phoneInput));
        phoneInput.addEventListener('input', () => clearFieldError(phoneInput));
    }

    // Name validation
    const firstNameInput = document.getElementById('checkoutFirstName');
    const lastNameInput = document.getElementById('checkoutLastName');

    if (firstNameInput) {
        firstNameInput.addEventListener('blur', () => validateRequired(firstNameInput, 'First name'));
        firstNameInput.addEventListener('input', () => clearFieldError(firstNameInput));
    }

    if (lastNameInput) {
        lastNameInput.addEventListener('blur', () => validateRequired(lastNameInput, 'Last name'));
        lastNameInput.addEventListener('input', () => clearFieldError(lastNameInput));
    }

    // Address validation
    const addressInput = document.getElementById('checkoutAddress');
    if (addressInput) {
        addressInput.addEventListener('blur', () => validateRequired(addressInput, 'Address'));
        addressInput.addEventListener('input', () => clearFieldError(addressInput));
    }

    // City validation
    const cityInput = document.getElementById('checkoutCity');
    if (cityInput) {
        cityInput.addEventListener('blur', () => validateRequired(cityInput, 'City'));
        cityInput.addEventListener('input', () => clearFieldError(cityInput));
    }
}

/**
 * Validation Functions
 */
function validateEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const value = input.value.trim();

    if (!value) {
        showFieldError(input, 'Email is required');
        return false;
    }

    if (!emailRegex.test(value)) {
        showFieldError(input, 'Please enter a valid email address');
        return false;
    }

    clearFieldError(input);
    return true;
}

function validateZipCode(input) {
    const value = input.value.trim();

    if (!value) {
        showFieldError(input, 'ZIP code is required');
        return false;
    }

    // Allow various formats: 12345, 12345-6789, or international postal codes
    if (value.length < 3) {
        showFieldError(input, 'Please enter a valid ZIP code');
        return false;
    }

    clearFieldError(input);
    return true;
}

function validatePhone(input) {
    const value = input.value.trim();

    if (!value) {
        showFieldError(input, 'Phone number is required');
        return false;
    }

    // Remove all non-digit characters for validation
    const digitsOnly = value.replace(/\D/g, '');

    if (digitsOnly.length < 10) {
        showFieldError(input, 'Please enter a valid phone number');
        return false;
    }

    clearFieldError(input);
    return true;
}

function validateRequired(input, fieldName) {
    const value = input.value.trim();

    if (!value) {
        showFieldError(input, `${fieldName} is required`);
        return false;
    }

    if (value.length < 2) {
        showFieldError(input, `${fieldName} must be at least 2 characters`);
        return false;
    }

    clearFieldError(input);
    return true;
}

/**
 * Show/Clear Field Errors
 */
function showFieldError(input, message) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    // Remove existing error
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) existingError.remove();

    // Add error class to input
    input.classList.add('error');

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '4px';
    errorDiv.style.fontWeight = '500';

    formGroup.appendChild(errorDiv);
}

function clearFieldError(input) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    // Remove error class
    input.classList.remove('error');

    // Remove error message
    const errorDiv = formGroup.querySelector('.field-error');
    if (errorDiv) errorDiv.remove();
}

function clearValidationErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.remove());
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

/**
 * Validate entire form
 */
function validateCheckoutForm() {
    let isValid = true;

    const firstNameInput = document.getElementById('checkoutFirstName');
    const lastNameInput = document.getElementById('checkoutLastName');
    const emailInput = document.getElementById('checkoutEmail');
    const addressInput = document.getElementById('checkoutAddress');
    const cityInput = document.getElementById('checkoutCity');
    const zipInput = document.getElementById('checkoutZip');
    const phoneInput = document.getElementById('checkoutPhone');

    if (firstNameInput && !validateRequired(firstNameInput, 'First name')) isValid = false;
    if (lastNameInput && !validateRequired(lastNameInput, 'Last name')) isValid = false;
    if (emailInput && !validateEmail(emailInput)) isValid = false;
    if (addressInput && !validateRequired(addressInput, 'Address')) isValid = false;
    if (cityInput && !validateRequired(cityInput, 'City')) isValid = false;
    if (zipInput && !validateZipCode(zipInput)) isValid = false;
    if (phoneInput && phoneInput.value && !validatePhone(phoneInput)) isValid = false;

    return isValid;
}

/**
 * Simulate Payment Processing
 */
async function processPayment(paymentMethod, orderData, cartItems) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            // 95% success rate for demo
            const success = Math.random() > 0.05;

            if (success) {
                resolve({
                    success: true,
                    transactionId: 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    paymentMethod: paymentMethod,
                    amount: orderData.total_amount,
                    timestamp: new Date().toISOString()
                });
            } else {
                reject({
                    success: false,
                    error: 'Payment declined. Please try a different payment method.',
                    code: 'PAYMENT_DECLINED'
                });
            }
        }, 2000); // 2 second delay to simulate processing
    });
}

/**
 * Handle Checkout Form Submission
 */
async function handleCheckoutFormSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!validateCheckoutForm()) {
        showNotification('Please fix the errors in the form', 'error');
        return;
    }

    // Get cart items
    const cart = JSON.parse(localStorage.getItem('fordipsTechCart')) || [];

    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        closeCheckoutModal();
        return;
    }

    // Get form data
    const firstName = document.getElementById('checkoutFirstName').value.trim();
    const lastName = document.getElementById('checkoutLastName').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const address = document.getElementById('checkoutAddress').value.trim();
    const city = document.getElementById('checkoutCity').value.trim();
    const zipCode = document.getElementById('checkoutZip').value.trim();
    const phone = document.getElementById('checkoutPhone')?.value.trim() || '';
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'card';

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 0; // FREE
    const total = subtotal + shipping;

    const orderData = {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        zipCode,
        paymentMethod,
        subtotal,
        shipping,
        total_amount: total,
        customer_name: `${firstName} ${lastName}`,
        customer_email: email,
        customer_phone: phone,
        shipping_address: address
    };

    // Show loading state
    const submitBtn = document.querySelector('#checkoutForm button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <div class="spinner" style="width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite;"></div>
            <span>Processing Payment...</span>
        </div>
    `;

    // Add spinner animation
    if (!document.getElementById('spinnerStyle')) {
        const style = document.createElement('style');
        style.id = 'spinnerStyle';
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    try {
        // Process payment
        const paymentResult = await processPayment(paymentMethod, orderData, cart);

        // If payment successful, create order
        if (paymentResult.success) {
            // Check if order tracking system is available
            if (!window.orderTracking || !window.orderTracking.createOrderWithTracking) {
                throw new Error('Order tracking system not available. Please refresh the page and try again.');
            }

            const orderResult = await window.orderTracking.createOrderWithTracking(orderData, cart);

            if (orderResult.success) {
                // Clear cart
                localStorage.removeItem('fordipsTechCart');
                updateCartUI();

                // Close checkout modal
                closeCheckoutModal();

                // Show success message with tracking
                if (typeof showThankYouWithTracking === 'function') {
                    showThankYouWithTracking(
                        orderResult.orderNumber,
                        orderResult.trackingNumber,
                        cart,
                        orderData
                    );
                }

                showNotification('Order placed successfully!', 'success');
            } else {
                throw new Error(orderResult.error || 'Failed to create order');
            }
        } else {
            throw new Error('Payment processing failed. Please try again.');
        }

    } catch (error) {

        let errorMessage = 'Payment failed. Please try again.';
        if (error.error) {
            errorMessage = error.error;
        } else if (error.message) {
            errorMessage = error.message;
        }

        showNotification(errorMessage, 'error');

        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

/**
 * Setup Checkout System
 */
function initializeEnhancedCheckoutSystem() {
    // Setup form validation
    setupFormValidation();

    // Setup form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.removeEventListener('submit', handleCheckoutFormSubmit);
        checkoutForm.addEventListener('submit', handleCheckoutFormSubmit);
    }

    // Setup checkout button in cart
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.removeEventListener('click', openCheckoutModal);
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openCheckoutModal();
        });
    }

    // Payment method selection highlighting
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

/**
 * Initialize on DOM load
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeEnhancedCheckoutSystem();
});
