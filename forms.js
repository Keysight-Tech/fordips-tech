/**
 * FORDIPS TECH - Forms & Modals JavaScript
 * Handles all form submissions and modal interactions
 */

// ===================================
// CONTACT FORM
// ===================================
document.getElementById('contactForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formStatus = document.getElementById('contactFormStatus');
    const formData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value
    };

    formStatus.textContent = 'Sending message...';
    formStatus.className = 'form-status';
    formStatus.style.display = 'block';

    // Submit using new contact system with notifications
    const result = await window.contactSystem.submitContactMessage(formData);

    if (result.success) {
        formStatus.textContent = `Thank you ${formData.name}! Your message has been sent successfully. We'll get back to you soon. Admin notification sent to ${formData.email}.`;
        formStatus.className = 'form-status success';
        this.reset();
    } else {
        formStatus.textContent = 'Error: ' + (result.error || 'Could not send message');
        formStatus.className = 'form-status error';
    }
});

// ===================================
// NEWSLETTER FORM
// ===================================
document.getElementById('newsletterForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formStatus = document.getElementById('newsletterStatus');
    const email = document.getElementById('newsletterEmail').value;

    formStatus.textContent = 'Subscribing...';
    formStatus.className = 'form-status';
    formStatus.style.display = 'block';
    formStatus.style.color = 'white';

    // Submit to Supabase
    const result = await window.fordipsTech.subscribeNewsletter(email);

    if (result.success) {
        formStatus.textContent = 'Successfully subscribed! Check your email for confirmation.';
        formStatus.className = 'form-status success';
        formStatus.style.color = 'white';
        formStatus.style.background = 'rgba(255, 255, 255, 0.2)';
        this.reset();
    } else {
        formStatus.textContent = 'Error: ' + (result.error || 'Could not subscribe');
        formStatus.className = 'form-status error';
        formStatus.style.color = 'white';
        formStatus.style.background = 'rgba(255, 0, 0, 0.2)';
    }
});

// ===================================
// ACCOUNT MODAL
// ===================================
async function openAccountModal() {
    // Check if user is logged in
    if (window.fordipsTech && window.fordipsTech.getCurrentUser) {
        const user = await window.fordipsTech.getCurrentUser();
        if (user) {
            // User is logged in, redirect to my-account page
            window.location.href = 'my-account.html';
            return;
        }
    }

    // User is not logged in, show login/signup modal
    document.getElementById('accountModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAccountModal() {
    document.getElementById('accountModal').classList.remove('active');
    document.body.style.overflow = '';
}

function showAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabs = document.querySelectorAll('.auth-tab');

    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    }
}

// Login Form
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formStatus = document.getElementById('loginStatus');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    formStatus.textContent = 'Logging in...';
    formStatus.className = 'form-status';
    formStatus.style.display = 'block';

    // Sign in with Supabase
    const result = await window.fordipsTech.signIn(email, password);

    if (result.success) {
        formStatus.textContent = 'Login successful! Welcome back.';
        formStatus.className = 'form-status success';

        // Update UI for logged in user
        if (result.user) {
            updateUserUI(result.user);
        }

        setTimeout(() => {
            closeAccountModal();
            this.reset();
            formStatus.style.display = 'none';
        }, 1500);
    } else {
        formStatus.textContent = 'Error: ' + (result.error || 'Invalid email or password');
        formStatus.className = 'form-status error';
    }
});

// Signup Form
document.getElementById('signupForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formStatus = document.getElementById('signupStatus');
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (password !== confirmPassword) {
        formStatus.textContent = 'Passwords do not match!';
        formStatus.className = 'form-status error';
        formStatus.style.display = 'block';
        return;
    }

    if (password.length < 6) {
        formStatus.textContent = 'Password must be at least 6 characters!';
        formStatus.className = 'form-status error';
        formStatus.style.display = 'block';
        return;
    }

    formStatus.textContent = 'Creating account...';
    formStatus.className = 'form-status';
    formStatus.style.display = 'block';

    // Sign up with Supabase
    const result = await window.fordipsTech.signUp(email, password, name);

    if (result.success) {
        formStatus.textContent = 'Account created successfully! Please check your email to verify.';
        formStatus.className = 'form-status success';

        setTimeout(() => {
            closeAccountModal();
            this.reset();
            formStatus.style.display = 'none';
        }, 2000);
    } else {
        formStatus.textContent = 'Error: ' + (result.error || 'Could not create account');
        formStatus.className = 'form-status error';
    }
});

