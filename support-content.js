/**
 * FORDIPS TECH - Support & Legal Content
 * Comprehensive content for FAQs, Shipping, Warranty, Privacy Policy, Terms & Conditions
 */

// Avoid redeclaration if already loaded
if (typeof supportContent === 'undefined') {
    var supportContent = {};
}
supportContent = {
    faq: {
        title: 'Frequently Asked Questions',
        sections: [
            {
                category: 'Ordering & Payment',
                questions: [
                    {
                        q: 'What payment methods do you accept?',
                        a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, MTN Mobile Money, Orange Money, Zelle, and Cash App. All payments are processed securely through encrypted channels.'
                    },
                    {
                        q: 'Is it safe to use my credit card on your site?',
                        a: 'Absolutely! We use industry-standard SSL encryption and are PCI DSS compliant. Your payment information is never stored on our servers and is processed through secure payment gateways including Stripe.'
                    },
                    {
                        q: 'Can I change or cancel my order?',
                        a: 'You can modify or cancel your order within 1 hour of placement. After that, please contact our support team immediately at support@fordipstech.com or call (667) 256-3680.'
                    },
                    {
                        q: 'Do you offer installment payment plans?',
                        a: 'Yes! We offer flexible payment plans through our "Help Me Pay" feature, allowing you to split your purchase into manageable installments. Options available at checkout.'
                    }
                ]
            },
            {
                category: 'Shipping & Delivery',
                questions: [
                    {
                        q: 'Do you offer free shipping?',
                        a: 'Yes! We offer FREE worldwide shipping on all orders. Premium expedited shipping options are available at checkout for faster delivery.'
                    },
                    {
                        q: 'How long does shipping take?',
                        a: 'Domestic (USA): 2-5 business days | International: 7-14 business days | Express shipping: 1-2 business days (USA only). You will receive tracking information via email once your order ships.'
                    },
                    {
                        q: 'Do you ship internationally?',
                        a: 'Yes! We ship to over 150 countries worldwide. International shipping costs are calculated at checkout based on destination and package weight.'
                    },
                    {
                        q: 'How can I track my order?',
                        a: 'You will receive a tracking number via email within 24 hours of your order being shipped. You can also track your order using our Order Tracking system in the navigation menu.'
                    }
                ]
            },
            {
                category: 'Products & Authenticity',
                questions: [
                    {
                        q: 'Are all your products 100% authentic?',
                        a: 'Yes! We guarantee 100% authentic, brand-new products sourced directly from authorized distributors and manufacturers. Every product comes with original packaging and manufacturer warranty.'
                    },
                    {
                        q: 'Do you sell refurbished products?',
                        a: 'We offer both brand new and certified refurbished products. All refurbished items are clearly marked and come with our 90-day warranty. They undergo rigorous testing to ensure quality.'
                    },
                    {
                        q: 'What if I receive a defective product?',
                        a: 'If you receive a defective product, contact us within 48 hours. We will arrange a free replacement or full refund, including return shipping costs.'
                    }
                ]
            },
            {
                category: 'Returns & Refunds',
                questions: [
                    {
                        q: 'What is your return policy?',
                        a: 'We offer a 30-day money-back guarantee on all products. Items must be returned in original condition with all packaging, accessories, and documentation.'
                    },
                    {
                        q: 'How do I initiate a return?',
                        a: 'Contact our support team at support@fordipstech.com with your order number. We will provide you with a return authorization and prepaid shipping label.'
                    },
                    {
                        q: 'When will I receive my refund?',
                        a: 'Refunds are processed within 3-5 business days of receiving the returned item. The funds will appear in your account within 7-10 business days depending on your financial institution.'
                    }
                ]
            },
            {
                category: 'Warranty & Support',
                questions: [
                    {
                        q: 'What warranty do your products come with?',
                        a: 'All new products come with the manufacturer\'s standard warranty (typically 1 year). Refurbished items include our 90-day warranty. Extended warranty options available at checkout.'
                    },
                    {
                        q: 'Do you offer technical support?',
                        a: 'Yes! Our expert support team is available Monday-Friday, 9 AM - 6 PM EST via phone, email, or live chat to assist with setup, troubleshooting, and technical questions.'
                    }
                ]
            }
        ]
    },

    shipping: {
        title: 'Shipping & Returns Policy',
        content: `
            <div class="legal-section">
                <h3>Shipping Information</h3>

                <h4>Free Worldwide Shipping</h4>
                <p>We are proud to offer <strong>FREE standard shipping on all orders worldwide</strong>. No minimum purchase required!</p>

                <h4>Shipping Methods & Delivery Times</h4>
                <ul>
                    <li><strong>Standard Shipping (FREE):</strong>
                        <ul>
                            <li>USA: 2-5 business days</li>
                            <li>Canada: 5-7 business days</li>
                            <li>Europe: 7-12 business days</li>
                            <li>Africa: 10-14 business days</li>
                            <li>Asia/Pacific: 7-14 business days</li>
                        </ul>
                    </li>
                    <li><strong>Express Shipping (USA only):</strong>
                        <ul>
                            <li>Next Day: Order by 2 PM EST for next business day delivery</li>
                            <li>2-Day Express: Guaranteed delivery within 2 business days</li>
                        </ul>
                    </li>
                </ul>

                <h4>Order Processing</h4>
                <p>Orders are processed within 24 hours on business days (Monday-Friday). Orders placed on weekends or holidays will be processed the next business day.</p>

                <h4>Tracking Your Order</h4>
                <p>You will receive an email with tracking information within 24 hours of your order being shipped. Track your package in real-time using our Order Tracking system.</p>

                <h4>International Shipping</h4>
                <p>International customers are responsible for any customs duties, taxes, or fees imposed by their country. These charges are not included in our pricing and vary by destination.</p>

                <h3>Returns & Refunds Policy</h3>

                <h4>30-Day Money-Back Guarantee</h4>
                <p>We stand behind the quality of our products. If you're not completely satisfied, return your purchase within 30 days for a full refund.</p>

                <h4>Return Conditions</h4>
                <p>To be eligible for a return, items must:</p>
                <ul>
                    <li>Be in original, unused condition</li>
                    <li>Include all original packaging, accessories, and documentation</li>
                    <li>Have no physical damage or wear</li>
                    <li>Include the original receipt or proof of purchase</li>
                </ul>

                <h4>Non-Returnable Items</h4>
                <ul>
                    <li>Opened software, apps, or digital downloads</li>
                    <li>Items marked as "Final Sale"</li>
                    <li>Gift cards or promotional items</li>
                    <li>Items damaged due to misuse or neglect</li>
                </ul>

                <h4>How to Return</h4>
                <ol>
                    <li>Contact us at support@fordipstech.com or call (667) 256-3680</li>
                    <li>Provide your order number and reason for return</li>
                    <li>Receive your Return Authorization (RA) number and prepaid shipping label</li>
                    <li>Package item securely with all original contents</li>
                    <li>Ship using provided label</li>
                </ol>

                <h4>Refund Processing</h4>
                <p>Once we receive your return:</p>
                <ul>
                    <li>Inspection: 1-2 business days</li>
                    <li>Refund processing: 3-5 business days</li>
                    <li>Credit to your account: 7-10 business days (varies by bank)</li>
                </ul>
                <p>You will receive an email confirmation once your refund has been processed.</p>

                <h4>Exchanges</h4>
                <p>We currently do not offer direct exchanges. Please return the original item for a refund and place a new order for the desired product.</p>

                <h4>Damaged or Defective Items</h4>
                <p>If you receive a damaged or defective item, contact us within 48 hours with photos. We will arrange free return shipping and expedite a replacement or full refund.</p>

                <div class="contact-info-box">
                    <h4>Questions?</h4>
                    <p><strong>Email:</strong> support@fordipstech.com<br>
                    <strong>Phone:</strong> (667) 256-3680<br>
                    <strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM EST</p>
                </div>
            </div>
        `
    },

    warranty: {
        title: 'Warranty Information',
        content: `
            <div class="legal-section">
                <h3>Product Warranty Coverage</h3>

                <h4>Manufacturer's Warranty</h4>
                <p>All brand-new products purchased from Fordips Tech LLC come with the full manufacturer's standard warranty. Coverage terms vary by manufacturer:</p>
                <ul>
                    <li><strong>Apple Products:</strong> 1-year limited warranty + 90 days complimentary phone support</li>
                    <li><strong>Samsung Products:</strong> 1-year limited warranty</li>
                    <li><strong>Laptops & Computers:</strong> 1-year manufacturer warranty (Dell, HP, Lenovo, etc.)</li>
                    <li><strong>Cameras & Accessories:</strong> 1-2 years depending on brand</li>
                </ul>

                <h4>Certified Refurbished Warranty</h4>
                <p>Certified refurbished products include our exclusive <strong>90-day Fordips Tech warranty</strong> covering:</p>
                <ul>
                    <li>Manufacturing defects</li>
                    <li>Hardware malfunctions</li>
                    <li>Battery issues</li>
                    <li>Screen defects</li>
                </ul>

                <h4>Extended Warranty Options</h4>
                <p>Protect your investment with our optional extended warranty plans:</p>
                <ul>
                    <li><strong>1-Year Extension:</strong> Adds 1 year to manufacturer warranty</li>
                    <li><strong>2-Year Complete Protection:</strong> Covers accidental damage, drops, spills</li>
                    <li><strong>3-Year Ultimate Care:</strong> Comprehensive coverage including battery replacement</li>
                </ul>
                <p><em>Extended warranty can be purchased at checkout or within 30 days of original purchase.</em></p>

                <h4>What's Covered</h4>
                <ul>
                    <li>Manufacturing defects in materials or workmanship</li>
                    <li>Hardware component failures under normal use</li>
                    <li>Screen defects (dead pixels, backlight bleeding)</li>
                    <li>Battery degradation below specified capacity</li>
                    <li>Software-related issues (diagnosis and assistance)</li>
                </ul>

                <h4>What's NOT Covered</h4>
                <ul>
                    <li>Accidental damage (drops, spills, cracks) - unless Extended Warranty purchased</li>
                    <li>Cosmetic damage that doesn't affect functionality</li>
                    <li>Damage from misuse, abuse, or neglect</li>
                    <li>Unauthorized repairs or modifications</li>
                    <li>Normal wear and tear</li>
                    <li>Theft or loss</li>
                    <li>Damage from natural disasters</li>
                </ul>

                <h4>How to File a Warranty Claim</h4>
                <ol>
                    <li><strong>Contact Us:</strong> Email support@fordipstech.com or call (667) 256-3680</li>
                    <li><strong>Provide Details:</strong> Order number, product serial number, description of issue</li>
                    <li><strong>Diagnostic:</strong> Our team may request photos/videos or remote diagnostic session</li>
                    <li><strong>Authorization:</strong> If approved, receive Return Authorization and shipping instructions</li>
                    <li><strong>Repair/Replace:</strong> We'll repair or replace your device within 7-10 business days</li>
                </ol>

                <h4>Warranty Transfer</h4>
                <p>Manufacturer warranties are typically non-transferable. Fordips Tech extended warranties may be transferred to a new owner with proof of purchase and transfer fee.</p>

                <h4>AppleCare+ & Samsung Care+</h4>
                <p>We can help you enroll in manufacturer extended protection plans:</p>
                <ul>
                    <li><strong>AppleCare+:</strong> Must be purchased within 60 days of device purchase</li>
                    <li><strong>Samsung Care+:</strong> Can be added within 60 days</li>
                </ul>
                <p>Contact us for enrollment assistance and pricing.</p>

                <h4>International Warranty</h4>
                <p>Most manufacturer warranties are valid internationally, but service may require shipping to authorized centers. Contact us for specific international warranty details.</p>

                <div class="contact-info-box">
                    <h4>Warranty Support</h4>
                    <p><strong>Email:</strong> warranty@fordipstech.com<br>
                    <strong>Phone:</strong> (667) 256-3680<br>
                    <strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM EST<br>
                    <strong>Claims Processing:</strong> 24-48 hours</p>
                </div>
            </div>
        `
    },

    privacy: {
        title: 'Privacy Policy',
        content: `
            <div class="legal-section">
                <p><strong>Effective Date:</strong> January 1, 2024</p>
                <p><strong>Last Updated:</strong> January 1, 2024</p>

                <h3>1. Introduction</h3>
                <p>Fordips Tech LLC ("we," "us," or "our") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.</p>

                <h3>2. Information We Collect</h3>

                <h4>Personal Information</h4>
                <p>When you make a purchase or create an account, we collect:</p>
                <ul>
                    <li>Name and contact information (email, phone number)</li>
                    <li>Billing and shipping addresses</li>
                    <li>Payment information (processed securely through third-party payment processors)</li>
                    <li>Order history and preferences</li>
                </ul>

                <h4>Automatically Collected Information</h4>
                <p>When you visit our website, we automatically collect:</p>
                <ul>
                    <li>IP address and geolocation data</li>
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>Pages visited and time spent on site</li>
                    <li>Referring website addresses</li>
                    <li>Cookies and similar tracking technologies</li>
                </ul>

                <h3>3. How We Use Your Information</h3>
                <p>We use your information to:</p>
                <ul>
                    <li>Process and fulfill your orders</li>
                    <li>Send order confirmations and shipping updates</li>
                    <li>Provide customer support</li>
                    <li>Improve our website and services</li>
                    <li>Send promotional emails (with your consent)</li>
                    <li>Detect and prevent fraud</li>
                    <li>Comply with legal obligations</li>
                </ul>

                <h3>4. Information Sharing and Disclosure</h3>
                <p>We do not sell your personal information. We may share your information with:</p>
                <ul>
                    <li><strong>Service Providers:</strong> Payment processors (Stripe), shipping carriers (FedEx, UPS, DHL), email service providers</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
                </ul>

                <h3>5. Data Security</h3>
                <p>We implement industry-standard security measures including:</p>
                <ul>
                    <li>SSL/TLS encryption for all data transmission</li>
                    <li>PCI DSS compliant payment processing</li>
                    <li>Secure data storage with encryption at rest</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication</li>
                </ul>

                <h3>6. Cookies and Tracking</h3>
                <p>We use cookies to:</p>
                <ul>
                    <li>Remember your preferences and settings</li>
                    <li>Keep you logged in</li>
                    <li>Analyze website traffic and usage</li>
                    <li>Provide personalized content and ads</li>
                </ul>
                <p>You can control cookies through your browser settings. Disabling cookies may limit website functionality.</p>

                <h3>7. Your Rights</h3>
                <p>You have the right to:</p>
                <ul>
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Correction:</strong> Update or correct your information</li>
                    <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
                    <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails</li>
                    <li><strong>Data Portability:</strong> Receive your data in a structured format</li>
                </ul>
                <p>To exercise these rights, contact us at privacy@fordipstech.com</p>

                <h3>8. Children's Privacy</h3>
                <p>Our services are not directed to individuals under 18. We do not knowingly collect personal information from children.</p>

                <h3>9. International Data Transfers</h3>
                <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.</p>

                <h3>10. Third-Party Links</h3>
                <p>Our website may contain links to third-party websites. We are not responsible for their privacy practices.</p>

                <h3>11. Changes to This Policy</h3>
                <p>We may update this privacy policy from time to time. We will notify you of significant changes via email or website notice.</p>

                <h3>12. Contact Us</h3>
                <div class="contact-info-box">
                    <p><strong>Fordips Tech LLC</strong><br>
                    15706 Dorset Rd<br>
                    Laurel, MD 20707<br>
                    United States</p>

                    <p><strong>Email:</strong> privacy@fordipstech.com<br>
                    <strong>Phone:</strong> (667) 256-3680<br>
                    <strong>Data Protection Officer:</strong> dpo@fordipstech.com</p>
                </div>
            </div>
        `
    },

    terms: {
        title: 'Terms & Conditions',
        content: `
            <div class="legal-section">
                <p><strong>Effective Date:</strong> January 1, 2024</p>
                <p><strong>Last Updated:</strong> January 1, 2024</p>

                <h3>1. Acceptance of Terms</h3>
                <p>By accessing and using the Fordips Tech LLC website ("Website"), you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our Website.</p>

                <h3>2. Company Information</h3>
                <p><strong>Legal Name:</strong> Fordips Tech LLC<br>
                <strong>Address:</strong> 15706 Dorset Rd, Laurel, MD 20707, United States<br>
                <strong>Email:</strong> legal@fordipstech.com<br>
                <strong>Phone:</strong> (667) 256-3680</p>

                <h3>3. Use of Website</h3>
                <h4>Permitted Use</h4>
                <p>You may use this Website for lawful purposes only, including:</p>
                <ul>
                    <li>Browsing products and services</li>
                    <li>Making purchases</li>
                    <li>Accessing customer support</li>
                    <li>Creating an account</li>
                </ul>

                <h4>Prohibited Use</h4>
                <p>You may NOT:</p>
                <ul>
                    <li>Use automated systems (bots, scrapers) without permission</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Transmit viruses or malicious code</li>
                    <li>Harass or harm other users</li>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Resell products without authorization</li>
                </ul>

                <h3>4. Product Information and Pricing</h3>
                <p>We strive for accuracy but do not warrant that:</p>
                <ul>
                    <li>Product descriptions are complete or error-free</li>
                    <li>Prices are accurate (errors will be corrected)</li>
                    <li>Products will always be in stock</li>
                </ul>
                <p>We reserve the right to:</p>
                <ul>
                    <li>Correct pricing errors</li>
                    <li>Cancel orders with incorrect pricing</li>
                    <li>Limit quantities purchased</li>
                    <li>Discontinue products at any time</li>
                </ul>

                <h3>5. Orders and Payment</h3>
                <h4>Order Acceptance</h4>
                <p>All orders are subject to acceptance and availability. We may refuse or cancel any order for any reason, including:</p>
                <ul>
                    <li>Product unavailability</li>
                    <li>Pricing errors</li>
                    <li>Suspected fraud</li>
                    <li>Violation of terms</li>
                </ul>

                <h4>Payment</h4>
                <p>Payment is due at time of order. We accept major credit cards, PayPal, and other methods as displayed. You authorize us to charge your payment method for the total amount, including taxes and shipping.</p>

                <h4>Currency</h4>
                <p>Prices are displayed in multiple currencies for convenience. Final charges will be processed in USD unless otherwise specified.</p>

                <h3>6. Shipping and Delivery</h3>
                <p>See our <a href="#shipping">Shipping Policy</a> for details. Risk of loss passes to you upon delivery to the shipping carrier.</p>

                <h3>7. Returns and Refunds</h3>
                <p>See our <a href="#shipping">Returns Policy</a>. Refunds are processed to the original payment method within 7-10 business days of approval.</p>

                <h3>8. Warranties and Disclaimers</h3>
                <h4>Product Warranties</h4>
                <p>Products are covered by manufacturer warranties as described in our <a href="#warranty">Warranty Policy</a>.</p>

                <h4>Disclaimer of Warranties</h4>
                <p>TO THE EXTENT PERMITTED BY LAW, THIS WEBSITE AND PRODUCTS ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>

                <h3>9. Limitation of Liability</h3>
                <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, FORDIPS TECH LLC SHALL NOT BE LIABLE FOR:</p>
                <ul>
                    <li>Indirect, incidental, or consequential damages</li>
                    <li>Loss of profits, data, or business</li>
                    <li>Damages exceeding the purchase price of the product</li>
                </ul>

                <h3>10. Intellectual Property</h3>
                <p>All content on this Website, including text, graphics, logos, images, and software, is owned by Fordips Tech LLC or licensed to us and protected by copyright and trademark laws.</p>
                <p>You may not:</p>
                <ul>
                    <li>Reproduce, distribute, or create derivative works</li>
                    <li>Use our trademarks without permission</li>
                    <li>Remove copyright or proprietary notices</li>
                </ul>

                <h3>11. User Accounts</h3>
                <p>If you create an account:</p>
                <ul>
                    <li>You must provide accurate information</li>
                    <li>You are responsible for maintaining password security</li>
                    <li>You are liable for all activities under your account</li>
                    <li>We may suspend or terminate accounts for violations</li>
                </ul>

                <h3>12. Third-Party Services</h3>
                <p>We use third-party services (payment processors, shipping carriers, etc.). We are not responsible for their actions or policies.</p>

                <h3>13. Indemnification</h3>
                <p>You agree to indemnify and hold Fordips Tech LLC harmless from any claims, losses, or damages arising from your use of the Website or violation of these Terms.</p>

                <h3>14. Dispute Resolution</h3>
                <h4>Governing Law</h4>
                <p>These Terms are governed by the laws of the State of Maryland, United States.</p>

                <h4>Arbitration</h4>
                <p>Any disputes shall be resolved through binding arbitration in Maryland, except for:</p>
                <ul>
                    <li>Claims under $500</li>
                    <li>Intellectual property disputes</li>
                    <li>Injunctive relief</li>
                </ul>

                <h4>Class Action Waiver</h4>
                <p>You waive the right to participate in class action lawsuits or class-wide arbitration.</p>

                <h3>15. Changes to Terms</h3>
                <p>We may modify these Terms at any time. Continued use of the Website constitutes acceptance of modified Terms.</p>

                <h3>16. Termination</h3>
                <p>We reserve the right to terminate your access to the Website for violations of these Terms.</p>

                <h3>17. Severability</h3>
                <p>If any provision of these Terms is found invalid, the remaining provisions shall remain in effect.</p>

                <h3>18. Entire Agreement</h3>
                <p>These Terms constitute the entire agreement between you and Fordips Tech LLC regarding use of the Website.</p>

                <h3>19. Contact Information</h3>
                <div class="contact-info-box">
                    <p>For questions about these Terms:<br>
                    <strong>Email:</strong> legal@fordipstech.com<br>
                    <strong>Phone:</strong> (667) 256-3680<br>
                    <strong>Mail:</strong> Fordips Tech LLC, Legal Department<br>
                    15706 Dorset Rd, Laurel, MD 20707, United States</p>
                </div>

                <p><em>By using this Website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</em></p>
            </div>
        `
    }
};

