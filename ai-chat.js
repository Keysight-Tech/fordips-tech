/**
 * FORDIPS TECH - AI Chat Assistant
 * Intelligent shopping assistant powered by AI
 */

class FordipsTechAI {
    constructor() {
        this.conversationHistory = [];
        this.isOpen = false;
        this.isTyping = false;
        this.userContext = {
            cart: [],
            viewedProducts: [],
            preferences: {}
        };

        // Initialize on page load
        this.init();
    }

    init() {
        this.createChatUI();
        this.attachEventListeners();
        this.loadConversationHistory();

        // Show welcome message after a short delay
        setTimeout(() => {
            this.showWelcomeMessage();
        }, 3000);

        window.FORDIPS_CONFIG?.logger.log('✅ AI Chat Assistant initialized');
    }

    createChatUI() {
        const chatHTML = `
            <!-- AI Chat Widget -->
            <div class="ai-chat-widget" id="aiChatWidget">
                <!-- Chat Button -->
                <button class="ai-chat-button" id="aiChatButton" aria-label="Open AI assistant">
                    <svg class="chat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <svg class="close-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <div class="chat-badge" id="chatBadge">1</div>
                </button>

                <!-- Chat Window -->
                <div class="ai-chat-window" id="aiChatWindow">
                    <!-- Header -->
                    <div class="chat-header">
                        <div class="chat-header-info">
                            <div class="chat-avatar">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path d="M12 1v6m0 6v6m-6-6h6m6 0h6"></path>
                                </svg>
                            </div>
                            <div>
                                <div class="chat-title">Fordips AI Assistant</div>
                                <div class="chat-status">
                                    <span class="status-dot"></span>
                                    <span>Online - Ready to help!</span>
                                </div>
                            </div>
                        </div>
                        <button class="chat-minimize" id="chatMinimize" aria-label="Minimize chat">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>

                    <!-- Messages Container -->
                    <div class="chat-messages" id="chatMessages">
                        <!-- Messages will be inserted here -->
                    </div>

                    <!-- Quick Actions -->
                    <div class="chat-quick-actions" id="chatQuickActions">
                        <button class="quick-action-btn" data-action="browse-products">
                            🛍️ Browse Products
                        </button>
                        <button class="quick-action-btn" data-action="best-deals">
                            💰 Best Deals
                        </button>
                        <button class="quick-action-btn" data-action="track-order">
                            📦 Track Order
                        </button>
                        <button class="quick-action-btn" data-action="help">
                            ❓ Get Help
                        </button>
                    </div>

                    <!-- Input Area -->
                    <div class="chat-input-area">
                        <div class="chat-input-wrapper">
                            <input
                                type="text"
                                class="chat-input"
                                id="chatInput"
                                placeholder="Ask me anything about our products..."
                                autocomplete="off"
                            />
                            <button class="chat-send-btn" id="chatSendBtn" aria-label="Send message">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                        <div class="chat-suggestions" id="chatSuggestions"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    attachEventListeners() {
        const chatButton = document.getElementById('aiChatButton');
        const chatMinimize = document.getElementById('chatMinimize');
        const chatInput = document.getElementById('chatInput');
        const chatSendBtn = document.getElementById('chatSendBtn');

        chatButton?.addEventListener('click', () => this.toggleChat());
        chatMinimize?.addEventListener('click', () => this.toggleChat());
        chatSendBtn?.addEventListener('click', () => this.sendMessage());
        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('aiChatWindow');
        const chatButton = document.getElementById('aiChatButton');
        const chatBadge = document.getElementById('chatBadge');

        if (this.isOpen) {
            chatWindow.classList.add('active');
            chatButton.classList.add('active');
            chatBadge.style.display = 'none';
            document.getElementById('chatInput')?.focus();
        } else {
            chatWindow.classList.remove('active');
            chatButton.classList.remove('active');
        }
    }

    showWelcomeMessage() {
        if (this.conversationHistory.length === 0) {
            const welcomeMessage = {
                role: 'assistant',
                content: `👋 Hi! I'm your Fordips Tech AI assistant. I can help you:

• Find the perfect product
• Answer questions about our electronics
• Add items to your cart
• Track your orders
• Get the best deals

What are you looking for today?`,
                timestamp: new Date()
            };

            this.addMessage(welcomeMessage);
            this.showChatBadge();
        }
    }

    showChatBadge() {
        const chatBadge = document.getElementById('chatBadge');
        if (chatBadge && !this.isOpen) {
            chatBadge.style.display = 'flex';
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        this.addMessage({
            role: 'user',
            content: message,
            timestamp: new Date()
        });

        input.value = '';
        this.showTypingIndicator();

        // Process message and get AI response
        const response = await this.processMessage(message);

        this.hideTypingIndicator();
        this.addMessage({
            role: 'assistant',
            content: response.message,
            actions: response.actions,
            timestamp: new Date()
        });

        // Execute any actions
        if (response.executeAction) {
            await this.executeAction(response.executeAction);
        }

        this.saveConversationHistory();
    }

    async processMessage(message) {
        const lowerMessage = message.toLowerCase();

        // Update user context
        this.updateUserContext(message);

        // Intent recognition
        if (this.matchesIntent(lowerMessage, ['hello', 'hi', 'hey', 'greetings'])) {
            return {
                message: "Hello! 👋 How can I help you find the perfect electronics today?",
                actions: this.getSuggestedActions(['browse', 'deals', 'help'])
            };
        }

        if (this.matchesIntent(lowerMessage, ['iphone', 'iphones', 'apple phone'])) {
            return await this.handleProductSearch('iphone');
        }

        if (this.matchesIntent(lowerMessage, ['samsung', 'galaxy'])) {
            return await this.handleProductSearch('samsung');
        }

        if (this.matchesIntent(lowerMessage, ['macbook', 'laptop', 'mac'])) {
            return await this.handleProductSearch('laptop');
        }

        if (this.matchesIntent(lowerMessage, ['tablet', 'ipad'])) {
            return await this.handleProductSearch('tablet');
        }

        if (this.matchesIntent(lowerMessage, ['watch', 'smartwatch', 'apple watch'])) {
            return await this.handleProductSearch('smartwatch');
        }

        if (this.matchesIntent(lowerMessage, ['starlink', 'internet', 'satellite'])) {
            return await this.handleProductSearch('starlink');
        }

        if (this.matchesIntent(lowerMessage, ['cheap', 'affordable', 'budget', 'best price'])) {
            return await this.handleBudgetSearch();
        }

        if (this.matchesIntent(lowerMessage, ['best', 'recommend', 'popular', 'top'])) {
            return await this.handleRecommendations();
        }

        if (this.matchesIntent(lowerMessage, ['cart', 'basket', 'checkout'])) {
            return this.handleCartInquiry();
        }

        if (this.matchesIntent(lowerMessage, ['order', 'track', 'tracking', 'delivery'])) {
            return this.handleOrderTracking();
        }

        if (this.matchesIntent(lowerMessage, ['add to cart', 'buy', 'purchase'])) {
            return this.handleAddToCart(message);
        }

        if (this.matchesIntent(lowerMessage, ['price', 'cost', 'how much'])) {
            return await this.handlePriceInquiry(message);
        }

        if (this.matchesIntent(lowerMessage, ['shipping', 'delivery', 'ship'])) {
            return this.handleShippingInquiry();
        }

        if (this.matchesIntent(lowerMessage, ['payment', 'pay', 'credit card'])) {
            return this.handlePaymentInquiry();
        }

        if (this.matchesIntent(lowerMessage, ['location', 'store', 'where'])) {
            return this.handleLocationInquiry();
        }

        if (this.matchesIntent(lowerMessage, ['contact', 'support', 'help'])) {
            return this.handleContactInquiry();
        }

        // Default response - try to extract product search
        const productMatch = this.extractProductFromMessage(message);
        if (productMatch) {
            return await this.handleProductSearch(productMatch);
        }

        // Fallback response
        return {
            message: `I understand you're asking about "${message}". Let me help you!

I can assist with:
• Finding products (iPhones, Samsung, MacBooks, etc.)
• Price comparisons
• Adding items to cart
• Order tracking
• Shipping information

What would you like to know more about?`,
            actions: this.getSuggestedActions(['browse', 'deals', 'contact'])
        };
    }

    matchesIntent(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }

    extractProductFromMessage(message) {
        const products = ['iphone', 'samsung', 'macbook', 'laptop', 'tablet', 'ipad', 'watch', 'starlink'];
        for (const product of products) {
            if (message.toLowerCase().includes(product)) {
                return product;
            }
        }
        return null;
    }

    async handleProductSearch(category) {
        // Map search terms to actual categories
        const categoryMap = {
            'iphone': 'iphone',
            'samsung': 'samsung',
            'macbook': 'laptop',
            'laptop': 'laptop',
            'mac': 'laptop',
            'tablet': 'tablet',
            'ipad': 'tablet',
            'watch': 'smartwatch',
            'smartwatch': 'smartwatch',
            'starlink': 'starlink'
        };

        const actualCategory = categoryMap[category] || category;

        // Get products from the global products array
        const categoryProducts = window.products ?
            window.products.filter(p => p.category === actualCategory) : [];

        if (categoryProducts.length === 0) {
            return {
                message: `I couldn't find any ${category} products right now. Would you like to browse other categories?`,
                actions: this.getSuggestedActions(['browse', 'deals'])
            };
        }

        // Get top 3 products
        const topProducts = categoryProducts.slice(0, 3);

        let message = `Great choice! Here are our top ${category} options:\n\n`;

        topProducts.forEach((product, index) => {
            message += `${index + 1}. **${product.name}** - $${product.price}\n`;
            message += `   ${product.description}\n`;
            if (product.badge) message += `   🏷️ ${product.badge}\n`;
            message += `\n`;
        });

        message += `\nWould you like me to add any of these to your cart? Just say "add [product name] to cart"`;

        return {
            message,
            actions: [
                { label: '🛍️ View All ' + category.toUpperCase(), action: 'view-category', data: actualCategory },
                { label: '➕ Add to Cart', action: 'show-add-options', data: topProducts },
                { label: '💰 Compare Prices', action: 'compare', data: topProducts }
            ],
            executeAction: { type: 'scroll-to-category', category: actualCategory }
        };
    }

    async handleBudgetSearch() {
        const affordableProducts = window.products ?
            window.products.filter(p => p.price < 500).sort((a, b) => a.price - b.price).slice(0, 5) : [];

        if (affordableProducts.length === 0) {
            return {
                message: "Let me show you our best value products!",
                actions: this.getSuggestedActions(['browse', 'deals'])
            };
        }

        let message = `Here are our most affordable options:\n\n`;

        affordableProducts.forEach((product, index) => {
            message += `${index + 1}. ${product.name} - $${product.price}\n`;
        });

        message += `\nAll under $500! Which one interests you?`;

        return {
            message,
            actions: affordableProducts.slice(0, 3).map(p => ({
                label: `➕ Add ${p.name}`,
                action: 'add-to-cart',
                data: p
            }))
        };
    }

    async handleRecommendations() {
        const popularProducts = window.products ?
            window.products.filter(p => p.badge === 'POPULAR' || p.badge === 'NEW').slice(0, 3) : [];

        let message = `🌟 Here are our most popular products:\n\n`;

        if (popularProducts.length > 0) {
            popularProducts.forEach((product, index) => {
                message += `${index + 1}. ${product.name} - $${product.price}\n`;
                message += `   ${product.description}\n\n`;
            });
        } else {
            message = "Let me show you our best sellers!";
        }

        return {
            message,
            actions: this.getSuggestedActions(['browse', 'iphone', 'samsung'])
        };
    }

    handleCartInquiry() {
        const cart = JSON.parse(localStorage.getItem('fordipsTechCart')) || [];

        if (cart.length === 0) {
            return {
                message: "Your cart is currently empty. Let me help you find something great! What are you looking for?",
                actions: this.getSuggestedActions(['browse', 'deals', 'recommendations'])
            };
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let message = `🛒 Your cart has ${cart.length} item(s):\n\n`;

        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
        });

        message += `\n**Total: $${total.toFixed(2)}**\n\n`;
        message += `Ready to checkout?`;

        return {
            message,
            actions: [
                { label: '💳 Checkout Now', action: 'checkout' },
                { label: '🛍️ Continue Shopping', action: 'browse' },
                { label: '🗑️ Clear Cart', action: 'clear-cart' }
            ],
            executeAction: { type: 'show-cart' }
        };
    }

    handleOrderTracking() {
        return {
            message: `To track your order, I'll need your order number.

You can find it in:
• Your confirmation email
• Your account orders section

Please enter your order number (format: FT123456789) and I'll look it up for you!`,
            actions: [
                { label: '📧 Check Email', action: 'help' },
                { label: '👤 View My Orders', action: 'my-orders' }
            ]
        };
    }

    handleAddToCart(message) {
        // Try to extract product name from message
        const productName = this.extractProductNameFromMessage(message);

        if (!productName) {
            return {
                message: "Which product would you like to add to your cart? Please tell me the specific product name or browse our catalog.",
                actions: this.getSuggestedActions(['browse', 'iphone', 'samsung'])
            };
        }

        // Find product
        const product = window.products?.find(p =>
            p.name.toLowerCase().includes(productName.toLowerCase())
        );

        if (!product) {
            return {
                message: `I couldn't find "${productName}". Let me show you our available products!`,
                actions: this.getSuggestedActions(['browse', 'search'])
            };
        }

        return {
            message: `Great! I'll add **${product.name}** ($${product.price}) to your cart.`,
            executeAction: { type: 'add-to-cart', product }
        };
    }

    extractProductNameFromMessage(message) {
        // Simple extraction - can be enhanced
        const words = message.toLowerCase().split(' ');
        const productKeywords = ['iphone', 'samsung', 'macbook', 'ipad', 'watch', 'starlink'];

        for (const keyword of productKeywords) {
            if (words.includes(keyword)) {
                return keyword;
            }
        }

        return null;
    }

    async handlePriceInquiry(message) {
        const productName = this.extractProductNameFromMessage(message);

        if (!productName) {
            return {
                message: "Which product's price would you like to know? Please specify the product name.",
                actions: this.getSuggestedActions(['browse', 'iphone', 'samsung'])
            };
        }

        const product = window.products?.find(p =>
            p.name.toLowerCase().includes(productName.toLowerCase())
        );

        if (product) {
            return {
                message: `The **${product.name}** is priced at **$${product.price}**.\n\n${product.description}\n\nWould you like to add it to your cart?`,
                actions: [
                    { label: `➕ Add to Cart`, action: 'add-to-cart', data: product },
                    { label: '🔍 See Similar', action: 'similar', data: product.category }
                ]
            };
        }

        return {
            message: "I can help you find pricing information. Which product are you interested in?",
            actions: this.getSuggestedActions(['browse', 'deals'])
        };
    }

    handleShippingInquiry() {
        return {
            message: `📦 **Shipping Information:**

✅ **FREE WORLDWIDE SHIPPING** on all orders!

🚚 **Delivery Times:**
• USA: 3-5 business days
• Cameroon: 5-7 business days
• Other countries: 7-14 business days

📍 **We ship to:** USA, Cameroon, Nigeria, Ghana, and worldwide!

💳 All orders are tracked and insured.

Would you like to place an order?`,
            actions: [
                { label: '🛍️ Browse Products', action: 'browse' },
                { label: '📍 Our Locations', action: 'locations' }
            ]
        };
    }

    handlePaymentInquiry() {
        return {
            message: `💳 **Payment Methods We Accept:**

💵 Credit/Debit Cards (Visa, Mastercard, Amex)
📱 MTN Mobile Money
📱 Orange Money
💸 Zelle
💰 Cash App
🔵 PayPal

🔒 All payments are secure and encrypted.
✅ No hidden fees - what you see is what you pay!

Ready to checkout?`,
            actions: [
                { label: '💳 Checkout', action: 'checkout' },
                { label: '🛍️ Continue Shopping', action: 'browse' }
            ]
        };
    }

    handleLocationInquiry() {
        return {
            message: `📍 **Our Locations:**

**🇺🇸 USA (Headquarters):**
15706 Dorset Rd
Laurel, MD 20707
📞 (667) 256-3680

**🇨🇲 Cameroon:**
Mountain Plaza, Molyko
Buea, South West Region
📞 +237 678 123 456

🌐 **Online Store:** Open 24/7
📧 Email: support@fordipstech.com

We offer FREE worldwide shipping! 🚚`,
            actions: [
                { label: '🛍️ Shop Now', action: 'browse' },
                { label: '📞 Contact Us', action: 'contact' }
            ],
            executeAction: { type: 'scroll-to-section', section: 'locations' }
        };
    }

    handleContactInquiry() {
        return {
            message: `📞 **Contact Fordips Tech:**

**Phone:**
• USA: (667) 256-3680
• Cameroon: +237 678 123 456

**Email:**
• support@fordipstech.com

**Social Media:**
• Facebook: Fordips Tech
• TikTok: @fordipstechllc
• YouTube: @alsinna

**Business Hours:**
• 24/7 Online Store
• Support: Mon-Sat, 9AM-6PM EST

How else can I help you today?`,
            actions: [
                { label: '📧 Send Message', action: 'contact-form' },
                { label: '🛍️ Browse Products', action: 'browse' }
            ],
            executeAction: { type: 'scroll-to-section', section: 'contact' }
        };
    }

    handleQuickAction(action) {
        const actionMap = {
            'browse-products': () => this.executeAction({ type: 'scroll-to-section', section: 'products' }),
            'best-deals': () => this.handleBudgetSearch().then(r => this.addMessage({ role: 'assistant', content: r.message, actions: r.actions, timestamp: new Date() })),
            'track-order': () => this.handleOrderTracking().then(r => this.addMessage({ role: 'assistant', content: r.message, actions: r.actions, timestamp: new Date() })),
            'help': () => this.handleContactInquiry().then(r => this.addMessage({ role: 'assistant', content: r.message, actions: r.actions, timestamp: new Date() }))
        };

        const handler = actionMap[action];
        if (handler) handler();
    }

    async executeAction(action) {
        switch (action.type) {
            case 'scroll-to-section':
                const section = document.getElementById(action.section);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
                break;

            case 'scroll-to-category':
                // Click the category filter button
                const filterBtn = document.querySelector(`[data-filter="${action.category}"]`);
                if (filterBtn) {
                    setTimeout(() => {
                        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                        setTimeout(() => filterBtn.click(), 500);
                    }, 300);
                }
                break;

            case 'add-to-cart':
                if (action.product && typeof addToCart === 'function') {
                    addToCart(action.product.id, action.product.name, action.product.price, action.product.image);
                    this.addMessage({
                        role: 'assistant',
                        content: `✅ Added **${action.product.name}** to your cart! Anything else you'd like?`,
                        timestamp: new Date()
                    });
                }
                break;

            case 'show-cart':
                const cartButton = document.getElementById('cartButton');
                if (cartButton) cartButton.click();
                break;

            case 'checkout':
                if (typeof openCheckoutModal === 'function') {
                    openCheckoutModal();
                }
                break;

            default:
                window.FORDIPS_CONFIG?.logger.log('Unknown action:', action);
        }
    }

    getSuggestedActions(types) {
        const actionTemplates = {
            'browse': { label: '🛍️ Browse All Products', action: 'browse' },
            'deals': { label: '💰 Show Best Deals', action: 'deals' },
            'iphone': { label: '📱 Show iPhones', action: 'search', data: 'iphone' },
            'samsung': { label: '📱 Show Samsung', action: 'search', data: 'samsung' },
            'contact': { label: '📞 Contact Us', action: 'contact' },
            'help': { label: '❓ Get Help', action: 'help' },
            'recommendations': { label: '⭐ Top Picks', action: 'recommendations' },
            'search': { label: '🔍 Search Products', action: 'search' },
            'locations': { label: '📍 Our Locations', action: 'locations' }
        };

        return types.map(type => actionTemplates[type]).filter(Boolean);
    }

    addMessage(message) {
        this.conversationHistory.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${message.role}`;

        const content = message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

        messageEl.innerHTML = `
            <div class="message-bubble">
                ${content}
                ${message.actions ? this.renderActions(message.actions) : ''}
            </div>
            <div class="message-time">${this.formatTime(message.timestamp)}</div>
        `;

        messagesContainer.appendChild(messageEl);

        // Attach action button listeners
        if (message.actions) {
            messageEl.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const actionData = JSON.parse(btn.dataset.action);
                    this.executeAction(actionData);
                });
            });
        }
    }

    renderActions(actions) {
        if (!actions || actions.length === 0) return '';

        return `
            <div class="message-actions">
                ${actions.map(action => `
                    <button class="action-btn" data-action='${JSON.stringify(action)}'>
                        ${action.label}
                    </button>
                `).join('')}
            </div>
        `;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const typingEl = document.createElement('div');
        typingEl.className = 'chat-message assistant typing-indicator';
        typingEl.id = 'typingIndicator';
        typingEl.innerHTML = `
            <div class="message-bubble">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingEl);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }

    formatTime(date) {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    updateUserContext(message) {
        // Track user interests
        const categories = ['iphone', 'samsung', 'laptop', 'tablet', 'watch'];
        categories.forEach(cat => {
            if (message.toLowerCase().includes(cat)) {
                this.userContext.preferences[cat] = (this.userContext.preferences[cat] || 0) + 1;
            }
        });

        // Update cart context
        this.userContext.cart = JSON.parse(localStorage.getItem('fordipsTechCart')) || [];
    }

    saveConversationHistory() {
        try {
            FordipsUtils.storage.set('aiChatHistory', this.conversationHistory);
        } catch (e) {
            window.FORDIPS_CONFIG?.logger.error('Error saving chat history:', e);
        }
    }

    loadConversationHistory() {
        try {
            const history = FordipsUtils.storage.get('aiChatHistory', []);
            // Only load recent history (last 10 messages)
            this.conversationHistory = history.slice(-10);

            // Render loaded messages
            this.conversationHistory.forEach(msg => this.renderMessage(msg));
        } catch (e) {
            window.FORDIPS_CONFIG?.logger.error('Error loading chat history:', e);
        }
    }
}

// Initialize AI Chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for utils and config to load
    setTimeout(() => {
        window.fordipsAI = new FordipsTechAI();
    }, 500);
});

window.FORDIPS_CONFIG?.logger.log('✅ AI Chat module loaded');