// Helper function to update UI when user logs in
function updateUserUI(user) {
    // Update account button text
    const accountButtonText = document.getElementById('accountButtonText');
    const accountLinks = document.querySelectorAll('a[href="#account"]');
    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Account';

    if (accountButtonText) {
        accountButtonText.textContent = userName;
    }

    accountLinks.forEach(link => {
        link.textContent = userName;
    });

    // Show notification
    if (typeof showNotification === 'function') {
        showNotification('Welcome back, ' + userName + '!', 'success');
    }
}

// Check for existing session on page load
document.addEventListener('DOMContentLoaded', async function() {
    if (window.fordipsTech && window.fordipsTech.getCurrentUser) {
        const user = await window.fordipsTech.getCurrentUser();
        if (user) {
            updateUserUI(user);
        }
    }
});

// ===================================
// SUPPORT MODAL
// ===================================
const supportContent = {
    faq: {
        title: 'Frequently Asked Questions',
        content: `
            <div class="faq-item">
                <div class="faq-question">What payment methods do you accept?</div>
                <div class="faq-answer">We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers.</div>
            </div>
            <div class="faq-item">
                <div class="faq-question">How long does shipping take?</div>
                <div class="faq-answer">Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business days delivery.</div>
            </div>
            <div class="faq-item">
                <div class="faq-question">Do you ship internationally?</div>
                <div class="faq-answer">Yes! We ship to over 100 countries worldwide. International shipping times vary by destination.</div>
            </div>
            <div class="faq-item">
                <div class="faq-question">What is your return policy?</div>
                <div class="faq-answer">We offer a 30-day return policy for all unused items in original packaging. See our Shipping & Returns page for details.</div>
            </div>
            <div class="faq-item">
                <div class="faq-question">Are your products authentic?</div>
                <div class="faq-answer">Yes, all our products are 100% authentic and sourced directly from authorized distributors.</div>
            </div>
        `
    },
    shipping: {
        title: 'Shipping & Returns',
        content: `
            <h3>Shipping Information</h3>
            <p>We offer free standard shipping on all orders over $50. Orders are processed within 1-2 business days.</p>

            <h3>Shipping Options</h3>
            <ul>
                <li><strong>Standard Shipping (FREE over $50):</strong> 3-5 business days</li>
                <li><strong>Express Shipping ($15):</strong> 1-2 business days</li>
                <li><strong>International Shipping:</strong> 7-14 business days (rates vary)</li>
            </ul>

            <h3>Returns Policy</h3>
            <p>We want you to be completely satisfied with your purchase. If you're not happy, you can return any item within 30 days of delivery for a full refund.</p>

            <h3>Return Requirements</h3>
            <ul>
                <li>Items must be unused and in original packaging</li>
                <li>All accessories and documentation must be included</li>
                <li>Returns must be initiated within 30 days of delivery</li>
                <li>Refunds are processed within 5-7 business days</li>
            </ul>

            <p>To initiate a return, please contact our support team at <strong>support@fordipstech.com</strong></p>
        `
    },
    warranty: {
        title: 'Warranty Information',
        content: `
            <h3>Product Warranty</h3>
            <p>All products sold by Fordips Tech come with a manufacturer's warranty. Warranty terms vary by product and manufacturer.</p>

            <h3>Standard Warranty Coverage</h3>
            <ul>
                <li><strong>Apple Products:</strong> 1-year limited warranty + AppleCare options</li>
                <li><strong>Samsung Products:</strong> 1-year manufacturer warranty</li>
                <li><strong>Laptops & Computers:</strong> 1-2 years depending on brand</li>
                <li><strong>Accessories:</strong> 90 days to 1 year</li>
                <li><strong>Starlink:</strong> 1-year hardware warranty</li>
            </ul>

            <h3>Extended Warranty</h3>
            <p>We offer extended warranty plans for most products, providing coverage beyond the manufacturer's warranty period.</p>

            <h3>Warranty Claims</h3>
            <p>To file a warranty claim:</p>
            <ul>
                <li>Contact us at <strong>warranty@fordipstech.com</strong></li>
                <li>Provide proof of purchase and product details</li>
                <li>Describe the issue you're experiencing</li>
                <li>Our team will guide you through the claim process</li>
            </ul>
        `
    },
    support: {
        title: 'Support Center',
        content: `
            <h3>Get Help</h3>
            <p>Our support team is here to help you with any questions or issues you may have.</p>

            <h3>Contact Methods</h3>
            <ul>
                <li><strong>Email:</strong> support@fordipstech.com (24-hour response time)</li>
                <li><strong>Phone:</strong> (667) 256-3680 (Mon-Fri, 9AM-6PM EST)</li>
                <li><strong>Live Chat:</strong> Available on our website during business hours</li>
            </ul>

            <h3>Common Support Topics</h3>
            <ul>
                <li>Order tracking and status</li>
                <li>Product setup and configuration</li>
                <li>Technical troubleshooting</li>
                <li>Returns and exchanges</li>
                <li>Billing and payment issues</li>
                <li>Account management</li>
            </ul>

            <h3>Technical Support</h3>
            <p>For technical assistance with your products, we offer:</p>
            <ul>
                <li>Phone and email support</li>
                <li>Remote assistance for software issues</li>
                <li>Product setup guides and tutorials</li>
                <li>Video troubleshooting</li>
            </ul>

            <p>Visit our <a href="#faq">FAQ page</a> for instant answers to common questions.</p>
        `
    }
};