// Modal Functions
function openSupportModal(type) {
    const modal = document.getElementById('supportModal');
    const content = document.getElementById('supportContent');

    if (!modal || !content) return;

    if (type === 'faq') {
        content.innerHTML = generateFAQHTML();
    } else if (supportContent[type]) {
        content.innerHTML = `
            <h2>${supportContent[type].title}</h2>
            ${supportContent[type].content}
        `;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSupportModal() {
    const modal = document.getElementById('supportModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function openLegalModal(type) {
    const modal = document.getElementById('legalModal');
    const content = document.getElementById('legalContent');

    if (!modal || !content) return;

    if (supportContent[type]) {
        content.innerHTML = `
            <h2>${supportContent[type].title}</h2>
            ${supportContent[type].content}
        `;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLegalModal() {
    const modal = document.getElementById('legalModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function generateFAQHTML() {
    const faq = supportContent.faq;
    let html = `<h2>${faq.title}</h2>`;

    faq.sections.forEach(section => {
        html += `
            <div class="faq-section">
                <h3>${section.category}</h3>
                <div class="faq-questions">
        `;

        section.questions.forEach((item, index) => {
            html += `
                <div class="faq-item">
                    <div class="faq-question" onclick="toggleFAQ(this)">
                        <h4>${item.q}</h4>
                        <span class="faq-toggle">+</span>
                    </div>
                    <div class="faq-answer">
                        <p>${item.a}</p>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    return html;
}

function toggleFAQ(element) {
    const item = element.parentElement;
    const isActive = item.classList.contains('active');

    // Close all FAQs
    document.querySelectorAll('.faq-item').forEach(faq => {
        faq.classList.remove('active');
        faq.querySelector('.faq-toggle').textContent = '+';
    });

    // Open clicked FAQ if it wasn't active
    if (!isActive) {
        item.classList.add('active');
        element.querySelector('.faq-toggle').textContent = '−';
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Attach support modal links
    const supportLinks = {
        'faq': document.querySelector('a[href="#faq"]'),
        'shipping': document.querySelector('a[href="#shipping"]'),
        'warranty': document.querySelector('a[href="#warranty"]'),
        'support': document.querySelector('a[href="#support"]')
    };

    Object.entries(supportLinks).forEach(([type, link]) => {
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openSupportModal(type === 'support' ? 'faq' : type);
            });
        }
    });

    // Attach legal modal links
    const legalLinks = {
        'privacy': document.querySelector('a[href="#privacy"]'),
        'terms': document.querySelector('a[href="#terms"]')
    };

    Object.entries(legalLinks).forEach(([type, link]) => {
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openLegalModal(type);
            });
        }
    });
});