function openSupportModal(type) {
    const modal = document.getElementById('supportModal');
    const content = document.getElementById('supportContent');

    if (supportContent[type]) {
        content.innerHTML = `
            <h2>${supportContent[type].title}</h2>
            ${supportContent[type].content}
        `;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSupportModal() {
    document.getElementById('supportModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ===================================
// LEGAL MODAL
// ===================================
const legalContent = {
    privacy: {
        title: 'Privacy Policy',
        content: `
            <p><em>Last updated: ${new Date().toLocaleDateString()}</em></p>

            <h3>Introduction</h3>
            <p>Fordips Tech LLC ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.</p>

            <h3>Information We Collect</h3>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
                <li>Name, email address, and contact information</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information (processed securely by third-party providers)</li>
                <li>Order history and preferences</li>
                <li>Communication preferences</li>
            </ul>

            <h3>How We Use Your Information</h3>
            <p>We use your information to:</p>
            <ul>
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and account</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our products and services</li>
                <li>Comply with legal obligations</li>
            </ul>

            <h3>Data Security</h3>
            <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.</p>

            <h3>Your Rights</h3>
            <p>You have the right to:</p>
            <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
            </ul>

            <h3>Contact Us</h3>
            <p>If you have questions about this Privacy Policy, please contact us at <strong>privacy@fordipstech.com</strong></p>
        `
    },
    terms: {
        title: 'Terms & Conditions',
        content: `
            <p><em>Last updated: ${new Date().toLocaleDateString()}</em></p>

            <h3>Agreement to Terms</h3>
            <p>By accessing and using this website, you agree to be bound by these Terms and Conditions.</p>

            <h3>Use of Website</h3>
            <p>You agree to use our website only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the website.</p>

            <h3>Product Information</h3>
            <p>We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free.</p>

            <h3>Orders and Payments</h3>
            <ul>
                <li>All orders are subject to acceptance and availability</li>
                <li>We reserve the right to refuse or cancel any order</li>
                <li>Prices are subject to change without notice</li>
                <li>Payment must be received before shipment</li>
            </ul>

            <h3>Intellectual Property</h3>
            <p>All content on this website, including text, graphics, logos, and images, is the property of Fordips Tech LLC and protected by copyright laws.</p>

            <h3>Limitation of Liability</h3>
            <p>To the fullest extent permitted by law, Fordips Tech LLC shall not be liable for any indirect, incidental, special, or consequential damages.</p>

            <h3>Governing Law</h3>
            <p>These Terms and Conditions are governed by the laws of the United States and the State of Maryland.</p>

            <h3>Contact</h3>
            <p>For questions about these Terms, contact us at <strong>legal@fordipstech.com</strong></p>
        `
    }
};

function openLegalModal(type) {
    const modal = document.getElementById('legalModal');
    const content = document.getElementById('legalContent');

    if (legalContent[type]) {
        content.innerHTML = `
            <h2>${legalContent[type].title}</h2>
            ${legalContent[type].content}
        `;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLegalModal() {
    document.getElementById('legalModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ===================================
// CHECKOUT MODAL
// ===================================
function openCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    const cartTotal = document.getElementById('totalAmount')?.textContent || '$0.00';

    document.getElementById('checkoutSubtotal').textContent = cartTotal;
    document.getElementById('checkoutTotal').textContent = cartTotal;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Checkout Form
document.getElementById('checkoutForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formStatus = document.getElementById('checkoutStatus');
    const formData = {
        firstName: document.getElementById('checkoutFirstName').value,
        lastName: document.getElementById('checkoutLastName').value,
        email: document.getElementById('checkoutEmail').value,
        address: document.getElementById('checkoutAddress').value,
        city: document.getElementById('checkoutCity').value,
        zip: document.getElementById('checkoutZip').value,
        payment: document.querySelector('input[name="payment"]:checked').value
    };

    // Get cart total
    const cartTotalText = document.getElementById('totalAmount')?.textContent || '$0.00';
    const total = parseFloat(cartTotalText.replace('$', '').replace(',', ''));

    formStatus.textContent = 'Processing your order...';
    formStatus.className = 'form-status';
    formStatus.style.display = 'block';

    // Place order with Supabase
    const result = await window.fordipsTech.placeOrder({
        ...formData,
        total: total
    });

    if (result.success) {
        formStatus.textContent = `Order placed successfully! Your order number is ${result.orderNumber}. Confirmation email sent.`;
        formStatus.className = 'form-status success';

        setTimeout(() => {
            closeCheckoutModal();
            // Clear cart
            if (typeof clearCart === 'function') {
                clearCart();
            }
            this.reset();
            formStatus.style.display = 'none';
        }, 3000);
    } else {
        formStatus.textContent = 'Error: ' + (result.error || 'Could not place order');
        formStatus.className = 'form-status error';
    }
});

// Update checkout button in cart
document.getElementById('checkoutBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    const cartCount = getCartCount();

    if (cartCount === 0) {
        alert('Your cart is empty!');
        return;
    }

    closeCart();
    setTimeout(() => {
        openCheckoutModal();
    }, 300);
});

// ===================================
// FOOTER LINK HANDLERS
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    // Setup footer link handlers
    document.querySelectorAll('.footer-list a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Handle modal links
            if (href === '#account') {
                e.preventDefault();
                openAccountModal();
            } else if (href === '#faq') {
                e.preventDefault();
                openSupportModal('faq');
            } else if (href === '#shipping') {
                e.preventDefault();
                openSupportModal('shipping');
            } else if (href === '#warranty') {
                e.preventDefault();
                openSupportModal('warranty');
            } else if (href === '#support') {
                e.preventDefault();
                openSupportModal('support');
            } else if (href === '#privacy') {
                e.preventDefault();
                openLegalModal('privacy');
            } else if (href === '#terms') {
                e.preventDefault();
                openLegalModal('terms');
            } else if (href === '#checkout') {
                e.preventDefault();
                openCheckoutModal();
            }
            // Other links will work normally with smooth scrolling
        });
    });
});

